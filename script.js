document.addEventListener('DOMContentLoaded', init);

function init() {
  initNav();
  initSmoothScroll();
  initReveal();
  initTimeline();
  initSkillBars();
  initStatCounters();
  initProjectFilter();
  initContactForm();

}

// ─── Navigation ───────────────────────────────────────────────────────────────

function initNav() {
  const nav = document.getElementById('nav');
  const toggle = nav?.querySelector('.nav__toggle');
  const mobileNav = nav?.querySelector('.nav__mobile');

  window.addEventListener('scroll', debounce(onNavScroll, 10), { passive: true });
  toggle?.addEventListener('click', toggleMobileNav);

  // Close mobile nav on link click
  mobileNav?.querySelectorAll('.nav__mobile-link').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (toggle?.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target)) {
      closeMobileNav();
    }
  });
}

function onNavScroll() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  nav.classList.toggle('nav--scrolled', window.scrollY > 10);
}

function toggleMobileNav() {
  const nav = document.getElementById('nav');
  const toggle = nav?.querySelector('.nav__toggle');
  const mobileNav = nav?.querySelector('.nav__mobile');
  if (!toggle || !mobileNav) return;

  const isOpen = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!isOpen));
  mobileNav.setAttribute('aria-hidden', String(isOpen));
  document.body.classList.toggle('scroll-locked', !isOpen);
}

function closeMobileNav() {
  const nav = document.getElementById('nav');
  const toggle = nav?.querySelector('.nav__toggle');
  const mobileNav = nav?.querySelector('.nav__mobile');
  if (!toggle || !mobileNav) return;
  toggle.setAttribute('aria-expanded', 'false');
  mobileNav.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('scroll-locked');
}

// ─── Smooth Scroll ────────────────────────────────────────────────────────────

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const id = href.slice(1);
      scrollToSection(id);
      closeMobileNav();
    });
  });
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 64;
  const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ─── Hero Typing Effect ───────────────────────────────────────────────────────

const TYPING_PHRASES = [
  'Building intelligent systems.',
  'Researching acoustic localization.',
  'Engineering embedded solutions.',
  'Designing full-stack platforms.',
  'Exploring multi-agent AI.',
];

function initTypingEffect() {
  const el = document.querySelector('.hero__typed');
  if (!el) return;
  typeNextPhrase(TYPING_PHRASES, 0);
}

function typeNextPhrase(phrases, i) {
  const el = document.querySelector('.hero__typed');
  if (!el) return;
  const phrase = phrases[i % phrases.length];
  let charIndex = 0;

  // Type forward
  const typeInterval = setInterval(() => {
    el.textContent = phrase.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === phrase.length) {
      clearInterval(typeInterval);
      // Pause then erase
      setTimeout(() => {
        let eraseIndex = phrase.length;
        const eraseInterval = setInterval(() => {
          el.textContent = phrase.slice(0, eraseIndex - 1);
          eraseIndex--;
          if (eraseIndex === 0) {
            clearInterval(eraseInterval);
            typeNextPhrase(phrases, i + 1);
          }
        }, 30);
      }, 1800);
    }
  }, 60);
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────

function initParticleCanvas() {
  const container = document.querySelector('.hero__particle-canvas');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  container.appendChild(canvas);

  resizeCanvas(canvas);
  window.addEventListener('resize', debounce(() => resizeCanvas(canvas), 200));

  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 30 : 60;
  const particles = Array.from({ length: count }, () => createParticle(canvas));
  const ctx = canvas.getContext('2d');

  animateParticles(ctx, particles, canvas);
}

function resizeCanvas(canvas) {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function createParticle(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    radius: 1 + Math.random() * 1.5,
    alpha: 0.1 + Math.random() * 0.3,
    alphaDir: Math.random() > 0.5 ? 1 : -1,
  };
}

function animateParticles(ctx, particles, canvas) {
  const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-accent').trim();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    // Update position
    p.x += p.vx;
    p.y += p.vy;

    // Wrap edges
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    // Pulse alpha slightly
    p.alpha += p.alphaDir * 0.003;
    if (p.alpha > 0.4 || p.alpha < 0.1) p.alphaDir *= -1;
    p.alpha = clamp(p.alpha, 0.05, 0.45);

    // Draw particle
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = p.alpha;
    ctx.fill();
  });

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = (1 - dist / 120) * 0.15;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  ctx.globalAlpha = 1;
  requestAnimationFrame(() => animateParticles(ctx, particles, canvas));
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────

function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(onRevealEntry, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });
  elements.forEach((el, i) => {
    el.style.transitionDelay = `${i * 60}ms`;
    observer.observe(el);
  });
}

function onRevealEntry(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal--visible');
      observer.unobserve(entry.target);
    }
  });
}

// ─── Skill Bars ───────────────────────────────────────────────────────────────

function initSkillBars() {
  const section = document.getElementById('skills');
  if (!section) return;

  let animated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateAllSkillBars();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
}

function animateAllSkillBars() {
  document.querySelectorAll('.skill-item__fill').forEach(el => animateSkillBar(el));
}

function animateSkillBar(el) {
  const targetWidth = el.dataset.width || '0';
  // Small delay so CSS transition kicks in after layout
  requestAnimationFrame(() => {
    el.style.width = targetWidth + '%';
  });
}

// ─── Stat Counters ────────────────────────────────────────────────────────────

function initStatCounters() {
  const section = document.getElementById('about');
  if (!section) return;

  let animated = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        document.querySelectorAll('.stat-card__number').forEach(el => {
          if (el.dataset.numeric === 'true') {
            const target = parseInt(el.textContent, 10);
            animateCounter(el, target, 1200);
          }
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(section);
}

function animateCounter(el, target, duration) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(lerp(0, target, progress));
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ─── Timeline Reveal ──────────────────────────────────────────────────────────

function initTimeline() {
  document.querySelectorAll('.timeline__item').forEach(el => {
    const index = parseInt(el.dataset.index || '0', 10);
    el.style.transitionDelay = `${index * 120}ms`;
  });
}

// ─── Project Filter ───────────────────────────────────────────────────────────

function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      filterProjects(category);
    });
  });
}

function filterProjects(category) {
  document.querySelectorAll('.project-card').forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.classList.remove('project-card--hidden');
    } else {
      card.classList.add('project-card--hidden');
    }
  });
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', onFormSubmit);
}

function onFormSubmit(e) {
  e.preventDefault();
  clearFormErrors();

  const form = document.getElementById('contact-form');
  const formData = {
    name: form.querySelector('#contact-name').value.trim(),
    email: form.querySelector('#contact-email').value.trim(),
    message: form.querySelector('#contact-message').value.trim(),
  };

  const { valid, errors } = validateForm(formData);
  if (!valid) {
    Object.entries(errors).forEach(([field, msg]) => {
      if (msg) showFormError(field, msg);
    });
    return;
  }

  const submitBtn = document.getElementById('contact-submit');
  submitBtn?.classList.add('btn--loading');
  submitBtn.disabled = true;

  simulateFormSend(formData).then(() => {
    form.style.display = 'none';
    const success = document.getElementById('contact-success');
    if (success) success.hidden = false;

    setTimeout(() => {
      form.style.display = '';
      if (success) success.hidden = true;
      form.reset();
      submitBtn?.classList.remove('btn--loading');
      submitBtn.disabled = false;
    }, 5000);
  });
}

function validateForm(formData) {
  const errors = { name: '', email: '', message: '' };
  let valid = true;

  if (!formData.name) { errors.name = 'Name is required.'; valid = false; }
  if (!formData.email) {
    errors.email = 'Email is required.'; valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'Please enter a valid email.'; valid = false;
  }
  if (!formData.message) { errors.message = 'Message is required.'; valid = false; }

  return { valid, errors };
}

function showFormError(fieldId, msg) {
  const el = document.getElementById(`error-${fieldId}`);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('form-error--visible');
}

function clearFormErrors() {
  document.querySelectorAll('.form-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('form-error--visible');
  });
}

function simulateFormSend(formData) {
  return new Promise(resolve => setTimeout(resolve, 1200));
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
