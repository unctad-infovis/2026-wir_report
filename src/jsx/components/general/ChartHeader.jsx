// Note: ChartHeader.css is imported via App.css (not here) so it lands in the shared build
// output rather than its own chunk — see the comment in App.css for why.

export default function ChartHeader({ title, subtitle, large = false }) {
  return (
    <div className="chart_header">
      <h3 className={`chart_header_title${large ? ' chart_header_title--lg' : ''}`}>{title}</h3>
      {subtitle && <p className="chart_header_subtitle">{subtitle}</p>}
    </div>
  );
}
