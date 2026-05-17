import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import * as api from '../../src/api';
import Navbar from '../../src/components/Navbar';
import OverviewPage from '../../src/pages/OverviewPage';
import UploadPage from '../../src/pages/UploadPage';
import DocumentsPage from '../../src/pages/DocumentsPage';
import KanbanPage from '../../src/pages/KanbanPage';
import AboutPage from '../../src/pages/AboutPage';
import App from '../../src/App';

const AppRoutes: React.FC = () => (
  <div className="app">
    <a href="#main-content" className="skip-link">Skip to main content</a>
    <Navbar />
    <main id="main-content" className="app-main" role="main">
      <Routes>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<OverviewPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/docs" element={<DocumentsPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </main>
  </div>
);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(api, 'getEpics').mockResolvedValue([]);
    vi.spyOn(api, 'getDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'getDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'getTasks').mockResolvedValue([]);
    vi.spyOn(api, 'getActivities').mockResolvedValue([]);
    vi.spyOn(api, 'getDocuments').mockResolvedValue([]);
  });

  it('renders app structure with skip link and navbar', () => {
    render(<App />);

    const appDiv = document.querySelector('.app');
    expect(appDiv).toBeTruthy();

    const skipLink = screen.getByText(/Skip to main content/i);
    expect(skipLink).toBeTruthy();
    expect(skipLink).toHaveAttribute('href', '#main-content');
    expect(skipLink.className).toContain('skip-link');

    const nav = screen.getByRole('navigation', { name: /Main navigation/i });
    expect(nav).toBeTruthy();
  });

  it('renders main element with correct attributes', () => {
    render(<App />);

    const main = screen.getByRole('main');
    expect(main).toBeTruthy();
    expect(main).toHaveAttribute('id', 'main-content');
    expect(main.className).toContain('app-main');
  });

  it('redirects from root to /overview', async () => {
    render(<App />);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1, name: /Metadata Overview/i });
      expect(heading).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('navigates to Overview page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      const overviewLink = screen.getByRole('link', { name: /View all extracted metadata/i });
      expect(overviewLink).toBeTruthy();
    });

    const overviewLink = screen.getByRole('link', { name: /View all extracted metadata/i });
    await user.click(overviewLink);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1, name: /Metadata Overview/i });
      expect(heading).toBeTruthy();
    });
  });

  it('navigates to Kanban page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      const kanbanLink = screen.getByRole('link', { name: /Manage items on the board/i });
      expect(kanbanLink).toBeTruthy();
    });

    const kanbanLink = screen.getByRole('link', { name: /Manage items on the board/i });
    await user.click(kanbanLink);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1, name: /Kanban Board/i });
      expect(heading).toBeTruthy();
    });
  });

  it('navigates to Documents page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      const documentsLink = screen.getByRole('link', { name: /Browse uploaded documents/i });
      expect(documentsLink).toBeTruthy();
    });

    const documentsLink = screen.getByRole('link', { name: /Browse uploaded documents/i });
    await user.click(documentsLink);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1, name: /Uploaded Documents/i });
      expect(heading).toBeTruthy();
    });
  });

  it('navigates to Upload page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      const uploadLink = screen.getByRole('link', { name: /Upload a new document/i });
      expect(uploadLink).toBeTruthy();
    });

    const uploadLink = screen.getByRole('link', { name: /Upload a new document/i });
    await user.click(uploadLink);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1, name: /Upload Document/i });
      expect(heading).toBeTruthy();
    });
  });

  it('navigates to About page', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      const aboutLink = screen.getByRole('link', { name: /Learn about this tool/i });
      expect(aboutLink).toBeTruthy();
    });

    const aboutLink = screen.getByRole('link', { name: /Learn about this tool/i });
    await user.click(aboutLink);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1, name: /About/i });
      expect(heading).toBeTruthy();
    });
  });

  it('maintains navigation state across page changes', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/overview']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Metadata Overview/i })).toBeTruthy();
    });

    const uploadLink = screen.getByRole('link', { name: /Upload a new document/i });
    await user.click(uploadLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Upload Document/i })).toBeTruthy();
    });

    const aboutLink = screen.getByRole('link', { name: /Learn about this tool/i });
    await user.click(aboutLink);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /About/i })).toBeTruthy();
    });

    expect(aboutLink).toHaveClass('nav-link--active');
  });

  it('navbar is present on all pages', async () => {
    const user = userEvent.setup();
    render(<App />);

    const pages = [
      { link: /View all extracted metadata/i, heading: /Metadata Overview/i },
      { link: /Manage items on the board/i, heading: /Kanban Board/i },
      { link: /Browse uploaded documents/i, heading: /Uploaded Documents/i },
      { link: /Upload a new document/i, heading: /Upload Document/i },
      { link: /Learn about this tool/i, heading: /About/i },
    ];

    for (const page of pages) {
      const nav = screen.getByRole('navigation', { name: /Main navigation/i });
      expect(nav).toBeTruthy();

      const link = screen.getByRole('link', { name: page.link });
      await user.click(link);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: page.heading })).toBeTruthy();
      }, { timeout: 3000 });
    }
  });
});