/*
 * Centralized API client.
 */

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
export const getEpics        = () => get<any[]>('/epics/');
export const getDecisions    = () => get<any[]>('/decisions/');
export const getDeliverables = () => get<any[]>('/deliverables/');
export const getTasks        = () => get<any[]>('/tasks/');
export const getActivities   = () => get<any[]>('/activities/');

/* ── 2. CREATE (POST) ────────────────────────────────────────────── */
export const createEpic        = (d: any) => post<any>('/epics/', d);
export const createDecision    = (d: any) => post<any>('/decisions/', d);
export const createDeliverable = (d: any) => post<any>('/deliverables/', d);
export const createTask        = (d: any) => post<any>('/tasks/', d);
export const createActivity    = (d: any) => post<any>('/activities/', d);

/* ── 3. GET by id ────────────────────────────────────────────────── */
export const getEpicById        = (id: number) => get<any>(`/epics/${id}`);
export const getDecisionById    = (id: number) => get<any>(`/decisions/${id}`);
export const getDeliverableById = (id: number) => get<any>(`/deliverables/${id}`);
export const getTaskById        = (id: number) => get<any>(`/tasks/${id}`);
export const getActivityById    = (id: number) => get<any>(`/activities/${id}`);

/* ── 4. UPDATE (PUT) ─────────────────────────────────────────────── */
export const updateEpic        = (id: number, d: any) => put<any>(`/epics/${id}`, d);
export const updateDecision    = (id: number, d: any) => put<any>(`/decisions/${id}`, d);
export const updateDeliverable = (id: number, d: any) => put<any>(`/deliverables/${id}`, d);
export const updateTask        = (id: number, d: any) => put<any>(`/tasks/${id}`, d);
export const updateActivity    = (id: number, d: any) => put<any>(`/activities/${id}`, d);

/* ── 5. DELETE ───────────────────────────────────────────────────── */
export const deleteEpic        = (id: number) => del(`/epics/${id}`);
export const deleteDecision    = (id: number) => del(`/decisions/${id}`);
export const deleteDeliverable = (id: number) => del(`/deliverables/${id}`);
export const deleteTask        = (id: number) => del(`/tasks/${id}`);
export const deleteActivity    = (id: number) => del(`/activities/${id}`);

/* ── 6. EXTRACT (LLM) ───────────────────────────────────────────── */
export const extractEpics = (filepath: string) =>
  post<any[]>(`/epics/extract?filepath=${encodeURIComponent(filepath)}`);

export const extractDecisions = (filepath: string) =>
  post<any[]>(`/decisions/extract?filepath=${encodeURIComponent(filepath)}`);

export const extractDeliverables = (filepath: string) =>
  post<any[]>(`/deliverables/extract?filepath=${encodeURIComponent(filepath)}`);

export const extractTasks = (filepath: string) =>
  post<any[]>(`/tasks/extract?filepath=${encodeURIComponent(filepath)}`);

export const extractActivities = (filepath: string) =>
  post<any[]>(`/activities/extract?filepath=${encodeURIComponent(filepath)}`);

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

/* ── 9. KANBAN ────────────────────────────────────────────── */
export async function updateKanbanCard(payload: {
  id: number;
  title: string;
  type: string;
  kanban_status: string;
}) {
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