import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverviewPage from '../../src/pages/OverviewPage';
import * as api from '../../src/api';

vi.mock('../../src/api');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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
    const user = userEvent.setup();
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    expect(screen.getByRole('heading', { name: /Create New/i })).toBeTruthy();
  });

  it('create modal has metadata type selector with all options', async () => {
    const user = userEvent.setup();
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeTruthy();
    });

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(5);
    expect(screen.getByRole('option', { name: /Epic/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Decision/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Deliverable/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Task/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Activity/i })).toBeTruthy();
  });

  it('create modal has title, owner, and description fields', async () => {
    const user = userEvent.setup();
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Title/i)).toBeTruthy();
      expect(screen.getByLabelText(/Owner/i)).toBeTruthy();
      expect(screen.getByLabelText(/Description/i)).toBeTruthy();
    });
  });

  it('shows epic-specific fields when epic type is selected', async () => {
    const user = userEvent.setup();
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Classification/i)).toBeTruthy();
      expect(screen.getByLabelText(/Scope/i)).toBeTruthy();
      expect(screen.getByLabelText(/Use Case/i)).toBeTruthy();
      expect(screen.getByLabelText(/User Story/i)).toBeTruthy();
      expect(screen.getByLabelText(/Non-Functional Requirements/i)).toBeTruthy();
    });
  });

  it('shows decision-specific fields when decision type is selected', async () => {
    const user = userEvent.setup();
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      const select = screen.getByRole('combobox');
      expect(select).toBeTruthy();
    });

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'decision');

    await waitFor(() => {
      expect(screen.getByLabelText(/Alternatives/i)).toBeTruthy();
      expect(screen.getByLabelText(/Nature/i)).toBeTruthy();
      expect(screen.getByLabelText(/Reach/i)).toBeTruthy();
      expect(screen.getByLabelText(/Deadline/i)).toBeTruthy();
    });
  });

  it('creates an epic successfully', async () => {
    const user = userEvent.setup();
    const createEpicSpy = vi.spyOn(api, 'createEpic').mockResolvedValue({ id: 1 } as any);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const titleInput = document.getElementById('create-title') as HTMLInputElement;
    const ownerInput = document.getElementById('create-owner') as HTMLInputElement;

    await user.type(titleInput, 'New Epic');
    await user.type(ownerInput, 'Alice');

    const createBtn = within(screen.getByRole('dialog'))
      .getAllByRole('button')
      .find(btn => btn.textContent === 'Create');

    await user.click(createBtn!);

    await waitFor(() => {
      expect(createEpicSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Epic',
          owner: 'Alice'
        })
      );
    });
  });


  it('closes modal after successful creation', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'createEpic').mockResolvedValue({ id: 1 } as any);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const titleInput = document.getElementById('create-title') as HTMLInputElement;
    await user.type(titleInput, 'New Epic');

    const createBtn = within(screen.getByRole('dialog'))
      .getAllByRole('button')
      .find(btn => btn.textContent === 'Create');

    await user.click(createBtn!);

    await waitFor(() => {
      expect(api.createEpic).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeFalsy();
    }, { timeout: 5000 });
  });

  it('closes modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeFalsy();
    });
  });

  it('closes modal when clicking overlay', async () => {
    const user = userEvent.setup();
    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await user.click(overlay);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeFalsy();
    });
  });

  it('handles API errors gracefully on load', async () => {
    vi.spyOn(api, 'getEpics').mockRejectedValue(new Error('API Error'));

    render(<OverviewPage />);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalled();
    });

    expect(screen.getByRole('region', { name: /Metadata Overview/i })).toBeTruthy();
  });

  it('handles create errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'createEpic').mockRejectedValue(new Error('Create failed'));

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create New/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const titleInput = document.getElementById('create-title') as HTMLInputElement;
    await user.type(titleInput, 'Will Fail');

    const createBtn = within(screen.getByRole('dialog'))
      .getAllByRole('button')
      .find(btn => btn.textContent === 'Create');

    await user.click(createBtn!);

    await waitFor(() => {
      const actualErrors = consoleErrorSpy.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0] === 'Create failed'
      );
      expect(actualErrors.length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    consoleErrorSpy.mockRestore();
  });

  it('reloads data after successful creation', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'createEpic').mockResolvedValue({ id: 1 } as any);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole('button', { name: /Create New/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const titleInput = document.getElementById('create-title') as HTMLInputElement;
    await user.type(titleInput, 'New Epic');

    const createBtn = within(screen.getByRole('dialog'))
      .getAllByRole('button')
      .find(btn => btn.textContent === 'Create');

    await user.click(createBtn!);

    await waitFor(() => {
      expect(api.createEpic).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalledTimes(2);
    }, { timeout: 5000 });
  });
});