/* ============================================================
   OASIS DENTAL v2 — MAIN JAVASCRIPT
   Fix #1: base-path meta tag for reliable path resolution
   Fix #3: No fragile getDepth() — reads meta tag instead
   Fix #4: Proper <form> handling
   Fix #20: ARIA on mobile dropdown buttons
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => { injectComponents(); });

// Fix #1 & #3: Read base path from <meta name="base-path"> tag
function getBasePath() {
  const meta = document.querySelector('meta[name="base-path"]');
  return meta ? meta.getAttribute('content') : '.';
}

/* 1. COMPONENT INJECTION */
async function injectComponents() {
  const basePath = getBasePath();
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');

  try {
    if (headerEl) {
      const res = await fetch(`${basePath}/components/header.html`);
      if (res.ok) {
        headerEl.innerHTML = await res.text();
        resolveNavLinks(basePath);
        initNavigation();
        initStickyHeader();
      }
    }
  } catch (e) { console.warn('Header load failed:', e); }

  try {
    if (footerEl) {
      const res = await fetch(`${basePath}/components/footer.html`);
      if (res.ok) {
        footerEl.innerHTML = await res.text();
        resolveNavLinks(basePath);
      }
    }
  } catch (e) { console.warn('Footer load failed:', e); }

  initAccordion();
  initContactForm();
  initScrollAnimations();
  highlightActiveNav();
}

/* Fix #1: Resolve all data-href links to correct relative paths */
function resolveNavLinks(basePath) {
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('data-href');
    if (href) link.setAttribute('href', `${basePath}/${href}`);
  });
  // Also resolve data-src for images (logo)
  document.querySelectorAll('[data-src]').forEach(img => {
    const src = img.getAttribute('data-src');
    if (src) img.setAttribute('src', `${basePath}/${src}`);
  });
}

/* 2. NAVIGATION */
function initNavigation() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileNavOverlay');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('open');
    hamburger.classList.toggle('active');
    mobileNav.classList.toggle('open');
    overlay.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  overlay.addEventListener('click', closeNav);

  function closeNav() {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
    overlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Fix #20: Mobile dropdown toggles with ARIA
  document.querySelectorAll('.mobile-dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.getAttribute('data-target');
      const subMenu = document.getElementById(targetId);
      if (!subMenu) return;

      // Close others
      document.querySelectorAll('.mobile-dropdown-toggle').forEach(t => {
        if (t !== toggle) {
          t.classList.remove('open');
          t.setAttribute('aria-expanded', 'false');
          const other = document.getElementById(t.getAttribute('data-target'));
          if (other) other.classList.remove('open');
        }
      });

      const isOpen = toggle.classList.contains('open');
      toggle.classList.toggle('open');
      toggle.setAttribute('aria-expanded', !isOpen);
      subMenu.classList.toggle('open');
    });
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });
}

/* 3. STICKY HEADER */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* 4. ACTIVE NAV */
function highlightActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-menu a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.endsWith(href.split('/').pop())) {
      link.classList.add('active');
    }
  });
}

/* 5. ACCORDION */
function initAccordion() {
  document.querySelectorAll('.accordion').forEach(acc => {
    const items = acc.querySelectorAll('.accordion-item');
    items.forEach(item => {
      const header = item.querySelector('.accordion-header');
      if (!header) return;
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        const body = item.querySelector('.accordion-body');
        items.forEach(other => {
          other.classList.remove('active');
          const ob = other.querySelector('.accordion-body');
          if (ob) ob.style.maxHeight = '0';
          const oh = other.querySelector('.accordion-header');
          if (oh) oh.setAttribute('aria-expanded', 'false');
        });
        if (!isActive && body) {
          item.classList.add('active');
          body.style.maxHeight = body.scrollHeight + 'px';
          header.setAttribute('aria-expanded', 'true');
        }
      });
    });
  });
}

/* 6. CONTACT FORM — Fix #4: Works with <form> tag */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  generateCaptcha();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('formMessage');

    // Honeypot
    const hp = form.querySelector('input[name="b_name"]');
    if (hp && hp.value.trim()) {
      if (msg) { msg.className = 'form-message success'; msg.textContent = 'Thank you!'; }
      return;
    }

    // Captcha
    const ca = form.querySelector('input[name="captcha_answer"]');
    const expected = form.getAttribute('data-captcha-answer');
    if (ca && expected && ca.value.trim() !== expected) {
      if (msg) { msg.className = 'form-message error'; msg.textContent = 'Incorrect answer. Please try again.'; }
      generateCaptcha();
      return;
    }

    // Validation
    const name = form.querySelector('input[name="name"]');
    const email = form.querySelector('input[name="email"]');
    const message = form.querySelector('textarea[name="message"]');
    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      if (msg) { msg.className = 'form-message error'; msg.textContent = 'Please fill in all required fields.'; }
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      if (msg) { msg.className = 'form-message error'; msg.textContent = 'Please enter a valid email address.'; }
      return;
    }

    // Success
    if (msg) { msg.className = 'form-message success'; msg.textContent = 'Thank you! We will get back to you within 24 hours.'; }
    form.reset();
    generateCaptcha();
  });
}

function generateCaptcha() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const label = form.querySelector('.captcha-label');
  if (label) label.textContent = `To prove you are human, what is ${a} + ${b}?`;
  form.setAttribute('data-captcha-answer', (a + b).toString());
  const input = form.querySelector('input[name="captcha_answer"]');
  if (input) input.value = '';
}

/* 7. SCROLL ANIMATIONS */
function initScrollAnimations() {
  const els = document.querySelectorAll('.animate-in');
  if (!els.length) return;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => obs.observe(el));
  } else {
    els.forEach(el => el.classList.add('visible'));
  }
}
