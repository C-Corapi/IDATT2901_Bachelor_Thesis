import type { HTMLAttributes } from "react";
import { cardBase } from "../../styles/tokens";

export function Card({
  style,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div style={{ ...cardBase, ...style }} {...props} />;
}