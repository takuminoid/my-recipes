/* たくみんレシピ — shared, pure UI primitives (safe in both server & client) */
import React from "react";

export const TINTS = [
  { key: "cream", label: "クリーム" },
  { key: "sage", label: "セージ" },
  { key: "clay", label: "クレイ" },
  { key: "slate", label: "スレート" },
  { key: "wheat", label: "ウィート" },
  { key: "rose", label: "ローズ" },
] as const;

export type TintKey = (typeof TINTS)[number]["key"];

const TINT_KEYS = TINTS.map((t) => t.key);

/** Deterministic fallback tint for recipes saved before the monogram system. */
export function resolveTint(tint: string | null | undefined, seed: number): TintKey {
  if (tint && (TINT_KEYS as readonly string[]).includes(tint)) return tint as TintKey;
  return TINT_KEYS[((seed % TINT_KEYS.length) + TINT_KEYS.length) % TINT_KEYS.length];
}

/** "2026-05-03" -> "2026.05.03" */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const parts = String(iso).split("-");
  if (parts.length !== 3) return iso;
  return `${parts[0]}.${parts[1]}.${parts[2]}`;
}

export function Stars({ value, size = 15, gap = 2 }: { value: number; size?: number; gap?: number }) {
  return (
    <span
      role="img"
      aria-label={`${value} / 5`}
      style={{ display: "inline-flex", gap, lineHeight: 1, fontSize: size }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          style={{ color: n <= value ? "var(--star)" : "var(--line-strong)", transition: "color .15s" }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function SectionLabel({ children, en }: { children: React.ReactNode; en?: string }) {
  return (
    <div className="section-label">
      <span className="section-label__jp">{children}</span>
      {en && <span className="section-label__en">{en}</span>}
    </div>
  );
}

/** Typographic stand-in for a missing photo: first char of the name on a tint. */
export function Monogram({
  name,
  tint = "cream",
  className = "",
}: {
  name: string;
  tint?: TintKey;
  className?: string;
}) {
  const ch = (name ?? "").trim().charAt(0);
  return (
    <div className={`monogram ${className}`.trim()} data-tint={tint} aria-hidden="true">
      <span className="monogram__char">{ch}</span>
    </div>
  );
}

/** Card / detail media: the photo if present, else the monogram tile. */
export function RecipeMedia({
  name,
  tint,
  photo,
  ratio,
  className = "",
}: {
  name: string;
  tint: TintKey;
  photo?: string | null;
  ratio: string;
  className?: string;
}) {
  return (
    <div className={`photoslot ${className}`.trim()} style={{ aspectRatio: ratio }}>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="photoslot__img" src={photo} alt={name} />
      ) : (
        <Monogram className="photoslot__mono" name={name} tint={tint} />
      )}
    </div>
  );
}

/** Render "作り方" steps: each non-empty line becomes a numbered timeline item,
    parsing a leading "N." index and **bold** spans (matches the design). */
export function renderSteps(steps: string): React.ReactElement[] {
  const lines = String(steps || "")
    .split("\n")
    .filter((l) => l.trim());
  return lines.map((line, i) => {
    const m = line.match(/^\s*(\d+)\.\s*(.*)$/);
    const text = m ? m[2] : line;
    const parts = text.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={j}>{p.slice(2, -2)}</strong>
      ) : (
        <React.Fragment key={j}>{p}</React.Fragment>
      )
    );
    return (
      <li className="steps__item" key={i}>
        <span className="steps__num">{m ? m[1] : i + 1}</span>
        <span className="steps__text">{parts}</span>
      </li>
    );
  });
}
