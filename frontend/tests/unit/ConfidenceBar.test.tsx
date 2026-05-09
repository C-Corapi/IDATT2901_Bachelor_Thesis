import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import ConfidenceBar from '../../src/components/ConfidenceBar';

afterEach(() => {
  cleanup();
});

describe('ConfidenceBar (focused tests)', () => {
  it('renders as a meter element with correct accessible attributes', () => {
    render(<ConfidenceBar value={75} />);

    const meter = screen.getByRole('meter');
    expect(meter).toBeTruthy();
    expect(meter).toHaveAttribute('aria-valuenow', '75');
    expect(meter).toHaveAttribute('aria-valuemin', '0');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
  });

  it('displays low confidence with correct label and color', () => {
    render(<ConfidenceBar value={45} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-label', 'Confidence: 45% (Low)');
    expect(meter).toHaveAttribute('title', 'Confidence: 45% — Low');

    expect(screen.getByText('45%')).toBeTruthy();
  });

  it('displays medium confidence with correct label and color', () => {
    render(<ConfidenceBar value={70} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-label', 'Confidence: 70% (Medium)');
    expect(meter).toHaveAttribute('title', 'Confidence: 70% — Medium');

    expect(screen.getByText('70%')).toBeTruthy();
  });

  it('displays high confidence with correct label and color', () => {
    render(<ConfidenceBar value={90} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-label', 'Confidence: 90% (High)');
    expect(meter).toHaveAttribute('title', 'Confidence: 90% — High');

    expect(screen.getByText('90%')).toBeTruthy();
  });

  it('clamps value below 0 to 0', () => {
    render(<ConfidenceBar value={-10} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0%')).toBeTruthy();
  });

  it('clamps value above 100 to 100', () => {
    render(<ConfidenceBar value={150} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100%')).toBeTruthy();
  });

  it('renders fill bar with correct width', () => {
    const { container } = render(<ConfidenceBar value={65} />);

    const fill = container.querySelector('.conf-fill') as HTMLElement;
    expect(fill).toBeTruthy();
    expect(fill.style.width).toBe('65%');
  });

  it('renders track element with aria-hidden', () => {
    const { container } = render(<ConfidenceBar value={50} />);

    const track = container.querySelector('.conf-track') as HTMLElement;
    expect(track).toBeTruthy();
    expect(track).toHaveAttribute('aria-hidden', 'true');
  });
});