import React, { useEffect, useRef, useState } from 'react';
import type { KanbanItemFull } from '../types';
import MetadataCard from './MetadataCard';

interface Props {
  title: string;
  items: KanbanItemFull[];
  onTitleChange?: (newTitle: string) => void;
  onSaveItem?: (item: KanbanItemFull, changes: Record<string, string>) => void;
  onDeleteItem?: (item: KanbanItemFull) => void;
}

const KanbanColumn: React.FC<Props> = ({ title, items, onTitleChange, onSaveItem, onDeleteItem }) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [draft, setDraft] = useState(title);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(title); }, [title]);
  useEffect(() => { if (editingTitle) inputRef.current?.focus(); }, [editingTitle]);

  const commitTitle = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) onTitleChange?.(trimmed);
    else setDraft(title);
    setEditingTitle(false);
  };

  const toggleExpand = (key: string) => {
    setExpandedId((prev) => (prev === key ? null : key));
  };

  return (
    <section className="kanban-col" aria-label={`${title} column — ${items.length} items`}>
      <header className="kanban-col-head">
        {editingTitle ? (
          <input
            ref={inputRef}
            className="kanban-col-title-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') { setDraft(title); setEditingTitle(false); }
            }}
            aria-label="Edit column name"
            title="Press Enter to save, Escape to cancel"
          />
        ) : (
          <h3 className="kanban-col-title">{title}</h3>
        )}
        <span className="kanban-col-count" aria-label={`${items.length} items`}
          title={`${items.length} items in ${title}`}>{items.length}</span>
        {onTitleChange && !editingTitle && (
          <button className="kanban-col-edit-btn" onClick={() => setEditingTitle(true)}
            title={`Rename "${title}" column`} aria-label={`Rename "${title}" column`}>️</button>
        )}
      </header>

      <div className="kanban-col-body" role="list" aria-label={`${title} items`}>
        {items.map((i) => {
          const key = `${i.type}-${i.id}`;
          const isOpen = expandedId === key;
          return (
            <div key={key} role="listitem">
              {isOpen ? (
                <MetadataCard
                  title={i.title} owner={i.owner}
                  status={i.status !== 'open' ? i.status : undefined}
                  nature={i.nature} reach={i.reach}
                  description={i.description} alternatives={i.alternatives}
                  evidence={i.evidence} confidence={i.confidence}
                  verified={i.verified} extraDetails={i.extraDetails}
                  defaultOpen={true}
                  onSave={onSaveItem ? (changes) => onSaveItem(i, changes) : undefined}
                  onDelete={onDeleteItem ? () => onDeleteItem(i) : undefined}
                />
              ) : (
                <article className="kanban-item" tabIndex={0} role="button"
                  aria-label={`${i.title}, type: ${i.type}${i.owner ? `, owner: ${i.owner}` : ''}. Click to expand.`}
                  title={`Click to view details of "${i.title}"`}
                  onClick={() => toggleExpand(key)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(key); } }}>
                  <div className="kanban-item-title">{i.title}</div>
                  {i.owner && <div className="kanban-item-owner">Owner: {i.owner}</div>}
                  <div className="kanban-item-type">{i.type}</div>
                </article>
              )}
            </div>
          );
        })}
        {items.length === 0 && <div className="kanban-empty" role="status">No items</div>}
      </div>
    </section>
  );
};

export default KanbanColumn;