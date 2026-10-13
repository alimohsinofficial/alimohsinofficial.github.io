/**
 * Blueprint UI — Core Headless Vanilla JavaScript Architecture
 * Dependency-free, offline-first, native-web component system.
 * Idempotent runtime supporting dual registration (Style A { init } & Style B mount(root)).
 */
(function (global) {
  'use strict';

  // Idempotent guard: if the unified core is already installed, do not re-run
  if (global.Blueprint && global.Blueprint.__core) return;

  const mountedMap = new WeakMap();

  const Blueprint = global.Blueprint || {};
  Blueprint.__core = true;
  Blueprint.version = '1.0.0';

  Blueprint._config = Blueprint._config || {
    debug: false,
    autoInit: true
  };

  Blueprint.settings = Blueprint.settings || { debug: false };
  Blueprint._registry = Blueprint._registry || {};
  Blueprint.components = Blueprint.components || {};

  /**
   * Configure Blueprint options
   * @param {Object} options - e.g., { debug: true, autoInit: false }
   */
  Blueprint.config = function (options) {
    if (!options || typeof options !== 'object') return Blueprint._config;
    Object.assign(Blueprint._config, options);
    Object.assign(Blueprint.settings, options);
    return Blueprint._config;
  };

  /**
   * Log a developer warning if debug mode is enabled
   * @param {string} message - Warning message to output
   */
  Blueprint.warn = function (message) {
    if ((Blueprint._config.debug || Blueprint.settings.debug) && typeof console !== 'undefined' && console.warn) {
      console.warn('[Blueprint UI Warning] ' + message);
    }
  };

  /**
   * Shared utilities for component modules
   */
  Blueprint._util = Blueprint._util || {
    /**
     * Idempotency guard keyed per element per component name.
     * WeakMap only: no DOM attributes, so cloned or copied markup still initializes.
     */
    claim: function (el, key) {
      if (!el || !(el instanceof HTMLElement || el.nodeType === 1)) return false;
      let set = mountedMap.get(el);
      if (!set) {
        set = {};
        mountedMap.set(el, set);
      }
      if (set[key]) return false;
      set[key] = true;
      return true;
    },

    /**
     * Dispatch a standardized bubbling, cancelable Blueprint custom event: "blueprint:<type>"
     */
    emit: function (el, type, detail) {
      if (!el || typeof el.dispatchEvent !== 'function') return true;
      const event = new CustomEvent('blueprint:' + type, {
        bubbles: true,
        cancelable: true,
        detail: detail || {}
      });
      return el.dispatchEvent(event);
    }
  };

  /**
   * Initialize a specific component instance safely without duplicate initialization
   * @param {string} name - Registered component name
   * @param {HTMLElement} element - Target element to initialize
   * @param {Object} [options] - Optional initialization options
   * @returns {boolean} True if initialized, false if already initialized or error
   */
  Blueprint.initComponent = function (name, element, options = {}) {
    if (!element || !(element instanceof HTMLElement || element.nodeType === 1)) return false;
    const entry = Blueprint._registry[name];
    if (!entry) return false;

    // Style B mount(root) functions claim their own elements and only scan
    // descendants, so mount from the parent instead of claiming here.
    if (entry._mountStyle) {
      try {
        entry.mount(element.parentNode || element);
        return true;
      } catch (err) {
        Blueprint.warn(`Error mounting '${name}' on element: ${err.message}`);
        return false;
      }
    }

    // Guard duplicate initialization
    if (!Blueprint._util.claim(element, name)) {
      return false;
    }

    try {
      if (typeof entry.init === 'function') {
        entry.init(element, options);
      } else if (typeof entry.mount === 'function') {
        entry.mount(element);
      }
      return true;
    } catch (err) {
      Blueprint.warn(`Error initializing component '${name}' on element: ${err.message}`);
      return false;
    }
  };

  /**
   * Register a component handler with Blueprint.
   * Normalizes both Style A ({ init: fn }) and Style B (mount(root) fn).
   * @param {string} name - Component name (e.g., 'accordion', 'alert', 'tabs')
   * @param {Object|Function} def - Object with { init: fn } or mount(root) function
   */
  Blueprint.register = function (name, def) {
    if (!name || !def) return;

    let entry;
    if (typeof def === 'function') {
      // Style B: mount(root) function
      entry = {
        name: name,
        _mountStyle: true,
        mount: def,
        init: function (target, options) {
          if (target && (target instanceof HTMLElement || target.nodeType === 1)) {
            def(target);
          } else {
            def(target || document);
          }
        }
      };
    } else if (typeof def === 'object') {
      // Style A: Component object with init(element, options)
      entry = def;
      entry.name = name;
      if (typeof entry.mount !== 'function') {
        // Components are activated only as web components: <x-name>.
        const tag = 'x-' + name.replace(/([A-Z])/g, '-$1').toLowerCase();
        entry.mount = function (rootNode = document) {
          if (rootNode.querySelectorAll) {
            const elements = rootNode.querySelectorAll(tag);
            elements.forEach((el) => {
              Blueprint.initComponent(name, el);
            });
          }
          if (rootNode instanceof HTMLElement || (rootNode && rootNode.nodeType === 1)) {
            if (rootNode.tagName && rootNode.tagName.toLowerCase() === tag) {
              Blueprint.initComponent(name, rootNode);
            }
          }
        };
      }
    } else {
      return;
    }

    Blueprint._registry[name] = entry;
    Blueprint.components[name] = entry;

    // Expose Blueprint.<name>.init(root) namespace
    Blueprint[name] = Blueprint[name] || {};
    Blueprint[name].init = function (root) {
      try {
        if (typeof entry.mount === 'function') {
          entry.mount(root || document);
        } else if (typeof entry.init === 'function') {
          entry.init(root || document);
        }
      } catch (err) {
        Blueprint.warn(name + ': init failed — ' + err.message);
      }
    };

    // Define a Light DOM custom element bridge, deferred to a microtask so a
    // component that registers and then defines its own x-* class (in the
    // same script) keeps its class instead of being pre-empted by the bridge.
    const kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase();
    const tagName = 'x-' + kebabName;
    if (typeof customElements !== 'undefined') {
      Promise.resolve().then(() => {
        if (customElements.get(tagName)) return;
        try {
          customElements.define(
            tagName,
            class extends HTMLElement {
              connectedCallback() {
                setTimeout(() => {
                  Blueprint.initComponent(name, this);
                }, 0);
              }
            }
          );
        } catch (err) {
          Blueprint.warn(`Could not define custom element <${tagName}>: ${err.message}`);
        }
      });
    }

    // Registered after auto-init already ran (e.g. a component script loaded
    // after dist/blueprint.js): mount its existing markup now.
    if (Blueprint._booted && typeof document !== 'undefined') {
      Promise.resolve().then(() => {
        try { entry.mount(document); } catch (err) {
          Blueprint.warn(`Error mounting '${name}': ${err.message}`);
        }
      });
    }
  };

  /**
   * Scan a root DOM node and initialize every registered component (<x-name> elements)
   * @param {HTMLElement|Document} [rootNode=document] - Root element or document to scan
   */
  Blueprint.init = function (rootNode = document) {
    if (!rootNode) return Blueprint;

    Object.keys(Blueprint._registry).forEach((name) => {
      const entry = Blueprint._registry[name];
      if (entry) {
        if (typeof entry.mount === 'function') {
          try {
            entry.mount(rootNode);
          } catch (err) {
            Blueprint.warn(`Error mounting '${name}': ${err.message}`);
          }
        } else if (typeof entry.init === 'function') {
          try {
            entry.init(rootNode);
          } catch (err) {
            Blueprint.warn(`Error initializing '${name}': ${err.message}`);
          }
        }
      }
    });

    return Blueprint;
  };

  /**
   * Dispatch a standardized Blueprint custom event
   * @param {HTMLElement} target - Target DOM element
   * @param {string} eventName - e.g., 'open', 'close', 'change', 'select'
   * @param {Object} [detail={}] - Custom event detail payload
   */
  Blueprint.emit = function (target, eventName, detail = {}) {
    return Blueprint._util.emit(target, eventName, detail);
  };

  /**
   * Blueprint.store — shared memory for component UI state (pane widths, collapsed
   * regions, expanded tree nodes, last tab…). One convention for every component:
   *   <x-app-shell persist>            key from the element id (needs an id)
   *   <x-app-shell persist="main">     explicit key
   * Values are JSON under "blueprint:<component>:<key>[:<part>]" in localStorage.
   * Swap the backend (Tauri store, server prefs, sessionStorage, memory) with
   * Blueprint.store.use({ getItem, setItem, removeItem }). Storage errors never throw;
   * when storage is blocked the store falls back to memory for the page's lifetime.
   * Components still emit their change events, so hosts can persist elsewhere instead.
   */
  if (!Blueprint.store) {
    const memory = new Map();
    const memoryAdapter = {
      getItem: (k) => (memory.has(k) ? memory.get(k) : null),
      setItem: (k, v) => { memory.set(k, String(v)); },
      removeItem: (k) => { memory.delete(k); }
    };
    let adapter = null;
    const backend = () => {
      if (adapter) return adapter;
      try {
        const ls = global.localStorage;
        const probe = '__blueprint_probe__';
        ls.setItem(probe, '1'); ls.removeItem(probe);
        adapter = ls;
      } catch (e) { adapter = memoryAdapter; }
      return adapter;
    };
    Blueprint.store = {
      prefix: 'blueprint:',
      /** Replace the storage backend (any object with getItem/setItem/removeItem). */
      use(custom) { adapter = custom || null; return this; },
      get(key, fallback) {
        try {
          const raw = backend().getItem(this.prefix + key);
          return raw == null ? fallback : JSON.parse(raw);
        } catch (e) { return fallback; }
      },
      set(key, value) {
        try {
          if (value === undefined) backend().removeItem(this.prefix + key);
          else backend().setItem(this.prefix + key, JSON.stringify(value));
        } catch (e) {
          // Quota exceeded or storage revoked: keep working from memory.
          adapter = memoryAdapter;
          if (value !== undefined) memoryAdapter.setItem(this.prefix + key, JSON.stringify(value));
        }
      },
      remove(key) { try { backend().removeItem(this.prefix + key); } catch (e) { /* ignore */ } },
      /**
       * Storage key for an element that opted in with the `persist` attribute, or null.
       * keyFor(el, 'app-shell', 'sidebar-width') → "app-shell:<key>:sidebar-width"
       */
      keyFor(el, component, part) {
        if (!el || !el.hasAttribute || !el.hasAttribute('persist')) return null;
        const own = (el.getAttribute('persist') || '').trim();
        const id = own && own !== 'true' ? own : el.id;
        if (!id) { Blueprint.warn(`<${el.localName} persist> needs an id or persist="key" to remember its state.`); return null; }
        return component + ':' + id + (part ? ':' + part : '');
      },
      /** Read a persisted value for an element (fallback when not opted in or empty). */
      read(el, component, part, fallback) {
        const k = this.keyFor(el, component, part);
        return k ? this.get(k, fallback) : fallback;
      },
      /** Write a persisted value for an element; no-op unless the element opted in. */
      write(el, component, part, value) {
        const k = this.keyFor(el, component, part);
        if (k) this.set(k, value);
        return !!k;
      }
    };
  }

  global.Blueprint = Blueprint;

  // Read config off current <script> tag if present
  let noAutoInit = false;
  if (typeof document !== 'undefined') {
    const current = document.currentScript;
    if (current) {
      if (current.hasAttribute('debug')) {
        Blueprint.config({ debug: true });
      }
      if (current.hasAttribute('no-auto-init')) {
        noAutoInit = true;
      }
    }

    function runAutoInit() {
      if (Blueprint._config.autoInit && !noAutoInit) {
        Blueprint._booted = true;
        Blueprint.init(document);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runAutoInit, { once: true });
    } else {
      Promise.resolve().then(runAutoInit);
    }
  }
})(typeof window !== 'undefined' ? window : this);
