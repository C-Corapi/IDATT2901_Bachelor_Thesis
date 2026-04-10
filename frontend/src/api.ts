/*
 * Centralized API client.
 *
 * Backend endpoints (main branch)
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

/* ── 1. GET all ────────────────────────────────────────��─────────── */
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
export const extractEpics        = (fp: string) => post<any[]>(`/epics/extract?filepath=${encodeURIComponent(fp)}`);
export const extractDecisions    = (fp: string) => post<any[]>(`/decisions/extract?filepath=${encodeURIComponent(fp)}`);
export const extractDeliverables = (fp: string) => post<any[]>(`/deliverables/extract?filepath=${encodeURIComponent(fp)}`);
export const extractTasks        = (fp: string) => post<any[]>(`/tasks/extract?filepath=${encodeURIComponent(fp)}`);
export const extractActivities   = (fp: string) => post<any[]>(`/activities/extract?filepath=${encodeURIComponent(fp)}`);

/* ── 7. UPLOAD DOCUMENT ─────────────────────────────────────────── */
// #TODO: add POST /documents/upload (multipart) when ready
export async function uploadDocument(file: File, metadataType: string): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  form.append('metadata_type', metadataType);
  const res = await fetch(`${BASE}/documents/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

/* ── 8. GET DOCUMENTS ────────────────────────────────────────────── */
// #TODO: add GET /documents/ when ready
export const getDocuments = () => get<any[]>('/documents/');