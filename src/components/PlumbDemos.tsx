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
  PlumbLineChart,
  PlumbAreaChart,
  PlumbBarChart,
  PlumbPieChart,
  PlumbSpiderChart,
  PlumbTreemap,
  PlumbFunnelChart,
  PlumbScatterChart,
  PlumbWaterfallChart,
  PlumbStackedBarChart,
} from '@buoy-design/plumb';

export function SeverityBadgeDemo() {
  return (
    <div className="flex gap-2 flex-wrap">
      <SeverityBadge severity="error" count={12} />
      <SeverityBadge severity="warning" count={5} />
      <SeverityBadge severity="info" count={3} />
      <SeverityBadge severity="ignore" count={0} />
    </div>
  );
}

export function StatCardDemo() {
  return (
    <div className="grid grid-cols-3 gap-4">
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
    <div className="flex gap-6 justify-center">
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
    <div className="flex flex-col gap-4">
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

const WEEKLY_DATA = [
  { week: 'W1', issues: 65, coverage: 72, critical: 12 },
  { week: 'W2', issues: 59, coverage: 75, critical: 9 },
  { week: 'W3', issues: 80, coverage: 74, critical: 15 },
  { week: 'W4', issues: 81, coverage: 78, critical: 11 },
  { week: 'W5', issues: 56, coverage: 82, critical: 7 },
  { week: 'W6', issues: 55, coverage: 85, critical: 5 },
  { week: 'W7', issues: 40, coverage: 87, critical: 4 },
];

export function LineChartDemo() {
  return (
    <PlumbLineChart
      data={WEEKLY_DATA}
      xKey="week"
      yKeys={['issues', 'coverage']}
    />
  );
}

export function AreaChartDemo() {
  return (
    <PlumbAreaChart
      data={WEEKLY_DATA}
      xKey="week"
      yKeys={['issues', 'critical']}
      stacked
    />
  );
}

export function BarChartDemo() {
  return (
    <PlumbBarChart
      data={[
        { type: 'hardcoded-color', count: 23 },
        { type: 'hardcoded-spacing', count: 15 },
        { type: 'arbitrary-tw', count: 9 },
        { type: 'inline-style', count: 6 },
        { type: 'magic-number', count: 3 },
      ]}
      xKey="type"
      yKey="count"
    />
  );
}

const PIE_DATA = [
  { category: 'Color', count: 23 },
  { category: 'Spacing', count: 15 },
  { category: 'Tailwind', count: 9 },
  { category: 'Inline', count: 6 },
  { category: 'Magic #', count: 3 },
];

export function PieChartDemo() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <PlumbPieChart data={PIE_DATA} nameKey="category" valueKey="count" />
      <PlumbPieChart data={PIE_DATA} nameKey="category" valueKey="count" monotone />
    </div>
  );
}

export function SpiderChartDemo() {
  return (
    <PlumbSpiderChart
      data={[
        { axis: 'Coverage', target: 95, current: 72 },
        { axis: 'Consistency', target: 90, current: 48 },
        { axis: 'Adoption', target: 85, current: 61 },
        { axis: 'Docs', target: 90, current: 35 },
        { axis: 'Automation', target: 80, current: 42 },
        { axis: 'Governance', target: 75, current: 55 },
      ]}
      axisKey="axis"
      dataKeys={['target', 'current']}
      max={100}
    />
  );
}

export function TreemapDemo() {
  return (
    <PlumbTreemap
      data={[
        { name: 'Components', value: 45, children: [
          { name: 'Button', value: 12 },
          { name: 'Card', value: 18 },
          { name: 'Header', value: 15 },
        ]},
        { name: 'Layouts', value: 20 },
        { name: 'Pages', value: 15 },
        { name: 'Utils', value: 8 },
      ]}
    />
  );
}

export function FunnelChartDemo() {
  return (
    <PlumbFunnelChart
      data={[
        { stage: 'Issues Found', count: 156 },
        { stage: 'Suggestions Made', count: 98 },
        { stage: 'Adopted', count: 67 },
        { stage: 'Verified', count: 52 },
      ]}
      nameKey="stage"
      valueKey="count"
    />
  );
}

export function ScatterChartDemo() {
  return (
    <PlumbScatterChart
      data={[
        { complexity: 12, drift: 8, name: 'Header.css' },
        { complexity: 28, drift: 22, name: 'Card.tsx' },
        { complexity: 5, drift: 2, name: 'Badge.tsx' },
        { complexity: 35, drift: 31, name: 'Layout.astro' },
        { complexity: 18, drift: 11, name: 'Button.css' },
        { complexity: 42, drift: 38, name: 'Table.tsx' },
        { complexity: 8, drift: 3, name: 'Icon.tsx' },
      ]}
      xKey="complexity"
      yKey="drift"
      nameKey="name"
    />
  );
}

export function WaterfallChartDemo() {
  return (
    <PlumbWaterfallChart
      data={[
        { name: 'Start', value: 54 },
        { name: 'Color fix', value: -12 },
        { name: 'New component', value: 8 },
        { name: 'Spacing refactor', value: -15 },
        { name: 'Regression', value: 7 },
        { name: 'Current', value: 42 },
      ]}
    />
  );
}

export function StackedBarChartDemo() {
  return (
    <PlumbStackedBarChart
      data={[
        { week: 'W1', errors: 12, warnings: 28, info: 25 },
        { week: 'W2', errors: 9, warnings: 25, info: 25 },
        { week: 'W3', errors: 15, warnings: 32, info: 33 },
        { week: 'W4', errors: 11, warnings: 30, info: 40 },
        { week: 'W5', errors: 7, warnings: 22, info: 27 },
        { week: 'W6', errors: 5, warnings: 20, info: 30 },
        { week: 'W7', errors: 4, warnings: 16, info: 20 },
      ]}
      xKey="week"
      yKeys={['errors', 'warnings', 'info']}
    />
  );
}
