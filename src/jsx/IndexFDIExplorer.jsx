import { createRoot } from 'react-dom/client';

import ChartFDIExplorer from './components/ChartFDIExplorer.jsx';
import ChartHeader from './components/general/ChartHeader.jsx';
import '@unctad-infovis/general-tools/styles/styles.css';
// IndexFDIExplorer.css is imported via App.css (not here) so it lands in the shared build
// output rather than its own chunk — see the comment in App.css for why.
import './App.css';

const container = document.getElementById('app-root-2026-wir_report');
const root = createRoot(container);
root.render(
  <div className="app">
    <div className="fdi_explorer_standalone_page">
      <ChartHeader title="How have foreign direct investment flows changed over time?" subtitle="Explore FDI inflows and outflows by region and economy" large />
      <ChartFDIExplorer standalone />
    </div>
  </div>
);
