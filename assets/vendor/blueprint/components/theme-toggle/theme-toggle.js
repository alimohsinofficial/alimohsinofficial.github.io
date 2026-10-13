/**
 * Blueprint UI — Theme Toggle & Live Theme Generator (`components/theme-toggle/theme-toggle.js`)
 *
 * <x-theme-toggle> picks the page theme: light, dark or system. The theme is applied to <html> as
 * theme="light|dark|system" and data-theme="light|dark" (removed for system) and remembered in
 * localStorage['blueprint-theme']. Every toggle on the page shares that one state: they listen for
 * the document event `blueprint:theme`, for `storage` events (other tabs) and for changes to the
 * <html> theme attributes made by other code.
 *
 * The control it renders depends on its structure class (the only classes the script reads,
 * because each one needs different ARIA; it re-renders when they change):
 *   (none)      icon button cycling light → dark → system           <button>
 *   segmented   Light | Dark | Auto with a sliding thumb             role="radiogroup" + role="radio"
 *   switch      light ↔ dark switch, sun/moon in the thumb           role="switch"
 *   menu        icon button opening a Light / Dark / System menu     menu button + role="menuitemradio"
 * Pure look classes (icons, labels, sm, lg) are CSS only.
 *
 * <x-theme-generator> (same file): controls with theme-var="--name" (optional unit="px") write that
 * custom property on <html>; an element with theme-export receives the generated :root CSS.
 */
(function (global) {
  'use strict';
  if (typeof document === 'undefined') return;

  const KEY = 'blueprint-theme';
  const THEMES = ['light', 'dark', 'system'];
  const NAMES = { light: 'Light', dark: 'Dark', system: 'System' };
  const SHORT = { light: 'Light', dark: 'Dark', system: 'Auto' };
  const ICONS = { light: 'sun', dark: 'moon', system: 'monitor' };

  // Lucide paths (ISC). They are the <x-icon> fallback, so the icons show even when the full
  // Lucide set (or components/icon) is not loaded; a loaded library takes over by name.
  const PATHS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
    moon: '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    check: '<path d="M20 6 9 17l-5-5"/>'
  };
  function icon(name, cls) {
    return '<x-icon name="' + name + '"' + (cls ? ' class="' + cls + '"' : '') + ' aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + PATHS[name] + '</svg></x-icon>';
  }

  const mq = global.matchMedia ? global.matchMedia('(prefers-color-scheme: dark)') : null;
  let current = null;
  let uid = 0;

  const valid = (t) => THEMES.indexOf(t) !== -1;
  const resolved = (t) => (t === 'system' ? (mq && mq.matches ? 'dark' : 'light') : t);
  const next = (t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length];

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function fromRoot() {
    const r = document.documentElement;
    const t = r.getAttribute('theme') || r.getAttribute('data-theme');
    return valid(t) ? t : null;
  }

  function setTheme(theme, save = true) {
    if (!valid(theme)) theme = 'system';
    current = theme;
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
    // Skins in dist/skins/ select on theme="light|dark|system".
    root.setAttribute('theme', theme);
    if (save) {
      try { localStorage.setItem(KEY, theme); } catch (e) { /* storage blocked */ }
    }
    document.dispatchEvent(new CustomEvent('blueprint:theme', { detail: { theme } }));
  }

  function getTheme() {
    if (current === null) current = (valid(stored()) && stored()) || fromRoot() || 'system';
    return current;
  }

  function syncAll() {
    document.querySelectorAll('x-theme-toggle').forEach((el) => { if (el._tt) sync(el); });
  }

  // One set of page-wide listeners keeps every toggle in step.
  let wired = false;
  function wire() {
    if (wired) return;
    wired = true;
    document.addEventListener('blueprint:theme', syncAll);
    global.addEventListener('storage', (e) => {
      if (e.key !== KEY && e.key !== null) return;
      const t = stored();
      setTheme(valid(t) ? t : 'system', false);
    });
    // Another script (a site header, an app setting) changed <html theme>: follow it.
    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(() => {
        const t = fromRoot() || 'system';
        if (t !== current) { current = t; syncAll(); }
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['theme', 'data-theme'] });
    }
    // The switch shows the resolved theme, which follows the OS while on "system".
    if (mq && mq.addEventListener) mq.addEventListener('change', syncAll);
  }

  function choose(el, theme) {
    if (theme === getTheme()) return;
    setTheme(theme, true);
    if (global.Blueprint && global.Blueprint.emit) global.Blueprint.emit(el, 'change', { theme });
  }

  function lookOf(el) {
    const c = el.classList;
    return c.contains('menu') ? 'menu' : c.contains('switch') ? 'switch' : c.contains('segmented') ? 'segmented' : 'cycle';
  }

  function make(tag, cls, attrs) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
    return n;
  }

  /* ---- builders: each returns the parts sync() needs --------------------------------------- */

  const BUILD = {
    cycle(el, on) {
      const button = make('button', 'theme-toggle-button', { type: 'button' });
      el.append(button);
      on(button, 'click', () => choose(el, next(getTheme())));
      return { button };
    },

    segmented(el, on) {
      el.setAttribute('role', 'radiogroup');
      if (!el.hasAttribute('aria-labelledby')) el.setAttribute('aria-label', el._ttAuthorLabel || 'Theme');
      const thumb = make('span', 'theme-toggle-thumb', { 'aria-hidden': 'true' });
      el.append(thumb);
      const options = THEMES.map((t) => {
        const b = make('button', 'theme-toggle-option', {
          type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: '-1',
          'aria-label': t === 'system' ? 'Auto (system)' : SHORT[t]
        });
        b._theme = t;
        b.innerHTML = icon(ICONS[t]) + '<span class="theme-toggle-label">' + SHORT[t] + '</span>';
        on(b, 'click', () => choose(el, t));
        el.append(b);
        return b;
      });
      on(el, 'keydown', (e) => {
        const i = options.indexOf(document.activeElement);
        if (i === -1) return;
        const rtl = getComputedStyle(el).direction === 'rtl';
        let j = null;
        if (e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) j = (i + 1) % options.length;
        else if (e.key === 'ArrowUp' || e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) j = (i - 1 + options.length) % options.length;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = options.length - 1;
        if (j === null) return;
        e.preventDefault();
        // Radio group: moving the focus selects.
        options[j].focus();
        choose(el, options[j]._theme);
      });
      return { options };
    },

    switch(el, on) {
      const button = make('button', 'theme-toggle-switch', { type: 'button', role: 'switch', 'aria-checked': 'false' });
      button.innerHTML = '<span class="theme-toggle-track" aria-hidden="true"><span class="theme-toggle-thumb"></span></span>' +
        '<span class="theme-toggle-label">Dark mode</span>';
      button.setAttribute('aria-label', el._ttAuthorLabel || 'Dark mode');
      el.append(button);
      on(button, 'click', () => choose(el, resolved(getTheme()) === 'dark' ? 'light' : 'dark'));
      return { button, thumb: button.querySelector('.theme-toggle-thumb') };
    },

    menu(el, on) {
      const id = 'x-theme-toggle-' + (++uid);
      const button = make('button', 'theme-toggle-button', {
        type: 'button', id: id + '-button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': id + '-menu'
      });
      const menu = make('div', 'theme-toggle-menu', { id: id + '-menu', role: 'menu', 'aria-label': 'Theme' });
      menu.hidden = true;
      const items = THEMES.map((t) => {
        const item = make('button', 'theme-toggle-item', { type: 'button', role: 'menuitemradio', 'aria-checked': 'false', tabindex: '-1' });
        item._theme = t;
        item.innerHTML = icon(ICONS[t]) + '<span class="theme-toggle-label">' + NAMES[t] + '</span>' + icon('check', 'theme-toggle-check');
        on(item, 'click', () => { choose(el, t); close(true); });
        menu.append(item);
        return item;
      });
      el.append(button, menu);

      const L = () => global.Blueprint && global.Blueprint.layer;
      const outside = (e) => { if (!el.contains(e.target)) close(false); };
      function open(focusIndex) {
        if (!menu.hidden) return;
        const layer = L();
        if (!(layer && layer.open(menu, button, { placement: 'bottom-end', offset: 6, onClose: () => close(false) }))) menu.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        document.addEventListener('pointerdown', outside, true);
        const i = focusIndex == null ? THEMES.indexOf(getTheme()) : focusIndex;
        items[Math.max(0, i)].focus();
      }
      function close(restoreFocus) {
        if (menu.hidden) return;
        const layer = L();
        if (layer && layer.isOpen(menu)) layer.close(menu);
        menu.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        document.removeEventListener('pointerdown', outside, true);
        if (restoreFocus) button.focus();
      }

      on(button, 'click', () => (menu.hidden ? open() : close(true)));
      on(button, 'keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); open(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); open(items.length - 1); }
      });
      on(menu, 'keydown', (e) => {
        const i = items.indexOf(document.activeElement);
        let j = null;
        if (e.key === 'ArrowDown') j = (i + 1) % items.length;
        else if (e.key === 'ArrowUp') j = (i - 1 + items.length) % items.length;
        else if (e.key === 'Home') j = 0;
        else if (e.key === 'End') j = items.length - 1;
        else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); return; }
        else if (e.key === 'Tab') { close(false); return; }
        else if (e.key.length === 1) {
          const k = e.key.toLowerCase();
          j = THEMES.findIndex((t) => NAMES[t].toLowerCase().charAt(0) === k);
          if (j === -1) j = null;
        }
        if (j === null) return;
        e.preventDefault();
        items[j].focus();
      });
      on(el, 'focusout', (e) => { if (e.relatedTarget && !el.contains(e.relatedTarget)) close(false); });
      return { button, menu, items, close: () => close(false) };
    }
  };

  /* ---- sync: reflect the shared theme ------------------------------------------------------- */

  function sync(el) {
    const p = el._tt;
    const theme = getTheme();
    const changed = p.shown != null && p.shown !== theme;
    p.shown = theme;
    const swap = changed ? 'theme-toggle-swap' : '';

    if (p.look === 'cycle' || p.look === 'menu') {
      p.button.innerHTML = icon(ICONS[theme], swap) + '<span class="theme-toggle-label">' + NAMES[theme] + '</span>';
      // Says the state and, for the cycle button, what a click does; reads well as a tooltip too.
      p.button.setAttribute('aria-label', el._ttAuthorLabel || (p.look === 'cycle'
        ? 'Theme: ' + NAMES[theme] + ' (switch to ' + NAMES[next(theme)] + ')'
        : 'Theme: ' + NAMES[theme]));
    }
    if (p.look === 'menu') {
      p.items.forEach((item) => {
        const on = item._theme === theme;
        item.setAttribute('aria-checked', String(on));
        item.classList.toggle('active', on);
      });
    }
    if (p.look === 'segmented') {
      const index = THEMES.indexOf(theme);
      el.style.setProperty('--theme-index', String(index));
      p.options.forEach((b, i) => {
        const on = i === index;
        b.setAttribute('aria-checked', String(on));
        b.setAttribute('tabindex', on ? '0' : '-1');
        b.classList.toggle('active', on);
      });
    }
    if (p.look === 'switch') {
      const dark = resolved(theme) === 'dark';
      p.button.setAttribute('aria-checked', String(dark));
      p.button.classList.toggle('active', dark);
      if (p.dark !== dark) p.thumb.innerHTML = icon(dark ? 'moon' : 'sun', p.dark == null ? '' : 'theme-toggle-swap');
      p.dark = dark;
    }
  }

  function render(el) {
    const prev = el._tt;
    if (prev) {
      if (prev.close) prev.close();
      prev.abort.abort();
    }
    // An authored aria-label names the control: the radiogroup host, or the inner button.
    if (el._ttAuthorLabel === undefined) el._ttAuthorLabel = el.getAttribute('aria-label');
    el.removeAttribute('role');
    el.removeAttribute('aria-label');
    el.style.removeProperty('--theme-index');
    el.replaceChildren();

    const look = lookOf(el);
    const abort = new AbortController();
    const on = (target, type, fn, opts) => target.addEventListener(type, fn, Object.assign({ signal: abort.signal }, opts));
    el._tt = Object.assign({ look, abort, shown: null }, BUILD[look](el, on));
    sync(el);
  }

  const ThemeToggle = {
    init(element) {
      if (!element || element._bpReady) return;
      element._bpReady = true;
      wire();
      // The first toggle restores the saved choice (stored value, else <html> attributes, else system).
      if (current === null) setTheme(getTheme(), false);
      render(element);
      if (typeof MutationObserver !== 'undefined') {
        new MutationObserver(() => { if (lookOf(element) !== element._tt.look) render(element); })
          .observe(element, { attributes: true, attributeFilter: ['class'] });
      }
    },

    setTheme,
    getTheme,

    // <x-theme-generator>: controls with theme-var="--name" (optional unit="px"), output in [theme-export]
    initGenerator(container) {
      if (!container || container._bpReady) return;
      container._bpReady = true;
      const inputs = Array.from(container.querySelectorAll('[theme-var]'));
      const outputArea = container.querySelector('[theme-export]');

      const updateExport = () => {
        if (!outputArea) return;
        let css = ':root {\n';
        inputs.forEach((input) => {
          const varName = input.getAttribute('theme-var');
          const val = input.value + (input.getAttribute('unit') || '');
          css += `  ${varName}: ${val};\n`;
        });
        css += '}';
        if (outputArea.tagName.toLowerCase() === 'textarea' || outputArea.tagName.toLowerCase() === 'input') {
          outputArea.value = css;
        } else {
          outputArea.textContent = css;
        }
      };

      inputs.forEach((input) => {
        const varName = input.getAttribute('theme-var');
        // Set initial input value from current computed style
        const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        if (computed && !input.value) {
          if (input.type === 'color' && computed.startsWith('#') && computed.length === 7) {
            input.value = computed;
          }
        }

        // 'input' from native controls and <x-select>; 'blueprint:change' from <x-color-picker>.
        const apply = () => {
          const val = input.value + (input.getAttribute('unit') || '');
          document.documentElement.style.setProperty(varName, val);
          updateExport();
        };
        input.addEventListener('input', apply);
        input.addEventListener('blueprint:change', apply);
      });

      updateExport();
    }
  };

  if (global.Blueprint && typeof global.Blueprint.register === 'function') {
    global.Blueprint.register('theme-toggle', ThemeToggle);
    global.Blueprint.ThemeGenerator = ThemeToggle;
  }

  // Light DOM Custom Element <x-theme-generator>
  if (typeof customElements !== 'undefined' && typeof HTMLElement !== 'undefined' && !customElements.get('x-theme-generator')) {
    try {
      customElements.define('x-theme-generator', class extends HTMLElement {
        connectedCallback() {
          setTimeout(() => ThemeToggle.initGenerator(this), 0);
        }
      });
    } catch (e) {
      if (global.Blueprint) global.Blueprint.warn('Could not define <x-theme-generator>: ' + e.message);
    }
  }

  global.BlueprintThemeToggle = ThemeToggle;
})(typeof window !== 'undefined' ? window : this);
