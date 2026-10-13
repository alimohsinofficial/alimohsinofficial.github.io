/* A native web component. No framework, build, fetch, or runtime dependencies. */
(() => {
  const P = window.Portfolio;
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const paths = {
    dashboard:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    notebook:'<path d="M6 3h14v18H6zM3 6h5M3 11h5M3 16h5M11 7h5M11 11h5M11 15h3"/>',
    layers:'<path d="m12 3 10 6-10 6L2 9zM2 14l10 6 10-6M2 18l10 6 10-6"/>',
    person:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    file:'<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8M8 16h8"/>',
    orbit:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(35 12 12)"/>',
    signal:'<circle cx="12" cy="12" r="2"/><path d="M6 6a8 8 0 0 0 0 12M18 6a8 8 0 0 1 0 12M3 3a13 13 0 0 0 0 18M21 3a13 13 0 0 1 0 18"/>',
    arrow:'<path d="M5 19 19 5M5 5h14v14"/>',
    home:'<path d="m3 11 9-8 9 8v10H3zM9 21v-8h6v8"/>',
    plus:'<path d="M12 4v16M4 12h16"/>',
    minus:'<path d="M4 12h16"/>',
    target:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">${paths[name] || paths.target}</svg>`;
  const frameTitle = (code, text, extra='') => `<div class="instrument-heading"><span><b>${code}</b> ${text}</span>${extra || '<span class="frame-mark">⌖</span>'}</div>`;
  const route = () => document.body.getAttribute('page') || 'overview';
  const readableText = element => {
    if(!element)return '';
    const copy=element.cloneNode(true);
    copy.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
    return copy.textContent.replace(/\s+/g,' ').trim();
  };

  function topography() {
    // Original, conceptual terrain drawing: not satellite imagery or live telemetry.
    let contours = '';
    const hills = [[340,330,270,190],[820,220,190,130],[795,550,250,170],[175,630,155,105]];
    hills.forEach(([cx,cy,rx,ry], index) => {
      for(let ring=0;ring<16;ring++) {
        const ratio=.12+ring*.058;let d='';
        for(let n=0;n<=100;n++) {
          const angle=n/100*Math.PI*2;
          const wave=1+.13*Math.sin(angle*3+index)+.08*Math.cos(angle*7+ring*.19)+.045*Math.sin(angle*11);
          const x=cx+Math.cos(angle)*rx*ratio*wave;
          const y=cy+Math.sin(angle)*ry*ratio*wave;
          d+=(n?' L':'M')+x.toFixed(1)+','+y.toFixed(1);
        }
        contours+=`<path class="terrain-contour ${ring%4===0?'major':''}" d="${d}Z"/>`;
      }
    });
    let cells='';
    for(let i=0;i<90;i++) {
      const x=370+(i%10)*25+(i%3)*8,y=165+Math.floor(i/10)*28;
      cells+=`<rect x="${x}" y="${y}" width="${10+i%9}" height="${9+i%7}"/>`;
    }
    return `<svg class="terrain-svg" viewBox="0 0 1100 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="sector-grid" width="55" height="55" patternUnits="userSpaceOnUse"><path d="M55 0H0V55" fill="none"/><path d="M27 24v6M24 27h6"/></pattern><pattern id="terrain-dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".6"/></pattern></defs><rect class="map-grid" width="1100" height="800" fill="url(#sector-grid)"/>${contours}<path class="terrain-fill" fill="url(#terrain-dots)" d="M360 170 580 150 650 310 560 410 355 390 320 280Z"/><g class="map-blocks">${cells}</g><path class="map-river" d="M655-30C480 100 680 190 613 302S435 405 564 498 625 613 535 834"/><path class="map-river-bank" d="M670-30C495 100 695 190 628 302S450 405 579 498 640 613 550 834"/><g class="map-roads"><path d="M-20 505 257 435 440 342 750 317 1120 120"/><path d="M30 168 350 250 490 490 775 610 1050 810"/><path d="M180 790 425 518 680 480 1120 510"/></g><g class="map-tracks"><path d="M350 400 245 265 470 180 820 220 825 560 650 635 350 400"/><path d="M245 265 825 560M470 180 650 635"/></g><g class="range-rings"><circle cx="550" cy="390" r="110"/><circle cx="550" cy="390" r="220"/><circle cx="550" cy="390" r="330"/><path d="M550 55v670M190 390h720"/></g><g class="map-labels"><text x="65" y="100">SECTOR 01 / SOFTWARE</text><text x="750" y="105">SECTOR 02 / RESEARCH</text><text x="730" y="710">SECTOR 03 / INTELLIGENCE</text><text x="60" y="720">DHAKA / HOME BASE</text></g></svg>`;
  }

  function readerBlocks(page) {
    const main=document.getElementById('main');const blocks=[];
    const add=(tag,text)=>{if(!text?.trim())return;const el=document.createElement(tag);el.textContent=text.trim();blocks.push(el);};
    const clone=el=>{if(!el)return;const copy=el.cloneNode(true);copy.removeAttribute('id');copy.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));blocks.push(copy);};
    if(page==='article') {
      main.querySelectorAll('.article-body > *').forEach(clone);
    } else if(page==='project') {
      main.querySelectorAll('.case-body > *').forEach(el=>{
        if(el.matches('.metrics')){add('h3','Reported outcomes');el.querySelectorAll('.metric').forEach(m=>add('p',m.textContent));}
        else clone(el);
      });
    } else if(page==='resume') {
      add('h2','Profile');clone(main.querySelector('.resume-summary p'));
      add('h2','Experience');
      main.querySelectorAll('.career-row').forEach(el=>{add('h3',el.querySelector('.period').textContent+' / '+el.querySelector('h3').textContent);el.querySelectorAll('p,li').forEach(n=>add('p',n.textContent));});
      add('h2','Skills');
      main.querySelectorAll('x-accordion details').forEach(el=>{add('h3',el.querySelector('summary').textContent);add('p',[...el.querySelectorAll('.tags span')].map(n=>n.textContent).join(' · '));});
      add('h2','Education');main.querySelectorAll('.education-row').forEach(el=>add('p',el.textContent));
      add('h2','Publications');main.querySelectorAll('.research-row').forEach(el=>{clone(el.querySelector('h3'));clone(el.querySelector('.text-link'));});
      add('h2','Achievements');main.querySelectorAll('.achievement-list li').forEach(el=>add('p',el.textContent));
      const language=main.querySelector('.achievement-list')?.parentElement.querySelector('h3 + p');if(language)add('p',language.textContent);
    } else if(page==='blog') {
      P.articles.forEach(p=>{const el=document.createElement('a');el.className='reader-record';el.href=P.url(p.path);el.innerHTML=`<small>${escape(p.category)} / ${escape(p.date)}</small><h2>${escape(p.title)}</h2><p>${escape(p.kind)} · Open note ↗</p>`;blocks.push(el);});
      add('h3','Writing focus');add('p','AI and machine learning, agent-assisted software development, deep-tech research, and the process of building.');
      const feed=document.createElement('a');feed.href=P.url('/feed.xml');feed.textContent='Subscribe via RSS ↗';blocks.push(feed);
    } else if(page==='projects') {
      P.projects.forEach(p=>{const el=document.createElement('a');el.className='reader-record';el.href=P.url(p.path);el.innerHTML=`<small>${escape(p.category)}</small><h2>${escape(p.title)}</h2><p>${escape(p.text)}</p><span>${escape(p.value)} / ${escape(p.label)} · Open dossier ↗</span>`;blocks.push(el);});
    } else if(page==='research') {
      main.querySelectorAll('.research-row').forEach(el=>{clone(el.querySelector('.eyebrow'));clone(el.querySelector('h3'));el.querySelectorAll('p:not(.eyebrow),a').forEach(clone);});
    } else if(page==='about') {
      main.querySelectorAll('.about-full h2,.about-full p').forEach(clone);
      add('h2','Capabilities');main.querySelectorAll('.service-card').forEach(el=>{clone(el.querySelector('h3'));clone(el.querySelector('p'));});
      main.querySelectorAll('x-accordion details').forEach(el=>{add('h3',el.querySelector('summary').textContent);add('p',[...el.querySelectorAll('.tags span')].map(n=>n.textContent).join(' · '));});
    } else if(page==='contact') {
      add('h2','Start a conversation');add('p','Engineering, research collaboration, or turning an idea into a working system.');
      main.querySelectorAll('.email-link,.social-link').forEach(clone);add('p','Dhaka, Bangladesh · UTC +06:00');
    } else { main.querySelectorAll('h1,p,a.button').forEach(clone); }
    return blocks;
  }

  class PortfolioConsole extends HTMLElement {
    connectedCallback() {
      if(this.ready)return;this.ready=true;this.currentPage=0;this.zoom=1;
      const page=route();const navPage=['article'].includes(page)?'blog':page==='project'?'projects':page;
      const isOverview=page==='overview';
      const title=readableText(document.querySelector('#main h1')) || 'Portfolio';
      this.innerHTML=`<div class="console-shell"><header class="console-topbar"><a class="console-logo" href="${P.url('/')}"><span>m<span>.</span></span><div>MOHSIN ALI<small>PERSONAL PORTFOLIO / CONTROL ROOM</small></div></a><div class="console-topmeta"><span><i class="signal-dot"></i> DHAKA / BD</span><span>23.8103° N · 90.4125° E</span></div><div class="console-appearance"><x-segmented class="console-mode" label="Visual style" value="tactical"><button value="studio">Studio</button><button value="tactical">Tactical</button></x-segmented><x-theme-toggle class="switch" aria-label="Light or dark appearance"></x-theme-toggle></div></header><div class="console-workspace"><nav class="console-rail" aria-label="Tactical navigation">${P.nav.map(([key,path,name,glyph],i)=>`<a href="${P.url(path)}" title="${name}"${navPage===key?' aria-current="page"':''}>${icon(glyph)}<span>${name}</span><small>0${i+1}</small></a>`).join('')}<span class="rail-end">PORTFOLIO<br>INDEX</span></nav><aside class="console-left"><section class="instrument identity-instrument">${frameTitle('01','IDENTITY')}<div class="identity-image"><img src="${P.portrait}" alt="Mohsin Ali" width="1254" height="1254"><div class="portrait-scan"></div><span class="image-corner tl"></span><span class="image-corner tr"></span><span class="image-corner bl"></span><span class="image-corner br"></span><span class="image-id">SUBJECT / MA-001</span></div><div class="identity-copy"><span class="console-kicker">ENGINEER / LEADER / RESEARCHER</span><h1>Mohsin Ali<span>.</span></h1><p>CTO at Quantonova<br>AI, ML & quantum systems</p><div class="identity-stats"><span><b>10+</b><small>YEARS BUILDING</small></span><span><b>2014</b><small>JOURNEY BEGAN</small></span></div><a class="console-action" href="${P.url('/resume/')}">OPEN RESUME ${icon('arrow')}</a></div></section><section class="instrument notebook-instrument">${frameTitle('02','FIELD NOTEBOOK')}<a class="console-note" href="${P.url(P.articles[0].path)}"><time>${P.articles[0].date}</time><h2>${escape(P.articles[0].title)}</h2><span>AI-ASSISTED SITE NOTE ${icon('arrow')}</span></a><a class="console-small-link" href="${P.url('/blog/')}">VIEW ALL WRITING ↗</a></section></aside><div class="console-center"><section class="instrument atlas-instrument${isOverview?'':' has-reader'}">${frameTitle('03',isOverview?'PORTFOLIO ATLAS':escape(navPage.toUpperCase())+' / DOSSIER','<span class="atlas-state">STATIC / LOCAL</span>')}<div class="atlas-stage"><div class="terrain-layer">${topography()}</div><div class="atlas-coordinate top">N 23°48′37″ / E 90°24′45″</div><div class="atlas-coordinate bottom">CONCEPTUAL WORK MAP / NOT LIVE SATELLITE DATA</div><div class="atlas-compass"><span>N</span><b>↑</b><i></i></div><div class="map-scale"><span></span>WORK / RESEARCH / WRITING</div><div class="map-target target-home">${icon('target')}<span>MA / HOME BASE</span></div>${[['blog','/blog/','FIELD NOTES','note',28,32],['projects','/projects/','ENGINEERING','work',72,28],['research','/research/','RESEARCH','research',72,69],['resume','/resume/','CAREER','career',30,71]].map(([key,path,label,cls,x,y])=>`<a class="atlas-node ${cls}" style="--node-x:${x}%;--node-y:${y}%" href="${P.url(path)}"><span class="node-beacon"></span><small>0${P.nav.findIndex(n=>n[0]===key)+1} / ${key.toUpperCase()}</small><b>${label}</b><span class="node-arrow">↗</span></a>`).join('')}<div class="atlas-center-label"><small>ACTIVE SUBJECT</small><strong>MOHSIN ALI</strong><span>SOFTWARE × AI × DEEP TECH</span></div><div class="atlas-tools"><button command="zoom-out" aria-label="Zoom atlas out">${icon('minus')}</button><span class="zoom-label">1.0×</span><button command="zoom-in" aria-label="Zoom atlas in">${icon('plus')}</button><button command="recenter" aria-label="Reset atlas view">${icon('target')}</button></div>${isOverview?'':`<article class="console-reader"><header class="reader-heading"><span class="console-kicker">${escape(page.toUpperCase())} / DOCUMENT VIEW</span><h2>${escape(title)}</h2></header><div class="reader-content" tabindex="0" aria-label="Portfolio document page"></div><div class="reader-pager"><button command="previous-page" aria-label="Previous document page">← PREV</button><span class="reader-page-count" aria-live="polite"></span><button command="next-page" aria-label="Next document page">NEXT →</button></div></article>`}</div></section><section class="instrument journey-instrument">${frameTitle('04','CAREER TRAJECTORY')}<div class="journey-line">${P.career.map(([year,text])=>`<a href="${P.url('/resume/')}"><span class="journey-dot"></span><b>${year}</b><small>${text}</small></a>`).join('')}</div></section></div><aside class="console-right"><section class="instrument project-instrument">${frameTitle('05','ENGINEERING DOSSIERS')}<div class="dossier-list">${P.projects.map((p,i)=>`<a href="${P.url(p.path)}"><span class="dossier-number">0${i+1}</span><div><small>${escape(p.category)}</small><h2>${escape(p.title)}</h2><p>${escape(p.text)}</p></div><span class="dossier-arrow">↗</span></a>`).join('')}</div></section><section class="instrument research-instrument">${frameTitle('06','RESEARCH SIGNAL')}<div class="signal-graphic" aria-hidden="true"><svg viewBox="0 0 300 45"><path d="M0 24h15l5-8 5 20 8-28 7 31 9-20 8 5h16l5-17 8 32 8-28 7 20 9-7h16l9-20 9 34 9-28 8 20 9-5h15l5-15 6 32 8-34 8 21 5-3h20l5-14 7 25 8-21 7 11h25"/></svg></div>${P.research.map(([title,topic,url])=>`<a class="research-signal-link" href="${url}"><div><b>${title}</b><small>${topic}</small></div>${icon('arrow')}</a>`).join('')}<a class="console-small-link" href="${P.url('/research/')}">PUBLICATIONS / ALL ↗</a></section><section class="instrument connect-instrument">${frameTitle('07','COMMUNICATION')}<a href="mailto:${P.email}">${P.email} ↗</a><div><span class="signal-dot"></span>DHAKA / UTC +06:00 <time class="console-clock"></time></div></section></aside></div><footer class="console-status"><span><i class="signal-dot"></i> PERSONAL PORTFOLIO / MOHSIN ALI</span><span>SOFTWARE · AI · QUANTUM · R&D</span><span class="status-mode">TACTICAL VIEW</span><button command="toggle-focus" aria-pressed="false">${icon('target')} FOCUS VIEW</button></footer></div>`;
      this.addEventListener('click',event=>{
        const button=event.target.closest('button[command]');if(!button)return;
        const command=button.getAttribute('command');
        if(command==='next-page')this.showPage(this.currentPage+1);
        if(command==='previous-page')this.showPage(this.currentPage-1);
        if(command==='zoom-in'||command==='zoom-out'||command==='recenter'){
          this.zoom=command==='recenter'?1:Math.min(1.8,Math.max(.8,this.zoom+(command==='zoom-in'?.2:-.2)));
          this.querySelector('.terrain-layer').style.transform=`scale(${this.zoom})`;
          this.querySelector('.zoom-label').textContent=this.zoom.toFixed(1)+'×';
        }
        if(command==='toggle-focus'){
          const active=this.classList.toggle('focus-view');button.setAttribute('aria-pressed',String(active));
        }
      });
      if(page==='article'){
        const byline=document.querySelector('.article-byline');
        if(byline){const meta=document.createElement('p');meta.className='reader-meta';meta.textContent=[...byline.children].map(readableText).join(' / ');this.querySelector('.reader-heading').append(meta);}
      }
      if(!isOverview){this.blocks=readerBlocks(page);this.resizeObserver=new ResizeObserver(()=>this.paginate());this.resizeObserver.observe(this.querySelector('.reader-content'));}
      this.tick();this.timer=setInterval(()=>this.tick(),60000);
    }
    tick(){const clock=this.querySelector('.console-clock');if(clock)clock.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());}
    disconnectedCallback(){clearInterval(this.timer);this.resizeObserver?.disconnect();}
    paginate(){
      const area=this.querySelector('.reader-content');if(!area||area.clientHeight<50)return;
      const previous=this.currentPage;this.pages=[[]];area.replaceChildren();
      const queue=this.blocks.map(el=>el.cloneNode(true));
      let current=this.pages[0];
      while(queue.length){
        const el=queue.shift();area.append(el);
        if(area.scrollHeight>area.clientHeight+1){
          el.remove();
          if(current.length){current=[];this.pages.push(current);area.replaceChildren();queue.unshift(el);continue;}
          // Break long paragraphs and lists into readable pages, without losing content.
          if(el.matches('p,li,ul,pre')){
            if(el.matches('ul')){queue.unshift(...[...el.children].map(n=>{const p=document.createElement('p');p.textContent='• '+n.textContent;return p;}));continue;}
            const words=el.textContent.split(/\s+/);
            if(words.length>12){const mid=Math.ceil(words.length/2);const a=document.createElement('p'),b=document.createElement('p');a.textContent=words.slice(0,mid).join(' ');b.textContent=words.slice(mid).join(' ');queue.unshift(a,b);continue;}
          }
          // Small viewports get a compact block presentation, never page scrolling.
          el.classList.add('compact-record');area.append(el);
        }
        current.push(el.cloneNode(true));
      }
      this.showPage(Math.min(previous,this.pages.length-1),false);
    }
    showPage(index,focus=true){
      if(!this.pages||index<0||index>=this.pages.length)return;
      this.currentPage=index;
      const area=this.querySelector('.reader-content');area.replaceChildren(...this.pages[index].map(el=>el.cloneNode(true)));
      this.querySelector('.reader-page-count').textContent=`PAGE ${String(index+1).padStart(2,'0')} / ${String(this.pages.length).padStart(2,'0')}`;
      this.querySelector('[command="previous-page"]').disabled=index===0;
      this.querySelector('[command="next-page"]').disabled=index===this.pages.length-1;
      if(focus)area.focus({preventScroll:true});
    }
  }
  customElements.define('x-portfolio-console',PortfolioConsole);
})();
