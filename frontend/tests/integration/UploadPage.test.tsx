import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadPage from '../../src/pages/UploadPage';
import * as api from '../../src/api';

vi.mock('../../src/api');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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
});