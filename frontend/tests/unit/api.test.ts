import * as api from '../../src/api';
import { vi, it, describe, expect, afterEach } from 'vitest';

// Mock fetch helper
function mockFetch(response: unknown, ok = true, status = 200) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => response,
    text: async () => (typeof response === 'string' ? response : JSON.stringify(response)),
  }) as any);
}

function mockFetchReject(status = 500, statusText = 'error') {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status,
    text: async () => statusText,
  }) as any);
}

const fetch_ = () => globalThis.fetch as ReturnType<typeof vi.fn>;

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

describe('API', () => {
  describe('exports', () => {
    it('exports all functions', () => {
      expect(api.getEpics).toBeDefined();
      expect(api.createEpic).toBeDefined();
      expect(api.updateEpic).toBeDefined();
      expect(api.deleteEpic).toBeDefined();
      expect(api.extractEpics).toBeDefined();
      expect(api.uploadDocument).toBeDefined();
      expect(api.getDocuments).toBeDefined();
      expect(api.updateKanbanCard).toBeDefined();
      expect(api.convertMetadataType).toBeDefined();
    });
  });

  describe('GET operations', () => {
    it('fetches epics successfully', async () => {
      mockFetch([{ id: 1, name: 'epic1' }]);
      const result = await api.getEpics();
      expect(result).toEqual([{ id: 1, name: 'epic1' }]);
      expect(fetch_()).toHaveBeenCalledWith(expect.stringMatching(/\/epics\//));
    });

    it('throws on failed GET', async () => {
      mockFetchReject(404);
      await expect(api.getEpics()).rejects.toThrow(/GET \/epics\//);
    });

    it('fetches single item by id', async () => {
      mockFetch({ id: 3, name: 'epic3' });
      const result = await api.getEpicById(3);
      expect(result).toEqual({ id: 3, name: 'epic3' });
      expect(fetch_()).toHaveBeenCalledWith(expect.stringMatching(/\/epics\/3/));
    });

    it('throws when item not found by id', async () => {
      mockFetchReject(404);
      await expect(api.getEpicById(404)).rejects.toThrow(/GET \/epics\/404/);
    });
  });

  describe('POST operations (create)', () => {
    it('creates epic successfully', async () => {
      const input = { title: 'epic2' };
      mockFetch({ id: 2, title: 'epic2' });
      const result = await api.createEpic(input);
      expect(result).toEqual({ id: 2, title: 'epic2' });
      expect(fetch_()).toHaveBeenCalledWith(
        expect.stringMatching(/\/epics\//),
        expect.objectContaining({ method: 'POST', body: JSON.stringify(input) })
      );
    });

    it('throws on failed POST', async () => {
      mockFetchReject(400);
      await expect(api.createEpic({ title: 'Test Epic' })).rejects.toThrow(/POST \/epics\//);
    });
  });

  describe('PUT operations (update)', () => {
    it('updates epic successfully', async () => {
      const data = { title: 'updated' };
      mockFetch({ id: 1, title: 'updated' });
      const result = await api.updateEpic(1, data);
      expect(result).toEqual({ id: 1, title: 'updated' });
      expect(fetch_()).toHaveBeenCalledWith(
        expect.stringMatching(/\/epics\/1/),
        expect.objectContaining({ method: 'PUT', body: JSON.stringify(data) })
      );
    });

    it('throws on failed PUT', async () => {
      mockFetchReject(500);
      await expect(api.updateEpic(1, {})).rejects.toThrow(/PUT \/epics\/1/);
    });
  });

  describe('DELETE operations', () => {
    it('deletes epic successfully', async () => {
      mockFetch(undefined);
      await expect(api.deleteEpic(1)).resolves.toBeUndefined();
      expect(fetch_()).toHaveBeenCalledWith(
        expect.stringMatching(/\/epics\/1/),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('throws on failed DELETE', async () => {
      mockFetchReject(404);
      await expect(api.deleteEpic(1)).rejects.toThrow(/DELETE \/epics\/1/);
    });
  });

  describe('Extract operations', () => {
    it('extracts epics with filepath', async () => {
      const result = [{ id: 1 }];
      mockFetch(result);
      const output = await api.extractEpics('file.txt');
      expect(output).toEqual(result);
      expect(fetch_()).toHaveBeenCalledWith(
        expect.stringMatching(/\/epics\/extract\?filepath=file.txt/),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('encodes filepath with special characters', async () => {
      mockFetch([]);
      await api.extractEpics('a b&c.txt');
      expect(fetch_()).toHaveBeenCalledWith(
        expect.stringMatching(/filepath=a%20b%26c.txt/),
        expect.anything()
      );
    });

    it('throws on failed extract', async () => {
      mockFetchReject(500);
      await expect(api.extractEpics('file.txt')).rejects.toThrow();
    });
  });

  describe('Document operations', () => {
    it('uploads document successfully', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      mockFetch({ filename: 'test.txt', message: 'ok' });
      const result = await api.uploadDocument(file);
      expect(result.filename).toBe('test.txt');
      expect(fetch_()).toHaveBeenCalledWith(
        expect.stringContaining('/documents/upload'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws on failed upload', async () => {
      const file = new File(['content'], 'test.txt');
      mockFetchReject(413, 'Too large');
      await expect(api.uploadDocument(file)).rejects.toThrow(/Upload failed: 413/);
    });

    it('gets all documents', async () => {
      mockFetch(['doc1.txt', 'doc2.docx']);
      const result = await api.getDocuments();
      expect(result).toEqual(['doc1.txt', 'doc2.docx']);
    });

    it('gets document by name with URL encoding', async () => {
      mockFetch('content');
      await api.getDocumentByName('a b&c.doc');
      expect(fetch_()).toHaveBeenCalledWith(
        expect.stringMatching(/\/documents\/a%20b%26c.doc/)
      );
    });

    it('throws when document not found', async () => {
      mockFetchReject(404);
      await expect(api.getDocumentByName('missing.pdf')).rejects.toThrow(/GET \/documents\//);
    });
  });

  describe('Kanban operations', () => {
    it('updates kanban card successfully', async () => {
      const card = { id: 1, title: 'task', type: 'Task', kanban_status: 'done' };
      mockFetch({ ...card, ok: true });
      const result = await api.updateKanbanCard(card);
      expect(result.ok).toBe(true);
      expect(fetch_()).toHaveBeenCalledWith(
        expect.stringMatching(/\/kanban\/update/),
        expect.objectContaining({ method: 'POST', body: JSON.stringify(card) })
      );
    });

    it('throws on failed kanban update', async () => {
      mockFetchReject(400, 'Invalid card');
      await expect(
        api.updateKanbanCard({ id: 1, title: 'x', type: 'Epic', kanban_status: 'todo' })
      ).rejects.toThrow(/Failed to update kanban card: 400 Invalid card/);
    });
  });

  describe('Metadata type conversion', () => {
    it('converts metadata type successfully', async () => {
      mockFetch({ id: 1, type: 'task' });
      const result = await api.convertMetadataType('epic', 1, 'task', {});
      expect(result.type).toBe('task');
      expect(fetch_()).toHaveBeenCalledWith(
        expect.stringMatching(/\/convert\/epic\/1\/task/),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws on failed conversion', async () => {
      mockFetchReject(400);
      await expect(api.convertMetadataType('epic', 1, 'task', {})).rejects.toThrow();
    });
  });

describe('All metadata types (coverage)', () => {
  const types = [
    {
      name: 'Decision',
      create: api.createDecision,
      get: api.getDecisions,
      getById: api.getDecisionById,
      update: api.updateDecision,
      delete: api.deleteDecision,
      extract: api.extractDecisions,
    },
    {
      name: 'Deliverable',
      create: api.createDeliverable,
      get: api.getDeliverables,
      getById: api.getDeliverableById,
      update: api.updateDeliverable,
      delete: api.deleteDeliverable,
      extract: api.extractDeliverables,
    },
    {
      name: 'Task',
      create: api.createTask,
      get: api.getTasks,
      getById: api.getTaskById,
      update: api.updateTask,
      delete: api.deleteTask,
      extract: api.extractTasks,
    },
    {
      name: 'Activity',
      create: api.createActivity,
      get: api.getActivities,
      getById: api.getActivityById,
      update: api.updateActivity,
      delete: api.deleteActivity,
      extract: api.extractActivities,
    },
  ];

  types.forEach(({ name, create, get, getById, update, delete: del, extract }) => {
    it(`${name}: GET all works`, async () => {
      mockFetch([]);
      await get();
      expect(fetch_()).toHaveBeenCalled();
    });

    it(`${name}: CREATE works`, async () => {
      mockFetch({ id: 1 });
      await create({ name: 'test' } as any);
      expect(fetch_()).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: 'POST' }));
    });

    it(`${name}: GET by id works`, async () => {
      mockFetch({ id: 1 });
      await getById(1);
      expect(fetch_()).toHaveBeenCalledWith(expect.stringMatching(/\/1/));
    });

    it(`${name}: UPDATE works`, async () => {
      mockFetch({ id: 1 });
      await update(1, { name: 'updated' } as any);
      expect(fetch_()).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: 'PUT' }));
    });

    it(`${name}: DELETE works`, async () => {
      mockFetch(undefined);
      await del(1);
      expect(fetch_()).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: 'DELETE' }));
    });

    it(`${name}: EXTRACT works`, async () => {
      mockFetch([]);
      await extract('file.txt');
      expect(fetch_()).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ method: 'POST' }));
    });
  });
});
});