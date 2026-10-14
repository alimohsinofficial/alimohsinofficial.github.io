/* The URL chooses the experience; each experience remembers its own appearance. */
(() => {
  try {
  const motionPreference=localStorage.getItem('portfolio-motion');
  document.documentElement.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches||motionPreference==='off'||(motionPreference===null&&navigator.connection?.saveData)?'off':'on';
  const experience=document.documentElement.dataset.experience||'studio';
  const saved=localStorage.getItem('portfolio-theme-'+experience);
  const theme=['light','dark'].includes(saved)?saved:(experience==='tactical'?'dark':'light');
  window.PortfolioAppearance={value:theme};
  document.documentElement.setAttribute('theme',theme);
  localStorage.setItem('blueprint-theme',theme);
} catch {}})();
