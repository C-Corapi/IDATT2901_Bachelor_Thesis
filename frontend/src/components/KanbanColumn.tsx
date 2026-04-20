import React, { useEffect, useRef, useState } from 'react';
import type { KanbanItemFull } from '../types';
import MetadataCard from './MetadataCard';

interface Props {
  title: string;
  items: KanbanItemFull[];
  onTitleChange?: (newTitle: string) => void;
  onSaveItem?: (item: KanbanItemFull, changes: Record<string, string>) => void;
  onDeleteItem?: (item: KanbanItemFull) => void;
  onDropItem?: (item: KanbanItemFull) => void;
}

const KanbanColumn: React.FC<Props> = ({
  title,
  items,
  onTitleChange,
  onSaveItem,
  onDeleteItem,
  onDropItem,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [draft, setDraft] = useState(title);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isOver, setIsOver] = useState(false);
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

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsOver(false);

    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;

    try {
      const item = JSON.parse(raw) as KanbanItemFull;
      onDropItem?.(item);
    } catch (err) {
      console.error('Invalid drag payload', err);
    }
  };

  return (
    <section
      className={`kanban-col ${isOver ? 'kanban-col--over' : ''}`}
      aria-label={`${title} column — ${items.length} items`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
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
        <span
          className="kanban-col-count"
          aria-label={`${items.length} items`}
          title={`${items.length} items in ${title}`}
        >
          {items.length}
        </span>
        {onTitleChange && !editingTitle && (
          <button
            className="kanban-col-edit-btn"
            onClick={() => setEditingTitle(true)}
            title={`Rename "${title}" column`}
            aria-label={`Rename "${title}" column`}
          >
            ✎
          </button>
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
                  title={i.title}
                  owner={i.owner}
                  status={i.status !== 'open' ? i.status : undefined}
                  nature={i.nature}
                  reach={i.reach}
                  description={i.description}
                  alternatives={i.alternatives}
                  evidence={i.evidence}
                  confidence={i.confidence}
                  verified={i.verified}
                  extraDetails={i.extraDetails}
                  defaultOpen={true}
                  onSave={onSaveItem ? (changes) => onSaveItem(i, changes) : undefined}
                  onDelete={onDeleteItem ? () => onDeleteItem(i) : undefined}
                />
              ) : (
                <article
                  className="kanban-item"
                  tabIndex={0}
                  role="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('application/json', JSON.stringify(i));
                  }}
                  onClick={() => toggleExpand(key)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(key);
                    }
                  }}
                  aria-label={`${i.title}, draggable`}
                  title="Drag to another column"
                >
                  <div className="kanban-item-title">{i.title}</div>
                  {i.owner && <div className="kanban-item-owner">{i.owner}</div>}
                  {i.status && <div className="kanban-item-type">{i.status}</div>}
                </article>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default KanbanColumn;