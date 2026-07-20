import { createRoot } from 'react-dom/client';

import ChartFDIExplorer from './components/ChartFDIExplorer.jsx';
import '@unctad-infovis/general-tools/styles/styles.css';
import './App.css';

const container = document.getElementById('app-root-2026-wir_report');
const root = createRoot(container);
root.render(
  <div className="app">
    <ChartFDIExplorer standalone />
  </div>
);
