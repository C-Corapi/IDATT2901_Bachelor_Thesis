export type MetadataType = 'epic' | 'decision' | 'deliverable' | 'task' | 'activity';

export interface Epic {
  id: number;
  title: string;
  description: string;
  classification?: string;
  owner?: string;
  scope?: string;
  use_case?: string;
  user_story?: string;
  non_functional_requirements?: string;
}

export interface Decision {
  id: number;
  title: string;
  description: string;
  alternatives?: string;
  nature?: string;
  reach?: string;
  deadline?: string;
  owner?: string;
}

export interface Deliverable {
  id: number;
  title: string;
  description: string;
  alternatives: string;
  nature: string;
  reach: string;
  deadline?: string;
  owner?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  owner?: string;
  status?: string;
  time_logged: string;
  target_date?: string;
  epic_id?: number;
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  owner?: string;
  status?: string;
  epic_id?: number;
}

export interface DocEntry {
  title: string;
  uploaded_at: string;
}

export interface KanbanItemFull {
  id: number;
  title: string;
  owner?: string;
  type: MetadataType;
  status: string;
  description?: string;
  nature?: string;
  reach?: string;
  alternatives?: string;
  evidence?: string;
  confidence?: number;
  verified?: boolean;
  extraDetails?: { label: string; value: string; key?: string }[];
  raw: any;
}