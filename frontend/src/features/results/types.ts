export type Decision = {
  title: string;
  description: string;
  alternatives: string;
  nature: string;
  reach: string;
  deadline: string;
  owner: string;
};

export type Activity = {
  title: string;
  description: string;
  owner: string;
  related_deliverables: string;
  confidence: string;
  status: string;
  source_excerpt: string;
};

export type Task = {
  title: string;
  description: string;
  owner: string;
  status: string;
  confidence: string;
  source_excerpt: string;
};

export type Deliverable = {
  requirements: string;
  specifications: string;
  properties: string;
};

export type ExtractionResult = {
  decisions: Decision[];
  activities: Activity[];
  tasks: Task[];
  deliverables: Deliverable[];
};

export type TabId = "decisions" | "activities" | "tasks" | "deliverables";