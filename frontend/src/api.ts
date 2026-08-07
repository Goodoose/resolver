/**
 * Client for the teardown API. Types mirror backend/app/models.py.
 *
 * Note the shape of `Claim`: text never travels without its sources. Keeping
 * that pairing in the type means a component physically cannot render an
 * assertion and forget to render where it came from.
 */

export type SourceKind = "chat" | "doc" | "ticket" | "mail";

export interface SourceLine {
  who: string | null;
  text: string;
}

export interface SourceRecord {
  id: string;
  kind: SourceKind;
  label: string;
  week: number | null;
  lines: SourceLine[];
  silence_note: string | null;
}

export interface Claim {
  text: string;
  source_ids: string[];
}

export interface Finding {
  id: string;
  tag: string;
  window: string;
  statement: Claim;
  real_cause: Claim;
}

export interface NextMove {
  gap: Claim;
  question: string;
  person: string;
  person_role: string;
  why_them: Claim;
}

export interface ProjectMeta {
  name: string;
  message_count: number;
  status_report_count: number;
  meeting_note_count: number;
  read_only: boolean;
}

export interface DigStep {
  label: string;
  detail: string | null;
}

export interface Teardown {
  project: ProjectMeta;
  summary: Claim;
  findings: Finding[];
  next_move: NextMove;
  unsourced_gaps: string[];
  dig_steps: DigStep[];
}

export interface Answer {
  question: string;
  sourced: boolean;
  text: string;
  source_ids: string[];
}

export interface BaselineClaim {
  text: string;
  defect: "unsourced" | "contradiction" | "shallow" | null;
  note: string | null;
}

export interface Benchmark {
  baseline_name: string;
  baseline_prompt: string;
  baseline_claims: BaselineClaim[];
  verdict: string;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

export const getSources = () => get<SourceRecord[]>("/sources");
export const getTeardown = () => get<Teardown>("/teardown");
export const getBenchmark = () => get<Benchmark>("/benchmark");

export async function ask(question: string): Promise<Answer> {
  const res = await fetch("/api/interrogate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(`POST /interrogate → ${res.status}`);
  return res.json();
}

/**
 * Subscribe to the run: dig steps arrive one at a time, then the result.
 *
 * Hand-rolled rather than EventSource because the stream is one-shot — it ends
 * when the run ends, and EventSource would immediately reconnect and re-run it.
 * Returns an abort function so a screen change or a replay can cut the stream.
 */
export function runTeardown(
  onStep: (step: DigStep & { index: number }) => void,
  onResult: (teardown: Teardown) => void,
  onError: (message: string) => void,
): () => void {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch("/api/teardown/stream", {
        signal: controller.signal,
      });
      if (!res.body) throw new Error("no stream body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line. Anything after the last
        // separator is a partial frame — leave it in the buffer.
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const event = /^event: (.+)$/m.exec(frame)?.[1];
          const data = /^data: (.+)$/m.exec(frame)?.[1];
          if (!event || !data) continue;
          if (event === "step") onStep(JSON.parse(data));
          if (event === "result") onResult(JSON.parse(data));
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      onError((err as Error).message);
    }
  })();

  return () => controller.abort();
}
