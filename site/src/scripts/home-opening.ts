type MotionAnimator = (
  element: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) => Animation | undefined;

const ease = 'cubic-bezier(.22,1,.36,1)';
const sessionKey = 'rain-home-opening';

export function initHomeOpening(allowed: () => boolean, animate: MotionAnimator) {
  const hero = document.querySelector<HTMLElement>('.home-hero');
  if (!hero) return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  let seen = navigation?.type === 'reload' || navigation?.type === 'back_forward';
  try {
    seen ||= sessionStorage.getItem(sessionKey) === 'seen';
    sessionStorage.setItem(sessionKey, 'seen');
  } catch { /* The opening also works when browser storage is unavailable. */ }

  // Preserve anchor targets and the browser's restored reading position.
  if (!allowed() || location.hash || scrollY > 0 || navigation?.type === 'back_forward') return;

  const animations: Animation[] = [];
  const run = (selector: string, frames: Keyframe[], delay: number, duration: number, easing = ease) => {
    document.querySelectorAll<HTMLElement>(selector).forEach(element => {
      const bounds = element.getBoundingClientRect();
      if (!bounds.width || bounds.top >= innerHeight || bounds.bottom <= 0) return;
      const animation = animate(element, frames, { delay, duration, easing, fill: 'backwards' });
      if (animation) animations.push(animation);
    });
  };
  const rise = (selector: string, distance: number, delay: number, duration: number, opacity = .4) => {
    run(selector, [
      { opacity, translate: `0 ${distance}px` },
      { opacity: 1, translate: '0 0' },
    ], delay, duration);
  };

  if (seen) {
    run('.home-hero', [{ opacity: .75 }, { opacity: 1 }], 0, 220);
    return;
  }

  const scene = hero.querySelector<HTMLElement>('.loopy-scene');
  const compact = matchMedia('(max-width:760px)').matches;
  const drop = compact ? 22 : 42;
  const bounce = compact ? 3 : 6;
  scene?.classList.add('is-arriving');

  rise('.v2-header', 4, 0, 280, .6);
  rise('.hero-eyebrow', 6, 0, 300);
  rise('.hero-copy h1', 10, 70, 400, .25);
  rise('.home-hero .hero-cta', 6, 160, 350);
  run('.home-hero .loopy-halo', [
    { opacity: 0, scale: .75 },
    { opacity: .8, scale: .98 },
  ], 30, 500);
  run('.home-hero .loopy-arrival', [
    { opacity: 0, transform: `translateY(-${drop}px) rotate(-5deg) scale(.96,1.02)` },
    { opacity: 1, transform: `translateY(${bounce}px) rotate(1.3deg) scale(1.035,.965)`, offset: .5 },
    { opacity: 1, transform: `translateY(-${bounce * .7}px) rotate(-.7deg) scale(.99,1.01)`, offset: .74 },
    { opacity: 1, transform: 'none' },
  ], 90, 860, 'cubic-bezier(.25,.6,.35,1)');
  run('.home-hero .loopy-shadow', [
    { opacity: .2, scale: .55 },
    { opacity: 1, scale: 1.08, offset: .6 },
    { opacity: 1, scale: 1 },
  ], 100, 850);
  run('.home-hero .loopy-landing', [
    { opacity: 0, scale: .5 },
    { opacity: .35, scale: .75, offset: .18 },
    { opacity: 0, scale: 1.55 },
  ], 480, 430, 'ease-out');
  run('.home-hero .loopy-star', [
    { opacity: 0, transform: 'translateY(12px) rotate(-8deg) scale(.5)' },
    { opacity: .75, transform: 'translateY(-5px) rotate(8deg) scale(1.15)', offset: .6 },
    { opacity: .35, transform: 'rotate(-8deg) scale(.85)' },
  ], 550, 550);

  rise('.home-latest > .section-heading', 7, 210, 340);
  document.querySelectorAll('.home-post').forEach((_, index) => {
    rise(`.home-post:nth-child(${index + 1})`, 10, 270 + index * 60, 420);
  });
  rise('.home-sidebar', 8, 340, 410);

  // The shared motion switch cancels these animations too. Always resume the
  // idle scene, including when reduced motion or a hidden tab ends the opening.
  void Promise.allSettled(animations.map(animation => animation.finished)).then(() => {
    scene?.classList.remove('is-arriving');
  });
}
