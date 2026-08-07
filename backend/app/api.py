"""HTTP surface for the teardown prototype.

Read-only by construction: there is no route here that writes anywhere. That is
the invariant promised to the buyer (Module 03, A-1), so it is worth it being
visible in the routing table rather than only in a document.
"""

import asyncio
import json
from typing import List

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app import fixtures
from app.models import Answer, Benchmark, ProjectMeta, SourceRecord, Teardown

router = APIRouter(prefix="/api")

# Pacing for the visible dig (Module 02, Flow A-3). Slow enough to read, short
# enough that a buyer on a screen-share doesn't sit through dead air.
STEP_DELAY_SECONDS = 0.8


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.get("/project", response_model=ProjectMeta)
def project() -> ProjectMeta:
    return fixtures.TEARDOWN.project


@router.get("/sources", response_model=List[SourceRecord])
def sources() -> List[SourceRecord]:
    """The full record set. What every claim in the teardown traces down to."""
    return fixtures.SOURCES


@router.get("/teardown", response_model=Teardown)
def teardown() -> Teardown:
    return fixtures.TEARDOWN


@router.get("/teardown/stream")
async def teardown_stream() -> StreamingResponse:
    """Server-sent events: the investigation as it happens, then the result.

    The reader has to *watch it dig*, not wait on a spinner and receive a
    document (Module 07, Screen 2). Streaming the steps separately from the
    result keeps that honest — the UI cannot render the verdict early because
    it does not have it yet.
    """

    async def events():
        for index, step in enumerate(fixtures.TEARDOWN.dig_steps):
            payload = {"index": index, **step.model_dump()}
            yield f"event: step\ndata: {json.dumps(payload)}\n\n"
            await asyncio.sleep(STEP_DELAY_SECONDS)
        result = fixtures.TEARDOWN.model_dump()
        yield f"event: result\ndata: {json.dumps(result)}\n\n"

    return StreamingResponse(
        events(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            # Without this an intermediate proxy will buffer the whole stream
            # and deliver it at once, which is exactly the failure mode this
            # endpoint exists to avoid.
            "X-Accel-Buffering": "no",
        },
    )


class Question(BaseModel):
    question: str


@router.post("/interrogate", response_model=Answer)
def interrogate(body: Question) -> Answer:
    """Flow B. Answers cite, or say they can't — `Answer` allows nothing else."""
    return fixtures.answer_for(body.question)


@router.get("/benchmark", response_model=Benchmark)
def benchmark() -> Benchmark:
    return fixtures.BENCHMARK
