import type { CSSProperties, ReactNode } from "react";
import { Card } from "./Card";
import { colors, space, radii } from "../../styles/tokens";

type Tone = "neutral" | "blue" | "red" | "green" | "yellow";

const toneColors: Record<Tone, string> = {
  neutral: colors.text,
  blue: colors.blue,
  red: colors.red,
  green: colors.green,
  yellow: colors.yellow,
};

const S: Record<string, CSSProperties> = {
  card: { padding: space[5], borderRadius: radii.md },
  label: {
    textTransform: "uppercase",
    letterSpacing: "0.16em",
    fontSize: 11,
    color: colors.textFaint,
  },
};

export function StatCard({
  label, value, tone = "neutral",
}: { label: string; value: ReactNode; tone?: Tone }) {
  return (
    <Card style={S.card}>
      <div style={S.label}>{label}</div>
      <div style={{ marginTop: space[3], fontSize: 28, fontWeight: 800, color: toneColors[tone] }}>
        {value}
      </div>
    </Card>
  );
}