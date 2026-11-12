import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';

test('account and waitlist API',async()=>{
  const data=mkdtempSync(join(tmpdir(),'opus-api-test-'));
  const child=spawn(process.execPath,['server/index.mjs'],{
    cwd:resolve(import.meta.dirname,'..'),
    env:{...process.env,OPUS_API_HOST:'127.0.0.1',OPUS_API_PORT:'0',OPUS_DATA_DIR:data,NODE_ENV:'test'},
    stdio:['ignore','pipe','pipe'],
  });
  let serverError='';
  child.stderr.on('data',chunk=>{serverError+=chunk.toString();});
  try {
    const base=await new Promise((fulfill,reject)=>{
      const deadline=setTimeout(()=>reject(new Error('Server startup timed out: '+serverError)),10000);
      child.stdout.on('data',chunk=>{
        const text=chunk.toString();
        const match=text.match(/Opus API listening at (http:\/\/[^\s]+)/);
        if(match){clearTimeout(deadline);fulfill(match[1]);}
      });
      child.on('exit',code=>{clearTimeout(deadline);reject(new Error('Server exited: '+code+' '+serverError));});
    });
    const call=async(path,method='GET',body,session)=>{
      return fetch(base+path,{
        method,
        headers:{...(body?{'Content-Type':'application/json'}:{}),...(session?{Cookie:session}:{})},
        body:body?JSON.stringify(body):undefined,
      });
    };
    let response=await call('/api/health');
    assert.equal(response.status,200);
    assert.equal((await response.json()).ok,true);

    response=await call('/api/auth/register','POST',{username:'TestUser',email:'Tester@Example.com',password:'sample-password-123'});
    assert.equal(response.status,201);
    const registered=await response.json();
    assert.equal(registered.account.username,'TestUser');
    assert.equal(registered.account.plan,'Opus Free');
    assert.equal(registered.account.password_hash,undefined);
    const session=response.headers.get('set-cookie').split(';')[0];
    assert.ok(session.startsWith('opus_session='));

    response=await call('/api/auth/session','GET',undefined,session);
    assert.equal((await response.json()).account.email,'tester@example.com');

    response=await call('/api/auth/register','POST',{username:'TestUser',email:'another@example.com',password:'sample-password-123'});
    assert.equal(response.status,409);

    response=await call('/api/auth/logout','POST',{},session);
    assert.equal(response.status,200);
    response=await call('/api/auth/session','GET',undefined,session);
    assert.equal((await response.json()).account,null);

    response=await call('/api/auth/login','POST',{email:'tester@example.com',password:'wrong-password'});
    assert.equal(response.status,401);

    response=await call('/api/auth/login','POST',{email:'tester@example.com',password:'sample-password-123'});
    assert.equal(response.status,200);
    assert.equal((await response.json()).account.username,'TestUser');

    response=await call('/api/waitlist','POST',{email:'Updates@Example.com',interest:'Store opening'});
    assert.equal(response.status,201);
    response=await call('/api/waitlist','POST',{email:'Updates@Example.com',interest:'Store opening'});
    assert.equal(response.status,201);
  }finally{
    child.kill('SIGTERM');
    await new Promise(resolve=>child.once('exit',resolve));
    rmSync(data,{recursive:true,force:true});
  }
});
