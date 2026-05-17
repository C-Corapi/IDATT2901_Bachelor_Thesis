import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
    expect(screen.getByText(/increase efficiency/i)).toBeTruthy();
    expect(screen.getByText(/LLMs/i)).toBeTruthy();
  });

  it('displays upload instructions', () => {
    render(<AboutPage />);

    expect(screen.getByText(/Upload your project documents/i)).toBeTruthy();
    expect(screen.getByText(/Epics, Decisions, Deliverables, Tasks/i)).toBeTruthy();
    const introParagraph = screen.getByText(/Upload your project documents and the system will automatically extract/i);
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
    expect(screen.getByRole('heading', { name: /Epic/i, level: 3 })).toBeTruthy();
    expect(screen.getByText(/Major planned features or capabilities/i)).toBeTruthy();

  });

  it('displays Decision metadata type with icon and description', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(screen.getByRole('heading', { name: /Decision/i, level: 3 })).toBeTruthy();
    expect(screen.getByText(/Decisions with alternatives/i)).toBeTruthy();
  });

  it('displays Deliverable metadata type with icon and description', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(screen.getByRole('heading', { name: /Deliverable/i, level: 3 })).toBeTruthy();
    expect(screen.getByText(/Tangible or intangible/i)).toBeTruthy();

  });

  it('displays Activity metadata type with icon and description', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(screen.getByRole('heading', { name: /Activity/i, level: 3 })).toBeTruthy();
    expect(screen.getByText(/Ongoing project activities/i)).toBeTruthy();
  });

  it('displays Task metadata type with icon and description', () => {
    render(<AboutPage />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(screen.getByRole('heading', { name: /Task/i, level: 3 })).toBeTruthy();
    expect(screen.getByText(/Individual actionable/i)).toBeTruthy();
  });
});