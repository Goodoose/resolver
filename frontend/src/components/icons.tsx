import type { SourceKind } from "../api";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconRun() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M4 7V5a1 1 0 011-1h4l2 2h8a1 1 0 011 1v3" />
      <path d="M3 10h18l-2 9a1 1 0 01-1 1H6a1 1 0 01-1-1z" />
    </svg>
  );
}

export function IconInvestigation() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </svg>
  );
}

export function IconCompare() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="4" width="7.5" height="16" rx="1.5" />
      <rect x="13.5" y="4" width="7.5" height="16" rx="1.5" />
    </svg>
  );
}

export function IconConnectors() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M9 3v6M15 3v6" />
      <path d="M6 9h12v3a6 6 0 01-12 0z" />
      <path d="M12 18v3" />
    </svg>
  );
}

export function IconMonitor() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...stroke}>
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  );
}

export function IconPerson({ color = "currentColor" }: { color?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function IconSend() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

/**
 * Source-kind marks. Recognisable at a glance so a reader can tell a chat
 * message from a status report without reading the label — the citation is
 * meant to be effortless, and colour does that faster than text.
 */
export function SourceIcon({ kind }: { kind: SourceKind }) {
  if (kind === "chat") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <rect x="9" y="2" width="4" height="8" rx="2" fill="#36C5F0" />
        <rect x="14" y="9" width="8" height="4" rx="2" fill="#2EB67D" />
        <rect x="11" y="14" width="4" height="8" rx="2" fill="#ECB22E" />
        <rect x="2" y="11" width="8" height="4" rx="2" fill="#E01E5A" />
      </svg>
    );
  }
  if (kind === "ticket") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2 L21 11a2 2 0 010 2.8L12 22 3 13.8a2 2 0 010-2.8z" fill="#2684FF" />
        <path d="M12 7 L16.5 11.4a1.4 1.4 0 010 2L12 17.8 7.5 13.4a1.4 1.4 0 010-2z" fill="#fff" />
      </svg>
    );
  }
  if (kind === "mail") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <rect x="1.5" y="4.5" width="21" height="15" rx="2" fill="#fff" stroke="#EA4335" strokeWidth="1.6" />
        <path d="M2.5 6 L12 13 L21.5 6" fill="none" stroke="#EA4335" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
      <path d="M6 2h8l6 6v14a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#4285F4" />
      <path d="M14 2v5a1 1 0 001 1h5z" fill="#a9c3f5" />
      <rect x="7.5" y="11" width="9" height="1.3" fill="#fff" />
      <rect x="7.5" y="14" width="9" height="1.3" fill="#fff" />
      <rect x="7.5" y="17" width="6" height="1.3" fill="#fff" />
    </svg>
  );
}
