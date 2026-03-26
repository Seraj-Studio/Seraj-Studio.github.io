/* =========================================================
   scroll-reveal.js — IntersectionObserver scroll reveal system

   Usage in HTML:
     Individual: <div class="reveal">...</div>
     Stagger:    <ul class="reveal-stagger">
                   <li>...</li>  ← gets --stagger-idx CSS var
                 </ul>

   CSS handles the actual animation (see animations.css).
   This script only adds/removes .reveal--visible.
   ========================================================= */

'use strict';

function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
      el.classList.add('reveal--visible');
    });
    return;
  }

  // Set --stagger-idx custom property on children of .reveal-stagger containers
  document.querySelectorAll('.reveal-stagger').forEach(container => {
    Array.from(container.children).forEach((child, index) => {
      child.style.setProperty('--stagger-idx', index);
    });
  });

  // Single observer for all reveal targets
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal--visible');
          // Disconnect after reveal — no re-animation on scroll up
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold:  0.12,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  // Observe .reveal elements
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Observe .reveal-stagger containers (animation applied via CSS to children)
  document.querySelectorAll('.reveal-stagger').forEach(el => observer.observe(el));
}
