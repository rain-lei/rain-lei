const counters = [...document.querySelectorAll<HTMLElement>('[data-view-counter]')];
if (counters.length && ['www.rainlei.xyz', 'rainlei.xyz'].includes(location.hostname)) {
  const observer = new MutationObserver(() => {
    counters.forEach(counter => {
      const value = document.getElementById(`busuanzi_value_${counter.dataset.viewCounter}_pv`);
      counter.hidden = !value?.textContent?.trim();
    });
    if (counters.every(counter => !counter.hidden)) observer.disconnect();
  });
  counters.forEach(counter => {
    const value = document.getElementById(`busuanzi_value_${counter.dataset.viewCounter}_pv`);
    if (value) observer.observe(value, { childList: true, subtree: true, characterData: true });
  });
  const script = document.createElement('script');
  script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
  script.async = true;
  script.onerror = () => observer.disconnect();
  document.body.append(script);
  window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
}
