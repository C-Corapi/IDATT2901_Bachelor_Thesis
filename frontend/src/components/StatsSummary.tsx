import React from 'react';

export interface Stat {
  label: string;
  value: string | number;
  variant?: 'default' | 'peach' | 'rose' | 'green' | 'purple' | 'blue';
}

const StatsSummary: React.FC<{ stats: Stat[] }> = ({ stats }) => (
  <section className="stats" aria-label="Metadata statistics summary">
    {stats.map((s) => {
      const variantClass = s.variant && s.variant !== 'default'
        ? ` stat-value--${s.variant}`
        : '';

      return (
        <div
          className="stat-card"
          key={s.label}
          role="group"
          aria-label={`${s.label}: ${s.value}`}
          title={`${s.label}: ${s.value}`}
        >
          <div className="stat-label" id={`stat-${s.label}`}>{s.label}</div>
          <div
            className={`stat-value${variantClass}`}
            aria-labelledby={`stat-${s.label}`}
          >
            {s.value}
          </div>
        </div>
      );
    })}
  </section>
);

export default StatsSummary;