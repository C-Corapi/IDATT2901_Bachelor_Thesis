/*
 * Centralized API client.
 *
 * Existing backend endpoints (main + BT-147):
 *   GET  /epics/                          → all epics
 *   POST /epics/                          → create epic
 *   POST /epics/extract?filepath=...      → extract epics from file
 *   GET  /decisions/                      → all decisions
 *   POST /decisions/extract?filepath=...  → extract decisions from file
 *   GET  /deliverables/                   → all deliverables
 *   GET  /tasks/                          → all tasks
 *   GET  /activities/                     → all activities
 */

const BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

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

/* ── 1. GET all ──────────────────────────────────────────────────── */
export const getEpics        = () => get<any[]>('/epics/');
export const getDecisions    = () => get<any[]>('/decisions/');
export const getDeliverables = () => get<any[]>('/deliverables/');
export const getTasks        = () => get<any[]>('/tasks/');
export const getActivities   = () => get<any[]>('/activities/');

/* ── 2. GET by id ────────────────────────────────────────────────── */
// #TODO: add GET /epics/{id} when ready
export const getEpicById        = (id: number) => get<any>(`/epics/${id}`);
// #TODO: add GET /decisions/{id} when ready
export const getDecisionById    = (id: number) => get<any>(`/decisions/${id}`);
// #TODO: add GET /deliverables/{id} when ready
export const getDeliverableById = (id: number) => get<any>(`/deliverables/${id}`);
// #TODO: add GET /tasks/{id} when ready
export const getTaskById        = (id: number) => get<any>(`/tasks/${id}`);
// #TODO: add GET /activities/{id} when ready
export const getActivityById    = (id: number) => get<any>(`/activities/${id}`);

/* ── 3. UPDATE ───────────────────────────────────────────────────── */
// #TODO: add PUT /epics/{id} when ready
export const updateEpic        = (id: number, d: any) => put<any>(`/epics/${id}`, d);
// #TODO: add PUT /decisions/{id} when ready
export const updateDecision    = (id: number, d: any) => put<any>(`/decisions/${id}`, d);
// #TODO: add PUT /deliverables/{id} when ready
export const updateDeliverable = (id: number, d: any) => put<any>(`/deliverables/${id}`, d);
// #TODO: add PUT /tasks/{id} when ready
export const updateTask        = (id: number, d: any) => put<any>(`/tasks/${id}`, d);
// #TODO: add PUT /activities/{id} when ready
export const updateActivity    = (id: number, d: any) => put<any>(`/activities/${id}`, d);

/* ── 4. DELETE ───────────────────────────────────────────────────── */
// #TODO: add DELETE /epics/{id} when ready
export const deleteEpic        = (id: number) => del(`/epics/${id}`);
// #TODO: add DELETE /decisions/{id} when ready
export const deleteDecision    = (id: number) => del(`/decisions/${id}`);
// #TODO: add DELETE /deliverables/{id} when ready
export const deleteDeliverable = (id: number) => del(`/deliverables/${id}`);
// #TODO: add DELETE /tasks/{id} when ready
export const deleteTask        = (id: number) => del(`/tasks/${id}`);
// #TODO: add DELETE /activities/{id} when ready
export const deleteActivity    = (id: number) => del(`/activities/${id}`);

/* ── 5. EXTRACT (LLM) ───────────────────────────────────────────── */
export const extractEpics        = (fp: string) => post<any[]>(`/epics/extract?filepath=${encodeURIComponent(fp)}`);
export const extractDecisions    = (fp: string) => post<any[]>(`/decisions/extract?filepath=${encodeURIComponent(fp)}`);
// #TODO: add POST /deliverables/extract when ready
export const extractDeliverables = (fp: string) => post<any[]>(`/deliverables/extract?filepath=${encodeURIComponent(fp)}`);
// #TODO: add POST /tasks/extract when ready
export const extractTasks        = (fp: string) => post<any[]>(`/tasks/extract?filepath=${encodeURIComponent(fp)}`);
// #TODO: add POST /activities/extract when ready
export const extractActivities   = (fp: string) => post<any[]>(`/activities/extract?filepath=${encodeURIComponent(fp)}`);

/* ── 6. UPLOAD DOCUMENT ─────────────────────────────────────────── */
// #TODO: add POST /documents/upload (multipart) when ready
export async function uploadDocument(file: File, metadataType: string): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  form.append('metadata_type', metadataType);
  const res = await fetch(`${BASE}/documents/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

/* ── 7. GET DOCUMENTS ────────────────────────────────────────────── */
// #TODO: add GET /documents/ when ready
export const getDocuments = () => get<any[]>('/documents/');