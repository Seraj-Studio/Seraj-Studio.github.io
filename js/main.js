/* =========================================================
   main.js — Bootstrap and cross-cutting concerns
   ========================================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Footer year ---- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Three.js hero scene ---- */
  const heroCanvas = document.getElementById('hero-canvas');
  if (heroCanvas && typeof initHeroScene === 'function') {
    initHeroScene(heroCanvas);
  }

  /* ---- Scroll reveal ---- */
  if (typeof initScrollReveal === 'function') {
    initScrollReveal();
  }

  /* ---- Work filters ---- */
  if (typeof initWorkFilters === 'function') {
    initWorkFilters();
  }

  /* ---- Hero entry animations ---- */
  // Adding .hero--loaded triggers the CSS staggered animations
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    requestAnimationFrame(() => {
      // Extra rAF to ensure layout is complete before triggering animations
      requestAnimationFrame(() => {
        heroSection.classList.add('hero--loaded');
      });
    });
  }

  /* ---- Navbar: scroll behavior ---- */
  const navbar  = document.getElementById('navbar');

  function updateNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 60) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbarScroll, { passive: true });
  updateNavbarScroll(); // run immediately in case page loads mid-scroll

  /* ---- Navbar: active section indicator ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  if (sections.length && 'IntersectionObserver' in window) {
    const navH = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 72;

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle(
            'navbar__link--active',
            link.getAttribute('href') === `#${id}`
          );
        });
      });
    }, {
      threshold:  0.35,
      rootMargin: `-${navH}px 0px -40% 0px`,
    });

    sections.forEach(s => sectionObserver.observe(s));
  }

  /* ---- Smooth scroll for all anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      closeMobileMenu();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---- Mobile menu ---- */
  const menuToggle = document.getElementById('navbar-toggle');
  const mobileMenu = document.getElementById('navbar-mobile-menu');

  function closeMobileMenu() {
    if (!navbar) return;
    navbar.classList.remove('navbar--menu-open');       // drives hamburger → X animation
    if (mobileMenu) mobileMenu.classList.remove('is-open'); // drives menu visibility
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    if (mobileMenu) mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    if (!navbar) return;
    navbar.classList.add('navbar--menu-open');          // drives hamburger → X animation
    if (mobileMenu) mobileMenu.classList.add('is-open');    // drives menu visibility
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    if (mobileMenu) mobileMenu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navbar && navbar.classList.contains('navbar--menu-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // Close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMobileMenu();
  }, { passive: true });

  /* ---- Contact form ---- */
  const contactForm = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('form-submit-btn');
  const feedback    = document.getElementById('form-feedback');

  if (contactForm && submitBtn && feedback) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Browser validation
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // Loading state
      submitBtn.classList.add('btn--loading');
      submitBtn.disabled = true;
      feedback.className  = 'form-feedback';
      feedback.textContent = '';

      try {
        const response = await fetch('https://formspree.io/f/xdapovlr', {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });
        const success = response.ok;

        submitBtn.classList.remove('btn--loading');
        submitBtn.disabled = false;

        if (success) {
          feedback.className  = 'form-feedback form-feedback--success';
          feedback.textContent = "Thanks for reaching out! We'll be in touch within 48 hours.";
          contactForm.reset();
        } else {
          throw new Error('Server responded with an error.');
        }

      } catch (err) {
        submitBtn.classList.remove('btn--loading');
        submitBtn.disabled = false;
        feedback.className  = 'form-feedback form-feedback--error';
        feedback.textContent = "Something went wrong — please try emailing us directly at serajstuido@gmail.com";
        console.error('[ContactForm]', err);
      }

      // Scroll feedback message into view
      feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

});
