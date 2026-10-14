/* Brief declassification-style overlays; source text stays in the DOM. */
(() => {
 if(typeof IntersectionObserver==='undefined'||typeof Element==='undefined'||typeof Element.prototype.animate!=='function')return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),running=new Set(),waiting=new Set();let seen=new WeakSet();
 const enabled=()=>!reduced.matches&&window.PortfolioMotion?.enabled!==false;
 const remove=entry=>{entry.animations.forEach(a=>a.cancel());entry.bars.forEach(b=>b.remove());entry.element.classList.remove('redaction-target');running.delete(entry);};
 function reveal(element,index=0){
  if(!enabled()||!element.isConnected||seen.has(element))return;seen.add(element);
  const bounds=element.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
  const range=document.createRange();range.selectNodeContents(element);
  const boxes=[...range.getClientRects()].filter(r=>r.width>2&&r.height>3).sort((a,b)=>a.top-b.top||a.left-b.left),lines=[];
  for(const box of boxes){let row=lines.find(r=>Math.abs((r.top+r.bottom)/2-(box.top+box.bottom)/2)<Math.min(r.bottom-r.top,box.height)*.6);if(row){row.left=Math.min(row.left,box.left);row.right=Math.max(row.right,box.right);row.top=Math.min(row.top,box.top);row.bottom=Math.max(row.bottom,box.bottom);}else lines.push({left:box.left,right:box.right,top:box.top,bottom:box.bottom});}
  if(!lines.length)return;
  const entry={element,bars:[],animations:[]};element.classList.add('redaction-target');running.add(entry);
  lines.slice(0,6).forEach((line,i)=>{const bar=document.createElement('span');bar.className='redaction-ink';bar.setAttribute('aria-hidden','true');bar.style.left=Math.max(0,line.left-bounds.left)+'px';bar.style.top=Math.max(0,line.top-bounds.top)+'px';bar.style.width=Math.min(bounds.width,line.right-line.left)+'px';bar.style.height=(line.bottom-line.top)+'px';element.append(bar);entry.bars.push(bar);
    const animation=bar.animate([{transform:'scaleX(1)'},{transform:'scaleX(1)',offset:.27},{transform:'scaleX(0)'}],{duration:620,delay:Math.min(index,4)*55+i*45,easing:'cubic-bezier(.76,0,.24,1)',fill:'forwards'});entry.animations.push(animation);
  });
  Promise.all(entry.animations.map(a=>a.finished)).then(()=>remove(entry)).catch(()=>remove(entry));
 }
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){observer.unobserve(entry.target);waiting.delete(entry.target);reveal(entry.target,Number(entry.target._redactionOrder)||0);}});},{threshold:.15});
 const clear=scope=>{if(scope&&typeof scope.contains!=='function')scope=null;[...running].forEach(entry=>{if(!scope||scope.contains(entry.element))remove(entry);});[...waiting].forEach(el=>{if(!scope||scope.contains(el)){observer.unobserve(el);waiting.delete(el);}});if(!scope)seen=new WeakSet();};
 window.PortfolioTacticalReveals={reveal(scope){clear();if(!enabled())return;scope.querySelectorAll('.hud-record p,.hud-research-record p,.hud-summary>p,.dossier-content p:not(.form-provider)').forEach((el,index)=>{if(el.closest('x-contact-form'))return;el._redactionOrder=index;const bounds=el.getBoundingClientRect(),clip=(el.closest('#view-content,.dossier-content,.dossier-header')||scope).getBoundingClientRect();if(bounds.width&&bounds.bottom>clip.top&&bounds.top<clip.bottom)reveal(el,index);else{waiting.add(el);observer.observe(el);}});},clear};
 document.addEventListener('portfolio:motion',()=>{if(!enabled())clear();});reduced.addEventListener('change',()=>{if(reduced.matches)clear();});window.addEventListener('resize',clear,{passive:true});
 // A focused link or control is never visually obscured by a presentation effect.
 document.addEventListener('focusin',e=>{[...running].forEach(entry=>{if(entry.element.contains(e.target))remove(entry);});});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clear();});
})();
