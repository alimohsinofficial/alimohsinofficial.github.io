(() => {
  try {
    const mode = localStorage.getItem('portfolio-mode');
    const theme = localStorage.getItem('blueprint-theme');
    if (['studio', 'tactical'].includes(mode)) document.documentElement.setAttribute('mode', mode);
    const resolved = theme === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
    document.documentElement.setAttribute('theme', ['light','dark'].includes(resolved) ? resolved : 'light');
  } catch {}
})();
