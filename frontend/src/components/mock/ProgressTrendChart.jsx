import React from "react";

const COLORS = {
  communication: "#4f46e5",
  technicalDepth: "#16a34a",
  confidence: "#f97316",
};

const buildPoints = (values, width, height, padding) => {
  if (!values.length) return "";
  const max = 100;
  const min = 0;
  const stepX = values.length === 1 ? 0 : (width - padding * 2) / (values.length - 1);
  return values
    .map((value, index) => {
      const x = padding + stepX * index;
      const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
};

const ProgressTrendChart = ({ trends }) => {
  if (!trends || trends.length === 0) {
    return (
      <div className="neo-inset p-6 rounded-2xl text-sm text-[color:var(--neo-muted)]">
        No trend data yet. Complete a few sessions to see your progress.
      </div>
    );
  }

  const width = 560;
  const height = 220;
  const padding = 24;

  const communication = trends.map((t) => t.scores?.communication || 0);
  const technicalDepth = trends.map((t) => t.scores?.technicalDepth || 0);
  const confidence = trends.map((t) => t.scores?.confidence || 0);

  return (
    <div className="neo-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-bold">Progress Trends</h3>
          <p className="text-xs text-[color:var(--neo-muted)]">Last {trends.length} sessions</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS.communication }} />
            Communication
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS.technicalDepth }} />
            Technical
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS.confidence }} />
            Confidence
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
        <rect x="0" y="0" width={width} height={height} rx="16" fill="transparent" />
        {[20, 40, 60, 80, 100].map((value) => {
          const y = height - padding - (value / 100) * (height - padding * 2);
          return (
            <g key={value}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(148,163,184,0.25)" />
              <text x={8} y={y + 4} fontSize="10" fill="rgba(148,163,184,0.9)">{value}</text>
            </g>
          );
        })}
        <polyline
          fill="none"
          stroke={COLORS.communication}
          strokeWidth="2"
          points={buildPoints(communication, width, height, padding)}
        />
        <polyline
          fill="none"
          stroke={COLORS.technicalDepth}
          strokeWidth="2"
          points={buildPoints(technicalDepth, width, height, padding)}
        />
        <polyline
          fill="none"
          stroke={COLORS.confidence}
          strokeWidth="2"
          points={buildPoints(confidence, width, height, padding)}
        />
      </svg>
    </div>
  );
};

export default ProgressTrendChart;
