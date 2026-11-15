const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');

const root = path.join(__dirname, 'dist');
const prefix = '/york-ai-atlas/';
const files = fs.readdirSync(root);
const mime = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.csv': 'text/csv'
};
const server = http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const name = pathname === prefix ? 'index.html' : pathname.slice(prefix.length);
  if (!pathname.startsWith(prefix) || !files.includes(name)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': `${mime[path.extname(name)] || 'text/plain'}; charset=utf-8`
  });
  response.end(fs.readFileSync(path.join(root, name)));
});

async function main() {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const base = `http://127.0.0.1:${server.address().port}${prefix}`;
  let dom;
  try {
    for (const file of files) {
      const response = await fetch(base + file);
      assert.equal(response.status, 200, file);
      assert.equal((await response.arrayBuffer()).byteLength, fs.statSync(path.join(root, file)).size, file);
    }
    console.log('PASS Every staged Pages asset and download is served beneath the repository subpath');
    const errors = [];
    const virtualConsole = new VirtualConsole();
    virtualConsole.on('jsdomError', error => errors.push(error.message));
    dom = await JSDOM.fromURL(base + '#view=needs&need=permission-default-when-syllabus-silent', {
      resources: 'usable',
      runScripts: 'dangerously',
      pretendToBeVisual: true,
      virtualConsole,
      beforeParse(window) {
        window.HTMLElement.prototype.scrollIntoView = function () {};
      }
    });
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Hosted atlas load timed out')), 15000);
      const loaded = () => { clearTimeout(timer); resolve(); };
      if (dom.window.document.readyState === 'complete') loaded();
      else dom.window.addEventListener('load', loaded, { once: true });
    });
    const document = dom.window.document;
    assert.deepEqual(errors, [], 'Hosted page runtime errors');
    const data = JSON.parse(fs.readFileSync(path.join(root, 'audit-data.json'), 'utf8'));
    assert.equal(document.querySelectorAll('#resource-list .resource-card').length, data.records.length);
    assert.equal(document.querySelectorAll('#need-list details.atomic').length, data.atomicNeeds.length);
    assert.equal(document.querySelectorAll('#need-list .job-group').length, data.jobs.filter(j => j.needIds.length).length);
    assert.equal(document.getElementById('needs').hidden, false);
    assert.ok(document.querySelector('#need-permission-default-when-syllabus-silent').open);
    assert.ok(document.querySelector('#need-permission-default-when-syllabus-silent .callout.warning'));
    assert.equal(document.activeElement.closest('details').id, 'need-permission-default-when-syllabus-silent');
    console.log('PASS Hosted assets initialise the complete atlas and restore need deep links');
    for (const element of document.querySelectorAll('a[href], link[href], script[src]')) {
      const raw = element.getAttribute('href') || element.getAttribute('src');
      if (/^(?:https?:|#|blob:)/.test(raw)) continue;
      const url = new URL(raw, base);
      assert.ok(url.pathname.startsWith(prefix), raw);
      assert.equal((await fetch(url)).status, 200, raw);
    }
    console.log('PASS Rendered download and companion links resolve under project Pages');
  } finally {
    dom?.window.close();
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
