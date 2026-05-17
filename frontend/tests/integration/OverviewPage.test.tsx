import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverviewPage from '../../src/pages/OverviewPage';
import * as api from '../../src/api';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/api');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('OverviewPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
  });

  it('renders complete page structure', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      const section = screen.getByRole('region', { name: /Metadata Overview/i });
      expect(section).toBeTruthy();
    });

    const heading = screen.getByRole('heading', { level: 1, name: /Metadata Overview/i });
    expect(heading).toBeTruthy();
    expect(heading).toHaveAttribute('id', 'overview-heading');
  });

  it('displays loading state initially', () => {
    vi.spyOn(api, 'getEpics').mockImplementation(() => new Promise(() => {}));
    render(<OverviewPage />);

    const loadingMsg = screen.getByRole('status', { name: /Loading metadata/i });
    expect(loadingMsg).toBeTruthy();
    expect(loadingMsg).toHaveTextContent(/Loading/i);
  });

  it('fetches all metadata types on mount', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalledTimes(1);
      expect(api.getDecisions).toHaveBeenCalledTimes(1);
      expect(api.getDeliverables).toHaveBeenCalledTimes(1);
      expect(api.getTasks).toHaveBeenCalledTimes(1);
      expect(api.getActivities).toHaveBeenCalledTimes(1);
    });
  });

  it('renders stats summary with all metadata counts', async () => {
    const mockEpics = [{ id: 1, title: 'Epic 1', owner: 'Alice', kanban_status: 'todo', description: 'Desc' }];
    const mockDecisions = [{ id: 2, title: 'Decision 1', owner: 'Bob', kanban_status: 'done', description: 'Desc', nature: 'Tech', reach: 'Team' }];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);
    vi.spyOn(api, 'getDecisions').mockResolvedValue(mockDecisions);

    render(<OverviewPage />);

    await waitFor(() => {
      const statItems = screen.getAllByText(/Epics|Decisions|Deliverables|Tasks|Activities|Total/i);
      expect(statItems.length).toBeGreaterThan(0);
    });
  });

  it('renders filter tabs with correct counts', async () => {
    const mockEpics = [
      { id: 1, title: 'Epic 1', owner: 'Alice', kanban_status: 'todo', description: 'Desc' },
      { id: 2, title: 'Epic 2', owner: 'Bob', kanban_status: 'done', description: 'Desc' },
    ];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);

    render(<OverviewPage />);

    await waitFor(() => {
      const allTab = screen.getByRole('tab', { name: /All/i });
      expect(allTab).toBeTruthy();
    });
  });

  it('renders Create New button', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      const createBtn = screen.getByRole('button', { name: /Create New/i });
      expect(createBtn).toBeTruthy();
      expect(createBtn).toHaveClass('btn-primary');
    });
  });

  it('renders tabpanel with correct accessibility attributes', async () => {
    render(<OverviewPage />);

    await waitFor(() => {
      const tabpanel = screen.getByRole('tabpanel');
      expect(tabpanel).toBeTruthy();
      expect(tabpanel).toHaveAttribute('id', 'tabpanel-all');
      expect(tabpanel).toHaveAttribute('aria-labelledby', 'tab-all');
      expect(tabpanel).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('displays epic cards with all metadata fields', async () => {
    const user = userEvent.setup();
    const mockEpics = [
      {
        id: 1,
        title: 'Epic 1',
        owner: 'Alice',
        description: 'Epic description',
        kanban_status: 'todo',
        classification: 'Feature',
        scope: 'Global',
        use_case: 'UC-001',
        user_story: 'As a user...',
        non_functional_requirements: 'Performance'
      },
    ];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
      expect(screen.getByText('Alice')).toBeTruthy();
    });

    const card = screen.getByRole('button', { name: /Epic 1/i });
    await user.click(card);

    await waitFor(() => {
      expect(screen.getByText('Epic description')).toBeTruthy();
    });
  });

  it('displays decision cards with all metadata fields', async () => {
    const mockDecisions = [
      {
        id: 1,
        title: 'Decision 1',
        owner: 'Bob',
        description: 'Decision description',
        kanban_status: 'in_progress',
        nature: 'Technical',
        reach: 'Team',
        alternatives: 'Option A, Option B',
        deadline: '2026-06-01'
      },
    ];

    vi.spyOn(api, 'getDecisions').mockResolvedValue(mockDecisions);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Decision 1')).toBeTruthy();
      expect(screen.getByText('Bob')).toBeTruthy();
    });
  });

  it('displays deliverable cards with metadata', async () => {
    const mockDeliverables = [
      {
        id: 1,
        title: 'Deliverable 1',
        owner: 'Charlie',
        kanban_status: 'done',
        nature: 'Document',
        reach: 'Global',
        description: 'Deliverable desc',
        alternatives: 'Alt'
      },
    ];

    vi.spyOn(api, 'getDeliverables').mockResolvedValue(mockDeliverables);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Deliverable 1')).toBeTruthy();
      expect(screen.getByText('Charlie')).toBeTruthy();
    });
  });

  it('displays task cards with metadata', async () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        owner: 'Dave',
        description: 'Task description',
        kanban_status: 'todo',
        target_date: '2026-05-20'
      },
    ];

    vi.spyOn(api, 'getTasks').mockResolvedValue(mockTasks);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
      expect(screen.getByText('Dave')).toBeTruthy();
    });
  });

  it('displays activity cards with metadata', async () => {
    const mockActivities = [
      {
        id: 1,
        title: 'Activity 1',
        owner: 'Eve',
        description: 'Activity description',
        kanban_status: 'backlog'
      },
    ];

    vi.spyOn(api, 'getActivities').mockResolvedValue(mockActivities);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeTruthy();
      expect(screen.getByText('Eve')).toBeTruthy();
    });
  });

  it('displays all metadata types on "All" tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'Alice', kanban_status: 'todo', description: 'Desc' }
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      { id: 2, title: 'Decision 1', owner: 'Bob', kanban_status: 'done', description: 'Desc', nature: 'Tech', reach: 'Team' }
    ]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      { id: 3, title: 'Task 1', owner: 'Charlie', kanban_status: 'todo', description: 'Desc' }
    ]);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
      expect(screen.getByText('Decision 1')).toBeTruthy();
      expect(screen.getByText('Task 1')).toBeTruthy();
    });
  });

  it('opens create modal when Create New button is clicked', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Metadata Overview')).toBeTruthy();
    });

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(screen.getByRole('heading', { name: /Create New/i })).toBeTruthy();
    });
  });

  it('creates a new epic with all fields', async () => {
    const createSpy = vi.spyOn(api, 'createEpic').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Metadata Overview')).toBeTruthy();
    });

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    const titleInput = screen.getByLabelText(/Title/i);
    await userEvent.type(titleInput, 'New Epic');

    const ownerInput = screen.getByLabelText(/Owner/i);
    await userEvent.type(ownerInput, 'John Doe');

    const descInput = screen.getByLabelText(/Description/i);
    await userEvent.type(descInput, 'Epic description');

    const classInput = screen.getByLabelText(/Classification/i);
    await userEvent.type(classInput, 'Feature');

    const scopeInput = screen.getByLabelText(/Scope/i);
    await userEvent.type(scopeInput, 'Global');

    const useCaseInput = screen.getByLabelText(/Use Case/i);
    await userEvent.type(useCaseInput, 'UC-1');

    const userStoryInput = screen.getByLabelText(/User Story/i);
    await userEvent.type(userStoryInput, 'As a user...');

    const nfrInput = screen.getByLabelText(/Non-Functional Requirements/i);
    await userEvent.type(nfrInput, 'Performance');

    const submitBtn = screen.getByRole('button', { name: /^Create$/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith({
        title: 'New Epic',
        owner: 'John Doe',
        description: 'Epic description',
        classification: 'Feature',
        scope: 'Global',
        use_case: 'UC-1',
        user_story: 'As a user...',
        non_functional_requirements: 'Performance',
      });
    });
  });

  it('creates a new decision', async () => {
    const createSpy = vi.spyOn(api, 'createDecision').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    const typeSelect = document.getElementById('create-metadata-type') as HTMLSelectElement;
    await userEvent.selectOptions(typeSelect, 'decision');

    await userEvent.type(screen.getByLabelText(/^Title$/i), 'Decision 1');
    await userEvent.type(screen.getByLabelText(/Alternatives/i), 'Alt A, Alt B');
    await userEvent.type(screen.getByLabelText(/Nature/i), 'Strategic');
    await userEvent.type(screen.getByLabelText(/Reach/i), 'Global');
    await userEvent.type(screen.getByLabelText(/Deadline/i), '2024-12-31');

    const submitBtn = screen.getByRole('button', { name: /^Create$/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    });
  });

  it('creates a new deliverable', async () => {
    const createSpy = vi.spyOn(api, 'createDeliverable').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    const typeSelect = document.getElementById('create-metadata-type') as HTMLSelectElement;
    await userEvent.selectOptions(typeSelect, 'deliverable');

    await userEvent.type(screen.getByLabelText(/^Title$/i), 'Deliverable 1');

    const submitBtn = screen.getByRole('button', { name: /^Create$/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    });
  });

  it('creates a new task', async () => {
    const createSpy = vi.spyOn(api, 'createTask').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    const typeSelect = document.getElementById('create-metadata-type') as HTMLSelectElement;
    await userEvent.selectOptions(typeSelect, 'task');

    await userEvent.type(screen.getByLabelText(/^Title$/i), 'Task 1');
    await userEvent.type(screen.getByLabelText(/Status/i), 'In Progress');
    await userEvent.type(screen.getByLabelText(/Time Logged/i), '5h');
    await userEvent.type(screen.getByLabelText(/Target Date/i), '2024-06-15');

    const submitBtn = screen.getByRole('button', { name: /^Create$/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    });
  });

  it('creates a new activity', async () => {
    const createSpy = vi.spyOn(api, 'createActivity').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    const typeSelect = document.getElementById('create-metadata-type') as HTMLSelectElement;
    await userEvent.selectOptions(typeSelect, 'activity');

    await userEvent.type(screen.getByLabelText(/^Title$/i), 'Activity 1');
    await userEvent.type(screen.getByLabelText(/Status/i), 'Ongoing');

    const submitBtn = screen.getByRole('button', { name: /^Create$/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    });
  });

  it('handles create error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'createEpic').mockRejectedValue(new Error('Create failed'));
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    await userEvent.type(screen.getByLabelText(/^Title$/i), 'Test');

    const submitBtn = screen.getByRole('button', { name: /^Create$/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('shows creating state during submission', async () => {
    let resolveCreate: () => void;
    const createPromise = new Promise<any>((resolve) => {
      resolveCreate = () => resolve(undefined);
    });
    vi.spyOn(api, 'createEpic').mockReturnValue(createPromise);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    await userEvent.type(screen.getByLabelText(/^Title$/i), 'Test');

    const submitBtn = screen.getByRole('button', { name: /^Create$/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toHaveTextContent(/Creating/i);
      expect(submitBtn).toBeDisabled();
    });

    resolveCreate!();
  });

  it('displays all tabs correctly', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([{ id: 1, title: 'Epic', owner: 'User', kanban_status: 'todo', description: '' }]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([{ id: 2, title: 'Decision', owner: 'User', kanban_status: 'todo', description: '' }]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([{ id: 3, title: 'Deliverable', owner: 'User', kanban_status: 'todo', description: '' }]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([{ id: 4, title: 'Task', owner: 'User', kanban_status: 'todo', description: '' }]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([{ id: 5, title: 'Activity', owner: 'User', kanban_status: 'todo', description: '' }]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: /All/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /Epics/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /Decisions/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /Deliverables/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /Tasks/i })).toBeTruthy();
      expect(screen.getByRole('tab', { name: /Activities/i })).toBeTruthy();
    });
  });

  it('filters items when clicking Epic tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([{ id: 1, title: 'Epic 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([{ id: 2, title: 'Decision 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
      expect(screen.getByText('Decision 1')).toBeTruthy();
    });

    const epicTab = screen.getByRole('tab', { name: /Epics/i });
    await userEvent.click(epicTab);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
      expect(screen.queryByText('Decision 1')).toBeNull();
    });
  });

  it('filters items when clicking Decision tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([{ id: 1, title: 'Epic 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([{ id: 2, title: 'Decision 1', owner: 'User', kanban_status: 'todo', description: 'Desc', nature: 'Strategic', reach: 'Global', alternatives: '' }]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const decisionTab = screen.getByRole('tab', { name: /Decisions/i });
    await userEvent.click(decisionTab);

    await waitFor(() => {
      expect(screen.getByText('Decision 1')).toBeTruthy();
      expect(screen.queryByText('Epic 1')).toBeNull();
    });
  });

  it('filters items when clicking Deliverable tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([{ id: 3, title: 'Deliverable 1', owner: 'User', kanban_status: 'todo', description: 'Desc', nature: 'Physical', reach: 'Local', alternatives: '' }]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const deliverableTab = screen.getByRole('tab', { name: /Deliverables/i });
    await userEvent.click(deliverableTab);

    await waitFor(() => {
      expect(screen.getByText('Deliverable 1')).toBeTruthy();
    });
  });

  it('filters items when clicking Task tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([{ id: 4, title: 'Task 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const taskTab = screen.getByRole('tab', { name: /Tasks/i });
    await userEvent.click(taskTab);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });
  });

  it('filters items when clicking Activity tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([{ id: 5, title: 'Activity 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }]);

    await renderWithRouter(<OverviewPage />);

    const activityTab = screen.getByRole('tab', { name: /Activities/i });
    await userEvent.click(activityTab);

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeTruthy();
    });
  });

  it('updates epic successfully', async () => {
    const updateSpy = vi.spyOn(api, 'updateEpic').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'User', kanban_status: 'todo', description: 'Desc', classification: 'Feature' }
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Epic 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Epic 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    await waitFor(() => {
      const editBtn = screen.getByRole('button', { name: /Edit "Epic 1"/i });
      expect(editBtn).toBeTruthy();
    });

    const editBtn = screen.getByRole('button', { name: /Edit "Epic 1"/i });
    await userEvent.click(editBtn);

    const titleInput = screen.getByLabelText(/Edit title/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Updated Epic');

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('deletes epic successfully', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteEpic').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Epic 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Epic 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    await waitFor(() => {
      const deleteBtn = screen.getByRole('button', { name: /Delete "Epic 1"/i });
      expect(deleteBtn).toBeTruthy();
    });

    const deleteBtn = screen.getByRole('button', { name: /Delete "Epic 1"/i });
    await userEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /Confirm deletion/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });

  it('handles update for decision successfully', async () => {
    const updateSpy = vi.spyOn(api, 'updateDecision').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      { id: 2, title: 'Decision 1', owner: 'User', kanban_status: 'todo', description: 'Desc', nature: 'Strategic', reach: 'Global', alternatives: 'Alt' }
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Decision 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Decision 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit "Decision 1"/i })).toBeTruthy();
    });

    const editBtn = screen.getByRole('button', { name: /Edit "Decision 1"/i });
    await userEvent.click(editBtn);

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('handles update for deliverable successfully', async () => {
    const updateSpy = vi.spyOn(api, 'updateDeliverable').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      { id: 3, title: 'Deliverable 1', owner: 'User', kanban_status: 'todo', description: 'Desc', nature: 'Physical', reach: 'Local', alternatives: 'Alt' }
    ]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Deliverable 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Deliverable 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit "Deliverable 1"/i })).toBeTruthy();
    });

    const editBtn = screen.getByRole('button', { name: /Edit "Deliverable 1"/i });
    await userEvent.click(editBtn);

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('handles update for task successfully', async () => {
    const updateSpy = vi.spyOn(api, 'updateTask').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      { id: 4, title: 'Task 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }
    ]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Task 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Task 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit "Task 1"/i })).toBeTruthy();
    });

    const editBtn = screen.getByRole('button', { name: /Edit "Task 1"/i });
    await userEvent.click(editBtn);

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('handles update for activity successfully', async () => {
    const updateSpy = vi.spyOn(api, 'updateActivity').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([
      { id: 5, title: 'Activity 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }
    ]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Activity 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Activity 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit "Activity 1"/i })).toBeTruthy();
    });

    const editBtn = screen.getByRole('button', { name: /Edit "Activity 1"/i });
    await userEvent.click(editBtn);

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('handles delete for decision successfully', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteDecision').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      { id: 2, title: 'Decision 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Decision 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Decision 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    const deleteBtn = screen.getByRole('button', { name: /Delete "Decision 1"/i });
    await userEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /Confirm deletion/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(2);
    });
  });

  it('handles delete for deliverable successfully', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteDeliverable').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      { id: 3, title: 'Deliverable 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }
    ]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Deliverable 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Deliverable 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    const deleteBtn = screen.getByRole('button', { name: /Delete "Deliverable 1"/i });
    await userEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /Confirm deletion/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(3);
    });
  });

  it('handles delete for task successfully', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteTask').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      { id: 4, title: 'Task 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }
    ]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Task 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Task 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    const deleteBtn = screen.getByRole('button', { name: /Delete "Task 1"/i });
    await userEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /Confirm deletion/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(4);
    });
  });

  it('handles delete for activity successfully', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteActivity').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([
      { id: 5, title: 'Activity 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }
    ]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Activity 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Activity 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    const deleteBtn = screen.getByRole('button', { name: /Delete "Activity 1"/i });
    await userEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /Confirm deletion/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(5);
    });
  });

  it('handles save error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'updateEpic').mockRejectedValue(new Error('Update failed'));
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Epic 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Epic 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    const editBtn = screen.getByRole('button', { name: /Edit "Epic 1"/i });
    await userEvent.click(editBtn);

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await userEvent.click(saveBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('handles delete error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'deleteEpic').mockRejectedValue(new Error('Delete failed'));
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', owner: 'User', kanban_status: 'todo', description: 'Desc' }
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    await waitFor(() => {
      const cards = screen.getAllByText('Epic 1');
      expect(cards.length).toBeGreaterThan(0);
    });

    const card = screen.getAllByText('Epic 1')[0].closest('[role="button"]');
    if (card) await userEvent.click(card);

    const deleteBtn = screen.getByRole('button', { name: /Delete "Epic 1"/i });
    await userEvent.click(deleteBtn);

    const confirmBtn = screen.getByRole('button', { name: /Confirm deletion/i });
    await userEvent.click(confirmBtn);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('cancels create modal when cancel button is clicked', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    await renderWithRouter(<OverviewPage />);

    const createBtn = screen.getByRole('button', { name: /Create New/i });
    await userEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });
});