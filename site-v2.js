(function () {
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const header = document.querySelector('.v2-header');
  const progress = document.getElementById('scrollProgress');
  if (localStorage.getItem('linmo-theme') === 'dark') body.classList.add('dark');
  const updateThemeIcon = () => { if (themeIcon) themeIcon.textContent = body.classList.contains('dark') ? '◑' : '◐'; };
  updateThemeIcon();
  themeToggle?.addEventListener('click', () => { body.classList.toggle('dark'); localStorage.setItem('linmo-theme', body.classList.contains('dark') ? 'dark' : 'light'); updateThemeIcon(); });
  menuToggle?.addEventListener('click', () => { const open = mobileNav?.classList.toggle('is-open'); menuToggle.setAttribute('aria-expanded', String(Boolean(open))); mobileNav?.setAttribute('aria-hidden', String(!open)); });
  mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => { mobileNav.classList.remove('is-open'); menuToggle?.setAttribute('aria-expanded', 'false'); mobileNav.setAttribute('aria-hidden', 'true'); }));
  let ticking = false;
  const updateScroll = () => { header?.classList.toggle('is-scrolled', window.scrollY > 18); if (progress) { const max = document.documentElement.scrollHeight - window.innerHeight; progress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`; } ticking = false; };
  window.addEventListener('scroll', () => { if (!ticking) requestAnimationFrame(updateScroll); ticking = true; }, { passive: true }); updateScroll();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.v2-reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) revealItems.forEach((item) => item.classList.add('is-visible'));
  else { const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (!entry.isIntersecting) return; entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }); }, { threshold: .08, rootMargin: '0px 0px -5% 0px' }); revealItems.forEach((item) => observer.observe(item)); }
  document.querySelectorAll('[data-year]').forEach((element) => { element.textContent = String(new Date().getFullYear()); });
})();
