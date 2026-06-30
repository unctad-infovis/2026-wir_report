import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

import './ChartFocusStrategic.css';

// --- Data ---

const sectors = [
  { key: 'ai', label: 'AI infrastructure and related technologies', cagr: '47%', color: '#009edb' },
  { key: 'semi', label: 'Semiconductors', cagr: '54%', color: '#fbaf17' },
  { key: 'energy', label: 'Energy transition technologies and services', cagr: '17%', color: '#004987' },
  { key: 'minerals', label: 'Critical minerals', cagr: '17%', color: '#b06e2a' },
  { key: 'other', label: 'Other advanced and sensitive technologies', cagr: '8%', color: '#aea29a' }
];

const data1 = [
  { year: 2020, ai: 50.23, semi: 16.91, energy: 23.08, minerals: 9.83, other: 9.3 },
  { year: 2021, ai: 98.43, semi: 126.14, energy: 78.21, minerals: 13.43, other: 15.36 },
  { year: 2022, ai: 99.51, semi: 90.27, energy: 143.27, minerals: 38.94, other: 15.15 },
  { year: 2023, ai: 102.59, semi: 42.67, energy: 159.07, minerals: 71.38, other: 14.53 },
  { year: 2024, ai: 182.54, semi: 123.35, energy: 100.73, minerals: 26.86, other: 11.23 },
  { year: 2025, ai: 340.95, semi: 148.14, energy: 51.56, minerals: 21.7, other: 13.67 }
];

const mfgInvestors = [
  { key: 'eu', label: 'European Union', color: '#009edb', p1: 271, p2: 231 },
  { key: 'cn', label: 'China', color: '#fbaf17', p1: 102, p2: 109 },
  { key: 'us', label: 'United States', color: '#004987', p1: 139, p2: 102 },
  { key: 'kr', label: 'Republic of Korea', color: '#b06e2a', p1: 62, p2: 69 },
  { key: 'jp', label: 'Japan', color: '#a05fb4', p1: 105, p2: 52 },
  { key: 'other', label: 'Others', color: '#aea29a', p1: 291, p2: 245 }
];

const incomeGroups = [
  { key: 'high', label: 'High income', color: '#009edb', p1: 42, p2: 46, change: '-9%' },
  { key: 'upper', label: 'Upper-middle income', color: '#fbaf17', p1: 38, p2: 31, change: '-33%' },
  { key: 'lower', label: 'Lower-middle income', color: '#004987', p1: 18, p2: 23, change: '+6%' },
  { key: 'low', label: 'Low income', color: '#b06e2a', p1: 2, p2: 1, change: '-70%' }
];

// --- Panels ---

const panels = [
  {
    step: 0,
    headline: 'Policymakers have become more strategic – and so have investors.',
    body: null,
    source: null
  },
  {
    step: 1,
    headline: 'Investment is booming in five strategic sectors.',
    body: 'Announced greenfield investment in these sectors rose from $109 billion in 2020 to $576 billion in 2025 – an increase of more than fivefold in five years. Their share of global greenfield investment grew from 16% to 44%.',
    source: 'Source: UN Trade and Development (UNCTAD), based on fDi Markets. Data for 2025 annualized based on information available as of 30 November.'
  },
  {
    step: 2,
    headline: 'AI infrastructure is the largest segment. Semiconductors are growing fastest.',
    body: 'AI infrastructure attracted $341 billion in 2025 alone. Semiconductors recorded the highest compound annual growth rate – 54% – between 2020 and 2025.',
    source: 'Source: UN Trade and Development (UNCTAD), based on fDi Markets. Data for 2025 annualized based on information available as of 30 November.'
  },
  {
    step: 3,
    headline: 'But traditional manufacturing moved in the opposite direction.',
    body: 'Announced greenfield investment in manufacturing outside strategic sectors fell 17% between 2015–2019 and 2021–2025. The decline affected agribusiness, consumer goods, textiles and traditional transport equipment – industries that have historically offered developing countries entry points into global production networks.',
    source: 'Source: UN Trade and Development (UNCTAD), based on fDi Markets.'
  },
  {
    step: 4,
    headline: 'The most vulnerable economies saw the deepest declines.',
    body: 'Low-income economies saw manufacturing investment fall by 70%. Their share dropped from 2% to 1%. The most accessible routes into global production networks are narrowing for those who need them most.',
    source: 'Source: UN Trade and Development (UNCTAD), based on fDi Markets.'
  }
];

// --- Chart descriptions ---

const CHART_DESCRIPTIONS = [
  'Announced greenfield investment in strategic sectors, billions of dollars and percentage of global greenfield investment, 2020–2025',
  'Announced greenfield investment in strategic sectors, billions of dollars and percentage of global greenfield investment, 2020–2025',
  'Announced greenfield investment in strategic sectors, billions of dollars and percentage of global greenfield investment, 2020–2025',
  'Announced greenfield investment in manufacturing outside strategic sectors, by largest source economy, billions of dollars, 2015–2019 and 2021–2025',
  'Share of announced greenfield investment in manufacturing outside strategic sectors, by recipient-country income group, percentage, 2015–2019 and 2021–2025'
];

// --- Module-level constants and helpers (stable references, not component scope) ---

const CHART_MARGIN = { top: 20, right: 10, bottom: 35, left: 30 };
const SECTOR_KEYS = sectors.map(s => s.key);

const getSectorColor = (key, highlight) => (highlight && !['ai', 'semi'].includes(key) ? '#e0e0e0' : (sectors.find(s => s.key === key)?.color ?? '#999'));

const applyGridStyle = ax => {
  ax.select('.domain').remove();
  ax.selectAll('.tick line').attr('x1', -CHART_MARGIN.left).style('stroke', '#d0d0d0').style('stroke-dasharray', '2,2');
  ax.selectAll('.tick text')
    .style('fill', '#7c7067')
    .style('font-size', '14px')
    .attr('x', -CHART_MARGIN.left + 4)
    .attr('dy', '-4px')
    .attr('text-anchor', 'start');
};

const applyXStyle = ax => {
  ax.select('.domain').remove();
  ax.selectAll('.tick line').remove();
  ax.selectAll('.tick text').style('fill', '#7c7067').style('font-size', '14px');
};

// --- D3 draw functions (module-level, receive iW/iH as params) ---

const drawChart1 = (g, iW, iH, highlight) => {
  const series = d3.stack().keys(SECTOR_KEYS)(data1);
  const x = d3
    .scaleBand()
    .domain(data1.map(d => d.year))
    .range([0, iW])
    .padding(0.2);
  const y = d3.scaleLinear().domain([0, 650]).range([iH, 0]);

  g.selectAll('.x-axis')
    .data([null])
    .join('g')
    .attr('class', 'x-axis axis')
    .attr('transform', `translate(0,${iH})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')).tickSize(0).tickPadding(8))
    .call(applyXStyle);

  g.selectAll('.y-axis')
    .data([null])
    .join('g')
    .attr('class', 'y-axis axis')
    .call(
      d3
        .axisLeft(y)
        .tickValues([0, 200, 400, 600])
        .tickFormat(d => `${d}`)
        .tickSize(-iW)
    )
    .call(applyGridStyle);

  const layers = g.selectAll('.layer').data(series, d => d.key);
  const layersEnter = layers
    .enter()
    .append('g')
    .attr('class', d => `layer layer-${d.key}`)
    .attr('fill', d => getSectorColor(d.key, highlight));
  const allLayers = layersEnter.merge(layers);
  allLayers
    .transition()
    .duration(300)
    .attr('fill', d => getSectorColor(d.key, highlight));
  layers.exit().remove();

  allLayers.each(function (layerData) {
    const layer = d3.select(this);
    const rects = layer.selectAll('rect').data(layerData, d => d.data.year);
    rects
      .enter()
      .append('rect')
      .attr('x', d => x(d.data.year))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d[1]))
      .attr('height', d => Math.max(0, y(d[0]) - y(d[1])));
    rects
      .transition()
      .duration(300)
      .attr('x', d => x(d.data.year))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d[1]))
      .attr('height', d => Math.max(0, y(d[0]) - y(d[1])));
    rects.exit().remove();
  });

  const cagrData = [];
  const cagrSel = g.selectAll('.cagr-label').data(cagrData, d => d.key);
  cagrSel
    .enter()
    .append('text')
    .attr('class', 'cagr-label')
    .style('opacity', 0)
    .attr('dy', '0.35em')
    .attr('font-size', 10)
    .attr('font-weight', 700)
    .merge(cagrSel)
    .attr('x', iW + 6)
    .attr('y', d => {
      const row = data1[5];
      let cum = 0;
      for (const s of SECTOR_KEYS) {
        if (s === d.key) break;
        cum += row[s];
      }
      return y(cum + row[d.key] / 2);
    })
    .attr('fill', d => d.color)
    .text(d => `${d.cagr}/yr`)
    .transition()
    .duration(300)
    .style('opacity', 1);
  cagrSel.exit().transition().duration(200).style('opacity', 0).remove();

  const annotData = highlight
    ? []
    : [
        { year: 2020, lines: ['109'] },
        { year: 2025, lines: ['576'] }
      ];
  const annotSel = g.selectAll('.bar-annotation').data(annotData, d => d.year);
  const annotEnter = annotSel.enter().append('text').attr('class', 'bar-annotation').style('opacity', 0);
  annotEnter
    .merge(annotSel)
    .attr('text-anchor', 'middle')
    .attr('font-size', 14)
    .attr('font-weight', 700)
    .attr('fill', '#333')
    .attr('x', d => x(d.year) + x.bandwidth() / 2)
    .attr('y', d => {
      const row = data1.find(r => r.year === d.year);
      const total = SECTOR_KEYS.reduce((s, k) => s + row[k], 0);
      return y(total) - 5;
    })
    .each(function (d) {
      const el = d3.select(this);
      el.selectAll('tspan').remove();
      d.lines.forEach((line, i) => {
        el.append('tspan')
          .attr('x', el.attr('x'))
          .attr('dy', i === 0 ? 0 : '1.2em')
          .text(line);
      });
    })
    .transition()
    .duration(300)
    .style('opacity', 1);
  annotSel.exit().transition().duration(200).style('opacity', 0).remove();

  const barLabelData = highlight
    ? [
        { key: 'ai', value: Math.round(data1[5].ai), low: 0, high: data1[5].ai },
        { key: 'semi', value: Math.round(data1[5].semi), low: data1[5].ai, high: data1[5].ai + data1[5].semi }
      ]
    : [];
  const barLabelSel = g.selectAll('.bar-label').data(barLabelData, d => d.key);
  barLabelSel
    .enter()
    .append('text')
    .attr('class', 'bar-label')
    .style('opacity', 0)
    .merge(barLabelSel)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('font-size', 14)
    .attr('font-weight', 700)
    .attr('fill', d => (d.key === 'semi' ? '#222' : '#fff'))
    .attr('x', x(2025) + x.bandwidth() / 2)
    .attr('y', d => (y(d.high) + y(d.low)) / 2)
    .text(d => String(d.value))
    .transition()
    .duration(300)
    .style('opacity', 1);
  barLabelSel.exit().transition().duration(200).style('opacity', 0).remove();
};

const drawChart2 = (g, iW, iH) => {
  const mfgKeys = mfgInvestors.map(d => d.key);
  const periods = [{ period: '2015–2019' }, { period: '2021–2025' }];
  for (const m of mfgInvestors) {
    periods[0][m.key] = m.p1;
    periods[1][m.key] = m.p2;
  }
  const series = d3.stack().keys(mfgKeys)(periods);
  const maxTotal = d3.max(periods, p => mfgKeys.reduce((s, k) => s + p[k], 0));

  const x = d3
    .scaleBand()
    .domain(periods.map(p => p.period))
    .range([0, iW])
    .padding(0.35);
  const y = d3
    .scaleLinear()
    .domain([0, maxTotal * 1.2])
    .range([iH, 0]);

  g.selectAll('.x-axis').data([null]).join('g').attr('class', 'x-axis axis').attr('transform', `translate(0,${iH})`).call(d3.axisBottom(x).tickSize(0).tickPadding(8)).call(applyXStyle);

  g.selectAll('.y-axis')
    .data([null])
    .join('g')
    .attr('class', 'y-axis axis')
    .call(
      d3
        .axisLeft(y)
        .tickValues([0, 200, 400, 600, 800, 1000])
        .tickFormat(d => (d === 1000 ? '1 000' : `${d}`))
        .tickSize(-iW)
    )
    .call(applyGridStyle);

  const layers = g.selectAll('.layer').data(series, d => d.key);
  const allLayers = layers
    .enter()
    .append('g')
    .attr('class', d => `layer layer-${d.key}`)
    .attr('fill', d => mfgInvestors.find(m => m.key === d.key)?.color ?? '#999')
    .merge(layers);
  layers.exit().remove();

  allLayers.each(function (layerData) {
    const layer = d3.select(this);
    const rects = layer.selectAll('rect').data(layerData, d => d.data.period);
    rects
      .enter()
      .append('rect')
      .attr('x', d => x(d.data.period))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d[1]))
      .attr('height', d => Math.max(0, y(d[0]) - y(d[1])));
    rects
      .transition()
      .duration(300)
      .attr('x', d => x(d.data.period))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d[1]))
      .attr('height', d => Math.max(0, y(d[0]) - y(d[1])));
    rects.exit().remove();
  });

  g.selectAll('.change-label')
    .data(['-17%'])
    .join('text')
    .attr('class', 'change-label')
    .attr('x', iW / 2)
    .attr('y', y(maxTotal * 1.1))
    .attr('text-anchor', 'middle')
    .attr('font-size', 32)
    .attr('font-weight', 700)
    .attr('fill', '#ed1847')
    .style('opacity', 1)
    .text(d => d);
};

const drawChart3 = (g, iW, iH) => {
  const igKeys = incomeGroups.map(d => d.key);
  const periods = [{ period: '2015–2019' }, { period: '2021–2025' }];
  for (const ig of incomeGroups) {
    periods[0][ig.key] = ig.p1;
    periods[1][ig.key] = ig.p2;
  }
  const series = d3.stack().keys(igKeys)(periods);

  const x = d3
    .scaleBand()
    .domain(periods.map(p => p.period))
    .range([0, iW])
    .padding(0.35);
  const y = d3.scaleLinear().domain([0, 105]).range([iH, 0]);

  g.selectAll('.x-axis').data([null]).join('g').attr('class', 'x-axis axis').attr('transform', `translate(0,${iH})`).call(d3.axisBottom(x).tickSize(0).tickPadding(8)).call(applyXStyle);

  g.selectAll('.y-axis')
    .data([null])
    .join('g')
    .attr('class', 'y-axis axis')
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat(d => (d === 100 ? `${d}%` : `${d}`))
        .tickSize(-iW)
    )
    .call(applyGridStyle);

  const layers = g.selectAll('.layer').data(series, d => d.key);
  const allLayers = layers
    .enter()
    .append('g')
    .attr('class', d => `layer layer-${d.key}`)
    .attr('fill', d => incomeGroups.find(ig => ig.key === d.key)?.color ?? '#999')
    .merge(layers);
  layers.exit().remove();

  allLayers.each(function (layerData) {
    const layer = d3.select(this);
    const rects = layer.selectAll('rect').data(layerData, d => d.data.period);
    rects
      .enter()
      .append('rect')
      .attr('x', d => x(d.data.period))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d[1]))
      .attr('height', d => Math.max(0, y(d[0]) - y(d[1])));
    rects
      .transition()
      .duration(300)
      .attr('x', d => x(d.data.period))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d[1]))
      .attr('height', d => Math.max(0, y(d[0]) - y(d[1])));
    rects.exit().remove();
  });

  const labelData = incomeGroups.map(item => {
    let cum = 0;
    for (const ig of incomeGroups) {
      if (ig.key === item.key) break;
      cum += ig.p2;
    }
    return { ...item, midY: y(cum + item.p2 / 2) };
  });

  g.selectAll('.income-change')
    .data(labelData.filter(d => d.key === 'low'), d => d.key)
    .join('text')
    .attr('class', 'income-change')
    .attr('x', x('2021–2025') + x.bandwidth() + 8)
    .attr('y', d => d.midY + 5)
    .attr('dy', '0.35em')
    .attr('font-size', d => (d.key === 'low' ? 14 : 11))
    .attr('font-weight', d => (d.key === 'low' ? 700 : 400))
    .attr('fill', d => d.color)
    .style('opacity', 1)
    .each(function (d) {
      const el = d3.select(this);
      el.selectAll('tspan').remove();
      el.append('tspan').attr('x', el.attr('x')).attr('dy', '-0.6em').text('Value');
      el.append('tspan').attr('x', el.attr('x')).attr('dy', '1.2em').text(d.change);
    });
};

// --- D3 Chart component ---

const D3Chart = ({ step, width, height }) => {
  const svgRef = useRef(null);
  const prevStepRef = useRef(null);

  // Init: clear SVG and pre-render all chart types when dimensions change
  // biome-ignore lint/correctness/useExhaustiveDependencies: drawChart1/2/3 are stable module-level functions
  useEffect(() => {
    if (!svgRef.current) return;
    const iW = width - CHART_MARGIN.left - CHART_MARGIN.right;
    const iH = height - CHART_MARGIN.top - CHART_MARGIN.bottom;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const root = svg.append('g').attr('class', 'root').attr('transform', `translate(${CHART_MARGIN.left},${CHART_MARGIN.top})`);
    prevStepRef.current = null;
    if (iW <= 0 || iH <= 0) return;
    [1, 2, 3].forEach(t => root.append('g').attr('class', `chart${t}`).style('opacity', 0).style('transition', 'opacity 0.9s ease'));
    drawChart1(root.select('.chart1'), iW, iH, false);
    drawChart2(root.select('.chart2'), iW, iH);
    drawChart3(root.select('.chart3'), iW, iH);
  }, [width, height]);

  // Step change: update highlight if needed, then set opacity (CSS handles the fade)
  useEffect(() => {
    const iW = width - CHART_MARGIN.left - CHART_MARGIN.right;
    const iH = height - CHART_MARGIN.top - CHART_MARGIN.bottom;
    if (!svgRef.current || iW <= 0 || iH <= 0) return;
    const root = d3.select(svgRef.current).select('.root');
    if (root.empty()) return;

    const comingFrom = prevStepRef.current;
    prevStepRef.current = step;

    const getType = s => (s <= 2 ? 1 : s === 3 ? 2 : 3);
    const newType = getType(step);

    // Update chart1 highlight when entering or leaving step 2
    if (newType === 1) {
      const highlight = step === 2;
      const prevHighlight = comingFrom === 2;
      if (comingFrom === null || highlight !== prevHighlight) {
        drawChart1(root.select('.chart1'), iW, iH, highlight);
      }
    }

    // Defer opacity change by two animation frames so the browser paints the
    // "all groups at opacity 0" state that the init effect may have just written
    // before we change any group to opacity 1 — this lets CSS transition fire.
    let raf2;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const r = d3.select(svgRef.current)?.select('.root');
        if (!r || r.empty()) return;
        [1, 2, 3].forEach(t => r.select(`.chart${t}`).style('opacity', t === newType ? 1 : 0));
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [step, width, height]);

  return <svg ref={svgRef} width={width} height={height} className="strategic_svg" />;
};

// --- Legend ---

const Legend = ({ step }) => {
  const items = step <= 2 ? sectors : step === 3 ? mfgInvestors : incomeGroups;
  return (
    <div className="strategic_legend">
      {items.map(s => (
        <div key={s.key} className="legend_item">
          <span className="legend_swatch" style={{ background: step === 2 ? getSectorColor(s.key, true) : s.color }} />
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
};

// --- Main ---

const ChartFocusStrategic = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [chartSize, setChartSize] = useState({ width: 0, height: 0 });
  const chartWrapRef = useRef(null);
  const panelRefs = useRef([]);

  useEffect(() => {
    if (!chartWrapRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setChartSize({ width: Math.floor(width), height: Math.floor(height) });
    });
    ro.observe(chartWrapRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    // On mobile the chart is sticky at top (0–50svh); fire when panel enters the bottom half
    const rootMargin = isMobile ? '-50% 0px -10% 0px' : '-45% 0px -45% 0px';
    const observers = panelRefs.current.map((el, i) => {
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(i);
        },
        { rootMargin, threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => {
      observers.forEach(o => {
        o?.disconnect();
      });
    };
  }, []);

  return (
    <div className="chart_focus_strategic">
      <div className="strategic_left">
        <div className="strategic_panel_inner">
          {CHART_DESCRIPTIONS[activeStep] && (
            <p className="strategic_description">
              {CHART_DESCRIPTIONS[activeStep]}
            </p>
          )}
          <Legend step={activeStep} />
          <div className="strategic_chart_wrap" ref={chartWrapRef}>
            {chartSize.width > 0 && chartSize.height > 0 && <D3Chart step={activeStep} width={chartSize.width} height={chartSize.height} />}
          </div>
        </div>
      </div>

      <div className="strategic_right">
        {panels.map((panel, i) => (
          <div
            key={panel.step}
            className={`strategic_panel${activeStep === i ? ' active' : ''}`}
            ref={el => {
              panelRefs.current[i] = el;
            }}
          >
            <div className="strategic_panel_inner">
              <p className="strategic_step">
                Step {i + 1} / {panels.length}
              </p>
              <h3 className="strategic_headline">{panel.headline}</h3>
              {panel.body && <p className="strategic_body">{panel.body}</p>}
              {panel.source && <p className="strategic_source">{panel.source}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartFocusStrategic;
