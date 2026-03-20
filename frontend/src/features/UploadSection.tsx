import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colors, space, titleText, hintText, radii } from "../styles/tokens";
import { Dropzone } from "../components/ui/Dropzone";
import { Card } from "../components/ui/Card";
//import { extractMetadata } from "../api/client";
import type { ExtractionResult } from "./results/types";

const S = {
  header:   { marginBottom: space[8] },
  title:    titleText,
  subtitle: { marginTop: space[3], marginBottom: 0, color: colors.textMuted, maxWidth: "70ch" },
  cards:    { marginTop: space[8], display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: space[6] },
  mini:     { padding: space[6], borderRadius: radii.lg },
  miniIcon: { fontSize: 18, opacity: 0.9 },
  miniTitle:{ marginTop: space[3], fontWeight: 800 },
  miniText: { ...hintText, marginTop: space[2] },
  loading:  { marginTop: space[6], color: colors.textMuted, textAlign: "center" as const },
  error:    { marginTop: space[6], color: colors.red, textAlign: "center" as const },
};

type Props = {
  onResults: (data: ExtractionResult) => void;
};

export function UploadSection({ onResults }: Props) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Placeholder until API client is ready
  function handleFile(_file: File) {
    // TODO: uncomment when extractMetadata is ready
    // async function handleFile(file: File) {
    //   setLoading(true);
    //   setError(null);
    //   try {
    //     const raw = await extractMetadata(file);
    //     const result: ExtractionResult = {
    //       decisions: raw.decisions?.decisions ?? [],
    //       activities: raw.activities?.activities ?? [],
    //       tasks: raw.tasks?.tasks ?? [],
    //       deliverables: raw.deliverables?.deliverables ?? [],
    //     };
    //     onResults(result);
    //     navigate("/results");
    //   } catch (e) {
    //     setError(e instanceof Error ? e.message : "Something went wrong");
    //   } finally {
    //     setLoading(false);
    //   }
    // }
  }

  return (
    <section>
      <header style={S.header}>
        <h1 style={S.title}>NextGen Metadata System</h1>
        <p style={S.subtitle}>
          Last opp et møtereferat eller prosjektdokument. AI-en identifiserer og kategoriserer metadatatyper for det.
        </p>
      </header>

      <Dropzone
        title="Last opp dokument eller transkripsjon"
        hint=".txt — dra hit eller klikk"
        accept=".pdf,.docx,.txt,.md"
        onFileSelected={handleFile}
      />

      {loading && <p style={S.loading}>Analyserer dokument...</p>}
      {error && <p style={S.error}>{error}</p>}
    </section>
  );
}