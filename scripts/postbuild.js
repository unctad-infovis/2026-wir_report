const fs = require('node:fs');
const crypto = require('node:crypto');

// Fix HTML: convert absolute paths to relative so the site works at any subpath
for (const p of ['dist/index.html', 'dist/fdi-explorer.html']) {
  const html = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(
    p,
    html.replace(/href="\/(?!\/)/g, 'href="./').replace(/src="\/(?!\/)/g, 'src="./'),
  );
}

// Add content hash to styles.js import in fdi-explorer entry so CDN cache busts automatically
const stylesContent = fs.readFileSync('dist/js/2026-wir_report.styles.js');
const stylesHash = crypto.createHash('md5').update(stylesContent).digest('hex').slice(0, 8);
const entryPath = 'dist/js/2026-wir_report.fdi-explorer.min.js';
fs.writeFileSync(
  entryPath,
  fs.readFileSync(entryPath, 'utf8').replace(
    /2026-wir_report\.styles\.js(?:\?[^"']*)?/g,
    `2026-wir_report.styles.js?v=${stylesHash}`,
  ),
);

// Fix CSS: convert absolute asset URLs to relative so they resolve correctly at subpaths
// (e.g. url('/assets/img/x.png') → url('../assets/img/x.png') since CSS lives in dist/css/)
for (const p of fs.readdirSync('dist/css').map(f => `dist/css/${f}`)) {
  const css = fs.readFileSync(p, 'utf8');
  const fixed = css.replace(/url\(['"]?\/assets\//g, match =>
    match.replace('/assets/', '../assets/'),
  );
  fs.writeFileSync(p, fixed);
}
