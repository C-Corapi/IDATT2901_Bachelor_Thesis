import React, { useRef, useState } from 'react';
import { uploadDocument } from '../api';
import type { MetadataType } from '../types';

const OPTIONS: { value: MetadataType; label: string }[] = [
  { value: 'epic',        label: 'Epic' },
  { value: 'decision',    label: 'Decision' },
  { value: 'deliverable', label: 'Deliverable' },
  { value: 'task',        label: 'Task' },
  { value: 'activity',    label: 'Activity' },
];

const UploadPage: React.FC = () => {
  const [file, setFile]   = useState<File | null>(null);
  const [type, setType]   = useState<MetadataType>('epic');
  const [msg, setMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [busy, setBusy]   = useState(false);
  const inputRef          = useRef<HTMLInputElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setMsg(null);
    try {
      // #TODO: uploadDocument calls POST /documents/upload — create this endpoint
      await uploadDocument(file, type);
      setMsg({ text: 'Document uploaded & extraction started!', ok: true });
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
            onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]); }}
            role="button" tabIndex={0}
            aria-label={file ? `Selected: ${file.name}. Click to change.` : 'Click or drag a file here to upload'}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
            title="Click to browse or drag and drop"
          >
            {file ? `${file.name}` : 'Click or drag a file here'}
            <input ref={inputRef} id="file-input" type="file" hidden accept=".txt,.pdf,.doc,.docx"
              aria-describedby="file-help" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} />
          </div>
          <span id="file-help" className="sr-only">Accepted formats: .txt, .pdf, .doc, .docx</span>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="meta-type">Metadata type to extract</label>
          <select id="meta-type" className="form-select" value={type}
            onChange={(e) => setType(e.target.value as MetadataType)}
            aria-required="true" title="Choose metadata type for LLM extraction">
            {OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <button className="btn-primary" type="submit" disabled={!file || busy}
          title={!file ? 'Select a file first' : busy ? 'Uploading…' : 'Upload and start extraction'}
          aria-disabled={!file || busy}>
          {busy ? 'Uploading…' : 'Upload & Extract'}
        </button>

        {msg && (
          <div className={`msg ${msg.ok ? 'msg--ok' : 'msg--err'}`} role="alert" aria-live="assertive">
            {msg.text}
          </div>
        )}
      </form>
    </section>
  );
};

export default UploadPage;