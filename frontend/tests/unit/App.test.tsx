import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import App from '../../src/App';

// Mock all page components and Navbar
vi.mock('../../src/components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('../../src/pages/OverviewPage', () => ({
  default: () => <div data-testid="overview-page">Overview Page</div>,
}));

vi.mock('../../src/pages/KanbanPage', () => ({
  default: () => <div data-testid="kanban-page">Kanban Page</div>,
}));

vi.mock('../../src/pages/DocumentsPage', () => ({
  default: () => <div data-testid="documents-page">Documents Page</div>,
}));

vi.mock('../../src/pages/UploadPage', () => ({
  default: () => <div data-testid="upload-page">Upload Page</div>,
}));

vi.mock('../../src/pages/AboutPage', () => ({
  default: () => <div data-testid="about-page">About Page</div>,
}));

// Mock the API to prevent actual calls
vi.mock('../../src/api', () => ({
  getEpics: vi.fn().mockResolvedValue([]),
  getDecisions: vi.fn().mockResolvedValue([]),
  getDeliverables: vi.fn().mockResolvedValue([]),
  getTasks: vi.fn().mockResolvedValue([]),
  getActivities: vi.fn().mockResolvedValue([]),
}));

afterEach(() => {
  cleanup();
});

describe('App (focused tests)', () => {
  it('renders the app container with correct structure', () => {
    render(<App />);

    const appDiv = document.querySelector('.app');
    expect(appDiv).toBeTruthy();
  });

  it('renders skip link with correct attributes', () => {
    render(<App />);

    const skipLink = screen.getByText(/Skip to main content/i);
    expect(skipLink).toBeTruthy();
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(skipLink.className).toContain('skip-link');
  });

  it('renders Navbar component', () => {
    render(<App />);

    const navbar = screen.getByTestId('navbar');
    expect(navbar).toBeTruthy();
  });

  it('renders main element with correct attributes', () => {
    render(<App />);

    const main = screen.getByRole('main');
    expect(main).toBeTruthy();
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main.className).toContain('app-main');
  });

  it('redirects from / to /overview by default', () => {
    render(<App />);

    const overviewPage = screen.getByTestId('overview-page');
    expect(overviewPage).toBeTruthy();
  });

  it('renders OverviewPage at /overview route', () => {
    window.history.pushState({}, '', '/overview');
    render(<App />);

    const overviewPage = screen.getByTestId('overview-page');
    expect(overviewPage).toBeTruthy();
  });

  it('renders KanbanPage at /kanban route', () => {
    window.history.pushState({}, '', '/kanban');
    render(<App />);

    const kanbanPage = screen.getByTestId('kanban-page');
    expect(kanbanPage).toBeTruthy();
  });

  it('renders DocumentsPage at /documents route', () => {
    window.history.pushState({}, '', '/documents');
    render(<App />);

    const documentsPage = screen.getByTestId('documents-page');
    expect(documentsPage).toBeTruthy();
  });

  it('renders UploadPage at /upload route', () => {
    window.history.pushState({}, '', '/upload');
    render(<App />);

    const uploadPage = screen.getByTestId('upload-page');
    expect(uploadPage).toBeTruthy();
  });

  it('renders AboutPage at /about route', () => {
    window.history.pushState({}, '', '/about');
    render(<App />);

    const aboutPage = screen.getByTestId('about-page');
    expect(aboutPage).toBeTruthy();
  });
});