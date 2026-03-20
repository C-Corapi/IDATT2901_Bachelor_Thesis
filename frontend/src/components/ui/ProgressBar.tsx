import type { CSSProperties } from "react";
import { colors, radii } from "../../styles/tokens";

const track: CSSProperties = {
  height: 6,
  borderRadius: radii.full,
  background: "rgba(255,255,255,0.08)",
  overflow: "hidden",
};

const fill: CSSProperties = {
  height: "100%",
  borderRadius: radii.full,
  background: `linear-gradient(90deg, ${colors.brand}, ${colors.blue})`,
};

export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div style={track} aria-label={`Confidence ${clamped}%`}>
      <div style={{ ...fill, width: `${clamped}%` }} />
    </div>
  );
}