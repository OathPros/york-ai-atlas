const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const OUT = __dirname;
const seeds = [
  'https://www.yorku.ca/ai-at-york/',
  'https://ai.yorku.ca/',
  'https://www.yorku.ca/teachingandlearning/gen-ai/',
  'https://www.yorku.ca/teachingandlearning/gen-ai/gen-ai-101/',
  'https://www.yorku.ca/teachingandlearning/gen-ai/ethics/',
  'https://www.yorku.ca/teachingandlearning/gen-ai/for-students/',
  'https://www.yorku.ca/teachingandlearning/gen-ai/for-faculty/',
  'https://www.yorku.ca/teachingandlearning/gen-ai/graduate-studies-resources/',
  'https://www.yorku.ca/research/use-of-artificial-intelligence-york/',
  'https://www.yorku.ca/uit/cio/artificial-intelligence-initiative/',
  'https://www.yorku.ca/uit/cio/governancepolicies/',
  'https://www.yorku.ca/uit/faculty-and-staff-services/ai/',
  'https://www.yorku.ca/uit/faculty-and-staff-services/ai/prompt-library/',
  'https://www.yorku.ca/uit/faculty-and-staff-services/github/',
  'https://www.yorku.ca/uit/faculty-and-staff-services/microsoft-365-for-faculty-and-staff/handling-university-data-in-microsoft-365/',
  'https://www.yorku.ca/teachingcommons/artificial-intelligence-ai-pedagogies/',
  'https://www.yorku.ca/teachingcommons/resources-by-topic/artificial-intelligence-ai-pedagogical-resources/',
  'https://www.yorku.ca/unit/vpacad/academic-integrity/ai-technology-academic-integrity/',
  'https://www.yorku.ca/unit/vpacad/academic-integrity/ai-technology-and-academic-integrity/',
  'https://www.yorku.ca/secretariat/policies/policies/academic-conduct-policy-and-procedures/',
  'https://www.library.yorku.ca/web/research-learn/artificial-intelligence-citing-academic-integrity/',
  'https://researchguides.library.yorku.ca/AI',
  'https://researchguides.library.yorku.ca/genairesearch',
  'https://researchguides.library.yorku.ca/c.php?g=734320&p=5330448',
  'https://www.yorku.ca/research/cais/',
  'https://www.yorku.ca/research/connected-minds/',
  'https://www.yorku.ca/research/artificial-intelligence-and-society-task-force/',
  'https://www.yorku.ca/research/its/',
  'https://futurestudents.yorku.ca/graduate/programs/artificial-intelligence',
  'https://eecs.gradstudies.yorku.ca/ai/',
  'https://schulich.yorku.ca/programs/mmai/',
  'https://schulich.yorku.ca/achieve/master-management-artificial-intelligence-mmai/',
  'https://schulich.yorku.ca/programs/mban/',
  'https://continue.yorku.ca/programs/certificate-in-machine-learning/',
  'https://continue.yorku.ca/programs/certificate-in-ai-governance/',
  'https://continue.yorku.ca/programs/big-data/',
  'https://lassonde.yorku.ca/eecs/research/research-labs/',
  'https://lassonde.yorku.ca/research/research-facilities-and-centres',
  'https://lassonde.yorku.ca/best/',
  'https://www.yorku.ca/osgoode/ip-innovation-clinic/',
  'https://students.yorku.ca/savy-gpt',
  'https://lthelp.yorku.ca/ai-companion/introduction-to-zoom-ai-companion',
  'https://yulearn.yorku.ca/local/yulearn/learning_opportunity.php?id=1651',
  'https://yulearn.yorku.ca/local/yulearn/learning_opportunity.php?id=1620',
  'https://www.yorku.ca/uit/cio/wp-content/uploads/sites/936/2024/11/20241001-DRAFT-Generative-AI-Guidelines_r2.1.pdf',
  'https://www.yorku.ca/uit/cio/wp-content/uploads/sites/936/2026/02/Guidelines-AI-Chatbots-Assistants.pdf'
];
const relevant = /\b(?:ai|genai|generative|chatgpt|copilot|aura|savy|artificial intelligence|machine learning|intelligence artificielle|connected minds)\b/i;
const extending = process.argv.includes('--extend');
const existing = extending ? JSON.parse(fs.readFileSync(path.join(OUT, 'sources.json'), 'utf8')) : null;
const extraSeeds = extending ? JSON.parse(fs.readFileSync(path.join(OUT, 'extra-urls.json'), 'utf8')) : [];
const seen = new Set(existing?.pages.map(p => p.url) || []);
const discovered = new Map((existing?.discovered || []).map(p => [p.url, p]));
const pages = existing?.pages || [];
const queue = (extending ? extraSeeds : seeds).map(url => ({ url, depth: extending ? 2 : 0, from: extending ? 'Targeted search / gap follow-up' : 'Research seed' }));
const limit = extending ? pages.length + extraSeeds.length : 150;
function normalize(value, base) {
  try {
    const u = new URL(value, base);
    if (!/^https?:$/.test(u.protocol) || !(u.hostname === 'yorku.ca' || u.hostname.endsWith('.yorku.ca'))) return null;
    u.hash = '';
    for (const k of [...u.searchParams.keys()]) if (/^(utm_|fbclid|amp)/i.test(k)) u.searchParams.delete(k);
    return u.href;
  } catch { return null; }
}
async function retrieve(item) {
  const record = { url: item.url, from: item.from, depth: item.depth, checkedAt: new Date().toISOString() };
  try {
    const res = await fetch(item.url, { signal: AbortSignal.timeout(22000), headers: { 'User-Agent': 'YorkAIContentAudit/1.0 (public information inventory; low-volume)' } });
    record.status = res.status;
    record.finalUrl = res.url;
    record.contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      record.error = `HTTP ${res.status}; content not verified`;
      await res.body?.cancel();
      return record;
    }
    if (/pdf/i.test(record.contentType) || /\.pdf(?:$|\?)/i.test(res.url)) {
      record.title = decodeURIComponent(new URL(res.url).pathname.split('/').pop());
      record.kind = 'PDF';
      record.error = 'PDF reachable; text not extracted by collector';
      await res.body?.cancel();
      return record;
    }
    if (!/html/i.test(record.contentType)) {
      record.error = 'Non-HTML response; content not reviewed';
      await res.body?.cancel();
      return record;
    }
    const html = await res.text();
    const document = new JSDOM(html).window.document;
    record.title = document.querySelector('h1')?.textContent.trim() || document.title.trim();
    record.canonical = document.querySelector('link[rel="canonical"]')?.href || '';
    record.description = document.querySelector('meta[name="description"]')?.content || '';
    record.modified = document.querySelector('meta[property="article:modified_time"]')?.content || '';
    const main = document.querySelector('.entry-content') || document.querySelector('main') || document.querySelector('#s-lg-guide-main') || document.querySelector('article') || document.body;
    for (const el of main.querySelectorAll('script,style,nav,header,footer,form,noscript,.breadcrumb,.breadcrumbs')) el.remove();
    record.headings = [...main.querySelectorAll('h1,h2,h3')].map(e => e.textContent.trim()).filter(Boolean);
    record.links = [...main.querySelectorAll('a[href]'), ...document.querySelectorAll('#s-lg-tabs-container a[href]')].map(e => ({ text: e.textContent.trim().replace(/\s+/g, ' '), url: normalize(e.getAttribute('href'), res.url) })).filter(e => e.url);
    record.text = main.textContent.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim().slice(0, 100000);
    record.kind = 'HTML';
    if (/passport york|sign in|log in|^protected:/i.test(record.title) || /login\.|passportyork|login\/index/i.test(res.url)) record.error = 'Authentication/password landing page; destination content not verified';
    if (/ezproxy\./i.test(res.url)) record.error = 'Proxied external publication; outside York-authored content scope';
    if (/About York.s WordPress Service/i.test(record.title)) record.error = 'Redirected to generic WordPress service page, not the intended AI resource';
    if (/just a moment|access denied|robot check|captcha/i.test(record.title)) record.error = 'Automated access blocked; content not verified';
    for (const link of record.links) {
      if (!relevant.test(`${link.text} ${decodeURIComponent(link.url).replace(/[-_/]/g, ' ')}`)) continue;
      if (/\.(?:jpg|jpeg|png|svg|gif|webp|mp4|zip|pptx?|docx?)(?:$|\?)/i.test(link.url)) continue;
      if (/\/(?:wp-json|feed|tag|category|author|events\/event|calendar)\b|[?&](?:share|replytocom)=|\/portal\b|\/login\b/i.test(link.url)) continue;
      if (!discovered.has(link.url)) discovered.set(link.url, { ...link, from: item.url });
      if (item.depth < 2 && !seen.has(link.url)) queue.push({ url: link.url, depth: item.depth + 1, from: item.url });
    }
  } catch (e) { record.error = e.message; }
  return record;
}
async function main() {
  // Sequential requests avoid bursts against university infrastructure.
  while (queue.length && pages.length < limit) {
    const item = queue.shift();
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    const record = await retrieve(item);
    pages.push(record);
    console.log(`${pages.length}: ${record.status || 'ERR'} ${record.url} ${record.error || ''}`);
    fs.writeFileSync(path.join(OUT, 'sources.json'), JSON.stringify({ collectedAt: new Date().toISOString(), seeds, pages, discovered: [...discovered.values()] }, null, 2));
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  console.log(`Collected ${pages.length}; discovered ${discovered.size}.`);
}
main().catch(e => { console.error(e); process.exitCode = 1; });
