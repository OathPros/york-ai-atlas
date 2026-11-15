// Catalogue of need v2: parent jobs -> atomic user questions, with coverage computed from verbatim York evidence.
const D = 'Direct answer', C = 'Supporting context', S = 'Signpost';
const roleRank = { [D]:0, [C]:1, [S]:2 };
const coverageOrder = ['Conflicting answers','Gap: not found York-wide','Gap: not in captured content','Unverified answer','Partially answered','Answered'];
const domains = [
  ['orient','Orientation & governance','about','What York is doing about AI, current rules, who decides, where to start'],
  ['permission','Permission to use AI','teaching','Whether a particular AI use is allowed in a course or task'],
  ['disclose','Disclosure & citation','teaching','How to acknowledge, document and cite AI use'],
  ['conduct','Academic conduct & detection','teaching','Suspected misuse, detection, process, penalties and appeals'],
  ['teach','Teaching & assessment design','teaching','Designing courses, assessments and syllabus statements for an AI context'],
  ['literacy','AI literacy & skills','learn','How AI works, limits, verification, prompting and critical use'],
  ['tools','Approved tools & access','tools','Which tools York provides, how to get them, cost and features'],
  ['procure','New tools, building & deployment','tools','Approval of new tools, custom bots, APIs, risk review and oversight'],
  ['meetings','Meetings, recording & transcription','tools','AI note-takers, Zoom/Teams AI companions, recordings and consent'],
  ['data','Data, privacy & security','tools','What data can go into which tool, retention, classification and breaches'],
  ['values','Ethics, equity & sustainability','about','Bias, accessibility, Indigenous data, environment and language'],
  ['recourse','Reporting, incidents & recourse','about','Reporting harm, incidents, deepfakes and contesting AI-informed decisions'],
  ['research','Research practice','research','Using AI in research, ethics review, publishing, grants and computing'],
  ['grad','Graduate studies & theses','research','AI in theses, dissertations, supervision and defences'],
  ['funding','Funding & awards','research','AI-related scholarships, fellowships, grants and their eligibility and deadlines'],
  ['discover','Experts, centres & news','about','Finding York AI researchers, labs, centres, events and stories'],
  ['innovate','Innovation & partnerships','research','Commercialisation, IP, start-ups and industry partnership'],
  ['study','Programs & careers','study','AI programs, courses, credentials and career preparation'],
  ['work','Work & employment','learn','AI in staff roles, hiring, performance and workplace expectations'],
  ['support','Training & help','learn','Workshops, self-paced learning, communities and who to contact']
].map(([id,title,section,description])=>({id,title,section,description}));
const normalise = v => String(v || '').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/\u00a0/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
function buildAtomic(source, records, texts, urlKey, legacyNeeds, blueprint) {
  const byId = new Map(records.map(r=>[r.id,r]));
  const byUrl = new Map();
  for (const r of records) for (const u of [r.url, r.finalUrl, ...r.variants]) if (u) byUrl.set(urlKey(u), r.id);
  const domainIds = new Set(domains.map(d=>d.id));
  const legacy = new Map(legacyNeeds.map(n=>[n.id,n]));
  const jobs = new Map();
  for (const n of legacyNeeds) jobs.set(n.id, { id:n.id, title:n.title, statement:n.statement, origin:'v1 catalogue job', legacyCoverage:n.coverage, owner:n.owner, action:n.action, proposedHome:n.proposedHome, needIds:[] });
  for (const j of source.jobs) {
    if (jobs.has(j.id)) throw new Error('Duplicate job: '+j.id);
    if (!/^job-[a-z0-9-]+$/.test(j.id) || !j.title) throw new Error('Invalid job: '+j.id);
    jobs.set(j.id, { id:j.id, title:j.title, statement:'', origin:'v2 synthesis job', legacyCoverage:null, owner:'', action:'', proposedHome:'', needIds:[] });
  }
  const ids = new Set();
  const needs = source.needs.map(src => {
    if (ids.has(src.id)) throw new Error('Duplicate atomic need: '+src.id);
    ids.add(src.id);
    if (!domainIds.has(src.domain)) throw new Error('Unknown domain: '+src.id+' '+src.domain);
    const job = jobs.get(src.job);
    if (!job) throw new Error('Unknown job: '+src.id+' '+src.job);
    if (!src.question || !src.statement || !src.audience?.length || ![0,1,2,3].includes(src.priority)) throw new Error('Incomplete atomic need: '+src.id);
    const resources = new Map();
    for (const e of src.evidence) {
      const resourceId = byUrl.get(urlKey(e.url));
      if (!resourceId) throw new Error('Evidence URL is not an inventory record: '+src.id+' '+e.url);
      if (!(e.role in roleRank)) throw new Error('Invalid evidence role: '+src.id+' '+e.role);
      if (!e.quote || !normalise(texts.get(resourceId)).includes(normalise(e.quote))) throw new Error('Evidence quote not found in captured text: '+src.id+' / '+resourceId+' / '+e.quote);
      const cur = resources.get(resourceId);
      if (!cur) resources.set(resourceId, { resourceId, role:e.role, gist:e.gist || '', quotes:[e.quote], origins:[e.origin] });
      else {
        if (roleRank[e.role] < roleRank[cur.role]) { cur.role = e.role; if (e.gist) cur.gist = e.gist; }
        if (cur.quotes.length < 2 && !cur.quotes.some(q=>normalise(q)===normalise(e.quote))) cur.quotes.push(e.quote);
        if (!cur.origins.includes(e.origin)) cur.origins.push(e.origin);
      }
    }
    const mappings = [...resources.values()].sort((a,b)=>roleRank[a.role]-roleRank[b.role] || byId.get(a.resourceId).title.localeCompare(byId.get(b.resourceId).title));
    const direct = mappings.filter(m=>m.role===D);
    const raised = (src.raised || []).map(r => {
      const resourceId = byUrl.get(urlKey(r.url));
      if (!resourceId) throw new Error('Raised-by URL is not an inventory record: '+src.id+' '+r.url);
      return { resourceId, gist:r.gist || '' };
    }).filter((r,i,a)=>!resources.has(r.resourceId) && a.findIndex(x=>x.resourceId===r.resourceId)===i);
    const search = src.search || null;
    let coverage;
    if (src.conflict) {
      if (!direct.length || !src.conflictNote) throw new Error('Conflict requires a quoted direct York answer and an explanation: '+src.id);
      coverage = 'Conflicting answers';
    } else if (direct.length) coverage = 'Answered';
    else if (mappings.length) coverage = 'Partially answered';
    else if (search && /answered/i.test(search.status)) coverage = 'Unverified answer';
    else if (search && search.status === 'Not found') coverage = 'Gap: not found York-wide';
    else coverage = 'Gap: not in captured content';
    if (/^Gap/.test(coverage) && !/No York answer/i.test(src.yorkAnswer || 'No York answer identified')) src.yorkAnswer = 'No York answer identified';
    const owners = [...new Set(direct.map(m=>byId.get(m.resourceId).owner))];
    const domain = domains.find(d=>d.id===src.domain);
    const section = blueprint.find(b=>b.id===domain.section);
    job.needIds.push(src.id);
    return {
      id:src.id, domain:src.domain, domainTitle:domain.title, job:src.job, jobTitle:job.title, question:src.question, statement:src.statement,
      audience:src.audience, moment:src.moment || '', priority:src.priority, yorkAnswer:src.yorkAnswer || 'No York answer identified',
      conflict:!!src.conflict, conflictNote:src.conflictNote || '', coverage, mappings, raised, peers:src.peers || [], search,
      origins:src.origins, directCount:direct.length, ownerCount:owners.length, directOwners:owners, contentCount:mappings.length,
      proposedHome:'AI @ York / '+section.title+' / '+domain.title, memberCount:(src.members||[]).length,
      validation:'Analyst-synthesised from content mining, York-wide search, peer benchmarks and journey analysis; not validated through user research'
    };
  });
  for (const r of records) r.atomicIds = needs.filter(n=>n.mappings.some(m=>m.resourceId===r.id)).map(n=>n.id);
  const jobList = [...jobs.values()].filter(j=>j.needIds.length).map(j => {
    const children = needs.filter(n=>n.job===j.id);
    const counts = Object.fromEntries(coverageOrder.map(c=>[c, children.filter(n=>n.coverage===c).length]));
    const domainCounts = {};
    for (const n of children) domainCounts[n.domain] = (domainCounts[n.domain]||0)+1;
    return { ...j, domain:Object.entries(domainCounts).sort((a,b)=>b[1]-a[1])[0][0], coverageCounts:counts, priority:Math.min(...children.map(n=>n.priority)) };
  });
  for (const r of records) r.jobIds = jobList.filter(j=>j.needIds.some(id=>r.atomicIds.includes(id))).map(j=>j.id);
  const unusedLegacy = legacyNeeds.filter(n=>!jobs.get(n.id).needIds.length).map(n=>n.id);
  const meta = {
    total:needs.length, jobs:jobList.length, legacyJobsUsed:jobList.filter(j=>legacy.has(j.id)).length, unusedLegacyJobs:unusedLegacy,
    coverageCounts:Object.fromEntries(coverageOrder.map(c=>[c, needs.filter(n=>n.coverage===c).length])),
    multipleDirect:needs.filter(n=>n.directCount>1).length, multipleOwners:needs.filter(n=>n.ownerCount>1).length,
    mappings:needs.reduce((s,n)=>s+n.mappings.length,0), mappedResources:records.filter(r=>r.atomicIds.length).length,
    peerOnly:needs.filter(n=>n.origins.length===1 && n.origins[0]==='Peer benchmark').length,
    withPeerDemand:needs.filter(n=>n.peers.length).length,
    priorityCounts:[0,1,2,3].map(p=>needs.filter(n=>n.priority===p).length),
    method:source.method
  };
  return { needs, jobs:jobList, domains, coverageOrder, meta };
}
module.exports = { buildAtomic, coverageOrder, domains, normalise };
