import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { colors, space, radii, hintText } from "../../styles/tokens";

type Props = {
  title: string;
  hint: string;
  accept?: string;
  onFileSelected?: (file: File) => void;
};

export function Dropzone({ title, hint, accept, onFileSelected }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [hover, setHover] = useState(false);

  const S: Record<string, CSSProperties> = {
    root: {
      width: "100%",
      minHeight: 180,
      borderRadius: radii.lg,
      border: `2px dashed ${hover ? "rgba(45,212,191,0.35)" : "rgba(255,255,255,0.16)"}`,
      background: hover ? "rgba(45,212,191,0.04)" : "rgba(255,255,255,0.02)",
      display: "grid",
      placeItems: "center",
      gap: space[3],
      padding: space[10],
      cursor: "pointer",
      transition: "border-color 120ms ease, background 120ms ease",
    },
    icon: { fontSize: 28, opacity: 0.75 },
    content: { textAlign: "center" },
    title: { fontWeight: 700, color: colors.text },
    hint: { ...hintText, marginTop: space[2] },
  };

  return (
    <div
      style={S.root}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
    >
      <div style={S.icon} aria-hidden>📄</div>
      <div style={S.content}>
        <div style={S.title}>{title}</div>
        <div style={S.hint}>{hint}</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelected?.(f); }}
      />
    </div>
  );
}