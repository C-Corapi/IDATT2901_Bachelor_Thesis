import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MetadataCard from '../../src/components/MetadataCard';

/**
 * Stub ConfidenceBar so tests don't depend on its internal implementation.
 */
vi.mock('../../src/components/ConfidenceBar', () => {
  return {
    default: (props: any) => <div data-testid="confidence-bar">conf:{props.value}</div>,
  };
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const baseProps = {
  title: 'Sample',
  owner: 'alice',
  status: 'open',
  nature: 'functional',
  reach: 'local',
  description: 'A description',
  alternatives: 'Alt A',
  evidence: 'Source X',
  confidence: 42,
  verified: false,
  extraDetails: [{ label: 'Field', value: 'V1', key: 'f1' }],
};

describe('MetadataCard', () => {
  it('renders header, badges, and accessibility attributes (showing status when showKanbanStatus=true)', () => {
    render(<MetadataCard {...baseProps} showKanbanStatus={true} />);

    const article = screen.getByRole('button', { name: /Sample/i });
    expect(article).toBeTruthy();
    expect(article).toHaveAttribute('aria-expanded', 'false');

    expect(screen.getByText('Sample')).toBeTruthy();

    expect(screen.getByText('open')).toBeTruthy();
    expect(screen.getByText('functional')).toBeTruthy();
    expect(screen.getByText('local')).toBeTruthy();

    expect(screen.getByTestId('confidence-bar')).toHaveTextContent('conf:42');
  });

  it('opens details when clicked and sets aria-expanded to true', async () => {
    render(<MetadataCard {...baseProps} />);
    const user = userEvent.setup();

    const article = screen.getByRole('button', { name: /Sample/i });
    expect(screen.queryByRole('region', { name: /Details for Sample/i })).toBeNull();

    await user.click(article);
    const region = screen.getByRole('region', { name: /Details for Sample/i });
    expect(region).toBeTruthy();
    expect(article).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders description, alternatives and evidence when open', async () => {
    render(<MetadataCard {...baseProps} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    expect(screen.getByText('A description')).toBeTruthy();
    expect(screen.getByText('Alt A')).toBeTruthy();
    expect(screen.getByText(/"Source X"/i)).toBeTruthy();
  });

  it('opens with Enter and closes with Space when not editing (keyboard interactions split)', async () => {
    render(<MetadataCard {...baseProps} />);
    const user = userEvent.setup();

    const article = screen.getByRole('button', { name: /Sample/i });
    article.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('region', { name: /Details for Sample/i })).toBeTruthy();

    article.focus();
    await user.keyboard(' ');
    expect(screen.queryByRole('region', { name: /Details for Sample/i })).toBeNull();
  });

  it('shows Edit->Save flow and calls onSave with changed fields only', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    const editBtn = screen.getByRole('button', { name: /Edit "Sample"/i });
    await user.click(editBtn);

    const titleInput = screen.getByLabelText('Edit title') as HTMLInputElement;
    const extraInput = screen.getByLabelText(/Field/i) as HTMLInputElement;

    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');
    await user.clear(extraInput);
    await user.type(extraInput, 'V2');

    const saveBtn = screen.getByRole('button', { name: /Save changes/i });
    await user.click(saveBtn);

    expect(onSave).toHaveBeenCalledTimes(1);
    const calledWith = onSave.mock.calls[0][0] as Record<string, string>;
    expect(calledWith.title).toBe('New Title');
    expect(calledWith.name).toBe('New Title');
    expect(calledWith.f1).toBe('V2');
    expect(calledWith.owner).toBeUndefined();
  });

  it('cancels edits and restores draft values when Cancel is clicked', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit "Sample"/i }));

    const titleInput = screen.getByLabelText('Edit title') as HTMLInputElement;
    await user.clear(titleInput);
    await user.type(titleInput, 'Temp');

    const cancelBtn = screen.getByRole('button', { name: /Cancel editing/i });
    await user.click(cancelBtn);

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.queryByLabelText('Edit title')).toBeNull();
    expect(screen.getByText('Sample')).toBeTruthy();
  });

  it('shows Verify button when onVerify provided and not verified; clicking it calls onVerify', async () => {
    const onVerify = vi.fn();
    render(<MetadataCard {...baseProps} verified={false} onVerify={onVerify} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    const verifyBtn = screen.getByRole('button', { name: /Verify "Sample"/i });
    expect(verifyBtn).toBeTruthy();

    await user.click(verifyBtn);
    expect(onVerify).toHaveBeenCalledTimes(1);
  });

  it('opens modal confirm and Confirm triggers onDelete', async () => {
    const onDelete = vi.fn();
    render(<MetadataCard {...baseProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    const deleteBtn = screen.getByRole('button', { name: /Delete "Sample"/i });
    await user.click(deleteBtn);

    const modal = screen.getByRole('alertdialog');
    expect(modal).toBeTruthy();

    const confirmBtn = screen.getByRole('button', { name: /Confirm delete "Sample"/i });
    await user.click(confirmBtn);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('modal traps focus and Escape closes modal without calling onDelete', async () => {
    const onDelete = vi.fn();
    render(<MetadataCard {...baseProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Delete "Sample"/i }));

    const cancelInModal = screen.getByRole('button', { name: /Cancel deletion/i });
    expect(document.activeElement).toBe(cancelInModal);

    await user.keyboard('{Tab}');
    const confirmBtn = screen.getByRole('button', { name: /Confirm delete "Sample"/i });
    expect(document.activeElement).toBe(confirmBtn);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('respects defaultOpen prop and shows details initially when true', () => {
    render(<MetadataCard {...baseProps} defaultOpen={true} />);
    expect(screen.getByRole('region', { name: /Details for Sample/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Sample/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('updates internal draft when props change via useEffect hooks', async () => {
    const onSave = vi.fn();
    const { rerender } = render(<MetadataCard {...baseProps} onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit "Sample"/i }));

    const titleInput = screen.getByLabelText('Edit title') as HTMLInputElement;
    expect(titleInput.value).toBe('Sample');

    rerender(<MetadataCard {...baseProps} title="External" onSave={onSave} />);

    expect((screen.getByLabelText('Edit title') as HTMLInputElement).value).toBe('External');
  });
});