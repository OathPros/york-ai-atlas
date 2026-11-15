const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const root=__dirname;
const audit=JSON.parse(fs.readFileSync(path.join(root,'audit-data.json'),'utf8'));
const browserPath=process.env.YORK_AUDIT_BROWSER || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const profile=path.join(root,'.browser-test-profile');
const screenshots=path.join(root,'screenshots');
fs.mkdirSync(screenshots,{recursive:true});
const browser=spawn(browserPath,['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-extensions','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','pipe','pipe'],windowsHide:true});
let stderr='',socket,next=1,session,closed=false;
const pending=new Map(),errors=[],remoteRequests=[],checks=[];
const downloadEvents=new Map();
browser.stderr.on('data',b=>{stderr+=b.toString();});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function send(method,params={},sessionId) {
  const id=next++;
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(id);reject(new Error(`CDP timeout: ${method}`));},15000);
    pending.set(id,{resolve,reject,timer});
    socket.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));
  });
}
async function evaluate(expression) {
  const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},session);
  if(result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function check(name,expression) {
  assert.ok(await evaluate(expression),name);checks.push(name);console.log('PASS',name);
}
async function screenshot(file) {
  const result=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
  fs.writeFileSync(path.join(screenshots,file),Buffer.from(result.data,'base64'));
}
async function waitForDownload(file) {
  for(let i=0;i<150;i++) {
    const complete=[...downloadEvents.values()].some(e=>e.filename===path.basename(file) && e.state==='completed');
    if(complete && fs.existsSync(file) && fs.statSync(file).size>0) return;
    await pause(100);
  }
  throw new Error('Download did not complete: '+file);
}
async function main() {
  let endpoint;
  for(let i=0;i<200;i++) {
    endpoint=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/)?.[1];
    if(endpoint) break;
    if(browser.exitCode!==null) throw new Error('Browser exited: '+stderr);
    await pause(100);
  }
  if(!endpoint) throw new Error('No browser debugging endpoint: '+stderr);
  socket=new WebSocket(endpoint);
  await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve,{once:true});socket.addEventListener('error',reject,{once:true});});
  socket.addEventListener('message',event=>{
    const msg=JSON.parse(event.data);
    if(msg.id) {
      const p=pending.get(msg.id);
      if(p) {clearTimeout(p.timer);pending.delete(msg.id);if(msg.error)p.reject(new Error(JSON.stringify(msg.error)));else p.resolve(msg.result);}
    }
    if(msg.method==='Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.text);
    if(msg.method==='Network.requestWillBeSent' && /^https?:/.test(msg.params.request.url)) remoteRequests.push(msg.params.request.url);
    if(msg.method==='Browser.downloadWillBegin') downloadEvents.set(msg.params.guid,{filename:msg.params.suggestedFilename,state:'inProgress'});
    if(msg.method==='Browser.downloadProgress' && downloadEvents.has(msg.params.guid)) downloadEvents.get(msg.params.guid).state=msg.params.state;
  });
  const {targetId}=await send('Target.createTarget',{url:'about:blank'});
  ({sessionId:session}=await send('Target.attachToTarget',{targetId,flatten:true}));
  await send('Runtime.enable',{},session);
  await send('Page.enable',{},session);
  await send('Network.enable',{},session);
  const downloadPath=path.join(root,'.test-downloads');
  fs.mkdirSync(downloadPath,{recursive:true});
  for(const name of ['york-ai-filtered-needs.csv','york-ai-filtered-inventory.csv']) {
    const file=path.join(downloadPath,name);
    if(fs.existsSync(file)) fs.unlinkSync(file);
  }
  await send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath,eventsEnabled:true});
  await send('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0},session);
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false},session);
  await send('Page.navigate',{url:pathToFileURL(path.join(root,'York-AI-Atlas.html')).href},session);
  for(let i=0;i<150;i++){if(await evaluate("document.querySelectorAll('#resource-list .resource-card').length===179"))break;await pause(100);}
  await check('Standalone file renders all 179 resources with network offline',"document.querySelectorAll('#resource-list .resource-card').length===179");
  await check('Desktop viewport has no page-level horizontal overflow',"document.documentElement.scrollWidth<=innerWidth");
  await screenshot('inventory-desktop.png');
  await evaluate("document.querySelector('#resource-list [data-resource=\"students\"]').click()");
  await check('Real native resource dialog opens with evidence',"document.querySelector('#detail').open && document.querySelector('#detail blockquote').textContent.includes('By default')");
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},session);
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},session);
  await pause(100);
  await check('Keyboard Escape closes native dialog',"!document.querySelector('#detail').open");
  await evaluate("document.querySelector('.tabs [data-tab=\"overlaps\"]').click();document.querySelector('.tabs').scrollIntoView()");
  await check(`All ${audit.findings.length} overlap clusters render with source evidence`,`document.querySelectorAll('#overlaps .cluster').length===${audit.findings.length} && document.querySelectorAll('#overlaps blockquote').length>10`);
  await screenshot('overlap-desktop.png');
  await evaluate("document.querySelector('.tabs [data-tab=\"needs\"]').click();document.querySelector('.tabs').scrollIntoView()");
  await check('Atomic needs catalogue renders all outcomes offline',`document.querySelectorAll('#need-list .need-card').length===${audit.needs.length}`);
  await check('Needs desktop layout has no horizontal overflow',"document.documentElement.scrollWidth<=innerWidth");
  await screenshot('needs-desktop.png');
  await evaluate("document.querySelector('#need-course-permission [data-need]').click()");
  await check('One need exposes its multiple content instances',"document.querySelector('#need-course-permission .need-detail').open && document.querySelectorAll('#need-course-permission .need-mapping').length>1 && document.activeElement.id==='need-course-permission'");
  await screenshot('need-evidence-desktop.png');
  await evaluate("document.querySelector('#need-course-permission [data-need-content]').click();document.querySelector('#resource-list [data-resource=\"students\"]').click();document.querySelector('#detail [data-need=\"need-course-permission\"]').click()");
  await pause(100);
  await check('Bidirectional need/content navigation works in native browser',"!document.querySelector('#detail').open && !document.querySelector('#needs').hidden && document.activeElement.id==='need-course-permission'");
  await evaluate("document.querySelector('#needsCoverage').value='Potential gap';document.querySelector('#needsCoverage').dispatchEvent(new Event('change',{bubbles:true}))");
  await check('Potential gaps are separate from claimed direct coverage',`document.querySelectorAll('#need-list .need-card').length===${audit.needsMeta.coverageCounts['Potential gap']} && [...document.querySelectorAll('#need-list .need-counts strong')].every(e=>e.textContent==='0')`);
  await evaluate("document.querySelector('#export-needs').click()");
  const needsCsv=path.join(downloadPath,'york-ai-filtered-needs.csv');
  await waitForDownload(needsCsv);
  assert.ok(fs.existsSync(needsCsv),'Filtered needs CSV download');
  const needsText=fs.readFileSync(needsCsv,'utf8');
  assert.ok(needsText.includes('Potential gap') && needsText.includes('need-human-review'));
  assert.equal(needsText.trim().split(/\r?\n/).length,audit.needsMeta.coverageCounts['Potential gap']+1);
  checks.push('Filtered needs CSV downloads only the matching needs');
  fs.unlinkSync(needsCsv);
  await evaluate("document.querySelector('#needs [data-needs-reset]').click()");
  await evaluate("document.querySelector('.tabs [data-tab=\"inventory\"]').click();document.querySelector('#reset').click();document.querySelector('#search').value='Copilot';document.querySelector('#search').dispatchEvent(new Event('input',{bubbles:true}))");
  await check('Live search filters in real browser',"document.querySelectorAll('#resource-list .resource-card').length>0 && document.querySelectorAll('#resource-list .resource-card').length<179");
  await evaluate("document.querySelector('#export').click()");
  const csvFile=path.join(downloadPath,'york-ai-filtered-inventory.csv');
  await waitForDownload(csvFile);
  assert.ok(fs.existsSync(csvFile),'Real-browser CSV download');
  assert.ok(fs.readFileSync(csvFile,'utf8').includes('Copilot'),'Filtered CSV content');
  checks.push('Filtered CSV downloads with matching source content');
  fs.unlinkSync(csvFile);
  fs.rmdirSync(downloadPath);
  await evaluate("document.querySelector('#reset').click();window.scrollTo(0,0)");
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},session);
  await pause(150);
  await check('Mobile viewport has no page-level horizontal overflow',"document.documentElement.scrollWidth<=innerWidth");
  await screenshot('inventory-mobile.png');
  await evaluate("document.querySelector('.tabs [data-tab=\"needs\"]').click();document.querySelector('#need-human-review [data-need]').click();document.querySelector('#need-human-review').scrollIntoView({behavior:'instant',block:'start'})");
  await check('Expanded need evidence fits the mobile viewport',"document.documentElement.scrollWidth<=innerWidth && document.querySelector('#need-human-review .need-detail').open");
  await screenshot('needs-mobile.png');
  await evaluate("document.querySelector('.tabs [data-tab=\"blueprint\"]').click();document.querySelector('[data-blueprint=\"tools\"]').click()");
  await check('Proposed hub task links focus the correct section',"document.activeElement.id==='blueprint-tools'");
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false},session);
  await send('Page.navigate',{url:pathToFileURL(path.join(root,'York-AI-Atlas.html')).href+'#view=inventory&topic=Citation&resource=policy'},session);
  for(let i=0;i<100;i++){if(await evaluate("document.querySelector('#detail')?.open===true"))break;await pause(100);}
  await check('Shareable deep-link state restores filter and resource dialog',"document.querySelector('#topic').value==='Citation' && document.querySelector('#detail').open && document.querySelector('#detail-title').textContent.includes('Senate')");
  await send('Page.navigate',{url:pathToFileURL(path.join(root,'York-AI-Atlas.html')).href+'#view=needs&need=need-human-review'},session);
  await pause(150);
  await check('Need deep link closes a resource modal and restores focused outcome',"!document.querySelector('#detail').open && !document.querySelector('#needs').hidden && document.querySelector('#need-human-review .need-detail').open && document.activeElement.id==='need-human-review'");
  assert.deepEqual(errors,[],'Browser runtime errors');
  assert.deepEqual(remoteRequests,[],'Dashboard attempted remote requests');
  checks.push('No runtime exceptions or remote page requests');
  fs.writeFileSync(path.join(root,'browser-test-results.json'),JSON.stringify({checkedAt:new Date().toISOString(),browser:'Microsoft Edge (installed Chromium)',offline:true,checks,errors,remoteRequests,screenshots:['inventory-desktop.png','overlap-desktop.png','inventory-mobile.png','needs-desktop.png','need-evidence-desktop.png','needs-mobile.png']},null,2));
  console.log(`All ${checks.length} real-browser checks passed.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{
  try {if(socket?.readyState===WebSocket.OPEN){await send('Browser.close');closed=true;}} catch {}
  socket?.close();
  for(const p of pending.values()){clearTimeout(p.timer);p.reject(new Error('Browser test ended'));}
  pending.clear();
  if(!closed && browser.exitCode===null) console.error(`Browser PID ${browser.pid} may require explicit cleanup.`);
  for(let i=0;i<50 && browser.exitCode===null;i++) await pause(100);
  if(browser.exitCode!==null && fs.existsSync(profile)) fs.rmSync(profile,{recursive:true,force:true});
});
