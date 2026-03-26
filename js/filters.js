/* =========================================================
   filters.js — Work section category filter
   ========================================================= */

'use strict';

function initWorkFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards      = document.querySelectorAll('#work-grid .card');

  if (!filterBtns.length || !cards.length) return;

  function applyFilter(activeFilter) {
    // Update button states
    filterBtns.forEach(btn => {
      const isActive = btn.dataset.filter === activeFilter;
      btn.classList.toggle('filter-btn--active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    cards.forEach(card => {
      const matches = activeFilter === 'all' || card.dataset.category === activeFilter;

      if (matches) {
        const wasHidden = card.style.display === 'none';
        card.style.display = '';
        if (wasHidden) {
          // Fade in only cards that were previously hidden
          card.classList.add('card--out');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.classList.remove('card--out');
            });
          });
        }
      } else {
        // Collapse immediately — no fade delay
        card.classList.add('card--out');
        card.style.display = 'none';
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.dataset.filter);
    });
  });

  // Set initial aria-pressed state
  filterBtns.forEach(btn => {
    btn.setAttribute('aria-pressed', btn.classList.contains('filter-btn--active') ? 'true' : 'false');
  });
}
