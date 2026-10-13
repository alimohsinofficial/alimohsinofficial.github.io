/**
 * Blueprint UI — Segmented Control (`components/segmented/segmented.js`)
 * Activated only as <x-segmented>
 * Ingested from: ContextBase assets/css/app.css (.segment, css:256-258), templates/settings.html
 * (theme / density segments), viewbar row-height segment; Fluent / APG radio group.
 *
 * <x-segmented name="theme" value="light" label="Theme">
 *   <button value="light">Light</button>
 *   <button value="dark">Dark</button>
 *   <button value="system" aria-label="System"><x-icon name="monitor"></x-icon></button>
 * </x-segmented>
 *
 * Single selection like a radio group: role="radiogroup" on the host, role="radio" +
 * aria-checked + .active on each item, one Tab stop, arrow keys move and select.
 * Form-associated (ElementInternals): submits `name=value`, supports reset, required, disabled.
 */
(function (global) {
  'use strict';
  if (typeof document === 'undefined') return;
  const B = global.Blueprint = global.Blueprint || {};
  const emit = (el, type, detail) => (B.emit ? B.emit(el, type, detail)
    : el.dispatchEvent(new CustomEvent('blueprint:' + type, { bubbles: true, cancelable: true, detail: detail || {} })));

  const valueOf = (it) => (it.hasAttribute('value') ? it.getAttribute('value') : it.textContent.trim());

  function itemsOf(host) {
    return Array.from(host.children).filter((c) => c.matches('button, [item]'));
  }

  function init(host) {
    if (!host || host._seg) return;
    const st = host._seg = { value: null, def: null };

    function disabledHost() { return host.hasAttribute('disabled') || !!host._formDisabled; }
    function itemDisabled(it) { return disabledHost() || it.disabled || it.hasAttribute('disabled') || it.getAttribute('aria-disabled') === 'true'; }

    function sync() {
      host.setAttribute('role', 'radiogroup');
      const label = host.getAttribute('label');
      if (label) host.setAttribute('aria-label', label);
      if (disabledHost()) host.setAttribute('aria-disabled', 'true'); else host.removeAttribute('aria-disabled');
      if (host.hasAttribute('required')) host.setAttribute('aria-required', 'true'); else host.removeAttribute('aria-required');
      const list = itemsOf(host);
      let checked = null;
      list.forEach((it) => {
        if (it.tagName === 'BUTTON' && !it.hasAttribute('type')) it.type = 'button';
        it.setAttribute('role', 'radio');
        const on = st.value != null && valueOf(it) === st.value;
        it.setAttribute('aria-checked', String(on));
        it.classList.toggle('active', on);
        if (on) checked = it;
        if (disabledHost() && !it.disabled) it.setAttribute('aria-disabled', 'true');
        else if (!disabledHost() && it._segAria) it.removeAttribute('aria-disabled');
        if (disabledHost()) it._segAria = true;
        // Icon-only segments: the accessible name doubles as a tooltip.
        if (!it.title && it.getAttribute('aria-label') && !it.textContent.trim()) it.title = it.getAttribute('aria-label');
      });
      const stop = checked && !itemDisabled(checked) ? checked : list.find((it) => !itemDisabled(it));
      list.forEach((it) => { it.tabIndex = it === stop && !disabledHost() ? 0 : -1; });
      updateForm();
      if (st.mo) st.mo.takeRecords();
    }

    function updateForm() {
      const int = host._internals;
      if (!int) return;
      try { int.setFormValue(st.value == null ? null : st.value); } catch (e) { /* not in a form */ }
      if (host.hasAttribute('required') && (st.value == null || st.value === '')) {
        const first = itemsOf(host)[0];
        int.setValidity({ valueMissing: true }, host.getAttribute('required-message') || 'Please select an option.', first || undefined);
      } else int.setValidity({});
    }

    function select(it, user) {
      if (!it || itemDisabled(it)) return false;
      const value = valueOf(it);
      const previous = st.value;
      if (value === previous) return false;
      st.value = value;
      sync();
      if (user) {
        if (!emit(host, 'change', { value, previous, item: it })) { st.value = previous; sync(); return false; }
        host.dispatchEvent(new Event('input', { bubbles: true }));
        host.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    }
    st.select = select;
    st.sync = sync;

    host.addEventListener('click', (e) => {
      const it = e.target.closest && e.target.closest('button, [item]');
      if (!it || it.parentElement !== host) return;
      if (itemDisabled(it)) { e.preventDefault(); return; }
      select(it, true);
    });

    host.addEventListener('keydown', (e) => {
      const it = e.target.closest && e.target.closest('button, [item]');
      if (!it || it.parentElement !== host || e.altKey || e.ctrlKey || e.metaKey) return;
      const list = itemsOf(host).filter((x) => !itemDisabled(x));
      if (!list.length) return;
      const rtl = getComputedStyle(host).direction === 'rtl';
      let i = list.indexOf(it);
      let n = -1;
      if (e.key === 'ArrowDown' || e.key === (rtl ? 'ArrowLeft' : 'ArrowRight')) n = (i + 1) % list.length;
      else if (e.key === 'ArrowUp' || e.key === (rtl ? 'ArrowRight' : 'ArrowLeft')) n = (i - 1 + list.length) % list.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = list.length - 1;
      else if ((e.key === ' ' || e.key === 'Enter') && it.tagName !== 'BUTTON') { e.preventDefault(); select(it, true); return; }
      if (n < 0) return;
      e.preventDefault();
      select(list[n], true);
      list[n].focus();
    });

    // Initial value: attribute, else a pre-marked item (.active / aria-checked / aria-pressed).
    const attr = host.getAttribute('value');
    if (attr != null) st.value = attr;
    else {
      const pre = itemsOf(host).find((it) => it.classList.contains('active') || it.getAttribute('aria-checked') === 'true' || it.getAttribute('aria-pressed') === 'true');
      st.value = pre ? valueOf(pre) : null;
    }
    // aria-pressed belongs to toggle buttons; radios use aria-checked.
    itemsOf(host).forEach((it) => it.removeAttribute('aria-pressed'));
    st.def = st.value;

    st.mo = new MutationObserver(() => sync());
    st.mo.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['value', 'disabled', 'aria-label'] });
    sync();
  }

  class XSegmented extends HTMLElement {
    static get formAssociated() { return true; }
    static get observedAttributes() { return ['value', 'disabled', 'required', 'label']; }
    constructor() {
      super();
      this._internals = this.attachInternals ? this.attachInternals() : null;
      this._formDisabled = false;
    }
    connectedCallback() {
      if (this._seg) return;
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => init(this), { once: true });
      else init(this);
    }
    attributeChangedCallback(name, oldV, newV) {
      const s = this._seg;
      if (!s) return;
      if (name === 'value') {
        if (newV !== s.value) { s.value = newV; s.def = newV; }
      }
      s.sync();
    }
    get value() { return this._seg ? (this._seg.value == null ? '' : this._seg.value) : (this.getAttribute('value') || ''); }
    set value(v) {
      if (!this._seg) { this.setAttribute('value', v == null ? '' : String(v)); return; }
      this._seg.value = v == null || v === '' ? null : String(v);
      this._seg.sync();
    }
    get selectedItem() { return itemsOf(this).find((it) => it.getAttribute('aria-checked') === 'true') || null; }
    get name() { return this.getAttribute('name') || ''; }
    set name(v) { this.setAttribute('name', v); }
    get disabled() { return this.hasAttribute('disabled'); }
    set disabled(v) { this.toggleAttribute('disabled', !!v); }
    get required() { return this.hasAttribute('required'); }
    set required(v) { this.toggleAttribute('required', !!v); }
    get form() { return this._internals ? this._internals.form : null; }
    get validity() { return this._internals ? this._internals.validity : null; }
    get validationMessage() { return this._internals ? this._internals.validationMessage : ''; }
    checkValidity() { return this._internals ? this._internals.checkValidity() : true; }
    reportValidity() { return this._internals ? this._internals.reportValidity() : true; }
    refresh() { if (this._seg) this._seg.sync(); }
    focus(opts) {
      const it = itemsOf(this).find((x) => x.tabIndex === 0);
      if (it) it.focus(opts); else HTMLElement.prototype.focus.call(this, opts);
    }
    formResetCallback() { if (this._seg) { this._seg.value = this._seg.def; this._seg.sync(); } }
    formStateRestoreCallback(state) { if (this._seg) { this._seg.value = state == null ? null : String(state); this._seg.sync(); } }
    formDisabledCallback(d) { this._formDisabled = d; if (this._seg) this._seg.sync(); }
  }
  if (typeof customElements !== 'undefined' && !customElements.get('x-segmented')) customElements.define('x-segmented', XSegmented);
  if (typeof B.register === 'function') B.register('segmented', { init });
})(typeof window !== 'undefined' ? window : this);
