import React, { useCallback, useEffect, useState } from 'react';
import KanbanColumn from '../components/KanbanColumn';
import {
  getEpics, getDeliverables, getTasks, getActivities, getDecisions,
  updateEpic, updateDeliverable, updateTask, updateActivity, updateDecision,
  deleteEpic, deleteDeliverable, deleteTask, deleteActivity, deleteDecision,
  updateKanbanCard,
} from '../api';
import type { KanbanItemFull, MetadataType } from '../types';

interface ColumnDef {
  id: string;
  title: string;
  statuses: string[];
}

const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'backlog', title: 'Backlog', statuses: ['backlog'] },
  { id: 'todo', title: 'To Do', statuses: ['todo'] },
  { id: 'in_progress', title: 'In Progress', statuses: ['in_progress'] },
  { id: 'done', title: 'Done', statuses: ['done'] },
];

const KanbanPage: React.FC = () => {
  const [allItems, setAllItems] = useState<KanbanItemFull[]>([]);
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);
  const [showBacklog, setShowBacklog] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      getEpics().catch(() => []),
      getDeliverables().catch(() => []),
      getTasks().catch(() => []),
      getActivities().catch(() => []),
      getDecisions().catch(() => []),
    ]).then(([epics, deliverables, tasks, activities, decisions]) => {
      const items: KanbanItemFull[] = [
        ...epics.map((e: any) => ({
          id: e.id, title: e.title, owner: e.owner,
          type: 'epic' as MetadataType,
          status: (e.kanban_status ?? 'backlog').toLowerCase(),
          description: e.description,
          extraDetails: [
            ...(e.classification ? [{ label: 'Classification', value: e.classification, key: 'classification' }] : []),
            ...(e.scope          ? [{ label: 'Scope',          value: e.scope,          key: 'scope' }] : []),
            ...(e.use_case       ? [{ label: 'Use Case',       value: e.use_case,       key: 'use_case' }] : []),
            ...(e.user_story     ? [{ label: 'User Story',     value: e.user_story,     key: 'user_story' }] : []),
          ],
          raw: e,
        })),
        ...deliverables.map((d: any) => ({
          id: d.id, title: d.title, owner: d.owner,
          type: 'deliverable' as MetadataType,
          status: (d.kanban_status ?? 'backlog').toLowerCase(),
          description: d.description,
          nature: d.nature, reach: d.reach, alternatives: d.alternatives,
          extraDetails: d.deadline ? [{ label: 'Deadline', value: d.deadline, key: 'deadline' }] : [],
          raw: d,
        })),
        ...tasks.map((t: any) => ({
          id: t.id, title: t.title, owner: t.owner,
          type: 'task' as MetadataType,
          status: (t.kanban_status ?? 'backlog').toLowerCase(),
          description: t.description,
          extraDetails: t.target_date ? [{ label: 'Target Date', value: t.target_date, key: 'target_date' }] : [],
          raw: t,
        })),
        ...activities.map((a: any) => ({
          id: a.id, title: a.title, owner: a.owner,
          type: 'activity' as MetadataType,
          status: (a.kanban_status ?? 'backlog').toLowerCase(),
          description: a.description,
          extraDetails: [],
          raw: a,
        })),
        ...decisions.map((d: any) => ({
          id: d.id, title: d.title, owner: d.owner,
          type: 'decision' as MetadataType,
          status: (d.kanban_status ?? 'backlog').toLowerCase(),
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

   useEffect(() => {
    loadData();
  }, [loadData]);

  const itemsForColumn = (col: ColumnDef): KanbanItemFull[] =>
    allItems.filter((i) => i.status && col.statuses.includes(i.status));

  const renameColumn = (colId: string, newTitle: string) => {
    setColumns((prev) => prev.map((c) => (c.id === colId ? { ...c, title: newTitle } : c)));
  };

  const handleSaveItem = async (item: KanbanItemFull, changes: Record<string, string>) => {
    try {
      switch (item.type) {
        case 'epic':        await updateEpic(item.id, changes); break;
        case 'deliverable': await updateDeliverable(item.id, changes); break;
        case 'task':        await updateTask(item.id, changes); break;
        case 'activity':    await updateActivity(item.id, changes); break;
        case 'decision':    await updateDecision(item.id, changes); break;
      }
      loadData();
    } catch {
      console.error('Save failed');
    }
  };

  const handleDeleteItem = async (item: KanbanItemFull) => {
    try {
      switch (item.type) {
        case 'epic':        await deleteEpic(item.id); break;
        case 'deliverable': await deleteDeliverable(item.id); break;
        case 'task':        await deleteTask(item.id); break;
        case 'activity':    await deleteActivity(item.id); break;
        case 'decision':    await deleteDecision(item.id); break;
      }
      loadData();
    } catch {
      console.error('Delete failed');
    }
  };

  const handleDropToColumn = async (item: KanbanItemFull, targetColumnId: string) => {
    const targetColumn = columns.find((c) => c.id === targetColumnId);
    if (!targetColumn || !item.status) return;

    const newStatus = targetColumn.statuses[0];
    if (!newStatus || item.status === newStatus) return;

    const updatedItem = { ...item, status: newStatus };

    setAllItems((prev) =>
      prev.map((i) => (i.id === item.id && i.type === item.type ? updatedItem : i))
    );

    try {
      await updateKanbanCard({
        id: item.id,
        title: item.title,
        type: item.type.charAt(0).toUpperCase() + item.type.slice(1),
        kanban_status: newStatus,
      });
      loadData();
    } catch {
      console.error('Drag/drop update failed');
      loadData();
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
        <div className="kanban">
          {visibleColumns.map((col) => (
            <KanbanColumn
              key={col.id}
              title={col.title}
              items={itemsForColumn(col)}
              onTitleChange={(newTitle) => renameColumn(col.id, newTitle)}
              onSaveItem={handleSaveItem}
              onDeleteItem={handleDeleteItem}
              onDropItem={(item) => handleDropToColumn(item, col.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default KanbanPage;