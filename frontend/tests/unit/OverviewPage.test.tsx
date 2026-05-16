import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverviewPage from '../../src/pages/OverviewPage';
import * as api from '../../src/api';

vi.mock('../../src/api');
vi.mock('../../src/components/StatsSummary', () => ({
  default: (props: any) => <div data-testid="stats-summary">{props.stats.map((s: any, i: number) => <div key={i}>{s.label}</div>)}</div>,
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
    <div data-testid="metadata-card">
      <div>{props.title}</div>
      <button onClick={() => props.onSave?.({ title: 'changed' })}>Save</button>
      <button onClick={() => props.onDelete?.()}>Delete</button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mockAllApis = () => {
  vi.spyOn(api, 'getEpics').mockResolvedValue([]);
  vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
  vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
  vi.spyOn(api, 'getTasks').mockResolvedValue([]);
  vi.spyOn(api, 'getActivities').mockResolvedValue([]);
};

describe('OverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllApis();
  });

  describe('Page structure', () => {
    it('renders page heading', async () => {
      render(<OverviewPage />);
      const heading = screen.getByRole('heading', { level: 1, name: /Metadata Overview/i });
      expect(heading).toBeTruthy();
      expect(heading).toHaveAttribute('id', 'overview-heading');
    });

    it('renders StatsSummary component', async () => {
      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('stats-summary')).toBeTruthy();
      });
    });

    it('renders FilterTabs component', async () => {
      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('filter-tabs')).toBeTruthy();
      });
    });

    it('renders Create New button', async () => {
      render(<OverviewPage />);
      const btn = screen.getByRole('button', { name: /Create New/i });
      expect(btn).toBeTruthy();
      expect(btn.className).toContain('btn-primary');
    });
  });

  describe('Data loading', () => {
    it('loads all metadata types on mount', async () => {
      render(<OverviewPage />);
      await waitFor(() => {
        expect(api.getEpics).toHaveBeenCalled();
        expect(api.getDecisions).toHaveBeenCalled();
        expect(api.getDeliverables).toHaveBeenCalled();
        expect(api.getTasks).toHaveBeenCalled();
        expect(api.getActivities).toHaveBeenCalled();
      });
    });

    it('shows loading state initially', () => {
      vi.spyOn(api, 'getEpics').mockImplementation(() => new Promise(() => {}));
      render(<OverviewPage />);
      expect(screen.getByRole('status', { name: /Loading metadata/i })).toBeTruthy();
    });

    it('handles API errors gracefully', async () => {
      vi.spyOn(api, 'getEpics').mockRejectedValue(new Error('Failed'));
      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.queryByRole('status', { name: /Loading/i })).toBeNull();
      });
    });
  });

  describe('Tab filtering', () => {
    it('displays All tab content by default', async () => {
      vi.spyOn(api, 'getEpics').mockResolvedValue([
        { id: 1, title: 'Epic 1', kanban_status: 'todo' },
      ]);
      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });
    });

    it('filters to epic tab', async () => {
      vi.spyOn(api, 'getEpics').mockResolvedValue([
        { id: 1, title: 'Epic 1', kanban_status: 'todo' },
        { id: 2, title: 'Epic 2', kanban_status: 'done' },
      ]);
      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('filter-tabs')).toBeTruthy();
      });
      await userEvent.click(screen.getByRole('button', { name: /Epics/i }));
      expect(screen.getAllByTestId('metadata-card')).toHaveLength(2);
    });

    it('filters to decision tab', async () => {
      vi.spyOn(api, 'getDecisions').mockResolvedValue([
        { id: 1, title: 'Decision 1', kanban_status: 'done' },
      ]);
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Decisions/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });
    });

    it('filters to deliverable tab', async () => {
      vi.spyOn(api, 'getDeliverables').mockResolvedValue([
        { id: 1, title: 'Deliverable 1', kanban_status: 'in_progress' },
      ]);
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Deliverables/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });
    });

    it('filters to task tab', async () => {
      vi.spyOn(api, 'getTasks').mockResolvedValue([
        { id: 1, title: 'Task 1', kanban_status: 'todo' },
      ]);
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Tasks/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });
    });

    it('filters to activity tab', async () => {
      vi.spyOn(api, 'getActivities').mockResolvedValue([
        { id: 1, title: 'Activity 1', kanban_status: 'done' },
      ]);
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Activities/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });
    });
  });

  describe('Create modal', () => {
    it('opens create modal on button click', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      expect(screen.getByRole('dialog')).toBeTruthy();
      expect(screen.getByRole('heading', { name: /Create New/i })).toBeTruthy();
    });

    it('closes modal on Cancel', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('closes modal on overlay click', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      const overlay = document.querySelector('.modal-overlay') as HTMLElement;
      await userEvent.click(overlay);
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('has metadata type selector', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(5);
    });

    it('has input fields for title and owner', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      const dialog = screen.getByRole('dialog');
      const inputs = within(dialog).getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('shows type-specific fields for epic', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'epic');
      expect(screen.getByLabelText(/Classification/i)).toBeTruthy();
      expect(screen.getByLabelText(/Scope/i)).toBeTruthy();
    });

    it('shows type-specific fields for decision', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'decision');
      expect(screen.getByLabelText(/Alternatives/i)).toBeTruthy();
      expect(screen.getByLabelText(/Nature/i)).toBeTruthy();
    });

    it('shows type-specific fields for task', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'task');
      expect(screen.getByLabelText(/Status/i)).toBeTruthy();
      expect(screen.getByLabelText(/Target Date/i)).toBeTruthy();
    });

    it('shows type-specific fields for activity', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'activity');
      expect(screen.getByLabelText(/Status/i)).toBeTruthy();
    });

    it('shows type-specific fields for deliverable', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'deliverable');
      expect(screen.getByLabelText(/Alternatives/i)).toBeTruthy();
      expect(screen.getByLabelText(/Nature/i)).toBeTruthy();
      expect(screen.getByLabelText(/Reach/i)).toBeTruthy();
    });

    it('prevents dialog close when clicking inside modal', async () => {
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));
      const dialog = screen.getByRole('dialog');
      await userEvent.click(dialog);
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
  });

  describe('Create operations', () => {
    it('creates epic', async () => {
      const createSpy = vi.spyOn(api, 'createEpic').mockResolvedValue({ id: 1 } as any);
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

      const dialog = screen.getByRole('dialog');
      const titleInput = within(dialog).getAllByRole('textbox')[0];
      await userEvent.type(titleInput, 'New Epic');

      const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
      await userEvent.click(createBtns.find((btn) => btn.className.includes('btn-primary'))!);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Epic' }));
      });
    });

    it('creates decision', async () => {
      const createSpy = vi.spyOn(api, 'createDecision').mockResolvedValue({ id: 1 } as any);
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'decision');

      const dialog = screen.getByRole('dialog');
      const titleInput = within(dialog).getAllByRole('textbox')[0];
      await userEvent.type(titleInput, 'New Decision');

      const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
      await userEvent.click(createBtns.find((btn) => btn.className.includes('btn-primary'))!);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalled();
      });
    });

    it('creates deliverable', async () => {
      const createSpy = vi.spyOn(api, 'createDeliverable').mockResolvedValue({ id: 1 } as any);
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'deliverable');

      const dialog = screen.getByRole('dialog');
      const titleInput = within(dialog).getAllByRole('textbox')[0];
      await userEvent.type(titleInput, 'New Deliverable');

      const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
      await userEvent.click(createBtns.find((btn) => btn.className.includes('btn-primary'))!);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalled();
      });
    });

    it('creates task', async () => {
      const createSpy = vi.spyOn(api, 'createTask').mockResolvedValue({ id: 1 } as any);
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'task');

      const dialog = screen.getByRole('dialog');
      const titleInput = within(dialog).getAllByRole('textbox')[0];
      await userEvent.type(titleInput, 'New Task');

      const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
      await userEvent.click(createBtns.find((btn) => btn.className.includes('btn-primary'))!);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalled();
      });
    });

    it('creates activity', async () => {
      const createSpy = vi.spyOn(api, 'createActivity').mockResolvedValue({ id: 1 } as any);
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'activity');

      const dialog = screen.getByRole('dialog');
      const titleInput = within(dialog).getAllByRole('textbox')[0];
      await userEvent.type(titleInput, 'New Activity');

      const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
      await userEvent.click(createBtns.find((btn) => btn.className.includes('btn-primary'))!);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalled();
      });
    });

    it('handles create error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(api, 'createEpic').mockRejectedValue(new Error('Create failed'));

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

      const dialog = screen.getByRole('dialog');
      const titleInput = within(dialog).getAllByRole('textbox')[0];
      await userEvent.type(titleInput, 'Will Fail');

      const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
      await userEvent.click(createBtns.find((btn) => btn.className.includes('btn-primary'))!);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('closes modal and reloads after successful create', async () => {
      vi.spyOn(api, 'createEpic').mockResolvedValue({ id: 1 } as any);
      const getEpicsSpy = vi.spyOn(api, 'getEpics').mockResolvedValue([]);

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

      const dialog = screen.getByRole('dialog');
      const titleInput = within(dialog).getAllByRole('textbox')[0];
      await userEvent.type(titleInput, 'Test');

      const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
      await userEvent.click(createBtns.find((btn) => btn.className.includes('btn-primary'))!);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(getEpicsSpy).toHaveBeenCalledTimes(2);
      });
    });

    it('prevents double submit during create', async () => {
      const createSpy = vi.spyOn(api, 'createEpic').mockImplementation(() => new Promise(() => {}));
      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

      const dialog = screen.getByRole('dialog');
      const titleInput = within(dialog).getAllByRole('textbox')[0];
      await userEvent.type(titleInput, 'Test');

      const createBtns = within(dialog).getAllByRole('button', { name: /Create/i });
      const createBtn = createBtns.find((btn) => btn.className.includes('btn-primary'))!;

      await userEvent.click(createBtn);
      await userEvent.click(createBtn);

      expect(createSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Save operations', () => {
    it('saves epic', async () => {
      const updateSpy = vi.spyOn(api, 'updateEpic').mockResolvedValue({} as any);
      vi.spyOn(api, 'getEpics').mockResolvedValue([
        { id: 1, title: 'Epic 1', owner: 'alice', kanban_status: 'todo' },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
      });
    });

    it('saves decision', async () => {
      const updateSpy = vi.spyOn(api, 'updateDecision').mockResolvedValue({} as any);
      vi.spyOn(api, 'getDecisions').mockResolvedValue([
        { id: 1, title: 'Decision 1', kanban_status: 'done', nature: 'structural', reach: 'global' },
      ]);

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Decisions/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
      });
    });

    it('saves deliverable', async () => {
      const updateSpy = vi.spyOn(api, 'updateDeliverable').mockResolvedValue({} as any);
      vi.spyOn(api, 'getDeliverables').mockResolvedValue([
        { id: 1, title: 'Deliverable 1', kanban_status: 'in_progress' },
      ]);

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Deliverables/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
      });
    });

    it('saves task', async () => {
      const updateSpy = vi.spyOn(api, 'updateTask').mockResolvedValue({} as any);
      vi.spyOn(api, 'getTasks').mockResolvedValue([
        { id: 1, title: 'Task 1', kanban_status: 'todo' },
      ]);

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Tasks/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalled();
      });
    });

    it('saves activity', async () => {
      const updateSpy = vi.spyOn(api, 'updateActivity').mockResolvedValue({} as any);
      vi.spyOn(api, 'getActivities').mockResolvedValue([
        { id: 1, title: 'Activity 1', kanban_status: 'done' },
      ]);

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Activities/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
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
        { id: 1, title: 'Epic 1', kanban_status: 'todo' },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('reloads data after successful save', async () => {
      vi.spyOn(api, 'updateEpic').mockResolvedValue({} as any);
      const getEpicsSpy = vi.spyOn(api, 'getEpics').mockResolvedValue([
        { id: 1, title: 'Epic 1', kanban_status: 'todo' },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Save/i }));

      await waitFor(() => {
        expect(getEpicsSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Delete operations', () => {
    it('deletes epic', async () => {
      const deleteSpy = vi.spyOn(api, 'deleteEpic').mockResolvedValue();
      vi.spyOn(api, 'getEpics').mockResolvedValue([
        { id: 1, title: 'Epic 1', kanban_status: 'todo' },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith(1);
      });
    });

    it('deletes decision', async () => {
      const deleteSpy = vi.spyOn(api, 'deleteDecision').mockResolvedValue();
      vi.spyOn(api, 'getDecisions').mockResolvedValue([
        { id: 2, title: 'Decision 1', kanban_status: 'done', nature: 'structural', reach: 'global' },
      ]);

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Decisions/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith(2);
      });
    });

    it('deletes deliverable', async () => {
      const deleteSpy = vi.spyOn(api, 'deleteDeliverable').mockResolvedValue();
      vi.spyOn(api, 'getDeliverables').mockResolvedValue([
        { id: 3, title: 'Deliverable 1', kanban_status: 'in_progress' },
      ]);

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Deliverables/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith(3);
      });
    });

    it('deletes task', async () => {
      const deleteSpy = vi.spyOn(api, 'deleteTask').mockResolvedValue();
      vi.spyOn(api, 'getTasks').mockResolvedValue([
        { id: 4, title: 'Task 1', kanban_status: 'todo' },
      ]);

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Tasks/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith(4);
      });
    });

    it('deletes activity', async () => {
      const deleteSpy = vi.spyOn(api, 'deleteActivity').mockResolvedValue();
      vi.spyOn(api, 'getActivities').mockResolvedValue([
        { id: 5, title: 'Activity 1', kanban_status: 'done' },
      ]);

      render(<OverviewPage />);
      await userEvent.click(screen.getByRole('button', { name: /Activities/i }));
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith(5);
      });
    });

    it('handles delete error gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(api, 'deleteEpic').mockRejectedValue(new Error('Delete failed'));
      vi.spyOn(api, 'getEpics').mockResolvedValue([
        { id: 1, title: 'Epic 1', kanban_status: 'todo' },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });

    it('reloads data after successful delete', async () => {
      vi.spyOn(api, 'deleteEpic').mockResolvedValue();
      const getEpicsSpy = vi.spyOn(api, 'getEpics').mockResolvedValue([
        { id: 1, title: 'Epic 1', kanban_status: 'todo' },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });

      await userEvent.click(screen.getByRole('button', { name: /Delete/i }));

      await waitFor(() => {
        expect(getEpicsSpy).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('All tab rendering', () => {
    it('renders multiple types in all tab', async () => {
      vi.spyOn(api, 'getEpics').mockResolvedValue([
        { id: 1, title: 'Epic 1', kanban_status: 'todo' },
      ]);
      vi.spyOn(api, 'getDecisions').mockResolvedValue([
        { id: 2, title: 'Decision 1', kanban_status: 'done', nature: 'structural', reach: 'global' },
      ]);
      vi.spyOn(api, 'getTasks').mockResolvedValue([
        { id: 3, title: 'Task 1', kanban_status: 'todo' },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getAllByTestId('metadata-card')).toHaveLength(3);
      });
    });

    it('renders epic with extra details in all tab', async () => {
      vi.spyOn(api, 'getEpics').mockResolvedValue([
        {
          id: 1,
          title: 'Epic 1',
          kanban_status: 'todo',
          classification: 'feature',
          scope: 'large',
          use_case: 'User login',
          user_story: 'As a user...',
          non_functional_requirements: 'Performance'
        },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });
    });

    it('renders decision with deadline in all tab', async () => {
      vi.spyOn(api, 'getDecisions').mockResolvedValue([
        {
          id: 1,
          title: 'Decision 1',
          kanban_status: 'done',
          nature: 'structural',
          reach: 'global',
          deadline: '2026-12-31'
        },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });
    });

    it('renders deliverable with deadline in all tab', async () => {
      vi.spyOn(api, 'getDeliverables').mockResolvedValue([
        {
          id: 1,
          title: 'Deliverable 1',
          kanban_status: 'in_progress',
          deadline: '2026-06-30'
        },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });
    });

    it('renders task with target date in all tab', async () => {
      vi.spyOn(api, 'getTasks').mockResolvedValue([
        {
          id: 1,
          title: 'Task 1',
          kanban_status: 'todo',
          target_date: '2026-07-01'
        },
      ]);

      render(<OverviewPage />);
      await waitFor(() => {
        expect(screen.getByTestId('metadata-card')).toBeTruthy();
      });
    });
  });
  describe('All tab with optional fields', () => {
  it('renders decision without deadline in all tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([
      {
        id: 1,
        title: 'Decision No Deadline',
        kanban_status: 'done',
        nature: 'structural',
        reach: 'global'
      },
    ]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Decision No Deadline')).toBeTruthy();
    });
  });

  it('renders deliverable without deadline in all tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([
      {
        id: 1,
        title: 'Deliverable No Deadline',
        kanban_status: 'in_progress'
      },
    ]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Deliverable No Deadline')).toBeTruthy();
    });
  });

  it('renders task without target_date in all tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([
      {
        id: 1,
        title: 'Task No Date',
        kanban_status: 'todo'
        // No target_date field
      },
    ]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Task No Date')).toBeTruthy();
    });
  });

  it('renders epic without optional fields in all tab', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([
      {
        id: 1,
        title: 'Minimal Epic',
        kanban_status: 'todo'
      },
    ]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await waitFor(() => {
      expect(screen.getByText('Minimal Epic')).toBeTruthy();
    });
  });
});

  describe('OverviewPage create modal form fields', () => {
  it('displays and interacts with epic form fields', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    const classificationInput = screen.getByLabelText(/Classification/i);
    const scopeInput = screen.getByLabelText(/Scope/i);
    const useCaseInput = screen.getByLabelText(/Use Case/i);
    const userStoryInput = screen.getByLabelText(/User Story/i);
    const nfrInput = screen.getByLabelText(/Non-Functional Requirements/i);

    await userEvent.type(classificationInput, 'feature');
    await userEvent.type(scopeInput, 'large');
    await userEvent.type(useCaseInput, 'test use case');
    await userEvent.type(userStoryInput, 'As a user...');
    await userEvent.type(nfrInput, 'performance');

    expect(classificationInput).toHaveValue('feature');
    expect(scopeInput).toHaveValue('large');
    expect(useCaseInput).toHaveValue('test use case');
    expect(userStoryInput).toHaveValue('As a user...');
    expect(nfrInput).toHaveValue('performance');
  });

  it('displays and interacts with decision form fields', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'decision');

    const alternativesInput = screen.getByLabelText(/Alternatives/i);
    const natureInput = screen.getByLabelText(/Nature/i);
    const reachInput = screen.getByLabelText(/Reach/i);
    const deadlineInput = screen.getByLabelText(/Deadline/i);

    await userEvent.type(alternativesInput, 'Option A, Option B');
    await userEvent.type(natureInput, 'structural');
    await userEvent.type(reachInput, 'global');
    await userEvent.type(deadlineInput, '2026-12-31');

    expect(alternativesInput).toHaveValue('Option A, Option B');
    expect(natureInput).toHaveValue('structural');
    expect(reachInput).toHaveValue('global');
    expect(deadlineInput).toHaveValue('2026-12-31');
  });

  it('displays and interacts with deliverable form fields', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'deliverable');

    const alternativesInput = screen.getByLabelText(/Alternatives/i);
    const natureInput = screen.getByLabelText(/Nature/i);
    const reachInput = screen.getByLabelText(/Reach/i);
    const deadlineInput = screen.getByLabelText(/Deadline/i);

    await userEvent.type(alternativesInput, 'Alt 1');
    await userEvent.type(natureInput, 'technical');
    await userEvent.type(reachInput, 'local');
    await userEvent.type(deadlineInput, '2026-06-30');

    expect(alternativesInput).toHaveValue('Alt 1');
    expect(natureInput).toHaveValue('technical');
    expect(reachInput).toHaveValue('local');
    expect(deadlineInput).toHaveValue('2026-06-30');
  });

  it('displays and interacts with task form fields', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'task');

    const statusInput = screen.getByLabelText(/Status/i);
    const timeLoggedInput = screen.getByLabelText(/Time Logged/i);
    const targetDateInput = screen.getByLabelText(/Target Date/i);

    await userEvent.type(statusInput, 'in progress');
    await userEvent.type(timeLoggedInput, '5h');
    await userEvent.type(targetDateInput, '2026-07-15');

    expect(statusInput).toHaveValue('in progress');
    expect(timeLoggedInput).toHaveValue('5h');
    expect(targetDateInput).toHaveValue('2026-07-15');
  });

  it('displays and interacts with activity form fields', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'activity');

    const statusInput = screen.getByLabelText(/Status/i);

    await userEvent.type(statusInput, 'active');

    expect(statusInput).toHaveValue('active');
  });

  it('interacts with common form fields', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    const titleInput = screen.getByLabelText(/Title/i);
    const ownerInput = screen.getByLabelText(/Owner/i);
    const descriptionInput = screen.getByLabelText(/Description/i);

    await userEvent.type(titleInput, 'Test Title');
    await userEvent.type(ownerInput, 'Test Owner');
    await userEvent.type(descriptionInput, 'Test Description');

    expect(titleInput).toHaveValue('Test Title');
    expect(ownerInput).toHaveValue('Test Owner');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it('switches between different create types', async () => {
    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);

    render(<OverviewPage />);

    await userEvent.click(screen.getByRole('button', { name: /Create New/i }));

    const select = screen.getByRole('combobox');

    // Start with epic (default)
    expect(screen.getByLabelText(/Classification/i)).toBeTruthy();

    // Switch to decision
    await userEvent.selectOptions(select, 'decision');
    expect(screen.getByLabelText(/Alternatives/i)).toBeTruthy();
    expect(screen.queryByLabelText(/Classification/i)).toBeNull();

    // Switch to task
    await userEvent.selectOptions(select, 'task');
    expect(screen.getByLabelText(/Time Logged/i)).toBeTruthy();
    expect(screen.queryByLabelText(/Alternatives/i)).toBeNull();

    // Switch to activity
    await userEvent.selectOptions(select, 'activity');
    expect(screen.getByLabelText(/Status/i)).toBeTruthy();
    expect(screen.queryByLabelText(/Time Logged/i)).toBeNull();

    // Switch to deliverable
    await userEvent.selectOptions(select, 'deliverable');
    expect(screen.getByLabelText(/Alternatives/i)).toBeTruthy();
  });
});
});