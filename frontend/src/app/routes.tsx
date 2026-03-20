import { Route, Routes, Navigate } from "react-router-dom";
import { UploadSection } from "../features/UploadSection";
import { ResultsPanel } from "../features/results/ResultsPanel";
import type { ExtractionResult } from "../features/results/types";

type Props = {
  results: ExtractionResult | null;
  onResults: (data: ExtractionResult) => void;
};

export function AppRoutes({ results, onResults }: Props) {
  return (
    <Routes>
      <Route path="/" element={<UploadSection onResults={onResults} />} />
      <Route
        path="/results"
        element={results ? <ResultsPanel data={results} /> : <Navigate to="/" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}