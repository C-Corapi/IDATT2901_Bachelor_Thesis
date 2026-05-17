import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DocumentsPage from '../../src/pages/DocumentsPage';
import * as api from '../../src/api';

vi.mock('../../src/api');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('DocumentsPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page structure with correct heading', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue([]);
    await renderWithRouter(<DocumentsPage />);

    const section = screen.getByRole('region', { name: /Uploaded Documents/i });
    expect(section).toBeTruthy();

    const heading = screen.getByRole('heading', { level: 1, name: /Uploaded Documents/i });
    expect(heading).toBeTruthy();
    expect(heading).toHaveAttribute('id', 'docs-heading');
  });

  it('displays loading state initially', async () => {
    vi.spyOn(api, 'getDocuments').mockImplementation(() => new Promise(() => {}));
    await renderWithRouter(<DocumentsPage />);

    const loadingMsg = screen.getByRole('status', { name: /Loading documents/i });
    expect(loadingMsg).toBeTruthy();
    expect(loadingMsg).toHaveTextContent(/Loading/i);
  });

  it('displays empty state with upload button when no documents exist', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue([]);
    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      const emptyState = screen.getByRole('status');
      expect(emptyState).toHaveTextContent(/No documents yet/i);
    });

    const uploadBtn = screen.getByRole('button', { name: /Navigate to upload page/i });
    expect(uploadBtn).toBeTruthy();
    expect(uploadBtn).toHaveClass('btn-outline');
  });

  it('displays list of documents when documents exist', async () => {
    const mockDocs = ['doc1.txt', 'doc2.pdf', 'doc3.md'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      const docList = document.querySelector('.doc-list');
      expect(docList).toBeTruthy();
    });

    expect(screen.getByText('doc1.txt')).toBeTruthy();
    expect(screen.getByText('doc2.pdf')).toBeTruthy();
    expect(screen.getByText('doc3.md')).toBeTruthy();
  });

  it('renders each document with correct name and view button', async () => {
    const mockDocs = ['test.txt', 'project.pdf'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeTruthy();
      expect(screen.getByText('project.pdf')).toBeTruthy();
    });
    const viewBtn1 = screen.getByRole('button', { name: /View document: test.txt/i });
    const viewBtn2 = screen.getByRole('button', { name: /View document: project.pdf/i });

    expect(viewBtn1).toBeTruthy();
    expect(viewBtn2).toBeTruthy();
  });

  it('opens modal when view button is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue('This is the content of test.txt');

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeTruthy();
    });

    const viewBtn = screen.getByRole('button', { name: /View document: test.txt/i });
    await user.click(viewBtn);

    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeTruthy();
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });
  });

  it('displays loading state in modal while fetching document content', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    vi.spyOn(api, 'getDocumentByName').mockImplementation(() => new Promise(() => {}));

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeTruthy();
    });

    const viewBtn = screen.getByRole('button', { name: /View document: test.txt/i });
    await user.click(viewBtn);

    await waitFor(() => {
      const loadingStatus = screen.getByRole('status');
      expect(loadingStatus).toHaveTextContent(/Loading document/i);
    });
  });

  it('displays document content in modal after loading', async () => {
    const user = userEvent.setup();
    const mockDocs = ['report.txt'];
    const docContent = 'This is the full content of the document.\nLine 2\nLine 3';

    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue(docContent);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('report.txt')).toBeTruthy();
    });

    const viewBtn = screen.getByRole('button', { name: /View document: report.txt/i });
    await user.click(viewBtn);

    await waitFor(() => {
      expect(screen.getByText(/This is the full content of the document/i)).toBeTruthy();
    });
  });

  it('displays error message when document fetch fails', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.spyOn(api, 'getDocuments').mockResolvedValue(['broken.txt']);
    vi.spyOn(api, 'getDocumentByName').mockRejectedValue(new Error('Failed to fetch'));

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('broken.txt')).toBeTruthy();
    });

    const viewBtn = screen.getByRole('button', { name: /View document: broken.txt/i });
    await user.click(viewBtn);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load document/i)).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue('Content');

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeTruthy();
    });

    const viewBtn = screen.getByRole('button', { name: /View document: test.txt/i });
    await user.click(viewBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeFalsy();
    });
  });

  it('closes modal when clicking on overlay', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue('Content');

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeTruthy();
    });

    const viewBtn = screen.getByRole('button', { name: /View document: test.txt/i });
    await user.click(viewBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const overlay = document.querySelector('.modal-overlay');
    expect(overlay).toBeTruthy();

    await user.click(overlay!);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeFalsy();
    });
  });

  it('handles API errors gracefully and shows empty state', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(api, 'getDocuments').mockRejectedValue(new Error('API Error'));

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      const emptyState = screen.getByRole('status');
      expect(emptyState).toHaveTextContent(/No documents yet/i);
    });

    consoleErrorSpy.mockRestore();
  });
});