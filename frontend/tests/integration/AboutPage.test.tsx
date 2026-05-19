import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import AboutPage from '../../src/pages/AboutPage';

afterEach(() => {
  cleanup();
});

describe('AboutPage Integration Tests', () => {
  it('renders complete page structure with all content', () => {
    render(<AboutPage />);

    const section = screen.getByRole('region', { name: /About/i });
    expect(section).toBeTruthy();

    const mainHeading = screen.getByRole('heading', { level: 1, name: /About/i });
    expect(mainHeading).toBeTruthy();
    expect(mainHeading).toHaveAttribute('id', 'about-heading');
  });

  it('displays thesis information correctly', () => {
    render(<AboutPage />);

    expect(screen.getByText(/IDATT2901 Bachelor Thesis/i)).toBeTruthy();
    expect(screen.getByText(/NTNU Trondheim/i)).toBeTruthy();
    expect(screen.getByText(/implement the agile Rolling Wave Planning/i)).toBeTruthy();
    expect(screen.getByText(/Upload your project documents to extract structured metadata/i)).toBeTruthy();
  });

  it('displays upload instructions', () => {
    render(<AboutPage />);

    expect(screen.getByText(/Upload your project documents/i)).toBeTruthy();
    expect(screen.getByText(/Epics, Decisions, Deliverables, Tasks/i)).toBeTruthy();
    const introParagraph = screen.getByText(/Upload your project documents to extract structured metadata/i);
    expect(introParagraph.textContent).toContain('Activities');
  });

  it('renders metadata types section with correct heading', () => {
    render(<AboutPage />);

    const metadataHeading = screen.getByRole('heading', { name: /Metadata Types/i });
    expect(metadataHeading).toBeTruthy();
  });

  it('renders all 5 metadata type cards', () => {
    render(<AboutPage />);

    const list = screen.getByRole('list', { name: /Metadata type descriptions/i });
    expect(list).toBeTruthy();

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
  });

  it('displays Epic metadata type with icon and description', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);

    const epicItem = items[0];
    expect(within(epicItem).getByRole('heading', { name: /Epic/i, level: 3 })).toBeTruthy();
    expect(within(epicItem).getByText(/An epic \(EPIC\) is a major project goal/i)).toBeTruthy();
  });

  it('displays Decision metadata type with icon and description', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);

    const decisionItem = items[1];
    expect(within(decisionItem).getByRole('heading', { name: /Decision/i, level: 3 })).toBeTruthy();
    expect(within(decisionItem).getByText(/A decision \(DEC\) is a choice/i)).toBeTruthy();
  });

  it('displays Deliverable metadata type with icon and description', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);

    const deliverableItem = items[2];
    expect(within(deliverableItem).getByRole('heading', { name: /Deliverable/i, level: 3 })).toBeTruthy();
    expect(within(deliverableItem).getByText(/A deliverable \(DEL\) is a major result/i)).toBeTruthy();
  });

  it('displays Activity metadata type with icon and description', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);

    const activityItem = items[3];
    expect(within(activityItem).getByRole('heading', { name: /Activity/i, level: 3 })).toBeTruthy();
    expect(within(activityItem).getByText(/An activity \(ACT\) is a means/i)).toBeTruthy();
  });

  it('displays Task metadata type with icon and description', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);

    const taskItem = items[4];
    expect(within(taskItem).getByRole('heading', { name: /Task/i, level: 3 })).toBeTruthy();
    expect(within(taskItem).getByText(/A task \(TSK\) is an individual/i)).toBeTruthy();
  });
});