import React from 'react';

const ConfidenceBar: React.FC<{ value: number }> = ({ value }) => {
  const v = Math.max(0, Math.min(100, value));
  const color = v < 60 ? 'var(--red)' : v < 80 ? 'var(--yellow)' : 'var(--green)';
  const label = v < 60 ? 'Low' : v < 80 ? 'Medium' : 'High';
  return (
    <span className="conf" role="meter" aria-valuenow={v} aria-valuemin={0}
      aria-valuemax={100} aria-label={`Confidence: ${v}% (${label})`} title={`Confidence: ${v}% — ${label}`}>
      <span className="conf-track" aria-hidden="true">
        <span className="conf-fill" style={{ width: `${v}%`, background: color }} />
      </span>
      <span className="conf-pct" style={{ color }}>{v}%</span>
    </span>
  );
};

export default ConfidenceBar;