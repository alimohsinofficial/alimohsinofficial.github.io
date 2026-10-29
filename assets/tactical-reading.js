/* Scroll-linked reading in internal viewports; source text stays normal accessible HTML.
   Headings retain their scramble. Record passages retain their separate blackout effect. */
(() => {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const passages=new Map(),roots=new Set();let pending=0;
  const enabled=()=>!reduced.matches&&window.PortfolioMotion?.enabled!==false&&!document.hidden;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function paint(){
    pending=0;
    for(const [el,state] of passages){
      if(!el.isConnected){passages.delete(el);continue;}
      const bounds=el.getBoundingClientRect(),view=state.root.getBoundingClientRect();
      if(!bounds.width||!view.height||bounds.bottom<view.top||bounds.top>view.bottom)continue;
      const progress=enabled()?clamp((view.height*.85-(bounds.top-view.top))/(view.height*.65)):1;
      el.style.setProperty('--reading-progress',progress.toFixed(3));
      state.words.forEach((word,i)=>{
        const amount=clamp(progress*(state.words.length+3)-i);
        word.style.setProperty('--reading-alpha',(0.74+amount*.26).toFixed(3));
        word.style.setProperty('--reading-shift',((1-amount)*2).toFixed(2)+'px');
      });
    }
  }
  function schedule(){if(!pending)pending=requestAnimationFrame(paint);}
  function discover(){
    for(const [el] of passages)if(!el.isConnected)passages.delete(el);
    document.querySelectorAll('.hud-scroll-statement>p,.dossier-content .lede').forEach(el=>{
      if(passages.has(el)||el.closest('h1,h2,h3,h4,h5,h6,x-contact-form'))return;
      const root=el.closest('#view-content,.dossier-content');if(!root)return;
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];let node;
      while(node=walker.nextNode())if(!node.parentElement.closest('a,button,code,svg'))nodes.push(node);
      const words=[];
      for(const text of nodes){
        const fragment=document.createDocumentFragment();
        for(const part of text.nodeValue.split(/(\s+)/)){
          if(!part)continue;
          if(/^\s+$/.test(part)){fragment.append(document.createTextNode(part));continue;}
          const span=document.createElement('span');span.className='reading-word';span.textContent=part;words.push(span);fragment.append(span);
        }
        text.replaceWith(fragment);
      }
      el.classList.add('reading-passage');passages.set(el,{root,words});
      if(!roots.has(root)){roots.add(root);root.addEventListener('scroll',schedule,{passive:true});}
    });
    schedule();
  }
  const views=[document.getElementById('view-content'),document.getElementById('dossier-content')].filter(Boolean);
  // Only direct view replacements are observed; generated word spans cannot trigger a loop.
  views.forEach(view=>new MutationObserver(discover).observe(view,{childList:true}));
  document.addEventListener('portfolio:motion',schedule);reduced.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',schedule);window.addEventListener('resize',schedule,{passive:true});
  document.addEventListener('focusin',e=>{const el=e.target.closest('.reading-passage');if(el){const state=passages.get(el);state?.words.forEach(word=>{word.style.setProperty('--reading-alpha','1');word.style.setProperty('--reading-shift','0px');});}});
  discover();
})();
