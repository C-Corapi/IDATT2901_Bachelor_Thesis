import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanPage from '../../src/pages/KanbanPage';
import * as api from '../../src/api';

vi.mock('../../src/api');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('KanbanPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
  });

  it('renders complete page structure', async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      const section = screen.getByRole('region', { name: /Kanban Board/i });
      expect(section).toBeTruthy();
    });

    const heading = screen.getByRole('heading', { level: 1, name: /Kanban Board/i });
    expect(heading).toBeTruthy();
    expect(heading).toHaveAttribute('id', 'kanban-heading');
  });

  it('displays loading state initially', () => {
    vi.spyOn(api, 'getEpics').mockImplementation(() => new Promise(() => {}));
    render(<KanbanPage />);

    const loadingMsg = screen.getByRole('status', { name: /Loading kanban board/i });
    expect(loadingMsg).toBeTruthy();
    expect(loadingMsg).toHaveTextContent(/Loading/i);
  });

  it('renders toolbar with backlog toggle', async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.queryByRole('status')).toBeFalsy();
    });

    const toggle = screen.getByRole('checkbox', { name: /Show backlog column/i });
    expect(toggle).toBeTruthy();
    expect(toggle).not.toBeChecked();
  });

  it('loads all metadata types on mount', async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalled();
      expect(api.getDeliverables).toHaveBeenCalled();
      expect(api.getTasks).toHaveBeenCalled();
      expect(api.getActivities).toHaveBeenCalled();
      expect(api.getDecisions).toHaveBeenCalled();
    });
  });

  it('renders kanban board region after loading', async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      const boardDiv = document.querySelector('.kanban');
      expect(boardDiv).toBeTruthy();
      expect(boardDiv).toHaveClass('kanban');
    });
  });

  it('displays three columns by default (To Do, In Progress, Done)', async () => {
    render(<KanbanPage />);

    await waitFor(() => {
      const todoColumn = screen.getByRole('region', { name: /To Do column/i });
      const inProgressColumn = screen.getByRole('region', { name: /In Progress column/i });
      const doneColumn = screen.getByRole('region', { name: /Done column/i });

      expect(todoColumn).toBeTruthy();
      expect(inProgressColumn).toBeTruthy();
      expect(doneColumn).toBeTruthy();
    });
  });

  it('shows backlog column when toggle is checked', async () => {
    const user = userEvent.setup();
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /Kanban board/i })).toBeTruthy();
    });

    const toggle = screen.getByRole('checkbox', { name: /Show backlog column/i });
    await user.click(toggle);

    await waitFor(() => {
      expect(toggle).toBeChecked();
      const backlogColumn = screen.getByRole('region', { name: /Backlog column/i });
      expect(backlogColumn).toBeTruthy();
    });
  });

  it('hides backlog column when toggle is unchecked', async () => {
    const user = userEvent.setup();
    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /Kanban board/i })).toBeTruthy();
    });

    const toggle = screen.getByRole('checkbox', { name: /Show backlog column/i });

    // Check
    await user.click(toggle);
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /Backlog column/i })).toBeTruthy();
    });

    // Uncheck
    await user.click(toggle);
    await waitFor(() => {
      expect(toggle).not.toBeChecked();
      expect(screen.queryByRole('region', { name: /Backlog column/i })).toBeFalsy();
    });
  });

  it('displays epics in correct columns based on status', async () => {
    const mockEpics = [
      { id: 1, title: 'Epic Todo', owner: 'Alice', kanban_status: 'todo', description: 'Desc 1' },
      { id: 2, title: 'Epic In Progress', owner: 'Bob', kanban_status: 'in_progress', description: 'Desc 2' },
      { id: 3, title: 'Epic Done', owner: 'Charlie', kanban_status: 'done', description: 'Desc 3' },
    ];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic Todo')).toBeTruthy();
      expect(screen.getByText('Epic In Progress')).toBeTruthy();
      expect(screen.getByText('Epic Done')).toBeTruthy();
    });
  });

  it('displays items with owner information', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', owner: 'Dave', kanban_status: 'todo', description: 'Task desc' },
    ];

    vi.spyOn(api, 'getTasks').mockResolvedValue(mockTasks);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
      expect(screen.getByText('Dave')).toBeTruthy();
    });
  });

  it('displays item count in column header', async () => {
    const mockEpics = [
      { id: 1, title: 'Epic 1', owner: 'Alice', kanban_status: 'todo', description: 'Desc' },
      { id: 2, title: 'Epic 2', owner: 'Bob', kanban_status: 'todo', description: 'Desc' },
    ];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);

    render(<KanbanPage />);

    await waitFor(() => {
      const todoColumn = screen.getByRole('region', { name: /To Do column — 2 items/i });
      expect(todoColumn).toBeTruthy();
    });
  });

  it('expands card when clicked', async () => {
    const user = userEvent.setup();
    const mockEpics = [
      {
        id: 1,
        title: 'Epic 1',
        owner: 'Alice',
        kanban_status: 'todo',
        description: 'Epic description',
        classification: 'Feature'
      },
    ];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    const card = screen.getByRole('button', { name: /Epic 1/i });
    await user.click(card);

    await waitFor(() => {
      expect(screen.getByText('Epic description')).toBeTruthy();
    });
  });

  it('shows edit and delete buttons in expanded card', async () => {
    const user = userEvent.setup();
    const mockTasks = [
      { id: 1, title: 'Task 1', owner: 'Eve', kanban_status: 'todo', description: 'Task desc' },
    ];

    vi.spyOn(api, 'getTasks').mockResolvedValue(mockTasks);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });

    const card = screen.getByRole('button', { name: /Task 1/i });
    await user.click(card);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit "Task 1"/i })).toBeTruthy();
      expect(screen.getByRole('button', { name: /Delete "Task 1"/i })).toBeTruthy();
    });
  });

  it('allows editing card details', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'updateEpic').mockResolvedValue({} as any);

    const mockEpics = [
      { id: 1, title: 'Epic 1', owner: 'Alice', kanban_status: 'todo', description: 'Original desc' },
    ];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    const card = screen.getByRole('button', { name: /Epic 1/i });
    await user.click(card);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Edit "Epic 1"/i })).toBeTruthy();
    });

    const editBtn = screen.getByRole('button', { name: /Edit "Epic 1"/i });
    await user.click(editBtn);

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Edit title/i);
      expect(titleInput).toBeTruthy();
    });

    const titleInput = screen.getByLabelText(/Edit title/i) as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Epic');

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(api.updateEpic).toHaveBeenCalledWith(1, expect.objectContaining({
        title: 'Updated Epic',
        name: 'Updated Epic'
      }));
    });
  });

  it('shows delete confirmation modal', async () => {
    const user = userEvent.setup();
    const mockTasks = [
      { id: 1, title: 'Task to Delete', owner: 'Bob', kanban_status: 'todo', description: 'Desc' },
    ];

    vi.spyOn(api, 'getTasks').mockResolvedValue(mockTasks);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Task to Delete')).toBeTruthy();
    });

    const card = screen.getByRole('button', { name: /Task to Delete/i });
    await user.click(card);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete "Task to Delete"/i })).toBeTruthy();
    });

    const deleteBtn = screen.getByRole('button', { name: /Delete "Task to Delete"/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      const dialog = screen.getByRole('alertdialog');
      expect(dialog).toBeTruthy();
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeTruthy();
      expect(screen.getByText(/"Task to Delete"/i)).toBeTruthy();
    });
  });

  it('deletes item after confirmation', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'deleteTask').mockResolvedValue();

    const mockTasks = [
      { id: 1, title: 'Task to Delete', owner: 'Bob', kanban_status: 'todo', description: 'Desc' },
    ];

    vi.spyOn(api, 'getTasks').mockResolvedValue(mockTasks);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Task to Delete')).toBeTruthy();
    });

    const card = screen.getByRole('button', { name: /Task to Delete/i });
    await user.click(card);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete "Task to Delete"/i })).toBeTruthy();
    });

    const deleteBtn = screen.getByRole('button', { name: /Delete "Task to Delete"/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeTruthy();
    });

    const confirmBtn = within(screen.getByRole('alertdialog'))
      .getAllByRole('button')
      .find(btn => btn.textContent === 'Yes, delete');
    if (!confirmBtn) throw new Error('Confirm button not found');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(api.deleteTask).toHaveBeenCalledWith(1);
    });
  });

  it('cancels deletion from modal', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'deleteTask').mockResolvedValue();

    const mockTasks = [
      { id: 1, title: 'Task 1', owner: 'Bob', kanban_status: 'todo', description: 'Desc' },
    ];

    vi.spyOn(api, 'getTasks').mockResolvedValue(mockTasks);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });

    const card = screen.getByRole('button', { name: /Task 1/i });
    await user.click(card);

    const deleteBtn = screen.getByRole('button', { name: /Delete "Task 1"/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeTruthy();
    });

    const cancelBtn = screen.getByRole('button', { name: /Cancel deletion/i });
    await user.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeFalsy();
      expect(api.deleteTask).not.toHaveBeenCalled();
    });
  });

  it('displays mixed metadata types across columns', async () => {
    const mockEpics = [{ id: 1, title: 'Epic', owner: 'A', kanban_status: 'todo', description: 'D' }];
    const mockTasks = [{ id: 2, title: 'Task', owner: 'B', kanban_status: 'in_progress', description: 'D' }];
    const mockDecisions = [{ id: 3, title: 'Decision', owner: 'C', kanban_status: 'done', description: 'D', nature: 'Tech', reach: 'Team' }];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);
    vi.spyOn(api, 'getTasks').mockResolvedValue(mockTasks);
    vi.spyOn(api, 'getDecisions').mockResolvedValue(mockDecisions);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic')).toBeTruthy();
      expect(screen.getByText('Task')).toBeTruthy();
      expect(screen.getByText('Decision')).toBeTruthy();
    });
  });

  it('displays backlog items only when backlog is shown', async () => {
    const user = userEvent.setup();
    const mockEpics = [
      { id: 1, title: 'Backlog Epic', owner: 'Alice', kanban_status: 'backlog', description: 'Desc' },
      { id: 2, title: 'Todo Epic', owner: 'Bob', kanban_status: 'todo', description: 'Desc' },
    ];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Todo Epic')).toBeTruthy();
      expect(screen.queryByText('Backlog Epic')).toBeFalsy();
    });

    const toggle = screen.getByRole('checkbox', { name: /Show backlog column/i });
    await user.click(toggle);

    await waitFor(() => {
      expect(screen.getByText('Backlog Epic')).toBeTruthy();
      expect(screen.getByText('Todo Epic')).toBeTruthy();
    });
  });

  it('handles API errors gracefully', async () => {
    vi.spyOn(api, 'getEpics').mockRejectedValue(new Error('API Error'));
    vi.spyOn(api, 'getDeliverables').mockRejectedValue(new Error('API Error'));
    vi.spyOn(api, 'getTasks').mockRejectedValue(new Error('API Error'));
    vi.spyOn(api, 'getActivities').mockRejectedValue(new Error('API Error'));
    vi.spyOn(api, 'getDecisions').mockRejectedValue(new Error('API Error'));

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /Kanban board/i })).toBeTruthy();
    });

    await waitFor(() => {
      const todoColumn = screen.getByRole('region', { name: /To Do column — 0 items/i });
      expect(todoColumn).toBeTruthy();
    });
  });

  it('reloads data after save', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'updateEpic').mockResolvedValue({} as any);

    const mockEpics = [
      { id: 1, title: 'Epic 1', owner: 'Alice', kanban_status: 'todo', description: 'Desc' },
    ];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalledTimes(1);
    });

    const card = screen.getByRole('button', { name: /Epic 1/i });
    await user.click(card);

    const editBtn = screen.getByRole('button', { name: /Edit "Epic 1"/i });
    await user.click(editBtn);

    const titleInput = screen.getByLabelText(/Edit title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated');

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(api.getEpics).toHaveBeenCalledTimes(2);
    });
  });

  it('reloads data after delete', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'deleteTask').mockResolvedValue();

    const mockTasks = [
      { id: 1, title: 'Task 1', owner: 'Bob', kanban_status: 'todo', description: 'Desc' },
    ];

    vi.spyOn(api, 'getTasks').mockResolvedValue(mockTasks);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(api.getTasks).toHaveBeenCalledTimes(1);
    });

    const card = screen.getByRole('button', { name: /Task 1/i });
    await user.click(card);

    const deleteBtn = screen.getByRole('button', { name: /Delete "Task 1"/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeTruthy();
    });

    const confirmBtn = within(screen.getByRole('alertdialog'))
      .getAllByRole('button')
      .find(btn => btn.textContent === 'Yes, delete');
    if (!confirmBtn) throw new Error('Confirm button not found');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(api.getTasks).toHaveBeenCalledTimes(2);
    });
  });

  it('handles save errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'updateEpic').mockRejectedValue(new Error('Save failed'));

    const mockEpics = [
      { id: 1, title: 'Epic 1', owner: 'Alice', kanban_status: 'todo', description: 'Desc' },
    ];

    vi.spyOn(api, 'getEpics').mockResolvedValue(mockEpics);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    const card = screen.getByRole('button', { name: /Epic 1/i });
    await user.click(card);

    const editBtn = screen.getByRole('button', { name: /Edit "Epic 1"/i });
    await user.click(editBtn);

    const titleInput = screen.getByLabelText(/Edit title/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Will Fail');

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await user.click(saveBtn);

    await waitFor(() => {
      const actualErrors = consoleErrorSpy.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0] === 'Save failed'
      );
      expect(actualErrors.length).toBeGreaterThan(0);
    });

    consoleErrorSpy.mockRestore();
  });

  it('handles delete errors gracefully', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'deleteTask').mockRejectedValue(new Error('Delete failed'));

    const mockTasks = [
      { id: 1, title: 'Task 1', owner: 'Bob', kanban_status: 'todo', description: 'Desc' },
    ];

    vi.spyOn(api, 'getTasks').mockResolvedValue(mockTasks);

    render(<KanbanPage />);

    await waitFor(() => {
      expect(screen.getByText('Task 1')).toBeTruthy();
    });

    const card = screen.getByRole('button', { name: /Task 1/i });
    await user.click(card);

    const deleteBtn = screen.getByRole('button', { name: /Delete "Task 1"/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeTruthy();
    });

    const confirmBtn = within(screen.getByRole('alertdialog'))
      .getAllByRole('button')
      .find(btn => btn.textContent === 'Yes, delete');

    if (!confirmBtn) throw new Error('Confirm delete button not found');

    await user.click(confirmBtn);

    await waitFor(() => {
      const actualErrors = consoleErrorSpy.mock.calls.filter(call =>
        typeof call[0] === 'string' && call[0] === 'Delete failed'
      );
      expect(actualErrors.length).toBeGreaterThan(0);
    });

    consoleErrorSpy.mockRestore();
  });
});