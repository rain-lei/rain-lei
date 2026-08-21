(function(){
  const grid=document.getElementById('friendLinksGrid');
  if(!grid)return;
  const fallback=grid.innerHTML;
  const favicon=url=>{try{return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;}catch(_){return '';}};
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const render=links=>{
    if(!Array.isArray(links)||!links.length)throw Error();
    grid.innerHTML=links.map(link=>`<a class="friend-link-card" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(link.avatar||favicon(link.url))}" alt="${escapeHtml(link.name)}" loading="lazy" onerror="this.src='${favicon(link.url)}'"/><span><strong>${escapeHtml(link.name)}</strong><small>${escapeHtml(link.description||link.url)}</small></span><b>↗</b></a>`).join('');
  };
  fetch('friend-links.json').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>render(data.links)).catch(()=>{grid.innerHTML=fallback;});
})();
