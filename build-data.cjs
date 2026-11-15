const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { rows, findings, blueprint } = require('./curation.cjs');
const { buildNeeds, coverageOrder } = require('./needs.cjs');
const root = __dirname;
const source = JSON.parse(fs.readFileSync(path.join(root, 'sources.json'), 'utf8'));
const pdfs = JSON.parse(fs.readFileSync(path.join(root, 'pdf-evidence.json'), 'utf8'));
const pdfByUrl = new Map(pdfs.map(p => [p.url, p]));
const normalizeText = s => (s || '').replace(/\s+/g, ' ').trim();
function urlKey(raw) {
  const u = new URL(raw);
  u.hash = '';
  u.hostname = u.hostname.toLowerCase();
  u.pathname = u.pathname.replace(/\/+$/, '') || '/';
  if (u.hostname === 'www.yorku.ca') u.pathname = u.pathname.toLowerCase();
  u.searchParams.sort();
  return u.href;
}
function excerpt(text, term = '', length = 440) {
  const t = normalizeText(text);
  let start = term ? t.toLowerCase().indexOf(term.toLowerCase()) : 0;
  if (start < 0) throw new Error(`Evidence term not found: ${term}`);
  start = Math.max(0, start - 65);
  return (start ? '...' : '') + t.slice(start, start + length) + (t.length > start + length ? '...' : '');
}
function publishingFamily(url) {
  const u = new URL(url), p = u.pathname.toLowerCase(), h = u.hostname;
  if (/library|researchguides|spark/.test(h)) return 'Libraries';
  if (/schulich/.test(h)) return 'Schulich';
  if (/continue/.test(h)) return 'Continuing Studies';
  if (/lassonde|responsibleai|eecs/.test(h)) return 'Lassonde / EECS';
  if (/osgoode/.test(h) || p.includes('/osgoode/')) return 'Osgoode';
  if (/students\./.test(h)) return 'Student Services';
  if (/lthelp/.test(h)) return 'Learning Technology Services';
  if (/yulearn/.test(h)) return 'HR / YU Learn';
  if (p.includes('/teachingcommons/')) return 'Teaching Commons';
  if (p.includes('/teachingandlearning/')) return 'Teaching & Learning';
  if (p.includes('/unit/vpacad/academic-integrity/')) return 'Academic integrity office';
  if (p.includes('/secretariat/')) return 'Secretariat / policy authority';
  if (p.includes('/laps/')) return 'LA&PS';
  if (p.includes('/research/connected-minds/')) return 'Connected Minds';
  if (p.includes('/research/')) return 'Research & Innovation';
  if (p.includes('/uit/')) return 'UIT';
  if (/futurestudents/.test(h)) return 'Graduate Admissions';
  if (p.includes('/yfile/')) return 'YFile / Communications';
  return 'Central AI hub';
}
const supplemental = {
  url: 'https://students.yorku.ca/savy-gpt',
  method: 'Alternate web_fetch retrieval; source excerpt retained',
  text: 'SAVY: Smarter Than Ever with GPT! About SAVY. SAVY now uses GPT-4, a Generative AI. SAVY serves as your first point of contact and is designed to provide relevant and personalized answers to questions, and help you make informed decisions over the course of your academic journey at York. SAVY uses artificial intelligence to communicate with current undergraduate students through a chat interface. SAVY was built to provide general information but does not provide the same service as the staff in advising centres. All undergraduate students, and students attending Osgoode Hall Law School, have access to SAVY. SAVY uses multiple in-house (on York campuses) servers to ensure robust data protection and maintain personal information privacy. While SAVY uses Microsoft GPT to help generate responses, the data you provide stays with SAVY. SAVY doesn\'t share your information with Microsoft or any other third parties.'
};
const excluded = [];
const grouped = new Map();
for (const raw of source.pages) {
  const p = { ...raw };
  if (/ezproxy|\/ezproxy\//i.test(p.url) || /registerOffering|forms\/view/i.test(p.url)) {
    excluded.push({ url: p.url, reason: /ezproxy/i.test(p.url) ? 'Externally authored proxied publication/login, outside York-authored content scope' : 'Transactional registration or form endpoint, not an AI information page', status: p.status || null });
    continue;
  }
  const pdf = pdfByUrl.get(p.url);
  if (pdf?.text) { p.text = pdf.text; delete p.error; p.pdfPages = pdf.pageCount; }
  if (/About York.s WordPress Service/i.test(p.title || '')) p.error = 'Wrong destination: generic WordPress service page';
  if (/^Protected:|Please Login|Passport York Login/i.test(p.title || '')) p.error = 'Password or authentication landing page; destination content not inspected';
  if (p.url === supplemental.url) { p.text = supplemental.text; p.alternate = supplemental.method; p.collectorError = p.error; delete p.error; }
  const key = p.error ? urlKey(p.url) : urlKey(p.finalUrl || p.url);
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(p);
}
const records = [];
const texts = new Map();
const curationsUsed = new Set();
for (const [groupKey, attempts] of grouped) {
  const p = attempts.find(p => p.text && !p.error) || attempts[0];
  const variants = [...new Set(attempts.flatMap(p => [p.url, p.finalUrl]).filter(Boolean))];
  const c = rows.find(c => variants.some(u => urlKey(u) === urlKey(c.url)));
  if (c) curationsUsed.add(c.key);
  let title = c?.title || p.title || decodeURIComponent(new URL(p.url).pathname.split('/').filter(Boolean).pop() || new URL(p.url).hostname);
  if (!c && p.kind === 'PDF') title = title.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
  const owner = publishingFamily(c?.url || p.url);
  const isNews = /\/(?:yfile|news|20\d\d\/\d\d\/\d\d)\//.test(p.url);
  const pdfTraining = p.kind === 'PDF' && owner === 'Teaching Commons';
  const isFrench = new URL(p.url).searchParams.get('l') === 'fr';
  let topics = c?.topics || (owner === 'Libraries' ? ['AI literacy','Research discovery'] : owner === 'Teaching Commons' ? ['Teaching','Training'] : /connected-minds/.test(p.url) ? ['Research discovery', /award|scholar|fellowship|funding|opportunit/.test(p.url) ? 'Funding' : 'Research impact'] : isNews ? ['News','Research impact'] : ['Research discovery']);
  if (isFrench) topics = [...topics, 'French-language route'];
  const status = p.error ? (p.status === 404 ? 'HTTP 404' : p.status >= 400 ? `HTTP ${p.status}` : /Password|authentication/i.test(p.error) ? 'Protected destination' : /Wrong destination/i.test(p.error) ? 'Wrong destination' : 'Transport failure') : p.alternate ? 'Verified alternate fetch' : c ? 'Analyst-curated source' : 'Extracted / needs triage';
  const summary = c?.summary || (p.error ? `Retrieval did not establish the intended content: ${p.error}. Treat this as an unverified lead, not as confirmed guidance.` : `${pdfTraining ? 'Teaching development download. ' : isNews ? 'Dated news or editorial content. ' : ''}Extracted lead (not analyst-validated): ${normalizeText(p.description || p.text || title).slice(0, 285)}${normalizeText(p.description || p.text || title).length > 285 ? '...' : ''}`);
  const id = c?.key || `resource-${crypto.createHash('sha256').update(groupKey).digest('hex').slice(0, 10)}`;
  let quote = '';
  if (p.text && !p.error) quote = excerpt(p.text, c?.term || '');
  const record = {
    id, title, url: c?.url || p.url, finalUrl: p.finalUrl || p.url, declaredCanonical: p.canonical || '',
    variants, domain: new URL(c?.url || p.url).hostname, owner, topics,
    audience: c?.audience || (owner === 'Teaching Commons' ? ['Instructors'] : /connected-minds/.test(p.url) ? ['Researchers','Graduate researchers'] : owner === 'Libraries' ? ['Students','Researchers'] : ['Everyone']),
    summary, addresses: c?.addresses || (p.headings?.length ? `Source sections: ${p.headings.slice(0, 5).join('; ')}` : `Supporting ${p.kind === 'PDF' ? 'document' : 'resource'}; purpose and relevance need owner/analyst confirmation.`),
    action: c?.action || (p.error ? 'Verify' : isNews ? 'Aggregate' : 'Triage'),
    priority: c?.priority ?? (p.error ? 2 : 3),
    target: c?.target || (isNews ? 'AI @ York / Research & impact / Tagged news' : pdfTraining ? 'AI @ York / Learn & get help / Teaching resources' : 'Pending content-owner triage'),
    recommendation: c?.note || (isNews ? 'Keep the original dated publication; aggregate by topic and link to a live service or research record where relevant. Do not treat a story as current policy.' : 'Extracted discovery record only. Confirm substantive relevance, audience, owner, freshness and the best canonical destination before migration.'),
    evidence: status, curated: !!c, excerpt: quote, kind: p.kind || 'Unverified', http: p.status || null,
    retrievalNote: p.alternate ? `${p.collectorError}; ${p.alternate}` : p.error || (p.kind === 'PDF' ? `PDF text extracted${p.pdfPages ? ` (${p.pdfPages} pages)` : ''}; visual/layout semantics were not checked.` : 'HTML main content extracted; no authenticated or interactive content inspected.'),
    checkedAt: p.checkedAt, modifiedMetadata: p.modified || '', language: isFrench ? 'French-language URL; confirm translation parity' : 'English / not systematically language-audited',
    from: p.from, inlinks: [], outlinks: [], hops: null, clusters: findings.filter(f => f.keys.includes(id)).map(f => f.id)
  };
  records.push(record);
  texts.set(id, p.text || '');
}
for (const c of rows) if (!curationsUsed.has(c.key)) throw new Error(`Curated source missing: ${c.key} ${c.url}`);
const byId = new Map(records.map(r => [r.id, r]));
const byUrl = new Map();
for (const r of records) for (const u of r.variants.concat(r.url)) byUrl.set(urlKey(u), r.id);
// The two home-page aliases were observed in the LibGuides navigation/metadata.
byUrl.set(urlKey('https://researchguides.library.yorku.ca/c.php?g=740624&p=5345762'), 'library-genai');
byUrl.set(urlKey('https://researchguides.library.yorku.ca/c.php?g=731512&p=5254595'), 'library-ai');
const edges = new Map();
for (const p of source.pages) {
  const from = byUrl.get(urlKey(p.url));
  if (!from) continue;
  for (const link of p.links || []) {
    const to = byUrl.get(urlKey(link.url));
    if (!to || from === to) continue;
    edges.set(`${from}=>${to}`, { from, to, text: link.text, observedOn: p.url, kind: 'Extracted main content / Library section navigation' });
  }
}
// Home-guide sidebar links were observed separately during targeted navigation discovery.
for (const r of records) {
  const u = new URL(r.url);
  const g = u.searchParams.get('g');
  if (g === '740624' || g === '731512') {
    const from = g === '740624' ? 'library-genai' : 'library-ai';
    if (r.id !== from) edges.set(`${from}=>${r.id}`, { from, to:r.id, text:r.title, observedOn:byId.get(from).url, kind:'Observed Library sidebar navigation (targeted discovery)' });
  }
}
for (const e of edges.values()) {
  byId.get(e.from).outlinks.push(e.to);
  byId.get(e.to).inlinks.push(e.from);
}
byId.get('hub').hops = 0;
const bfs = ['hub'];
while (bfs.length) {
  const current = byId.get(bfs.shift());
  for (const id of current.outlinks) {
    const next = byId.get(id);
    if (next.hops === null) { next.hops = current.hops + 1; bfs.push(id); }
  }
}
const exactGroups = new Map();
for (const r of records) {
  const t = normalizeText(texts.get(r.id));
  if (t.length < 300 || /failure|404|Protected destination|Wrong destination/.test(r.evidence)) continue;
  const hash = crypto.createHash('sha256').update(t).digest('hex');
  if (!exactGroups.has(hash)) exactGroups.set(hash, []);
  exactGroups.get(hash).push(r.id);
}
const exactDuplicates = [...exactGroups.entries()].filter(([, ids]) => ids.length > 1).map(([hash, ids]) => ({ hash, ids, basis:'SHA-256 equality of whitespace-normalised extracted text, not binary/layout equality' }));
for (const f of findings) {
  for (const key of f.keys) if (!byId.has(key)) throw new Error(`Unknown finding member ${key}`);
  f.quotes = f.evidence.map(([id, term]) => ({ id, text: excerpt(texts.get(id), term, 390) }));
  delete f.evidence;
}
for (const b of blueprint) for (const id of b.source) if (!byId.has(id)) throw new Error(`Unknown blueprint source ${id}`);
const needs = buildNeeds(records, texts);
for (const n of needs) {
  const section = blueprint.find(b=>b.id===n.section);
  if(!section) throw new Error('Unknown proposed section for need: '+n.id);
  n.proposedHome = 'AI @ York / '+section.title;
}
for (const r of records) r.needIds = needs.filter(n=>n.mappings.some(m=>m.resourceId===r.id)).map(n=>n.id);
const unvisited = source.discovered.filter(l => !source.pages.some(p => urlKey(p.url) === urlKey(l.url))).map(l => ({ ...l, reason: 'Discovered but not retrieved within bounded crawl and targeted follow-up' }));
const date = source.collectedAt.slice(0,10);
const data = {
  meta:{ title:'York AI Atlas', date, collectedAt:source.collectedAt, attemptedUrls:source.pages.length, inventoryRecords:records.length, curatedRecords:records.filter(r=>r.curated).length, extractedRecords:records.filter(r=>!r.curated).length, reachableRecords:records.filter(r=>r.excerpt).length, ownerFamilies:new Set(records.map(r=>r.owner)).size, hostnames:new Set(records.map(r=>r.domain)).size, criticalClusters:findings.filter(f=>f.severity==='Critical').length, observedEdges:edges.size, excludedEndpoints:excluded.length, unvisitedLeads:unvisited.length, pdfsExtracted:pdfs.filter(p=>p.text).length },
  records, findings, blueprint, needs, needCoverageOrder:coverageOrder,
  needsMeta:{
    analysedAt:new Date().toISOString(), total:needs.length,
    coverageCounts:Object.fromEntries(coverageOrder.map(status=>[status,needs.filter(n=>n.coverage===status).length])),
    multipleDirect:needs.filter(n=>n.directCount>1).length,
    mappings:needs.reduce((sum,n)=>sum+n.mappings.length,0),
    mappedResources:records.filter(r=>r.needIds.length).length,
    unmappedResources:records.filter(r=>!r.needIds.length).length
  },
  edges:[...edges.values()], exactDuplicates, unvisited, excluded
};
fs.writeFileSync(path.join(root, 'audit-data.json'), JSON.stringify(data, null, 2));
fs.writeFileSync(path.join(root, 'data.js'), `window.YORK_AI_AUDIT = ${JSON.stringify(data).replace(/</g,'\\u003c')};\n`);
const fields = ['id','title','url','finalUrl','domain','owner','summary','addresses','topics','audience','action','priority','target','recommendation','evidence','curated','kind','http','checkedAt','hops','clusters','needIds','excerpt'];
const csv = value => {
  let text = String(Array.isArray(value) ? value.join(' | ') : value ?? '');
  if(/^[=+\-@\t\r]/.test(text)) text="'"+text;
  return '"' + text.replace(/"/g,'""') + '"';
};
fs.writeFileSync(path.join(root, 'inventory.csv'), '\ufeff' + [fields.join(','),...records.map(r=>fields.map(k=>csv(r[k])).join(','))].join('\r\n'));
fs.writeFileSync(path.join(root, 'discovery-backlog.csv'), '\ufeffurl,title_or_link_label,found_on,reason\r\n' + unvisited.map(r=>[r.url,r.text,r.from,r.reason].map(csv).join(',')).join('\r\n'));
fs.writeFileSync(path.join(root, 'supplemental-evidence.json'), JSON.stringify(supplemental,null,2));
const needFields=['id','title','statement','audience','category','success','coverage','basis','validation','assessment','directCount','contentCount','proposedHome','owner','action','priority'];
fs.writeFileSync(path.join(root,'needs-catalogue.csv'),'\ufeff'+[needFields.join(','),...needs.map(n=>needFields.map(k=>csv(n[k])).join(','))].join('\r\n'));
const mappingFields=['need_id','need_title','coverage','resource_id','resource_title','url','role','rationale','evidence_status','quote'];
const mappingRows=needs.flatMap(n=>n.mappings.map(m=>{const r=byId.get(m.resourceId);return [n.id,n.title,n.coverage,r.id,r.title,r.url,m.role,m.rationale,r.evidence,m.quote].map(csv).join(',');}));
fs.writeFileSync(path.join(root,'need-content-map.csv'),'\ufeff'+[mappingFields.join(','),...mappingRows].join('\r\n'));
console.log(JSON.stringify(data.meta,null,2));
console.log('Needs catalogue:', JSON.stringify(data.needsMeta,null,2));
console.log('Exact extracted-text groups:', exactDuplicates.map(g=>g.ids));
