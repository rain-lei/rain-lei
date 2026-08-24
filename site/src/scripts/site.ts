const body=document.body;
const themeToggle=document.getElementById('themeToggle');
const themeIcon=document.getElementById('themeIcon');
const menuToggle=document.getElementById('menuToggle');
const mobileNav=document.getElementById('mobileNav');
const header=document.querySelector('.v2-header');
const progress=document.getElementById('scrollProgress');
if(localStorage.getItem('rain-theme')==='dark') body.classList.add('dark');
const updateTheme=()=>{ if(themeIcon) themeIcon.textContent=body.classList.contains('dark')?'◑':'◐'; };
updateTheme();
themeToggle?.addEventListener('click',()=>{body.classList.toggle('dark');localStorage.setItem('rain-theme',body.classList.contains('dark')?'dark':'light');updateTheme();});
menuToggle?.addEventListener('click',()=>{const open=mobileNav?.classList.toggle('is-open');menuToggle.setAttribute('aria-expanded',String(Boolean(open)));mobileNav?.setAttribute('aria-hidden',String(!open));});
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{mobileNav.classList.remove('is-open');menuToggle?.setAttribute('aria-expanded','false');}));
const updateScroll=()=>{header?.classList.toggle('is-scrolled',scrollY>18);if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;}};
addEventListener('scroll',updateScroll,{passive:true});updateScroll();
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
const reveals=document.querySelectorAll('.v2-reveal');
if(reduced||!('IntersectionObserver' in window)) reveals.forEach(el=>el.classList.add('is-visible')); else {const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});reveals.forEach(el=>observer.observe(el));}
if(!reduced&&matchMedia('(pointer:fine)').matches) document.querySelectorAll<HTMLElement>('[data-art-stage]').forEach(stage=>{stage.addEventListener('pointermove',event=>{const rect=stage.getBoundingClientRect();stage.style.setProperty('--art-x',(((event.clientX-rect.left)/rect.width-.5)*2).toFixed(3));stage.style.setProperty('--art-y',(((event.clientY-rect.top)/rect.height-.5)*2).toFixed(3));});stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--art-x','0');stage.style.setProperty('--art-y','0');});});

const repoTargets=[...document.querySelectorAll<HTMLElement>('[data-github-repos]')];
if(repoTargets.length){const fallback=[['rain-lei','个人网站、博客源码与 GitHub 资料页','JavaScript',6],['easyxgame','C++17 / EasyX 课程作业与原创游戏','C++',3],['EDAbackend-todo-practice','Express 后端练习：JWT 鉴权与 Todo CRUD','JavaScript',2]];const esc=(v:unknown)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));const render=(target:HTMLElement,repos:any[])=>{const limit=Math.max(1,Number(target.dataset.repoLimit)||3);target.innerHTML=repos.slice(0,limit).map((r,i)=>`<a class="github-repo-card" href="https://github.com/rain-lei/${esc(r.name)}" target="_blank" rel="noopener noreferrer"><span class="repo-index">${String(i+1).padStart(2,'0')}</span><span class="repo-card-content"><span class="repo-title-row"><span class="repo-title-wrap"><strong>${esc(r.name)}</strong>${r.name==='rain-lei'?'<em class="repo-badge">本站</em>':''}</span><span class="repo-arrow">↗</span></span><span class="repo-description">${esc(r.description||'代码、实验与持续迭代的项目记录。')}</span><span class="repo-meta"><span>${esc(r.language||'多语言')}</span><span>★ ${Number(r.stargazers_count)||0}</span></span></span></a>`).join('');};const renderAll=(repos:any[])=>repoTargets.forEach(target=>render(target,repos));fetch('https://api.github.com/users/rain-lei/repos?sort=pushed&direction=desc&per_page=30').then(r=>r.ok?r.json():Promise.reject()).then((repos:any[])=>renderAll(repos.filter(r=>!r.fork&&!r.archived))).catch(()=>renderAll(fallback.map(([name,description,language,stargazers_count])=>({name,description,language,stargazers_count}))));}

const links=document.getElementById('friendLinksGrid');
if(links){const fallback=links.innerHTML;fetch('/friend-links.json').then(r=>r.json()).then(data=>{links.innerHTML=data.links.map((link:any)=>`<a class="friend-link-card" href="${link.url}" target="_blank" rel="noopener noreferrer"><img src="${link.avatar}" alt="${link.name}" loading="lazy"><span><strong>${link.name}</strong><small>${link.description}</small></span><b>↗</b></a>`).join('');}).catch(()=>links.innerHTML=fallback);}

const filters=[...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const archiveItems=[...document.querySelectorAll<HTMLElement>('.archive-item')];
const archiveSearch=document.querySelector<HTMLInputElement>('#archiveSearch');
const resultCount=document.querySelector<HTMLElement>('#archiveResultCount');
let active='all';const filterArchive=()=>{const q=(archiveSearch?.value||'').trim().toLowerCase();let count=0;archiveItems.forEach(item=>{const visible=(active==='all'||item.dataset.category===active)&&(!q||(item.textContent||'').toLowerCase().includes(q));item.hidden=!visible;item.classList.toggle('is-filtered-out',!visible);item.setAttribute('aria-hidden',String(!visible));if(visible)count++;});if(resultCount)resultCount.textContent=`${count} 篇结果`;};
filters.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter||'all';filters.forEach(b=>{const selected=b===button;b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected));});filterArchive();}));archiveSearch?.addEventListener('input',filterArchive);filterArchive();
