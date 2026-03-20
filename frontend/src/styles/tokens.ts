import type { CSSProperties } from "react";

export const colors = {
  bg:         "#ffffff",
  bgElev1:    "#f8f9fa",
  bgElev2:    "#f1f3f5",

  border:       "rgba(0,0,0,0.08)",
  borderStrong: "rgba(0,0,0,0.14)",

  text:      "rgba(0,0,0,0.88)",
  textMuted: "rgba(0,0,0,0.56)",
  textFaint: "rgba(0,0,0,0.36)",

  brand:  "#00c48c",
  brand2: "#20b2aa",

  blue:   "#0891b2",
  yellow: "#d97706",
  red:    "#e11d48",
  green:  "#059669",
  purple: "#7c3aed",
} as const;

export const fonts = {
  sans: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace',
} as const;

export const space = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48,
} as const;

export const radii = {
  sm: 10, md: 14, lg: 18, full: 999,
} as const;

export const shadows = {
  card: "0 10px 30px rgba(0,0,0,0.45)",
  heavy: "0 20px 60px rgba(0,0,0,0.55)",
} as const;

export const containerMax = 1040;

export const cardBase: CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
  border: `1px solid ${colors.border}`,
  borderRadius: radii.lg,
  boxShadow: shadows.card,
};

export const hintText: CSSProperties = {
  fontFamily: fonts.mono,
  fontSize: 12,
  color: colors.textFaint,
};

export const titleText: CSSProperties = {
  margin: 0,
  fontSize: 44,
  lineHeight: 1.08,
  letterSpacing: "-0.02em",
  fontWeight: 800,
  color: colors.text,
};

export const pillBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: radii.full,
  fontFamily: fonts.mono,
  fontSize: 12,
};