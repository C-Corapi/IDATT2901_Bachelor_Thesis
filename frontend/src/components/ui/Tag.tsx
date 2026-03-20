import type { CSSProperties, ReactNode } from "react";
import { colors, radii, pillBase } from "../../styles/tokens";

type Tone = "neutral" | "green" | "red" | "yellow" | "blue" | "purple";

const toneStyles: Record<Tone, CSSProperties> = {
  neutral: {
    color: colors.textMuted,
    borderColor: colors.border,
    background: "rgba(255,255,255,0.03)",
  },
  green: {
    color: colors.green,
    borderColor: "rgba(52,211,153,0.25)",
    background: "rgba(52,211,153,0.08)",
  },
  red: {
    color: colors.red,
    borderColor: "rgba(251,113,133,0.25)",
    background: "rgba(251,113,133,0.08)",
  },
  yellow: {
    color: colors.yellow,
    borderColor: "rgba(251,191,36,0.25)",
    background: "rgba(251,191,36,0.08)",
  },
  blue: {
    color: colors.blue,
    borderColor: "rgba(34,211,238,0.25)",
    background: "rgba(34,211,238,0.08)",
  },
  purple: {
    color: colors.purple,
    borderColor: "rgba(167,139,250,0.25)",
    background: "rgba(167,139,250,0.08)",
  },
};

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  const style: CSSProperties = {
    ...pillBase,
    padding: "6px 10px",
    border: "1px solid",
    ...toneStyles[tone],
  };
  return <span style={style}>{children}</span>;
}