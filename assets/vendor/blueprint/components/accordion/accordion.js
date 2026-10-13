/**
 * Blueprint UI — Accordion Component (`components/accordion/accordion.js`)
 * Activated as <x-accordion> with single and multiple mode.
 * Looks (separated, flush, ghost, chevron, sm, lg) are classes handled by CSS only.
 * `disabled` on a <details> item blocks toggling and skips it in arrow-key navigation.
 */
(function (global) {
  'use strict';

  const Accordion = {
    init(element) {
      if (!element) return;
      // Own items only: <details> inside a nested <x-accordion> belong to that accordion.
      const ownDetails = () => Array.from(element.querySelectorAll('details'))
        .filter((d) => d.parentElement && d.parentElement.closest('x-accordion') === element);
      const summaryOf = (details) => details.querySelector(':scope > summary');
      const detailsList = ownDetails();

      if (detailsList.length === 0) {
        if (global.Blueprint) {
          global.Blueprint.warn('Blueprint Accordion: No <details> or trigger/content pair found.');
        }
        return;
      }

      const isSingle = element.hasAttribute('single');

      // `disabled` on a <details> item: it cannot be toggled and is skipped by the arrow keys.
      const syncDisabled = (details, summary) => {
        const disabled = details.hasAttribute('disabled');
        if (disabled) {
          summary.setAttribute('aria-disabled', 'true');
          summary.setAttribute('tabindex', '-1');
        } else {
          summary.removeAttribute('aria-disabled');
          summary.removeAttribute('tabindex');
        }
      };

      detailsList.forEach((details) => {
        const summary = summaryOf(details);
        if (!summary) return;

        // Ensure accessibility attributes
        summary.setAttribute('role', 'button');
        summary.setAttribute('aria-expanded', details.open ? 'true' : 'false');
        details.classList.toggle('active', details.open);
        summary.classList.toggle('active', details.open);
        syncDisabled(details, summary);
        if (typeof MutationObserver === 'function') {
          new MutationObserver(() => syncDisabled(details, summary))
            .observe(details, { attributes: true, attributeFilter: ['disabled'] });
        }

        summary.addEventListener('click', (e) => {
          if (details.hasAttribute('disabled')) e.preventDefault();
        });

        // Toggle state sync
        details.addEventListener('toggle', () => {
          const isOpen = details.open;
          summary.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          details.classList.toggle('active', isOpen);
          summary.classList.toggle('active', isOpen);

          // If single mode, close all siblings
          if (isOpen && isSingle) {
            ownDetails().forEach((other) => {
              if (other !== details && other.open) {
                other.removeAttribute('open');
              }
            });
          }

          if (global.Blueprint) {
            global.Blueprint.emit(element, 'change', { item: details, open: isOpen });
          }
        });

        // Keyboard navigation across summaries (disabled items are skipped)
        summary.addEventListener('keydown', (e) => {
          const summaries = ownDetails()
            .filter((d) => !d.hasAttribute('disabled'))
            .map(summaryOf)
            .filter(Boolean);
          if (summaries.length === 0) return;
          const currentIndex = summaries.indexOf(summary);

          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % summaries.length;
            summaries[nextIndex].focus();
          } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + summaries.length) % summaries.length;
            summaries[prevIndex].focus();
          } else if (e.key === 'Home') {
            e.preventDefault();
            summaries[0].focus();
          } else if (e.key === 'End') {
            e.preventDefault();
            summaries[summaries.length - 1].focus();
          }
        });
      });
    }
  };

  if (global.Blueprint && typeof global.Blueprint.register === 'function') {
    global.Blueprint.register('accordion', Accordion);
  }

  global.BlueprintAccordion = Accordion;
})(typeof window !== 'undefined' ? window : this);
