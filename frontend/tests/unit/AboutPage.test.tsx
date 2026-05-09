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
    expect(screen.getByText(/increase efficiency/i)).toBeTruthy();
    expect(screen.getByText(/LLMs/i)).toBeTruthy();
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

    const list = screen.getByRole('list', { name: /Supported metadata types/i });
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
      { name: 'Epic', desc: 'Major planned features or capabilities' },
      { name: 'Decision', desc: 'Decisions with alternatives & ownership' },
      { name: 'Deliverable', desc: 'Tangible or intangible project results' },
      { name: 'Activity', desc: 'Ongoing project activities' },
      { name: 'Task', desc: 'Individual actionable work items' },
    ];

    expectedTypes.forEach((type) => {
      expect(screen.getByText(type.name)).toBeTruthy();
      expect(screen.getByText(type.desc)).toBeTruthy();
    });
  });

  it('each metadata type article has a title attribute with name and description', () => {
    render(<AboutPage />);

    const expectedTypes = [
      { name: 'Epic', desc: 'Major planned features or capabilities' },
      { name: 'Decision', desc: 'Decisions with alternatives & ownership' },
      { name: 'Deliverable', desc: 'Tangible or intangible project results' },
      { name: 'Activity', desc: 'Ongoing project activities' },
      { name: 'Task', desc: 'Individual actionable work items' },
    ];

    const items = screen.getAllByRole('listitem');

    expectedTypes.forEach((type, index) => {
      expect(items[index]).toHaveAttribute('title', `${type.name}: ${type.desc}`);
    });
  });
});