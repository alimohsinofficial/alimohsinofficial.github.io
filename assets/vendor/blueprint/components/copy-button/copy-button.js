/**
 * Blueprint UI — Copy Button Component (`components/copy-button/copy-button.js`)
 * Copies target element text or explicit string payload to clipboard with visual confirmation.
 * Activated as <x-copy-button text="..."> or <x-copy-button copy-from="element-id">.
 * The host acts as the button (role="button", focusable, Enter/Space activate).
 * Looks are CSS classes on the host (ghost, soft, icon, sm, lg); the script never reads them.
 */
(function (global) {
  'use strict';

  // Lucide paths (ISC), used as the <x-icon> fallback so the icons show without the full set.
  const PATHS = {
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>'
  };
  function icon(name) {
    return '<x-icon name="' + name + '" aria-hidden="true"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
      PATHS[name] + '</svg></x-icon>';
  }

  const CopyButton = {
    init(element) {
      if (!element) return;

      // An empty host gets the default content: copy icon + "Copy" (the label is
      // visually hidden in the icon-only look but still names the button).
      if (!element.innerHTML.trim()) {
        element.innerHTML = icon('copy') + '<span class="copy-button-label">Copy</span>';
      }
      if (!element._originalText) {
        element._originalText = element.innerHTML;
      }

      // The host is the control: give it button semantics and keyboard activation.
      if (!element.hasAttribute('role')) element.setAttribute('role', 'button');
      if (!element.hasAttribute('tabindex')) element.setAttribute('tabindex', '0');
      element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          element.click();
        }
      });

      element.addEventListener('click', (e) => {
        e.preventDefault();
        
        let textToCopy = element.getAttribute('text');
        
        if (!textToCopy) {
          const targetId = (element.getAttribute('copy-from') || '').replace(/^#/, '');
          if (targetId) {
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
              textToCopy = targetEl.innerText || targetEl.textContent;
            } else if (global.Blueprint) {
              global.Blueprint.warn(`Blueprint Copy Button: copy-from element '#${targetId}' not found.`);
            }
          }
        }

        if (!textToCopy) {
          if (global.Blueprint) {
            global.Blueprint.warn('Blueprint Copy Button: No text or target element found to copy.');
          }
          return;
        }

        // Copy via Clipboard API with legacy fallback for local file:// testing
        const copyPromise = (navigator.clipboard && navigator.clipboard.writeText)
          ? navigator.clipboard.writeText(textToCopy)
          : new Promise((resolve) => {
              const textarea = document.createElement('textarea');
              textarea.value = textToCopy;
              textarea.style.position = 'fixed';
              textarea.style.left = '-9999px';
              document.body.appendChild(textarea);
              textarea.select();
              try {
                document.execCommand('copy');
                resolve();
              } finally {
                document.body.removeChild(textarea);
              }
            });

        copyPromise.then(() => {
          // Remember the author's aria-label (null = none) once per feedback cycle.
          if (!element._copyTimeout) element._originalLabel = element.getAttribute('aria-label');
          element.classList.add('active');
          element.innerHTML = icon('check') + '<span class="copy-button-label">Copied!</span>';
          element.setAttribute('aria-label', 'Copied to clipboard');

          if (global.Blueprint) {
            global.Blueprint.emit(element, 'copy', { text: textToCopy });
          }

          if (element._copyTimeout) clearTimeout(element._copyTimeout);
          element._copyTimeout = setTimeout(() => {
            element._copyTimeout = null;
            element.classList.remove('active');
            element.innerHTML = element._originalText;
            if (element._originalLabel != null) element.setAttribute('aria-label', element._originalLabel);
            else element.removeAttribute('aria-label');
          }, 2000);
        });
      });
    }
  };

  if (global.Blueprint && typeof global.Blueprint.register === 'function') {
    global.Blueprint.register('copy-button', CopyButton);
  }

  global.BlueprintCopyButton = CopyButton;
})(typeof window !== 'undefined' ? window : this);
