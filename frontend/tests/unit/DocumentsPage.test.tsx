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
  const result = render(<MemoryRouter>{ui}</MemoryRouter>);
  await Promise.resolve();
  return result;
}

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a section landmark with the expected heading', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue([]);
    await renderWithRouter(<DocumentsPage />);

    const section = screen.getByRole('region', { name: /Uploaded Documents/i });
    expect(section).toBeTruthy();

    const heading = screen.getByRole('heading', { level: 1, name: /Uploaded Documents/i });
    expect(heading).toBeTruthy();
    expect(heading).toHaveAttribute('id', 'docs-heading');
  });

  it('shows loading state initially', async () => {
    vi.spyOn(api, 'getDocuments').mockImplementation(() => new Promise(() => {}));
    await renderWithRouter(<DocumentsPage />);

    const loadingEl = screen.getByRole('status', { name: /Loading documents/i });
    expect(loadingEl).toBeTruthy();
    expect(loadingEl).toHaveTextContent(/Loading/i);
  });

  it('shows empty state with upload button when no documents exist', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue([]);
    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      const emptyState = screen.getByRole('status');
      expect(emptyState).toHaveTextContent(/No documents yet/i);
    });

    const uploadBtn = screen.getByRole('button', { name: /Navigate to upload page/i });
    expect(uploadBtn).toBeTruthy();
    expect(uploadBtn).toHaveTextContent(/Upload one/i);
    expect(uploadBtn).toHaveAttribute('title', 'Go to the upload page');
  });

  it('renders a list of documents', async () => {
    const mockDocs = ['doc1.txt', 'doc2.docx', 'doc3.txt'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      const docList = document.querySelector('.doc-list');
      expect(docList).toBeTruthy();
    });

    const docRows = document.querySelectorAll('.doc-row');
    expect(docRows).toHaveLength(mockDocs.length);
  });

  it('each document has correct name and action buttons', async () => {
    const mockDocs = ['report.txt', 'notes.docx'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      mockDocs.forEach((filename) => {
        expect(screen.getByText(filename)).toBeTruthy();

        const viewBtn = screen.getByRole('button', { name: `View document: ${filename}` });
        expect(viewBtn).toBeTruthy();
        expect(viewBtn).toHaveTextContent('View');

        const deleteBtn = screen.getByRole('button', { name: `Delete document: ${filename}` });
        expect(deleteBtn).toBeTruthy();
        expect(deleteBtn).toHaveTextContent('Delete');
      });
    });
  });

  it('shows View button for each document', async () => {
    const mockDocs = ['test.txt'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View document: test.txt/i })).toBeTruthy();
    });
  });

  it('clicking View button opens modal and loads document content', async () => {
    const mockDocs = ['test.txt'];
    const mockContent = 'This is the document content.';
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue(mockContent);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeTruthy();
    });

    const viewBtn = screen.getByRole('button', { name: /View document: test.txt/i });
    await userEvent.click(viewBtn);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    const modalHeading = screen.getByRole('heading', { name: 'test.txt' });
    expect(modalHeading).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText(mockContent)).toBeTruthy();
    });

    expect(api.getDocumentByName).toHaveBeenCalledWith('test.txt');
  });

  it('shows loading state inside modal while fetching document', async () => {
    const mockDocs = ['slow.txt'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getDocumentByName').mockImplementation(() => new Promise(() => {}));

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('slow.txt')).toBeTruthy();
    });

    const viewBtn = screen.getByRole('button', { name: /View document: slow.txt/i });
    await userEvent.click(viewBtn);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
    });

    await waitFor(() => {
      const loadingStatus = screen.getByRole('status');
      expect(loadingStatus).toHaveTextContent(/Loading document/i);
    });
  });

  it('shows error message when document loading fails', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockDocs = ['error.txt'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getDocumentByName').mockRejectedValue(new Error('Failed to load'));

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('error.txt')).toBeTruthy();
    });

    const viewBtn = screen.getByRole('button', { name: /View document: error.txt/i });
    await userEvent.click(viewBtn);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load document/i)).toBeTruthy();
    });

    consoleErrorSpy.mockRestore();
  });

  it('clicking Close button closes the modal', async () => {
    const mockDocs = ['closable.txt'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue('Content');

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('closable.txt')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /View document: closable.txt/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    await userEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('clicking modal overlay closes the modal', async () => {
    const mockDocs = ['overlay-test.txt'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue('Content');

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('overlay-test.txt')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /View document: overlay-test.txt/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    expect(overlay).toBeTruthy();

    await userEvent.click(overlay);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('handles API error when fetching documents list', async () => {
    vi.spyOn(api, 'getDocuments').mockRejectedValue(new Error('Network error'));

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      const emptyState = screen.getByRole('status');
      expect(emptyState).toHaveTextContent(/No documents yet/i);
    });
  });

  it('modal dialog has correct accessibility attributes', async () => {
    const mockDocs = ['a11y-test.txt'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue('Test content');

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('a11y-test.txt')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /View document: a11y-test.txt/i }));

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    const heading = screen.getByRole('heading', { name: 'a11y-test.txt' });
    expect(heading).toBeTruthy();
    expect(heading.tagName).toBe('H2');
  });

  it('displays document content in pre element for proper formatting', async () => {
    const mockDocs = ['formatted.txt'];
    const mockContent = 'Line 1\nLine 2\n  Indented line';
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue(mockContent);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('formatted.txt')).toBeTruthy();
    });

    await userEvent.click(screen.getByRole('button', { name: /View document: formatted.txt/i }));

    await waitFor(() => {
      const preElement = document.querySelector('pre');
      expect(preElement).toBeTruthy();
      expect(preElement?.textContent).toBe(mockContent);
    });
  });

  it('renders Delete button for each document', async () => {
    const mockDocs = ['deletable.txt'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      const deleteBtn = screen.getByRole('button', { name: /Delete document: deletable.txt/i });
      expect(deleteBtn).toBeTruthy();
      expect(deleteBtn).toHaveTextContent('Delete');
    });
  });
});