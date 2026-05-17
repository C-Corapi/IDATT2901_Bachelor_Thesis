import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanColumn from '../../src/components/KanbanColumn';
import type { KanbanItemFull } from '../../src/types';

vi.mock('../../src/components/MetadataCard', () => {
  return {
    default: (props: any) => (
      <div data-testid="metadata-card">
        <div>{props.title}</div>
        <button data-testid="metadata-save" onClick={() => props.onSave?.({ saved: 'yes' })}>Save</button>
        <button data-testid="metadata-delete" onClick={() => props.onDelete?.()}>Delete</button>
      </div>
    ),
  };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeItem(overrides?: Partial<KanbanItemFull>): KanbanItemFull {
  return {
    id: 1,
    type: 'task',
    title: 'Test Task',
    owner: 'alice',
    description: 'desc',
    verified: false,
    ...overrides,
  } as KanbanItemFull;
}

function makeItems(n = 2): KanbanItemFull[] {
  return Array.from({ length: n }).map((_, i) => makeItem({ id: i + 1, title: `Item ${i + 1}` }));
}

describe('KanbanColumn', () => {
  it('renders column header with title and item count', () => {
    const items = makeItems(3);
    render(<KanbanColumn title="To Do" items={items} />);
    expect(screen.getByLabelText(/To Do column — 3 items/i)).toBeTruthy();
  });

  it('shows edit button when onTitleChange is provided', () => {
    render(<KanbanColumn title="Col" items={[]} onTitleChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Rename "Col" column/i })).toBeTruthy();
  });

  it('edits column title on Enter', async () => {
    const onTitleChange = vi.fn();
    render(<KanbanColumn title="Old" items={[]} onTitleChange={onTitleChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Rename "Old"/i }));
    const input = screen.getByRole('textbox', { name: /Edit column name/i });
    await user.clear(input);
    await user.type(input, 'New');
    await user.keyboard('{Enter}');

    expect(onTitleChange).toHaveBeenCalledWith('New');
  });

  it('cancels title edit on Escape', async () => {
    const onTitleChange = vi.fn();
    render(<KanbanColumn title="Original" items={[]} onTitleChange={onTitleChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Rename/i }));
    const input = screen.getByRole('textbox');
    await user.type(input, 'Changed');
    await user.keyboard('{Escape}');

    expect(onTitleChange).not.toHaveBeenCalled();
    expect(screen.getByText('Original')).toBeTruthy();
  });

  it('renders items with titles', () => {
    const items = [makeItem({ title: 'Task A' }), makeItem({ id: 2, title: 'Task B' })];
    render(<KanbanColumn title="Col" items={items} />);

    expect(screen.getByText('Task A')).toBeTruthy();
    expect(screen.getByText('Task B')).toBeTruthy();
  });

  it('renders owner when provided', () => {
    const items = [makeItem({ owner: 'alice' })];
    render(<KanbanColumn title="Col" items={items} />);

    expect(screen.getByText('alice')).toBeTruthy();
  });

  it('expands item on click', async () => {
    const items = [makeItem({ title: 'Expandable' })];
    render(<KanbanColumn title="Col" items={items} />);
    const user = userEvent.setup();

    expect(screen.queryByTestId('metadata-card')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Expandable/i }));
    expect(screen.getByTestId('metadata-card')).toBeTruthy();
  });

  it('calls onSaveItem when save button clicked', async () => {
    const item = makeItem({ id: 5, title: 'Item' });
    const onSaveItem = vi.fn();
    render(<KanbanColumn title="Col" items={[item]} onSaveItem={onSaveItem} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Item/i }));
    await user.click(screen.getByTestId('metadata-save'));

    expect(onSaveItem).toHaveBeenCalledWith(item, { saved: 'yes' });
  });

  it('calls onDeleteItem when delete button clicked', async () => {
    const item = makeItem({ id: 5, title: 'Item' });
    const onDeleteItem = vi.fn();
    render(<KanbanColumn title="Col" items={[item]} onDeleteItem={onDeleteItem} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Item/i }));
    await user.click(screen.getByTestId('metadata-delete'));

    expect(onDeleteItem).toHaveBeenCalledWith(item);
  });

  it('toggles expansion with Enter key', async () => {
    const items = [makeItem({ title: 'Key' })];
    const user = userEvent.setup();
    render(<KanbanColumn title="Col" items={items} />);

    const article = screen.getByRole('button', { name: /Key/i });
    article.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByTestId('metadata-card')).toBeTruthy();
  });

  it('toggles expansion with Space key', async () => {
    const items = [makeItem({ title: 'Key' })];
    const user = userEvent.setup();
    render(<KanbanColumn title="Col" items={items} />);

    const article = screen.getByRole('button', { name: /Key/i });
    article.focus();
    await user.keyboard(' ');

    expect(screen.getByTestId('metadata-card')).toBeTruthy();
  });

  it('sets drag data on drag start', () => {
    const item = makeItem({ title: 'Drag' });
    render(<KanbanColumn title="Col" items={[item]} onDropItem={vi.fn()} />);

    const article = screen.getByRole('button', { name: /Drag/i });
    const dataTransfer = { setData: vi.fn(), effectAllowed: '' };

    fireEvent.dragStart(article, { dataTransfer } as any);

    expect(dataTransfer.setData).toHaveBeenCalledWith('application/json', JSON.stringify(item));
  });

  it('highlights column on drag over', () => {
    const { container } = render(<KanbanColumn title="Drop" items={[]} onDropItem={vi.fn()} />);
    const section = container.querySelector('.kanban-col') as HTMLElement;

    fireEvent.dragOver(section, { dataTransfer: { getData: () => '' } } as any);

    expect(section.className).toContain('kanban-col--over');
  });

  it('removes highlight on drag leave', () => {
    const { container } = render(<KanbanColumn title="Drop" items={[]} onDropItem={vi.fn()} />);
    const section = container.querySelector('.kanban-col') as HTMLElement;

    fireEvent.dragOver(section, { dataTransfer: { getData: () => '' } } as any);
    fireEvent.dragLeave(section);

    expect(section.className).not.toContain('kanban-col--over');
  });

  it('calls onDropItem on drop with valid data', () => {
    const item = makeItem({ id: 99 });
    const onDropItem = vi.fn();
    const { container } = render(<KanbanColumn title="Drop" items={[]} onDropItem={onDropItem} />);

    const section = container.querySelector('.kanban-col') as HTMLElement;
    const dataTransfer = { getData: () => JSON.stringify(item) };

    fireEvent.drop(section, { dataTransfer } as any);

    expect(onDropItem).toHaveBeenCalledWith(item);
  });

  it('does not call onDropItem with empty data', () => {
    const onDropItem = vi.fn();
    const { container } = render(<KanbanColumn title="Drop" items={[]} onDropItem={onDropItem} />);

    const section = container.querySelector('.kanban-col') as HTMLElement;
    const dataTransfer = { getData: () => '' };

    fireEvent.drop(section, { dataTransfer } as any);

    expect(onDropItem).not.toHaveBeenCalled();
  });

  it('handles invalid JSON on drop gracefully', () => {
    const onDropItem = vi.fn();
    const { container } = render(<KanbanColumn title="Drop" items={[]} onDropItem={onDropItem} />);

    const section = container.querySelector('.kanban-col') as HTMLElement;
    const dataTransfer = { getData: () => 'invalid' };

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    fireEvent.drop(section, { dataTransfer } as any);

    expect(onDropItem).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('does not allow title change with empty value', async () => {
    const onTitleChange = vi.fn();
    render(<KanbanColumn title="Title" items={[]} onTitleChange={onTitleChange} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Rename/i }));
    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '   ');
    await user.keyboard('{Enter}');

    expect(onTitleChange).not.toHaveBeenCalled();
  });

  it('shows empty state when no items', () => {
    render(<KanbanColumn title="Empty" items={[]} />);
    expect(screen.getByLabelText(/Empty column — 0 items/i)).toBeTruthy();
  });

  it('items are draggable when onDropItem is provided', () => {
    const items = makeItems();
    render(<KanbanColumn title="Col" items={items} onDropItem={vi.fn()} />);

    const articles = screen.getAllByRole('button', { name: /draggable/i });
    articles.forEach((a) => {
      expect(a.getAttribute('draggable')).toBe('true');
    });
  });

  it('items have draggable=true by default in component logic', () => {
    const items = makeItems();
    const { container } = render(<KanbanColumn title="Col" items={items} />);

    const articles = container.querySelectorAll('[draggable]');
    articles.forEach((a) => {
      expect(a.getAttribute('draggable')).toBe('true');
    });
  });
});