/* Tactical SPA: hash navigation and local dossiers; no fetch or page reload for content. */
(() => {
  const P=window.Portfolio,D=window.PortfolioDocuments;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const panel=document.getElementById('view-content'),modal=document.getElementById('dossier-modal');
  const nav=['overview','blog','projects','about','resume','research','contact','widgets'];
  const names=['OVERVIEW','FIELD NOTEBOOK','PROJECT INDEX','OWNER PROFILE','RESUME','RESEARCH','CONTACT','SESSION WIDGETS'];
  let currentView='overview',lastFocus=null;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  // Decode only newly opened headings. Accessible labels retain the final wording.
  function revealText(scope){
    if(motion.matches||window.PortfolioMotion?.enabled===false)return;
    scope.querySelectorAll('.view-heading h2,.view-heading .hud-label,#dossier-title').forEach(el=>{
      const label=el.textContent;el.setAttribute('aria-label',label);
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nodes=[];let node;
      while(node=walker.nextNode())nodes.push([node,node.nodeValue]);
      const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+#_';let start,last=0;
      function frame(now){
        if(!el.isConnected)return;
        if(start===undefined)start=now;const progress=motion.matches||window.PortfolioMotion?.enabled===false?1:Math.min(1,(now-start)/640);
        if(now-last>40||progress===1){last=now;for(const [node,text] of nodes){const end=Math.ceil(text.length*progress);node.nodeValue=Array.from(text,(c,i)=>i<end||/\s/.test(c)?c:chars[Math.floor(Math.random()*chars.length)]).join('');}}
        if(progress<1)requestAnimationFrame(frame);else el.removeAttribute('aria-label');
      }
      requestAnimationFrame(frame);
    });
  }
  // Native dialog stays in the top layer, but its frame follows the main panel.
  const main=document.getElementById('view-panel');
  function placeDossier(){
    const r=main.getBoundingClientRect();
    modal.style.left=r.left+'px';modal.style.top=r.top+'px';modal.style.width=r.width+'px';modal.style.height=r.height+'px';
  }
  new ResizeObserver(placeDossier).observe(main);window.addEventListener('resize',placeDossier);

  const record=(path,title,text,extra='')=>`<a class="hud-record" href="#${path.replace(/^\//,'').replace(/\/$/,'')}"><small>${extra}</small><h3>${escape(title)}</h3><p>${escape(text)}</p><span>OPEN DOSSIER ↗</span></a>`;
  const projects=()=>P.projects.map((p,i)=>record(p.path,p.title,p.text,'0'+(i+1)+' / '+escape(p.category.toUpperCase()))).join('');
  const notes=()=>P.articles.map(p=>record(p.path,p.title,'Work, research, and the thinking behind it.',escape(p.date)+' / '+escape(p.kind.toUpperCase()))).join('');
  function render(view){
    currentView=view;document.body.dataset.view=view;
    document.querySelectorAll('.hud-nav a,.hud-mobile-nav a').forEach(a=>{if(a.hash==='#'+view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const studioPaths={overview:'/#intro',blog:'/#notebook',projects:'/#work',about:'/#profile',resume:'/resume/',research:'/#research',contact:'/#contact',widgets:'/'};
    document.querySelector('.studio-switch').href=P.url(studioPaths[view]);
    document.getElementById('hud-more-toggle').classList.toggle('current',['resume','research','contact','widgets'].includes(view));
    const index=nav.indexOf(view);document.getElementById('view-code').textContent='03 / '+names[index];document.getElementById('view-status').textContent='VIEW 0'+(index+1)+' / '+names[index];
    const heading=(label,title,description='')=>`<div class="view-heading"><p class="hud-label">${label}</p><h2>${title}</h2>${description?'<p>'+description+'</p>':''}</div>`;
    if(view==='overview')panel.innerHTML=`${heading('ENGINEERING / AI / DEEP TECH','IDEAS INTO<br><em>WORKING SYSTEMS.</em>','I build software, lead engineering teams, and work on applied research.')}<div class="hud-visual-stage"><div class="visual-scene" data-three-scene="pipeline" aria-hidden="true"><span class="visual-fallback"><i></i><i></i><i></i></span></div><div class="visual-scene" data-pixi-scene="acoustic" aria-hidden="true"><span class="visual-fallback acoustic-fallback"><svg viewBox="0 0 400 160" aria-hidden="true"><path d="M0 80H40q10-18 20 0t20 0h20q10-48 20 0t20 0h20q10-65 20 0t20 0h20q10-35 20 0t20 0h20q10-16 20 0t20 0h40" fill="none" stroke="currentColor" stroke-width="2"/><path d="M0 110H70q10-12 20 0t20 0h35q10-28 20 0t20 0h35q10-20 20 0t20 0h35q10-10 20 0t20 0h35" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/></svg></span></div><div class="hud-visual-caption"><span>INPUTS → MODEL → PRODUCT / CONCEPT</span><span>AI-AFS / ACOUSTIC SIGNAL CONCEPT</span></div></div><div class="overview-stats"><div><b>10+</b><span>YEARS BUILDING</span></div><div><b>04</b><span>PROJECT DOSSIERS</span></div><div><b>02</b><span>CS DEGREES</span></div></div><div class="view-section-title"><span>FIELD NOTEBOOK / LATEST</span><a href="#blog">VIEW ALL ↗</a></div><div class="overview-note">${notes()}</div><div class="view-section-title"><span>SELECTED WORK</span><a href="#projects">VIEW ALL ↗</a></div><div class="overview-projects">${P.projects.slice(0,2).map(p=>`<a href="#${p.path.slice(1,-1)}"><span>${escape(p.category.toUpperCase())}</span><b>${escape(p.title)}</b><i>↗</i></a>`).join('')}</div>`;
    if(view==='projects')panel.innerHTML=`${heading('ENGINEERING / PROJECT INDEX','SELECTED WORK.','Industrial AI, acoustic intelligence, physical modelling, and research delivery.')}<div class="hud-record-grid">${projects()}</div>`;
    if(view==='blog')panel.innerHTML=`${heading('WRITING / FIELD NOTES','THE NOTEBOOK.','AI, engineering, research, and the process of building. AI assistance is disclosed on each note.')}<label class="hud-search">SEARCH NOTES<input type="search" id="hud-note-search" placeholder="Title or topic…"></label><div class="hud-note-list">${notes()}</div><p class="hud-empty" hidden>No notes match your search.</p>`;
    if(view==='about')panel.innerHTML=`${heading('OWNER / BACKGROUND','ENGINEER.<br>RESEARCHER. LEADER.','Based in Dhaka, Bangladesh. Working across software, AI, and deep-tech research.')}<div class="hud-summary"><p>I started in game and web development in 2014. My work now spans technology strategy, full-stack systems, interpretable machine learning, and research delivery.</p><div class="capability-grid"><div><b>BUILD</b><span>Software architecture<br>Cloud & full-stack systems</span></div><div><b>RESEARCH</b><span>AI & machine learning<br>Quantum systems</span></div><div><b>LEAD</b><span>Technical direction<br>Engineering teams</span></div></div><button class="hud-button" data-document="/about/">READ FULL PROFILE ↗</button></div>`;
    if(view==='resume')panel.innerHTML=`${heading('CAREER / EXPERIENCE','THE RESUME.','Engineering, leadership, and applied research.')}<div class="hud-timeline">${[['2023 → NOW','CTO','Quantonova'],['2020 → 2023','CTO','143Play'],['2016 → 2020','Software & game engineer','143Play'],['2014 → 2016','Game & web developer','143Play']].map(([date,role,org])=>`<div><span>${date}</span><h3>${role}</h3><p>${org}</p></div>`).join('')}</div><div class="hud-summary"><p>MSc, Computer Science / Jahangirnagar University, 2017<br>BSc, Computer Science / Daffodil International University, 2016</p><button class="hud-button" data-document="/resume/">OPEN FULL RESUME ↗</button></div>`;
    if(view==='research')panel.innerHTML=`${heading('RESEARCH / PUBLICATIONS','FOLLOW THE EVIDENCE.','Quantum error correction, reinforcement learning, and applied computing.')}<div class="research-records">${P.research.map(([title,topic],i)=>`<button data-document="/research/" class="hud-research-record"><span>0${i+1} / PUBLISHED RESEARCH</span><h3>${escape(title)}</h3><p>${escape(topic)} <b>↗</b></p></button>`).join('')}</div><button class="hud-button" data-document="/research/">ALL PUBLICATIONS & SOURCES ↗</button>`;
    if(view==='contact')panel.innerHTML=`${heading('CONTACT / OPEN CHANNEL','START A CONVERSATION.','Engineering, research collaboration, or turning an idea into a working system.')}${P.contactForm}<div class="hud-contact-links"><a href="https://www.linkedin.com/in/imalimohsin/"><span>LINKEDIN</span><b>/in/imalimohsin</b><i>↗</i></a></div><p class="contact-location">DHAKA, BANGLADESH / UTC +06</p>`;
    if(view==='widgets')panel.innerHTML=heading('SESSION / LOCAL READOUT','SESSION WIDGETS.','The globe and visitor instruments show available browser details and optional location information. IP positions are approximate.');
    panel.querySelector('#hud-note-search')?.addEventListener('input',e=>{let count=0;panel.querySelectorAll('.hud-note-list .hud-record').forEach(card=>{card.hidden=!card.textContent.toLowerCase().includes(e.target.value.toLowerCase());if(!card.hidden)count++;});panel.querySelector('.hud-empty').hidden=count>0;});
    panel.scrollTop=0;revealText(panel);
  }
  function openDocument(path){
    const doc=D[path];if(!doc)return;lastFocus=document.activeElement;
    document.getElementById('dossier-title').textContent=doc.title.replace(/&amp;/g,'&');
    document.getElementById('dossier-studio-link').href=P.url(path);
    const body=document.getElementById('dossier-content');body.innerHTML=doc.html;
    body.querySelector('h1')?.remove();
    const ids=new Map();body.querySelectorAll('[id]').forEach(el=>{const old=el.id;el.id='dossier-'+old;ids.set(old,el.id);});
    body.querySelectorAll('[for],[aria-labelledby],[aria-describedby],[aria-controls]').forEach(el=>{for(const attr of ['for','aria-labelledby','aria-describedby','aria-controls'])if(el.hasAttribute(attr))el.setAttribute(attr,el.getAttribute(attr).split(/\s+/).map(id=>ids.get(id)||id).join(' '));});
    body.querySelectorAll('a[href],img[src]').forEach(el=>{const attr=el.tagName==='IMG'?'src':'href';const value=el.getAttribute(attr);if(value.startsWith('/'))el.setAttribute(attr,P.url(value));});
    body.querySelectorAll('x-copy-button[copy-current-url]').forEach(el=>el.setAttribute('text',location.href));
    body.querySelector('.resume-toolbar')?.remove();
    body.querySelector('.filter-row')?.remove();
    placeDossier();modal.showModal();document.getElementById('dossier-close').focus();body.scrollTop=0;revealText(modal);
  }
  function route(){
    let key;try{key=decodeURIComponent(location.hash.slice(1)).replace(/\/$/,'')||'overview';}catch{key='overview';}
    if(nav.includes(key)){if(modal.open)modal.close();render(key);return;}
    const path='/'+key+'/';
    if(D[path]){if(modal.open)modal.close();render(nav.includes(key.split('/')[0])?key.split('/')[0]:'overview');openDocument(path);}else{if(modal.open)modal.close();render('overview');}
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('a.skip')){e.preventDefault();if(document.body.dataset.view==='widgets')document.querySelector('.hud-widgets button:not(:disabled)')?.focus();else document.getElementById('view-panel').focus();return;}
    const button=e.target.closest('[data-document]');if(button){e.preventDefault();openDocument(button.dataset.document);return;}
    const link=e.target.closest('#dossier-content a[href]');if(!link)return;
    const u=new URL(link.href);if(u.origin===new URL(P.url('/')).origin){const base=new URL(P.url('/')).pathname;let path='/'+u.pathname.slice(base.length);path=path.replace(/index\.html$/,'');if(D[path]){e.preventDefault();modal.close();location.hash=path.slice(1,-1);}}
  });
  const close=()=>{modal.close();if(location.hash.slice(1).includes('/'))location.hash=currentView;if(lastFocus?.isConnected)lastFocus.focus();else document.getElementById('view-panel').focus();};
  document.getElementById('dossier-close').addEventListener('click',close);
  modal.addEventListener('cancel',e=>{e.preventDefault();close();});
  modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  const more=document.getElementById('hud-more-modal'),moreButton=document.getElementById('hud-more-toggle');
  moreButton.addEventListener('click',()=>{more.showModal();moreButton.setAttribute('aria-expanded','true');});
  const closeMore=()=>{if(more.open)more.close();moreButton.setAttribute('aria-expanded','false');};
  document.getElementById('hud-more-close').addEventListener('click',closeMore);more.addEventListener('close',()=>moreButton.setAttribute('aria-expanded','false'));
  more.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMore));
  const tick=()=>{const now=new Date();const local=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);document.getElementById('hud-time').textContent=local;document.getElementById('hud-footer-clock').textContent=local;document.getElementById('hud-date').textContent=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric'}).format(now).toUpperCase();document.getElementById('dhaka-time').textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);};
  tick();setInterval(tick,1000);window.addEventListener('hashchange',()=>{closeMore();route();});route();
})();
