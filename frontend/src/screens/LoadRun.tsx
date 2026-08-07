import type { Phase } from "./Investigation";

/**
 * Screen 1 — operator-facing.
 *
 * Module 07 is explicit that this one gets no design effort: only the operator
 * sees it, and every minute spent here is a minute not spent on Screen 2. It
 * is a file list and a button on purpose.
 */
export function LoadRun({
  phase,
  onRun,
}: {
  phase: Phase;
  onRun: () => void;
}) {
  const files = [
    { name: "Slack export — #bmw-portal + 3 channels", detail: "214 messages" },
    { name: "Confluence export — meeting & sync notes", detail: "12 notes" },
    { name: "Jira export — DELIVERY board", detail: "9 status reports" },
  ];

  return (
    <div className="body">
      <div className="body__inner">
        <div className="screen-head">
          <div className="eyebrow">Screen 1 · operator</div>
          <h1>Load &amp; run</h1>
          <p>
            One completed project&apos;s exported records. Hand-prepared for the
            demo — real parsing is a pilot concern, not a demo one.
          </p>
        </div>

        <div className="loadrun__files">
          {files.map((file) => (
            <div className="loadrun__file" key={file.name}>
              <span>{file.name}</span>
              <code>{file.detail}</code>
            </div>
          ))}
        </div>

        <button className="btn" onClick={onRun} disabled={phase === "digging"}>
          {phase === "digging"
            ? "Running…"
            : phase === "settled"
              ? "Run again"
              : "Start teardown"}
        </button>

        <p className="readonly-note">
          Read-only. Nothing is written back to any source system — this is a
          promise made to the buyer, and there is no write path in the service
          that could quietly break it.
        </p>
      </div>
    </div>
  );
}
