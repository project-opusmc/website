import {createServer} from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {createHash, randomBytes, scryptSync, timingSafeEqual} from 'node:crypto';
import {createReadStream, existsSync, mkdirSync, statSync} from 'node:fs';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dataDir = process.env.OPUS_DATA_DIR ? resolve(process.env.OPUS_DATA_DIR) : resolve(root, 'server/.data');
mkdirSync(dataDir, {recursive:true});
const db = new DatabaseSync(resolve(dataDir,'opus.db'));
db.exec([
  'PRAGMA foreign_keys = ON;',
  'PRAGMA journal_mode = WAL;',
  'CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE COLLATE NOCASE, email TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL, salt TEXT NOT NULL, plan TEXT NOT NULL DEFAULT "Opus Free", created_at TEXT NOT NULL);',
  'CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);',
  'CREATE TABLE IF NOT EXISTS waitlist (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, interest TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(email,interest));'
].join('\n'));

const lookup = db.prepare('SELECT id,username,email,plan,created_at FROM accounts WHERE id=?');
const sessionLookup = db.prepare('SELECT account_id,expires_at FROM sessions WHERE token_hash=?');
const requests = new Map();
const sessionSeconds = 60 * 60 * 24 * 30;
const vitePort=process.env.OPUS_VITE_PORT||'5173';
const allowedOrigins = new Set(['http://localhost:5173','http://127.0.0.1:5173','http://localhost:5174','http://127.0.0.1:5174','http://localhost:'+vitePort,'http://127.0.0.1:'+vitePort,process.env.OPUS_PUBLIC_ORIGIN || '']);

function json(response,status,data) {
  response.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  response.end(JSON.stringify(data));
}

function fail(response,status,message) {
  json(response,status,{error:message});
}

function publicAccount(record) {
  return {id:record.id,username:record.username,email:record.email,plan:record.plan,createdAt:record.created_at};
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function cookie(request) {
  const pair=(request.headers.cookie||'').split(';').map(part=>part.trim()).find(part=>part.startsWith('opus_session='));
  return pair ? pair.slice('opus_session='.length) : null;
}

function setCookie(response,value,age) {
  const attributes = ['opus_session='+value,'Path=/','HttpOnly','SameSite=Lax','Max-Age='+age];
  if(process.env.NODE_ENV==='production')attributes.push('Secure');
  response.setHeader('Set-Cookie',attributes.join('; '));
}

function beginSession(response,id) {
  const token=randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions (token_hash,account_id,expires_at) VALUES (?,?,?)').run(hash(token),id,Date.now()+sessionSeconds*1000);
  setCookie(response,token,sessionSeconds);
}

function currentAccount(request) {
  const token=cookie(request);
  if(!token||!/^[a-f0-9]{64}$/.test(token))return null;
  const session=sessionLookup.get(hash(token));
  if(!session||session.expires_at<=Date.now())return null;
  const account=lookup.get(session.account_id);
  return account?publicAccount(account):null;
}

function permittedOrigin(request) {
  const origin=request.headers.origin;
  if(!origin)return true;
  if(allowedOrigins.has(origin))return true;
  try {
    const url=new URL(origin);
    const requestHost=request.headers.host||'';
    if(process.env.NODE_ENV==='production')return url.host===requestHost&&url.protocol==='https:';
    return url.host===requestHost&&(url.hostname==='localhost'||url.hostname==='127.0.0.1');
  }catch{return false;}
}

function rateCheck(request) {
  const key=request.socket.remoteAddress||'unknown';
  const now=Date.now();
  const record=requests.get(key);
  if(!record||now-record.since>15*60*1000){requests.set(key,{since:now,count:1});return true;}
  record.count+=1;
  return record.count<=40;
}

async function parse(request) {
  if(!(request.headers['content-type']||'').startsWith('application/json'))throw {status:415,message:'JSON content type required.'};
  const parts=[];
  let bytes=0;
  for await(const part of request){bytes+=part.length;if(bytes>16384)throw {status:413,message:'Request body too large.'};parts.push(part);}
  try {
    const value=JSON.parse(Buffer.concat(parts).toString('utf8'));
    if(!value||Array.isArray(value)||typeof value!=='object')throw Error();
    return value;
  }catch{throw {status:400,message:'Invalid JSON request body.'};}
}

function email(value) {
  return typeof value==='string'?value.trim().toLowerCase():'';
}

function validEmail(value) {
  return value.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function serveStatic(response,pathname) {
  if(process.env.NODE_ENV!=='production')return fail(response,404,'Route not found.');
  let decoded;
  try{decoded=decodeURIComponent(pathname);}catch{return fail(response,400,'Invalid path.');}
  const base=resolve(root,'dist');
  const absolute=resolve(base,'.'+(decoded==='/'?'/index.html':decoded));
  if(!absolute.startsWith(base+sep))return fail(response,404,'Not found.');
  const path=existsSync(absolute)&&statSync(absolute).isFile()?absolute:resolve(base,'index.html');
  if(!existsSync(path))return fail(response,404,'Site has not been built.');
  const mimetype={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.woff2':'font/woff2'}[extname(path)]||'application/octet-stream';
  response.writeHead(200,{'Content-Type':mimetype,'X-Content-Type-Options':'nosniff'});
  createReadStream(path).pipe(response);
}

const server=createServer(async(request,response)=>{
  const url=new URL(request.url||'/','http://localhost');
  if(!url.pathname.startsWith('/api/'))return serveStatic(response,url.pathname);
  if(request.method==='GET'&&url.pathname==='/api/health')return json(response,200,{ok:true});
  if(request.method==='GET'&&url.pathname==='/api/auth/session')return json(response,200,{account:currentAccount(request)});
  if(request.method!=='POST')return fail(response,404,'Route not found.');
  if(!permittedOrigin(request))return fail(response,403,'Request origin is not permitted.');
  if(!rateCheck(request))return fail(response,429,'Too many requests. Try again later.');
  try {
    const data=await parse(request);
    if(url.pathname==='/api/auth/register'){
      const username=typeof data.username==='string'?data.username.trim():'';
      const address=email(data.email);
      const password=data.password;
      if(!/^[A-Za-z0-9_]{3,24}$/.test(username))return fail(response,400,'Username must be 3–24 letters, digits or underscores.');
      if(!validEmail(address))return fail(response,400,'Please enter a valid email address.');
      if(typeof password!=='string'||password.length<10||password.length>128)return fail(response,400,'Password must be 10–128 characters.');
      const salt=randomBytes(24).toString('hex');
      const passwordHash=scryptSync(password,salt,64).toString('hex');
      try {
        const result=db.prepare('INSERT INTO accounts (username,email,password_hash,salt,created_at) VALUES (?,?,?,?,?)').run(username,address,passwordHash,salt,new Date().toISOString());
        const id=Number(result.lastInsertRowid);
        beginSession(response,id);
        return json(response,201,{account:publicAccount(lookup.get(id))});
      }catch(cause){
        if(String(cause).includes('UNIQUE'))return fail(response,409,'This username or email is already in use.');
        throw cause;
      }
    }
    if(url.pathname==='/api/auth/login'){
      const address=email(data.email);
      const password=data.password;
      if(!validEmail(address)||typeof password!=='string'||password.length>128)return fail(response,400,'Invalid email or password.');
      const user=db.prepare('SELECT * FROM accounts WHERE email=?').get(address);
      const computed=scryptSync(password,user?.salt||'000000000000000000000000000000000000000000000000',64);
      const expected=Buffer.from(user?.password_hash||'0'.repeat(128),'hex');
      if(!user||!timingSafeEqual(computed,expected))return fail(response,401,'Invalid email or password.');
      beginSession(response,user.id);
      return json(response,200,{account:publicAccount(user)});
    }
    if(url.pathname==='/api/auth/logout'){
      const token=cookie(request);
      if(token)db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token));
      setCookie(response,'',0);
      return json(response,200,{ok:true});
    }
    if(url.pathname==='/api/waitlist'){
      const address=email(data.email);
      const interest=typeof data.interest==='string'?data.interest.trim().slice(0,100):'';
      if(!validEmail(address)||!interest)return fail(response,400,'Email and interest are required.');
      db.prepare('INSERT OR IGNORE INTO waitlist (email,interest,created_at) VALUES (?,?,?)').run(address,interest,new Date().toISOString());
      return json(response,201,{ok:true});
    }
    return fail(response,404,'Route not found.');
  }catch(cause){
    return fail(response,typeof cause.status==='number'?cause.status:500,typeof cause.status==='number'?cause.message:'An internal server error occurred.');
  }
});

const host=process.env.OPUS_API_HOST||'127.0.0.1';
const port=Number(process.env.OPUS_API_PORT||'8787');
server.listen(port,host,()=>console.log('Opus API listening at http://'+host+':'+server.address().port));
const stop=()=>server.close(()=>{db.close();process.exit(0);});
process.on('SIGINT',stop);
process.on('SIGTERM',stop);
