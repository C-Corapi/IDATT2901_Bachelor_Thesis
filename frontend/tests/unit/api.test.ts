import {
  getEpics, getDecisions, getDeliverables, getTasks, getActivities,
  createEpic, createDecision, createDeliverable, createTask, createActivity,
  getEpicById, getDecisionById, getDeliverableById, getTaskById, getActivityById,
  updateEpic, updateDecision, updateDeliverable, updateTask, updateActivity,
  deleteEpic, deleteDecision, deleteDeliverable, deleteTask, deleteActivity,
  extractEpics, extractDecisions, extractDeliverables, extractTasks, extractActivities,
  uploadDocument,
  getDocuments, getDocumentByName,
  updateKanbanCard
} from '../../src/api';

import { vi, it, describe, expect, afterEach } from 'vitest';

// Helpers to mock fetch
function mockFetch(response: unknown, ok = true, status = 200) {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => typeof response === "string" ? response : JSON.stringify(response),
  } as any);
}

function mockFetchReject(status = 500, statusText = "error") {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: false,
    status,
    text: async () => statusText,
  } as any);
}

describe('API client', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });


  // 1. Testing GET (all)
  // Epics
  it('should fetch for successful getEpics', async () => {
    mockFetch([{ id: 1, name: "epic1" }]);
    expect(await getEpics()).toEqual([{ id: 1, name: "epic1" }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/epics\//));
  });

  it('should throw for failed getEpics', async () => {
    mockFetchReject(404);
    await expect(getEpics()).rejects.toThrow(/GET \/epics\//);
  });

  // Decisions
  it('should fetch for successful getDecisions', async () => {
    mockFetch([{ id: 1, name: "decision1" }]);
    expect(await getDecisions()).toEqual([{ id: 1, name: "decision1" }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/decisions\//));
  });

  it('should throw for failed getDecisions', async () => {
    mockFetchReject(404);
    await expect(getDecisions()).rejects.toThrow(/GET \/decisions\//);
  });

  // Deliverables
  it('should fetch for successful getDeliverables', async () => {
    mockFetch([{ id: 1, name: "deliverable1" }]);
    expect(await getDeliverables()).toEqual([{ id: 1, name: "deliverable1" }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/deliverables\//));
  });

  it('should throw for failed getDeliverables', async () => {
    mockFetchReject(404);
    await expect(getDeliverables()).rejects.toThrow(/GET \/deliverables\//);
  });

  // Activities
  it('should fetch for successful getActivities', async () => {
    mockFetch([{ id: 1, name: "activity1" }]);
    expect(await getActivities()).toEqual([{ id: 1, name: "activity1" }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/activities\//));
  });

  it('should throw for failed getActivities', async () => {
    mockFetchReject(404);
    await expect(getActivities()).rejects.toThrow(/GET \/activities\//);
  });

  // Tasks
  it('should fetch for successful getTasks', async () => {
    mockFetch([{ id: 1, name: "task1" }]);
    expect(await getTasks()).toEqual([{ id: 1, name: "task1" }]);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/tasks\//));
  });

  it('should throw for failed getTasks', async () => {
    mockFetchReject(404);
    await expect(getTasks()).rejects.toThrow(/GET \/tasks\//);
  });

  // 2. Testing POST (create)
  //Epics
  it('should POST to createEpic and return result', async () => {
    const input = { name: 'epic2' }, output = { id: 2, name: 'epic2' };
    mockFetch(output);
    expect(await createEpic(input)).toEqual(output);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/epics\//), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(input),
    }));
  });

  it('should throw for failed createEpic', async () => {
    mockFetchReject(400);
    await expect(createEpic({})).rejects.toThrow(/POST \/epics\//);
  });

  // Decisions
  it('should POST to createDecision', async () => {
    const input = { name: 'decision1' }, output = { id: 2, name: 'decision2' };
    mockFetch(output);
    expect(await createDecision(input)).toEqual(output);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/decisions\//), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(input),
    }));
  });

  it('should throw for failed createDecision', async () => {
    mockFetchReject(400);
    await expect(createDecision({})).rejects.toThrow(/POST \/decisions\//);
  });

  // Deliverables
  it('should POST to createDeliverable', async () => {
    const input = { name: 'deliverable2' }, output = { id: 2, name: 'deliverable2' };
    mockFetch(output);
    expect(await createDeliverable(input)).toEqual(output);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/deliverables\//), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(input),
    }));
  });

  it('should throw for failed createDeliverable', async () => {
    mockFetchReject(400);
    await expect(createDeliverable({})).rejects.toThrow(/POST \/deliverables\//);
  });

  // Activities
  it('should POST to createActivity and return result', async () => {
    const input = { name: 'activity2' }, output = { id: 2, name: 'activity2' };
    mockFetch(output);
    expect(await createActivity(input)).toEqual(output);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/activities\//), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(input),
    }));
  });

  it('should throw for failed createActivity', async () => {
    mockFetchReject(429);
    await expect(createActivity({})).rejects.toThrow(/POST \/activities\//);
  });

  // Tasks
  it('should POST to createTask and return result', async () => {
    const input = { name: 'task2' }, output = { id: 2, name: 'task2' };
    mockFetch(output);
    expect(await createTask(input)).toEqual(output);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/tasks\//), expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(input),
    }));
  });

  it('should throw for failed createTask', async () => {
    mockFetchReject(403);
    await expect(createTask({})).rejects.toThrow(/POST \/tasks\//);
  });


  // 3. Testing GET by id
  // Epics
  it('should fetch an epic by id', async () => {
    mockFetch({ id: 3, name: 'epic3' });
    expect(await getEpicById(3)).toEqual({ id: 3, name: 'epic3' });
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/epics\/3/));
  });

  it('should throw for not found epic by id', async () => {
    mockFetchReject(404);
    await expect(getEpicById(404)).rejects.toThrow(/GET \/epics\/404/);
  });

  // Decisions
  it('should fetch a decision by id', async () => {
    mockFetch({ id: 3, name: 'decision3' });
    expect(await getDecisionById(3)).toEqual({ id: 3, name: 'decision3' });
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/decisions\/3/));
  });

  it('should throw for not found decision by id', async () => {
    mockFetchReject(404);
    await expect(getDecisionById(404)).rejects.toThrow(/GET \/decisions\/404/);
  });

  // Deliverables
  it('should fetch a deliverable by id', async () => {
    mockFetch({ id: 3, name: 'deliverable3' });
    expect(await getDeliverableById(3)).toEqual({ id: 3, name: 'deliverable3' });
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/deliverables\/3/));
  });

  it('should throw for not found decision by id', async () => {
    mockFetchReject(404);
    await expect(getDeliverableById(404)).rejects.toThrow(/GET \/deliverables\/404/);
  });

  // Activities
  it('should fetch an activity by id', async () => {
    mockFetch({ id: 3, name: 'activity3' });
    expect(await getActivityById(3)).toEqual({ id: 3, name: 'activity3' });
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/activities\/3/));
  });

  it('should throw for not found activity by id', async () => {
    mockFetchReject(404);
    await expect(getActivityById(404)).rejects.toThrow(/GET \/activities\/404/);
  });

  // Tasks
  it('should fetch a task by id', async () => {
    mockFetch({ id: 3, name: 'task3' });
    expect(await getTaskById(3)).toEqual({ id: 3, name: 'task3' });
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/tasks\/3/));
  });

  it('should throw for not found task by id', async () => {
    mockFetchReject(404);
    await expect(getTaskById(999)).rejects.toThrow(/GET \/tasks\/999/);
  });

  // 4. Testing PUT (update)
  // Epics
  it('should update an epic with updateEpic', async () => {
    const updateData = { update: "data4" };
    mockFetch({ id: 4, update: "data4" });
    expect(await updateEpic(4, updateData)).toEqual({ id: 4, update: "data4" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/epics\/4/),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(updateData) }),
    );
  });

  it('should throw for failed updateEpic', async () => {
    mockFetchReject(500);
    await expect(updateEpic(4, { updateData: "data4" })).rejects.toThrow(/PUT \/epics\/4/);
  });

  // Decisions
  it('should update a decision with updateDecision', async () => {
    const updateData = { update: "data4" };
    mockFetch({ id: 4, update: "data4" });
    expect(await updateDecision(4, updateData)).toEqual({ id: 4, update: "data4" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/decisions\/4/),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(updateData) }),
    );
  });

  it('should throw for failed updateDecision', async () => {
    mockFetchReject(500);
    await expect(updateDecision(4, { updateData: "data4" })).rejects.toThrow(/PUT \/decisions\/4/);
  });

  // Deliverables
  it('should update a deliverable with updateDeliverable', async () => {
    const updateData = { update: "data4" };
    mockFetch({ id: 4, update: "data4" });
    expect(await updateDeliverable(4, updateData)).toEqual({ id: 4, update: "data4" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/deliverables\/4/),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(updateData) }),
    );
  });

  it('should throw for failed updateDeliverable', async () => {
    mockFetchReject(500);
    await expect(updateDeliverable(4, { updateData: "data4" })).rejects.toThrow(/PUT \/deliverables\/4/);
  });

  // Activities
  it('should update an activity with updateActivity', async () => {
    const updateData = { update: "data4" };
    mockFetch({ id: 4, update: "data4" });
    expect(await updateActivity(4, updateData)).toEqual({ id: 4, update: "data4" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/activities\/4/),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(updateData) }),
    );
  });

  it('should throw for failed updateActivity', async () => {
    mockFetchReject(500);
    await expect(updateActivity(4, { updateData: "data4" })).rejects.toThrow(/PUT \/activities\/4/);
  });

  // Tasks
  it('should update a task with updateTask', async () => {
    const updateData = { update: "data4" };
    mockFetch({ id: 4, update: "data4" });
    expect(await updateTask(4, updateData)).toEqual({ id: 4, update: "data4" });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/tasks\/4/),
      expect.objectContaining({ method: 'PUT', body: JSON.stringify(updateData) }),
    );
  });

  it('should throw for failed updateTasks', async () => {
    mockFetchReject(500);
    await expect(updateTask(4, { updateData: "data4" })).rejects.toThrow(/PUT \/tasks\/4/);
  });

  // 5. Testing DELETE
  // Epics
  it('should DELETE an epic', async () => {
    mockFetch(undefined);
    await expect(deleteEpic(5)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/epics\/5/), expect.objectContaining({ method: 'DELETE' }));
  });

  it('should throw for failed deleteEpic', async () => {
    mockFetchReject(404);
    await expect(deleteEpic(5)).rejects.toThrow(/DELETE \/epics\/5/);
  });

  // Decisions
  it('should DELETE a decision', async () => {
    mockFetch(undefined);
    await expect(deleteDecision(5)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/decisions\/5/), expect.objectContaining({ method: 'DELETE' }));
  });

  it('should throw for failed deleteDecision', async () => {
    mockFetchReject(404);
    await expect(deleteDecision(5)).rejects.toThrow(/DELETE \/decisions\/5/);
  });

  //Deliverables
  it('should DELETE a deliverable', async () => {
    mockFetch(undefined);
    await expect(deleteDeliverable(5)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/deliverables\/5/), expect.objectContaining({ method: 'DELETE' }));
  });

  it('should throw for failed deleteEpic', async () => {
    mockFetchReject(404);
    await expect(deleteDeliverable(5)).rejects.toThrow(/DELETE \/deliverables\/5/);
  });

  // Activities
    it('should DELETE an activity', async () => {
    mockFetch(undefined);
    await expect(deleteActivity(5)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/activities\/5/), expect.objectContaining({ method: 'DELETE' }));
  });

  it('should throw for failed deleteActivity', async () => {
    mockFetchReject(404);
    await expect(deleteActivity(5)).rejects.toThrow(/DELETE \/activities\/5/);
  });

  // Tasks
    it('should DELETE a task', async () => {
    mockFetch(undefined);
    await expect(deleteTask(5)).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/tasks\/5/), expect.objectContaining({ method: 'DELETE' }));
  });

  it('should throw for failed deleteTask', async () => {
    mockFetchReject(404);
    await expect(deleteTask(5)).rejects.toThrow(/DELETE \/tasks\/5/);
  });


  // 6. Testing EXTRACT (LLM POST)
  it('should POST to extractEpics with filepath', async () => {
    const epics = [{ id: 1, name: "e" }];
    mockFetch(epics);
    const result = await extractEpics("file.yaml");
    expect(result).toBe(epics);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/epics\/extract\?filepath=file.yaml/), expect.objectContaining({method: 'POST'}));
  });

  it('should handle filepaths with special characters in extractEpics', async () => {
    const epics = [{ id: 2 }];
    mockFetch(epics);
    await extractEpics("a b/ç&e$.yaml");
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/filepath=a%20b%2F%C3%A7%26e%24.yaml/),
      expect.anything()
    );
  });

  it('should throw on failed extractEpics', async () => {
    mockFetchReject(500);
    await expect(extractEpics("file.yaml")).rejects.toThrow();
  });

  // 7. Testing UPLOAD DOCUMENT
  it('should upload a document via uploadDocument', async () => {
    const mockFile = new File(['newDoc'], 'newDoc.txt', { type: 'text/plain' });
    const resp = { filename: 'newDoc.txt', message: 'success' };
    mockFetch(resp);
    const result = await uploadDocument(mockFile);
    expect(result).toEqual(resp);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/documents/upload'), expect.objectContaining({ method: 'POST' }));
  });

  it('should throw on failed uploadDocument', async () => {
    const mockFile = new File(['newDoc'], 'newDoc.txt', { type: 'text/plain' });
    mockFetchReject(413, "Too large");
    await expect(uploadDocument(mockFile)).rejects.toThrow(/Upload failed: 413/);
  });

  // 8. Testing GET DOCUMENTS
  it('should get all documents', async () => {
    mockFetch(["a.pdf", "b.docx"]);
    const result = await getDocuments();
    expect(result).toEqual(["a.pdf", "b.docx"]);
    expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/documents\//));
  });

  // 9. Testing retrieval of Document by name (URL encode edge case)
  it('should get a document by name, url encoded', async () => {
    const file = "a b&c.doc";
    mockFetch("CONTENT");
    await getDocumentByName(file);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/documents\/a%20b%26c.doc/)
    );
  });

  // 10. Testing KANBAN update
  it('should update a Kanban card', async () => {
    const card = { id: 1, title: "a", type: "task", kanban_status: "todo" };
    const ret = { ...card, ok: true };
    mockFetch(ret);
    const result = await updateKanbanCard(card);
    expect(result).toEqual(ret);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/kanban\/update/),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(card) })
    );
  });

  it('should throw if Kanban update response not ok', async () => {
    mockFetchReject(400, "ohno");
    await expect(updateKanbanCard({ id: 2, title: '', type: '', kanban_status: '' })).rejects.toThrow(/Failed to update kanban card: 400 ohno/);
  });
});