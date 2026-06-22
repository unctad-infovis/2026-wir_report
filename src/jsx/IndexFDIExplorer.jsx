import { createRoot } from 'react-dom/client';

import ChartFDIExplorer from './components/ChartFDIExplorer.jsx';
import './../styles/styles.css';

const container = document.getElementById('app-root-2026-wir_report');
const root = createRoot(container);
root.render(
  <div className="app">
    <ChartFDIExplorer standalone />
  </div>
);
