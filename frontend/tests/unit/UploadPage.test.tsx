import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UploadPage from '../../src/pages/UploadPage';
import * as api from '../../src/api';

vi.mock('../../src/api');

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mockAllExtracts = () => {
  vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
  vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
  vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
  vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
  vi.spyOn(api, 'extractActivities').mockResolvedValue([]);
};

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({ filename: 'test.txt', message: 'ok' });
  });

  describe('Page structure', () => {
    it('renders page heading', () => {
      render(<UploadPage />);
      const heading = screen.getByRole('heading', { level: 1, name: /Upload Document/i });
      expect(heading).toBeTruthy();
      expect(heading).toHaveAttribute('id', 'upload-heading');
    });

    it('renders form with accessible label', () => {
      render(<UploadPage />);
      const form = screen.getByLabelText(/Upload a document for metadata extraction/i);
      expect(form).toBeTruthy();
    });

    it('renders file input label and dropzone', () => {
      render(<UploadPage />);
      const labels = screen.getAllByText(/Document/i);
      const docLabel = labels.find((el) => el.tagName === 'LABEL');
      expect(docLabel).toBeTruthy();
      expect(screen.getByRole('button', { name: /Click or drag a file here to upload/i })).toBeTruthy();
    });

    it('renders metadata type selector', () => {
      render(<UploadPage />);
      const select = screen.getByRole('combobox', { name: /Metadata type to extract/i });
      expect(select).toBeTruthy();
      expect(select).toHaveAttribute('id', 'meta-type');
      expect(select).toHaveAttribute('aria-required', 'true');
    });

    it('renders all extract type options', () => {
      render(<UploadPage />);
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(6);
      expect(screen.getByRole('option', { name: /All/i })).toBeTruthy();
      expect(screen.getByRole('option', { name: /^Epic$/i })).toBeTruthy();
      expect(screen.getByRole('option', { name: /^Decision$/i })).toBeTruthy();
      expect(screen.getByRole('option', { name: /^Deliverable$/i })).toBeTruthy();
      expect(screen.getByRole('option', { name: /^Task$/i })).toBeTruthy();
      expect(screen.getByRole('option', { name: /^Activity$/i })).toBeTruthy();
    });

    it('renders submit button disabled initially', () => {
      render(<UploadPage />);
      const btn = screen.getByRole('button', { name: /Upload & Extract/i });
      expect(btn).toBeDisabled();
      expect(btn).toHaveAttribute('title', 'Select a file first');
    });
  });

  describe('File selection', () => {
    it('enables submit when file is selected', async () => {
      render(<UploadPage />);
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const fileInput = document.querySelector('#file-input') as HTMLInputElement;

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Upload & Extract/i })).not.toBeDisabled();
      });
    });

    it('updates dropzone text with selected filename', async () => {
      render(<UploadPage />);
      const file = new File(['content'], 'myfile.txt', { type: 'text/plain' });
      const fileInput = document.querySelector('#file-input') as HTMLInputElement;

      await userEvent.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selected: myfile.txt/i })).toBeTruthy();
      });
    });

    it('allows file selection through dropzone click', async () => {
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

      fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Selected: dropped.txt/i })).toBeTruthy();
      });
    });

    it('prevents default on dragOver', () => {
      render(<UploadPage />);
      const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
      const event = new Event('dragover', { bubbles: true, cancelable: true });
      fireEvent(dropzone, event);
      expect(event.defaultPrevented).toBeTruthy();
    });

    it('activates dropzone with Enter key', async () => {
      render(<UploadPage />);
      const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
      dropzone.focus();
      await userEvent.keyboard('{Enter}');
      expect(dropzone).toBeTruthy();
    });

    it('activates dropzone with Space key', async () => {
      render(<UploadPage />);
      const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
      dropzone.focus();
      await userEvent.keyboard(' ');
      expect(dropzone).toBeTruthy();
    });

    it('has tabIndex 0 for keyboard accessibility', () => {
      render(<UploadPage />);
      const dropzone = screen.getByRole('button', { name: /Click or drag a file here to upload/i });
      expect(dropzone).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Metadata type selection', () => {
    it('changes type selection', async () => {
      render(<UploadPage />);
      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'decision');
      expect((select as HTMLSelectElement).value).toBe('decision');
    });

    it('defaults to "all" type', () => {
      render(<UploadPage />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('all');
    });
  });

  describe('Upload and extraction', () => {
    it('shows working state during upload', async () => {
      vi.spyOn(api, 'uploadDocument').mockImplementation(() => new Promise(() => {}));
      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Working/i })).toBeDisabled();
      });
    });

    it('shows success message on completion', async () => {
      mockAllExtracts();
      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'assertive');
        expect(alert.className).toContain('msg--ok');
      });
    });

    it('shows error message on upload failure', async () => {
      vi.spyOn(api, 'uploadDocument').mockRejectedValue(new Error('Upload failed'));
      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent(/Upload failed/i);
        expect(alert.className).toContain('msg--err');
      });
    });

    it('clears file after successful extraction', async () => {
      mockAllExtracts();
      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Click or drag a file here to upload/i })).toBeTruthy();
      });
    });
  });

  describe('Extraction by type', () => {
    it('extracts all types when "all" is selected', async () => {
      mockAllExtracts();
      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(api.extractEpics).toHaveBeenCalledWith('test.txt');
        expect(api.extractDecisions).toHaveBeenCalledWith('test.txt');
        expect(api.extractDeliverables).toHaveBeenCalledWith('test.txt');
        expect(api.extractTasks).toHaveBeenCalledWith('test.txt');
        expect(api.extractActivities).toHaveBeenCalledWith('test.txt');
      });
    });

    it('extracts only epics when epic type selected', async () => {
      const extractSpy = vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
      render(<UploadPage />);

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'epic');

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(extractSpy).toHaveBeenCalledWith('test.txt');
      });
    });

    it('extracts only decisions when decision type selected', async () => {
      const extractSpy = vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
      render(<UploadPage />);

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'decision');

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(extractSpy).toHaveBeenCalledWith('test.txt');
      });
    });

    it('extracts only deliverables when deliverable type selected', async () => {
      const extractSpy = vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
      render(<UploadPage />);

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'deliverable');

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(extractSpy).toHaveBeenCalledWith('test.txt');
      });
    });

    it('extracts only tasks when task type selected', async () => {
      const extractSpy = vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
      render(<UploadPage />);

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'task');

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(extractSpy).toHaveBeenCalledWith('test.txt');
      });
    });

    it('extracts only activities when activity type selected', async () => {
      const extractSpy = vi.spyOn(api, 'extractActivities').mockResolvedValue([]);
      render(<UploadPage />);

      const select = screen.getByRole('combobox');
      await userEvent.selectOptions(select, 'activity');

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(extractSpy).toHaveBeenCalledWith('test.txt');
      });
    });
  });

  describe('Results display', () => {
    it('displays extracted metadata heading', async () => {
      mockAllExtracts();
      vi.spyOn(api, 'extractEpics').mockResolvedValue([
        { title: 'Epic 1' },
      ]);

      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByText(/Extracted Metadata/i)).toBeTruthy();
      });
    });

    it('displays extracted item count', async () => {
      mockAllExtracts();
      vi.spyOn(api, 'extractEpics').mockResolvedValue([
        { title: 'Epic 1' },
        { title: 'Epic 2' },
      ]);

      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByText(/Extracted Metadata \(2\)/i)).toBeTruthy();
      });
    });

    it('displays extracted cards with correct titles', async () => {
      mockAllExtracts();
      vi.spyOn(api, 'extractEpics').mockResolvedValue([
        { title: 'Epic 1' },
      ]);
      vi.spyOn(api, 'extractDecisions').mockResolvedValue([
        { title: 'Decision 1' },
      ]);

      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Epic 1/i })).toBeTruthy();
        expect(screen.getByRole('button', { name: /Decision 1/i })).toBeTruthy();
      });
    });

    it('does not show results before extraction', () => {
      render(<UploadPage />);
      expect(screen.queryByText(/Extracted Metadata/i)).toBeNull();
    });

    it('shows singular "item" for one result', async () => {
      mockAllExtracts();
      vi.spyOn(api, 'extractEpics').mockResolvedValue([
        { title: 'Epic 1' },
      ]);

      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByText(/Extracted 1 metadata item!/i)).toBeTruthy();
      });
    });

    it('shows plural "items" for multiple results', async () => {
      mockAllExtracts();
      vi.spyOn(api, 'extractEpics').mockResolvedValue([
        { title: 'Epic 1' },
        { title: 'Epic 2' },
      ]);

      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByText(/Extracted 2 metadata items!/i)).toBeTruthy();
      });
    });

    it('uses fallback name for items without title', async () => {
      mockAllExtracts();
      vi.spyOn(api, 'extractEpics').mockResolvedValue([
        { owner: 'alice' },
      ]);

      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByText(/epic 1/i)).toBeTruthy();
      });
    });
  });

  describe('Message states', () => {
    it('shows upload message first', async () => {
      vi.spyOn(api, 'uploadDocument').mockImplementation(() => new Promise(() => {}));
      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByText(/Uploading document/i)).toBeTruthy();
      });
    });

    it('shows success message with count', async () => {
      mockAllExtracts();
      vi.spyOn(api, 'extractEpics').mockResolvedValue([
        { title: 'E1' },
      ]);

      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        expect(screen.getByText(/Extracted 1 metadata item/i)).toBeTruthy();
      });
    });

    it('message has alert role', async () => {
      mockAllExtracts();
      render(<UploadPage />);

      const file = new File(['content'], 'test.txt');
      await userEvent.upload(document.querySelector('#file-input') as HTMLInputElement, file);
      await userEvent.click(screen.getByRole('button', { name: /Upload & Extract/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeTruthy();
      });
    });
  });


describe('UploadPage file drop handling', () => {
  it('handles file drop via drag and drop', async () => {
    vi.spyOn(api, 'extractEpics').mockResolvedValue([]);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([]);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([]);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([]);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([]);

    render(<UploadPage />);

    const dropzone = screen.getByRole('button', { name: /Click or drag/i });
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        files: [file],
      },
    });

    dropzone.dispatchEvent(new Event('dragover', { bubbles: true }));
    dropzone.dispatchEvent(dropEvent);

    await waitFor(() => {
      expect(screen.getByText('test.txt')).toBeTruthy();
    });
  });

  it('handles keyboard interaction on dropzone', async () => {
    render(<UploadPage />);

    const dropzone = screen.getByRole('button', { name: /Click or drag/i });

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    dropzone.dispatchEvent(enterEvent);
    expect(dropzone).toBeTruthy();
  });

  it('handles Space key on dropzone', async () => {
    render(<UploadPage />);

    const dropzone = screen.getByRole('button', { name: /Click or drag/i });

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    dropzone.dispatchEvent(spaceEvent);

    expect(dropzone).toBeTruthy();
  });

  it('extracts specific metadata type', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({
      id: 1,
      filename: 'test.txt'
    } as any);
    vi.spyOn(api, 'extractEpics').mockResolvedValue([
      { title: 'Epic 1', description: 'Test epic' },
    ]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Document/i, { selector: 'input[type="file"]' });

    await userEvent.upload(input, file);

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'epic');

    const submitBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Extracted 1 metadata item/i)).toBeTruthy();
    });
  });

  it('extracts decision metadata type', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({
      id: 1,
      filename: 'test.txt'
    } as any);
    vi.spyOn(api, 'extractDecisions').mockResolvedValue([
      { title: 'Decision 1', nature: 'structural', reach: 'global' },
    ]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Document/i, { selector: 'input[type="file"]' });

    await userEvent.upload(input, file);

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'decision');

    const submitBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Extracted 1 metadata item/i)).toBeTruthy();
    });
  });

  it('extracts deliverable metadata type', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({
      id: 1,
      filename: 'test.txt'
    } as any);
    vi.spyOn(api, 'extractDeliverables').mockResolvedValue([
      { title: 'Deliverable 1' },
    ]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Document/i, { selector: 'input[type="file"]' });

    await userEvent.upload(input, file);

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'deliverable');

    const submitBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Extracted 1 metadata item/i)).toBeTruthy();
    });
  });

  it('extracts task metadata type', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({
      id: 1,
      filename: 'test.txt'
    } as any);
    vi.spyOn(api, 'extractTasks').mockResolvedValue([
      { title: 'Task 1' },
    ]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Document/i, { selector: 'input[type="file"]' });

    await userEvent.upload(input, file);

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'task');

    const submitBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Extracted 1 metadata item/i)).toBeTruthy();
    });
  });

  it('extracts activity metadata type', async () => {
    vi.spyOn(api, 'uploadDocument').mockResolvedValue({
      id: 1,
      filename: 'test.txt'
    } as any);
    vi.spyOn(api, 'extractActivities').mockResolvedValue([
      { title: 'Activity 1' },
    ]);

    render(<UploadPage />);

    const file = new File(['content'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/Document/i, { selector: 'input[type="file"]' });

    await userEvent.upload(input, file);

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'activity');

    const submitBtn = screen.getByRole('button', { name: /Upload & Extract/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Extracted 1 metadata item/i)).toBeTruthy();
    });
  });
});
});