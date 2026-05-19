import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import AboutPage from '../../src/pages/AboutPage';

afterEach(() => {
  cleanup();
});

describe('AboutPage', () => {
  it('renders a section landmark with the expected heading', () => {
    render(<AboutPage />);

    const section = screen.getByRole('region', { name: /About/i });
    expect(section).toBeTruthy();

    const heading = screen.getByRole('heading', { level: 1, name: /About/i });
    expect(heading).toBeTruthy();
    expect(heading).toHaveAttribute('id', 'about-heading');
  });

  it('renders the thesis title and description', () => {
    render(<AboutPage />);

    expect(screen.getByText(/IDATT2901 Bachelor Thesis/i)).toBeTruthy();
    expect(screen.getByText(/NTNU Trondheim/i)).toBeTruthy();
    expect(screen.getByText(/implement the agile Rolling Wave Planning/i)).toBeTruthy();
    expect(screen.getByText(/Upload your project documents to extract structured metadata/i)).toBeTruthy();
  });

  it('renders a description paragraph about uploading documents', () => {
    render(<AboutPage />);

    expect(screen.getByText(/Upload your project documents/i)).toBeTruthy();
    expect(screen.getByText(/Epics, Decisions, Deliverables, Tasks/i)).toBeTruthy();
  });

  it('renders metadata types heading', () => {
    render(<AboutPage />);

    const metadataHeading = screen.getByRole('heading', { name: /Metadata Types/i });
    expect(metadataHeading).toBeTruthy();
  });

  it('renders a list with accessible role and label for metadata types', () => {
    render(<AboutPage />);

    const list = screen.getByRole('list', { name: /Metadata type descriptions/i });
    expect(list).toBeTruthy();
  });

  it('renders exactly 5 metadata type items', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
  });

  it('each metadata type has a heading and description', () => {
    render(<AboutPage />);

        const expectedTypes = [
      { name: 'Epic', desc: 'An epic (EPIC) is a major project goal. It can be composed ' +
        'of decisions, deliverables, activities, and tasks.' },
      { name: 'Decision', desc: 'A decision (DEC) is a choice that needs to be made to ' +
        'determine how a project is to be completed.' },
      { name: 'Deliverable', desc: 'A deliverable (DEL) is a major result than needs to be ' +
        'delivered to complete and epic. It can be composed of activities and tasks.' },
      { name: 'Activity', desc: 'An activity (ACT) is a means to an end (deliverables). ' +
        'It describe how the project work is executed and can be decomposed into tasks.' },
      { name: 'Task', desc: 'A task (TSK) is an individual, actionable work item, ' +
        'which cannot be further decomposed into any smaller parts.' },
    ];

    expectedTypes.forEach((type) => {
      expect(screen.getByText(type.name)).toBeTruthy();
      expect(screen.getByText(type.desc)).toBeTruthy();
    });
  });

  it('each metadata type has an h3 heading', () => {
    render(<AboutPage />);

    const expectedTypes = [
      { name: 'Epic', desc: 'An epic (EPIC) is a major project goal. It can be composed ' +
        'of decisions, deliverables, activities, and tasks.' },
      { name: 'Decision', desc: 'A decision (DEC) is a choice that needs to be made to ' +
        'determine how a project is to be completed.' },
      { name: 'Deliverable', desc: 'A deliverable (DEL) is a major result than needs to be ' +
        'delivered to complete and epic. It can be composed of activities and tasks.' },
      { name: 'Activity', desc: 'An activity (ACT) is a means to an end (deliverables). ' +
        'It describe how the project work is executed and can be decomposed into tasks.' },
      { name: 'Task', desc: 'A task (TSK) is an individual, actionable work item, ' +
        'which cannot be further decomposed into any smaller parts.' },
    ];

    expectedTypes.forEach((type) => {
      const heading = screen.getByRole('heading', { level: 3, name: new RegExp(type.name, 'i') });
      expect(heading).toBeTruthy();
    });
  });

  it('list items contain both icon and text content', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');

    items.forEach((item) => {
      const heading = item.querySelector('h3');
      const description = item.querySelector('p');

      expect(heading).toBeTruthy();
      expect(description).toBeTruthy();
    });
  });
});