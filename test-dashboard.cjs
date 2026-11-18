const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM, VirtualConsole } = require('jsdom');
const root = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(root,'audit-data.json'),'utf8'));
const source = JSON.parse(fs.readFileSync(path.join(root,'sources.json'),'utf8'));
const pdf = JSON.parse(fs.readFileSync(path.join(root,'pdf-evidence.json'),'utf8'));
const supplemental = JSON.parse(fs.readFileSync(path.join(root,'supplemental-evidence.json'),'utf8'));
const norm = t => String(t || '').replace(/\s+/g,' ').trim();
const {buildNeeds}=require('./needs.cjs');
const texts=new Map(data.records.map(r=>[r.id,r.id==='savy'?supplemental.text:pdf.find(p=>r.variants.includes(p.url))?.text || source.pages.find(p=>r.variants.includes(p.url) && p.text)?.text || '']));
const tests = [];
function test(name, fn) { fn(); tests.push(name); console.log('PASS',name); }
test('Inventory IDs, URLs and graph references are unique and valid',()=>{
  assert.equal(new Set(data.records.map(r=>r.id)).size,data.records.length);
  const ids=new Set(data.records.map(r=>r.id));
  for(const r of data.records) {
    assert.ok(new URL(r.url).hostname.endsWith('yorku.ca'));
    assert.ok(r.summary && r.addresses && r.target && r.recommendation);
    for(const id of [...r.inlinks,...r.outlinks]) assert.ok(ids.has(id));
    if(/HTTP 404|HTTP 500|Transport failure|Protected destination|Wrong destination/.test(r.evidence)) assert.equal(r.excerpt,'');
    assert.ok(r.priority>=0 && r.priority<=3);
  }
  for(const e of data.edges) {assert.ok(ids.has(e.from));assert.ok(ids.has(e.to));assert.notEqual(e.from,e.to);}
});
test('Finding quotes are actual retrieved text, not invented claims',()=>{
  for(const f of data.findings) for(const q of f.quotes) {
    const r=data.records.find(r=>r.id===q.id);
    const candidates=[...source.pages.filter(p=>r.variants.includes(p.url)).map(p=>p.text),...pdf.filter(p=>r.variants.includes(p.url)).map(p=>p.text),q.id==='savy'?supplemental.text:''];
    const text=norm(q.text.replace(/^\.\.\./,'').replace(/\.\.\.$/,''));
    assert.ok(candidates.some(c=>norm(c).includes(text)),`${f.id}: ${q.id} quote not found`);
  }
});
test('Core hub graph reflects three direct branch links and valid shortest hops',()=>{
  const hub=data.records.find(r=>r.id==='hub');
  for(const id of ['teaching','research','operations']) {
    assert.ok(hub.outlinks.includes(id));assert.equal(data.records.find(r=>r.id===id).hops,1);
  }
  for(const r of data.records.filter(r=>r.hops!==null && r.hops>0)) {
    assert.ok(r.inlinks.some(id=>data.records.find(p=>p.id===id).hops===r.hops-1));
  }
});
test('Atomic needs have valid bidirectional many-to-many mappings and scoped gaps',()=>{
  assert.equal(new Set(data.needs.map(n=>n.id)).size,data.needs.length);
  assert.ok(data.needs.some(n=>n.directCount>1));
  assert.ok(data.records.some(r=>r.needIds.length>1));
  for(const n of data.needs) {
    assert.ok(n.statement && n.success && n.assessment && n.action && n.owner);
    assert.equal(n.directCount,n.mappings.filter(m=>m.role==='Direct answer').length);
    assert.equal(new Set(n.mappings.map(m=>m.resourceId)).size,n.mappings.length);
    for(const m of n.mappings) {
      const r=data.records.find(r=>r.id===m.resourceId);
      assert.ok(r.needIds.includes(n.id));assert.ok(m.rationale);
      if(m.role==='Direct answer') assert.ok(r.curated && r.excerpt);
      if(m.quote) assert.ok(norm(texts.get(r.id)).includes(norm(m.quote.replace(/^\.\.\./,'').replace(/\.\.\.$/,''))));
    }
    if(n.coverage==='Potential gap') {
      assert.equal(n.directCount,0);assert.equal(n.basis,'Hypothesised need');assert.ok(n.gapSearch.scopeIds.length && n.gapSearch.limitation);
      for(const result of n.gapSearch.results) {
        const expected=n.gapSearch.scopeIds.filter(id=>norm(texts.get(id)).toLowerCase().includes(result.term.toLowerCase()));
        assert.deepEqual(result.resourceIds,expected);
      }
    }
  }
  for(const r of data.records) for(const id of r.needIds) assert.ok(data.needs.find(n=>n.id===id).mappings.some(m=>m.resourceId===r.id));
});
test('Need validation rejects false coverage, unavailable direct answers and false gaps',()=>{
  const definition=n=>({...n,sources:n.mappings.map(m=>[m.resourceId,m.role,m.rationale])});
  const addressed=definition(data.needs.find(n=>n.coverage==='Addressed'));
  assert.throws(()=>buildNeeds(data.records,texts,[{...addressed,sources:addressed.sources.map(([id,,why])=>[id,'Supporting context',why])}]),/no verified direct answer/);
  assert.throws(()=>buildNeeds(data.records.map(r=>r.id===addressed.sources[0][0]?{...r,excerpt:''}:r),texts,[addressed]),/cannot directly answer/);
  assert.throws(()=>buildNeeds(data.records,texts,[{...addressed,sources:[...addressed.sources,addressed.sources[0]]}]),/Duplicate resource mapping/);
  assert.throws(()=>buildNeeds(data.records,texts,[{...addressed,sources:[['missing-source','Direct answer','Not present']]}]),/Unknown need resource/);
  const gap=definition(data.needs.find(n=>n.coverage==='Potential gap'));
  assert.throws(()=>buildNeeds(data.records,texts,[{...gap,sources:[['tools','Direct answer','Cannot claim absent while directly answered']]}]),/Gap needs bounded/);
  assert.throws(()=>buildNeeds(data.records,texts,[{...gap,gapSearch:null}]),/Gap needs bounded/);
  assert.throws(()=>buildNeeds(data.records,texts,[{...gap,gapSearch:{scopeIds:[],terms:[],limitation:''}}]),/must specify sources/);
});
test('Atomic catalogue: verbatim evidence, coverage rules, reverse maps and job roll-ups',()=>{
  const {normalise,coverageOrder}=require('./atomic.cjs');
  const ns=JSON.parse(fs.readFileSync(path.join(root,'needs-sources.json'),'utf8'));
  const pages=[...source.pages,...ns.pages,...pdf];
  const recText=r=>[texts.get(r.id),...pages.filter(p=>r.variants.includes(p.url)||r.variants.includes(p.finalUrl)).map(p=>p.text),r.id==='savy'?supplemental.text:''].map(normalise).join(' \u0000 ');
  const A=data.atomicNeeds,byRec=new Map(data.records.map(r=>[r.id,r]));
  assert.equal(new Set(A.map(n=>n.id)).size,A.length);
  assert.ok(A.length>=800,'catalogue should stay granular');
  const jobs=new Map(data.jobs.map(j=>[j.id,j]));
  let quotes=0;
  for(const n of A) {
    assert.ok(n.question.endsWith('?'),n.id+' must be phrased as a question');
    assert.ok(n.statement && n.yorkAnswer!==undefined && jobs.has(n.job) && coverageOrder.includes(n.coverage),n.id);
    assert.ok(!/\b[mjnp]\d{1,4}\b/.test(n.conflictNote+n.yorkAnswer+n.question),n.id+' leaks internal keys');
    assert.equal(new Set(n.mappings.map(m=>m.resourceId)).size,n.mappings.length);
    for(const m of n.mappings) {
      const r=byRec.get(m.resourceId);assert.ok(r,m.resourceId);assert.ok(r.atomicIds.includes(n.id));assert.ok(r.jobIds.includes(n.job));
      const t=recText(r);for(const q of m.quotes) {quotes++;assert.ok(t.includes(normalise(q)),`${n.id}: quote not verbatim in ${r.id}: ${q.slice(0,60)}`);}
    }
    const direct=n.mappings.filter(m=>m.role==='Direct answer');
    assert.equal(n.directCount,direct.length);
    assert.equal(n.ownerCount,new Set(direct.map(m=>byRec.get(m.resourceId).owner)).size);
    if(n.coverage==='Conflicting answers') assert.ok(n.directCount>0 && n.conflict && n.conflictNote);
    else if(n.coverage==='Answered') assert.ok(n.directCount>0);
    else if(n.coverage==='Partially answered') assert.ok(n.directCount===0 && n.mappings.length>0);
    else assert.equal(n.mappings.length,0,n.id+' gap with mapped content');
    if(n.coverage==='Gap: not found York-wide') assert.equal(n.search.status,'Not found');
    assert.ok(n.origins.length,n.id+' has no need evidence');
    assert.equal(n.origins.includes('Peer benchmark'),n.peers.length>0,n.id+' peer origin must cite peers');
  }
  assert.ok(quotes>1000);
  for(const r of data.records) for(const id of r.atomicIds) assert.ok(A.find(n=>n.id===id).mappings.some(m=>m.resourceId===r.id));
  for(const j of data.jobs) {
    assert.deepEqual([...j.needIds].sort(),A.filter(n=>n.job===j.id).map(n=>n.id).sort(),j.id);
    for(const c of coverageOrder) assert.equal(j.coverageCounts[c]||0,A.filter(n=>n.job===j.id&&n.coverage===c).length);
  }
  const m=data.atomicMeta;
  assert.equal(m.total,A.length);assert.equal(m.multipleDirect,A.filter(n=>n.directCount>1).length);
  for(const c of coverageOrder) assert.equal(m.coverageCounts[c]||0,A.filter(n=>n.coverage===c).length);
  const csvRows=f=>fs.readFileSync(path.join(root,f),'utf8').trim().split(/\r?\n(?=(?:[^"]*"[^"]*")*[^"]*$)/).length-1;
  assert.equal(csvRows('atomic-needs.csv'),A.length);
  assert.equal(csvRows('need-jobs.csv'),data.jobs.length);
  assert.equal(csvRows('atomic-need-content-map.csv'),A.reduce((k,n)=>k+n.mappings.length+n.raised.length,0));
});
const errors=[];
const vc=new VirtualConsole();
vc.on('jsdomError',e=>errors.push(e.message));
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://audit.local/index.html',runScripts:'outside-only',virtualConsole:vc,pretendToBeVisual:true});
const w=dom.window,d=w.document;
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
w.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new w.Event('close'));};
w.HTMLElement.prototype.scrollIntoView=function(){};
w.URL.createObjectURL=()=> 'blob:test';
w.URL.revokeObjectURL=()=>{};
const downloads=[];
w.HTMLAnchorElement.prototype.click=function(){downloads.push(this.download);};
w.eval(fs.readFileSync(path.join(root,'data.js'),'utf8'));
w.eval(fs.readFileSync(path.join(root,'app.js'),'utf8'));
function click(selector) {const el=d.querySelector(selector);assert.ok(el,`Missing element ${selector}`);el.click();}
function input(id,value,type='change') {const e=d.getElementById(id);e.value=value;e.dispatchEvent(new w.Event(type,{bubbles:true}));}
function cards() {return [...d.querySelectorAll('#resource-list .resource-card')];}
test('Inventory opens without promotional copy, disclaimers or a hero',()=>{
  assert.equal(d.querySelector('.hero, .scope-strip, .audit-label, #snapshot-date, #inventory .filter-note, footer'),null);
  assert.equal(d.querySelector('h1').textContent,'YORK AI ATLAS');
  assert.doesNotMatch(d.getElementById('inventory').textContent,/Filter by task|WHERE DOES THE INFORMATION LIVE/);
  assert.ok(d.querySelectorAll('#metrics .metric').length>0);
});
test('Navigation, source and export arrows use a plain greater-than sign',()=>{
  for(const selector of ['#export','#export-needs','[data-need-content]','[data-blueprint] span','[data-inventory-topic]','.pillar .eyebrow','.card-footer a span[aria-hidden]']) {
    const elements=[...d.querySelectorAll(selector)];
    assert.ok(elements.length,`Missing arrow controls: ${selector}`);
    for(const element of elements) assert.ok(element.textContent.trim().endsWith('>'),selector);
  }
});
test('Initial inventory and six-view navigation render without runtime errors',()=>{
  assert.equal(cards().length,data.records.length);
  for(const tab of ['inventory','needs','sitemap','overlaps','blueprint','method']) {
    click(`.tabs [data-tab="${tab}"]`);
    assert.equal(d.getElementById(tab).hidden,false);
    assert.equal([...d.querySelectorAll('main>.panel')].filter(e=>!e.hidden).length,1);
  }
  click('.tabs [data-tab="inventory"]');
});
test('Search, combined tags/audience, reset and no-results state work',()=>{
  input('search','Copilot','input');assert.ok(cards().length>0 && cards().length<data.records.length);
  click('#reset');input('topic','Academic integrity');input('audience','Students');
  const expected=data.records.filter(r=>r.topics.includes('Academic integrity')&&r.audience.includes('Students'));
  assert.equal(cards().length,expected.length);
  input('search','definitely-no-such-york-resource-5829','input');assert.ok(d.querySelector('.empty'));
  click('[data-reset]');assert.equal(cards().length,data.records.length);
});
test('Sorting, quick topic filters and table/card switching work',()=>{
  input('sort','title');
  const titles=cards().map(e=>e.querySelector('h3').textContent);
  assert.equal(titles[0],[...data.records].sort((a,b)=>a.title.localeCompare(b.title))[0].title);
  click('[data-topic="Privacy"]');assert.equal(cards().length,data.records.filter(r=>r.topics.includes('Privacy')).length);
  click('#view-toggle');assert.equal(d.querySelectorAll('#resource-list tbody tr').length,cards().length || data.records.filter(r=>r.topics.includes('Privacy')).length);
  click('#view-toggle');click('#reset');
});
test('Resource detail, related-link navigation and risk drill-through work',()=>{
  click('#resource-list [data-resource="students"]');assert.equal(d.getElementById('detail').open,true);
  assert.match(d.getElementById('detail-title').textContent,/Students/);
  assert.ok(d.querySelector('#detail blockquote').textContent.includes('By default'));
  click('#detail [data-finding="permission"]');assert.equal(d.getElementById('detail').open,false);assert.equal(d.getElementById('overlaps').hidden,false);
  click('#finding-permission [data-resource="policy"]');assert.match(d.getElementById('detail-title').textContent,/Senate/);click('#close-detail');
});
test('Current sitemap search and proposed-hub routes work',()=>{
  click('.tabs [data-tab="sitemap"]');input('map-search','Copilot','input');
  const visible=[...d.querySelectorAll('.map-item[data-map-search]')].filter(e=>!e.hidden);
  assert.ok(visible.length>0);assert.ok(visible.every(e=>e.dataset.mapSearch.includes('copilot')));
  click('.tabs [data-tab="blueprint"]');click('[data-blueprint="tools"]');
  click('#blueprint-tools [data-inventory-topic]');assert.equal(d.getElementById('inventory').hidden,false);assert.equal(d.getElementById('topic').value,'Approved tools');
});
test('CSV export and hash state work without errors',()=>{
  click('#export');assert.ok(w.location.hash.includes('topic=Approved+tools'));
  assert.equal(errors.length,0,errors.join('\n'));
});
test('Hash navigation restores state and clears omitted filters',()=>{
  w.history.replaceState(null,'','#view=inventory&topic=Citation&resource=policy');
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  assert.equal(d.getElementById('topic').value,'Citation');
  assert.equal(d.getElementById('search').value,'');
  assert.equal(d.getElementById('detail').open,true);
  assert.match(d.getElementById('detail-title').textContent,/Senate/);
  click('#close-detail');
});
test('Atomic needs filters, matrix and layouts reflect the data',()=>{
  click('.tabs [data-tab="needs"]');
  const A=data.atomicNeeds,rows=()=>d.querySelectorAll('#need-list details.atomic').length;
  assert.equal(rows(),A.length);
  assert.equal(d.querySelectorAll('#need-list .job-group').length,new Set(A.map(n=>n.job)).size);
  input('needsMultiplicity','multiple');assert.equal(rows(),A.filter(n=>n.directCount>1).length);
  input('needsMultiplicity','owners');assert.equal(rows(),A.filter(n=>n.ownerCount>1).length);
  input('needsMultiplicity','peer-only');assert.equal(rows(),A.filter(n=>!n.contentCount&&n.peers.length).length);
  click('[data-needs-reset]');input('needsCoverage','Conflicting answers');
  assert.equal(rows(),A.filter(n=>n.coverage==='Conflicting answers').length);
  click('#export-needs');assert.equal(downloads.at(-1),'york-ai-filtered-needs.csv');
  click('[data-needs-reset]');input('needsSearch','definitely-no-such-need-4471','input');assert.ok(d.querySelector('#need-list .empty'));
  click('[data-needs-reset]');click('[data-needs-layout="table"]');
  assert.equal(d.querySelectorAll('#need-list .need-table tbody tr').length,A.length);
  input('needsSort','most');
  const counts=[...d.querySelectorAll('#need-list .need-table tbody tr td:nth-child(5)')].map(e=>parseInt(e.firstChild.textContent,10));
  assert.deepEqual(counts,[...counts].sort((a,b)=>b-a));
  click('[data-needs-reset]');click('[data-needs-layout="jobs"]');
  const cell=[...d.querySelectorAll('[data-matrix]')].find(b=>b.dataset.matrix.endsWith('|Answered'));
  const [dom,cov]=cell.dataset.matrix.split('|');click(`[data-matrix="${cell.dataset.matrix}"]`);
  assert.equal(rows(),A.filter(n=>n.domain===dom&&n.coverage===cov).length);assert.equal(rows(),Number(cell.textContent));
  assert.equal(d.getElementById('needsDomain').value,dom);assert.ok(w.location.hash.includes('needsDomain='+dom));
  click('[data-needs-reset]');
});
test('Atomic need detail shows verbatim evidence and journeys to content and back',()=>{
  const n=data.atomicNeeds.find(n=>n.coverage==='Conflicting answers'&&n.directCount>1);
  click(`#need-${n.id} summary`);
  const det=d.getElementById('need-'+n.id);det.dispatchEvent(new w.Event('toggle'));
  assert.ok(det.open);assert.equal(det.querySelectorAll('.need-mapping blockquote').length,n.mappings.reduce((k,m)=>k+m.quotes.length,0));
  assert.ok(det.querySelector('.callout.warning').textContent.includes(n.conflictNote.slice(0,40)));
  click(`#job-${n.job} [data-need-content]`);
  assert.equal(d.getElementById('resource-need').value,n.job);
  assert.equal(cards().length,data.records.filter(r=>r.jobIds.includes(n.job)).length);
  const r=data.records.find(r=>r.atomicIds.includes(n.id));
  click('#reset');click(`#resource-list [data-resource="${r.id}"]`);
  click(`#detail [data-need="${n.id}"]`);
  assert.equal(d.getElementById('detail').open,false);assert.equal(d.getElementById('needs').hidden,false);
  assert.ok(d.getElementById('need-'+n.id).open);assert.equal(d.activeElement.closest('details').id,'need-'+n.id);
  assert.ok(w.location.hash.includes('need='+n.id));
});
test('Needs deep links restore atomic needs and parent jobs without stale filters',()=>{
  const n=data.atomicNeeds.find(n=>n.coverage==='Gap: not found York-wide')||data.atomicNeeds[0];
  w.history.replaceState(null,'','#view=needs&need='+n.id);
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  assert.equal(d.getElementById('needs').hidden,false);
  assert.ok(d.getElementById('need-'+n.id).open);
  assert.ok(d.querySelector(`#need-${n.id} .atomic-body`).textContent.includes(n.yorkAnswer.slice(0,30)));
  assert.equal(d.getElementById('resource-need').value,'');
  w.history.replaceState(null,'','#view=needs&need=need-human-review');
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  assert.equal(d.activeElement.id,'job-need-human-review');
  assert.equal(errors.length,0,errors.join('\n'));
});
test('All local report links refer to existing deliverables',()=>{
  for(const a of d.querySelectorAll('a[href]')) {
    const h=a.getAttribute('href');
    if(!/^(?:https?:|#|blob:)/.test(h)) assert.ok(fs.existsSync(path.join(root,h)),h);
  }
});
dom.window.close();
fs.writeFileSync(path.join(root,'test-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),tests,passed:tests.length},null,2));
console.log(`All ${tests.length} data and interaction tests passed.`);
