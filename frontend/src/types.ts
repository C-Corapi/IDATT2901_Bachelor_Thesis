export type MetadataType = 'all' | 'epic' | 'decision' | 'deliverable' | 'activity' | 'task' ;

export interface Epic {
  id: number;
  title: string;
  description?: string;
  owner?: string;
  classification?: string;
  scope?: string;
  use_case?: string;
  user_story?: string;
  non_functional_requirements?: string;
  kanban_status?: string;
}

export interface Decision {
  id: number;
  title: string;
  description?: string;
  owner?: string;
  alternatives?: string;
  nature?: string;
  reach?: string;
  deadline?: string;
  kanban_status?: string;
}

export interface Deliverable {
  id: number;
  title: string;
  description?: string;
  owner?: string;
  requirements?: string;
  specifications?: string;
  properties?: string;
  fit_criterion?: string;
  nature?: string;
  reach?: string;
  alternatives?: string;
  deadline?: string;
  kanban_status?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  owner?: string;
  status?: string;
  time_logged?: string;
  target_date?: string;
  kanban_status?: string;
}

export interface Activity {
  id: number;
  title: string;
  description?: string;
  owner?: string;
  status?: string;
  kanban_status?: string;
}

export interface DocEntry {
  filename: string;
}

export interface KanbanItemFull {
  id: number;
  type: MetadataType;
  title: string;
  owner?: string;
  description?: string;
  status?: string;
  nature?: string;
  reach?: string;
  alternatives?: string;
  evidence?: string;
  confidence?: number;
  verified?: boolean;
  extraDetails?: any[];
  raw?: any;
}