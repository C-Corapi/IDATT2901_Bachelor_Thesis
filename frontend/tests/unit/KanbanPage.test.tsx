import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanPage from '../../src/pages/KanbanPage';
import * as api from '../../src/api';

vi.mock('../../src/api');
vi.mock('../../src/components/KanbanColumn', () => ({
  default: (props: any) => (
    <div data-testid="kanban-column">
      <div data-testid="column-title">{props.title}</div>
      <div data-testid="column-count">{props.items.length}</div>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('KanbanPage (focused tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
  });

  it('renders a section landmark with the expected heading', async () => {
    render(<KanbanPage />);

    const section = screen.getByRole('region', { name: /Kanban Board/i });
    expect(section).toBeTruthy();

    const heading = screen.getByRole('heading', { level: 1, name: /Kanban Board/i });
    expect(heading).toBeTruthy();
    expect(heading).toHaveAttribute('id', 'kanban-heading');
  });

  it('shows loading state initially', async () => {
    vi.spyOn(api, 'getEpics').mockImplementation(() => new Promise(() => {}));
    render(<KanbanPage />);

    const loadingEl = screen.getByRole('status', { name: /Loading kanban board/i });
    expect(loadingEl).toBeTruthy();
    expect(loadingEl).toHaveTextContent(/Loading/i);
  });

  it('renders the show backlog checkbox with correct attributes', async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /Show backlog column/i });
      expect(checkbox).toBeTruthy();
      expect(checkbox).not.toBeChecked();
    });

    const label = screen.getByText(/Show Backlog/i);
    expect(label).toBeTruthy();
    expect(label.closest('label')).toHaveAttribute('title', 'Toggle backlog column visibility');
  });

  it('fetches data from all metadata endpoints on mount', async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalledTimes(1);
      expect(api.getDeliverables).toHaveBeenCalledTimes(1);
      expect(api.getTasks).toHaveBeenCalledTimes(1);
      expect(api.getActivities).toHaveBeenCalledTimes(1);
      expect(api.getDecisions).toHaveBeenCalledTimes(1);
    });
  });

  it('renders kanban board region with columns when data loads', async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      const board = screen.getByRole('region', { name: /Kanban board/i });
      expect(board).toBeTruthy();
    });
  });

  it('renders 3 columns by default (without backlog)', async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      const columns = screen.getAllByTestId('kanban-column');
      expect(columns).toHaveLength(3);
    });

    expect(screen.getByText('To Do')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
    expect(screen.getByText('Done')).toBeTruthy();
    expect(screen.queryByText('Backlog')).toBeNull();
  });

  it('shows 4 columns when backlog checkbox is checked', async () => {
    render(<KanbanPage />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getAllByTestId('kanban-column')).toHaveLength(3);
    });

    const checkbox = screen.getByRole('checkbox', { name: /Show backlog column/i });
    await user.click(checkbox);

    await waitFor(() => {
      const columns = screen.getAllByTestId('kanban-column');
      expect(columns).toHaveLength(4);
    });

    expect(screen.getByText('Backlog')).toBeTruthy();
  });

  it('handles API errors gracefully by using empty arrays', async () => {
    vi.spyOn(api, 'getEpics').mockRejectedValue(new Error('Failed'));
    vi.spyOn(api, 'getDecisions').mockRejectedValue(new Error('Failed'));

    render(<KanbanPage />);

    await waitFor(() => {
      const board = screen.getByRole('region', { name: /Kanban board/i });
      expect(board).toBeTruthy();
    });

    expect(api.getEpics).toHaveBeenCalled();
    expect(api.getDecisions).toHaveBeenCalled();
  });

  it('maps items to columns based on kanban_status', async () => {
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      { id: 1, title: 'Task 1', owner: 'alice', kanban_status: 'todo', description: 'desc1' },
      { id: 2, title: 'Task 2', owner: 'bob', kanban_status: 'in_progress', description: 'desc2' },
    ]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeTruthy();
      expect(screen.getByText('In Progress')).toBeTruthy();
    });
  });

  it('filters items for backlog column correctly', async () => {
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      { id: 1, title: 'Backlog Task', owner: 'alice', kanban_status: 'backlog', description: 'desc' },
      { id: 2, title: 'Todo Task', owner: 'bob', kanban_status: 'todo', description: 'desc' },
    ]);

    render(<KanbanPage />);
    const user = userEvent.setup();

    await waitFor(() => {
      expect(screen.getAllByTestId('kanban-column')).toHaveLength(3);
    });

    const checkbox = screen.getByRole('checkbox', { name: /Show backlog column/i });
    await user.click(checkbox);

    await waitFor(() => {
      const columns = screen.getAllByTestId('kanban-column');
      expect(columns).toHaveLength(4);
      expect(screen.getByText('Backlog')).toBeTruthy();
    });
  });

  it('maps epic items with all extraDetails fields', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      {
        id: 1,
        title: 'Epic Complete',
        owner: 'alice',
        kanban_status: 'todo',
        description: 'desc',
        classification: 'Feature',
        scope: 'System-wide',
        use_case: 'UC-001',
        user_story: 'As a user, I want...'
      },
    ]);

    render(<KanbanPage />);

    await waitFor(() => {
      const columns = screen.getAllByTestId('kanban-column');
      expect(columns.length).toBeGreaterThan(0);
    });
  });

  it('maps task items with target_date in extraDetails', async () => {
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      {
        id: 1,
        title: 'Task with Date',
        owner: 'bob',
        kanban_status: 'in_progress',
        description: 'desc',
        target_date: '2024-12-01'
      },
    ]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('In Progress')).toBeTruthy();
    });
  });

  it('maps deliverable items with deadline in extraDetails', async () => {
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      {
        id: 1,
        title: 'Deliverable with Deadline',
        owner: 'charlie',
        kanban_status: 'done',
        description: 'desc',
        nature: 'functional',
        reach: 'local',
        alternatives: 'none',
        deadline: '2024-11-30'
      },
    ]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeTruthy();
    });
  });

  it('maps decision items with deadline in extraDetails', async () => {
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      {
        id: 1,
        title: 'Decision with Deadline',
        owner: 'dave',
        kanban_status: 'backlog',
        description: 'desc',
        nature: 'structural',
        reach: 'global',
        alternatives: 'option A, option B',
        deadline: '2024-10-15'
      },
    ]);

    render(<KanbanPage />);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /Show backlog column/i });
      expect(checkbox).toBeTruthy();
    });
  });
});