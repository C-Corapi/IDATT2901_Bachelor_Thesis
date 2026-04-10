import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments } from '../api';
import type { DocEntry } from '../types';

const DocumentsPage: React.FC = () => {
  const [docs, setDocs]       = useState<DocEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const nav                   = useNavigate();

  useEffect(() => {
    // #TODO: getDocuments calls GET /documents/ — create this endpoint
    getDocuments()
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section aria-labelledby="docs-heading">
      <h1 id="docs-heading" className="page-title">Uploaded Documents</h1>
      {loading ? (
        <div className="empty-state" role="status" aria-label="Loading documents">Loading…</div>
      ) : docs.length === 0 ? (
        <div className="empty-state" role="status">
          No documents yet.{' '}
          <button className="btn-outline" onClick={() => nav('/upload')}
            title="Go to the upload page" aria-label="Navigate to upload page">Upload one →</button>
        </div>
      ) : (
        <div className="doc-list" role="list" aria-label="Uploaded documents list">
          {docs.map((d, i) => (
            <article className="doc-row" key={i} role="listitem"
              aria-label={`Document: ${d.name}, uploaded ${new Date(d.uploaded_at).toLocaleDateString()}`}>
              <div>
                <div className="doc-name">📄 {d.name}</div>
                <div className="doc-date">
                  Uploaded: <time dateTime={d.uploaded_at}>{new Date(d.uploaded_at).toLocaleDateString()}</time>
                </div>
              </div>
              {/* #TODO: add view/download when endpoint is ready */}
              <button className="btn-outline" title={`View document: ${d.name}`}
                aria-label={`View document: ${d.name}`}>View</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default DocumentsPage;