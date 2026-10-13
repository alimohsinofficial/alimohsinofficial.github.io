import http from 'node:http';
import { readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
const root=resolve('.');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.pdf':'application/pdf','.xml':'application/xml','.json':'application/json','.txt':'text/plain'};
http.createServer((req,res)=>{
 try {
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  // Match static-host behaviour: directory URLs always end in a slash.
  let path=resolve(root,'.'+pathname);
  if(path!==root&&!path.startsWith(root+sep))throw new Error('Invalid path');
  if(pathname.startsWith('/.git')||pathname.startsWith('/content/')||pathname.startsWith('/docs/')||pathname.startsWith('/scripts/')){res.writeHead(404);res.end('Not found');return;}
  if(statSync(path).isDirectory()){
    if(!pathname.endsWith('/')){res.writeHead(301,{Location:pathname+'/'});res.end();return;}
    path=resolve(path,'index.html');
  }
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(readFileSync(path));
 }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(readFileSync(resolve(root,'404.html')));}
}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/`));
