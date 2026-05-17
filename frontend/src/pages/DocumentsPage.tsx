import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDocuments, getDocumentByName, deleteDocument } from '../api';

const DocumentsPage: React.FC = () => {
  const [docs, setDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [docContent, setDocContent] = useState('');
  const [docLoading, setDocLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteClick = (filename: string) => {
    setDeleteTarget(filename);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteDocument(deleteTarget);
      setDocs((prev) => prev.filter((f) => f !== deleteTarget));
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      setMsg({ text: 'Failed to delete document', ok: false });
    } finally {
      setDeleting(false);
    }
  };
  return (
    <section aria-labelledby="docs-heading">
      <h1 id="docs-heading" className="page-title">Uploaded Documents</h1>
      {msg && <div className={msg.ok ? 'msg msg--ok' : 'msg msg--err'}>{msg.text}</div>}
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
          <ul className="doc-list" role="list" aria-label="Uploaded documents list">
            {docs.map((filename) => (
                <li
                    className="doc-row"
                    key={filename}
                    role="listitem"
                    aria-label={`Document: ${filename}`}
                >
                  <div className="doc-name">{filename}</div>

                  <div className="doc-actions">
                    <button
                        className="btn-outline"
                        onClick={() => handleView(filename)}
                        title={`View document: ${filename}`}
                        aria-label={`View document: ${filename}`}
                    >
                      View
                    </button>
                    <button
                        className="btn-outline btn-outline--delete"
                        onClick={() => handleDeleteClick(filename)}
                        title={`Delete document: ${filename}`}
                        aria-label={`Delete document: ${filename}`}
                    >
                      Delete
                    </button>
                  </div>
                </li>
            ))}
          </ul>
      )}

      {showViewModal && selectedFile && (
          <div className="modal-overlay" role="presentation" onClick={() => setShowViewModal(false)}>
            <div className="modal modal--wide" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
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

      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay" role="presentation" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Delete document?</h2>
            <p>
              Are you sure you want to delete <span className="modal-item-name">"{deleteTarget}"</span>?
              This will remove the document file (metadata will be preserved).
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                className="btn-delete"
                onClick={confirmDelete}
                disabled={deleting}
                aria-label={`Confirm delete "${deleteTarget}"`}
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DocumentsPage;