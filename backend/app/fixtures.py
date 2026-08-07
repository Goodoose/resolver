"""The demo project: BMW dealer portal.

Stand-in for one completed project's read-only exports (Module 05). Every
record here is the bottom of a trace - the teardown below cites into this list
and nothing else, and `validate_source_refs` enforces that at import time.

Replacing this module with real ingested exports is the whole swap. Nothing
downstream knows where the records came from.
"""

from typing import Dict, List

from app.models import (
    Answer,
    BaselineClaim,
    Benchmark,
    Claim,
    DigStep,
    Finding,
    NextMove,
    ProjectMeta,
    SourceLine,
    SourceRecord,
    Teardown,
    validate_source_refs,
)

SOURCES: List[SourceRecord] = [
    SourceRecord(
        id="A1",
        kind="chat",
        label="slack · #bmw-portal · wk6",
        week=6,
        lines=[
            SourceLine(
                who="@dmytro",
                text=(
                    "heads up, portal license still isn't through, procurement "
                    'said "should be fine" but nothing in writing yet'
                ),
            ),
            SourceLine(who="@olena", text="ok noted, will confirm ✌"),
        ],
        silence_note="no follow-up message in this thread",
    ),
    SourceRecord(
        id="A2",
        kind="doc",
        label="status report · project status · wk9",
        week=9,
        lines=[
            SourceLine(
                text=(
                    "Portal integration: on track. License: pending confirmation "
                    "from procurement."
                )
            )
        ],
    ),
    SourceRecord(
        id="A3",
        kind="doc",
        label="sync notes · weekly sync · wk7",
        week=7,
        lines=[
            SourceLine(
                text=(
                    "Action item: confirm BMW portal license status. "
                    "Owner: procurement (unconfirmed)."
                )
            )
        ],
    ),
    SourceRecord(
        id="B1",
        kind="doc",
        label="status report · project status · wk11",
        week=11,
        lines=[SourceLine(text="Delivery: 80% complete.")],
    ),
    SourceRecord(
        id="B2",
        kind="ticket",
        label="jira export · DELIVERY-142 · wk11",
        week=11,
        lines=[SourceLine(text="DELIVERY-142 — Status: Done. QA: not yet run.")],
    ),
    SourceRecord(
        id="B3",
        kind="chat",
        label="QA thread · integration QA · wk12",
        week=12,
        lines=[
            SourceLine(
                text="Integration failing intermittently; flagged after sign-off."
            )
        ],
    ),
    SourceRecord(
        id="C1",
        kind="mail",
        label="email · client-BMW · wk13",
        week=13,
        lines=[
            SourceLine(
                who="BMW",
                text='Still reviewing internally, will confirm sign-off soon.',
            )
        ],
    ),
    SourceRecord(
        id="C2",
        kind="doc",
        label="standup notes · daily standup · wk13–14",
        week=13,
        lines=[SourceLine(text="No mention of client sign-off status for 9 days.")],
        silence_note="9 consecutive standups with no mention of the stalled sign-off",
    ),
    SourceRecord(
        id="D1",
        kind="doc",
        label="ops handbook · request queues · wk1",
        week=1,
        lines=[
            SourceLine(
                text=(
                    "Third-party licence requests are raised and tracked by "
                    "procurement. Queue owner: Marta."
                )
            )
        ],
    ),
]

DIG_STEPS: List[DigStep] = [
    DigStep(
        label="Scanning status reports & meeting notes…",
        detail="9 status reports, 12 meeting notes",
    ),
    DigStep(
        label="Cross-referencing against known blockers…",
        detail="214 messages across 4 channels",
    ),
    DigStep(label="Comparing AM vs PM reporting…", detail="week 6 → week 14"),
    DigStep(label="Flagging the contradiction…", detail="week 9 status vs week 6 chat"),
]

TEARDOWN = Teardown(
    project=ProjectMeta(
        name="BMW dealer portal",
        message_count=214,
        status_report_count=9,
        meeting_note_count=12,
    ),
    summary=Claim(
        text=(
            "The BMW dealer portal delivery broke down in three places, not one. "
            "The root cause traces back to a licensing blocker that surfaced early "
            "and was quietly assumed resolved — everything downstream (status "
            "reporting, QA sign-off, client review) inherited that false confidence."
        ),
        source_ids=["A1", "A2", "B1", "C2"],
    ),
    findings=[
        Finding(
            id="A",
            tag="signal never landed",
            window="week 6 → week 9",
            statement=Claim(
                text=(
                    "A licensing blocker was known to the team but never reached "
                    "the delivery lead."
                ),
                source_ids=["A1", "A2", "A3"],
            ),
            real_cause=Claim(
                text=(
                    'Not "didn\'t have time" — the owner assumed procurement had it '
                    "handled after a hallway conversation that was never confirmed."
                ),
                source_ids=["A1", "A3"],
            ),
        ),
        Finding(
            id="B",
            tag="status ≠ reality",
            window="week 11",
            statement=Claim(
                text="Reported 80% complete; actual scope was closer to 55%.",
                source_ids=["B1", "B2"],
            ),
            real_cause=Claim(
                text='An untested integration was counted as "done" before QA.',
                source_ids=["B2", "B3"],
            ),
        ),
        Finding(
            id="C",
            tag="silent stall",
            window="week 13",
            statement=Claim(
                text="Client sign-off stalled 9 days with no flag raised internally.",
                source_ids=["C1", "C2"],
            ),
            real_cause=Claim(
                text=(
                    "Everyone assumed the AM was chasing it; the AM assumed the PM "
                    "owned it."
                ),
                source_ids=["C2"],
            ),
        ),
    ],
    next_move=NextMove(
        gap=Claim(
            text="The licensing blocker was never formally resolved.",
            source_ids=["A1", "A3"],
        ),
        question=(
            "Was the BMW portal license ever formally requested, and on what date?"
        ),
        person="Marta",
        person_role="procurement lead",
        why_them=Claim(
            text=(
                "She owns the licence request queue, and she is the one person "
                "named in the week-6 thread who never confirmed back."
            ),
            source_ids=["D1", "A1", "A3"],
        ),
    ),
    unsourced_gaps=[
        (
            "Why the client delayed the week-13 review isn't in the chat, reports, "
            "or notes I was given — so I'm not guessing at it."
        )
    ],
    dig_steps=DIG_STEPS,
)

# Interrogation (Flow B). Keyword-matched canned answers stand in for the live
# drill. The shape is what matters and it is the real shape: every hit cites
# records from SOURCES, and anything off-script falls through to the decline
# below rather than being improvised.
_ANSWERS: List[Dict] = [
    {
        "keywords": ["licen", "blocker", "procurement", "marta"],
        "answer": Answer(
            question="",
            sourced=True,
            text=(
                "The licence was raised in week 6 and never closed. Dmytro flagged "
                "it in #bmw-portal saying procurement had only given a verbal "
                '"should be fine"; Olena said she would confirm and never posted '
                "again in that thread. The week-7 sync recorded it as an action "
                "item with procurement as an unconfirmed owner, and the week-9 "
                'status still had it as "pending confirmation" while reporting the '
                "integration on track."
            ),
            source_ids=["A1", "A3", "A2"],
        ),
    },
    {
        "keywords": ["80", "percent", "%", "complete", "scope", "progress"],
        "answer": Answer(
            question="",
            sourced=True,
            text=(
                "The week-11 status reported 80% complete. The Jira export for the "
                "same week shows DELIVERY-142 marked Done with QA not yet run, and "
                "the QA thread a week later found the integration failing "
                "intermittently — so the reported figure counted untested work as "
                "finished."
            ),
            source_ids=["B1", "B2", "B3"],
        ),
    },
    {
        "keywords": ["sign-off", "signoff", "stall", "client", "review", "delay"],
        "answer": Answer(
            question="",
            sourced=True,
            text=(
                "The client said they were still reviewing internally in week 13 and "
                "would confirm sign-off soon. Internally it went quiet: the standup "
                "notes for weeks 13–14 contain no mention of sign-off status for 9 "
                "consecutive days."
            ),
            source_ids=["C1", "C2"],
        ),
    },
    {
        "keywords": ["warn", "deadline", "moved", "told", "escalat"],
        "answer": Answer(
            question="",
            sourced=True,
            text=(
                "Not in these records. The week-9 status report presents the "
                "integration as on track with the licence merely pending — there is "
                "no message, note, or report in the set where the delivery lead or "
                "the client is told the date is at risk."
            ),
            source_ids=["A2"],
        ),
    },
]

# The tightest criterion in the prototype (Module 03, B-1): off-script questions
# decline rather than improvise. `Answer` refuses citations on this path, so
# there is no way for a decline to quietly grow a fake source.
DECLINE = Answer(
    question="",
    sourced=False,
    text=(
        "I don't have anything in the records that answers that. It isn't in the "
        "chat, the status reports, or the meeting notes I was given, so I won't "
        "guess at it."
    ),
    source_ids=[],
)


def answer_for(question: str) -> Answer:
    """Match a reader's question to a sourced answer, or decline honestly."""
    q = question.lower()
    for entry in _ANSWERS:
        if any(k in q for k in entry["keywords"]):
            return entry["answer"].model_copy(update={"question": question})
    return DECLINE.model_copy(update={"question": question})


BENCHMARK = Benchmark(
    baseline_name="Off-the-shelf chat assistant, full export pasted in",
    baseline_prompt=(
        "Here are all the exports for the BMW dealer portal project. "
        "What went wrong?"
    ),
    baseline_claims=[
        BaselineClaim(
            text="The project slipped because the team was under-resourced in Q3.",
            defect="unsourced",
            note=(
                "Nothing in the 214 messages, 9 reports, or 12 notes mentions "
                "resourcing. Plausible, confident, and absent from the record."
            ),
        ),
        BaselineClaim(
            text="A licensing issue delayed the portal integration.",
            defect=None,
            note=(
                "Correct, and the baseline found it. Worth saying plainly — the "
                "benchmark is only worth running if it can be right."
            ),
        ),
        BaselineClaim(
            text=(
                "The team communicated blockers promptly and escalated the licence "
                "issue to leadership."
            ),
            defect="contradiction",
            note=(
                "Contradicts its own previous claim and the record: the week-6 "
                "thread has no follow-up and week-9 status still reports on track."
            ),
        ),
        BaselineClaim(
            text="Delivery reached about 80% by week 11.",
            defect="shallow",
            note=(
                "Repeats the status report as fact. That figure is the thing being "
                "investigated, not a finding."
            ),
        ),
    ],
    verdict=(
        "Two of the baseline's four claims cannot be traced to any record, one of "
        "those contradicts another, and a third restates the reported status as "
        "though it were ground truth. It did find the licence issue."
    ),
)

# Import-time gate. A fixture that cites a record it doesn't have fails the
# process at startup rather than shipping a broken trace into the demo.
validate_source_refs(
    SOURCES,
    TEARDOWN.summary,
    TEARDOWN.next_move.gap,
    TEARDOWN.next_move.why_them,
    *[f.statement for f in TEARDOWN.findings],
    *[f.real_cause for f in TEARDOWN.findings],
)
