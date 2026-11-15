// Captures York pages found during the atomic-needs deep dive without altering the original crawl snapshot.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { retrieve } = require('./collect.cjs');
const root = __dirname;
const output = path.join(root, 'needs-sources.json');
const urls = JSON.parse(fs.readFileSync(path.join(root, 'needs-urls.json'), 'utf8'));
const existing = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : { pages: [] };
const pages = existing.pages.filter(p => urls.includes(p.url));
const done = new Set(pages.filter(p => p.text && !p.error).map(p => p.url));
const pdfScript = `
import io, json, sys, urllib.request
from pypdf import PdfReader
req = urllib.request.Request(sys.argv[1], headers={"User-Agent": "YorkAIContentAudit/1.0"})
data = urllib.request.urlopen(req, timeout=25).read(20_000_000)
reader = PdfReader(io.BytesIO(data))
print(json.dumps({"pageCount": len(reader.pages), "text": "\\n\\n".join(p.extract_text() or "" for p in reader.pages)[:150000]}))
`;
async function main() {
  for (const url of urls) {
    if (done.has(url)) continue;
    const record = await retrieve({ url, depth: 3, from: 'Atomic-needs York-wide verification search' });
    if (record.kind === 'PDF') {
      try {
        const pdf = JSON.parse(execFileSync('python', ['-c', pdfScript, url], { encoding: 'utf8', maxBuffer: 50e6 }));
        Object.assign(record, pdf);
        delete record.error;
        if (!record.text.trim()) record.error = 'PDF has no extractable text';
      } catch (e) { record.error = `PDF extraction failed: ${e.message.split('\n')[0]}`; }
    }
    const index = pages.findIndex(p => p.url === url);
    if (index >= 0) pages[index] = record; else pages.push(record);
    console.log(`${record.status || 'ERR'} ${url} ${record.error || ''}`);
    fs.writeFileSync(output, JSON.stringify({ collectedAt: new Date().toISOString(), purpose: 'Evidence for atomic needs found by York-wide verification searches', pages }, null, 2));
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  console.log(`Needs evidence: ${pages.filter(p => p.text && !p.error).length}/${urls.length} pages with text.`);
}
main().catch(e => { console.error(e); process.exitCode = 1; });
