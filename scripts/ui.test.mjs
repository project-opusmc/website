import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {join} from 'node:path';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';

const testData=mkdtempSync(join(tmpdir(),'opus-ui-test-'));
const server=spawn(process.execPath,['scripts/dev.mjs'],{cwd:join(import.meta.dirname,'..'),env:{...process.env,OPUS_API_PORT:'18787',OPUS_VITE_PORT:'15173',OPUS_DATA_DIR:testData},stdio:['ignore','pipe','pipe']});
let output='';
server.stdout.on('data',chunk=>{output+=chunk.toString();});
server.stderr.on('data',chunk=>{output+=chunk.toString();});
let browser;
const origin='http://127.0.0.1:15173';
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

try{
  let ready=false;
  for(let attempt=0;attempt<60;attempt++){
    if(server.exitCode!==null)throw new Error('Dev server stopped: '+output);
    try{
      const response=await fetch(origin+'/api/health');
      if(response.ok){ready=true;break;}
    }catch{}
    await sleep(200);
  }
  if(!ready)throw new Error('Dev server did not become ready: '+output);

  browser=await chromium.launch({headless:true,...(process.env.OPUS_CHROMIUM_PATH?{executablePath:process.env.OPUS_CHROMIUM_PATH}:{})});
  const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));

  await page.goto(origin+'/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.hero').count(),1);
  assert.ok((await page.locator('.hero h1').innerText()).includes('Opus'));
  await page.screenshot({path:join(tmpdir(),'opus-website-home-desktop-viewport.png')});
  await page.screenshot({path:join(tmpdir(),'opus-website-home-desktop.png'),fullPage:true});

  await page.goto(origin+'/features',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.feature-directory-item').count(),8);
  await page.getByRole('button',{name:'Gameplay',exact:true}).click();
  assert.equal(await page.locator('.feature-directory-item').count(),2);
  await page.getByRole('button',{name:/Toggle Movement/}).click();
  assert.equal(await page.getByRole('dialog').count(),1);
  await page.getByRole('button',{name:'Close details'}).click();

  await page.goto(origin+'/store',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.product-card').count(),6);
  await page.getByRole('button',{name:'Cloaks',exact:true}).click();
  assert.equal(await page.locator('.product-card').count(),3);
  await page.getByRole('textbox',{name:'Search collection'}).fill('Nocturne');
  assert.equal(await page.locator('.product-card').count(),1);
  await page.getByRole('button',{name:'Add Nocturne Cloak to preview bag'}).click();
  assert.equal(await page.getByRole('dialog',{name:'Preview bag'}).count(),1);
  await page.getByRole('button',{name:'Close bag'}).click();

  await page.goto(origin+'/premium',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.plan-card').count(),3);
  await page.getByRole('button',{name:/Get membership updates/}).first().click();
  await page.getByRole('dialog').getByRole('textbox',{name:'Email address'}).fill('smoke-test@example.com');
  await page.getByRole('dialog').getByRole('button',{name:/Register interest/}).click();
  await page.getByRole('heading',{name:"You're on the list."}).waitFor();
  await page.getByRole('button',{name:'Close'}).first().click();

  await page.goto(origin+'/account',{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Create account'}).click();
  await page.getByRole('textbox',{name:'Username'}).fill('OpusTestA');
  await page.getByRole('textbox',{name:'Email address'}).fill('opus-test-'+Date.now()+'@example.org');
  await page.getByLabel('Password',{exact:true}).fill('long-test-password-123');
  await page.getByLabel('Confirm password').fill('long-test-password-123');
  await page.getByRole('button',{name:/Create account/}).last().click();
  await page.getByRole('heading',{name:'OpusTestA'}).waitFor({timeout:10000});
  await page.getByRole('button',{name:/Sign out/}).click();
  await page.getByRole('button',{name:'Sign in',exact:true}).first().waitFor();

  await page.goto(origin+'/journal',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.journal-list-item').count(),3);
  await page.locator('.journal-list-item').first().click();
  await page.getByRole('heading',{name:'The Opus approach'}).waitFor();

  await page.setViewportSize({width:390,height:844});
  await page.goto(origin+'/',{waitUntil:'networkidle'});
  await page.screenshot({path:join(tmpdir(),'opus-website-home-mobile-viewport.png')});
  await page.screenshot({path:join(tmpdir(),'opus-website-home-mobile.png'),fullPage:true});
  const dimensions=await page.evaluate(()=>({viewport:window.innerWidth,document:document.documentElement.scrollWidth}));
  assert.ok(dimensions.document<=dimensions.viewport+1,'Mobile page overflows horizontally: '+JSON.stringify(dimensions));
  await page.getByRole('button',{name:'Open navigation'}).click();
  assert.equal(await page.locator('.primary-navigation.is-open').count(),1);
  assert.deepEqual(errors,[]);
  console.log('PASS: desktop/mobile routes, features, store, bag, membership, account, journal');
  console.log('Screenshots: '+join(tmpdir(),'opus-website-home-desktop.png'));
  console.log('Screenshots: '+join(tmpdir(),'opus-website-home-mobile.png'));
}catch(cause){
  console.error(cause);
  console.error(output.slice(-3000));
  process.exitCode=1;
}finally{
  if(browser)await browser.close();
  server.kill('SIGTERM');
  await Promise.race([new Promise(resolve=>server.once('exit',resolve)),sleep(1500)]);
  rmSync(testData,{recursive:true,force:true});
}
