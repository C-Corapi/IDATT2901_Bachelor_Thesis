import { useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Page } from "../components/layout/Page";
import { AppRoutes } from "./routes";
import type { ExtractionResult } from "../features/results/types";

export function App() {
  const [results, setResults] = useState<ExtractionResult | null>(null);

  return (
    <>
      <Navbar />
      <Page>
        <AppRoutes results={results} onResults={setResults} />
      </Page>
    </>
  );
}