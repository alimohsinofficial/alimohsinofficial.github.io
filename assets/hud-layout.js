/* Military HUD composition. Plain markup rendered by the existing console component. */
window.PortfolioHudLayout = ({P,page,title,icon,escape,frameTitle}) => {
  const section=page==='article'?'blog':page==='project'?'projects':page;
  const overview=page==='overview';
  return `<div class="console-shell hud-shell">
    <header class="console-topbar hud-topbar">
      <a class="console-logo" href="${P.url('/')}"><span>m<span>.</span></span><div>MOHSIN ALI<small>PERSONAL PORTFOLIO / SATELLITE INTERFACE</small></div></a>
      <div class="hud-top-position"><span>OWNER / DHAKA</span><b>23.8103° N <i>+</i> 90.4125° E</b></div>
      <div class="console-appearance"><x-segmented class="console-mode" label="Visual style" value="tactical"><button value="studio">Studio</button><button value="tactical">Tactical</button></x-segmented><x-theme-toggle class="switch" aria-label="Light or dark appearance"></x-theme-toggle></div>
    </header>
    <div class="console-workspace hud-workspace">
      <nav class="console-rail hud-rail" aria-label="Tactical navigation">${P.nav.map(([key,path,name,glyph],i)=>`<a href="${P.url(path)}" aria-label="${name}" title="${name}"${section===key?' aria-current="page"':''}>${icon(glyph)}<span>${name}</span><small>0${i+1}</small></a>`).join('')}<span class="rail-end">MA / 01<br>PORTFOLIO</span></nav>
      <aside class="console-left hud-owner-column">
        <section class="instrument hud-identity">${frameTitle('01','OWNER PROFILE')}
          <div class="hud-profile-photo"><img src="${P.portrait}" alt="Mohsin Ali" width="1254" height="1254"><span class="hud-photo-crosshair"></span><span>MA / DHAKA</span></div>
          <div class="hud-identity-copy"><span class="console-kicker">ENGINEER / CTO / RESEARCHER</span><h1>Mohsin Ali<span>.</span></h1><p>AI, ML & quantum systems<br>Chief Technology Officer, Quantonova</p><div class="hud-owner-facts"><span>BASED IN</span><b>DHAKA, BANGLADESH</b><span>BUILDING SINCE</span><b>2014 / 10+ YEARS</b></div><a class="console-action" href="${P.url('/resume/')}">OPEN RESUME ${icon('arrow')}</a></div>
        </section>
        <section class="instrument hud-notebook">${frameTitle('02','FIELD NOTEBOOK')}<a href="${P.url(P.articles[0].path)}"><time>${P.articles[0].date}</time><h2>${escape(P.articles[0].title)}</h2><span>AI-ASSISTED SITE NOTE ↗</span></a><a class="console-small-link" href="${P.url('/blog/')}">ALL WRITING / OPEN ↗</a></section>
      </aside>
      <div class="console-center hud-center">
        <section class="instrument hud-map-frame">${frameTitle('03',overview?'OWNER + VISITOR / LOCATION MAP':escape(section.toUpperCase())+' / DOCUMENT','<span class="hud-map-status">'+(overview?'GEOGRAPHIC / 3D':'PAGED READER')+'</span>')}
          <div class="hud-map-stage">
            <x-location-map id="visitor-map"></x-location-map>
            ${overview?'':`<article class="console-reader"><header class="reader-heading"><span class="console-kicker">${escape(page.toUpperCase())} / DOCUMENT VIEW</span><h2>${escape(title)}</h2></header><div class="reader-content" tabindex="0" aria-label="Portfolio document page"></div><div class="reader-pager"><button command="previous-page" aria-label="Previous document page">← PREV</button><span class="reader-page-count" aria-live="polite"></span><button command="next-page" aria-label="Next document page">NEXT →</button></div></article>`}
          </div>
        </section>
        <section class="instrument hud-work-index">${frameTitle('04','ENGINEERING / SELECTED DOSSIERS')}<div class="hud-project-links">${P.projects.map((project,i)=>`<a href="${P.url(project.path)}"><span>0${i+1}</span><div><small>${escape(project.category)}</small><b>${escape(project.title)}</b></div>${icon('arrow')}</a>`).join('')}</div></section>
      </div>
      <aside class="console-right hud-visitor-column">
        <section class="instrument hud-visitor">${frameTitle('05','VISITOR / SESSION READOUT')}<x-visitor-info></x-visitor-info></section>
        <section class="instrument hud-clock">${frameTitle('06','REAL-TIME CLOCK')}<div class="hud-clock-face"><svg class="hud-analog-clock" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="45"/><circle cx="50" cy="50" r="39"/>${Array.from({length:12},(_,i)=>`<path d="M50 7v5" transform="rotate(${i*30} 50 50)"/>`).join('')}<path class="clock-hour" d="M50 50V29"/><path class="clock-minute" d="M50 50V17"/><path class="clock-second" d="M50 59V13"/><circle cx="50" cy="50" r="2"/></svg><div><span>YOUR LOCAL TIME</span><time class="hud-local-clock">--:--:--</time><span class="hud-local-date"></span></div></div><div class="hud-clock-dhaka"><span>DHAKA / UTC +06</span><time class="console-clock">--:--:--</time></div></section>
      </aside>
    </div>
    <footer class="console-status hud-status"><span><i class="signal-dot"></i> MOHSIN ALI / PERSONAL PORTFOLIO</span><span>OWNER LOCATION: CITY CENTRE · VISITOR: PERMISSION / IP ESTIMATE</span><button command="toggle-focus" aria-pressed="false">${icon('target')} FOCUS VIEW</button></footer>
  </div>`;
};
