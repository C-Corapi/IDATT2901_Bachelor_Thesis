import { colors, space, radii, fonts, containerMax, pillBase } from "../../styles/tokens";
import { Button } from "../ui/Button";

const S: Record<string, React.CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "rgba(7,11,18,0.75)",
    backdropFilter: "blur(10px)",
    borderBottom: `1px solid ${colors.border}`,
  },
  inner: {
    maxWidth: containerMax,
    margin: "0 auto",
    padding: `${space[4]}px ${space[6]}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space[4],
  },
  left: { display: "flex", alignItems: "center", gap: space[3] },
  logo: {
    width: 24, height: 24, borderRadius: 8,
    background: `linear-gradient(135deg, ${colors.brand}, ${colors.brand2})`,
    boxShadow: "0 8px 20px rgba(0,224,164,0.18)",
  },
  brand: { display: "flex", alignItems: "baseline", gap: space[2] },
  name: { fontWeight: 700, letterSpacing: 0.2 },
  version: {
    fontSize: 12, color: colors.textFaint,
    border: `1px solid ${colors.border}`,
    padding: "2px 8px", borderRadius: radii.full,
    background: "rgba(255,255,255,0.02)",
  },
  right: { display: "flex", alignItems: "center", gap: space[3] },
  pill: {
    ...pillBase,
    gap: space[2],
    padding: "10px 12px",
    border: `1px solid ${colors.border}`,
    background: "rgba(255,255,255,0.03)",
    color: colors.textMuted,
    fontSize: 14,
  },
  pillCount: {
    ...pillBase,
    justifyContent: "center",
    minWidth: 22, height: 18,
    padding: "0 6px",
    background: "rgba(0,224,164,0.12)",
    color: colors.brand,
    fontWeight: 700,
  },
};

export function Navbar() {
  return (
    <header style={S.header}>
      <div style={S.inner}>
        <div style={S.left}>
          <div style={S.logo} aria-hidden />
          <div style={S.brand}>
            <span style={S.name}>MetaExtract</span>
            <span style={S.version}>v0.1.0</span>
          </div>
        </div>
        <div style={S.right}>
          <Button variant="ghost">Last opp</Button>
          <div style={S.pill}>
            Resultater <span style={S.pillCount}>5</span>
          </div>
        </div>
      </div>
    </header>
  );
}