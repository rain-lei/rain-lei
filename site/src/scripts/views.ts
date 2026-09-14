// Only production page loads contribute to the public counter.
const statuses = [...document.querySelectorAll<HTMLElement>('[data-counter-status]')];
if (statuses.length) {
  if (!['www.rainlei.xyz', 'rainlei.xyz'].includes(location.hostname)) {
    statuses.forEach(el => { el.textContent = '本地不计数'; });
  } else {
    const update = () => {
      statuses.forEach(el => {
        const value = document.getElementById(`busuanzi_value_${el.dataset.counterStatus}_pv`);
        if (value?.textContent?.trim()) el.hidden = true;
      });
    };
    const observer = new MutationObserver(update);
    statuses.forEach(el => {
      const value = document.getElementById(`busuanzi_value_${el.dataset.counterStatus}_pv`);
      if (value) observer.observe(value, { childList:true, subtree:true, characterData:true });
    });
    const unavailable = () => statuses.forEach(el => {
      if (!el.hidden) el.textContent = '暂不可用';
    });
    const script = document.createElement('script');
    script.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    script.async = true;
    script.onerror = unavailable;
    document.body.append(script);
    window.setTimeout(unavailable, 10000);
    window.addEventListener('pagehide', () => observer.disconnect(), { once:true });
  }
}
