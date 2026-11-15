/* global YORK_AI_AUDIT */
(() => {
  'use strict';
  const data = window.YORK_AI_AUDIT;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const byId = new Map(data.records.map(r => [r.id, r]));
  const byNeed = new Map(data.needs.map(n => [n.id, n]));
  const byAtomic = new Map(data.atomicNeeds.map(n => [n.id, n]));
  const byJob = new Map(data.jobs.map(j => [j.id, j]));
  const fields = ['audience','owner','domain','action','evidence','topic'];
  const needFields = ['needsSearch','needsDomain','needsJob','needsAudience','needsCoverage','needsMultiplicity','needsOrigin','needsPriority','needsSort','needsLayout'];
  const defaults = { tab:'inventory', search:'', audience:'', owner:'', domain:'', action:'', evidence:'', topic:'', sort:'priority', table:false, resource:'',resourceNeed:'',need:'',
    needsSearch:'',needsDomain:'',needsJob:'',needsAudience:'',needsCoverage:'',needsMultiplicity:'',needsOrigin:'',needsPriority:'',needsSort:'priority',needsLayout:'jobs' };
  const state = { ...defaults };
  const hashFields = ['search',...fields,'sort','resource','resourceNeed','need',...needFields];
  const tabNames = ['inventory','needs','sitemap','overlaps','blueprint','method'];
  const priorities = ['P0 / resolve before reuse','P1 / high priority','P2 / consolidation','P3 / supporting resource'];
  const link = (r, text = 'Visit source') => `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(text)} <span aria-hidden="true">&nearr;</span></a>`;
  const detailButton = (id, label) => `<button class="source-link" data-resource="${esc(id)}">${esc(label || byId.get(id).title)}</button>`;
  const unique = values => [...new Set(values)].sort((a,b) => a.localeCompare(b));
  const bad = r => /HTTP|failure|Protected|Wrong destination/.test(r.evidence);
  const date = value => new Date(value).toLocaleDateString('en-CA', { year:'numeric', month:'long', day:'numeric', timeZone:'America/Toronto' });
  let opener = null;
  function readHash() {
    Object.assign(state, defaults);
    const p = new URLSearchParams(location.hash.slice(1));
    state.tab = tabNames.includes(p.get('view')) ? p.get('view') : 'inventory';
    for (const f of hashFields) if (p.has(f)) state[f] = p.get(f);
    state.table = p.get('table') === '1';
  }
  function writeHash() {
    const p = new URLSearchParams({ view:state.tab });
    for (const f of hashFields) if (state[f] && state[f] !== defaults[f]) p.set(f, state[f]);
    if (state.table) p.set('table','1');
    history.replaceState(null,'',`#${p}`);
  }
  function filtered() {
    const query = state.search.trim().toLowerCase();
    const terms = query.split(/\s+/).filter(Boolean);
    const records = data.records.filter(r => {
      if (state.audience && !r.audience.includes(state.audience)) return false;
      if (state.topic && !r.topics.includes(state.topic)) return false;
      if (state.owner && r.owner !== state.owner) return false;
      if (state.domain && r.domain !== state.domain) return false;
      if (state.action && r.action !== state.action) return false;
      if (state.evidence && r.evidence !== state.evidence) return false;
      if (state.resourceNeed && !r.jobIds.includes(state.resourceNeed)) return false;
      const haystack = [r.title,r.summary,r.addresses,r.url,r.finalUrl,r.owner,r.target,r.recommendation,...r.topics,...r.audience,...r.jobIds.map(id=>byJob.get(id).title)].join(' ').toLowerCase();
      return terms.every(t => haystack.includes(t));
    });
    return records.sort((a,b) => {
      if (state.sort === 'priority') return a.priority - b.priority || Number(b.curated) - Number(a.curated) || a.title.localeCompare(b.title);
      if (state.sort === 'hops') return (a.hops ?? Infinity) - (b.hops ?? Infinity) || a.title.localeCompare(b.title);
      const key = ['title','domain','owner','action'].includes(state.sort) ? state.sort : 'title';
      return a[key].localeCompare(b[key]) || a.title.localeCompare(b.title);
    });
  }
  function syncInputs() {
    $('search').value = state.search;
    for (const f of fields) $(f).value = state[f];
    $('sort').value = state.sort;
    $('resource-need').value = state.resourceNeed;
    $('view-toggle').textContent = state.table ? 'Card view' : 'Table view';
    $('view-toggle').setAttribute('aria-pressed',String(state.table));
  }
  const covSlug = c => c.toLowerCase().replace(/[^a-z]+/g,'-').replace(/^-|-$/g,'');
  const priorityLabels = ['P0 / risk if wrong or missing','P1 / high frequency or blocking','P2 / useful','P3 / nice to know'];
  const originOrder = ['York content','York-wide search','Journey analysis','Peer benchmark','Peer scan (uncited)','Open question'];
  function filteredNeeds() {
    const terms=state.needsSearch.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const order=data.atomicCoverageOrder;
    return data.atomicNeeds.filter(n=>{
      if(state.needsDomain && n.domain!==state.needsDomain) return false;
      if(state.needsJob && n.job!==state.needsJob) return false;
      if(state.needsAudience && !n.audience.includes(state.needsAudience)) return false;
      if(state.needsCoverage && n.coverage!==state.needsCoverage) return false;
      if(state.needsOrigin && !n.origins.includes(state.needsOrigin)) return false;
      if(state.needsPriority!=='' && n.priority!==Number(state.needsPriority)) return false;
      if(state.needsMultiplicity==='zero' && n.directCount!==0) return false;
      if(state.needsMultiplicity==='one' && n.directCount!==1) return false;
      if(state.needsMultiplicity==='multiple' && n.directCount<2) return false;
      if(state.needsMultiplicity==='owners' && n.ownerCount<2) return false;
      if(state.needsMultiplicity==='peer-only' && (n.contentCount || !n.peers.length)) return false;
      if(!terms.length) return true;
      const haystack=[n.id,n.question,n.statement,n.yorkAnswer,n.jobTitle,n.domainTitle,n.moment,n.conflictNote,...n.audience,...n.peers.map(p=>p.name),...n.mappings.map(m=>byId.get(m.resourceId).title)].join(' ').toLowerCase();
      return terms.every(t=>haystack.includes(t));
    }).sort((a,b)=>{
      if(state.needsSort==='title') return a.question.localeCompare(b.question);
      if(state.needsSort==='most') return b.directCount-a.directCount || b.ownerCount-a.ownerCount || a.question.localeCompare(b.question);
      if(state.needsSort==='least') return a.directCount-b.directCount || a.priority-b.priority || a.question.localeCompare(b.question);
      if(state.needsSort==='coverage') return order.indexOf(a.coverage)-order.indexOf(b.coverage) || a.priority-b.priority || a.question.localeCompare(b.question);
      if(state.needsSort==='peers') return b.peers.length-a.peers.length || a.question.localeCompare(b.question);
      return a.priority-b.priority || order.indexOf(a.coverage)-order.indexOf(b.coverage) || a.question.localeCompare(b.question);
    });
  }
  function syncNeedInputs() {
    for(const f of needFields) if(f!=='needsLayout') $(f).value=state[f];
    for(const b of document.querySelectorAll('[data-needs-layout]')) {const on=b.dataset.needsLayout===state.needsLayout;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));}
  }
  const coverageBadge = n => `<span class="cov cov-${covSlug(n.coverage)}">${esc(n.coverage)}</span>`;
  const instanceText = n => n.directCount ? `${n.directCount} direct page${n.directCount===1?'':'s'}${n.ownerCount>1?` / ${n.ownerCount} publishers`:''}` : n.contentCount ? `${n.contentCount} partial page${n.contentCount===1?'':'s'}` : 'no York page';
  function needSummary(n) {
    return `<summary><span class="atomic-q">${esc(n.question)}</span><span class="atomic-meta">${coverageBadge(n)}<span class="count-pill" title="Distinct York resources giving a direct answer">${esc(instanceText(n))}</span><span class="prio prio-${n.priority}" title="${esc(priorityLabels[n.priority])}">P${n.priority}</span></span></summary>`;
  }
  function needBody(n) {
    const evidence=n.mappings.map(m=>{const r=byId.get(m.resourceId);return `<div class="need-mapping"><div><span class="tag">${esc(m.role)}</span><span class="tag subtle">${esc(r.owner)}</span></div>${detailButton(r.id)}${m.gist?`<p>${esc(m.gist)}</p>`:''}${m.quotes.map(q=>`<blockquote>${esc(q)}</blockquote>`).join('')}<p class="muted">${link(r,'Open original source')} / found by ${esc(m.origins.join(' + ').toLowerCase())}</p></div>`;}).join('');
    const raised=n.raised.length?`<h4>York pages that raise this question without answering it (${n.raised.length})</h4>${n.raised.map(x=>`<div class="need-mapping">${detailButton(x.resourceId)}<p>${esc(x.gist)}</p></div>`).join('')}`:'';
    const search=n.search?`<div class="callout ${n.search.status==='Not found'?'warning':''}"><h4>York-wide web search: ${esc(n.search.status)}</h4>${n.search.note?`<p>${esc(n.search.note)}</p>`:''}${n.search.queries.length?`<p class="muted">Queries included: ${n.search.queries.map(q=>`<code>${esc(q)}</code>`).join(' ')}</p>`:''}<p class="muted">A bounded search, not proof that York has no answer anywhere (e.g., intranet, eClass, course outlines).</p></div>`:'';
    const peers=n.peers.length?`<h4>Peer universities answering this question (${n.peers.length})</h4><ul class="peer-list">${n.peers.map(p=>`<li><strong>${esc(p.name)}</strong>${p.gist?` &mdash; ${esc(p.gist)}`:''}${p.url?` <a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">source <span aria-hidden="true">&nearr;</span></a>`:''}</li>`).join('')}</ul><p class="muted">Demand evidence only: peers' answers are not York policy.</p>`:'';
    return `<p class="need-statement">${esc(n.statement)}</p>
      <div class="detail-meta compact"><div><strong>PARENT JOB</strong><button class="source-link" data-need="${esc(n.job)}">${esc(n.jobTitle)}</button></div><div><strong>DOMAIN</strong>${esc(n.domainTitle)}</div><div><strong>AUDIENCE</strong>${esc(n.audience.join(', '))}</div><div><strong>MOMENT</strong>${esc(n.moment||'Not specified')}</div><div><strong>PRIORITY</strong>${esc(priorityLabels[n.priority])}</div><div><strong>NEED EVIDENCE</strong>${esc(n.origins.join(', '))}</div></div>
      <h4>What York currently says</h4><p>${esc(n.yorkAnswer)}</p>
      ${n.conflict?`<div class="callout warning"><h4>Conflicting York answers</h4><p>${esc(n.conflictNote)}</p></div>`:''}
      ${n.mappings.length?`<h4>York content answering this (${n.directCount} direct / ${n.contentCount-n.directCount} partial or signpost)</h4>${evidence}`:''}
      ${raised}${search}${peers}
      <h4>Proposed home</h4><p>${esc(n.proposedHome)}</p>
      <p class="muted">${esc(n.validation)}. Every quote above was matched verbatim against captured page text.</p>
      <div class="need-actions"><button class="text-button" data-copy-need="${esc(n.id)}">Copy link to this need</button><span class="muted">ID: ${esc(n.id)}</span></div>`;
  }
  function renderNeedResults() {
    const needs=filteredNeeds();
    const jobCount=new Set(needs.map(n=>n.job)).size;
    $('need-result-count').textContent=`${needs.length} of ${data.atomicNeeds.length} atomic needs / ${jobCount} parent jobs / ${needs.filter(n=>n.directCount>1).length} answered in more than one place`;
    if(!needs.length) {$('need-list').innerHTML='<div class="empty"><h3>No matching needs</h3><p>Try fewer filters.</p><button class="button secondary" data-needs-reset>Clear need filters</button></div>';return;}
    if(state.needsLayout==='table') {
      $('need-list').innerHTML=`<div class="table-wrap"><table class="need-table"><thead><tr><th>ATOMIC QUESTION</th><th>PARENT JOB / DOMAIN</th><th>AUDIENCE</th><th>COVERAGE</th><th>DIRECT PAGES</th><th>PRIORITY</th></tr></thead><tbody>${needs.map(n=>`<tr><td><button data-need="${esc(n.id)}">${esc(n.question)}</button><small>${esc(n.origins.join(', '))}</small></td><td>${esc(n.jobTitle)}<small>${esc(n.domainTitle)}</small></td><td>${esc(n.audience.join(', '))}</td><td>${coverageBadge(n)}</td><td>${n.directCount}${n.ownerCount>1?`<small>${n.ownerCount} publishers</small>`:''}</td><td>P${n.priority}</td></tr>`).join('')}</tbody></table></div>`;
      return;
    }
    const groups=new Map();
    for(const n of needs) {if(!groups.has(n.job)) groups.set(n.job,[]);groups.get(n.job).push(n);}
    $('need-list').innerHTML=[...groups].map(([jobId,list])=>{
      const j=byJob.get(jobId);
      const counts=data.atomicCoverageOrder.map(c=>[c,list.filter(n=>n.coverage===c).length]).filter(([,k])=>k);
      return `<section class="job-group" id="job-${esc(jobId)}" tabindex="-1"><header><div><p class="eyebrow">PARENT JOB / ${esc(data.needDomains.find(d=>d.id===j.domain).title)}</p><h3>${esc(j.title)}</h3>${j.statement?`<p>${esc(j.statement)}</p>`:''}</div><div class="job-bar" role="img" aria-label="${esc(counts.map(([c,k])=>`${k} ${c}`).join(', '))}">${counts.map(([c,k])=>`<span class="cov-${covSlug(c)}" style="flex:${k}" title="${esc(`${k} ${c}`)}"></span>`).join('')}</div><p class="job-counts">${list.length}${list.length!==j.needIds.length?` of ${j.needIds.length}`:''} atomic questions: ${counts.map(([c,k])=>`${k} ${esc(c.toLowerCase())}`).join(' / ')}</p>${j.legacyCoverage?`<p class="muted">v1 job-level assessment: ${esc(j.legacyCoverage)}. ${esc(j.action)}</p>`:''}${data.records.some(r=>r.jobIds.includes(jobId))?`<button class="text-button" data-need-content="${esc(jobId)}">Show every York page mapped to this job in the inventory &rarr;</button>`:''}</header><ol class="atomic-list">${list.map(n=>`<li><details class="atomic" id="need-${esc(n.id)}" data-need-id="${esc(n.id)}">${needSummary(n)}<div class="atomic-body"></div></details></li>`).join('')}</ol></section>`;
    }).join('');
  }
  function renderNeedMatrix() {
    const order=data.atomicCoverageOrder.filter(c=>data.atomicMeta.coverageCounts[c]);
    return `<div class="table-wrap matrix-wrap"><table class="need-matrix"><caption>Atomic needs by domain and current York coverage. Select a count to filter.</caption><thead><tr><th scope="col">DOMAIN</th>${order.map(c=>`<th scope="col"><span class="cov cov-${covSlug(c)}">${esc(c)}</span></th>`).join('')}<th scope="col">TOTAL</th><th scope="col">2+ PAGES</th></tr></thead><tbody>${data.needDomains.map(d=>{const list=data.atomicNeeds.filter(n=>n.domain===d.id);if(!list.length) return '';return `<tr><th scope="row"><button data-matrix="${esc(d.id)}|" title="${esc(d.description)}">${esc(d.title)}</button></th>${order.map(c=>{const k=list.filter(n=>n.coverage===c).length;return `<td>${k?`<button data-matrix="${esc(d.id)}|${esc(c)}" aria-label="${k} ${esc(c)} in ${esc(d.title)}">${k}</button>`:'<span aria-hidden="true">&middot;</span>'}</td>`;}).join('')}<td><strong>${list.length}</strong></td><td>${list.filter(n=>n.directCount>1).length}</td></tr>`;}).join('')}</tbody></table></div>`;
  }
  function renderNeeds() {
    const options=(values,labels)=>values.map((v,i)=>`<option value="${esc(v)}">${esc(labels?labels[i]:v)}</option>`).join('');
    const m=data.atomicMeta,c=m.coverageCounts;
    const jobs=[...data.jobs].sort((a,b)=>a.title.localeCompare(b.title));
    $('needs').innerHTML=`<div class="section-head"><div><p class="eyebrow">START WITH THE QUESTION, NOT THE PAGE</p><h2>Catalogue of need</h2><p>${m.total} specific, atomic questions people bring to York about AI, grouped under ${m.jobs} parent jobs. Each is traced to the York pages that answer it (with verbatim quotes), the York pages that raise it without answering, a York-wide search record, and peer universities that answer it for their own users.</p></div><button id="export-needs" class="button secondary">Export filtered needs CSV &darr;</button></div>
      <div class="need-metrics">${[[m.total,'atomic needs'],[c['Answered']+c['Conflicting answers'],'answered somewhere at York'],[m.multipleDirect,'answered on 2+ York pages'],[m.multipleOwners,'answered by 2+ publishers'],[c['Conflicting answers'],'conflicting York answers'],[c['Partially answered'],'partially answered'],[c['Gap: not found York-wide']+c['Gap: not in captured content'],'gaps (no York answer found)']].map(([count,label])=>`<div><strong>${count}</strong><span>${esc(label)}</span></div>`).join('')}</div>
      <details class="matrix-panel" open><summary>Where the answers live and where they don't: domain &times; coverage</summary>${renderNeedMatrix()}</details>
      <div class="callout"><strong>How to read coverage.</strong> <em>Answered</em>: at least one York page gives a direct answer (quoted). <em>2+ pages</em> signals duplication to consolidate, not necessarily error. <em>Partially answered</em>: York gives context or a signpost only. <em>Gap: not found York-wide</em>: no answer in captured content and a York-wide web search also found none. <em>Gap: not in captured content</em>: demand is evidenced (peer benchmarks, journey analysis or a York page raising the question) but no York answer was found in the ${data.meta.inventoryRecords} captured resources; this is not a York-wide absence claim. <em>Unverified answer</em>: a search reported a York answer that could not be quoted from captured text.</div>
      <div class="workspace"><aside class="filters" aria-label="Need filters">
        <label for="needsSearch">Search questions</label><input id="needsSearch" type="search" placeholder="Try: Copilot cost, thesis, cite, deadline...">
        <label for="needsDomain">Domain</label><select id="needsDomain"><option value="">All domains</option>${options(data.needDomains.filter(d=>data.atomicNeeds.some(n=>n.domain===d.id)).map(d=>d.id),data.needDomains.filter(d=>data.atomicNeeds.some(n=>n.domain===d.id)).map(d=>d.title))}</select>
        <label for="needsJob">Parent job</label><select id="needsJob"><option value="">All parent jobs</option>${options(jobs.map(j=>j.id),jobs.map(j=>`${j.title} (${j.needIds.length})`))}</select>
        <label for="needsAudience">Audience</label><select id="needsAudience"><option value="">All audiences</option>${options(unique(data.atomicNeeds.flatMap(n=>n.audience)))}</select>
        <label for="needsCoverage">Coverage</label><select id="needsCoverage"><option value="">All coverage</option>${options(data.atomicCoverageOrder.filter(c=>data.atomicMeta.coverageCounts[c]))}</select>
        <label for="needsMultiplicity">Where the answer lives</label><select id="needsMultiplicity"><option value="">Any</option><option value="multiple">2+ York pages answer it</option><option value="owners">2+ publishers answer it</option><option value="one">Exactly one York page</option><option value="zero">No direct York answer</option><option value="peer-only">Peers answer it; York content doesn't</option></select>
        <label for="needsOrigin">Need evidence</label><select id="needsOrigin"><option value="">Any source of evidence</option>${options(originOrder)}</select>
        <label for="needsPriority">Priority</label><select id="needsPriority"><option value="">All priorities</option>${options(['0','1','2','3'],priorityLabels)}</select>
        <button class="text-button" data-needs-reset>Clear need filters</button>
        <div class="filter-note"><strong>Atomic = one question, one answer.</strong><p>"Can I use Copilot?" and "Is Copilot free for staff?" are separate needs because one answer does not satisfy both.</p><p>${m.mappedResources} of ${data.meta.inventoryRecords} resources answer at least one need. <a href="atomic-needs.csv" download>All needs CSV</a> / <a href="atomic-need-content-map.csv" download>Need-to-content map</a> / <a href="peer-evidence.csv" download>Peer evidence</a></p></div>
      </aside><div class="results"><div class="results-bar"><span id="need-result-count" role="status" aria-live="polite"></span><div class="results-tools"><div class="segmented" role="group" aria-label="Needs layout"><button data-needs-layout="jobs">By parent job</button><button data-needs-layout="table">Table</button></div><label for="needsSort" class="sr-only">Sort needs</label><select id="needsSort"><option value="priority">Priority, then coverage</option><option value="coverage">Coverage: gaps & conflicts first</option><option value="most">Most York pages answering</option><option value="least">Fewest York pages answering</option><option value="peers">Most peer universities</option><option value="title">Question: A to Z</option></select></div></div><div id="need-list"></div></div></div>`;
    for(const f of needFields.filter(f=>f!=='needsLayout')) $(f).addEventListener(f==='needsSearch'?'input':'change',()=>{
      state[f]=$(f).value;state.need='';renderNeedResults();writeHash();
    });
    $('need-list').addEventListener('toggle',e=>{
      const d=e.target;
      if(!d.classList?.contains('atomic') || !d.open) return;
      const body=d.querySelector('.atomic-body');
      if(!body.childElementCount) body.innerHTML=needBody(byAtomic.get(d.dataset.needId));
    },true);
    $('export-needs').addEventListener('click',downloadNeedsCsv);
    syncNeedInputs();renderNeedResults();
  }
  function resetNeeds() {
    for(const f of needFields) state[f]=defaults[f];
    state.need='';syncNeedInputs();renderNeedResults();writeHash();
  }
  function focusNeed(id) {
    if(byJob.has(id)) {const g=$('job-'+id);if(g){g.scrollIntoView({behavior:'smooth',block:'start'});g.focus({preventScroll:true});}return;}
    const d=$('need-'+id);
    if(!d) return;
    d.open=true;
    const body=d.querySelector('.atomic-body');
    if(!body.childElementCount) body.innerHTML=needBody(byAtomic.get(id));
    d.scrollIntoView({behavior:'smooth',block:'start'});d.querySelector('summary').focus({preventScroll:true});
  }
  function openNeed(id) {
    if(!byAtomic.has(id) && !byJob.has(id)) return;
    if($('detail').open) closeDetail();
    state.resource='';
    for(const f of needFields) state[f]=defaults[f];
    if(byJob.has(id)) state.needsJob=id;
    state.need=id;syncNeedInputs();renderNeedResults();showTab('needs');focusNeed(id);
  }
  function renderInventory() {
    const records = filtered();
    $('result-count').textContent = `${records.length} of ${data.records.length} resources / ${records.filter(r=>r.curated).length} analyst-curated`;
    const tags = ['Academic integrity','Approved tools','Teaching','Research practice','Training','Citation','Privacy','Programs','Governance'];
    $('quick-tags').innerHTML = ['All topics',...tags].map(t=>`<button class="chip ${(!state.topic && t==='All topics') || state.topic===t ? 'active':''}" aria-pressed="${(!state.topic && t==='All topics') || state.topic===t}" data-topic="${t==='All topics'?'':esc(t)}">${esc(t)}</button>`).join('');
    if (!records.length) {
      $('resource-list').innerHTML = '<div class="empty"><h3>No matching resources</h3><p>Try fewer filters or clear your search. Filters are combined.</p><button class="button secondary" data-reset>Clear all filters</button></div>';
      return;
    }
    if (state.table) {
      $('resource-list').innerHTML = `<div class="table-wrap"><table><thead><tr><th>RESOURCE / WHAT IT ADDRESSES</th><th>PUBLISHER / HOST</th><th>ACTION / PRIORITY</th><th>EVIDENCE</th><th>SOURCE</th></tr></thead><tbody>${records.map(r=>`<tr><td><button data-resource="${esc(r.id)}">${esc(r.title)}</button><small>${esc(r.addresses)}</small></td><td>${esc(r.owner)}<small>${esc(r.domain)}</small></td><td><span class="action ${r.action.toLowerCase()}">${esc(r.action)}</span><small>${esc(priorities[r.priority])}</small></td><td>${esc(r.evidence)}</td><td>${link(r,'Open')}</td></tr>`).join('')}</tbody></table></div>`;
    } else {
      $('resource-list').innerHTML = `<div class="resource-grid">${records.map(r=>`<article class="resource-card"><div class="card-top"><span>${esc(r.owner)}</span><span class="action ${r.action.toLowerCase()}">${esc(r.action)}</span></div><h3><button data-resource="${esc(r.id)}">${esc(r.title)}</button></h3><div class="resource-url">${esc(r.domain)}${r.hops!==null ? ` / ${r.hops===0 ? 'Hub' : r.hops+' observed link hop'+(r.hops===1?'':'s')}` : ' / No observed hub path'}</div><p>${esc(r.summary)}</p><div class="card-tags">${r.topics.slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div><div class="card-footer"><span class="${bad(r)?'status-warning':''}">${esc(r.evidence)}</span>${link(r)}</div></article>`).join('')}</div>`;
    }
  }
  function renderSitemap() {
    const pillars = [['teaching','Teaching & learning'],['research','Research & innovation'],['operations','University operations & AI']];
    const groups = unique(data.records.map(r=>r.owner));
    $('sitemap').innerHTML = `<div class="section-head"><div><p class="eyebrow">HOW THE CURRENT LANDSCAPE FITS TOGETHER</p><h2>A small front door. A distributed web.</h2><p>The three cards below are actual onward links from AI @ York. The publishing-family groups are an inventory view, not invented parent-child navigation.</p></div></div>
      <div class="sitemap-root"><p class="eyebrow" style="color:#ffffff">CURRENT ENTRY POINT</p><h3>AI @ York</h3>${link(byId.get('hub'),'yorku.ca/ai-at-york/')}<p>Coordinates the message; delegates the answers to three separate branches.</p></div>
      <div class="pillars">${pillars.map(([id,label])=>`<article class="pillar"><p class="eyebrow">OBSERVED DIRECT HUB LINK &darr;</p><h3>${esc(label)}</h3><p>${esc(byId.get(id).owner)}</p>${detailButton(id,'Explore this branch and its links')}</article>`).join('')}</div>
      <div class="callout"><strong>${data.edges.length} observed resource-to-resource links.</strong> Open any resource to explore its captured incoming and outgoing links. Distances are shortest observed paths in this bounded graph, not guaranteed website-wide click counts. No observed path does not mean a page is orphaned.</div>
      <label for="map-search" class="sr-only">Find a resource in the sitemap</label><input id="map-search" type="search" placeholder="Find a page, topic or publishing family..." style="width:100%;margin-bottom:20px">
      <div id="map-groups">${groups.map(g=>`<details class="map-family"><summary>${esc(g)} <small>${data.records.filter(r=>r.owner===g).length} resources</small></summary><div class="map-items">${data.records.filter(r=>r.owner===g).sort((a,b)=>a.title.localeCompare(b.title)).map(r=>`<div class="map-item" data-map-search="${esc([r.title,r.owner,r.url,...r.topics].join(' ').toLowerCase())}"><div><button data-resource="${esc(r.id)}">${esc(r.title)}</button><small>${esc(r.url)}</small></div><span class="hops">${r.hops===null?'No observed hub path':r.hops+' observed hops'}<br>${esc(r.action)}</span></div>`).join('')}</div></details>`).join('')}</div>`;
    $('map-search').addEventListener('input',e=>{
      const q=e.target.value.toLowerCase().trim();
      for (const group of $('map-groups').querySelectorAll('details')) {
        let visible=0;
        for(const row of group.querySelectorAll('.map-item')) { row.hidden=!row.dataset.mapSearch.includes(q); if(!row.hidden) visible++; }
        group.hidden=visible===0;
        if(q && visible) group.open=true;
      }
    });
  }
  function renderOverlaps() {
    const exact = data.exactDuplicates.map(g=>`<article class="method-card"><h3>Identical extracted text</h3><p>${esc(g.basis)}. This does not establish identical files, visual presentation or document authority.</p>${g.ids.map(id=>detailButton(id)).join('')}<small class="muted">SHA-256: ${esc(g.hash.slice(0,24))}...</small></article>`).join('');
    $('overlaps').innerHTML = `<div class="section-head"><div><p class="eyebrow">WHAT SHOULD BE FIXED, SHARED OR LEFT ALONE?</p><h2>Overlap is not always duplication.</h2><p>${data.findings.length} evidence-linked clusters separate contradictory guidance, version drift, repeated navigation and valuable specialist content.</p></div></div>
      <div class="callout warning"><h3>Resolve the rules before consolidating the pages.</h3><p>The highest-priority findings concern course permission and the version of operational guidelines being linked. A merged page would only spread ambiguity faster if these are not resolved by the appropriate authorities.</p></div>
      <div class="cluster-grid">${data.findings.map((f,i)=>`<article class="cluster ${['Critical','High'].includes(f.severity)?'high':''}" id="finding-${esc(f.id)}"><p class="eyebrow">${String(i+1).padStart(2,'0')} / ${esc(f.severity)} / ${esc(f.kind)}</p><h3>${esc(f.title)}</h3><p>${esc(f.observation)}</p>${f.quotes.map(q=>`<blockquote>${esc(q.text)}<br>${detailButton(q.id,'Source: '+byId.get(q.id).title)}</blockquote>`).join('')}<div class="decision"><p><strong>Proposed action:</strong> ${esc(f.decision)}</p><p><strong>Proposed accountable group:</strong> ${esc(f.owner)}</p><p><strong>Future home:</strong> ${esc(f.target)}</p><p><strong>Done when:</strong> ${esc(f.measure)}</p><details><summary>${f.keys.length} related resources</summary>${f.keys.map(id=>detailButton(id)).join('')}</details></div></article>`).join('')}</div>
      <h2 style="margin-top:35px">Machine-checked text matches</h2><p class="muted">Topic overlap above is analyst judgement, not a duplicate-percentage calculation. The matches below use text equality instead.</p><div class="method-grid">${exact || '<p>No exact extracted-text matches found.</p>'}</div>`;
  }
  function renderBlueprint() {
    $('blueprint').innerHTML = `<div class="section-head"><div><p class="eyebrow">A SINGLE FRONT DOOR, NOT A SINGLE GIANT DOCUMENT</p><h2>One experience. Federated expertise.</h2><p>A proposed information architecture for the existing AI @ York destination. These section names and ownership assignments are recommendations, not approved York structure.</p></div></div>
      <div class="hub-preview"><p class="eyebrow">PROPOSED AI @ YORK HOMEPAGE / INTERACTIVE TASK ROUTES</p><h3>What do you need to do?</h3><p>Make the user's task the organising principle. Bring approved answers, summaries and discovery together; leave authoritative policies, transactions and specialist depth with their owners.</p><div class="task-grid">${data.blueprint.map(b=>`<button data-blueprint="${esc(b.id)}">${esc(b.task)}<span>${esc(b.subtitle)} &rarr;</span></button>`).join('')}</div></div>
      <div class="callout"><strong>What "single page" should mean:</strong> one canonical AI @ York landing experience with searchable/filterable sections, common answers and clear onward actions. Do not copy every research project, course page, registration workflow and policy document into a huge page. Canonical summaries and metadata can be presented together while detailed content stays at its authoritative source.</div>
      <div class="blueprint-grid">${data.blueprint.map((b,i)=>`<article class="blueprint-card" id="blueprint-${esc(b.id)}" tabindex="-1"><span class="number">${String(i+1).padStart(2,'0')} / PROPOSED SECTION</span><h3>${esc(b.title)}</h3><p>${esc(b.body)}</p><h4>Proposed content owner</h4><p>${esc(b.owner)}</p><h4>Keep or reuse, rather than duplicate</h4><p>${esc(b.keep)}</p><details><summary>Existing sources to bring together</summary>${b.source.map(id=>detailButton(id)).join('')}</details><button class="text-button" data-inventory-topic="${esc(b.topic)}">Browse matching inventory &rarr;</button></article>`).join('')}</div>
      <h2>Make consolidation sustainable</h2><div class="method-grid">
      <article class="method-card"><h3>One content model</h3><p>Each resource needs: canonical ID/URL, plain-language title, what question it answers, audience, task/topic, content type, policy authority (where applicable), source owner, approval/review dates, language, access conditions and migration action. Tool records additionally need licence, authentication, purpose, permitted data classes and configuration caveats.</p><p>Use reusable structured records or shared content components in the CMS; a common WordPress taxonomy alone will not keep copied paragraphs in sync.</p></article>
      <article class="method-card"><h3>Named accountability</h3><p>Assign a hub product owner and a publisher for each content family. Policy authorities approve common interpretations; UIT/Information Security/privacy approve tool statements; Libraries owns citation mechanics; Faculties contribute examples. Confirm these responsibilities with the units rather than assuming this audit establishes them.</p><p>Suggested cadence: monthly link checks; quarterly tool, permission and top-task reviews; event-driven updates after policy/licence changes; semiannual programme/centre checks. Display last-reviewed dates and an issue-reporting route.</p></article></div>
      <h2>A practical migration sequence</h2><div class="phase-grid"><article class="phase"><p class="eyebrow">PHASE 1 / CORRECT</p><h4>Agree on the answers</h4><p>Resolve course-permission wording, confirm current guideline versions, review tool privacy claims and fix intended-destination failures. Confirm owners, archival duties and baseline task success before changing URLs.</p></article><article class="phase"><p class="eyebrow">PHASE 2 / CONSOLIDATE</p><h4>Build the shared front door</h4><p>Publish the seven task sections, shared catalogue and policy/tool records. Migrate or replace generic summaries, syndicate training/news and keep specialist detail linked. Preserve accessible and French-language routes.</p></article><article class="phase"><p class="eyebrow">PHASE 3 / RETIRE & MEASURE</p><h4>Reduce maintenance without breaking journeys</h4><p>Approve URL-by-URL redirects only for superseded equivalents. Keep useful faculty/admissions entry points, add canonical links where appropriate and monitor search, errors and task completion after launch.</p></article></div>
      <div class="callout"><strong>Measure the outcome, not the page-count reduction:</strong> no conflicting common rules, no broken critical paths, every core answer and tool record has an owner/review date, and users can complete tool-selection, course-permission, citation, research and training tasks from AI @ York. Establish analytics and usability baselines before setting numerical targets; no traffic or analytics was available for this audit.</div>`;
  }
  function renderMethod() {
    const m=data.meta;
    $('method').innerHTML = `<div class="section-head"><div><p class="eyebrow">KNOW WHAT THIS AUDIT DOES AND DOES NOT PROVE</p><h2>Evidence, scope & repeatability</h2><p>Public-web snapshot collected ${esc(date(m.collectedAt))}. Live pages, tool availability and policy wording may change after this date.</p></div></div>
      <div class="callout"><strong>${m.attemptedUrls} URL retrievals &rarr; ${m.inventoryRecords} inventory records.</strong> ${m.curatedRecords} have analyst-written summaries and proposed actions; ${m.extractedRecords} are extracted supporting leads that still need triage. ${m.excludedEndpoints} proxy/transactional endpoints are excluded. Aliases resolving to a common destination are grouped, so URL and resource counts differ.</div>
      <div class="method-grid">
      <article class="method-card"><h3>Discovery and retrieval</h3><p>Started from AI @ York and its three main branches. Followed topic-relevant links in extracted main content to depth two, with a 150-URL initial cap and a 400 ms pause between sequential requests. Added targeted public search follow-up for faculty, law, continuing education, cybersecurity and Library guide sections.</p><p>Retained ${m.pdfsExtracted} PDF text extractions. Added observed Library section-navigation relationships. Recorded final response URLs, declared canonicals where available, HTTP outcomes, retrieved excerpts and timestamps. SAVY was retrieved through an alternate web fetch after the local collector failed; its record says so.</p></article>
      <article class="method-card"><h3>Coverage is broad, not exhaustive</h3><p>Includes the central hub, educational principles, integrity/policy, Libraries/SPARK, UIT tools and data handling, graduate research, centres/initiatives, law/IP, teaching resources, programmes, continuing education, training and sampled news.</p><p>There is no claim to have found every York AI mention, course, researcher, event, PDF, French page or subdomain. ${m.unvisitedLeads} discovered URLs remain in the explicit retrieval backlog. No complete campus-by-campus or bilingual audit was performed. Many connected-minds/news/workshop records are leads, not recommendations to migrate.</p></article>
      <article class="method-card"><h3>Evidence and authority</h3><p><strong>Analyst-curated source:</strong> manually written summary and recommendation tied to a retrieved source. <strong>Extracted / needs triage:</strong> machine-extracted description, not substantively validated. <strong>Verified alternate fetch:</strong> source content retrieved using another fetch route. Failures are shown explicitly.</p><p>Publishing families are inferred from site identity/URL, not verified legal ownership. Proposed owners and canonical homes require confirmation. "Approved tools" is a topic tag, not a determination that every mentioned tool or use is approved.</p></article>
      <article class="method-card"><h3>Failure and interpretation limits</h3><p>HTTP 404 means the tested URL returned not found; HTTP 500 is a server response, not proof of restricted access. Transport failure may be specific to this network/tool. Password-protected and generic replacement pages are not treated as verified destination content.</p><p>No sign-in, passwords, private systems, analytics, embedded videos, JavaScript-only interactions or tool configurations were inspected. Visual permission states were not inferred from plain text. External funder/vendor/publisher pages were not audited. This is a content audit, not a policy ruling, technical security review or legal opinion.</p></article>
      <article class="method-card"><h3>What counts as duplication?</h3><p>Findings identify overlapping answers, inconsistent interpretations, outdated versions, repeated navigation, marketing surfaces and alternate formats separately. These do not all warrant deletion.</p><p>Exact-text matches are SHA-256 matches of whitespace-normalised extracted body/PDF text, not binary equality or proof of identical legal status. Same-final-URL aliases are grouped separately. No inferred percentage of redundant content or maintenance savings is presented.</p></article>
      <article class="method-card"><h3>How to finish the institution-wide audit</h3><p>Obtain CMS URL exports/sitemaps and analytics from York web owners, add all Faculties/campuses and French counterparts, confirm protected-content inventories with owners, triage the backlog and validate the proposed owner/canonical mapping.</p><p>Run task-based usability sessions with students, instructors, researchers and staff. Complete accessibility testing and content sign-off before production. This dashboard is a local decision aid, not a deployed replacement for York's live site.</p></article>
      <article class="method-card wide"><h3>How the catalogue of need was built</h3><p><strong>1. Mine.</strong> Every captured York resource with usable text (${data.atomicMeta.method.corpusResources}) was read in full to extract each specific question it answers, and each question it raises but leaves unanswered, with a verbatim quote. <strong>2. Benchmark demand.</strong> Public AI hubs at Canadian and international peer universities were scanned for the questions they answer for their own users (${data.atomicMeta.method.peer} peer items). <strong>3. Walk journeys.</strong> Student, instructor, researcher, staff, applicant and partner journeys were walked moment by moment to generate questions (${data.atomicMeta.method.journey}), then checked with York-wide web searches beyond the captured AI pages. Newly found York pages were captured (${m.needsSearchPages}) and added to the inventory.</p><p><strong>4. Synthesise.</strong> ${data.atomicMeta.method.pool} candidate items were clustered in ${data.atomicMeta.method.synthesisBatches} batches into atomic questions: one question, one answer, one audience moment. Near-identical questions were merged; ${data.atomicMeta.method.excluded} trivia or non-questions were excluded. <strong>5. Compute.</strong> Coverage, duplication counts and publisher counts are computed by the build from the evidence, not hand-labelled. The build fails if any quote is not found verbatim in captured text or any URL is not in the inventory.</p><p><strong>Limits.</strong> Needs are analyst-synthesised, not validated through user research. "Answered" means a York page directly answers the question, not that the answer is complete, current or approved. 2+ answering pages flag consolidation candidates; repetition is not automatically redundant. Gaps are bounded-search hypotheses. Peer evidence shows demand only. York-wide search quotes that could not be matched to captured text were dropped.</p></article>
      <article class="method-card wide"><h3>Files and reusable data</h3><div class="downloads"><a href="inventory.csv" download>Full inventory CSV</a><a href="atomic-needs.csv" download>Atomic needs CSV</a><a href="atomic-need-content-map.csv" download>Atomic need-to-content map CSV</a><a href="need-jobs.csv" download>Parent jobs CSV</a><a href="peer-evidence.csv" download>Peer-university demand evidence CSV</a><a href="atomic-needs.json" download>Atomic needs source JSON</a><a href="needs-sources.json" download>York-wide search page captures JSON</a><a href="needs-catalogue.csv" download>v1 job-level catalogue CSV</a><a href="need-content-map.csv" download>v1 need-to-content map CSV</a><a href="discovery-backlog.csv" download>Unretrieved discovery backlog CSV</a><a href="audit-data.json" download>Structured audit JSON</a><a href="sources.json" download>Raw HTML extraction evidence JSON</a><a href="pdf-evidence.json" download>PDF extraction evidence JSON</a><a href="supplemental-evidence.json" download>Alternate-fetch evidence</a><a href="briefing.html">Printable executive briefing</a></div><p style="margin-top:16px">Open index.html locally; no server or installation is required. The dashboard reads its packaged data.js and makes no network requests. External source links require an internet connection. Collection scripts are included for repeatability and require local Node + jsdom, and Python + pypdf for PDF extraction. Re-running the collector overwrites sources.json; preserve dated snapshots before refreshing.</p></article>
      </div>
      <details class="map-family"><summary>Unretrieved discovery backlog <small>${m.unvisitedLeads} URLs</small></summary><div class="map-items">${data.unvisited.map(r=>`<div class="map-item"><div><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.text || r.url)}</a><small>Found on: ${esc(r.from)}</small></div></div>`).join('')}</div></details>
      <details class="map-family"><summary>Excluded endpoints <small>${m.excludedEndpoints} URLs</small></summary><div class="map-items">${data.excluded.map(r=>`<div class="map-item"><div><small>${esc(r.url)}</small><p>${esc(r.reason)}</p></div></div>`).join('')}</div></details>`;
  }
  function openDetail(id) {
    const r=byId.get(id);
    if(!r) return;
    if(!$('detail').open) opener=document.activeElement;
    state.resource=id; writeHash();
    const relationships=(ids,label)=>`<h4>${esc(label)} (${ids.length})</h4><div class="detail-links">${ids.length ? ids.map(i=>detailButton(i)).join(''):'<p>No relationship captured in this bounded graph.</p>'}</div>`;
    const destination = r.finalUrl !== r.url
      ? `<br>Final retrieved URL: <a href="${esc(r.finalUrl)}" target="_blank" rel="noopener noreferrer">${esc(r.finalUrl)}</a>` : '';
    const response = r.http ? `<p>Collector HTTP response: ${r.http}${r.evidence==='Verified alternate fetch'?' (alternate content retrieval is recorded separately)':''}.</p>` : '';
    const variants = r.variants.length > 1
      ? `<details><summary>${r.variants.length} observed URL variants</summary>${r.variants.map(u=>`<p><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(u)}</a></p>`).join('')}</details>` : '';
    const quotes = r.excerpt ? `<blockquote>${esc(r.excerpt)}</blockquote>` : '<p>No intended destination content was verified. The summary describes the referring page or retrieval result, not unseen page content.</p>';
    const clusters = r.clusters.length
      ? '<h4>Related overlap findings</h4>' + r.clusters.map(cid=>`<button class="source-link" data-finding="${esc(cid)}">${esc(data.findings.find(f=>f.id===cid).title)}</button>`).join('') : '';
    const modified = r.modifiedMetadata
      ? 'Page-supplied modified metadata: '+r.modifiedMetadata+'. This is not a content review date.'
      : 'No reliable content-review date was established.';
    $('detail-content').innerHTML = `
      <div class="detail-header">
        <div><p class="eyebrow">${esc(r.owner)} / ${esc(r.kind)}</p><h2 id="detail-title">${esc(r.title)}</h2></div>
        <button id="close-detail" aria-label="Close resource detail">Close</button>
      </div>
      <div class="detail-body">
        <p>${esc(r.summary)}</p><h4>What it addresses</h4><p>${esc(r.addresses)}</p>
        <div class="detail-meta">
          <div><strong>EVIDENCE</strong>${esc(r.evidence)}</div>
          <div><strong>CHECKED</strong>${esc(date(r.checkedAt))}</div>
          <div><strong>PROPOSED ACTION</strong>${esc(r.action)} / ${esc(priorities[r.priority])}</div>
          <div><strong>OBSERVED DISTANCE FROM HUB</strong>${r.hops===null?'No observed path (not proof of orphaning)':r.hops+' link hops'}</div>
          <div><strong>AUDIENCE</strong>${esc(r.audience.join(', '))}</div>
          <div><strong>PUBLISHING FAMILY (INFERRED)</strong>${esc(r.owner)}</div>
        </div>
        <h4>Source and destination</h4><p>${link(r,r.url)}${destination}</p>
        <p>${esc(r.retrievalNote)}</p>${response}${variants}
        <h4>Retrieved source excerpt</h4>${quotes}
        <h4>Proposed future home</h4><p>${esc(r.target)}</p>
        <h4>Consolidation recommendation</h4><p>${esc(r.recommendation)}</p>${clusters}
        <h4>Atomic questions this content answers (${r.atomicIds.length})</h4>
        ${r.atomicIds.length?['Direct answer','Supporting context','Signpost'].map(role=>{const list=r.atomicIds.map(id=>byAtomic.get(id)).filter(n=>n.mappings.find(m=>m.resourceId===r.id).role===role);return list.length?`<details class="detail-needs" ${role==='Direct answer'?'open':''}><summary>${esc(role)} (${list.length})</summary>${list.map(n=>`<button class="source-link" data-need="${esc(n.id)}">${esc(n.question)}</button><p class="muted">${esc(n.coverage)} / answered on ${n.directCount} York page${n.directCount===1?'':'s'}</p>`).join('')}</details>`:'';}).join(''):'<p>Not mapped to an atomic need. This is not a finding that the content is unnecessary.</p>'}
        ${relationships(r.inlinks,'Observed incoming links')}${relationships(r.outlinks,'Observed outgoing links')}
        <p style="margin-top:20px" class="muted">Only relationships among inventoried records are shown. A missing edge is not proof that no site link exists. ${esc(modified)}</p>
      </div>`;
    if(!$('detail').open) $('detail').showModal();
    $('detail').scrollTop=0;
    $('close-detail').focus();
  }
  function closeDetail() {
    $('detail').close();
  }
  function showTab(tab) {
    if(!tabNames.includes(tab)) return;
    state.tab=tab;
    for(const name of tabNames) $(name).hidden=name!==tab;
    for(const button of document.querySelectorAll('.tabs [data-tab]')) {
      button.classList.toggle('active',button.dataset.tab===tab);
      if(button.dataset.tab===tab) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
    }
    writeHash();
  }
  function reset() {
    for(const f of fields) state[f]='';
    state.search='';state.sort='priority';
    state.resourceNeed='';
    syncInputs();renderInventory();writeHash();
  }
  function csvValue(value) {
    let t=String(Array.isArray(value)?value.join(' | '):value??'');
    if(/^[=+\-@\t\r]/.test(t)) t="'"+t;
    return '"'+t.replace(/"/g,'""')+'"';
  }
  function downloadCsv() {
    const keys=['title','url','finalUrl','owner','domain','summary','addresses','topics','audience','action','priority','target','recommendation','evidence','checkedAt','hops','needIds'];
    saveCsv('york-ai-filtered-inventory.csv',keys,filtered());
  }
  function downloadNeedsCsv() {
    const keys=['id','question','statement','jobTitle','domainTitle','audience','moment','priority','coverage','directCount','ownerCount','directOwners','yorkAnswer','conflictNote','origins','directUrls','otherUrls','raisedByUrls','searchStatus','peerInstitutions','proposedHome'];
    const rows=filteredNeeds().map(n=>({...n,directUrls:n.mappings.filter(m=>m.role==='Direct answer').map(m=>byId.get(m.resourceId).url),otherUrls:n.mappings.filter(m=>m.role!=='Direct answer').map(m=>byId.get(m.resourceId).url),raisedByUrls:n.raised.map(x=>byId.get(x.resourceId).url),searchStatus:n.search?.status||'',peerInstitutions:n.peers.map(p=>p.name)}));
    saveCsv('york-ai-filtered-needs.csv',keys,rows);
  }
  function saveCsv(filename,keys,rows) {
    const content='\ufeff'+[keys.join(','),...rows.map(r=>keys.map(k=>csvValue(r[k])).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=filename;a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function init() {
    readHash();
    const fieldKeys={audience:'audience',owner:'owner',domain:'domain',action:'action',evidence:'evidence',topic:'topics'};
    for(const [field,key] of Object.entries(fieldKeys)) {
      const values=unique(data.records.flatMap(r=>Array.isArray(r[key])?r[key]:[r[key]]));
      $(field).insertAdjacentHTML('beforeend',values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join(''));
      if(state[field]&&!values.includes(state[field])) state[field]='';
      $(field).addEventListener('change',()=>{state[field]=$(field).value;renderInventory();writeHash();});
    }
    $('search').addEventListener('input',()=>{state.search=$('search').value;renderInventory();writeHash();});
    $('sort').addEventListener('change',()=>{state.sort=$('sort').value;renderInventory();writeHash();});
    $('view-toggle').addEventListener('click',()=>{state.table=!state.table;syncInputs();renderInventory();writeHash();});
    $('reset').addEventListener('click',reset);
    $('export').addEventListener('click',downloadCsv);
    $('resource-need').insertAdjacentHTML('beforeend',[...data.jobs].sort((a,b)=>a.title.localeCompare(b.title)).map(j=>`<option value="${esc(j.id)}">${esc(j.title)}</option>`).join(''));
    $('resource-need').addEventListener('change',()=>{state.resourceNeed=$('resource-need').value;renderInventory();writeHash();});
    window.addEventListener('hashchange',()=>{
      readHash();syncInputs();syncNeedInputs();renderInventory();renderNeedResults();showTab(state.tab);
      if(state.resource) openDetail(state.resource);
      else {
        if($('detail').open) closeDetail();
        if(state.tab==='needs' && state.need) focusNeed(state.need);
      }
    });
    $('detail').addEventListener('close',()=>{state.resource='';writeHash();if(opener?.isConnected) opener.focus();});
    document.addEventListener('click',e=>{
      const button=e.target.closest('button');
      if(!button) return;
      if(button.id==='close-detail') closeDetail();
      if(button.dataset.tab) showTab(button.dataset.tab);
      if(button.hasAttribute('data-resource')) openDetail(button.dataset.resource);
      if(button.hasAttribute('data-topic')) {state.topic=button.dataset.topic;syncInputs();renderInventory();writeHash();}
      if(button.hasAttribute('data-reset')) reset();
      if(button.hasAttribute('data-needs-reset')) resetNeeds();
      if(button.dataset.need) openNeed(button.dataset.need);
      if(button.dataset.needsLayout) {state.needsLayout=button.dataset.needsLayout;state.need='';syncNeedInputs();renderNeedResults();writeHash();}
      if(button.dataset.matrix!==undefined) {const [d,c]=button.dataset.matrix.split('|');for(const f of needFields) state[f]=defaults[f];state.needsDomain=d;state.needsCoverage=c;state.need='';syncNeedInputs();renderNeedResults();writeHash();$('need-result-count').scrollIntoView({behavior:'smooth',block:'start'});}
      if(button.dataset.copyNeed) {const url=location.href.split('#')[0]+'#view=needs&need='+encodeURIComponent(button.dataset.copyNeed);(navigator.clipboard?navigator.clipboard.writeText(url):Promise.reject()).then(()=>{button.textContent='Link copied';},()=>{button.textContent=url;});}
      if(button.dataset.needContent) {reset();state.resourceNeed=button.dataset.needContent;syncInputs();renderInventory();showTab('inventory');}
      if(button.dataset.finding) {closeDetail();showTab('overlaps');document.getElementById('finding-'+button.dataset.finding).scrollIntoView({behavior:'smooth',block:'start'});}
      if(button.dataset.blueprint) {const card=$('blueprint-'+button.dataset.blueprint);card.scrollIntoView({behavior:'smooth',block:'center'});card.focus({preventScroll:true});}
      if(button.dataset.inventoryTopic) {reset();state.topic=button.dataset.inventoryTopic;syncInputs();renderInventory();showTab('inventory');}
    });
    const m=data.meta;
    $('snapshot-date').textContent=date(m.collectedAt);
    $('metrics').innerHTML=[[m.inventoryRecords,'inventoried resources'],[m.curatedRecords,'analyst-curated summaries'],[m.hostnames,'York hostnames'],[data.findings.length,'overlap & risk clusters'],[m.criticalClusters,'critical clusters to resolve']].map(([n,label])=>`<div class="metric"><strong>${n}</strong><span>${esc(label)}</span></div>`).join('');
    syncInputs();renderInventory();renderNeeds();renderSitemap();renderOverlaps();renderBlueprint();renderMethod();showTab(state.tab);
    if(state.tab==='needs' && state.need) focusNeed(state.need);
    if(state.resource) openDetail(state.resource);
  }
  init();
})();
