const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const animations = new Set<Animation>();

export const uiMotionEnabled = () => document.body.dataset.motion === 'on' && !reducedMotion.matches && !document.hidden;

export function animateUi(element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) {
  if (!uiMotionEnabled()) return;
  const animation = element.animate(frames, { easing: 'cubic-bezier(.22,1,.36,1)', ...options });
  animations.add(animation);
  const forget = () => animations.delete(animation);
  animation.addEventListener('finish', forget, { once: true });
  animation.addEventListener('cancel', forget, { once: true });
  return animation;
}

const cancelAnimations = () => {
  animations.forEach(animation => animation.cancel());
  animations.clear();
};
document.addEventListener('loopy:motion', () => { if (!uiMotionEnabled()) cancelAnimations(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimations(); });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) cancelAnimations(); });
