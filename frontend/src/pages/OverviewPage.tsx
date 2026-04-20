import React, { useCallback, useEffect, useState } from 'react';
import StatsSummary, { Stat } from '../components/StatsSummary';
import FilterTabs, { Tab } from '../components/FilterTabs';
import MetadataCard from '../components/MetadataCard';
import {
  getEpics, getDecisions, getDeliverables, getTasks, getActivities,
  createEpic, createDecision, createDeliverable, createTask, createActivity,
  updateEpic, updateDecision, updateDeliverable, updateTask, updateActivity,
  deleteEpic, deleteDecision, deleteDeliverable, deleteTask, deleteActivity,
} from '../api';
import type { MetadataType } from '../types';

const OverviewPage: React.FC = () => {
  const [epics, setEpics]               = useState<any[]>([]);
  const [decisions, setDecisions]       = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [tasks, setTasks]               = useState<any[]>([]);
  const [activities, setActivities]     = useState<any[]>([]);
  const [tab, setTab]                   = useState<MetadataType>('all');
  const [loading, setLoading]           = useState(true);

  const loadAll = useCallback(() => {
    setLoading(true);
    Promise.all([
      getEpics().catch(() => []),
      getDecisions().catch(() => []),
      getDeliverables().catch(() => []),
      getTasks().catch(() => []),
      getActivities().catch(() => []),
    ]).then(([e, d, dl, t, a]) => {
      setEpics(e); setDecisions(d); setDeliverables(dl); setTasks(t); setActivities(a);
      setLoading(false);
    });
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── Create handler ────────────────────────────────────────────── */

  const handleCreate = async (type: MetadataType) => {
    try {
      switch (type) {
        case 'epic':        await createEpic({ title: 'New Epic', description: '' }); break;
        case 'decision':    await createDecision({ title: 'New Decision', description: '' }); break;
        case 'deliverable': await createDeliverable({ title: 'New Deliverable', requirements: '', specifications: '', properties: '', fit_criterion: '', owner: '' }); break;
        case 'task':        await createTask({ title: 'New Task', description: '', time_logged: '' }); break;
        case 'activity':    await createActivity({ title: 'New Activity', description: '' }); break;
      }
      loadAll();
    } catch (err) {
      console.error('Create failed', err);
    }
  };

  /* ── Save / Delete handlers per type ──────────────────────────── */

  const handleSave = async (type: MetadataType, id: number, changes: Record<string, string>) => {
    try {
      switch (type) {
      case 'epic': {
        const epic = epics.find((e) => e.id === id);
        if (!epic) break;

        await updateEpic(id, {
          title: changes.title ?? epic.title,
          description: changes.description ?? epic.description,
          classification: changes.classification ?? epic.classification,
          owner: changes.owner ?? epic.owner,
          scope: changes.scope ?? epic.scope,
          use_case: changes.use_case ?? epic.use_case,
          user_story: changes.user_story ?? epic.user_story,
          non_functional_requirements: changes.non_functional_requirements ?? epic.non_functional_requirements,
        });
        break;
      }
      case 'decision': {
        const decision = decisions.find((d) => d.id === id);
        if (!decision) break;

        await updateDecision(id, {
          title: changes.title ?? decision.title,
          description: changes.description ?? decision.description,
          alternatives: changes.alternatives ?? decision.alternatives,
          nature: changes.nature ?? decision.nature,
          reach: changes.reach ?? decision.reach,
          deadline: changes.deadline ?? decision.deadline,
          owner: changes.owner ?? decision.owner,
        });
        break;
      }
      case 'deliverable': {
        const deliverable = deliverables.find((d) => d.id === id);
        if (!deliverable) break;

        await updateDeliverable(id, {
          title: changes.title ?? deliverable.title,
          requirements: changes.requirements ?? deliverable.requirements,
          specifications: changes.specifications ?? deliverable.specifications,
          properties: changes.properties ?? deliverable.properties,
          fit_criterion: changes.fit_criterion ?? deliverable.fit_criterion,
          owner: changes.owner ?? deliverable.owner,
        });
        break;
      }
      case 'task': {
        const task = tasks.find((t) => t.id === id);
        if (!task) break;

        await updateTask(id, {
          title: changes.title ?? task.title,
          description: changes.description ?? task.description,
          owner: changes.owner ?? task.owner,
          status: changes.status ?? task.status,
          time_logged: changes.time_logged ?? task.time_logged,
          target_date: changes.target_date ?? task.target_date,
        });
        break;
      }
      case 'activity': {
        const activity = activities.find((a) => a.id === id);
        if (!activity) break;

        await updateActivity(id, {
          title: changes.title ?? activity.title,
          description: changes.description ?? activity.description,
          owner: changes.owner ?? activity.owner,
          status: changes.status ?? activity.status,
        });
        break;
      }
      }
      loadAll();
    } catch (err) {
      console.error('Save failed', err);
    }
  };

  const handleDelete = async (type: MetadataType, id: number) => {
    try {
      switch (type) {
        case 'epic':        await deleteEpic(id); break;
        case 'decision':    await deleteDecision(id); break;
        case 'deliverable': await deleteDeliverable(id); break;
        case 'task':        await deleteTask(id); break;
        case 'activity':    await deleteActivity(id); break;
      }
      loadAll();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const total = epics.length + decisions.length + deliverables.length + tasks.length + activities.length;

  const stats: Stat[] = [
    { label: 'Epics',        value: epics.length },
    { label: 'Decisions',    value: decisions.length, variant: 'rose' },
    { label: 'Deliverables', value: deliverables.length },
    { label: 'Tasks',        value: tasks.length, variant: 'peach' },
    { label: 'Activities',   value: activities.length },
    { label: 'Total',        value: total },
  ];

  const tabs: Tab[] = [
    { key: 'all',        label: 'All',         count: total },
    { key: 'epic',       label: 'Epics',       count: epics.length },
    { key: 'decision',   label: 'Decisions',   count: decisions.length },
    { key: 'deliverable',label: 'Deliverables',count: deliverables.length },
    { key: 'task',       label: 'Tasks',       count: tasks.length },
    { key: 'activity',   label: 'Activities',  count: activities.length },
  ];

  const renderCards = () => {
    if (tab === 'all') {
      return (
        <>
          {epics.map((e) => (
            <MetadataCard key={`epic-${e.id}`} title={e.title} owner={e.owner} description={e.description} status={(e.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
              onSave={(c) => handleSave('epic', e.id, c)}
              onDelete={() => handleDelete('epic', e.id)}
              extraDetails={[
                ...(e.classification ? [{ label: 'Classification', value: e.classification, key: 'classification' }] : []),
                ...(e.scope          ? [{ label: 'Scope',          value: e.scope,          key: 'scope' }] : []),
                ...(e.use_case       ? [{ label: 'Use Case',       value: e.use_case,       key: 'use_case' }] : []),
                ...(e.user_story     ? [{ label: 'User Story',     value: e.user_story,     key: 'user_story' }] : []),
                ...(e.non_functional_requirements
                  ? [{ label: 'Non-Functional Req.', value: e.non_functional_requirements, key: 'non_functional_requirements' }] : []),
              ]}
            />
          ))}

          {decisions.map((d) => (
            <MetadataCard key={`decision-${d.id}`} title={d.title} owner={d.owner} nature={d.nature} reach={d.reach} status={(d.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
              description={d.description} alternatives={d.alternatives}
              onSave={(c) => handleSave('decision', d.id, c)}
              onDelete={() => handleDelete('decision', d.id)}
              extraDetails={d.deadline ? [{ label: 'Deadline', value: d.deadline, key: 'deadline' }] : []}
            />
          ))}

          {deliverables.map((d) => (
            <MetadataCard key={`deliverable-${d.id}`} title={d.title} owner={d.owner} nature={d.nature} reach={d.reach} status={(d.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
              description={d.description} alternatives={d.alternatives}
              onSave={(c) => handleSave('deliverable', d.id, c)}
              onDelete={() => handleDelete('deliverable', d.id)}
              extraDetails={d.deadline ? [{ label: 'Deadline', value: d.deadline, key: 'deadline' }] : []}
            />
          ))}

          {tasks.map((t) => (
            <MetadataCard key={`task-${t.id}`} title={t.title} owner={t.owner} status={(t.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
              description={t.description}
              onSave={(c) => handleSave('task', t.id, c)}
              onDelete={() => handleDelete('task', t.id)}
              extraDetails={t.target_date ? [{ label: 'Target Date', value: t.target_date, key: 'target_date' }] : []}
            />
          ))}

          {activities.map((a) => (
            <MetadataCard key={`activity-${a.id}`} title={a.title} owner={a.owner} status={(a.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
              description={a.description}
              onSave={(c) => handleSave('activity', a.id, c)}
              onDelete={() => handleDelete('activity', a.id)}
            />
          ))}
        </>
      );
    }

    switch (tab) {
      case 'epic':
        return epics.map((e) => (
          <MetadataCard key={e.id} title={e.title} owner={e.owner} description={e.description} status={(e.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
            onSave={(c) => handleSave('epic', e.id, c)}
            onDelete={() => handleDelete('epic', e.id)}
            extraDetails={[
              ...(e.classification ? [{ label: 'Classification', value: e.classification, key: 'classification' }] : []),
              ...(e.scope          ? [{ label: 'Scope',          value: e.scope,          key: 'scope' }] : []),
              ...(e.use_case       ? [{ label: 'Use Case',       value: e.use_case,       key: 'use_case' }] : []),
              ...(e.user_story     ? [{ label: 'User Story',     value: e.user_story,     key: 'user_story' }] : []),
              ...(e.non_functional_requirements
                ? [{ label: 'Non-Functional Req.', value: e.non_functional_requirements, key: 'non_functional_requirements' }] : []),
            ]}
          />
        ));
      case 'decision':
        return decisions.map((d) => (
          <MetadataCard key={d.id} title={d.title} owner={d.owner} nature={d.nature} reach={d.reach} status={(d.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
            description={d.description} alternatives={d.alternatives}
            onSave={(c) => handleSave('decision', d.id, c)}
            onDelete={() => handleDelete('decision', d.id)}
            extraDetails={d.deadline ? [{ label: 'Deadline', value: d.deadline, key: 'deadline' }] : []}
          />
        ));
      case 'deliverable':
        return deliverables.map((d) => (
          <MetadataCard key={d.id} title={d.title} owner={d.owner} nature={d.nature} reach={d.reach} status={(d.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
            description={d.description} alternatives={d.alternatives}
            onSave={(c) => handleSave('deliverable', d.id, c)}
            onDelete={() => handleDelete('deliverable', d.id)}
            extraDetails={d.deadline ? [{ label: 'Deadline', value: d.deadline, key: 'deadline' }] : []}
          />
        ));
      case 'task':
        return tasks.map((t) => (
          <MetadataCard key={t.id} title={t.title} owner={t.owner} status={(t.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
            description={t.description}
            onSave={(c) => handleSave('task', t.id, c)}
            onDelete={() => handleDelete('task', t.id)}
            extraDetails={t.target_date ? [{ label: 'Target Date', value: t.target_date, key: 'target_date' }] : []}
          />
        ));
      case 'activity':
        return activities.map((a) => (
          <MetadataCard key={a.id} title={a.title} owner={a.owner} status={(a.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
            description={a.description}
            onSave={(c) => handleSave('activity', a.id, c)}
            onDelete={() => handleDelete('activity', a.id)}
          />
        ));
    }
  };

  return (
    <section aria-labelledby="overview-heading">
      <h1 id="overview-heading" className="page-title">Metadata Overview</h1>
      <StatsSummary stats={stats} />
      <FilterTabs tabs={tabs} active={tab} onChange={(k) => setTab(k as MetadataType)} />

      <div style={{ marginBottom: '1rem' }}>
        <button className="btn-primary" onClick={() => handleCreate(tab)}
          title={`Create a new ${tab}`} aria-label={`Create a new ${tab}`}>
          + New {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      </div>

      <div role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`} aria-live="polite">
        {loading
          ? <div className="empty-state" role="status" aria-label="Loading metadata">Loading…</div>
          : renderCards()}
      </div>
    </section>
  );
};

export default OverviewPage;