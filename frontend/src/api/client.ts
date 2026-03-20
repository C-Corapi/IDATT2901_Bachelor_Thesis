const API_BASE = "http://localhost:8000";

export type ExtractionResponse = {
  decisions: {
    decisions: {
      title: string;
      description: string;
      alternatives: string;
      nature: string;
      reach: string;
      deadline: string;
      owner: string;
    }[];
  } | null;
  activities: {
    activities: {
      title: string;
      description: string;
      owner: string;
      related_deliverables: string;
      confidence: string;
      status: string;
      source_excerpt: string;
    }[];
  } | null;
  tasks: {
    tasks: {
      title: string;
      description: string;
      owner: string;
      status: string;
      confidence: string;
      source_excerpt: string;
    }[];
  } | null;
  deliverables: {
    deliverables: {
      requirements: string;
      specifications: string;
      properties: string;
    }[];
  } | null;
};

//export async function extractMetadata(file: File): Promise<ExtractionResponse> {
  //const form = new FormData();
  //form.append("file", file);

  //const res = await fetch(`${API_BASE}/api/extract`, {
    //method: "POST",
    //body: form,
  //});

  //if (!res.ok) {
   // throw new Error(`Extraction failed: ${res.status}`);
  //}

  //return res.json();
//}