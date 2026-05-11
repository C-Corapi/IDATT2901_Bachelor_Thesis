/*
 * Centralized API client.
 */

import type { Epic, Decision, Deliverable, Task, Activity } from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} → ${res.status}`);
  return res.json();
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${path} → ${res.status}`);
}

/* ── 1. GET all ─────────────────────────────────────────────────── */
export const getEpics        = () => get<Epic[]>('/epics/');
export const getDecisions    = () => get<Decision[]>('/decisions/');
export const getDeliverables = () => get<Deliverable[]>('/deliverables/');
export const getTasks        = () => get<Task[]>('/tasks/');
export const getActivities   = () => get<Activity[]>('/activities/');

/* ── 2. CREATE (POST) ────────────────────────────────────────────── */
export const createEpic        = (d: Omit<Epic, 'id'>)        => post<Epic>('/epics/', d);
export const createDecision    = (d: Omit<Decision, 'id'>)    => post<Decision>('/decisions/', d);
export const createDeliverable = (d: Omit<Deliverable, 'id'>) => post<Deliverable>('/deliverables/', d);
export const createTask        = (d: Omit<Task, 'id'>)        => post<Task>('/tasks/', d);
export const createActivity    = (d: Omit<Activity, 'id'>)    => post<Activity>('/activities/', d);

/* ── 3. GET by id ────────────────────────────────────────────────── */
export const getEpicById        = (id: number) => get<Epic>(`/epics/${id}`);
export const getDecisionById    = (id: number) => get<Decision>(`/decisions/${id}`);
export const getDeliverableById = (id: number) => get<Deliverable>(`/deliverables/${id}`);
export const getTaskById        = (id: number) => get<Task>(`/tasks/${id}`);
export const getActivityById    = (id: number) => get<Activity>(`/activities/${id}`);

/* ── 4. UPDATE (PUT) ─────────────────────────────────────────────── */
export const updateEpic        = (id: number, d: Partial<Omit<Epic, 'id'>>)        => put<Epic>(`/epics/${id}`, d);
export const updateDecision    = (id: number, d: Partial<Omit<Decision, 'id'>>)    => put<Decision>(`/decisions/${id}`, d);
export const updateDeliverable = (id: number, d: Partial<Omit<Deliverable, 'id'>>) => put<Deliverable>(`/deliverables/${id}`, d);
export const updateTask        = (id: number, d: Partial<Omit<Task, 'id'>>)        => put<Task>(`/tasks/${id}`, d);
export const updateActivity    = (id: number, d: Partial<Omit<Activity, 'id'>>)    => put<Activity>(`/activities/${id}`, d);

/* ── 5. DELETE ───────────────────────────────────────────────────── */
export const deleteEpic        = (id: number) => del(`/epics/${id}`);
export const deleteDecision    = (id: number) => del(`/decisions/${id}`);
export const deleteDeliverable = (id: number) => del(`/deliverables/${id}`);
export const deleteTask        = (id: number) => del(`/tasks/${id}`);
export const deleteActivity    = (id: number) => del(`/activities/${id}`);

/* ── 6. EXTRACT (LLM) ───────────────────────────────────────────── */
// LLM responses are unstructured — typed as the closest matching entity,
// but individual fields may be missing until verified.
export const extractEpics = (filepath: string) =>
  post<Partial<Epic>[]>(`/epics/extract?filepath=${encodeURIComponent(filepath)}`);

export const extractDecisions = (filepath: string) =>
  post<Partial<Decision>[]>(`/decisions/extract?filepath=${encodeURIComponent(filepath)}`);

export const extractDeliverables = (filepath: string) =>
  post<Partial<Deliverable>[]>(`/deliverables/extract?filepath=${encodeURIComponent(filepath)}`);

export const extractTasks = (filepath: string) =>
  post<Partial<Task>[]>(`/tasks/extract?filepath=${encodeURIComponent(filepath)}`);

export const extractActivities = (filepath: string) =>
  post<Partial<Activity>[]>(`/activities/extract?filepath=${encodeURIComponent(filepath)}`);

/* ── 7. UPLOAD DOCUMENT ─────────────────────────────────────────── */
export async function uploadDocument(file: File): Promise<{ filename: string; message: string }> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}/documents/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

/* ── 8. GET DOCUMENTS ────────────────────────────────────────────── */
export const getDocuments = () => get<string[]>('/documents/');

export const getDocumentByName = (filename: string) =>
  get<string>(`/documents/${encodeURIComponent(filename)}`);

/* ── 9. KANBAN ───────────────────────────────────────────────────── */
export interface KanbanUpdatePayload {
  id: number;
  title: string;
  type: string;
  kanban_status: string;
}

export interface KanbanUpdateResponse {
  id: number;
  title: string;
  type: string;
  kanban_status: string;
  [key: string]: unknown;
}

export async function updateKanbanCard(payload: KanbanUpdatePayload): Promise<KanbanUpdateResponse> {
  const res = await fetch(`${BASE}/kanban/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to update kanban card: ${res.status} ${text}`);
  }

  return res.json();
}