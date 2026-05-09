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

describe('DocumentsPage (focused tests)', () => {
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

  it('renders a list of documents with accessible attributes', async () => {
    const mockDocs = ['doc1.txt', 'doc2.docx', 'doc3.txt'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      const list = screen.getByRole('list', { name: /Uploaded documents list/i });
      expect(list).toBeTruthy();
    });

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(mockDocs.length);
  });

  it('each document has correct name, aria-label and view button', async () => {
    const mockDocs = ['report.txt', 'notes.docx'];
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      mockDocs.forEach((filename) => {
        const item = screen.getByLabelText(`Document: ${filename}`);
        expect(item).toBeTruthy();

        expect(screen.getByText(filename)).toBeTruthy();

        const viewBtn = screen.getByRole('button', { name: `View document: ${filename}` });
        expect(viewBtn).toBeTruthy();
        expect(viewBtn).toHaveAttribute('title', `View document: ${filename}`);
      });
    });
  });

  it('clicking View button opens modal and loads document content', async () => {
    const mockDocs = ['test.txt'];
    const mockContent = 'This is the document content.';
    vi.spyOn(api, 'getDocuments').mockResolvedValue(mockDocs);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue(mockContent);

    await renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      const items = screen.getAllByRole('listitem');
      expect(items.length).toBeGreaterThan(0);
    });

    const viewBtn = screen.getByRole('button', { name: /View document: test.txt/i });
    await userEvent.click(viewBtn);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeTruthy();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    // Check the heading in the modal (which will have test.txt)
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

    const loadingStatus = screen.getByRole('status');
    expect(loadingStatus).toHaveTextContent(/Loading document/i);
  });

  it('shows error message when document loading fails', async () => {
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
});