import { mkdir, readFile, writeFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import imported from './imported-catalog.json';
import { type Catalog, type Snapshot } from './catalog';
export const dataDirectory=()=>process.env.ADMIN_DATA_DIR||path.resolve(process.cwd(),'.data/admin');
async function withLock<T>(fn:()=>Promise<T>):Promise<T>{
const directory=dataDirectory();await mkdir(directory,{recursive:true});const lock=path.join(directory,'.lock');let acquired=false;
for(let attempt=0;attempt<100;attempt++){try{await mkdir(lock);acquired=true;break}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;await new Promise(r=>setTimeout(r,50))}}
if(!acquired)throw Error('다른 저장 작업이 진행 중입니다. 잠시 후 다시 시도해주세요.');
try{return await fn()}finally{await rm(lock,{recursive:true,force:true})}}
async function readState():Promise<Snapshot>{try{return JSON.parse(await readFile(path.join(dataDirectory(),'catalog.json'),'utf8'))}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;const snapshot={catalog:imported as Catalog,revision:1,updatedAt:new Date().toISOString()};await writeState(snapshot);return snapshot}}
async function writeState(snapshot:Snapshot){const target=path.join(dataDirectory(),'catalog.json'),temp=target+'.'+crypto.randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(snapshot));await rename(temp,target)}
export async function readCatalog():Promise<Snapshot>{return withLock(readState)}
export async function writeCatalog(catalog:Catalog,revision:number):Promise<Snapshot|null>{return withLock(async()=>{const current=await readState();if(current.revision!==revision)return null;const snapshot={catalog,revision:revision+1,updatedAt:new Date().toISOString()};await writeState(snapshot);return snapshot})}
