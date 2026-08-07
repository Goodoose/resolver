import { useCallback, useEffect, useRef, useState } from "react";

import "./App.css";
import {
  getSources,
  runTeardown,
  type DigStep,
  type SourceRecord,
  type Teardown,
} from "./api";
import {
  IconCompare,
  IconConnectors,
  IconInvestigation,
  IconMonitor,
  IconRun,
} from "./components/icons";
import { HeadToHead } from "./screens/HeadToHead";
import { Investigation, type Phase } from "./screens/Investigation";
import { LoadRun } from "./screens/LoadRun";
import { Connectors, Monitoring } from "./screens/Previews";

type ScreenId = "run" | "investigation" | "compare" | "connectors" | "monitor";

const SCREENS: { id: ScreenId; label: string; icon: React.ReactNode }[] = [
  { id: "run", label: "Load & run", icon: <IconRun /> },
  { id: "investigation", label: "Investigation", icon: <IconInvestigation /> },
  { id: "compare", label: "Head-to-head", icon: <IconCompare /> },
  { id: "connectors", label: "Connectors (preview)", icon: <IconConnectors /> },
  { id: "monitor", label: "Monitoring (preview)", icon: <IconMonitor /> },
];

export default function App() {
  const [screen, setScreen] = useState<ScreenId>("run");
  const [phase, setPhase] = useState<Phase>("idle");
  const [steps, setSteps] = useState<DigStep[]>([]);
  const [teardown, setTeardown] = useState<Teardown | null>(null);
  const [records, setRecords] = useState<Map<string, SourceRecord>>(new Map());
  const [error, setError] = useState<string | null>(null);
  const abort = useRef<(() => void) | null>(null);

  // The record set is fetched once and shared. Every citation anywhere in the
  // app resolves against this one map, so a claim cannot render against a
  // source the rest of the app doesn't have.
  useEffect(() => {
    getSources()
      .then((list) => setRecords(new Map(list.map((r) => [r.id, r]))))
      .catch(() => setError("Could not reach the API. Is the backend running?"));
  }, []);

  const start = useCallback(() => {
    abort.current?.();
    setSteps([]);
    setTeardown(null);
    setError(null);
    setPhase("digging");
    setScreen("investigation");

    abort.current = runTeardown(
      (step) => setSteps((prev) => [...prev, step]),
      (result) => {
        setTeardown(result);
        setPhase("settled");
      },
      (message) => {
        setError(message);
        setPhase("error");
      },
    );
  }, []);

  // A run in flight when the tab closes or the component unmounts should not
  // keep the connection open.
  useEffect(() => () => abort.current?.(), []);

  const project = teardown?.project;

  return (
    <div className="shell">
      <div className="stage">
        <nav className="rail" aria-label="Screens">
          <div className="rail__mark" />
          {SCREENS.map((item) => (
            <button
              key={item.id}
              className="rail__btn"
              aria-current={screen === item.id}
              aria-label={item.label}
              title={item.label}
              onClick={() => setScreen(item.id)}
            >
              {item.icon}
            </button>
          ))}
          <div className="rail__spacer" />
        </nav>

        <main className="main">
          <header className="topbar">
            <div className="topbar__inner">
              <div className="topbar__id">
                <span className="topbar__title">
                  {project?.name ?? "Forensic teardown"}
                </span>
                <span className="topbar__meta">
                  {project
                    ? `read-only · reconstructed from ${project.message_count} messages, ${project.status_report_count} status reports, ${project.meeting_note_count} meeting notes`
                    : "read-only · one completed project · exports in, teardown out"}
                </span>
              </div>
              {phase === "settled" && (
                <button className="linkish" onClick={start}>
                  ↻ replay
                </button>
              )}
            </div>
          </header>

          {screen === "run" && <LoadRun phase={phase} onRun={start} />}
          {screen === "investigation" && (
            <Investigation
              phase={phase}
              steps={steps}
              teardown={teardown}
              records={records}
              error={error}
            />
          )}
          {screen === "compare" && (
            <HeadToHead teardown={teardown} records={records} />
          )}
          {screen === "connectors" && <Connectors />}
          {screen === "monitor" && <Monitoring />}
        </main>
      </div>
    </div>
  );
}
