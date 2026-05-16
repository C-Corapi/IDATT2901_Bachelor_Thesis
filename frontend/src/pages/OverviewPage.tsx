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
      getActivities().catch(() => []),
      getTasks().catch(() => []),
    ]).then(([e, d, dl, t, a]) => {
      setEpics(e); setDecisions(d); setDeliverables(dl); setActivities(a); setTasks(t);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
  }, [loadAll]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<MetadataType>('epic');
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState<Record<string, string>>({
    title: '',
    description: '',
    owner: '',
    classification: '',
    scope: '',
    use_case: '',
    user_story: '',
    non_functional_requirements: '',
    alternatives: '',
    nature: '',
    reach: '',
    deadline: '',
    requirements: '',
    specifications: '',
    properties: '',
    fit_criterion: '',
    time_logged: '',
    target_date: '',
    status: '',
  });


const handleCreate = async () => {
  if (creating) return;
  setCreating(true);
  try {
    switch (createType) {
      case 'epic':
        await createEpic({
          title: createForm.title,
          description: createForm.description,
          owner: createForm.owner,
          classification: createForm.classification,
          scope: createForm.scope,
          use_case: createForm.use_case,
          user_story: createForm.user_story,
          non_functional_requirements: createForm.non_functional_requirements,
        });
        break;
      case 'decision':
        await createDecision({
          title: createForm.title,
          description: createForm.description,
          owner: createForm.owner,
          alternatives: createForm.alternatives,
          nature: createForm.nature,
          reach: createForm.reach,
          deadline: createForm.deadline,
        });
        break;
      case 'deliverable':
        await createDeliverable({
          title: createForm.title,
          description: createForm.description,
          alternatives: createForm.alternatives,
          nature: createForm.nature,
          reach: createForm.reach,
          deadline: createForm.deadline,
          owner: createForm.owner,
        });
        break;
      case 'task':
        await createTask({
          title: createForm.title,
          description: createForm.description,
          owner: createForm.owner,
          status: createForm.status,
          time_logged: createForm.time_logged,
          target_date: createForm.target_date,
        });
        break;
      case 'activity':
        await createActivity({
          title: createForm.title,
          description: createForm.description,
          owner: createForm.owner,
          status: createForm.status,
        });
        break;
    }

    setShowCreateModal(false);
    setCreateForm({
      title: '',
      description: '',
      owner: '',
      classification: '',
      scope: '',
      use_case: '',
      user_story: '',
      non_functional_requirements: '',
      alternatives: '',
      nature: '',
      reach: '',
      deadline: '',
      requirements: '',
      specifications: '',
      properties: '',
      fit_criterion: '',
      time_logged: '',
      target_date: '',
      status: '',
    });
    loadAll();
  } catch (err) {
    console.error('Create failed', err);
  } finally {
    setCreating(false);
  }
};

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
          description: changes.description ?? deliverable.description,
          alternatives: changes.alternatives ?? deliverable.alternatives,
          nature: changes.nature ?? deliverable.nature,
          reach: changes.reach ?? deliverable.reach,
          deadline: changes.deadline ?? deliverable.deadline,
          owner: changes.owner ?? deliverable.owner,
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
    { label: 'Activities',   value: activities.length },
    { label: 'Tasks',        value: tasks.length, variant: 'peach' },
    { label: 'Total',        value: total },
  ];

  const tabs: Tab[] = [
    { key: 'all',        label: 'All',         count: total },
    { key: 'epic',       label: 'Epics',       count: epics.length },
    { key: 'decision',   label: 'Decisions',   count: decisions.length },
    { key: 'deliverable',label: 'Deliverables',count: deliverables.length },
    { key: 'activity',   label: 'Activities',  count: activities.length },
    { key: 'task',       label: 'Tasks',       count: tasks.length },
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

          {activities.map((a) => (
            <MetadataCard key={`activity-${a.id}`} title={a.title} owner={a.owner} status={(a.kanban_status ?? 'backlog').toUpperCase()} showKanbanStatus={true}
              description={a.description}
              onSave={(c) => handleSave('activity', a.id, c)}
              onDelete={() => handleDelete('activity', a.id)}
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
        <StatsSummary stats={stats}/>
        <FilterTabs tabs={tabs} active={tab} onChange={(k) => setTab(k as MetadataType)}/>

        <div style={{marginBottom: '1rem'}}>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            Create New
          </button>
        </div>

        <div role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`} aria-live="polite">
          {loading
              ? <div className="empty-state" role="status" aria-label="Loading metadata">Loading…</div>
              : renderCards()}
        </div>

        {showCreateModal && (
            <div className="modal-overlay" role="presentation" onClick={() => setShowCreateModal(false)}>
              <div className="modal modal--wide" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <h2>Create New</h2>

                <div className="form-group">
                  <label className="form-label" htmlFor="create-metadata-type">Metadata type</label>
                  <select
                      id="create-metadata-type"
                      className="form-select"
                      value={createType}
                      onChange={(e) => setCreateType(e.target.value as MetadataType)}
                  >
                    <option value="epic">Epic</option>
                    <option value="decision">Decision</option>
                    <option value="deliverable">Deliverable</option>
                    <option value="task">Task</option>
                    <option value="activity">Activity</option>
                  </select>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="create-title">Title</label>
                    <input
                        id="create-title"
                        className="detail-input"
                        value={createForm.title}
                        onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="create-owner">Owner</label>
                    <input
                        id="create-owner"
                        className="detail-input"
                        value={createForm.owner}
                        onChange={(e) => setCreateForm({...createForm, owner: e.target.value})}
                    />
                  </div>

                  <div className="form-group form-group--full">
                    <label className="form-label" htmlFor="create-description">Description</label>
                    <textarea
                        id="create-description"
                        className="detail-textarea"
                        value={createForm.description}
                        onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    />
                  </div>
                </div>

                {createType === 'epic' && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-classification">Classification</label>
                        <input
                            id="create-classification"
                            className="detail-input"
                            value={createForm.classification}
                            onChange={(e) => setCreateForm({...createForm, classification: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-scope">Scope</label>
                        <input
                            id="create-scope"
                            className="detail-input"
                            value={createForm.scope}
                            onChange={(e) => setCreateForm({...createForm, scope: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-use-case">Use Case</label>
                        <input
                            id="create-use-case"
                            className="detail-input"
                            value={createForm.use_case}
                            onChange={(e) => setCreateForm({...createForm, use_case: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-user-story">User Story</label>
                        <input
                            id="create-user-story"
                            className="detail-input"
                            value={createForm.user_story}
                            onChange={(e) => setCreateForm({...createForm, user_story: e.target.value})}
                        />
                      </div>
                      <div className="form-group form-group--full">
                        <label className="form-label" htmlFor="create-non-functional-requirements">Non-Functional Requirements</label>
                        <input
                            id="create-non-functional-requirements"
                            className="detail-input"
                            value={createForm.non_functional_requirements}
                            onChange={(e) => setCreateForm({
                              ...createForm,
                              non_functional_requirements: e.target.value
                            })}
                        />
                      </div>
                    </div>
                )}

                {createType === 'decision' && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-alternatives">Alternatives</label>
                        <input
                            id="create-alternatives"
                            className="detail-input"
                            value={createForm.alternatives}
                            onChange={(e) => setCreateForm({...createForm, alternatives: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-nature">Nature</label>
                        <input
                            id="create-nature"
                            className="detail-input"
                            value={createForm.nature}
                            onChange={(e) => setCreateForm({...createForm, nature: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-reach">Reach</label>
                        <input
                            id="create-reach"
                            className="detail-input"
                            value={createForm.reach}
                            onChange={(e) => setCreateForm({...createForm, reach: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-deadline">Deadline</label>
                        <input
                            id="create-deadline"
                            className="detail-input"
                            value={createForm.deadline}
                            onChange={(e) => setCreateForm({...createForm, deadline: e.target.value})}
                        />
                      </div>
                    </div>
                )}

                {createType === 'deliverable' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label" htmlFor="create-alternatives">Alternatives</label>
                    <input
                        id="create-alternatives"
                        className="detail-input"
                        value={createForm.alternatives}
                      onChange={(e) => setCreateForm({...createForm, alternatives: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="create-nature">Nature</label>
                    <input
                        id="create-nature"
                        className="detail-input"
                        value={createForm.nature}
                      onChange={(e) => setCreateForm({...createForm, nature: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="create-reach">Reach</label>
                    <input
                        id="create-reach"
                        className="detail-input"
                        value={createForm.reach}
                      onChange={(e) => setCreateForm({...createForm, reach: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="create-deadline">Deadline</label>
                    <input
                        id="create-deadline"
                        className="detail-input"
                        value={createForm.deadline}
                      onChange={(e) => setCreateForm({...createForm, deadline: e.target.value})} />
                  </div>
                </div>
              )}

                {createType === 'activity' && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-status">Status</label>
                        <input
                            id="create-status"
                            className="detail-input"
                            value={createForm.status}
                            onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                        />
                      </div>
                    </div>
                )}

                {createType === 'task' && (
                    <div className="form-grid">
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-status">Status</label>
                        <input
                            id="create-status"
                            className="detail-input"
                            value={createForm.status}
                            onChange={(e) => setCreateForm({...createForm, status: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-time-logged">Time Logged</label>
                        <input
                            id="create-time-logged"
                            className="detail-input"
                            value={createForm.time_logged}
                            onChange={(e) => setCreateForm({...createForm, time_logged: e.target.value})}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="create-target-date">Target Date</label>
                        <input
                            id="create-target-date"
                            className="detail-input"
                            value={createForm.target_date}
                            onChange={(e) => setCreateForm({...createForm, target_date: e.target.value})}
                        />
                      </div>
                    </div>
                )}

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleCreate} disabled={creating} aria-disabled={creating}>
                    {creating ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
        )}
      </section>
  );
  };

export default OverviewPage;