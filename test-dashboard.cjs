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
test('Needs filters distinguish multiple answers, gaps and unverified coverage',()=>{
  click('.tabs [data-tab="needs"]');
  assert.equal(d.querySelectorAll('#need-list .need-card').length,data.needs.length);
  input('needsMultiplicity','multiple');
  assert.equal(d.querySelectorAll('#need-list .need-card').length,data.needs.filter(n=>n.directCount>1).length);
  input('needsCoverage','Potential gap');assert.equal(d.querySelectorAll('#need-list .need-card').length,0);
  click('[data-needs-reset]');input('needsCoverage','Potential gap');
  assert.equal(d.querySelectorAll('#need-list .need-card').length,data.needs.filter(n=>n.coverage==='Potential gap').length);
  assert.ok([...d.querySelectorAll('#need-list .need-counts strong')].every(e=>e.textContent==='0'));
  click('#export-needs');assert.equal(downloads.at(-1),'york-ai-filtered-needs.csv');
  click('[data-needs-reset]');input('needsAudience','Students');input('needsSearch','assessment','input');
  assert.ok(d.querySelector('#need-course-permission'));
  click('[data-needs-reset]');input('needsSort','most');
  const counts=[...d.querySelectorAll('#need-list .need-counts strong')].map(e=>Number(e.textContent));
  assert.deepEqual(counts,[...counts].sort((a,b)=>b-a));
});
test('Need-to-content and content-to-need journeys preserve relationship meaning',()=>{
  click('[data-needs-reset]');click('#need-course-permission [data-need="need-course-permission"]');
  assert.ok(d.querySelector('#need-course-permission .need-detail').open);
  click('#need-course-permission [data-need-content]');
  assert.equal(d.getElementById('resource-need').value,'need-course-permission');
  assert.equal(cards().length,data.needs.find(n=>n.id==='need-course-permission').contentCount);
  click('#resource-list [data-resource="students"]');
  click('#detail [data-need="need-course-permission"]');
  assert.equal(d.getElementById('detail').open,false);
  assert.equal(d.getElementById('needs').hidden,false);
  assert.equal(d.activeElement.id,'need-course-permission');
  assert.ok(w.location.hash.includes('need=need-course-permission'));
});
test('Needs deep links restore the selected atomic need without stale resource filters',()=>{
  w.history.replaceState(null,'','#view=needs&need=need-human-review');
  w.dispatchEvent(new w.HashChangeEvent('hashchange'));
  assert.equal(d.getElementById('needs').hidden,false);
  assert.ok(d.querySelector('#need-human-review .need-detail').open);
  assert.equal(d.activeElement.id,'need-human-review');
  assert.equal(d.getElementById('resource-need').value,'');
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
