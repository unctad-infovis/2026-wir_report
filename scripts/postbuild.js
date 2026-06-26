const fs = require('node:fs');

// Fix HTML: convert absolute paths to relative so the site works at any subpath
for (const p of ['dist/index.html', 'dist/fdi-explorer.html']) {
  const html = fs.readFileSync(p, 'utf8');
  fs.writeFileSync(
    p,
    html.replace(/href="\/(?!\/)/g, 'href="./').replace(/src="\/(?!\/)/g, 'src="./'),
  );
}

// Fix CSS: convert absolute asset URLs to relative so they resolve correctly at subpaths
// (e.g. url('/assets/img/x.png') → url('../assets/img/x.png') since CSS lives in dist/css/)
for (const p of fs.readdirSync('dist/css').map(f => `dist/css/${f}`)) {
  const css = fs.readFileSync(p, 'utf8');
  const fixed = css.replace(/url\(['"]?\/assets\//g, match =>
    match.replace('/assets/', '../assets/'),
  );
  fs.writeFileSync(p, fixed);
}
