import React from 'react';

const makeItems = (count) => Array.from({ length: count }, (_, index) => index);

export function ShimmerLine({ className = '' }) {
  return <span className={`shimmer-line ${className}`.trim()} />;
}

export function ShimmerTable({ columns = 5, rows = 6, className = '' }) {
  const safeColumns = Math.max(1, Number(columns) || 1);
  const gridTemplateColumns = `repeat(${safeColumns}, minmax(86px, 1fr))`;

  return (
    <div
      className={`shimmer-shell shimmer-table-shell ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label="Loading data"
    >
      <div className="shimmer-table-header" style={{ gridTemplateColumns }}>
        {makeItems(safeColumns).map((item) => (
          <ShimmerLine key={`head-${item}`} className="shimmer-header-line" />
        ))}
      </div>

      {makeItems(rows).map((row) => (
        <div
          key={`row-${row}`}
          className="shimmer-table-row"
          style={{ gridTemplateColumns }}
        >
          {makeItems(safeColumns).map((column) => (
            <ShimmerLine
              key={`cell-${row}-${column}`}
              className={column === 0 ? 'shimmer-cell-line shimmer-cell-line-wide' : 'shimmer-cell-line'}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ShimmerMetricGrid({ cards = 5 }) {
  return (
    <div className="metric-grid dashboard-metric-grid shimmer-metric-grid" role="status" aria-live="polite">
      {makeItems(cards).map((card) => (
        <div key={card} className="metric-card shimmer-metric-card">
          <div>
            <ShimmerLine className="shimmer-metric-title" />
            <ShimmerLine className="shimmer-metric-value" />
          </div>
          <div className="shimmer-metric-icon">
            <ShimmerLine />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShimmerDetailPage() {
  return (
    <div className="shimmer-detail-page" role="status" aria-live="polite" aria-label="Loading student details">
      <div className="content-card shimmer-detail-card">
        <div className="shimmer-detail-top">
          <div className="shimmer-avatar" />
          <div className="shimmer-detail-title-block">
            <ShimmerLine className="shimmer-detail-title" />
            <ShimmerLine className="shimmer-detail-subtitle" />
          </div>
          <ShimmerLine className="shimmer-detail-badge" />
        </div>

        <div className="shimmer-detail-grid">
          {makeItems(8).map((item) => (
            <div key={item} className="shimmer-detail-field">
              <ShimmerLine className="shimmer-detail-label" />
              <ShimmerLine className="shimmer-detail-value" />
            </div>
          ))}
        </div>

        <div className="shimmer-stats-strip">
          {makeItems(4).map((item) => (
            <div key={item} className="shimmer-stat-card">
              <ShimmerLine className="shimmer-stat-label" />
              <ShimmerLine className="shimmer-stat-value" />
            </div>
          ))}
        </div>
      </div>

      <div className="content-card shimmer-detail-card">
        <ShimmerLine className="shimmer-section-title" />
        <ShimmerTable columns={4} rows={4} />
      </div>
    </div>
  );
}
