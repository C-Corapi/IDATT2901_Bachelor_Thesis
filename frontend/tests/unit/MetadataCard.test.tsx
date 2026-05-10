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
    await user.click(screen.getByRole('button', { name: /Edit "Sample"/i }));

    const titleInput = screen.getByRole('textbox', { name: /Edit title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New Title',
        name: 'New Title',
      })
    );
  });

  it('calls onVerify when verify button is clicked', async () => {
    const onVerify = vi.fn();
    render(<MetadataCard {...baseProps} verified={false} onVerify={onVerify} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));

    const verifyBtn = screen.getByRole('button', { name: /Verify "Sample"/i });
    await user.click(verifyBtn);

    expect(onVerify).toHaveBeenCalled();
  });

  it('shows verified badge when verified is true', async () => {
    render(<MetadataCard {...baseProps} verified={true} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));

    expect(screen.getByText(/verified/i)).toBeTruthy();
  });

  it('renders extra details when provided', async () => {
    const extraDetails = [
      { label: 'Field 1', value: 'Value 1', key: 'f1' },
      { label: 'Field 2', value: 'Value 2', key: 'f2' },
    ];
    render(<MetadataCard {...baseProps} extraDetails={extraDetails} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));

    expect(screen.getByText('Field 1')).toBeTruthy();
    expect(screen.getByText('Value 1')).toBeTruthy();
    expect(screen.getByText('Field 2')).toBeTruthy();
    expect(screen.getByText('Value 2')).toBeTruthy();
  });

  it('allows editing extra detail fields', async () => {
    const extraDetails = [
      { label: 'Editable', value: 'Original', key: 'edit1' },
    ];
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} extraDetails={extraDetails} onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit "Sample"/i }));

    const inputs = screen.getAllByRole('textbox');
    const extraInput = inputs.find((input) => (input as HTMLInputElement).value === 'Original');
    expect(extraInput).toBeTruthy();

    await user.clear(extraInput!);
    await user.type(extraInput!, 'Changed');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        edit1: 'Changed',
      })
    );
  });

  it('does not show Edit or Delete buttons when handlers are not provided', async () => {
    render(<MetadataCard {...baseProps} onSave={undefined} onDelete={undefined} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));

    expect(screen.queryByRole('button', { name: /Edit/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull();
  });

  it('opens with defaultOpen prop', () => {
    render(<MetadataCard {...baseProps} defaultOpen={true} />);

    const region = screen.getByRole('region', { name: /Details for Sample/i });
    expect(region).toBeTruthy();
  });

  it('calls onDelete after confirmation modal', async () => {
    const onDelete = vi.fn();
    render(<MetadataCard {...baseProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));

    await user.click(screen.getByRole('button', { name: /Delete "Sample"/i }));

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeTruthy();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Confirm delete "Sample"/i }));

    expect(onDelete).toHaveBeenCalled();
  });

  it('cancels deletion when Cancel is clicked in modal', async () => {
    const onDelete = vi.fn();
    render(<MetadataCard {...baseProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Delete "Sample"/i }));

    expect(screen.getByRole('alertdialog')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Cancel deletion/i }));

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('closes modal when clicking overlay', async () => {
    const onDelete = vi.fn();
    render(<MetadataCard {...baseProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Delete "Sample"/i }));

    expect(screen.getByRole('alertdialog')).toBeTruthy();

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await user.click(overlay);

    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('closes modal on Escape key', async () => {
    const onDelete = vi.fn();
    render(<MetadataCard {...baseProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Delete "Sample"/i }));

    expect(screen.getByRole('alertdialog')).toBeTruthy();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('displays showKanbanStatus when provided', () => {
    render(<MetadataCard {...baseProps} showKanbanStatus={true} status="in_progress" />);

    expect(screen.getByText('in_progress')).toBeTruthy();
  });

  it('displays displayType badge when provided and showKanbanStatus is false', () => {
    render(<MetadataCard {...baseProps} showKanbanStatus={false} displayType="EPIC" />);

    expect(screen.getByText('EPIC')).toBeTruthy();
  });

  it('cancels editing and restores original values', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit "Sample"/i }));

    const titleInput = screen.getByRole('textbox', { name: /Edit title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Changed');

    await user.click(screen.getByRole('button', { name: /Cancel editing/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Sample')).toBeTruthy();
  });

  it('prevents toggle when editing', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit "Sample"/i }));

    const article = screen.getByRole('button', { name: /Sample/i });
    await user.click(article);

    expect(screen.getByRole('region', { name: /Details for Sample/i })).toBeTruthy();
  });

  it('does not show verify button when already verified', async () => {
    const onVerify = vi.fn();
    render(<MetadataCard {...baseProps} verified={true} onVerify={onVerify} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));

    expect(screen.queryByRole('button', { name: /Verify/i })).toBeNull();
  });

  it('renders owner field when provided', async () => {
    render(<MetadataCard {...baseProps} owner="bob" />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));

    expect(screen.getByText('bob')).toBeTruthy();
  });

  it('allows editing owner field', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} owner="alice" onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit "Sample"/i }));

    const ownerInput = screen.getByRole('textbox', { name: /Edit owner/i });
    await user.clear(ownerInput);
    await user.type(ownerInput, 'charlie');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'charlie',
      })
    );
  });

  it('allows editing description field', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} description="Original desc" onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit "Sample"/i }));

    const descTextarea = screen.getByLabelText(/Description/i);
    await user.clear(descTextarea);
    await user.type(descTextarea, 'New description');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'New description',
      })
    );
  });

  it('allows editing alternatives field', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} alternatives="Alt 1" onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit "Sample"/i }));

    const altsTextarea = screen.getByLabelText(/Alternatives/i);
    await user.clear(altsTextarea);
    await user.type(altsTextarea, 'Alt 2');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        alternatives: 'Alt 2',
      })
    );
  });

  it('traps focus in delete confirmation modal', async () => {
    const onDelete = vi.fn();
    render(<MetadataCard {...baseProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Delete "Sample"/i }));

    const modal = screen.getByRole('alertdialog');
    expect(modal).toBeTruthy();

    const cancelBtn = screen.getByRole('button', { name: /Cancel deletion/i });
    expect(document.activeElement).toBe(cancelBtn);
  });
});