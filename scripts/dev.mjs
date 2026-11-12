import {spawn} from 'node:child_process';
import {resolve} from 'node:path';

const root=resolve(import.meta.dirname,'..');
const children=[
  spawn(process.execPath,['server/index.mjs'],{cwd:root,stdio:'inherit'}),
  spawn(process.execPath,['node_modules/vite/bin/vite.js'],{cwd:root,stdio:'inherit'}),
];
let stopping=false;
const stop=signal=>{
  if(stopping)return;
  stopping=true;
  for(const child of children)if(!child.killed)child.kill(signal);
};
process.on('SIGINT',()=>stop('SIGINT'));
process.on('SIGTERM',()=>stop('SIGTERM'));
for(const child of children){
  child.on('exit',(code,signal)=>{
    if(!stopping&&code!==0){process.exitCode=code||1;stop('SIGTERM');}
  });
}
