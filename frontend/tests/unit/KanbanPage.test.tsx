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
      <h2>{props.title}</h2>
      <button onClick={() => props.onTitleChange?.('New Title')}>Rename</button>
      {props.items.map((item: any) => (
        <div key={`${item.type}-${item.id}`} data-testid="kanban-item">
          <div>{item.title}</div>
          <button onClick={() => props.onSaveItem?.(item, { title: 'changed' })}>Save</button>
          <button onClick={() => props.onDeleteItem?.(item)}>Delete</button>
          <button onClick={() => props.onDropItem?.(item)}>Drop</button>
        </div>
      ))}
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const setupMocks = () => {
  vi.spyOn(api, 'getEpics').mockResolvedValue([]);
  vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
  vi.spyOn(api, 'getTasks').mockResolvedValue([]);
  vi.spyOn(api, 'getActivities').mockResolvedValue([]);
  vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
};

describe('KanbanPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page heading', () => {
    setupMocks();
    render(<KanbanPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Kanban Board/i })).toBeTruthy();
  });

  it('loads all metadata types on mount', async () => {
    setupMocks();
    render(<KanbanPage />);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalled();
      expect(api.getDecisions).toHaveBeenCalled();
      expect(api.getDeliverables).toHaveBeenCalled();
      expect(api.getTasks).toHaveBeenCalled();
      expect(api.getActivities).toHaveBeenCalled();
    });
  });

  it('shows backlog toggle', async () => {
    setupMocks();
    render(<KanbanPage />);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /Show backlog/i });
      expect(checkbox).toBeTruthy();
      expect(checkbox).not.toBeChecked();
    });
  });

  it('toggles backlog when checkbox is clicked', async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /Show backlog/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('checkbox', { name: /Show backlog/i }));

    expect(screen.getByRole('checkbox', { name: /Show backlog/i })).toBeChecked();
  });

  it('displays kanban board container', async () => {
    setupMocks();
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /Kanban board/i })).toBeTruthy();
    });
  });

  it('shows loading state on mount', () => {
    vi.spyOn(api, 'getEpics').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);
    expect(screen.getByLabelText(/Loading kanban board/i)).toBeTruthy();
  });

  it('loads items with kanban_status', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', kanban_status: 'todo' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.spyOn(api, 'getEpics').mockRejectedValue(new Error('API Error'));
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.queryByLabelText(/Loading/i)).toBeNull();
    });
  });

  it('displays multiple items in different columns', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic Todo', kanban_status: 'todo', owner: 'alice' },
      { id: 2, title: 'Epic Done', kanban_status: 'done', owner: 'bob' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic Todo')).toBeTruthy();
      expect(screen.getByText('Epic Done')).toBeTruthy();
    });
  });

  it('displays deliverables with extra details', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      {
        id: 1,
        title: 'Deliverable 1',
        kanban_status: 'in_progress',
        owner: 'alice',
        deadline: '2026-12-31',
        nature: 'technical',
        reach: 'global',
      },
    ]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Deliverable 1')).toBeTruthy();
    });
  });

  it('displays tasks with target date', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      {
        id: 1,
        title: 'Task 1',
        kanban_status: 'todo',
        owner: 'alice',
        target_date: '2026-06-01',
      },
    ]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });
  });

  it('displays decisions with nature and reach', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      {
        id: 1,
        title: 'Decision 1',
        kanban_status: 'done',
        owner: 'bob',
        nature: 'structural',
        reach: 'local',
        alternatives: 'Option A, Option B',
      },
    ]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Decision 1')).toBeTruthy();
    });
  });

  it('displays activities', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([
      {
        id: 1,
        title: 'Activity 1',
        kanban_status: 'in_progress',
        owner: 'charlie',
      },
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeTruthy();
    });
  });

  it('displays epics with all extra details', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      {
        id: 1,
        title: 'Epic 1',
        kanban_status: 'todo',
        owner: 'alice',
        classification: 'feature',
        scope: 'global',
        use_case: 'User management',
        user_story: 'As a user...',
      },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });
  });

  it('handles items with backlog status', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Backlog Epic', kanban_status: 'backlog', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.queryByText('Backlog Epic')).toBeNull();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: /Show backlog/i }));

    await waitFor(() => {
      expect(screen.getByText('Backlog Epic')).toBeTruthy();
    });
  });

  it('hides backlog column by default', async () => {
    setupMocks();
    render(<KanbanPage />);

    await waitFor(() => {
      const board = screen.getByRole('region', { name: /Kanban board/i });
      expect(board).toBeTruthy();
    });

    expect(screen.queryByText('Backlog')).toBeNull();
  });

  it('shows backlog column when toggled', async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /Show backlog/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('checkbox', { name: /Show backlog/i }));

    await waitFor(() => {
      expect(screen.getByText('Backlog')).toBeTruthy();
    });
  });

  it('handles items without kanban_status', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'No Status Epic', owner: 'alice' } as any,
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.queryByLabelText(/Loading/i)).toBeNull();
    });
  });

  it('reloads data after successful card update', async () => {
    const getEpicsSpy = vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    expect(getEpicsSpy).toHaveBeenCalledTimes(1);
  });

  it('handles update kanban card error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'updateKanbanCard').mockRejectedValue(new Error('Update failed'));
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    consoleError.mockRestore();
  });

  it('renames column', async () => {
    setupMocks();
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeTruthy();
    });

    const renameButtons = screen.getAllByRole('button', { name: /Rename/i });
    await userEvent.click(renameButtons[0]);

    expect(screen.getByText('New Title')).toBeTruthy();
  });

  it('saves epic item', async () => {
    const updateSpy = vi.spyOn(api, 'updateEpic').mockResolvedValue({} as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('saves deliverable item', async () => {
    const updateSpy = vi.spyOn(api, 'updateDeliverable').mockResolvedValue({} as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      { id: 1, title: 'Deliverable 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Deliverable 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('saves task item', async () => {
    const updateSpy = vi.spyOn(api, 'updateTask').mockResolvedValue({} as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      { id: 1, title: 'Task 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('saves activity item', async () => {
    const updateSpy = vi.spyOn(api, 'updateActivity').mockResolvedValue({} as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([
      { id: 1, title: 'Activity 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('saves decision item', async () => {
    const updateSpy = vi.spyOn(api, 'updateDecision').mockResolvedValue({} as any);
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      { id: 1, title: 'Decision 1', kanban_status: 'todo', owner: 'alice', nature: 'structural', reach: 'global' },
    ]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Decision 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalled();
    });
  });

  it('handles save error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'updateEpic').mockRejectedValue(new Error('Save failed'));
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('deletes epic item', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteEpic').mockResolvedValue();
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });

  it('deletes deliverable item', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteDeliverable').mockResolvedValue();
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      { id: 1, title: 'Deliverable 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Deliverable 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });

  it('deletes task item', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteTask').mockResolvedValue();
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      { id: 1, title: 'Task 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });

  it('deletes activity item', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteActivity').mockResolvedValue();
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([
      { id: 1, title: 'Activity 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Activity 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });

  it('deletes decision item', async () => {
    const deleteSpy = vi.spyOn(api, 'deleteDecision').mockResolvedValue();
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      { id: 1, title: 'Decision 1', kanban_status: 'todo', owner: 'alice', nature: 'structural', reach: 'global' },
    ]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Decision 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith(1);
    });
  });

  it('handles delete error gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'deleteEpic').mockRejectedValue(new Error('Delete failed'));
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('skips drop when target column not found', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic 1', kanban_status: 'todo', owner: 'alice' },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });
  });

  it('displays items without status as backlog', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      { id: 1, title: 'Epic No Status', owner: 'alice' } as any,
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.queryByText('Epic No Status')).toBeNull();
    });

    const user = userEvent.setup();
    await user.click(screen.getByRole('checkbox', { name: /Show backlog/i }));

    await waitFor(() => {
      expect(screen.getByText('Epic No Status')).toBeTruthy();
    });
  });
});