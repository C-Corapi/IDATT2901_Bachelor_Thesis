import React, { useRef, useState } from 'react';
import {
  uploadDocument,
  extractEpics,
  extractDecisions,
  extractDeliverables,
  extractTasks,
  extractActivities,
} from '../api';
import MetadataCard from '../components/MetadataCard';
import type { MetadataType } from '../types';

type ExtractType = MetadataType | 'all';

const OPTIONS: { value: ExtractType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'epic', label: 'Epic' },
  { value: 'decision', label: 'Decision' },
  { value: 'deliverable', label: 'Deliverable' },
  { value: 'task', label: 'Task' },
  { value: 'activity', label: 'Activity' },
];

const UploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<ExtractType>('all');
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setBusy(true);
    setMsg({ text: 'Uploading document…', ok: true });
    setResults([]);

    try {
      const uploaded = await uploadDocument(file);
      setMsg({ text: 'Document uploaded. Extracting metadata…', ok: true });

      let extracted: any[] = [];

      if (type === 'all') {
        const [epics, decisions, deliverables, tasks, activities] = await Promise.all([
          extractEpics(uploaded.filename),
          extractDecisions(uploaded.filename),
          extractDeliverables(uploaded.filename),
          extractTasks(uploaded.filename),
          extractActivities(uploaded.filename),
        ]);

        extracted = [
          ...epics.map((item) => ({ kind: 'Epic', ...item })),
          ...decisions.map((item) => ({ kind: 'Decision', ...item })),
          ...deliverables.map((item) => ({ kind: 'Deliverable', ...item })),
          ...tasks.map((item) => ({ kind: 'Task', ...item })),
          ...activities.map((item) => ({ kind: 'Activity', ...item })),
        ];
      } else {
        switch (type) {
          case 'epic':
            extracted = (await extractEpics(uploaded.filename)).map(item => ({ kind: 'Epic', ...item }));
            break;
          case 'decision':
            extracted = (await extractDecisions(uploaded.filename)).map(item => ({ kind: 'Decision', ...item }));
            break;
          case 'deliverable':
            extracted = (await extractDeliverables(uploaded.filename)).map(item => ({ kind: 'Deliverable', ...item }));
            break;
          case 'task':
            extracted = (await extractTasks(uploaded.filename)).map(item => ({ kind: 'Task', ...item }));
            break;
          case 'activity':
            extracted = (await extractActivities(uploaded.filename)).map(item => ({ kind: 'Activity', ...item }));
            break;
        }
      }

      setResults(extracted);
      setMsg({ text: 'Metadata extraction completed!', ok: true });
      setFile(null);
    } catch (err: any) {
      setMsg({ text: err.message ?? 'Upload failed', ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="upload-heading">
      <h1 id="upload-heading" className="page-title">Upload Document</h1>

      <form className="upload-form" onSubmit={submit} aria-label="Upload a document for metadata extraction">
        <div className="form-group">
          <label className="form-label" htmlFor="file-input">Document</label>
          <div
            className={`dropzone${file ? ' dropzone--active' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
            }}
            role="button"
            tabIndex={0}
            aria-label={file ? `Selected: ${file.name}. Click to change.` : 'Click or drag a file here to upload'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            title="Click to browse or drag and drop"
          >
            {file ? file.name : 'Click or drag a file here'}
            <input
              ref={inputRef}
              id="file-input"
              type="file"
              hidden
              accept=".txt,.docx"
              aria-describedby="file-help"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
            />
          </div>
          <span id="file-help" className="sr-only">Accepted formats: .txt, .docx</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="meta-type">Metadata type to extract</label>
          <select
            id="meta-type"
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value as ExtractType)}
            aria-required="true"
            title="Choose metadata type for extraction"
          >
            {OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button
          className="btn-primary"
          type="submit"
          disabled={!file || busy}
          title={!file ? 'Select a file first' : busy ? 'Uploading…' : 'Upload and start extraction'}
          aria-disabled={!file || busy}
        >
          {busy ? 'Working…' : 'Upload & Extract'}
        </button>

        {msg && (
          <div className={`msg ${msg.ok ? 'msg--ok' : 'msg--err'}`} role="alert" aria-live="assertive">
            {msg.text}
          </div>
        )}
      </form>

      {results.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h2 className="page-title" style={{ fontSize: '1.1rem' }}>Extracted Metadata</h2>
          <div>
            {results.map((item, i) => (
              <MetadataCard
                key={i}
                title={item.title ?? item.name ?? `Item ${i + 1}`}
                owner={item.owner}
                status={item.status}
                nature={item.nature}
                reach={item.reach}
                description={item.description}
                alternatives={item.alternatives}
                evidence={item.source}
                confidence={item.confidence ? Math.round(item.confidence * 100) : undefined}
                verified={false}
                displayType={item.kind}
                defaultOpen={false}
                extraDetails={[
                  ...(item.deadline ? [{ label: 'Deadline', value: item.deadline, key: 'deadline' }] : []),
                  ...(item.target_date ? [{ label: 'Target Date', value: item.target_date, key: 'target_date' }] : []),
                  ...(item.classification ? [{ label: 'Classification', value: item.classification, key: 'classification' }] : []),
                  ...(item.scope ? [{ label: 'Scope', value: item.scope, key: 'scope' }] : []),
                  ...(item.use_case ? [{ label: 'Use Case', value: item.use_case, key: 'use_case' }] : []),
                  ...(item.user_story ? [{ label: 'User Story', value: item.user_story, key: 'user_story' }] : []),
                ]}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default UploadPage;