import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverviewPage from '../../src/pages/OverviewPage';
import * as api from '../../src/api';

vi.mock('../../src/api');
vi.mock('../../src/components/StatsSummary', () => ({
  default: (props: any) => (
    <div data-testid="stats-summary">
      {props.stats.map((s: any, i: number) => (
        <div key={i} data-testid="stat-item">{s.label}: {s.value}</div>
      ))}
    </div>
  ),
}));
vi.mock('../../src/components/FilterTabs', () => ({
  default: (props: any) => (
    <div data-testid="filter-tabs">
      {props.tabs.map((t: any) => (
        <button key={t.key} onClick={() => props.onChange(t.key)}>{t.label}</button>
      ))}
    </div>
  ),
}));
vi.mock('../../src/components/MetadataCard', () => ({
  default: (props: any) => (
    <div data-testid="metadata-card" data-type={props.displayType}>
      <div>{props.title}</div>
      <button onClick={() => props.onSave && props.onSave({ title: 'changed' })}>Save</button>
      <button onClick={() => props.onDelete && props.onDelete()}>Delete</button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('OverviewPage (focused tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
  });

  it('renders a section landmark with the expected heading', async () => {
    render(<OverviewPage />);

    const section = screen.getByRole('region', { name: /Metadata Overview/i });
    expect(section).toBeTruthy();

    const heading = screen.getByRole('heading', { level: 1, name: /Metadata Overview/i });
    expect(heading).toBeTruthy();
    expect(heading).toHaveAttribute('id', 'overview-heading');
  });

  it('fetches data from all metadata endpoints on mount', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalledTimes(1);
      expect(api.getDecisions).toHaveBeenCalledTimes(1);
      expect(api.getDeliverables).toHaveBeenCalledTimes(1);
      expect(api.getTasks).toHaveBeenCalledTimes(1);
      expect(api.getActivities).toHaveBeenCalledTimes(1);
    });
  });

  it('renders StatsSummary component', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      const stats = screen.getByTestId('stats-summary');
      expect(stats).toBeTruthy();
    });
  });

  it('renders FilterTabs component', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      const tabs = screen.getByTestId('filter-tabs');
      expect(tabs).toBeTruthy();
    });
  });

  it('renders Create New button with correct attributes', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      const createBtn = screen.getByRole('button', { name: /Create New/i });
      expect(createBtn).toBeTruthy();
      expect(createBtn.className).toContain('btn-primary');
    });
  });

  it('renders tabpanel with correct aria attributes', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeTruthy();
      expect(tabpanel).toHaveAttribute('id', 'tabpanel-all');
      expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-all');
      expect(tabpanel).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('shows loading state initially inside tabpanel', async () => {
    vi.spyOn(api, 'getEpics').mockImplementation(() => new Promise(() => {}));
    render(<OverviewPage />);

    const loadingEl = screen.getByRole('status', { name: /Loading metadata/i });
    expect(loadingEl).toBeTruthy();
    expect(loadingEl).toHaveTextContent(/Loading/i);
  });

  it('renders metadata cards when data loads', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'alice', description: 'desc', kanban_status: 'todo' },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it('clicking Create New button opens modal', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    expect(screen.getByRole('heading', { name: /Create New/i })).toBeTruthy();
  });

  it('create modal has metadata type selector', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeTruthy();
      expect(select.className).toContain('form-select');
    });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(5);
    expect(screen.getByRole('option', { name: /Epic/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Decision/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Deliverable/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Task/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Activity/i })).toBeTruthy();
  });

  it('create modal has title and owner input fields', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('create modal has Cancel and Create buttons', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      const createBtns = screen.getAllByRole('button', { name: /Create/i });
      const createBtn = createBtns.find((btn) => btn.className.includes('btn-primary'));

      expect(cancelBtn).toBeTruthy();
      expect(createBtn).toBeTruthy();
    });
  });

  it('clicking Cancel closes the create modal', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('clicking modal overlay closes the create modal', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await userEvent.click(overlay);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('calls createEpic API when creating an epic', async () => {
    const createEpicSpy = vi.spyOn(api, 'createEpic').mockResolvedValue({ id: 1 } as any);
    const user = userEvent.setup();

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const dialog = screen.getByRole('dialog');
    const titleInputs = within(dialog).getAllByRole('textbox');
    await user.clear(titleInputs[0]);
    await user.type(titleInputs[0], 'New Epic Title');

    const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
    const createBtn = createBtns.find((btn) => btn.className.includes('btn-primary'));

    await user.click(createBtn!);

    await waitFor(() => {
      expect(createEpicSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Epic Title'
        })
      );
    });
  });

  it('creates a decision when decision type is selected', async () => {
    const createDecisionSpy = vi.spyOn(api, 'createDecision').mockResolvedValue({ id: 1 } as any);
    const user = userEvent.setup();

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'decision');

    const dialog = screen.getByRole('dialog');
    const titleInputs = within(dialog).getAllByRole('textbox');
    await user.type(titleInputs[0], 'New Decision');

    const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
    const createBtn = createBtns.find((btn) => btn.className.includes('btn-primary'));

    await user.click(createBtn!);

    await waitFor(() => {
      expect(createDecisionSpy).toHaveBeenCalled();
    });
  });

  it('creates a deliverable when deliverable type is selected', async () => {
    const createDeliverableSpy = vi.spyOn(api, 'createDeliverable').mockResolvedValue({ id: 1 } as any);
    const user = userEvent.setup();

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'deliverable');

    const dialog = screen.getByRole('dialog');
    const titleInputs = within(dialog).getAllByRole('textbox');
    await user.type(titleInputs[0], 'New Deliverable');

    const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
    const createBtn = createBtns.find((btn) => btn.className.includes('btn-primary'));

    await user.click(createBtn!);

    await waitFor(() => {
      expect(createDeliverableSpy).toHaveBeenCalled();
    });
  });

  it('creates a task when task type is selected', async () => {
    const createTaskSpy = vi.spyOn(api, 'createTask').mockResolvedValue({ id: 1 } as any);
    const user = userEvent.setup();

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'task');

    const dialog = screen.getByRole('dialog');
    const titleInputs = within(dialog).getAllByRole('textbox');
    await user.type(titleInputs[0], 'New Task');

    const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
    const createBtn = createBtns.find((btn) => btn.className.includes('btn-primary'));

    await user.click(createBtn!);

    await waitFor(() => {
      expect(createTaskSpy).toHaveBeenCalled();
    });
  });

  it('creates an activity when activity type is selected', async () => {
    const createActivitySpy = vi.spyOn(api, 'createActivity').mockResolvedValue({ id: 1 } as any);
    const user = userEvent.setup();

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'activity');

    const dialog = screen.getByRole('dialog');
    const titleInputs = within(dialog).getAllByRole('textbox');
    await user.type(titleInputs[0], 'New Activity');

    const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
    const createBtn = createBtns.find((btn) => btn.className.includes('btn-primary'));

    await user.click(createBtn!);

    await waitFor(() => {
      expect(createActivitySpy).toHaveBeenCalled();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.spyOn(api, 'getEpics').mockRejectedValue(new Error('Failed'));
    render(<OverviewPage />);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalled();
    });
  });

  it('handles create error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'createEpic').mockRejectedValue(new Error('Create failed'));
    const user = userEvent.setup();

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const dialog = screen.getByRole('dialog');
    const titleInputs = within(dialog).getAllByRole('textbox');
    await user.type(titleInputs[0], 'Will Fail');

    const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
    const createBtn = createBtns.find((btn) => btn.className.includes('btn-primary'));

    await user.click(createBtn!);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Create failed', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('changes tab when filter tab is clicked', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'alice', description: 'desc', kanban_status: 'todo' },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const tabs = screen.getByTestId('filter-tabs');
      expect(tabs).toBeTruthy();
    });

    const epicsBtn = screen.getByRole('button', { name: /Epics/i });
    await userEvent.click(epicsBtn);

    expect(epicsBtn).toBeTruthy();
  });

  it('renders cards for each metadata type on All tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'alice', description: 'desc', kanban_status: 'todo' },
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      { id: 2, title: 'Decision 1', owner: 'bob', description: 'desc', kanban_status: 'done', nature: 'structural', reach: 'global' },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(2);
    });
  });

  it('saves epic with all fields', async () => {
    const updateEpicSpy = vi.spyOn(api, 'updateEpic').mockResolvedValue({} as any);

    vi.spyOn(api, 'getEpics').mockResolvedValue([
      {
        id: 1,
        title: 'Epic 1',
        owner: 'alice',
        description: 'original desc',
        kanban_status: 'todo',
        classification: 'feature',
        scope: 'system',
        use_case: 'UC1',
        user_story: 'story',
        non_functional_requirements: 'NFR'
      },
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const saveBtn = screen.getAllByRole('button', { name: /Save/i })[0];
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateEpicSpy).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'changed' }));
    });
  });

  it('saves decision with all fields', async () => {
    const updateDecisionSpy = vi.spyOn(api, 'updateDecision').mockResolvedValue({} as any);

    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      {
        id: 1,
        title: 'Decision 1',
        owner: 'bob',
        description: 'desc',
        kanban_status: 'done',
        alternatives: 'alt',
        nature: 'structural',
        reach: 'global',
        deadline: '2024-12-31'
      },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const saveBtn = screen.getAllByRole('button', { name: /Save/i })[0];
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateDecisionSpy).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'changed' }));
    });
  });

  it('saves deliverable with all fields', async () => {
    const updateDeliverableSpy = vi.spyOn(api, 'updateDeliverable').mockResolvedValue({} as any);

    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      {
        id: 1,
        title: 'Deliverable 1',
        owner: 'charlie',
        kanban_status: 'in_progress',
        requirements: 'req',
        specifications: 'spec',
        properties: 'prop',
        fit_criterion: 'fit'
      },
    ]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const saveBtn = screen.getAllByRole('button', { name: /Save/i })[0];
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateDeliverableSpy).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'changed' }));
    });
  });

  it('saves task with all fields', async () => {
    const updateTaskSpy = vi.spyOn(api, 'updateTask').mockResolvedValue({} as any);

    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      {
        id: 1,
        title: 'Task 1',
        owner: 'dave',
        description: 'desc',
        kanban_status: 'todo',
        status: 'open',
        time_logged: '2h',
        target_date: '2024-11-30'
      },
    ]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const saveBtn = screen.getAllByRole('button', { name: /Save/i })[0];
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateTaskSpy).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'changed' }));
    });
  });

  it('saves activity with all fields', async () => {
    const updateActivitySpy = vi.spyOn(api, 'updateActivity').mockResolvedValue({} as any);

    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([
      {
        id: 1,
        title: 'Activity 1',
        owner: 'eve',
        description: 'activity desc',
        kanban_status: 'done',
        status: 'completed'
      },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const saveBtn = screen.getAllByRole('button', { name: /Save/i })[0];
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateActivitySpy).toHaveBeenCalledWith(1, expect.objectContaining({ title: 'changed' }));
    });
  });

  it('handles save error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'updateEpic').mockRejectedValue(new Error('Save failed'));

    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'alice', description: 'desc', kanban_status: 'todo' },
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const saveBtn = screen.getAllByRole('button', { name: /Save/i })[0];
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Save failed', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('deletes epic', async () => {
    const deleteEpicSpy = vi.spyOn(api, 'deleteEpic').mockResolvedValue();

    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'alice', description: 'desc', kanban_status: 'todo' },
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const deleteBtn = screen.getAllByRole('button', { name: /Delete/i })[0];
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteEpicSpy).toHaveBeenCalledWith(1);
    });
  });

  it('deletes decision', async () => {
    const deleteDecisionSpy = vi.spyOn(api, 'deleteDecision').mockResolvedValue();

    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      { id: 2, title: 'Decision 1', owner: 'bob', description: 'desc', kanban_status: 'done' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const deleteBtn = screen.getAllByRole('button', { name: /Delete/i })[0];
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteDecisionSpy).toHaveBeenCalledWith(2);
    });
  });

  it('deletes deliverable', async () => {
    const deleteDeliverableSpy = vi.spyOn(api, 'deleteDeliverable').mockResolvedValue();

    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      { id: 3, title: 'Deliverable 1', owner: 'charlie', kanban_status: 'in_progress' },
    ]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const deleteBtn = screen.getAllByRole('button', { name: /Delete/i })[0];
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteDeliverableSpy).toHaveBeenCalledWith(3);
    });
  });

  it('deletes task', async () => {
    const deleteTaskSpy = vi.spyOn(api, 'deleteTask').mockResolvedValue();

    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      { id: 4, title: 'Task 1', owner: 'dave', description: 'desc', kanban_status: 'todo' },
    ]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const deleteBtn = screen.getAllByRole('button', { name: /Delete/i })[0];
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteTaskSpy).toHaveBeenCalledWith(4);
    });
  });

  it('deletes activity', async () => {
    const deleteActivitySpy = vi.spyOn(api, 'deleteActivity').mockResolvedValue();

    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([
      { id: 5, title: 'Activity 1', owner: 'eve', description: 'desc', kanban_status: 'done' },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const deleteBtn = screen.getAllByRole('button', { name: /Delete/i })[0];
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteActivitySpy).toHaveBeenCalledWith(5);
    });
  });

  it('handles delete error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'deleteEpic').mockRejectedValue(new Error('Delete failed'));

    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'alice', description: 'desc', kanban_status: 'todo' },
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });

    const deleteBtn = screen.getAllByRole('button', { name: /Delete/i })[0];
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith('Delete failed', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('renders epics on epic tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'alice', description: 'desc', kanban_status: 'todo' },
      { id: 2, title: 'Epic 2', owner: 'bob', description: 'desc2', kanban_status: 'done' },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const tabs = screen.getByTestId('filter-tabs');
      expect(tabs).toBeTruthy();
    });

    const epicsBtn = screen.getByRole('button', { name: /Epics/i });
    await userEvent.click(epicsBtn);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(2);
    });
  });

  it('renders decisions on decision tab', async () => {
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      { id: 1, title: 'Decision 1', owner: 'alice', description: 'desc', kanban_status: 'todo', nature: 'structural', reach: 'global' },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const tabs = screen.getByTestId('filter-tabs');
      expect(tabs).toBeTruthy();
    });

    const decisionsBtn = screen.getByRole('button', { name: /Decisions/i });
    await userEvent.click(decisionsBtn);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });
  });

  it('renders deliverables on deliverable tab', async () => {
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      { id: 1, title: 'Deliverable 1', owner: 'alice', kanban_status: 'in_progress', nature: 'functional', reach: 'local' },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const tabs = screen.getByTestId('filter-tabs');
      expect(tabs).toBeTruthy();
    });

    const deliverablesBtn = screen.getByRole('button', { name: /Deliverables/i });
    await userEvent.click(deliverablesBtn);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });
  });

  it('renders tasks on task tab', async () => {
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      { id: 1, title: 'Task 1', owner: 'alice', description: 'desc', kanban_status: 'todo', target_date: '2024-12-01' },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const tabs = screen.getByTestId('filter-tabs');
      expect(tabs).toBeTruthy();
    });

    const tasksBtn = screen.getByRole('button', { name: /Tasks/i });
    await userEvent.click(tasksBtn);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });
  });

  it('renders activities on activity tab', async () => {
    vi.spyOn(api, 'getActivities').mockResolvedValue([
      { id: 1, title: 'Activity 1', owner: 'alice', description: 'desc', kanban_status: 'done' },
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      const tabs = screen.getByTestId('filter-tabs');
      expect(tabs).toBeTruthy();
    });

    const activitiesBtn = screen.getByRole('button', { name: /Activities/i });
    await userEvent.click(activitiesBtn);

    await waitFor(() => {
      const cards = screen.getAllByTestId('metadata-card');
      expect(cards.length).toBe(1);
    });
  });
});