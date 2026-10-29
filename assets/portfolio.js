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
    contactForm: "<x-contact-form action=\"https://docs.google.com/forms/d/e/1FAIpQLSfTnbNq_cn2CfGCwQTtUNxg5z5Db9USCzMUQllkSMwnDvtIzg/formResponse\" name-field=\"entry.145432747\" email-field=\"entry.1970826621\" subject-field=\"entry.550228167\" message-field=\"entry.2081825816\" subjects=\"General Inquiry|Project Proposal|Support|Feedback|Other\" submit-label=\"Send message \u2197\"></x-contact-form><p class=\"form-provider\">Google Forms handles this message. Confirmation opens in a new tab. <a href=\"https://docs.google.com/forms/d/e/1FAIpQLSfTnbNq_cn2CfGCwQTtUNxg5z5Db9USCzMUQllkSMwnDvtIzg/viewform\" target=\"_blank\" rel=\"noopener\">Open Google form directly \u2197</a></p>",
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
      {"title":"PHP2Shell: the UK’s October cyber emergency, explained","path":"/blog/uk-php2shell-cyber-emergency/","category":"Security","date":"26 OCT 2026","kind":"AI-assisted security analysis","text":"Verified UK response, corrected breach claims, and a practical recovery checklist."},
      {title:'A new home for the work, and the thinking behind it',path:'/blog/a-new-home/',category:'Field notes',date:'14 OCT 2026',kind:'AI-assisted site note'}
    ],
    career: [['2014','Game & web dev'],['2016','Software engineer'],['2020','CTO · 143Play'],['2023','CTO · Quantonova']],
    research: [
      ['QuantoTrace','Quantum error correction','https://ieeexplore.ieee.org/document/10534391'],
      ['Water quality resilience','Deep reinforcement learning','https://ieeexplore.ieee.org/document/9290601']
    ]
  };
})();
