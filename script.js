// ---------- mobile nav ----------
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }));
}

// ---------- scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ---------- hero scrubber ----------
(function initScrubber() {
  const track = document.querySelector('[data-scrub-track]');
  if (!track) return;
  const fill = track.querySelector('.scrub-fill');
  const handle = track.querySelector('.scrub-handle');
  const frame = document.querySelector('[data-scrub-frame]');
  const tcOut = document.querySelector('[data-scrub-tc]');
  const moodOut = document.querySelector('[data-scrub-mood]');

  const stops = [
    { pct: 0,   tc: '00:00:00:00', mood: 'Flat log',        c1: [32,36,44],  c2: [44,42,47] },
    { pct: 33,  tc: '00:01:14:08', mood: 'Warm daylight',    c1: [82,55,34],  c2: [58,40,30] },
    { pct: 66,  tc: '00:02:41:19', mood: 'Teal & orange',    c1: [24,58,60],  c2: [92,58,26] },
    { pct: 100, tc: '00:04:32:10', mood: 'Moody night grade',c1: [16,18,26],  c2: [40,20,44] }
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }
  function colorAt(pct) {
    let i = 0;
    while (i < stops.length - 2 && pct > stops[i + 1].pct) i++;
    const a = stops[i], b = stops[i + 1];
    const t = (pct - a.pct) / (b.pct - a.pct || 1);
    const mix = (k) => stops.length ? [
      Math.round(lerp(a.c1[0], b.c1[0], t)), Math.round(lerp(a.c1[1], b.c1[1], t)), Math.round(lerp(a.c1[2], b.c1[2], t))
    ] : a.c1;
    const c1 = [Math.round(lerp(a.c1[0], b.c1[0], t)), Math.round(lerp(a.c1[1], b.c1[1], t)), Math.round(lerp(a.c1[2], b.c1[2], t))];
    const c2 = [Math.round(lerp(a.c2[0], b.c2[0], t)), Math.round(lerp(a.c2[1], b.c2[1], t)), Math.round(lerp(a.c2[2], b.c2[2], t))];
    const label = t < 0.5 ? a.mood : b.mood;
    const tc = t < 0.5 ? a.tc : b.tc;
    return { c1, c2, label, tc };
  }

  function set(pct) {
    pct = Math.min(100, Math.max(0, pct));
    fill.style.width = pct + '%';
    handle.style.left = pct + '%';
    const { c1, c2, label, tc } = colorAt(pct);
    frame.style.setProperty('--grade-bg', `linear-gradient(120deg, rgb(${c1.join(',')}), rgb(${c2.join(',')}))`);
    if (tcOut) tcOut.textContent = tc;
    if (moodOut) moodOut.textContent = label;
  }

  function pctFromEvent(e) {
    const rect = track.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return (x / rect.width) * 100;
  }

  let dragging = false;
  track.addEventListener('pointerdown', (e) => { dragging = true; set(pctFromEvent(e)); });
  window.addEventListener('pointermove', (e) => { if (dragging) set(pctFromEvent(e)); });
  window.addEventListener('pointerup', () => dragging = false);
  track.addEventListener('keydown', (e) => {
    const cur = parseFloat(fill.style.width) || 20;
    if (e.key === 'ArrowRight') set(cur + 5);
    if (e.key === 'ArrowLeft') set(cur - 5);
  });

  set(20);
})();

// ---------- editing panel before/after toggle ----------
(function initEditorPanel() {
  const buttons = document.querySelectorAll('[data-grade-btn]');
  const preview = document.querySelector('[data-preview-frame]');
  const label = document.querySelector('[data-preview-label]');
  if (!buttons.length || !preview) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const graded = btn.dataset.gradeBtn === 'graded';
      preview.classList.toggle('graded', graded);
      if (label) label.textContent = graded ? 'Color graded' : 'Raw ingest';
    });
  });
})();
