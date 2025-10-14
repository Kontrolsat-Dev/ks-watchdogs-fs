export type Tone = "default" | "ok" | "warn" | "crit";

export function levelFromLatency(
  ms: number,
  kind: "ttfb" | "total"
): "ok" | "warning" | "critical" {
  // thresholds (rule of thumb) → ajusta ao teu contexto
  const th =
    kind === "ttfb" ? { ok: 800, warn: 2000 } : { ok: 1500, warn: 3000 };
  if (ms <= th.ok) return "ok";
  if (ms <= th.warn) return "warning";
  return "critical";
}

export function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function barWidth(ms: number, kind: "ttfb" | "total") {
  // % relativo a um “pior caso esperado” para ter barra útil
  const ref = kind === "ttfb" ? 3000 : 6000;
  return `${Math.round(clamp01(ms / ref) * 100)}%`;
}

export function formatBytes(n?: number) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export function toneFromLevel(
  level: "ok" | "warning" | "critical" | "default"
): Tone {
  if (level === "warning") return "warn";
  if (level === "critical") return "crit";
  if (level === "ok") return "ok";
  return "default";
}
