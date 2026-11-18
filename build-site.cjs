const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

const root = __dirname;
const output = path.join(root, 'dist');
const files = [
  'index.html', 'styles.css', 'app.js', 'data.js', 'York-AI-Atlas.html',
  'briefing.html', 'inventory.csv', 'needs-catalogue.csv',
  'need-content-map.csv', 'discovery-backlog.csv', 'audit-data.json',
  'sources.json', 'pdf-evidence.json', 'supplemental-evidence.json',
  'atomic-needs.csv', 'atomic-need-content-map.csv', 'peer-evidence.csv',
  'need-jobs.csv', 'atomic-needs.json', 'needs-sources.json'
];

fs.mkdirSync(output, { recursive: true });
for (const name of fs.readdirSync(output)) {
  if (/^(?:app|data)\.[a-f0-9]{12}\.js$|^styles\.[a-f0-9]{12}\.css$/.test(name)) {
    fs.unlinkSync(path.join(output, name));
  }
}
for (const name of files) {
  fs.copyFileSync(path.join(root, name), path.join(output, name));
}
const published = [...files];
let index = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
// Keep unversioned files for cached HTML; new pages use content-hashed assets.
for (const name of ['styles.css', 'data.js', 'app.js']) {
  const content = fs.readFileSync(path.join(output, name));
  const version = createHash('sha256').update(content).digest('hex').slice(0, 12);
  const extension = path.extname(name);
  const versioned = `${path.basename(name, extension)}.${version}${extension}`;
  fs.writeFileSync(path.join(output, versioned), content);
  index = index.replace(`"${name}"`, `"${versioned}"`);
  published.push(versioned);
}
fs.writeFileSync(path.join(output, 'index.html'), index);
fs.writeFileSync(path.join(output, '.nojekyll'), '');

const data = JSON.parse(fs.readFileSync(path.join(output, 'audit-data.json'), 'utf8'));
const css = fs.readFileSync(path.join(output, 'styles.css'), 'utf8');
assert.ok(data.records.length && data.needs.length && data.atomicNeeds.length && data.jobs.length, 'Missing atlas content');
assert.ok(css.includes('--york-red:#E31837'), 'Missing York red');
assert.ok(!index.includes('brand-mark'), 'No logo or monogram should be published');
for (const file of published) {
  assert.ok(fs.statSync(path.join(output, file)).size > 0, `Empty published file: ${file}`);
}
for (const html of ['index.html', 'briefing.html', 'York-AI-Atlas.html']) {
  const content = fs.readFileSync(path.join(output, html), 'utf8');
  const dom = new JSDOM(content);
  for (const element of dom.window.document.querySelectorAll('[href], [src]')) {
    const url = element.getAttribute('href') || element.getAttribute('src');
    if (/^(?:https?:|#|data:|blob:)/.test(url)) continue;
    assert.ok(!url.startsWith('/'), `Project Pages requires relative paths: ${url}`);
    assert.ok(published.includes(url), `Unpublished local dependency: ${url}`);
  }
  dom.window.close();
}
assert.deepEqual(fs.readdirSync(output).sort(), [...published, '.nojekyll'].sort(), 'Unexpected files in the Pages artifact');
console.log(`Staged ${published.length} verified atlas files in dist for GitHub Pages.`);
