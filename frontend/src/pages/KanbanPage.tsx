import React, { useCallback, useEffect, useState } from 'react';
import KanbanColumn from '../components/KanbanColumn';
import {
  getTasks, getActivities, getDecisions,
  updateTask, updateActivity, updateDecision,
  deleteTask, deleteActivity, deleteDecision,
} from '../api';
import type { KanbanItemFull, MetadataType } from '../types';

interface ColumnDef {
  id: string;
  title: string;
  statuses: string[];
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'backlog',     title: 'Backlog',     statuses: ['backlog'] },
  { id: 'open',        title: 'Open',        statuses: ['open'] },
  { id: 'in-progress', title: 'In Progress', statuses: ['in progress', 'in-progress'] },
  { id: 'closed',      title: 'Closed',      statuses: ['closed', 'done'] },
];

const KanbanPage: React.FC = () => {
  const [allItems, setAllItems]       = useState<KanbanItemFull[]>([]);
  const [columns, setColumns]         = useState<ColumnDef[]>(DEFAULT_COLUMNS);
  const [showBacklog, setShowBacklog] = useState(false);
  const [loading, setLoading]         = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    // #TODO: when a dedicated GET /kanban/ endpoint exists, replace this
    Promise.all([
      getTasks().catch(() => []),
      getActivities().catch(() => []),
      getDecisions().catch(() => []),
    ]).then(([tasks, activities, decisions]) => {
      const items: KanbanItemFull[] = [
        ...tasks.map((t: any) => ({
          id: t.id, title: t.name, owner: t.owner,
          type: 'task' as MetadataType,
          status: (t.status ?? 'open').toLowerCase(),
          description: t.description,
          extraDetails: t.target_date ? [{ label: 'Target Date', value: t.target_date, key: 'target_date' }] : [],
          raw: t,
        })),
        ...activities.map((a: any) => ({
          id: a.id, title: a.name, owner: a.owner,
          type: 'activity' as MetadataType,
          status: (a.status ?? 'open').toLowerCase(),
          description: a.description,
          extraDetails: [],
          raw: a,
        })),
        ...decisions.map((d: any) => ({
          id: d.id, title: d.title, owner: d.owner,
          type: 'decision' as MetadataType,
          status: 'open',
          description: d.description,
          nature: d.nature, reach: d.reach, alternatives: d.alternatives,
          extraDetails: d.deadline ? [{ label: 'Deadline', value: d.deadline, key: 'deadline' }] : [],
          raw: d,
        })),
      ];
      setAllItems(items);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const itemsForColumn = (col: ColumnDef): KanbanItemFull[] =>
    allItems.filter((i) => col.statuses.includes(i.status));

  const renameColumn = (colId: string, newTitle: string) => {
    setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, title: newTitle } : c)));
  };

  const handleSaveItem = async (item: KanbanItemFull, changes: Record<string, string>) => {
    try {
      switch (item.type) {
        case 'task':     await updateTask(item.id, changes); break;
        case 'activity': await updateActivity(item.id, changes); break;
        case 'decision': await updateDecision(item.id, changes); break;
        // #TODO: add other types when endpoints are ready
      }
      loadData();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleDeleteItem = async (item: KanbanItemFull) => {
    try {
      switch (item.type) {
        case 'task':     await deleteTask(item.id); break;
        case 'activity': await deleteActivity(item.id); break;
        case 'decision': await deleteDecision(item.id); break;
        // #TODO: add other types when endpoints are ready
      }
      loadData();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const visibleColumns = showBacklog ? columns : columns.filter((c) => c.id !== 'backlog');

  return (
    <section aria-labelledby="kanban-heading">
      <h1 id="kanban-heading" className="page-title">Kanban Board</h1>

      <div className="kanban-toolbar">
        <label className="kanban-toggle" title="Toggle backlog column visibility">
          <input
            type="checkbox"
            checked={showBacklog}
            onChange={(e) => setShowBacklog(e.target.checked)}
            aria-label="Show backlog column"
          />
          Show Backlog
        </label>
      </div>

      {loading ? (
        <div className="empty-state" role="status" aria-label="Loading kanban board">Loading…</div>
      ) : (
        <div className="kanban" role="region" aria-label="Kanban board">
          {visibleColumns.map((col) => (
            <KanbanColumn
              key={col.id}
              title={col.title}
              items={itemsForColumn(col)}
              onTitleChange={(newTitle) => renameColumn(col.id, newTitle)}
              onSaveItem={handleSaveItem}
              onDeleteItem={handleDeleteItem}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default KanbanPage;