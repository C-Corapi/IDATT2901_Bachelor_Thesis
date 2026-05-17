import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadPage from '../../src/pages/UploadPage';
import * as api from '../../src/api';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../src/api');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

async function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('UploadPage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders complete page structure', () => {
    render(<UploadPage />);

    const section = screen.getByRole('region', { name: /Upload Document/i });
    expect(section).toBeTruthy();

    const heading = screen.getByRole('heading', { level: 1, name: /Upload Document/i });
    expect(heading).toBeTruthy();
    expect(heading).toHaveAttribute('id', 'upload-heading');
  });

  it('renders form with correct accessibility attributes', () => {
    render(<UploadPage />);

    const form = screen.getByRole('form', { name: /Upload a document for metadata extraction/i });
    expect(form).toBeTruthy();
  });

  it('renders file input with dropzone', () => {
    render(<UploadPage />);

    const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
    expect(dropzone).toBeTruthy();
    expect(dropzone).toHaveTextContent(/Click or drag a file here/i);

    const fileInput = document.querySelector('#file-input') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.txt,.docx');
    expect(fileInput).toHaveAttribute('hidden');
  });

  it('renders metadata type selector with all options', () => {
    render(<UploadPage />);

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
    expect(select).toBeTruthy();
    expect(select).toHaveAttribute('aria-required', 'true');

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6);
    expect(screen.getByRole('option', { name: 'All' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Epic' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Decision' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Deliverable' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Task' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Activity' })).toBeTruthy();
  });

  it('submit button is disabled when no file is selected', () => {
    render(<UploadPage />);

    const submitBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    expect(submitBtn).toBeTruthy();
    expect(submitBtn).toHaveAttribute('disabled');
    expect(submitBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('allows file selection via input', async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      const dropzone = screen.getByRole('button', { name: /Selected: test.txt/i });
      expect(dropzone).toHaveTextContent('test.txt');
    });
  });

  it('enables submit button when file is selected', async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    const file = new File(['content'], 'document.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);

    await waitFor(() => {
      const submitBtn = screen.getByRole('button', { name: /Upload & Extract/i });
      expect(submitBtn).not.toHaveAttribute('disabled');
    });
  });

  it('allows changing metadata type selection', async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
    expect(select).toHaveValue('all');

    await user.selectOptions(select, 'epic');
    expect(select).toHaveValue('epic');

    await user.selectOptions(select, 'decision');
    expect(select).toHaveValue('decision');
  });

  it('handles file upload and extraction flow for all types', async () => {
    const user = userEvent.setup();
    const mockEpics = [{ id: 1, title: 'Epic 1', description: 'Desc' }];
    const mockDecisions = [{ id: 2, title: 'Decision 1', alternatives: 'Alt' }];
    const mockDeliverables = [{ id: 3, title: 'Deliverable 1' }];
    const mockTasks = [{ id: 4, title: 'Task 1' }];
    const mockActivities = [{ id: 5, title: 'Activity 1' }];

    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'Upload successful' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue(mockEpics);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue(mockDecisions);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue(mockDeliverables);
    vi.spyOn(api, 'extractTasks').mockResolvedValue(mockTasks);
    vi.spyOn(api, 'extractActivities').mockResolvedValue(mockActivities);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(api.uploadDocument).toHaveBeenCalledWith(file);
    });

    await waitFor(() => {
      expect(api.extractEpics).toHaveBeenCalledWith('test.txt');
      expect(api.extractDecisions).toHaveBeenCalledWith('test.txt');
      expect(api.extractDeliverables).toHaveBeenCalledWith('test.txt');
      expect(api.extractTasks).toHaveBeenCalledWith('test.txt');
      expect(api.extractActivities).toHaveBeenCalledWith('test.txt');
    });
  });

  it('displays success message after upload', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'Upload successful' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const successMsg = screen.getByRole('alert');
      expect(successMsg).toHaveTextContent(/Metadata extraction completed/i);
      expect(successMsg).toHaveClass('msg--ok');
    });
  });

  it('displays extracted results', async () => {
    const user = userEvent.setup();
    const mockEpics = [{ id: 1, title: 'Test Epic', description: 'Epic description' }];

    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'Success' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue(mockEpics);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const resultsHeading = screen.getByRole('heading', { name: /Extracted Metadata/i });
      expect(resultsHeading).toBeTruthy();
      expect(screen.getByText(/Test Epic/i)).toBeTruthy();
    });
  });

  it('handles upload for single metadata type (epic only)', async () => {
    const user = userEvent.setup();
    const mockEpics = [{ id: 1, title: 'Epic Only' }];

    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'Upload successful' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue(mockEpics);

    render(<UploadPage />);

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
    await user.selectOptions(select, 'epic');

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(api.extractEpics).toHaveBeenCalledWith('test.txt');
      expect(api.extractDecisions).not.toHaveBeenCalled();
      expect(api.extractDeliverables).not.toHaveBeenCalled();
    });
  });

  it('handles upload errors gracefully', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'uploadDocument').mockRejectedValue(new Error('Network error'));

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const errorMsg = screen.getByRole('alert');
      expect(errorMsg).toHaveTextContent(/Network error/i);
      expect(errorMsg).toHaveClass('msg--err');
    });
  });

  it('disables button and shows working state during upload', async () => {
    const user = userEvent.setup();
    let resolveUpload: any;
    vi.spyOn(api, 'uploadDocument').mockReturnValue(
      new Promise((resolve) => { resolveUpload = resolve; })
    );

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const workingBtn = screen.getByRole('button', { name: /Working/i });
      expect(workingBtn).toBeTruthy();
      expect(workingBtn).toHaveAttribute('disabled');
    });

    resolveUpload({ filename: 'test.txt' });
  });

  it('shows progress messages during upload and extraction', async () => {
    const user = userEvent.setup();
    let resolveUpload: any;
    vi.spyOn(api, 'uploadDocument').mockReturnValue(
      new Promise((resolve) => {
        resolveUpload = () => resolve({ filename: 'test.txt', message: 'Upload successful' });
      })
    );
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText(/Uploading document/i)).toBeTruthy();
    });

    resolveUpload();

    await waitFor(() => {
      expect(screen.getByText(/Document uploaded. Extracting metadata/i)).toBeTruthy();
    });
  });

  it('clears file after successful upload', async () => {
    const user = userEvent.setup();
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'Upload successful'});
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await user.upload(fileInput, file);
    await user.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
      expect(dropzone).toHaveTextContent(/Click or drag a file here/i);
    });
  });

  it('handles upload error and displays error message', async () => {
    vi.spyOn(api, 'uploadDocument').mockRejectedValue(new Error('Upload failed'));

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeTruthy();
      expect(alert).toHaveTextContent(/failed/i);
    });
  });

  it('handles extraction error gracefully', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockRejectedValue(new Error('Extraction failed'));
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeTruthy();
    });
  });

  it('clears extracted items when uploading new file', async () => {
    let uploadCount = 0;
    vi.spyOn(api, 'uploadDocument').mockImplementation(() => {
      uploadCount++;
      return Promise.resolve({ filename: `test${uploadCount}.txt`, message: 'ok' });
    });

    vi.spyOn(api, 'extractEpics').mockResolvedValueOnce([{ title: 'Epic 1' }]);
    vi.spyOn(api, 'extractEpics').mockResolvedValueOnce([{ title: 'Epic 2' }]);

    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
    await userEvent.upload(fileInput, file1);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
    });

    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
    await userEvent.upload(fileInput, file2);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText('Epic 2')).toBeTruthy();
      expect(screen.queryByText('Epic 1')).toBeNull();
    });
  });

    it('disables upload button when no file is selected', async () => {
    await renderWithRouter(<UploadPage />);

    const uploadBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    expect(uploadBtn).toBeDisabled();
  });

  it('enables upload button when file is selected', async () => {
    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    const uploadBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    expect(uploadBtn).not.toBeDisabled();
  });

  it('shows uploading state during upload', async () => {
    let resolveUpload: () => void;
    const uploadPromise = new Promise<{ filename: string; message: string }>((resolve) => {
      resolveUpload = () => resolve({ filename: 'test.txt', message: 'ok' });
    });
    vi.spyOn(api, 'uploadDocument').mockReturnValue(uploadPromise);
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const uploadBtn = screen.getByRole('button', { name: /Working/i });
      expect(uploadBtn).toBeDisabled();
    });

    resolveUpload!();
  });

  it('extracts only selected metadata type', async () => {
    const extractEpicsSpy = vi.spyOn(api, 'extractEpics').mockResolvedValue([{ title: 'Epic 1' }]);
    const extractDecisionsSpy = vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    const typeSelect = screen.getByLabelText(/Metadata type to extract/i);
    await userEvent.selectOptions(typeSelect, 'epic');

    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(extractEpicsSpy).toHaveBeenCalledWith('test.txt');
      expect(extractDecisionsSpy).not.toHaveBeenCalled();
    });
  });

  it('displays all extracted metadata types', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([{ title: 'Epic 1' }]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([{ title: 'Decision 1' }]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([{ title: 'Deliverable 1' }]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([{ title: 'Task 1' }]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([{ title: 'Activity 1' }]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
      expect(screen.getByText('Decision 1')).toBeTruthy();
      expect(screen.getByText('Deliverable 1')).toBeTruthy();
      expect(screen.getByText('Task 1')).toBeTruthy();
      expect(screen.getByText('Activity 1')).toBeTruthy();
    });
  });

  it('shows completion message when extraction completes with no results', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText(/Metadata extraction completed/i)).toBeTruthy();
    });
  });

  it('shows error message when extraction fails', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockRejectedValue(new Error('Extraction failed'));
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText(/Extraction failed/i)).toBeTruthy();
    });
  });

  it('clears file selection when new file is chosen', async () => {
    await renderWithRouter(<UploadPage />);

    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' });
    await userEvent.upload(fileInput, file1);

    expect(fileInput.files?.[0]?.name).toBe('test1.txt');

    const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' });
    await userEvent.upload(fileInput, file2);

    expect(fileInput.files?.[0]?.name).toBe('test2.txt');
  });

  it('accepts only .txt and .docx files', async () => {
    await renderWithRouter(<UploadPage />);

    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    expect(fileInput).toHaveAttribute('accept', '.txt,.docx');
  });

  it('displays selected filename when file is chosen', async () => {
    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'my-document.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('my-document.txt')).toBeTruthy();
    });
  });

  it('allows changing file selection', async () => {
    await renderWithRouter(<UploadPage />);

    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    await userEvent.upload(fileInput, file1);

    await waitFor(() => {
      expect(screen.getByText('file1.txt')).toBeTruthy();
    });

    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });
    await userEvent.upload(fileInput, file2);

    await waitFor(() => {
      expect(screen.getByText('file2.txt')).toBeTruthy();
      expect(screen.queryByText('file1.txt')).toBeNull();
    });
  });

  it('shows extracting state with correct message', async () => {
    let resolveExtract: () => void;
    const extractPromise = new Promise<any[]>((resolve) => {
      resolveExtract = () => resolve([]);
    });

    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockReturnValue(extractPromise);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText(/Document uploaded. Extracting metadata/i)).toBeTruthy();
    });

    resolveExtract!();
  });

  it('extracts all metadata types when "All" is selected', async () => {
    const extractEpicsSpy = vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    const extractDecisionsSpy = vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    const extractDeliverablesSpy = vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    const extractTasksSpy = vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    const extractActivitiesSpy = vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    const typeSelect = screen.getByLabelText(/Metadata type to extract/i);
    await userEvent.selectOptions(typeSelect, 'all');

    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(extractEpicsSpy).toHaveBeenCalledWith('test.txt');
      expect(extractDecisionsSpy).toHaveBeenCalledWith('test.txt');
      expect(extractDeliverablesSpy).toHaveBeenCalledWith('test.txt');
      expect(extractTasksSpy).toHaveBeenCalledWith('test.txt');
      expect(extractActivitiesSpy).toHaveBeenCalledWith('test.txt');
    });
  });

  it('extracts only decisions when decision type selected', async () => {
    const extractEpicsSpy = vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    const extractDecisionsSpy = vi.spyOn(api, 'extractDecisions').mockResolvedValue([{ title: 'Dec 1' }]);

    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    const typeSelect = screen.getByLabelText(/Metadata type to extract/i);
    await userEvent.selectOptions(typeSelect, 'decision');

    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(extractDecisionsSpy).toHaveBeenCalledWith('test.txt');
      expect(extractEpicsSpy).not.toHaveBeenCalled();
    });
  });

  it('extracts only deliverables when deliverable type selected', async () => {
    const extractDeliverablesSpy = vi.spyOn(api, 'extractDeliverables').mockResolvedValue([{ title: 'Del 1' }]);

    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    const typeSelect = screen.getByLabelText(/Metadata type to extract/i);
    await userEvent.selectOptions(typeSelect, 'deliverable');

    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(extractDeliverablesSpy).toHaveBeenCalledWith('test.txt');
    });
  });

  it('extracts only tasks when task type selected', async () => {
    const extractTasksSpy = vi.spyOn(api, 'extractTasks').mockResolvedValue([{ title: 'Task 1' }]);

    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    const typeSelect = screen.getByLabelText(/Metadata type to extract/i);
    await userEvent.selectOptions(typeSelect, 'task');

    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(extractTasksSpy).toHaveBeenCalledWith('test.txt');
    });
  });

  it('extracts only activities when activity type selected', async () => {
    const extractActivitiesSpy = vi.spyOn(api, 'extractActivities').mockResolvedValue([{ title: 'Act 1' }]);

    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    const typeSelect = screen.getByLabelText(/Metadata type to extract/i);
    await userEvent.selectOptions(typeSelect, 'activity');

    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(extractActivitiesSpy).toHaveBeenCalledWith('test.txt');
    });
  });

  it('resets form after successful extraction', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([{ title: 'Epic 1' }]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    await renderWithRouter(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText('Epic 1')).toBeTruthy();
      expect(screen.getByText(/Metadata extraction completed/i)).toBeTruthy();
    });
  });
});