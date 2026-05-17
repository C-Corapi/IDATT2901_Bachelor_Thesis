import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MetadataCard from '../../src/components/MetadataCard';

vi.mock('../../src/components/ConfidenceBar', () => ({
  default: (props: any) => <div data-testid="confidence-bar">conf:{props.value}</div>,
}));

vi.mock('../../src/api', () => ({
  convertMetadataType: vi.fn().mockResolvedValue({}),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const baseProps = {
  title: 'Sample',
  owner: 'alice',
  description: 'A description',
  alternatives: 'Alt A',
  evidence: 'Source X',
  confidence: 42,
  verified: false,
  extraDetails: [{ label: 'Field', value: 'V1', key: 'f1' }],
};

describe('MetadataCard', () => {
  it('renders title, owner, and badges', () => {
    render(<MetadataCard {...baseProps} status="open" nature="functional" reach="local" showKanbanStatus={true} />);
    expect(screen.getByText('Sample')).toBeTruthy();
    expect(screen.getByText('alice')).toBeTruthy();
    expect(screen.getByText('open')).toBeTruthy();
  });

  it('shows confidence bar when confidence provided', () => {
    render(<MetadataCard {...baseProps} />);
    expect(screen.getByTestId('confidence-bar')).toHaveTextContent('conf:42');
  });

  it('opens details on click and sets aria-expanded', async () => {
    render(<MetadataCard {...baseProps} />);
    const user = userEvent.setup();

    const article = screen.getByRole('button', { name: /Sample/i });
    expect(article).toHaveAttribute('aria-expanded', 'false');

    await user.click(article);

    expect(article).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: /Details for Sample/i })).toBeTruthy();
  });

  it('opens with Enter key', async () => {
    render(<MetadataCard {...baseProps} />);
    const user = userEvent.setup();

    const article = screen.getByRole('button', { name: /Sample/i });
    article.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('region')).toBeTruthy();
  });

  it('closes with Space key', async () => {
    render(<MetadataCard {...baseProps} />);
    const user = userEvent.setup();

    const article = screen.getByRole('button', { name: /Sample/i });
    await user.click(article);
    expect(screen.getByRole('region')).toBeTruthy();

    article.focus();
    await user.keyboard(' ');
    expect(screen.queryByRole('region')).toBeNull();
  });

  it('displays description, alternatives and evidence when open', async () => {
    render(<MetadataCard {...baseProps} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));

    expect(screen.getByText('A description')).toBeTruthy();
    expect(screen.getByText('Alt A')).toBeTruthy();
    expect(screen.getByText(/"Source X"/)).toBeTruthy();
  });

  it('shows Edit button when onSave provided', async () => {
    render(<MetadataCard {...baseProps} onSave={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    expect(screen.getByRole('button', { name: /Edit "Sample"/i })).toBeTruthy();
  });

  it('enters edit mode and saves changes', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    const titleInput = screen.getByRole('textbox', { name: /Edit title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'New Title');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ title: 'New Title', name: 'New Title' }));
  });

  it('cancels editing and restores original title', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    const titleInput = screen.getByRole('textbox', { name: /Edit title/i });
    await user.clear(titleInput);
    await user.type(titleInput, 'Changed');

    await user.click(screen.getByRole('button', { name: /Cancel editing/i }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText('Sample')).toBeTruthy();
  });

  it('shows Verify button when onVerify provided', async () => {
    const onVerify = vi.fn();
    render(<MetadataCard {...baseProps} onVerify={onVerify} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    expect(screen.getByRole('button', { name: /Verify/i })).toBeTruthy();
  });

  it('calls onVerify when verify button clicked', async () => {
    const onVerify = vi.fn();
    render(<MetadataCard {...baseProps} onVerify={onVerify} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Verify/i }));

    expect(onVerify).toHaveBeenCalled();
  });

  it('hides Verify button when already verified', async () => {
    render(<MetadataCard {...baseProps} verified={true} onVerify={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    expect(screen.queryByRole('button', { name: /Verify/i })).toBeNull();
  });

  it('shows verified badge', async () => {
    render(<MetadataCard {...baseProps} verified={true} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    expect(screen.getByText(/verified/i)).toBeTruthy();
  });

  it('displays extra details', async () => {
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
  });

  it('edits extra detail fields', async () => {
    const onSave = vi.fn();
    const extraDetails = [{ label: 'Editable', value: 'Original', key: 'edit1' }];
    render(<MetadataCard {...baseProps} extraDetails={extraDetails} onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    const inputs = screen.getAllByRole('textbox');
    const extraInput = inputs.find((i) => (i as HTMLInputElement).value === 'Original');
    await user.clear(extraInput!);
    await user.type(extraInput!, 'Changed');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ edit1: 'Changed' }));
  });

  it('edits owner field', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} owner="alice" onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    const ownerInput = screen.getByRole('textbox', { name: /Edit owner/i });
    await user.clear(ownerInput);
    await user.type(ownerInput, 'bob');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ owner: 'bob' }));
  });

  it('edits description field', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} description="Orig" onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    const descTextarea = screen.getByLabelText(/Description/i);
    await user.clear(descTextarea);
    await user.type(descTextarea, 'New');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ description: 'New' }));
  });

  it('edits alternatives field', async () => {
    const onSave = vi.fn();
    render(<MetadataCard {...baseProps} alternatives="Alt 1" onSave={onSave} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    const altsTextarea = screen.getByLabelText(/Alternatives/i);
    await user.clear(altsTextarea);
    await user.type(altsTextarea, 'Alt 2');

    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ alternatives: 'Alt 2' }));
  });

  it('shows Delete button when onDelete provided', async () => {
    render(<MetadataCard {...baseProps} onDelete={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    expect(screen.getByRole('button', { name: /Delete/i })).toBeTruthy();
  });

  it('opens delete confirmation modal', async () => {
    render(<MetadataCard {...baseProps} onDelete={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Delete/i }));

    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeTruthy();
  });

  it('calls onDelete on confirmation', async () => {
    const onDelete = vi.fn();
    render(<MetadataCard {...baseProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Delete/i }));

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeTruthy();

    const deleteBtn = screen.getByRole('button', { name: /Confirm deletion/i });
    await user.click(deleteBtn);

    expect(onDelete).toHaveBeenCalled();
  });

  it('cancels deletion', async () => {
    const onDelete = vi.fn();
    render(<MetadataCard {...baseProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Delete/i }));
    await user.click(screen.getByRole('button', { name: /Cancel deletion/i }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('closes modal on Escape', async () => {
    render(<MetadataCard {...baseProps} onDelete={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /Sample/i }));
    await user.click(screen.getByRole('button', { name: /Delete/i }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('opens with defaultOpen prop', () => {
    render(<MetadataCard {...baseProps} defaultOpen={true} />);
    expect(screen.getByRole('region', { name: /Details for Sample/i })).toBeTruthy();
  });

  it('shows displayType badge', () => {
    render(<MetadataCard {...baseProps} displayType="EPIC" showKanbanStatus={false} />);
    expect(screen.getByText('EPIC')).toBeTruthy();
  });

  it('shows type conversion menu', async () => {
    render(<MetadataCard {...baseProps} type="epic" id={1} raw={{}} displayType="epic" defaultOpen={true} />);
    const user = userEvent.setup();

    const typeBtn = screen.getByRole('button', { name: /Change type from epic/i });
    await user.click(typeBtn);

    expect(screen.getByText(/Convert to decision/i)).toBeTruthy();
    expect(screen.getByText(/Convert to task/i)).toBeTruthy();
  });

  it('shows type conversion warning modal', async () => {
    render(<MetadataCard {...baseProps} type="epic" id={1} raw={{}} displayType="epic" defaultOpen={true} />);
    const user = userEvent.setup();

    const typeBtn = screen.getByRole('button', { name: /Change type from epic/i });
    await user.click(typeBtn);

    const convertBtn = screen.getByRole('menuitem', { name: /Convert to task/i });
    await user.click(convertBtn);

    expect(screen.getByText(/Change metadata type/i)).toBeTruthy();
  });
});