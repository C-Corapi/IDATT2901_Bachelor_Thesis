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

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('DocumentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page heading', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue([]);
    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Uploaded Documents/i })).toBeTruthy();
    });
  });

  it('shows empty state when no documents', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue([]);
    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No documents yet/i)).toBeTruthy();
    });
  });

  it('displays documents list', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['doc1.txt', 'doc2.docx']);
    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText('doc1.txt')).toBeTruthy();
      expect(screen.getByText('doc2.docx')).toBeTruthy();
    });
  });

  it('shows View button for each document', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View document: test.txt/i })).toBeTruthy();
    });
  });

  it('shows Delete button for each document', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete document: test.txt/i })).toBeTruthy();
    });
  });

  it('opens document in modal', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue('Document content');
    const user = userEvent.setup();

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /View document: test.txt/i }));

    await waitFor(() => {
      expect(screen.getByText('Document content')).toBeTruthy();
    });
  });

  it('closes document modal', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue('Content');
    const user = userEvent.setup();

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /View document: test.txt/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Close/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Close/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  it('shows document load error', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    vi.spyOn(api, 'getDocumentByName').mockRejectedValue(new Error('Load failed'));
    const user = userEvent.setup();

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /View document: test.txt/i }));

    await waitFor(() => {
      expect(screen.getByText(/Unable to load document/i)).toBeTruthy();
    });
  });

  it('opens delete confirmation modal', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    const user = userEvent.setup();

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Delete document: test.txt/i }));

    await waitFor(() => {
      expect(screen.getByText(/Delete document/i)).toBeTruthy();
    });
  });

  it('deletes document on confirm', async () => {
    const deleteDocumentMock = vi.spyOn(api, 'deleteDocument').mockResolvedValue(undefined as any);
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    const user = userEvent.setup();

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Delete document: test.txt/i }));

    await waitFor(() => {
      const confirmBtn = screen.getByRole('button', { name: /Confirm delete "test.txt"/i });
      expect(confirmBtn).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Confirm delete "test.txt"/i }));

    await waitFor(() => {
      expect(deleteDocumentMock).toHaveBeenCalledWith('test.txt');
    });
  });

  it('cancels delete operation', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    const user = userEvent.setup();

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Delete document: test.txt/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Cancel deletion/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Cancel deletion/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
  });

  it('shows loading state initially', () => {
    vi.spyOn(api, 'getDocuments').mockImplementation(() => new Promise(() => {}));
    renderWithRouter(<DocumentsPage />);
    expect(screen.getByRole('status', { name: /Loading documents/i })).toBeTruthy();
  });

  it('handles getDocuments error gracefully', async () => {
    vi.spyOn(api, 'getDocuments').mockRejectedValue(new Error('Failed'));
    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No documents yet/i)).toBeTruthy();
    });
  });

  it('closes view modal on overlay click', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    vi.spyOn(api, 'getDocumentByName').mockResolvedValue('Content');
    const user = userEvent.setup();

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /View document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /View document: test.txt/i }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await user.click(overlay);

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes delete modal on overlay click when not deleting', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    const user = userEvent.setup();

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Delete document: test.txt/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeTruthy();
    });

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await user.click(overlay);

    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('does not close delete modal on overlay click while deleting', async () => {
    vi.spyOn(api, 'deleteDocument').mockImplementation(() => new Promise(() => {}));
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    const user = userEvent.setup();

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Delete document: test.txt/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeTruthy();
    });

    // Wait for the delete button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Confirm delete "test.txt"/i })).toBeTruthy();
    });

    const deleteBtn = screen.getByRole('button', { name: /Confirm delete "test.txt"/i });
    await user.click(deleteBtn);

    // Wait for deleting state
    await waitFor(() => {
      expect(screen.getByText(/Deleting…/i)).toBeTruthy();
    });

    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    await user.click(overlay);

    // Modal should still be open
    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });

  it('shows alert on delete failure', async () => {
    vi.spyOn(api, 'deleteDocument').mockRejectedValue(new Error('Delete failed'));
    vi.spyOn(api, 'getDocuments').mockResolvedValue(['test.txt']);
    const user = userEvent.setup();

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete document: test.txt/i })).toBeTruthy();
    });

    await user.click(screen.getByRole('button', { name: /Delete document: test.txt/i }));

    await waitFor(() => {
      expect(screen.getByRole('alertdialog')).toBeTruthy();
    });

    // Wait for the delete button to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Confirm delete "test.txt"/i })).toBeTruthy();
    });

    const deleteBtn = screen.getByRole('button', { name: /Confirm delete "test.txt"/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to delete document');
    });

    alertSpy.mockRestore();
  });

  it('navigates using useNavigate hook in empty state', async () => {
    vi.spyOn(api, 'getDocuments').mockResolvedValue([]);
    renderWithRouter(<DocumentsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No documents yet/i)).toBeTruthy();
    });

    const uploadBtn = screen.getByRole('button', { name: /Navigate to upload page/i });
    expect(uploadBtn).toBeTruthy();
  });
});