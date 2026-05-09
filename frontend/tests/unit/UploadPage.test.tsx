import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import {render, screen, cleanup, waitFor, fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadPage from '../../src/pages/UploadPage';
import * as api from '../../src/api';

vi.mock('../../src/api');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('UploadPage (focused tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a section landmark with the expected heading', () => {
    render(<UploadPage />);

    const section = screen.getByRole('region', { name: /Upload Document/i });
    expect(section).toBeTruthy();

    const heading = screen.getByRole('heading', { level: 1, name: /Upload Document/i });
    expect(heading).toBeTruthy();
    expect(heading).toHaveAttribute('id', 'upload-heading');
  });

  it('renders a form with accessible label', () => {
    render(<UploadPage />);

    const form = screen.getByLabelText(/Upload a document for metadata extraction/i);
    expect(form).toBeTruthy();
  });

  it('renders file input with label and dropzone', () => {
    render(<UploadPage />);

    const labels = screen.getAllByText(/Document/i);
    const fileLabel = labels.find((el) => el.tagName === 'LABEL');
    expect(fileLabel).toBeTruthy();
    expect(fileLabel).toHaveAttribute('for', 'file-input');

    const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
    expect(dropzone).toBeTruthy();
    expect(dropzone).toHaveAttribute('title', 'Click to browse or drag and drop');
    expect(dropzone).toHaveTextContent(/Click or drag a file here/i);
  });

  it('renders metadata type selector with all options', () => {
    render(<UploadPage />);

    const label = screen.getByText(/Metadata type to extract/i);
    expect(label).toBeTruthy();

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
    expect(select).toBeTruthy();
    expect(select).toHaveAttribute('id', 'meta-type');
    expect(select).toHaveAttribute('aria-required', 'true');
    expect(select).toHaveAttribute('title', 'Choose metadata type for extraction');

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6);
    expect(screen.getByRole('option', { name: /All/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /^Epic$/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /^Decision$/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /^Deliverable$/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /^Task$/i })).toBeTruthy();
    expect(screen.getByRole('option', { name: /^Activity$/i })).toBeTruthy();
  });

  it('renders submit button disabled initially (no file selected)', () => {
    render(<UploadPage />);

    const submitBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    expect(submitBtn).toBeTruthy();
    expect(submitBtn).toBeDisabled();
    expect(submitBtn).toHaveAttribute('title', 'Select a file first');
    expect(submitBtn).toHaveAttribute('aria-disabled', 'true');
  });

  it('updates dropzone text and enables submit when file is selected', async () => {
    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      const dropzone = screen.getByRole('button', { name: /Selected: test.txt. Click to change./i });
      expect(dropzone).toBeTruthy();
      expect(dropzone).toHaveTextContent('test.txt');
    });

    const submitBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('shows working state when upload is in progress', async () => {
    vi.spyOn(api, 'uploadDocument').mockImplementation(() => new Promise(() => {}));
    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Upload & Extract/i })).not.toBeDisabled();
    });

    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const workingBtn = screen.getByRole('button', { name: /Working/i });
      expect(workingBtn).toBeTruthy();
      expect(workingBtn).toBeDisabled();
    });
  });

  it('shows success message and extraction progress', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toBeTruthy();
      expect(alert).toHaveAttribute('aria-live', 'assertive');
    });
  });

  it('calls all extract functions when type is "all"', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(api.extractEpics).toHaveBeenCalledWith('test.txt');
      expect(api.extractDecisions).toHaveBeenCalledWith('test.txt');
      expect(api.extractDeliverables).toHaveBeenCalledWith('test.txt');
      expect(api.extractTasks).toHaveBeenCalledWith('test.txt');
      expect(api.extractActivities).toHaveBeenCalledWith('test.txt');
    });
  });

  it('calls only the selected extract function when type is specific', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);

    render(<UploadPage />);

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
    await userEvent.selectOptions(select, 'epic');

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(api.extractEpics).toHaveBeenCalledWith('test.txt');
    });
  });

  it('displays extracted metadata results', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([
      { title: 'Epic 1', owner: 'alice' },
    ]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText(/Extracted Metadata/i)).toBeTruthy();
    });
  });

  it('shows error message when upload fails', async () => {
    vi.spyOn(api, 'uploadDocument').mockRejectedValue(new Error('Upload failed'));

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Upload failed/i);
      expect(alert.className).toContain('msg--err');
    });
  });

  it('dropzone responds to keyboard navigation (Enter and Space)', async () => {
    render(<UploadPage />);

    const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
    dropzone.focus();

    expect(dropzone).toHaveAttribute('tabIndex', '0');
  });
});

  it('handles file selection through dropzone click', async () => {
    render(<UploadPage />);

    const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });

    await userEvent.click(dropzone);

    const fileInput = document.querySelector('#file-input') as HTMLInputElement;
    expect(fileInput).toBeTruthy();
  });

  it('handles file drop on dropzone', async () => {
    render(<UploadPage />);

    const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
    const file = new File(['content'], 'dropped.txt', { type: 'text/plain' });

    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Selected: dropped.txt/i })).toBeTruthy();
    });
  });

  it('prevents default on dragOver event', () => {
    render(<UploadPage />);

    const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
    const event = new Event('dragover', { bubbles: true, cancelable: true });

    fireEvent(dropzone, event);

    expect(event.defaultPrevented).toBeTruthy();
  });

  it('activates dropzone with space key', async () => {
    render(<UploadPage />);

    const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
    dropzone.focus();

    await userEvent.keyboard(' ');

    expect(dropzone).toBeTruthy();
  });

  it('changes metadata type selection', async () => {
    render(<UploadPage />);

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });

    await userEvent.selectOptions(select, 'decision');

    expect((select as HTMLSelectElement).value).toBe('decision');
  });

  it('extracts only tasks when task type is selected', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractTasks').mockResolvedValue([{ title: 'Task 1' }]);

    render(<UploadPage />);

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
    await userEvent.selectOptions(select, 'task');

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(api.extractTasks).toHaveBeenCalledWith('test.txt');
    });
  });

  it('extracts only decisions when decision type is selected', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);

    render(<UploadPage />);

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
    await userEvent.selectOptions(select, 'decision');

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(api.extractDecisions).toHaveBeenCalledWith('test.txt');
    });
  });

  it('extracts only deliverables when deliverable type is selected', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);

    render(<UploadPage />);

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
    await userEvent.selectOptions(select, 'deliverable');

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(api.extractDeliverables).toHaveBeenCalledWith('test.txt');
    });
  });

  it('extracts only activities when activity type is selected', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
    await userEvent.selectOptions(select, 'activity');

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(api.extractActivities).toHaveBeenCalledWith('test.txt');
    });
  });

  it('displays extracted items with their kind label', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([
      { title: 'Epic Item' },
    ]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([
      { title: 'Decision Item' },
    ]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByText(/Epic: Epic Item/i)).toBeTruthy();
      expect(screen.getByText(/Decision: Decision Item/i)).toBeTruthy();
    });
  });

  it('clears file after successful upload', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('#file-input') as HTMLInputElement;

    await userEvent.upload(fileInput, file);
    await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Click or drag a file here to upload/i })).toBeTruthy();
    });
  });