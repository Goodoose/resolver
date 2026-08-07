import { useEffect, useState } from "react";

import { getBenchmark, type Benchmark, type SourceRecord, type Teardown } from "../api";
import { Cited } from "../components/Cited";

const DEFECT_LABEL: Record<string, string> = {
  unsourced: "unsourced",
  contradiction: "contradicts itself",
  shallow: "restates the report",
};

/**
 * Screen 4 — the head-to-head (Flow C).
 *
 * The differences are marked per claim rather than left as two blocks of text
 * for the reader to diff by eye. Note the baseline column can carry a claim
 * with no defect: the benchmark is only worth running if it is allowed to be
 * right, and hiding its hits would be the strawman the spec warns against.
 */
export function HeadToHead({
  teardown,
  records,
}: {
  teardown: Teardown | null;
  records: Map<string, SourceRecord>;
}) {
  const [benchmark, setBenchmark] = useState<Benchmark | null>(null);

  useEffect(() => {
    getBenchmark().then(setBenchmark).catch(() => setBenchmark(null));
  }, []);

  return (
    <div className="body">
      <div className="body__inner">
        <div className="screen-head">
          <div className="eyebrow">Screen 4 · reader</div>
          <h1>Head-to-head</h1>
          <p>
            The same project, the same input, two paths. This is the answer to
            &ldquo;we could just upload it to Claude&rdquo; — and it is a real
            test, so it can lose.
          </p>
        </div>

        {!teardown && (
          <div className="dig__done">
            No run yet — start one from <strong>Load &amp; run</strong> to fill
            this column.
          </div>
        )}

        <div className="h2h">
          <div className="h2h__col" data-side="ours">
            <div className="h2h__title">This product</div>
            <div className="h2h__sub">
              Every claim carries the record it rests on. Open any one of them.
            </div>
            {teardown?.findings.map((finding) => (
              <div className="h2h__claim" key={finding.id}>
                <span className="defect" data-kind="ok">
                  traceable
                </span>
                <div>{finding.statement.text}</div>
                <div style={{ marginTop: 12 }}>
                  <Cited
                    sourceIds={finding.statement.source_ids}
                    records={records}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="h2h__col">
            <div className="h2h__title">{benchmark?.baseline_name ?? "Baseline"}</div>
            <div className="h2h__sub">
              {benchmark ? `Prompt: “${benchmark.baseline_prompt}”` : "Loading…"}
            </div>
            {benchmark?.baseline_claims.map((claim, i) => (
              <div className="h2h__claim" key={i}>
                <span className="defect" data-kind={claim.defect ?? "ok"}>
                  {claim.defect ? DEFECT_LABEL[claim.defect] : "holds up"}
                </span>
                <div>{claim.text}</div>
                {claim.note && <div className="defect-note">{claim.note}</div>}
              </div>
            ))}
          </div>
        </div>

        {benchmark && <div className="verdict">{benchmark.verdict}</div>}
      </div>
    </div>
  );
}
