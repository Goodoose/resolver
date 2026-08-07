/**
 * Screens 5 and 6 — mocked previews.
 *
 * The rule these two screens exist under (Module 04): mock the *shape* of a
 * thing, never the *function* of a thing. So the connect buttons are inert and
 * say so, no spinner ever runs, and no number on the monitoring screen is
 * presented as live. Faking a live pull here is the one trust landmine in a
 * product whose entire claim is that nothing is fabricated.
 */

function PreviewBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="preview-banner">
      <strong>Preview —</strong>
      <span>{children}</span>
    </div>
  );
}

export function Connectors() {
  const connectors = [
    { name: "Jira", note: "the layer that reports status" },
    { name: "Slack", note: "the layer where the real reasons live" },
    { name: "Confluence", note: "decisions and what was said in the room" },
    { name: "Google Workspace", note: "client-facing threads" },
  ];

  return (
    <div className="body">
      <div className="body__inner">
        <div className="screen-head">
          <div className="eyebrow">Screen 5 · mocked preview</div>
          <h1>Connectors</h1>
          <p>
            What the live version connects to. Shown so integrations stop being
            counted as an unknown — not because any of it runs yet.
          </p>
        </div>

        <PreviewBanner>
          nothing here connects to anything. This build reads exported files
          only, and no button on this screen performs a live pull.
        </PreviewBanner>

        <div className="preview-grid">
          {connectors.map((connector) => (
            <div className="connector" key={connector.name}>
              <div className="connector__name">{connector.name}</div>
              <div className="connector__state">{connector.note}</div>
              <button disabled title="Not wired up in the prototype">
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Monitoring() {
  const projects = [
    { name: "BMW dealer portal", state: "flagged", colour: "#d3a06a", when: "teardown complete" },
    { name: "Retail loyalty rebuild", state: "quiet", colour: "#cfd2da", when: "—" },
    { name: "Warehouse routing v2", state: "quiet", colour: "#cfd2da", when: "—" },
  ];

  return (
    <div className="body">
      <div className="body__inner">
        <div className="screen-head">
          <div className="eyebrow">Screen 6 · mocked preview</div>
          <h1>Ongoing monitoring</h1>
          <p>
            The shape of the live product — a hand kept on several projects at
            once, rather than one post-mortem at a time.
          </p>
        </div>

        <PreviewBanner>
          an illustration of the live product, not live data. This build
          analyses one completed project; continuous monitoring is what the
          pilot earns the right to build.
        </PreviewBanner>

        {projects.map((project) => (
          <div className="monitor-row" key={project.name}>
            <span
              className="monitor-dot"
              style={{ background: project.colour }}
            />
            <span className="monitor-row__name">{project.name}</span>
            <span className="monitor-row__when">{project.when}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
