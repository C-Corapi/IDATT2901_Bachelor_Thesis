import type { ButtonHTMLAttributes, CSSProperties } from "react";
import { colors, radii } from "../../styles/tokens";

type Variant = "primary" | "secondary" | "ghost";

const base: CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: radii.full,
  padding: "10px 14px",
  color: colors.text,
  cursor: "pointer",
  transition: "transform 120ms ease, background 120ms ease, border-color 120ms ease",
};

const variants: Record<Variant, CSSProperties> = {
  primary: {
    ...base,
    borderColor: "rgba(0,224,164,0.3)",
    background: "rgba(0,224,164,0.12)",
  },
  secondary: { ...base, background: "rgba(255,255,255,0.03)" },
  ghost:     { ...base, background: "transparent" },
};

export function Button({
  variant = "secondary",
  style,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button style={{ ...variants[variant], ...style }} {...props} />;
}