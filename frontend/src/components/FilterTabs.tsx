import React from 'react';

export interface Tab { key: string; label: string; count: number; }

const FilterTabs: React.FC<{ tabs: Tab[]; active: string; onChange: (k: string) => void }> = ({ tabs, active, onChange }) => (
  <div className="tabs" role="tablist" aria-label="Filter by metadata type">
    {tabs.map((t) => (
      <button key={t.key} role="tab" id={`tab-${t.key}`} aria-selected={t.key === active}
        aria-controls={`tabpanel-${t.key}`} className={`tab${t.key === active ? ' tab--active' : ''}`}
        onClick={() => onChange(t.key)} title={`Show ${t.label} (${t.count} items)`}>
        {t.label}<span className="tab-count" aria-label={`${t.count} items`}>{t.count}</span>
      </button>
    ))}
  </div>
);

export default FilterTabs;