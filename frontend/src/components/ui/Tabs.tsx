import type { CSSProperties } from "react";
import { colors, space, radii } from "../../styles/tokens";

export type TabItem = { id: string; label: string; count?: number };

const bar: CSSProperties = {
  display: "inline-flex",
  gap: space[2],
  padding: space[2],
  borderRadius: radii.full,
  border: `1px solid ${colors.border}`,
  background: "rgba(255,255,255,0.02)",
};

const tab = (active: boolean): CSSProperties => ({
  border: active ? "1px solid rgba(45,212,191,0.25)" : "1px solid transparent",
  background: active ? "rgba(45,212,191,0.12)" : "transparent",
  color: active ? colors.text : colors.textMuted,
  padding: "10px 12px",
  borderRadius: radii.full,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: space[2],
});

const count: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 22,
  height: 18,
  padding: "0 6px",
  borderRadius: radii.full,
  background: "rgba(255,255,255,0.06)",
  color: colors.text,
  fontSize: 12,
  fontWeight: 700,
};

export function Tabs({
  items, activeId, onChange,
}: { items: TabItem[]; activeId: string; onChange: (id: string) => void }) {
  return (
    <div style={bar} role="tablist">
      {items.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={activeId === t.id}
          style={tab(activeId === t.id)}
          onClick={() => onChange(t.id)}
        >
          {t.label}
          {typeof t.count === "number" && <span style={count}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}