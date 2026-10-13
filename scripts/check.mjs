import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve('.');const manifest=JSON.parse(readFileSync('docs/build-manifest.json','utf8'));let links=0;
for(const route of manifest.routes){
 const path=route==='/'?'index.html':route==='/404.html'?'404.html':route.slice(1)+'index.html';const html=readFileSync(path,'utf8');
 if(!html.includes('<h1>')||!html.includes('<meta name="description"'))throw new Error(`Missing page structure: ${path}`);
 for(const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){
  const url=match[1].split('?')[0];const target=url.endsWith('/')?url.slice(1)+'index.html':url.slice(1);
  if(!existsSync(resolve(root,target)))throw new Error(`Broken local link ${url} in ${path}`);links++;
 }
 if(html.includes('ryancv')||html.includes('bslthemes'))throw new Error(`Legacy template metadata in ${path}`);
}
if(manifest.posts.includes('your-article-slug'))throw new Error('Draft article leaked into site');
console.log(`Checked ${manifest.routes.length} pages and ${links} internal references; draft template excluded.`);
