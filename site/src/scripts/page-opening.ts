import { animateUi, uiMotionEnabled } from './ui-motion';

function welcome(hero: Element) {
  try {
    if (sessionStorage.getItem('rain-home-opening') === 'seen') return;
    sessionStorage.setItem('rain-home-opening', 'seen');
  } catch { /* Storage is optional for the opening. */ }

  const stroke = hero.querySelector('.signature-stroke path');
  if (stroke) {
    animateUi(stroke, [{ strokeDashoffset: '1' }, { strokeDashoffset: '0' }], {
      duration: 460, delay: 50, easing: 'cubic-bezier(.34,.05,.23,1)', fill: 'backwards',
    });
  }
  const character = hero.querySelector('.loopy-arrival');
  if (character) {
    animateUi(character, [{ opacity: .7, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: 280 });
  }
}

function revealBelowFold() {
  if (!('IntersectionObserver' in window)) return;
  const cards = [...document.querySelectorAll('[data-reveal]')].filter(card =>
    card.getBoundingClientRect().top >= innerHeight,
  );
  if (!cards.length) return;

  const observer = new IntersectionObserver(entries => {
    let delay = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      observer.unobserve(entry.target);
      if (entry.target.matches(':focus-within')) continue;
      animateUi(entry.target, [{ opacity: .55, translate: '0 8px' }, { opacity: 1, translate: '0 0' }], {
        duration: 260, delay, fill: 'backwards',
      });
      delay = Math.min(delay + 24, 48);
    }
  }, { rootMargin: '0px 0px 12px' });
  cards.forEach(card => observer.observe(card));
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
}

export function initPageOpening() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (location.hash || scrollY > 0 || navigation?.type === 'back_forward') return;
  const hero = document.querySelector('.home-hero');
  if (hero) revealBelowFold();
  if (!uiMotionEnabled() || navigation?.type === 'reload') return;

  // A normal document navigation already restores focus and scroll. Only the title moves.
  const title = document.querySelector('main h1');
  if (title) {
    animateUi(title, [{ opacity: .65, translate: '0 5px' }, { opacity: 1, translate: '0 0' }], { duration: 220 });
  }
  if (hero) welcome(hero);
}
