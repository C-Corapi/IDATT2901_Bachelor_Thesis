import React, { useCallback, useEffect, useRef, useState } from 'react';
import ConfidenceBar from './ConfidenceBar';

export interface DetailField { label: string; value: string; key?: string; }

interface Props {
  title: string;
  owner?: string;
  status?: string;
  nature?: string;
  reach?: string;
  description?: string;
  alternatives?: string;
  evidence?: string;
  confidence?: number;
  verified?: boolean;
  onVerify?: () => void;
  extraDetails?: DetailField[];
  onSave?: (changes: Record<string, string>) => void;
  onDelete?: () => void;
  defaultOpen?: boolean;
}

const KNOWN = ['backlog', 'todo', 'open','pending','closed', 'done', 'in progress','urgent','important','local','global'];
const badgeCls = (v: string) => {
  const k = v.toLowerCase().replace(/\s+/g, '-');
  return `badge badge--${KNOWN.includes(k) ? k : 'default'}`;
};

const MetadataCard: React.FC<Props> = ({
  title, owner, status, nature, reach, description, alternatives, evidence,
  confidence, verified, onVerify, extraDetails, onSave, onDelete, defaultOpen,
}) => {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const [editing, setEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [dTitle, setDTitle] = useState<string>(title ?? '');
  const [dOwner, setDOwner] = useState<string>(owner ?? '');
  const [dDesc, setDDesc] = useState<string>(description ?? '');
  const [dAlts, setDAlts] = useState<string>(alternatives ?? '');
  const [dExtras, setDExtras] = useState<DetailField[]>(extraDetails ?? []);

  useEffect(() => { setDTitle(title ?? ''); }, [title]);
  useEffect(() => { setDOwner(owner ?? ''); }, [owner]);
  useEffect(() => { setDDesc(description ?? ''); }, [description]);
  useEffect(() => { setDAlts(alternatives ?? ''); }, [alternatives]);
  useEffect(() => { setDExtras(extraDetails ?? []); }, [extraDetails]);

  const badges = [status, nature, reach].filter(Boolean) as string[];
  const uid = useRef(`card-${Math.random().toString(36).slice(2, 8)}`).current;
  const detailId = `${uid}-detail`;

  const toggle = () => { if (!editing) setOpen(!open); };
  const onKey = (e: React.KeyboardEvent) => {
    if (editing) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); }
  };

  const startEdit = (e: React.MouseEvent) => { e.stopPropagation(); setEditing(true); setOpen(true); };
  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); setEditing(false);
    setDTitle(title); setDOwner(owner ?? ''); setDDesc(description ?? '');
    setDAlts(alternatives ?? ''); setDExtras(extraDetails ?? []);
  };
  const save = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSave) return;
    const c: Record<string, string> = {};
    if (dTitle !== title) { c['title'] = dTitle; c['name'] = dTitle; }
    if (dOwner !== (owner ?? '')) c['owner'] = dOwner;
    if (dDesc !== (description ?? '')) c['description'] = dDesc;
    if (dAlts !== (alternatives ?? '')) c['alternatives'] = dAlts;
    dExtras.forEach((d) => {
      const orig = extraDetails?.find((x) => x.label === d.label);
      if (orig && d.value !== orig.value && d.key) c[d.key] = d.value;
    });
    onSave(c);
    setEditing(false);
  };

  /* ── Modal focus trap ─────────────────────────────────────────── */
  const modalRef = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (showModal) {
      prevFocus.current = document.activeElement as HTMLElement;
      modalRef.current?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus();
    } else {
      prevFocus.current?.focus();
    }
  }, [showModal]);

  const modalKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setShowModal(false); return; }
    if (e.key !== 'Tab') return;
    const btns = modalRef.current?.querySelectorAll<HTMLElement>('button');
    if (!btns || btns.length === 0) return;
    const first = btns[0], last = btns[btns.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }, []);

  return (
    <>
      <article className={`card${open ? ' card--open' : ''}`} onClick={toggle} onKeyDown={onKey}
        tabIndex={0} role="button" aria-expanded={open} aria-controls={detailId}
        aria-label={`${title}${verified ? ' (verified)' : ''}. ${badges.join(', ')}. ${open ? 'Collapse' : 'Expand'} details.`}
        title={`${open ? 'Collapse' : 'Expand'} "${title}"`}>

        <div className="card-header">
          <span className="card-title">
            {editing
              ? <input className="detail-input" value={dTitle} onChange={(e) => setDTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()} aria-label="Edit title" style={{ marginBottom: 0 }} />
              : <>{title}{verified && <span className="card-verified" aria-label="Verified">✓ verified</span>}</>
            }
          </span>
          <span className={`card-chevron${open ? ' card-chevron--open' : ''}`} aria-hidden="true">›</span>
        </div>

        {badges.length > 0 && (
          <div className="card-badges" aria-label={`Tags: ${badges.join(', ')}`}>
            {badges.map((b) => <span key={b} className={badgeCls(b)}>{b}</span>)}
          </div>
        )}

        <div className="card-meta">
          {(owner || editing) && (
            <span>
              <span className="sr-only">Owner: </span>owner:{' '}
              {editing
                ? <input className="detail-input" value={dOwner} onChange={(e) => setDOwner(e.target.value)}
                    onClick={(e) => e.stopPropagation()} aria-label="Edit owner"
                    style={{ width: 140, display: 'inline-block', marginBottom: 0, padding: '2px 6px' }} />
                : <span className="card-owner">{owner}</span>}
            </span>
          )}
          {confidence !== undefined && <ConfidenceBar value={confidence} />}
        </div>

        {open && (
          <div className="card-detail" id={detailId} role="region" aria-label={`Details for ${title}`}
            onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>

            {(description || editing) && (
              <div>
                <div className="detail-label" id={`${uid}-desc`}>Description</div>
                {editing
                  ? <textarea className="detail-textarea" value={dDesc} onChange={(e) => setDDesc(e.target.value)}
                      aria-labelledby={`${uid}-desc`} />
                  : <div className="detail-value" aria-labelledby={`${uid}-desc`}>{description}</div>}
              </div>
            )}
            {evidence && !editing && (
              <div>
                <div className="detail-label" id={`${uid}-src`}>Source</div>
                <blockquote className="detail-quote" aria-labelledby={`${uid}-src`}>"{evidence}"</blockquote>
              </div>
            )}
            {(alternatives || editing) && (
              <div>
                <div className="detail-label" id={`${uid}-alt`}>Alternatives</div>
                {editing
                  ? <textarea className="detail-textarea" value={dAlts} onChange={(e) => setDAlts(e.target.value)}
                      aria-labelledby={`${uid}-alt`} />
                  : <div className="detail-value" aria-labelledby={`${uid}-alt`}>{alternatives}</div>}
              </div>
            )}
            {dExtras.map((d, i) => (
              <div key={d.label}>
                <div className="detail-label" id={`${uid}-x${i}`}>{d.label}</div>
                {editing
                  ? <input className="detail-input" value={d.value}
                      onChange={(e) => { const c = [...dExtras]; c[i] = { ...c[i], value: e.target.value }; setDExtras(c); }}
                      aria-labelledby={`${uid}-x${i}`} />
                  : <div className="detail-value" aria-labelledby={`${uid}-x${i}`}>{d.value}</div>}
              </div>
            ))}

            <div className="card-actions">
              {!editing && !verified && onVerify && (
                <button className="btn-verify" onClick={(e) => { e.stopPropagation(); onVerify(); }}
                  title={`Verify "${title}"`} aria-label={`Verify "${title}"`}>✓ Verify</button>
              )}
              {!editing && onSave && (
                <button className="btn-edit" onClick={startEdit} title={`Edit "${title}"`} aria-label={`Edit "${title}"`}>✏ Edit</button>
              )}
              {editing && (
                <>
                  <button className="btn-save" onClick={save} title="Save changes" aria-label="Save changes">💾 Save</button>
                  <button className="btn-cancel" onClick={cancelEdit} title="Cancel editing" aria-label="Cancel editing">Cancel</button>
                </>
              )}
              {onDelete && (
                <button className="btn-delete" onClick={(e) => { e.stopPropagation(); setShowModal(true); }}
                  title={`Delete "${title}"`} aria-label={`Delete "${title}"`}>Delete</button>
              )}
            </div>
          </div>
        )}
      </article>

      {showModal && (
        <div className="modal-overlay" role="presentation" onClick={() => setShowModal(false)}>
          <div className="modal" ref={modalRef} role="alertdialog" aria-modal="true"
            aria-labelledby={`${uid}-mtitle`} aria-describedby={`${uid}-mdesc`}
            onClick={(e) => e.stopPropagation()} onKeyDown={modalKey}>
            <h2 id={`${uid}-mtitle`}>Delete item?</h2>
            <p id={`${uid}-mdesc`}>
              Are you sure you want to delete <span className="modal-item-name">"{title}"</span>?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" data-cancel onClick={() => setShowModal(false)}
                aria-label="Cancel deletion">Cancel</button>
              <button className="btn-delete" onClick={() => { setShowModal(false); onDelete?.(); }}
                aria-label={`Confirm delete "${title}"`}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MetadataCard;