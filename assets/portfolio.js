/* Shared portfolio facts and URLs. Edit this plain JavaScript file directly. */
(() => {
  const base = new URL('../', document.currentScript.src);
  const url = path => {
    const target = new URL(path.replace(/^\//, ''), base);
    if (target.protocol === 'file:' && target.pathname.endsWith('/')) target.pathname += 'index.html';
    return target.href;
  };
  window.Portfolio = {
    url,
    name: 'Mohsin Ali',
    role: 'CTO · AI & deep-tech engineering',
    email: 'alimohsin.dev0@gmail.com',
    portrait: url('/assets/images/profile.png'),
    nav: [
      ['overview', '/', 'Overview', 'dashboard'],
      ['blog', '/blog/', 'Notebook', 'notebook'],
      ['projects', '/projects/', 'Projects', 'layers'],
      ['about', '/about/', 'Profile', 'person'],
      ['resume', '/resume/', 'Resume', 'file'],
      ['research', '/research/', 'Research', 'orbit'],
      ['contact', '/contact/', 'Contact', 'signal']
    ],
    projects: [
      {title:'QuantAirSense',category:'Industrial AI',path:'/projects/quantairsense/',text:'Interpretable ML for compressed-air monitoring.',value:'0.99',label:'Reported classifier F1'},
      {title:'AI-AFS',category:'Acoustic intelligence',path:'/projects/acoustic-ai-aquaculture/',text:'Underwater acoustics for salmon feeding behaviour.',value:'878',label:'Hydrophone clips'},
      {title:'Physics-informed modelling',category:'Applied research',path:'/projects/physics-informed-modelling/',text:'Physical constraints meet bioprocess optimisation.',value:'0.913',label:'Reported R²'},
      {title:'R&D delivery platform',category:'Software systems',path:'/projects/portfolio-delivery-platform/',text:'Documentation, coordination, and compliance.',value:'48',label:'Platform modules'}
    ],
    articles: [
      {title:'A new home for the work, and the thinking behind it',path:'/blog/a-new-home/',category:'Field notes',date:'14 OCT 2026',kind:'AI-assisted site note'}
    ],
    career: [['2014','Game & web dev'],['2016','Software engineer'],['2020','CTO · 143Play'],['2023','CTO · Quantonova']],
    research: [
      ['QuantoTrace','Quantum error correction','https://ieeexplore.ieee.org/document/10534391'],
      ['Water quality resilience','Deep reinforcement learning','https://ieeexplore.ieee.org/document/9290601']
    ]
  };
})();
