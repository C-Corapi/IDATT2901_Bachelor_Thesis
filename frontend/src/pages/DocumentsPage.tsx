import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, getDocumentByName } from '../api';

const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [docContent, setDocContent] = useState('');
  const [docLoading, setDocLoading] = useState(false);

  const nav = useNavigate();

  useEffect(() => {
    getDocuments()
      .then(setDocs)
      .catch(() => setDocs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleView = async (filename: string) => {
    try {
      setSelectedFile(filename);
      setShowViewModal(true);
      setDocLoading(true);
      setDocContent('');

      const text = await getDocumentByName(filename);
      setDocContent(text);
    } catch (err) {
      console.error(err);
      setDocContent('Unable to load document.');
    } finally {
      setDocLoading(false);
    }
  };

  return (
    <section aria-labelledby="docs-heading">
      <h1 id="docs-heading" className="page-title">Uploaded Documents</h1>

      {loading ? (
        <div className="empty-state" role="status" aria-label="Loading documents">Loading…</div>
      ) : docs.length === 0 ? (
        <div className="empty-state" role="status">
          No documents yet.{' '}
          <button
            className="btn-outline"
            onClick={() => nav('/upload')}
            title="Go to the upload page"
            aria-label="Navigate to upload page"
          >
            Upload one →
          </button>
        </div>
      ) : (
        <div className="doc-list" role="list" aria-label="Uploaded documents list">
          {docs.map((filename) => (
            <article
              className="doc-row"
              key={filename}
              role="listitem"
              aria-label={`Document: ${filename}`}
            >
              <div>
                <div className="doc-name">{filename}</div>
              </div>

              <button
                className="btn-outline"
                title={`View document: ${filename}`}
                aria-label={`View document: ${filename}`}
                onClick={() => handleView(filename)}
              >
                View
              </button>
            </article>
          ))}
        </div>
      )}

      {showViewModal && selectedFile && (
        <div className="modal-overlay" role="presentation" onClick={() => setShowViewModal(false)}>
          <div className="modal modal--wide" role="dialog" aria-modal="true"
               onClick={(e) => e.stopPropagation()}>
            <h2>{selectedFile}</h2>

            {docLoading ? (
                <div className="empty-state" role="status">Loading document…</div>
            ) : (
                <div className="document-viewer">
                  <pre>{docContent}</pre>
                </div>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowViewModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DocumentsPage;