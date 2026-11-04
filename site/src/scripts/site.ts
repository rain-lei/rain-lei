import { animateUi, uiMotionEnabled } from './ui-motion';
import { fallbackRepos, languageColors, selectRepositories, type GithubRepo } from '../lib/repositories';

const body=document.body;
const themeToggle=document.getElementById('themeToggle');
const themeColor=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const menuToggle=document.getElementById('menuToggle');
const mobileNav=document.getElementById('mobileNav');
const progress=document.getElementById('scrollProgress');
const backToTop=document.getElementById('backToTop');
const updateTheme=()=>{const dark=document.documentElement.dataset.theme==='dark';themeToggle?.setAttribute('aria-label',dark?'切换为浅色模式':'切换为深色模式');if(themeColor)themeColor.content=getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();};
updateTheme();
themeToggle?.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=theme;try{localStorage.setItem('rain-theme',theme);}catch{}updateTheme();});
let menuAnimation:Animation|undefined;
let menuChange=0;
const syncMobileMenu=(open:boolean,animate=false)=>{
  const change=++menuChange;
  menuAnimation?.cancel();
  menuToggle?.setAttribute('aria-expanded',String(open));
  menuToggle?.setAttribute('aria-label',open?'关闭菜单':'打开菜单');
  mobileNav?.setAttribute('aria-hidden',String(!open));
  if(!mobileNav)return;
  mobileNav.inert=!open;
  if(open){
    mobileNav.classList.add('is-open');
    if(animate)menuAnimation=animateUi(mobileNav,[{opacity:0,transform:'translateY(-5px) scale(.97)'},{opacity:1,transform:'none'}],{duration:180});
  }else{
    menuAnimation=animate&&mobileNav.classList.contains('is-open')?animateUi(mobileNav,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-4px) scale(.98)'}],{duration:140,fill:'forwards'}):undefined;
    const finish=()=>{if(change===menuChange){mobileNav.classList.remove('is-open');menuAnimation?.cancel();}};
    if(menuAnimation)void menuAnimation.finished.catch(()=>{}).then(finish);else finish();
  }
};
syncMobileMenu(false);
menuToggle?.addEventListener('click',()=>syncMobileMenu(menuToggle.getAttribute('aria-expanded')!=='true',true));
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>syncMobileMenu(false)));
addEventListener('keydown',event=>{if(event.key==='Escape'&&menuToggle?.getAttribute('aria-expanded')==='true'){syncMobileMenu(false,true);menuToggle.focus({preventScroll:true});}});
document.addEventListener('pointerdown',event=>{if(menuToggle?.getAttribute('aria-expanded')==='true'&&event.target instanceof Node&&!mobileNav?.contains(event.target)&&!menuToggle.contains(event.target))syncMobileMenu(false,true);});
matchMedia('(min-width:761px)').addEventListener('change',event=>{if(event.matches)syncMobileMenu(false);});
const updateScroll=()=>{
  const visible=scrollY>620;
  if(backToTop){backToTop.classList.toggle('is-visible',visible);backToTop.inert=!visible;}
  if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,scrollY/max)):0})`;}
};
addEventListener('scroll',updateScroll,{passive:true});
addEventListener('resize',updateScroll);
new ResizeObserver(updateScroll).observe(body);
updateScroll();
backToTop?.addEventListener('click',()=>scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion:reduce)').matches||body.dataset.motion==='off'?'instant':'smooth'}));

const randomReadLink=document.querySelector<HTMLAnchorElement>('[data-random-read]');
const randomReadButton=document.querySelector<HTMLButtonElement>('[data-random-draw]');
const randomReadOptions=[...document.querySelectorAll<HTMLAnchorElement>('[data-random-source]')];
if(randomReadLink&&randomReadButton&&randomReadOptions.length>1){
  const randomReadTitle=randomReadLink.querySelector('strong');
  let selected=randomReadOptions.findIndex(option=>option.href===randomReadLink.href);
  randomReadButton.hidden=false;
  randomReadButton.addEventListener('click',()=>{
    const alternatives=randomReadOptions.filter((_,index)=>index!==selected);
    selected=randomReadOptions.indexOf(alternatives[Math.floor(Math.random()*alternatives.length)]);
    const next=randomReadOptions[selected];
    randomReadLink.href=next.href;
    if(randomReadTitle)randomReadTitle.textContent=next.textContent?.trim()||'打开这篇文章';
  });
}

const repoTargets=[...document.querySelectorAll<HTMLElement>('[data-github-repos]')];
if(repoTargets.length){
  const fallbackByName=new Map(fallbackRepos.map(repo=>[repo.name.toLowerCase(),repo]));
  const esc=(value:unknown)=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
  const safeRepoUrl=(repo:GithubRepo)=>{try{const url=new URL(repo.html_url||`https://github.com/rain-lei/${repo.name}`);return url.origin==='https://github.com'&&url.pathname.toLowerCase().startsWith('/rain-lei/')?url.href:`https://github.com/rain-lei/${encodeURIComponent(repo.name)}`;}catch{return `https://github.com/rain-lei/${encodeURIComponent(repo.name)}`;}};
  const formatRepoDate=(value?:string|null)=>{if(!value)return'';const date=new Date(value);return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replaceAll('/','.');};
  const render=(target:HTMLElement,repos:GithubRepo[])=>{
    const limit=Math.max(1,Number(target.dataset.repoLimit)||3);
    const names=(value?:string)=>value?.split(',').filter(Boolean);
    const selected=selectRepositories(repos,{featured:names(target.dataset.repoFeatured),exclude:names(target.dataset.repoExclude),limit});
    target.innerHTML=selected.map(repo=>{
      const local=fallbackByName.get(repo.name.toLowerCase());
      const language=repo.language||'多语言';
      const color=languageColors[language]||'#8b8b84';
      const topics=(Array.isArray(repo.topics)&&repo.topics.length?repo.topics:local?.topics||[]).slice(0,2);
      const stars=repo.stargazers_count==null?'':`<span class="repo-stars">★ ${Math.max(0,Number(repo.stargazers_count)||0)}</span>`;
      const forks=repo.forks_count==null?'':`<span class="repo-forks">⑂ ${Math.max(0,Number(repo.forks_count)||0)}</span>`;
      const updated=formatRepoDate(repo.pushed_at);
      const description=repo.description||local?.description;
      if(target.dataset.repoLayout==='compact')return `<a class="github-repo-row" href="${esc(safeRepoUrl(repo))}" target="_blank" rel="noopener noreferrer"><span class="repo-row-copy"><strong>${esc(repo.name)}</strong><small>${esc(description||language)}</small></span><span class="repo-arrow" aria-hidden="true">↗</span></a>`;
      return `<a class="github-repo-card" href="${esc(safeRepoUrl(repo))}" target="_blank" rel="noopener noreferrer"><span class="repo-card-content"><span class="repo-title-row"><span class="repo-title-wrap"><strong>${esc(repo.name)}</strong>${repo.name==='rain-lei'?'<em class="repo-badge">本站</em>':''}</span><span class="repo-arrow">↗</span></span>${description?`<span class="repo-description">${esc(description)}</span>`:''}<span class="repo-meta"><span class="repo-language" style="--language-color:${color}"><i></i>${esc(language)}</span>${stars}${forks}${updated?`<time datetime="${esc(repo.pushed_at)}">更新 ${updated}</time>`:''}</span>${topics.length?`<span class="repo-topics">${topics.map(topic=>`<em>${esc(topic)}</em>`).join('')}</span>`:''}</span></a>`;
    }).join('');
  };
  const statusTargets=[...document.querySelectorAll<HTMLElement>('[data-repo-status]')];
  const renderAll=(repos:GithubRepo[])=>{
    repoTargets.forEach(target=>render(target,repos));
    statusTargets.forEach(node=>node.textContent=`${repos.length} 个仓库`);
  };
  const cacheKey='rain-github-repos-v2';
  let cache:{savedAt:number;repos:GithubRepo[]}|null=null;
  try{const parsed=JSON.parse(sessionStorage.getItem(cacheKey)||'null');if(parsed&&Array.isArray(parsed.repos))cache=parsed;}catch{}
  renderAll(cache?.repos||fallbackRepos);
  const cacheFresh=cache&&Date.now()-Number(cache.savedAt)<15*60*1000;
  if(!cacheFresh){
    const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),7000);
    fetch('https://api.github.com/users/rain-lei/repos?sort=pushed&direction=desc&per_page=30',{headers:{Accept:'application/vnd.github+json'},signal:controller.signal})
      .then(response=>response.ok?response.json():Promise.reject(new Error(`GitHub API ${response.status}`)))
      .then((repos:GithubRepo[])=>{const publicRepos=repos.filter(repo=>repo.name&&!repo.fork&&!repo.archived);if(!publicRepos.length)throw new Error('No repositories');renderAll(publicRepos);try{sessionStorage.setItem(cacheKey,JSON.stringify({savedAt:Date.now(),repos:publicRepos}));}catch{}})
      .catch(()=>{})
      .finally(()=>window.clearTimeout(timeout));
  }
}

document.querySelectorAll<HTMLImageElement>('.friend-link-avatar img').forEach(image=>{
  const show=()=>image.parentElement?.classList.add('has-image');
  const hide=()=>image.hidden=true;
  image.addEventListener('load',show,{once:true});
  image.addEventListener('error',hide,{once:true});
  if(image.complete){if(image.naturalWidth)show();else hide();}
});

const filters=[...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const tagFilters=[...document.querySelectorAll<HTMLButtonElement>('[data-tag-filter]')];
const archiveItems=[...document.querySelectorAll<HTMLElement>('.archive-item')];
const archiveSearch=document.querySelector<HTMLInputElement>('#archiveSearch');
const fullSearchLinks = document.querySelectorAll<HTMLAnchorElement>('[data-full-search]');
const resultCount=document.querySelector<HTMLElement>('#archiveResultCount');
const archiveClear=document.querySelector<HTMLButtonElement>('#archiveClear');
const selectedTag=document.querySelector<HTMLElement>('#archiveSelectedTag');
const archiveUrl=new URL(location.href);const validCategories=new Set(['all','study','life','entertainment']);const validTags=new Set(tagFilters.map(button=>button.dataset.tagFilter||'all'));let active=validCategories.has(archiveUrl.searchParams.get('category')||'')?archiveUrl.searchParams.get('category')||'all':'all';let activeTag=validTags.has(archiveUrl.searchParams.get('tag')||'')?archiveUrl.searchParams.get('tag')||'all':'all';
const syncArchiveUrl=()=>{const params=new URLSearchParams();const q=(archiveSearch?.value||'').trim();if(active!=='all')params.set('category',active);if(activeTag!=='all')params.set('tag',activeTag);if(q)params.set('q',q);const next=params.toString();history.replaceState(null,'',`${location.pathname}${next?`?${next}`:''}`);};
const archiveAnimations=new Set<Animation>();
const filterArchive=(animate=false)=>{
  // Capture what is currently on screen, even halfway through a previous filter.
  const previous = animate && uiMotionEnabled()
    ? new Map(archiveItems.filter(item => !item.hidden).map(item => [item, item.getBoundingClientRect()]))
    : null;
  archiveAnimations.forEach(animation=>animation.cancel());archiveAnimations.clear();
  const keyword = archiveSearch?.value.trim() || '';
  const q = keyword.toLowerCase();
  for (const link of fullSearchLinks) {
    link.href = keyword ? `/search/?q=${encodeURIComponent(keyword)}` : '/search/';
    if (link.closest('#archiveEmpty')) link.hidden = !keyword;
  }
  let count=0;
  archiveItems.forEach(item=>{
    const tags=(item.dataset.tags||'').toLowerCase().split('|');
    const visible=(active==='all'||item.dataset.category===active)&&(activeTag==='all'||tags.includes(activeTag.toLowerCase()))&&(!q||`${item.textContent||''} ${item.dataset.tags||''}`.toLowerCase().includes(q));
    item.hidden=!visible;
    if(visible)count++;
  });
  if(resultCount)resultCount.textContent=`${count} 篇文章`;
  if(archiveClear)archiveClear.hidden=active==='all'&&activeTag==='all'&&!q;
  if(selectedTag){selectedTag.hidden=activeTag==='all';selectedTag.textContent=activeTag==='all'?'':activeTag;}
  const empty=document.getElementById('archiveEmpty');if(empty)empty.hidden=count>0;
  if(previous){
    archiveItems.filter(item=>!item.hidden).forEach((item,index)=>{
      const after = item.getBoundingClientRect();
      if (after.bottom <= 0 || after.top >= innerHeight) return;
      const before = previous.get(item);
      const wasVisible = before && before.bottom > 0 && before.top < innerHeight;
      const x = wasVisible ? before.left - after.left : 0;
      const y = wasVisible ? before.top - after.top : 6;
      if (wasVisible && Math.abs(x) + Math.abs(y) < 1) return;
      const animation = animateUi(item, [
        { opacity: wasVisible ? 1 : .5, translate: `${x}px ${y}px` },
        { opacity: 1, translate: '0 0' },
      ], { duration: 180, delay: wasVisible ? 0 : Math.min(index * 15, 45), fill: 'backwards' });
      if(animation){archiveAnimations.add(animation);const forget=()=>archiveAnimations.delete(animation);animation.addEventListener('finish',forget,{once:true});animation.addEventListener('cancel',forget,{once:true});}
    });
  }
};
const filterButtons = [...filters, ...tagFilters];
const syncFilterButtons = () => {
  for (const button of filterButtons) {
    const selected = button.dataset.filter === active || button.dataset.tagFilter === activeTag;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
};
for (const button of filterButtons) {
  button.addEventListener('click', event => {
    if (button.dataset.filter) active = button.dataset.filter;
    if (button.dataset.tagFilter) activeTag = button.dataset.tagFilter;
    syncFilterButtons();
    syncArchiveUrl();
    filterArchive(event.detail > 0);
  });
}
if (archiveSearch) {
  const initialQuery = archiveUrl.searchParams.get('q') || '';
  if (!archiveSearch.value) archiveSearch.value = initialQuery;
  else if (archiveSearch.value !== initialQuery) syncArchiveUrl();
  archiveSearch.addEventListener('input', () => {
    syncArchiveUrl();
    filterArchive();
  });
}
syncFilterButtons();
filterArchive();
document.querySelectorAll<HTMLButtonElement>('[data-archive-reset]').forEach(button => {
  button.addEventListener('click', event => {
    active = activeTag = 'all';
    if (archiveSearch) archiveSearch.value = '';
    syncFilterButtons();
    syncArchiveUrl();
    filterArchive(event.detail > 0);
    archiveSearch?.focus();
  });
});

document.querySelectorAll<HTMLTableElement>('.article-body table').forEach(table=>{
  if(table.closest('.markdown-table-wrap'))return;
  const frame=document.createElement('div');frame.className='article-table-frame';
  const label=document.createElement('div');label.className='article-content-label';label.hidden=true;label.textContent='左右滑动查看 ↔';
  const wrap=document.createElement('div');wrap.className='markdown-table-wrap';
  table.before(frame);frame.append(label,wrap);wrap.append(table);
  const syncOverflow=()=>{
    const scrollable=wrap.scrollWidth>wrap.clientWidth+1;
    label.hidden=!scrollable;
    if(scrollable){wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','可横向滚动的表格');}
    else{wrap.removeAttribute('tabindex');wrap.removeAttribute('role');wrap.removeAttribute('aria-label');}
  };
  const observer=new ResizeObserver(syncOverflow);observer.observe(wrap);observer.observe(table);syncOverflow();
});

document.querySelectorAll<HTMLElement>('.article-body pre').forEach(pre=>{
  if(pre.closest('.article-code-frame'))return;
  const code=pre.querySelector('code');
  const language=pre.dataset.language||'text';
  const frame=document.createElement('div');frame.className='article-code-frame';
  const toolbar=document.createElement('div');toolbar.className='article-code-toolbar';
  const label=document.createElement('span');label.textContent=language.toUpperCase();
  const copy=document.createElement('button');copy.type='button';copy.textContent='复制';copy.setAttribute('aria-label','复制代码');
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code?.textContent||pre.textContent||'');copy.textContent='已复制 ✓';window.setTimeout(()=>copy.textContent='复制',1400);}catch{copy.textContent='复制失败';}});
  pre.before(frame);toolbar.append(label,copy);frame.append(toolbar,pre);
});

const articleImages=[...document.querySelectorAll<HTMLImageElement>('.article-body img')];
articleImages.forEach(img=>{img.loading='lazy';img.decoding='async';});
const previewImages=articleImages.filter(img=>!img.closest('a'));
if(previewImages.length){
  const lightbox=document.createElement('dialog');lightbox.className='article-lightbox';lightbox.setAttribute('aria-label','文章图片预览');
  const lightboxClose=document.createElement('button');lightboxClose.type='button';lightboxClose.className='article-lightbox-close';lightboxClose.setAttribute('aria-label','关闭图片预览');lightboxClose.textContent='×';
  const lightboxImage=document.createElement('img');lightboxImage.alt='';
  const lightboxCaption=document.createElement('p');
  lightbox.append(lightboxClose,lightboxImage,lightboxCaption);document.body.append(lightbox);
  const closeLightbox=()=>{if(lightbox.open)lightbox.close();};
  lightboxClose.addEventListener('click',closeLightbox);lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox();});lightbox.addEventListener('close',()=>{lightboxImage.removeAttribute('src');lightboxCaption.textContent='';});
  previewImages.forEach(img=>{
    const link=document.createElement('a');link.className='article-image-link';link.href=img.currentSrc||img.src;link.setAttribute('aria-label',`${img.alt||'文章图片'}：放大查看`);link.setAttribute('aria-haspopup','dialog');
    link.addEventListener('click',event=>{event.preventDefault();lightboxImage.src=link.href;lightboxImage.alt=img.alt||'文章图片';lightboxCaption.textContent=img.alt||'文章图片';lightbox.showModal();});
    img.before(link);link.append(img);
  });
}
