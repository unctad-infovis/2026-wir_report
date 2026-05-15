import Highcharts from 'highcharts';
import 'highcharts/modules/accessibility';
import 'highcharts/modules/exporting';
import 'highcharts/modules/export-data';
import { useCallback, useEffect, useRef, useState } from 'react';

import formatNr from './../helpers/FormatNr.js';
import loadFile from './../helpers/LoadFile.js';
import roundNr from './../helpers/RoundNr.js';

import './ChartFDIExplorer.css';

// --- Constants ---
const startYear = 1990;
const endYear = 2024;
const allYears = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
const countryColors = ['#009edb', '#ed1847', '#fbaf17', '#aea29a', '#a05fb4', '#72bf44'];
const dataFile = `assets/data/2025-fdi_explorer.json`;

// --- Highcharts global setup ---
Highcharts.setOptions({
  lang: {
    decimalPoint: '.',
    downloadCSV: 'Download CSV data',
    thousandsSep: ' '
  }
});

Highcharts.SVGRenderer.prototype.symbols.download = (x, y, w, h) => ['M', x + w * 0.5, y, 'L', x + w * 0.5, y + h * 0.7, 'M', x + w * 0.3, y + h * 0.5, 'L', x + w * 0.5, y + h * 0.7, 'L', x + w * 0.7, y + h * 0.5, 'M', x, y + h * 0.9, 'L', x, y + h, 'L', x + w, y + h, 'L', x + w, y + h * 0.9];

// --- Legend icon ---
const LegendIcon = ({ symbol, color }) => {
  const line = <path fill="none" d="M 0 11 L 16 11" stroke={color} strokeWidth="2" />;
  const icons = {
    square: <path fill={color} d="M 4 7 L 12 7 L 12 15 L 4 15 Z" opacity="1" />,
    circle: <path fill={color} d="M 8 15 A 4 4 0 1 1 8.003999999333336 14.999998000000167 Z" opacity="1" />,
    diamond: <path fill={color} d="M 8 7 L 12 11 L 8 15 L 4 11 Z" opacity="1" />,
    'triangle-down': <path fill={color} d="M 4 7 L 12 7 L 8 15 Z" opacity="1" />,
    triangle: <path fill={color} d="M 8 7 L 12 15 L 4 15 Z" opacity="1" />
  };
  if (!icons[symbol]) return null;
  return (
    <svg>
      <title>{symbol}</title>
      {line}
      {icons[symbol]}
    </svg>
  );
};

// --- Main component ---
const ChartFDIExplorer = ({ introTexts = [] }) => {
  const [data, setData] = useState(null);
  const [activeData, setActiveData] = useState([]);
  const [dataType, setDataType] = useState('fdi_inflows');
  const [selected, setSelected] = useState({ World: true });
  const [visible, setVisible] = useState({});
  const [legend, setLegend] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  const chartRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  // --- Scroll logic ---
  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
        setScrollProgress(Math.max(0, Math.min(1, progress)));
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // --- Data cleaning ---
  const cleanData = useCallback(json_data => {
    ['fdi_inflows', 'fdi_outflows'].forEach(type => {
      let currentLevel = 0;
      const parents = [];
      json_data[type] = json_data[type].map(area => {
        area.level = parseInt(area.level, 10);
        if (area.level < currentLevel) {
          while (area.level < currentLevel) {
            currentLevel--;
            parents.pop();
          }
          parents.push(area['Region/economy']);
        } else if (area.level >= currentLevel && area.type !== 'country') {
          parents.push(area['Region/economy']);
        }
        currentLevel = area.level;
        return {
          area_type: area.type,
          data: allYears.map(year => parseFloat(area[year])),
          level: area.level,
          name: area['Region/economy'],
          parents: [...parents],
          showInLegend: area['Region/economy'] === 'World',
          visible: area['Region/economy'] === 'World'
        };
      });
    });
    return json_data;
  }, []);

  // --- Load data ---
  useEffect(() => {
    loadFile(dataFile, false).then(json => {
      if (json) {
        json = JSON.parse(json);
        const cleaned = cleanData(json);
        setData(cleaned);
        setActiveData(cleaned[dataType]);
      }
    });
  }, [cleanData, dataType]);

  // --- Chart creation ---
  const toggleLegendItems = useCallback(() => {
    if (!chartRef.current) return;
    setLegend(chartRef.current.series.filter(s => s.visible));
  }, []);

  const createChart = useCallback(() => {
    chartRef.current = Highcharts.chart('fdiExplorer', {
      caption: {
        align: 'left',
        margin: 15,
        style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' },
        text: '<em>Source:</em> UN Trade and Development (UNCTAD), World investment report 2026<br /><em>Note:</em> The data includes financial transactions through European economies with high levels of conduit flows.',
        verticalAlign: 'bottom',
        x: 0
      },
      chart: {
        backgroundColor: 'transparent',
        events: {
          redraw() {
            this.series.forEach(s => {
              s.userOptions.showInLegend = s.visible;
              s.showInLegend = s.visible;
            });
          }
        },
        height: 440,
        marginTop: 40,
        resetZoomButton: {
          theme: {
            fill: '#fff',
            r: 0,
            states: { hover: { fill: '#009edb', stroke: 'transparent', style: { color: '#fff' } } },
            stroke: '#7c7067',
            style: { fontSize: 13, fontWeight: 400 }
          }
        },
        style: { color: '#7c7067', fontWeight: 400 },
        zoomType: 'x'
      },
      countryColors: countryColors,
      credits: { enabled: false },
      exporting: {
        buttons: {
          contextButton: {
            menuItems: ['viewFullscreen', 'separator', 'downloadPNG', 'downloadPDF', 'separator', 'downloadCSV'],
            symbol: 'download',
            symbolFill: '#000',
            text: ''
          }
        },
        chartOptions: {
          caption: {
            align: 'left',
            margin: 15,
            style: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' },
            text: '<em>Source:</em> UN Trade and Development (UNCTAD), World investment report 2025<br /><em>Note:</em> The data includes financial transactions through European economies with high levels of conduit flows.',
            verticalAlign: 'bottom',
            x: 0
          },
          chart: {
            events: {
              load() {
                this.renderer.image('https://static.dwcdn.net/custom/themes/unctad-2024-rebrand/Blue%20arrow.svg', 15, 15, 44, 43.88).add();
              }
            },
            height: 600,
            marginTop: null
          },
          legend: { enabled: false },
          subtitle: {
            align: 'left',
            enabled: true,
            style: { color: 'rgba(0, 0, 0, 0.8)', fontSize: '16px', fontWeight: 400, lineHeight: '18px' },
            text: 'By selected region or economy in selected time period',
            widthAdjust: -120,
            x: 64
          },
          title: {
            align: 'left',
            margin: 100,
            style: { color: '#000', fontSize: '30px', fontWeight: 700, lineHeight: '34px' },
            text: 'Foreign direct investment flows',
            widthAdjust: -120,
            x: 64
          }
        },
        filename: 'unctad_world_investment_report_selected_fdi_flows'
      },
      legend: {
        align: 'left',
        enabled: false,
        itemStyle: { color: '#000', cursor: 'default', fontSize: '14px', fontWeight: 400 },
        layout: 'horizontal',
        margin: 0,
        verticalAlign: 'bottom'
      },
      title: { text: null },
      tooltip: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
        borderRadius: 0,
        borderWidth: 1,
        crosshairs: true,
        formatter() {
          const values = this.points.map(p => [p.series.name, p.y, p.color]).sort((a, b) => b[1] - a[1]);
          const rows = values.map(p => `<div style="color: ${p[2]}"><span class="tooltip_label">${p[0]}:</span> <span class="tooltip_value">${formatNr({ separator: ' ', x: roundNr({ d: 0, x: p[1] }) })}</span></div>`).join('');
          return `<div class="tooltip_container"><h4 class="tooltip_header">Year ${this.x}</h4>${rows}</div>`;
        },
        shadow: false,
        shared: true,
        style: { color: '#7c7067', fontSize: 13, fontWeight: 400 },
        useHTML: true
      },
      plotOptions: {
        line: {
          cursor: 'pointer',
          lineWidth: 4,
          marker: {
            enabled: true,
            radius: 0,
            states: { hover: { animation: false, enabled: true, radius: 6 } },
            symbol: 'circle'
          },
          pointStart: startYear,
          states: { hover: { enabled: true, halo: { size: 0 }, lineWidth: 4 } }
        }
      },
      responsive: {
        rules: [{ chartOptions: { legend: { align: 'center', layout: 'horizontal', verticalAlign: 'bottom' } }, condition: { maxWidth: 500 } }]
      },
      series: activeData,
      xAxis: {
        endOnTick: false,
        gridLineColor: '#555',
        gridLineDashStyle: 'shortdot',
        gridLineWidth: 0,
        labels: { distance: 10, padding: 0, rotation: 0, style: { color: '#fff', fontSize: '14px', fontWeight: 400 } },
        lineColor: '#666',
        lineWidth: 1,
        opposite: false,
        plotLines: [],
        showFirstLabel: true,
        showLastLabel: true,
        startOnTick: false,
        title: { enabled: false }
      },
      yAxis: {
        endOnTick: false,
        gridLineColor: '#555',
        gridLineDashStyle: 'shortdot',
        gridLineWidth: 1,
        labels: { distance: 10, padding: 0, rotation: 0, style: { color: '#fff', fontSize: '14px', fontWeight: 400 } },
        lineColor: '#666',
        lineWidth: 1,
        opposite: false,
        plotLines: [],
        showFirstLabel: true,
        showLastLabel: true,
        startOnTick: false,
        title: { enabled: false },
        type: 'linear'
      }
    });
  }, [activeData]);

  useEffect(() => {
    if (activeData.length > 0 && !chartRef.current) {
      createChart();
      toggleLegendItems();
    }
  }, [activeData, createChart, toggleLegendItems]);

  // --- Data type change ---
  useEffect(() => {
    if (!data || !chartRef.current) return;
    const newData = data[dataType].map(el => ({
      ...el,
      showInLegend: selected[el.name] === true,
      visible: selected[el.name] === true
    }));
    setActiveData(newData);
    while (chartRef.current.series.length > 0) {
      chartRef.current.series[0].remove(false);
    }
    for (const el of newData) {
      chartRef.current.addSeries(el, false);
    }
    toggleLegendItems();
    chartRef.current.redraw();
  }, [data, dataType, selected, toggleLegendItems]);

  // --- Toggle series ---
  const chooseActiveData = useCallback(
    area => {
      if (!chartRef.current) return;
      chartRef.current.series.forEach((serie, i) => {
        if (serie.name === area.name) {
          chartRef.current.series[i].setVisible(!selected[area.name], false);
        }
      });
      setSelected(prev => ({ ...prev, [area.name]: !prev[area.name] }));
      toggleLegendItems();
      chartRef.current.redraw();
    },
    [selected, toggleLegendItems]
  );

  // --- Data type buttons ---
  const changeDataType = useCallback(type => {
    setDataType(type);
  }, []);

  // --- Search ---
  const search = useCallback(
    event => {
      const query = event.target.value.toLowerCase();
      const visibleTmp = {};
      activeData.forEach(area => {
        if (!query) {
          visibleTmp[area.name] = true;
        } else if (area.name.toLowerCase().includes(query)) {
          visibleTmp[area.name] = true;
          area.parents.forEach(parent => {
            visibleTmp[parent] = true;
          });
        } else {
          visibleTmp[area.name] = false;
        }
      });
      setVisible(visibleTmp);
    },
    [activeData]
  );

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const screenProgress = scrollProgress * 3;
  const isInteractive = screenProgress >= 2;

  return (
    <figure className="container_chart_fdi_explorer_wrapper" ref={containerRef} style={{ height: `${300 + introTexts.length * 50}vh` }}>
      {/* Scrolly texts in normal flow, sit above the sticky vis */}
      <div className="fdi_scrolly_texts">
        {introTexts.map(text => (
          <div key={text} className="fdi_scrolly_text">
            <p>{text}</p>
          </div>
        ))}
      </div>

      {/* Dimming overlay */}
      {/* Sticky visualisation */}
      <div className="container_chart_fdi_explorer" style={{ opacity: isInteractive ? 1 : 0.1, pointerEvents: isInteractive ? 'all' : 'none', transition: 'opacity 0.9s ease' }}>
        <div className="layout">
          <div className="left_container">
            <div className="name_container">
              <h4>Foreign Direct Investments (FDI)</h4>
            </div>
            <div className="country_selection_container">
              <h5>Select an economy or region</h5>
              <div className="search_container">
                <input type="text" placeholder="Type to search" onChange={search} />
              </div>
              <ul className="selection_list">
                {activeData.map((area, i) => (
                  <li key={area.name} style={{ marginLeft: `${(area.level - 1) * 7}px` }}>
                    <label
                      aria-label={`Toggle ${area.name} in the chart`}
                      htmlFor={`country_${i}`}
                      style={{
                        display: visible[area.name] === false ? 'none' : 'block',
                        fontWeight: area.area_type === 'region' ? 700 : 400
                      }}
                      title={`Toggle ${area.name} in the chart`}
                    >
                      <span className="input_container">
                        <input checked={selected[area.name] === true} id={`country_${i}`} onChange={() => chooseActiveData(area)} type="checkbox" value={area.name} />
                      </span>
                      <span className="label_container">{area.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="right_container">
            <div className="title_container">
              <h4>By region and economy, thousands of dollars, 1990–2024</h4>
              <div className="options_container">
                <span className="button_container">
                  <button aria-label="Select FDI inflows dataset" className={`data_type${dataType === 'fdi_inflows' ? ' selected' : ''}`} onClick={() => changeDataType('fdi_inflows')} title="Select FDI inflows dataset" type="button">
                    Inflows
                  </button>
                </span>
                <span className="button_container">
                  <button aria-label="Select FDI outflows dataset" className={`data_type${dataType === 'fdi_outflows' ? ' selected' : ''}`} onClick={() => changeDataType('fdi_outflows')} title="Select FDI outflows dataset" type="button">
                    Outflows
                  </button>
                </span>
              </div>
            </div>
            <div className="chart_container">
              <div className="info" style={{ display: selectedCount > 0 ? 'none' : 'flex' }}>
                <h4>Select at least one economy or region from the left</h4>
              </div>
              <div className="highchart_container" id="fdiExplorer" style={{ display: selectedCount > 0 ? 'block' : 'none' }} />
              <div className="legend_container">
                {legend.map(item => (
                  <button key={item.name} aria-label={`Remove ${item.name} from the chart`} className="legend_button" onClick={() => chooseActiveData(item)} style={{ color: item.color }} title={`Remove ${item.name} from the chart`} type="button">
                    <LegendIcon color={item.color} symbol={item.symbol} />
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
};

export default ChartFDIExplorer;
