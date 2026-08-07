"""Domain models for the forensic teardown.

The one invariant this module exists to enforce (spec Module 05, behavior 5 /
Module 06, A1): **nothing is asserted that can't be traced to a source.**

That is enforced structurally here rather than asked for in a prompt. Every
assertion the API can emit is a `Claim`, and a `Claim` cannot be constructed
without at least one source id. `validate_source_refs` then checks those ids
against the record set actually ingested, so a claim citing a source that
doesn't exist fails just as hard as one citing nothing.

Whatever produces the teardown later - a model, a pipeline, a human - has to
come through these types, so "asked nicely for citations" is not a failure mode
that is available to it.
"""

from typing import List, Literal, Optional

from pydantic import BaseModel, Field, model_validator

SourceKind = Literal["chat", "doc", "ticket", "mail"]


class SourceLine(BaseModel):
    """One line of evidence inside a source record."""

    who: Optional[str] = None
    text: str


class SourceRecord(BaseModel):
    """A verbatim record from the project's exports. The bottom of every trace."""

    id: str
    kind: SourceKind
    label: str
    week: Optional[int] = None
    lines: List[SourceLine]
    # The absence of a reply is itself evidence - a raised blocker with no
    # follow-up is the shape of a signal that never landed.
    silence_note: Optional[str] = None


class Claim(BaseModel):
    """An assertion plus the records it rests on. Cannot exist without them."""

    text: str
    source_ids: List[str] = Field(..., min_length=1)


class Finding(BaseModel):
    """One breakdown point: a signal that existed but didn't reach who needed it."""

    id: str
    tag: str
    window: str
    statement: Claim
    real_cause: Claim


class NextMove(BaseModel):
    """The drafted next step. Shown, never sent (Module 04)."""

    gap: Claim
    question: str
    person: str
    person_role: str
    # Module 03, A-4: the routing is sourced like everything else. Naming a
    # person without evidence would be the one unsourced claim in the report.
    why_them: Claim


class ProjectMeta(BaseModel):
    name: str
    message_count: int
    status_report_count: int
    meeting_note_count: int
    read_only: bool = True


class DigStep(BaseModel):
    """One visible step of the investigation (Module 02, Flow A-3)."""

    label: str
    detail: Optional[str] = None


class Teardown(BaseModel):
    project: ProjectMeta
    summary: Claim
    findings: List[Finding]
    next_move: NextMove
    # Stated openly in the report rather than omitted. An honest gap is a
    # feature; a quietly-dropped one reads as coverage the tool doesn't have.
    unsourced_gaps: List[str] = []
    dig_steps: List[DigStep] = []


class Answer(BaseModel):
    """A response to a reader's free-text question (Module 03, B-1).

    `sourced=False` is a first-class outcome, not an error state. The validator
    below makes the two cases mutually exclusive: an answer either cites, or it
    declines. There is no third shape in which it can assert something bare.
    """

    question: str
    sourced: bool
    text: str
    source_ids: List[str] = []

    @model_validator(mode="after")
    def _sourcing_is_exclusive(self) -> "Answer":
        if self.sourced and not self.source_ids:
            raise ValueError("a sourced answer must cite at least one record")
        if not self.sourced and self.source_ids:
            raise ValueError("an unsourced answer must not carry citations")
        return self


class BaselineClaim(BaseModel):
    """A claim from the off-the-shelf baseline in the head-to-head (Flow C)."""

    text: str
    # None means the baseline got this one right - the benchmark has to be able
    # to show that, or it isn't a fair test (Module 03, C-1).
    defect: Optional[Literal["unsourced", "contradiction", "shallow"]] = None
    note: Optional[str] = None


class Benchmark(BaseModel):
    baseline_name: str
    baseline_prompt: str
    baseline_claims: List[BaselineClaim]
    verdict: str


def validate_source_refs(records: List[SourceRecord], *claims: Claim) -> None:
    """Fail loudly if any claim cites a record that wasn't ingested.

    `min_length=1` on Claim.source_ids stops the empty case; this stops the
    plausible-looking-but-fake case, which is the one that actually shows up
    when a model is asked to produce citations.
    """
    known = {r.id for r in records}
    for claim in claims:
        missing = [sid for sid in claim.source_ids if sid not in known]
        if missing:
            raise ValueError(
                f"claim {claim.text[:60]!r} cites unknown source(s): {missing}"
            )
