/* Add small native line icons to the static portfolio menu. Navigation stays folder-based. */
(() => {
  const strokes={
    Overview:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M5 17c0-4 8-4 8 0M15 9h3M15 13h3"/>',
    Notebook:'<path d="M6 3h14v18H6zM3 6h5M3 11h5M3 16h5M11 7h5M11 11h5M11 15h3"/>',
    Work:'<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/>',
    About:'<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
    Resume:'<path d="M5 2h9l5 5v15H5zM14 2v6h5M8 12h8M8 16h8"/>',
    Research:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(35 12 12)"/>',
    Contact:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="m2 6 10 7 10-7"/>'
  };
  document.querySelectorAll('.nav-row nav a').forEach(link=>{
    const label=link.textContent.trim();link.setAttribute('aria-label',label);
    const glyph=document.createElement('span');glyph.className='studio-menu-icon';glyph.setAttribute('aria-hidden','true');glyph.innerHTML=`<svg viewBox="0 0 24 24">${strokes[label]||strokes.Overview}</svg>`;link.prepend(glyph);
  });
})();
