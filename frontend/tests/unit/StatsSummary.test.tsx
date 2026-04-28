import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import StatsSummary from '../../src/components/StatsSummary';

afterEach(() => {
  cleanup();
});

describe('StatsSummary (focused tests)', () => {
  it('renders a section landmark with the expected aria-label', () => {
    render(<StatsSummary stats={[{ label: 'A', value: 1 }]} />);
    const section = screen.getByRole('region', { name: /Metadata statistics summary/i }) || screen.getByLabelText('Metadata statistics summary');
    expect(section).toBeTruthy();
  });

  it('renders exactly one stat group per stat in the input array', () => {
    const stats = [
      { label: 'Alpha', value: 10 },
      { label: 'Beta', value: 'N/A' },
      { label: 'Gamma', value: 0 },
    ];
    render(<StatsSummary stats={stats} />);
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(stats.length);
  });

  it('each stat group has correct aria-label and title attributes', () => {
    const stats = [
      { label: 'Alpha', value: 10 },
      { label: 'Beta', value: 'N/A' },
    ];
    render(<StatsSummary stats={stats} />);
    for (const s of stats) {
      const expected = `${s.label}: ${s.value}`;

      const group = screen.getByRole('group', { name: expected });
      expect(group).toBeTruthy();
      expect(group).toHaveAttribute('title', expected);
    }
  });

  it('links stat-value to its label using aria-labelledby', () => {
    const stats = [
      { label: 'Alpha', value: 42 },
      { label: 'Beta', value: 'ok' },
    ];
    render(<StatsSummary stats={stats} />);

    for (const s of stats) {
      const labelId = `stat-${s.label}`;
      const labelEl = document.getElementById(labelId);
      expect(labelEl).toBeTruthy();
      const valueEl = screen.getByText(String(s.value));
      expect(valueEl).toBeTruthy();
      expect(valueEl).toHaveAttribute('aria-labelledby', labelId);
    }
  });

  it('applies variant class names for peach and rose and no modifier for default', () => {
    const stats = [
      { label: 'Default', value: 1 },
      { label: 'Peach', value: 2, variant: 'peach' as const },
      { label: 'Rose', value: 3, variant: 'rose' as const },
    ];
    render(<StatsSummary stats={stats} />);

    const defaultVal = screen.getByText('1');
    expect(defaultVal.className).toMatch(/\bstat-value\b/);
    expect(defaultVal.className).not.toMatch(/\bstat-value--peach\b/);
    expect(defaultVal.className).not.toMatch(/\bstat-value--rose\b/);

    const peachVal = screen.getByText('2');
    expect(peachVal.className).toMatch(/\bstat-value--peach\b/);

    const roseVal = screen.getByText('3');
    expect(roseVal.className).toMatch(/\bstat-value--rose\b/);
  });

  it('renders both numeric and string values correctly', () => {
    const stats = [
      { label: 'Number', value: 100 },
      { label: 'String', value: 'Many' },
    ];
    render(<StatsSummary stats={stats} />);

    expect(screen.getByText('100')).toBeTruthy();
    expect(screen.getByText('Many')).toBeTruthy();
  });

  it('renders no stat groups when given an empty stats array', () => {
    render(<StatsSummary stats={[]} />);
    const groups = screen.queryAllByRole('group');
    expect(groups.length).toBe(0);

    const section = screen.getByLabelText('Metadata statistics summary');
    expect(section).toBeTruthy();
  });
});