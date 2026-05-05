import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterTabs, { Tab } from '../../src/components/FilterTabs';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeTabs(): Tab[] {
  return [
    { key: 'epics', label: 'Epics', count: 3 },
    { key: 'decisions', label: 'Decisions', count: 2 },
    { key: 'tasks', label: 'Tasks', count: 7 },
  ];
}

describe('FilterTabs (small focused tests)', () => {
  it('renders the tablist with correct accessible name', () => {
    render(<FilterTabs tabs={makeTabs()} active="epics" onChange={vi.fn()} />);
    const tablist = screen.getByRole('tablist', { name: /Filter by metadata type/i });
    expect(tablist).toBeTruthy();
  });

  it('renders the correct number of tab buttons', () => {
    const tabs = makeTabs();
    render(<FilterTabs tabs={tabs} active="epics" onChange={vi.fn()} />);
    const buttons = screen.getAllByRole('tab');
    expect(buttons.length).toBe(tabs.length);
  });

  it('gives each tab an id and corresponding aria-controls attribute', () => {
    const tabs = makeTabs();
    render(<FilterTabs tabs={tabs} active="epics" onChange={vi.fn()} />);
    for (const t of tabs) {
      const btn = document.getElementById(`tab-${t.key}`);
      expect(btn).toBeInstanceOf(HTMLButtonElement);
      expect(btn).toHaveAttribute('aria-controls', `tabpanel-${t.key}`);
    }
  });

  it('adds the expected title attribute to each tab containing label and count', () => {
    const tabs = makeTabs();
    render(<FilterTabs tabs={tabs} active="epics" onChange={vi.fn()} />);
    for (const t of tabs) {
      const btn = document.getElementById(`tab-${t.key}`)!;
      expect(btn).toHaveAttribute('title', `Show ${t.label} (${t.count} items)`);
    }
  });

  it('renders a visible label and a count span with an aria-label for each tab', () => {
    const tabs = makeTabs();
    render(<FilterTabs tabs={tabs} active="epics" onChange={vi.fn()} />);
    for (const t of tabs) {
      const btn = document.getElementById(`tab-${t.key}`)!;
      expect(btn).toHaveTextContent(t.label);
      const countSpan = btn.querySelector('.tab-count') as HTMLElement | null;
      expect(countSpan).toBeTruthy();
      expect(countSpan).toHaveTextContent(String(t.count));
      expect(countSpan).toHaveAttribute('aria-label', `${t.count} items`);
    }
  });

  it('sets aria-selected="true" for the active tab and "false" for others', () => {
    const tabs = makeTabs();
    render(<FilterTabs tabs={tabs} active="decisions" onChange={vi.fn()} />);
    for (const t of tabs) {
      const btn = document.getElementById(`tab-${t.key}`)!;
      const expected = t.key === 'decisions' ? 'true' : 'false';
      expect(btn.getAttribute('aria-selected')).toBe(expected);
    }
  });

  it('applies the active CSS class only to the active tab', () => {
    const tabs = makeTabs();
    render(<FilterTabs tabs={tabs} active="tasks" onChange={vi.fn()} />);
    for (const t of tabs) {
      const btn = document.getElementById(`tab-${t.key}`)!;
      if (t.key === 'tasks') {
        expect(btn.className).toMatch(/\btab--active\b/);
      } else {
        expect(btn.className).not.toMatch(/\btab--active\b/);
      }
    }
  });

  it('calls onChange with the clicked tab key', async () => {
    const tabs = makeTabs();
    const onChange = vi.fn();
    render(<FilterTabs tabs={tabs} active="epics" onChange={onChange} />);

    const target = document.getElementById('tab-decisions') as HTMLButtonElement;
    expect(target).toBeTruthy();

    await userEvent.click(target);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('decisions');
  });

  it('calls onChange each time the same tab is clicked (no internal short-circuit)', async () => {
    const tabs = makeTabs();
    const onChange = vi.fn();
    render(<FilterTabs tabs={tabs} active="epics" onChange={onChange} />);

    const target = document.getElementById('tab-decisions') as HTMLButtonElement;
    await userEvent.click(target);
    await userEvent.click(target);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('activates onChange when focused tab receives Enter key', async () => {
    const onChange = vi.fn();
    render(<FilterTabs tabs={makeTabs()} active="epics" onChange={onChange} />);
    const btn = document.getElementById('tab-tasks') as HTMLButtonElement;
    btn.focus();
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('tasks');
  });

  it('activates onChange when focused tab receives Space key', async () => {
    const onChange = vi.fn();
    render(<FilterTabs tabs={makeTabs()} active="epics" onChange={onChange} />);
    const btn = document.getElementById('tab-tasks') as HTMLButtonElement;
    btn.focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('tasks');
  });

  it('renders the tablist but no tab buttons when tabs array is empty', () => {
    render(<FilterTabs tabs={[]} active="" onChange={vi.fn()} />);
    const tablist = screen.getByRole('tablist', { name: /Filter by metadata type/i });
    expect(tablist).toBeTruthy();
    const tabs = screen.queryAllByRole('tab');
    expect(tabs.length).toBe(0);
  });
});