import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanColumn from '../../src/components/KanbanColumn';
import type { KanbanItemFull } from '../../src/types';

/**
 * Stub MetadataCard so tests don't depend on its internal implementation.
 */
vi.mock('../../src/components/MetadataCard', () => {
  return {
    default: (props: any) => {
      return (
        <div data-testid="metadata-card">
          <div data-testid="metadata-card-title">{props.title}</div>
          <button
            data-testid="metadata-save"
            onClick={() => props.onSave && props.onSave({ saved: 'yes' })}
          >
            Save
          </button>
          <button
            data-testid="metadata-delete"
            onClick={() => props.onDelete && props.onDelete()}
          >
            Delete
          </button>
        </div>
      );
    },
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
    nature: 'functional',
    reach: 'local',
    description: 'desc',
    alternatives: [],
    evidence: [],
    confidence: 0,
    verified: false,
    extraDetails: {},
    ...overrides,
  } as KanbanItemFull;
}

function makeItems(n = 2): KanbanItemFull[] {
  return Array.from({ length: n }).map((_, i) => makeItem({ id: i + 1, title: `Item ${i + 1}` }));
}

describe('KanbanColumn (focused tests)', () => {
  it('renders header with title, count and accessible attributes', () => {
    const items = makeItems(3);
    render(<KanbanColumn title="To Do" items={items} />);

    const section = screen.getByLabelText(/To Do column — 3 items/i);
    expect(section).toBeTruthy();

    const titleEl = screen.getByText('To Do');
    expect(titleEl).toBeTruthy();

    const count = screen.getByLabelText('3 items');
    expect(count).toBeTruthy();
    expect(count).toHaveTextContent('3');
    expect(count).toHaveAttribute('title', '3 items in To Do');
  });

  it('shows edit button only when onTitleChange is provided', async () => {
    const items = makeItems();
    const onTitleChange = vi.fn();
    const { rerender } = render(<KanbanColumn title="Backlog" items={items} onTitleChange={onTitleChange} />);

    const editBtn = screen.getByRole('button', { name: /Rename "Backlog" column/i });
    expect(editBtn).toBeTruthy();

    rerender(<KanbanColumn title="Backlog" items={items} />);
    const maybe = screen.queryByRole('button', { name: /Rename "Backlog" column/i });
    expect(maybe).toBeNull();
  });

  it('allows editing the title and commits on Enter (calls onTitleChange with trimmed value)', async () => {
    const items = makeItems();
    const onTitleChange = vi.fn();
    render(<KanbanColumn title="Column" items={items} onTitleChange={onTitleChange} />);

    const user = userEvent.setup();

    const editBtn = screen.getByRole('button', { name: /Rename "Column" column/i });
    await user.click(editBtn);
    const input = await screen.findByRole('textbox', { name: /Edit column name/i }) as HTMLInputElement;
    expect(input).toBeTruthy();

    await user.clear(input);
    await user.type(input, '  New Column  ');
    await user.keyboard('{Enter}');

    expect(onTitleChange).toHaveBeenCalledTimes(1);
    expect(onTitleChange).toHaveBeenCalledWith('New Column');

    expect(screen.queryByRole('textbox', { name: /Edit column name/i })).toBeNull();
  });

  it('cancels title editing on Escape and restores draft to original title', async () => {
    const items = makeItems();
    const onTitleChange = vi.fn();
    render(<KanbanColumn title="Original" items={items} onTitleChange={onTitleChange}/>);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Rename "Original" column/i }));

    const input = await screen.findByRole('textbox', { name: /Edit column name/i }) as HTMLInputElement;

    await user.clear(input);
    await user.type(input, 'Changed');
    await user.keyboard('{Escape}');

    expect(onTitleChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox', { name: /Edit column name/i })).toBeNull();
    expect(screen.getByText('Original')).toBeTruthy();
  });

  it('renders items with titles and owners when provided', () => {
    const items = [
      makeItem({ id: 11, title: 'A', owner: 'bob' }),
      makeItem({ id: 22, title: 'B', owner: undefined }),
    ];
    render(<KanbanColumn title="Col" items={items} />);

    const a = screen.getByText('A');
    expect(a).toBeTruthy();
    const owner = screen.getByText('bob');
    expect(owner).toBeTruthy();

    const b = screen.getByText('B');
    expect(b).toBeTruthy();
  });

  it('expands on click and renders MetadataCard title', async () => {
    const item = makeItem({ id: 5, title: 'ExpandMe' });
    render(<KanbanColumn title="Col" items={[item]} />);

    // Initially not expanded
    expect(screen.queryByTestId('metadata-card')).toBeNull();

    const article = screen.getByRole('button', { name: /ExpandMe, draggable/i });
    const user = userEvent.setup();
    await user.click(article);

    expect(screen.getByTestId('metadata-card')).toBeTruthy();
    expect(screen.getByTestId('metadata-card-title')).toHaveTextContent('ExpandMe');
  });

  it('calls onSaveItem and onDeleteItem when MetadataCard buttons are clicked', async () => {
    const item = makeItem({ id: 6, title: 'Callbacks' });
    const onSaveItem = vi.fn();
    const onDeleteItem = vi.fn();

    render(<KanbanColumn title="Col" items={[item]} onSaveItem={onSaveItem} onDeleteItem={onDeleteItem} />);

    const article = screen.getByRole('button', { name: /Callbacks, draggable/i });
    const user = userEvent.setup();
    await user.click(article);

    await user.click(screen.getByTestId('metadata-save'));
    expect(onSaveItem).toHaveBeenCalledTimes(1);
    expect(onSaveItem).toHaveBeenCalledWith(item, { saved: 'yes' });

    await user.click(screen.getByTestId('metadata-delete'));
    expect(onDeleteItem).toHaveBeenCalledTimes(1);
    expect(onDeleteItem).toHaveBeenCalledWith(item);
  });

  it('toggles expansion with Enter and with Space on the article (separate flows)', async () => {
    const item = makeItem({ id: 7, title: 'KeyToggle' });
    const user = userEvent.setup();

    // First flow: Enter opens
    const { unmount } = render(<KanbanColumn title="Col" items={[item]} />);
    const article1 = screen.getByRole('button', { name: /KeyToggle, draggable/i });
    article1.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('metadata-card')).toBeTruthy();

    // Reset and test Space opens (separate flow)
    unmount();
    render(<KanbanColumn title="Col" items={[item]} />);
    const article2 = screen.getByRole('button', { name: /KeyToggle, draggable/i });
    article2.focus();
    await user.keyboard(' ');
    expect(screen.getByTestId('metadata-card')).toBeTruthy();
  });

  it('sets dataTransfer payload during dragStart on an item', () => {
    const item = makeItem({ id: 99, title: 'Draggable' });
    render(<KanbanColumn title="Col" items={[item]} />);

    const article = screen.getByRole('button', { name: /Draggable, draggable/i });

    const dataTransfer = {
      setData: vi.fn(),
      effectAllowed: '',
    };

    fireEvent.dragStart(article, { dataTransfer } as any);

    expect(dataTransfer.setData).toHaveBeenCalledTimes(1);
    expect(dataTransfer.setData).toHaveBeenCalledWith('application/json', JSON.stringify(item));
    expect((dataTransfer as any).effectAllowed).toBe('move');
  });

  it('adds and removes over-class on dragOver/dragLeave', () => {
    const item = makeItem({ id: 42, title: 'Payload' });
    render(<KanbanColumn title="DropCol" items={[item]} onDropItem={vi.fn()} />);

    const section = screen.getByLabelText(/DropCol column — 1 items/i);
    const dtOver = { getData: () => '', setData: vi.fn() };

    fireEvent.dragOver(section, { dataTransfer: dtOver } as any);
    expect(section.className).toMatch(/\bkanban-col--over\b/);

    fireEvent.dragLeave(section);
    expect(section.className).not.toMatch(/\bkanban-col--over\b/);
  });

  it('calls onDropItem with parsed payload on drop and clears over-class', () => {
    const item = makeItem({ id: 42, title: 'Payload' });
    const onDropItem = vi.fn();
    render(<KanbanColumn title="DropCol" items={[item]} onDropItem={onDropItem} />);

    const section = screen.getByLabelText(/DropCol column — 1 items/i);

    const dtDrop = {
      getData: vi.fn(() => JSON.stringify(item)),
    };
    fireEvent.drop(section, { dataTransfer: dtDrop } as any);

    expect(onDropItem).toHaveBeenCalledTimes(1);
    expect(onDropItem).toHaveBeenCalledWith(item);
    expect(section.className).not.toMatch(/\bkanban-col--over\b/);
  });

  it('does not call onDropItem when drop payload is invalid JSON', () => {
    const item = makeItem({ id: 13 });
    const onDropItem = vi.fn();
    render(<KanbanColumn title="DropBad" items={[item]} onDropItem={onDropItem} />);

    const section = screen.getByLabelText(/DropBad column — 1 items/i);

    const dtBad = {
      getData: vi.fn(() => 'not-a-json'),
    };

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fireEvent.drop(section, { dataTransfer: dtBad } as any);

    expect(onDropItem).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});