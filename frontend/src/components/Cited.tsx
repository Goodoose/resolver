import { useState } from "react";

import type { SourceRecord } from "../api";
import { SourceIcon } from "./icons";

/**
 * The citation row for a claim, plus the evidence it opens.
 *
 * Evidence expands *inline, directly under the claim it belongs to* rather
 * than in a modal or a side panel. That is the single most important
 * interaction in the product (Module 07, Screen 2): the reader has to get from
 * a claim to the record and back without losing their place, and anything that
 * covers the page or navigates away costs them exactly that.
 */
export function Cited({
  sourceIds,
  records,
}: {
  sourceIds: string[];
  records: Map<string, SourceRecord>;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const cited = sourceIds
    .map((id) => records.get(id))
    .filter((r): r is SourceRecord => r !== undefined);
  const open = openId ? records.get(openId) : undefined;

  return (
    <>
      <div className="label">sources — tap to open</div>
      <div className="chips">
        {cited.map((record) => (
          <button
            key={record.id}
            className="chip"
            aria-expanded={openId === record.id}
            onClick={() => setOpenId(openId === record.id ? null : record.id)}
          >
            <SourceIcon kind={record.kind} />
            {record.label}
          </button>
        ))}
      </div>

      {open && (
        <div className="evidence">
          <div className="evidence__label">{open.label}</div>
          {open.lines.map((line, i) => (
            <div className="evidence__line" key={i}>
              {line.who && <b>{line.who}: </b>}
              {line.text}
            </div>
          ))}
          {/* An absent reply is evidence too — a raised blocker with no
              follow-up is the literal shape of a signal that never landed. */}
          {open.silence_note && (
            <div className="evidence__silence">{open.silence_note}</div>
          )}
        </div>
      )}
    </>
  );
}
