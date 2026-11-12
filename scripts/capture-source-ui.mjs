import {spawn} from 'node:child_process';
import {existsSync, mkdirSync} from 'node:fs';
import {resolve, join} from 'node:path';
import {chromium} from 'playwright';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'web/public/previews');
mkdirSync(output, {recursive:true});
const services = [
  {cwd:resolve(root,'launcher/desktop'),port:5211},
  {cwd:resolve(root,'ui-v2'),port:5212},
];
const children = services.map(({cwd,port})=>spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd,stdio:['ignore','pipe','pipe']}));
const logs = children.map(()=>['']);
children.forEach((child,i)=>{child.stdout.on('data',chunk=>{logs[i][0]+=chunk.toString();});child.stderr.on('data',chunk=>{logs[i][0]+=chunk.toString();});});
const sleep=ms=>new Promise(accept=>setTimeout(accept,ms));
let browser;

async function awaitReady(port) {
  for(let i=0;i<100;i++){
    try{const response=await fetch('http://127.0.0.1:'+port+'/');if(response.status===200)return;}catch{}
    await sleep(160);
  }
  throw new Error('Vite startup failed on '+port);
}

async function snapshot(page,url,filename,selector) {
  await page.goto(url,{waitUntil:'networkidle'});
  await page.locator(selector).first().waitFor({state:'visible',timeout:12000});
  await sleep(900);
  await page.screenshot({path:join(output,filename),animations:'disabled'});
  console.log(filename+' / '+(await page.title()));
}

try {
  await Promise.all(services.map(s=>awaitReady(s.port)));
  browser=await chromium.launch({headless:true,...(process.env.OPUS_CHROMIUM_PATH?{executablePath:process.env.OPUS_CHROMIUM_PATH}:{})});
  const launchPage=await browser.newPage({viewport:{width:1470,height:786},deviceScaleFactor:1});
  await snapshot(launchPage,'http://127.0.0.1:5211/','launcher-home.png','.production-launcher');
  const clientPage=await browser.newPage({viewport:{width:1680,height:900},deviceScaleFactor:1});
  await snapshot(clientPage,'http://127.0.0.1:5212/#/title','client-home.png','.approved-client');
  await snapshot(clientPage,'http://127.0.0.1:5212/#/quick_hub','client-control-center.png','.approved-ingame');
  console.log('Captured approved active UI from current source.');
} finally {
  if(browser)await browser.close();
  for(const child of children)child.kill('SIGTERM');
  await Promise.all(children.map(child=>new Promise(resolve=>child.once('exit',resolve))));
}
