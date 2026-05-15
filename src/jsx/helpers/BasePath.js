const basePath = () => {
  const { href } = window.location;
  if (href.includes('unctad.org')) return 'https://storage.unctad.org/2026-wir_report/';
  if (href.includes('localhost')) return './';
  return 'https://unctad-infovis.github.io/2026-wir_report/';
};

export default basePath;
