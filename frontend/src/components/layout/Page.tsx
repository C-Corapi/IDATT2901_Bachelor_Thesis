import type { ReactNode } from "react";
import { space, containerMax } from "../../styles/tokens";

const style: React.CSSProperties = {
  maxWidth: containerMax,
  margin: "0 auto",
  padding: `${space[12]}px ${space[6]}px`,
};

export function Page({ children }: { children: ReactNode }) {
  return <main style={style}>{children}</main>;
}