import {
  SeverityBadge,
  StatCard,
  TrendSpark,
  ScoreGauge,
  DriftBreakdown,
  DataTable,
  ComparisonCard,
  Timeline,
  Heatmap,
  MetricGrid,
  VerificationBadge,
} from '@buoy-design/plumb';

export function SeverityBadgeDemo() {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <SeverityBadge severity="error" count={12} />
      <SeverityBadge severity="warning" count={5} />
      <SeverityBadge severity="info" count={3} />
      <SeverityBadge severity="ignore" count={0} />
    </div>
  );
}

export function StatCardDemo() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      <StatCard value={42} label="Total Issues" change={-12.5} changeDirection="down" variant="success" />
      <StatCard value="87%" label="Token Coverage" change={3.2} changeDirection="up" variant="default" />
      <StatCard value={7} label="Critical Drift" change={28.0} changeDirection="up" variant="critical" />
    </div>
  );
}

export function TrendSparkDemo() {
  return (
    <TrendSpark
      value={42}
      label="Drift issues this week"
      data={[65, 59, 80, 81, 56, 55, 40, 42]}
      change={-12.5}
      changeDirection="down"
      variant="success"
    />
  );
}

export function ScoreGaugeDemo() {
  return (
    <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
      <ScoreGauge value={87} label="Token Coverage" />
      <ScoreGauge value={45} label="Consistency" />
      <ScoreGauge value={22} label="Risk Score" />
    </div>
  );
}

export function DriftBreakdownDemo() {
  return (
    <DriftBreakdown
      title="Drift by Type"
      items={[
        { type: 'hardcoded-color', count: 23 },
        { type: 'hardcoded-spacing', count: 15 },
        { type: 'arbitrary-tailwind', count: 9 },
        { type: 'inline-style', count: 6 },
        { type: 'magic-number', count: 3 },
      ]}
    />
  );
}

export function DataTableDemo() {
  return (
    <DataTable
      columns={[
        { key: 'file', label: 'File', render: 'filePath' },
        { key: 'severity', label: 'Severity', render: 'severity' },
        { key: 'issues', label: 'Issues', render: 'bar' },
        { key: 'delta', label: 'Change', render: 'delta' },
      ]}
      data={[
        { file: 'src/components/Header/Header.module.css', severity: 'error', issues: 12, delta: 3 },
        { file: 'src/components/Card/Card.tsx', severity: 'warning', issues: 8, delta: -2 },
        { file: 'src/components/Button/Button.module.css', severity: 'info', issues: 5, delta: 0 },
        { file: 'src/layouts/MainLayout.astro', severity: 'warning', issues: 4, delta: 1 },
        { file: 'src/pages/index.astro', severity: 'info', issues: 2, delta: -1 },
      ]}
      maxRows={4}
    />
  );
}

export function ComparisonCardDemo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ComparisonCard
        metric="Drift Issues"
        before={{ label: 'Last Week', value: 54 }}
        after={{ label: 'This Week', value: 42 }}
        delta={-22.2}
      />
      <ComparisonCard
        title="Weekly Comparison"
        beforeLabel="Last Week"
        afterLabel="This Week"
        metrics={[
          { label: 'Total Issues', before: 54, after: 42, delta: -22.2 },
          { label: 'Critical', before: 9, after: 7, delta: -22.2 },
          { label: 'Token Coverage', before: '82%', after: '87%', delta: 6.1 },
        ]}
      />
    </div>
  );
}

export function TimelineDemo() {
  return (
    <Timeline
      events={[
        { title: 'Migrated color tokens', date: 'Mar 12, 2026', prNumber: 142, issuesCount: 3, suggestionsCount: 2, adopted: true, color: '#10B981', impact: { type: 'positive', label: '-8 issues' } },
        { title: 'New card component added', date: 'Mar 10, 2026', prNumber: 139, issuesCount: 5, suggestionsCount: 3, adopted: false, color: '#F59E0B' },
        { title: 'Spacing refactor', date: 'Mar 8, 2026', description: 'Replaced hardcoded px values with spacing tokens across 12 files.', impact: { type: 'positive', label: 'Major cleanup' } },
      ]}
    />
  );
}

export function HeatmapDemo() {
  return (
    <Heatmap
      title="Drift by File × Type"
      xKey="type"
      yKey="file"
      valueKey="count"
      data={[
        { file: 'src/components/Header.css', type: 'color', count: 8 },
        { file: 'src/components/Header.css', type: 'spacing', count: 3 },
        { file: 'src/components/Header.css', type: 'tailwind', count: 1 },
        { file: 'src/components/Card.tsx', type: 'color', count: 5 },
        { file: 'src/components/Card.tsx', type: 'tailwind', count: 7 },
        { file: 'src/components/Card.tsx', type: 'spacing', count: 2 },
        { file: 'src/components/Button.css', type: 'color', count: 2 },
        { file: 'src/components/Button.css', type: 'spacing', count: 6 },
        { file: 'src/components/Button.css', type: 'tailwind', count: 1 },
        { file: 'src/layouts/Main.astro', type: 'spacing', count: 4 },
        { file: 'src/layouts/Main.astro', type: 'color', count: 1 },
      ]}
    />
  );
}

export function MetricGridDemo() {
  return (
    <MetricGrid
      columns={3}
      metrics={[
        { value: 42, label: 'Total Issues', change: -12.5, changeDirection: 'down' as const, variant: 'success' as const },
        { value: '87%', label: 'Token Coverage', change: 3.2, changeDirection: 'up' as const },
        { value: 7, label: 'Critical Drift', change: 28.0, changeDirection: 'up' as const, variant: 'critical' as const },
      ]}
    />
  );
}

export function VerificationBadgeDemo() {
  return (
    <VerificationBadge
      verified={['Total Issues', 'Token Coverage', 'Critical Count']}
      unverified={['Trend Direction']}
      corrections={[{ field: 'Token Coverage', original: 86, corrected: 87 }]}
    />
  );
}
