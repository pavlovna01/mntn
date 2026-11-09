(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Мобильное меню ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');

  if (toggle && nav) {
    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1000) setOpen(false); });
  }

  /* ---------- Плавная прокрутка по якорям ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    link.addEventListener('click', (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: id === '#top' ? 'start' : 'start' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Боковая навигация (Start / 01 / 02 / 03) ---------- */
  const sideLinks = [...document.querySelectorAll('.side-nav a')];
  const marker = document.querySelector('.side-nav__marker');
  const sections = sideLinks
    .map((a) => document.getElementById(a.dataset.target))
    .filter(Boolean);

  const STEP = 61; // расстояние между пунктами в макете
  let activeIndex = -1;

  const setActive = (index) => {
    if (index === activeIndex) return;
    activeIndex = index;
    sideLinks.forEach((a, i) => a.classList.toggle('is-active', i === index));
    if (marker) marker.style.transform = `translateY(${index * STEP}px)`;
  };

  const updateActive = () => {
    const probe = window.innerHeight * 0.45;
    let current = 0;
    sections.forEach((section, i) => {
      if (i === 0) return;                         // «Start» — всё, что выше блока 01
      if (section.getBoundingClientRect().top <= probe) current = i;
    });
    setActive(current);
  };

  /* ---------- Параллакс слоёв героя ---------- */
  const layers = [...document.querySelectorAll('.scene__layer[data-speed]')]
    .map((el) => ({ el, speed: parseFloat(el.dataset.speed) || 0 }))
    .filter((l) => l.speed > 0);

  let ticking = false;
  const render = () => {
    ticking = false;
    const y = window.scrollY;
    if (!reduceMotion && y < window.innerHeight * 2) {
      layers.forEach(({ el, speed }) => { el.style.transform = `translate3d(0, ${-(y * speed).toFixed(1)}px, 0)`; });
    }
    updateActive();
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  render();
})();
