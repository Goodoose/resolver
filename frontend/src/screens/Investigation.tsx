import { useEffect, useRef, useState } from "react";

import { ask, type Answer, type DigStep, type SourceRecord, type Teardown } from "../api";
import { Cited } from "../components/Cited";
import { IconPerson, IconSend } from "../components/icons";

export type Phase = "idle" | "digging" | "settled" | "error";

interface Props {
  phase: Phase;
  steps: DigStep[];
  teardown: Teardown | null;
  records: Map<string, SourceRecord>;
  error: string | null;
}

/**
 * Screen 2 + Screen 3. Deliberately one screen, not two.
 *
 * Module 07 leaves that open ("whether interrogation is its own view or a
 * panel within Screen 2 is for devs/designer to decide"). Folding it in is the
 * call made here: Flow B is a *follow-up* to the teardown, and splitting it
 * would make the reader leave the findings to ask about them — losing the
 * place that Screen 2's whole traceability design is built to protect.
 */
export function Investigation({
  phase,
  steps,
  teardown,
  records,
  error,
}: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState("");
  const [qa, setQa] = useState<Answer[]>([]);
  const [asking, setAsking] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  // Keep the newest content in view as the dig advances and answers land.
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [steps.length, phase, qa.length]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const question = draft.trim();
    if (!question || asking) return;
    setDraft("");
    setAsking(true);
    try {
      const answer = await ask(question);
      setQa((prev) => [...prev, answer]);
    } catch {
      // A failed request is not a "can't source that" — conflating the two
      // would teach the reader to distrust the honest decline.
      setQa((prev) => [
        ...prev,
        {
          question,
          sourced: false,
          text: "The request failed. This is a connection problem, not an answer.",
          source_ids: [],
        },
      ]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <>
      <div className="body">
        <div className="body__inner">
          <div className="bubble-user">
            <span>
              What went wrong with the {teardown?.project.name ?? "project"}{" "}
              delivery, and where did it actually break down?
            </span>
          </div>

          {phase === "error" && (
            <div className="cant-source">
              <div className="cant-source__head">
                <i />
                <span>run failed</span>
              </div>
              <p>{error}</p>
            </div>
          )}

          {phase === "idle" && (
            <div className="dig__done">
              No run yet — start one from <strong>Load &amp; run</strong>.
            </div>
          )}

          {/* The dig, made visible. The reader watches it notice, pull, and
              follow a thread; this is the whole answer to "too passive". */}
          {steps.length > 0 && phase === "digging" && (
            <div className="dig">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="dig__step"
                  data-state={i === steps.length - 1 ? "active" : "done"}
                >
                  <span className="dig__bullet" />
                  <span>
                    {step.label}
                    {step.detail && (
                      <span className="dig__detail"> · {step.detail}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {phase === "settled" && (
            <div className="dig__done">
              ✓ Traced {steps.length} threads — checked reports, cross-referenced
              blockers, compared reporting, flagged a contradiction.
            </div>
          )}

          {phase === "settled" && teardown && (
            <div className="answer">
              <p>{teardown.summary.text}</p>

              {teardown.findings.map((finding) => {
                const isOpen = !!expanded[finding.id];
                return (
                  <div className="finding" key={finding.id}>
                    <button
                      className="finding__head"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setExpanded((p) => ({ ...p, [finding.id]: !p[finding.id] }))
                      }
                    >
                      <span className="finding__chev">{isOpen ? "▾" : "▸"}</span>
                      <span className="tag">{finding.tag}</span>
                      <span className="finding__text">
                        {finding.statement.text}
                      </span>
                      <span className="flag">
                        <i>!</i>
                        {finding.window}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="finding__body">
                        <div className="label">real cause</div>
                        <div className="cause">{finding.real_cause.text}</div>
                        <Cited
                          sourceIds={[
                            ...new Set([
                              ...finding.statement.source_ids,
                              ...finding.real_cause.source_ids,
                            ]),
                          ]}
                          records={records}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Stated in the report, not omitted. The product's honesty is a
                  feature, so the gap it couldn't close is shown, not hidden. */}
              {teardown.unsourced_gaps.map((gap, i) => (
                <p className="gap-note" key={i}>
                  One thing I couldn&apos;t source: {gap}
                </p>
              ))}
            </div>
          )}

          {qa.length > 0 && (
            <div className="qa">
              {qa.map((answer, i) => (
                <div key={i}>
                  <div className="bubble-user">
                    <span>{answer.question}</span>
                  </div>
                  {answer.sourced ? (
                    <div className="answer">
                      <p>{answer.text}</p>
                      <Cited sourceIds={answer.source_ids} records={records} />
                    </div>
                  ) : (
                    <div className="cant-source">
                      <div className="cant-source__head">
                        <i />
                        <span>no source found</span>
                      </div>
                      <p>{answer.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {asking && (
            <div className="dig__done" style={{ marginTop: 18 }}>
              Drilling into the records…
            </div>
          )}

          <div ref={bottom} />
        </div>
      </div>

      <div className="footer">
        {phase === "settled" && teardown && (
          <div className="nextmove">
            <div className="nextmove__inner">
              <span className="nextmove__avatar">
                <IconPerson color="#545CA1" />
              </span>
              <div className="nextmove__text">
                <div className="label" style={{ marginBottom: 4 }}>
                  next move
                </div>
                <div>
                  <strong>Ask {teardown.next_move.person}</strong> (
                  {teardown.next_move.person_role}) — {teardown.next_move.question}
                </div>
                <div className="nextmove__why">
                  Why them: {teardown.next_move.why_them.text}
                </div>
              </div>
              {/* Shown, not sent. There is no send path in this build —
                  live intervention is out of scope (Module 02). */}
              <span className="pill">shown, not sent</span>
            </div>
          </div>
        )}

        <form className="composer" onSubmit={submit}>
          <div className="composer__inner">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                phase === "settled"
                  ? "Ask a follow-up…"
                  : "Ask a follow-up once the run has finished…"
              }
              disabled={phase !== "settled" || asking}
              aria-label="Ask the investigation a question"
            />
            <button
              type="submit"
              disabled={phase !== "settled" || asking || !draft.trim()}
              aria-label="Send question"
            >
              <IconSend />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
