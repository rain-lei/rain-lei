const body=document.body;
const themeToggle=document.getElementById('themeToggle');
const themeIcon=document.getElementById('themeIcon');
const themeColor=document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
const menuToggle=document.getElementById('menuToggle');
const mobileNav=document.getElementById('mobileNav');
const header=document.querySelector('.v2-header');
const progress=document.getElementById('scrollProgress');
const backToTop=document.getElementById('backToTop');
if(localStorage.getItem('rain-theme')==='dark') body.classList.add('dark');
const updateTheme=()=>{const dark=body.classList.contains('dark');document.documentElement.dataset.theme=dark?'dark':'light';if(themeIcon) themeIcon.textContent=dark?'◑':'◐';if(themeColor)themeColor.content=dark?'#131411':'#f2f1ec';};
updateTheme();
themeToggle?.addEventListener('click',()=>{body.classList.toggle('dark');localStorage.setItem('rain-theme',body.classList.contains('dark')?'dark':'light');updateTheme();});
const syncMobileMenu=(open:boolean)=>{menuToggle?.setAttribute('aria-expanded',String(open));menuToggle?.setAttribute('aria-label',open?'关闭菜单':'打开菜单');mobileNav?.setAttribute('aria-hidden',String(!open));};
menuToggle?.addEventListener('click',()=>syncMobileMenu(Boolean(mobileNav?.classList.toggle('is-open'))));
mobileNav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{mobileNav.classList.remove('is-open');syncMobileMenu(false);}));
addEventListener('keydown',event=>{if(event.key==='Escape'&&mobileNav?.classList.contains('is-open')){mobileNav.classList.remove('is-open');syncMobileMenu(false);menuToggle?.focus();}});
const updateScroll=()=>{header?.classList.toggle('is-scrolled',scrollY>18);backToTop?.classList.toggle('is-visible',scrollY>620);if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;}};
addEventListener('scroll',updateScroll,{passive:true});updateScroll();
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
backToTop?.addEventListener('click',()=>scrollTo({top:0,behavior:reduced?'auto':'smooth'}));
const reveals=document.querySelectorAll('.v2-reveal');
if(reduced||!('IntersectionObserver' in window)) reveals.forEach(el=>el.classList.add('is-visible')); else {const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});reveals.forEach(el=>observer.observe(el));}

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
    randomReadLink.classList.remove('is-new-pick');
    void randomReadLink.offsetWidth;
    randomReadLink.classList.add('is-new-pick');
  });
}

const repoTargets=[...document.querySelectorAll<HTMLElement>('[data-github-repos]')];
if(repoTargets.length){
  type GithubRepo={name:string;description?:string|null;language?:string|null;stargazers_count?:number|null;forks_count?:number|null;pushed_at?:string|null;topics?:string[];html_url?:string;fork?:boolean;archived?:boolean};
  const fallbackRepos:GithubRepo[]=[
    {name:'lingxi',description:'Python 项目实验与持续开发记录',language:'Python',topics:['Python'],html_url:'https://github.com/rain-lei/lingxi'},
    {name:'rain-lei',description:'个人博客、内容系统与 GitHub 资料页',language:'CSS',topics:['Astro','Blog'],html_url:'https://github.com/rain-lei/rain-lei'},
    {name:'easyxgame',description:'EasyX 课程作业与原创游戏《萌泡大作战》',language:'C++',topics:['EasyX','Game'],html_url:'https://github.com/rain-lei/easyxgame'},
    {name:'EDAbackend-todo-practice',description:'JWT 鉴权与 Todo CRUD 后端练习',language:'JavaScript',topics:['Express','JWT'],html_url:'https://github.com/rain-lei/EDAbackend-todo-practice'},
    {name:'junli',description:'HTML 页面实验与前端练习',language:'HTML',topics:['HTML'],html_url:'https://github.com/rain-lei/junli'},
    {name:'vibecodearts',description:'ChronoFlow：按个人精力曲线安排任务',language:'TypeScript',topics:['React','Vite'],html_url:'https://github.com/rain-lei/vibecodearts'},
    {name:'MarketMirror',description:'多类型投资者市场冲击仿真平台',language:'Vue',topics:['FastAPI','ECharts'],html_url:'https://github.com/rain-lei/MarketMirror'},
    {name:'ppt_name_replacer',description:'从 Excel 批量生成个性化 PPT 奖状',language:'Python',topics:['Flask','Automation'],html_url:'https://github.com/rain-lei/ppt_name_replacer'},
    {name:'ascd',description:'Vue 3 与 Vite 的前端模板练习',language:'Vue',topics:['Vue 3','Vite'],html_url:'https://github.com/rain-lei/ascd'},
  ];
  const fallbackByName=new Map(fallbackRepos.map(repo=>[repo.name.toLowerCase(),repo]));
  const languageColors:Record<string,string>={TypeScript:'#3178c6',JavaScript:'#f1e05a',Vue:'#41b883',Python:'#3572a5','C++':'#f34b7d',C:'#555555',HTML:'#e34c26',CSS:'#663399'};
  const esc=(value:unknown)=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));
  const safeRepoUrl=(repo:GithubRepo)=>{try{const url=new URL(repo.html_url||`https://github.com/rain-lei/${repo.name}`);return url.origin==='https://github.com'&&url.pathname.toLowerCase().startsWith('/rain-lei/')?url.href:`https://github.com/rain-lei/${encodeURIComponent(repo.name)}`;}catch{return `https://github.com/rain-lei/${encodeURIComponent(repo.name)}`;}};
  const formatRepoDate=(value?:string|null)=>{if(!value)return'';const date=new Date(value);return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit'}).format(date).replaceAll('/','.');};
  const render=(target:HTMLElement,repos:GithubRepo[])=>{
    const limit=Math.max(1,Number(target.dataset.repoLimit)||3);
    target.innerHTML=repos.slice(0,limit).map((repo,index)=>{
      const local=fallbackByName.get(repo.name.toLowerCase());
      const language=repo.language||'多语言';
      const color=languageColors[language]||'#8b8b84';
      const topics=(Array.isArray(repo.topics)&&repo.topics.length?repo.topics:local?.topics||[]).slice(0,2);
      const stars=repo.stargazers_count==null?'':`<span class="repo-stars">★ ${Math.max(0,Number(repo.stargazers_count)||0)}</span>`;
      const forks=repo.forks_count==null?'':`<span class="repo-forks">⑂ ${Math.max(0,Number(repo.forks_count)||0)}</span>`;
      const updated=formatRepoDate(repo.pushed_at);
      return `<a class="github-repo-card" href="${esc(safeRepoUrl(repo))}" target="_blank" rel="noopener noreferrer"><span class="repo-index">${String(index+1).padStart(2,'0')}</span><span class="repo-card-content"><span class="repo-title-row"><span class="repo-title-wrap"><strong>${esc(repo.name)}</strong>${repo.name==='rain-lei'?'<em class="repo-badge">本站</em>':''}</span><span class="repo-arrow">↗</span></span><span class="repo-description">${esc(repo.description||local?.description||'暂无项目简介。')}</span><span class="repo-meta"><span class="repo-language" style="--language-color:${color}"><i></i>${esc(language)}</span>${stars}${forks}${updated?`<time datetime="${esc(repo.pushed_at)}">更新 ${updated}</time>`:''}</span>${topics.length?`<span class="repo-topics">${topics.map(topic=>`<em>${esc(topic)}</em>`).join('')}</span>`:''}</span></a>`;
    }).join('');
  };
  const statusTargets=[...document.querySelectorAll<HTMLElement>('[data-repo-status]')];
  const updateSummary=(repos:GithubRepo[],source:'live'|'cache'|'fallback')=>{
    document.querySelectorAll<HTMLElement>('[data-repo-count]').forEach(node=>node.textContent=String(repos.length).padStart(2,'0'));
    const languages=new Set(repos.map(repo=>repo.language).filter(Boolean));
    document.querySelectorAll<HTMLElement>('[data-repo-language-count]').forEach(node=>node.textContent=String(languages.size).padStart(2,'0'));
    const latest=formatRepoDate(repos.find(repo=>repo.pushed_at)?.pushed_at);
    document.querySelectorAll<HTMLElement>('[data-repo-latest]').forEach(node=>node.textContent=latest?latest.slice(5):source==='fallback'?'本地':'缓存');
    const label=source==='live'?`已读取 ${repos.length} 个仓库`:source==='cache'?`使用缓存 · ${repos.length} 个仓库`:`本地清单 · ${repos.length} 个仓库`;
    statusTargets.forEach(node=>{node.childNodes.forEach(child=>{if(child.nodeType===Node.TEXT_NODE)child.remove();});node.append(document.createTextNode(label));node.classList.toggle('is-offline',source==='fallback');});
  };
  const renderAll=(repos:GithubRepo[],source:'live'|'cache'|'fallback')=>{repoTargets.forEach(target=>render(target,repos));updateSummary(repos,source);};
  const cacheKey='rain-github-repos-v2';
  let cache:{savedAt:number;repos:GithubRepo[]}|null=null;
  try{const parsed=JSON.parse(sessionStorage.getItem(cacheKey)||'null');if(parsed&&Array.isArray(parsed.repos))cache=parsed;}catch{}
  if(cache)renderAll(cache.repos,'cache');else renderAll(fallbackRepos,'fallback');
  const cacheFresh=cache&&Date.now()-Number(cache.savedAt)<15*60*1000;
  if(!cacheFresh){
    const controller=new AbortController();const timeout=window.setTimeout(()=>controller.abort(),7000);
    fetch('https://api.github.com/users/rain-lei/repos?sort=pushed&direction=desc&per_page=30',{headers:{Accept:'application/vnd.github+json'},signal:controller.signal})
      .then(response=>response.ok?response.json():Promise.reject(new Error(`GitHub API ${response.status}`)))
      .then((repos:GithubRepo[])=>{const publicRepos=repos.filter(repo=>repo.name&&!repo.fork&&!repo.archived);if(!publicRepos.length)throw new Error('No repositories');renderAll(publicRepos,'live');try{sessionStorage.setItem(cacheKey,JSON.stringify({savedAt:Date.now(),repos:publicRepos}));}catch{}})
      .catch(()=>{if(!cache)renderAll(fallbackRepos,'fallback');})
      .finally(()=>window.clearTimeout(timeout));
  }
}

const friendTargets=[...document.querySelectorAll<HTMLElement>('[data-friend-links]')];
if(friendTargets.length){
  type FriendLink={name:string;url:string;avatar?:string;description?:string;sort_order?:number;enabled?:boolean};
  const httpsUrl=(value:unknown)=>{try{const url=new URL(String(value||''));return url.protocol==='https:'&&!url.username&&!url.password?url:null;}catch{return null;}};
  const avatarFor=(link:FriendLink,site:URL)=>{
    const avatar=document.createElement('span');avatar.className='friend-link-avatar';
    const initial=document.createElement('span');initial.className='friend-link-initial';initial.textContent=link.name.trim().slice(0,1).toUpperCase()||'·';avatar.append(initial);
    const source=httpsUrl(link.avatar)||httpsUrl(new URL('/favicon.ico',site).href);
    if(source){const image=document.createElement('img');image.src=source.href;image.alt='';image.loading='lazy';image.decoding='async';image.addEventListener('load',()=>avatar.classList.add('has-image'));image.addEventListener('error',()=>image.remove());avatar.append(image);}
    return avatar;
  };
  const renderFriends=(target:HTMLElement,items:FriendLink[])=>{
    const fragment=document.createDocumentFragment();
    items.forEach(link=>{
      const site=httpsUrl(link.url);if(!site)return;
      const card=document.createElement('a');card.className='friend-link-card';card.href=site.href;card.target='_blank';card.rel='noopener noreferrer';card.setAttribute('aria-label',`${link.name}（在新窗口打开）`);
      const copy=document.createElement('span');copy.className='friend-link-copy';
      const title=document.createElement('strong');title.textContent=link.name.trim();
      const description=document.createElement('small');description.textContent=link.description?.trim()||'去看看这个站点';
      const domain=document.createElement('em');domain.textContent=site.hostname.replace(/^www\./,'');
      const arrow=document.createElement('b');arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');
      copy.append(title,description,domain);card.append(avatarFor(link,site),copy,arrow);fragment.append(card);
    });
    if(fragment.childNodes.length)target.replaceChildren(fragment);
  };
  const fallbacks=new Map(friendTargets.map(target=>[target,target.innerHTML]));
  fetch('/friend-links.json',{headers:{Accept:'application/json'}})
    .then(response=>response.ok?response.json():Promise.reject(new Error(`Friend links ${response.status}`)))
    .then((data:{links?:FriendLink[]})=>{
      const visible=(Array.isArray(data.links)?data.links:[]).filter(link=>link&&link.enabled!==false&&link.name?.trim()&&httpsUrl(link.url)).sort((a,b)=>(Number.isFinite(a.sort_order)?Number(a.sort_order):9999)-(Number.isFinite(b.sort_order)?Number(b.sort_order):9999)||a.name.localeCompare(b.name,'zh-CN'));
      if(!visible.length)throw new Error('No visible friend links');
      friendTargets.forEach(target=>renderFriends(target,visible));
      document.querySelectorAll<HTMLElement>('[data-friend-status]').forEach(node=>node.textContent=`${visible.length} 个站点 · 欢迎提交 PR`);
    })
    .catch(()=>friendTargets.forEach(target=>{target.innerHTML=fallbacks.get(target)||'';}));
}

const filters=[...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const tagFilters=[...document.querySelectorAll<HTMLButtonElement>('[data-tag-filter]')];
const archiveItems=[...document.querySelectorAll<HTMLElement>('.archive-item')];
const archiveSearch=document.querySelector<HTMLInputElement>('#archiveSearch');
const resultCount=document.querySelector<HTMLElement>('#archiveResultCount');
const archiveUrl=new URL(location.href);const validCategories=new Set(['all','study','life','entertainment']);const validTags=new Set(tagFilters.map(button=>button.dataset.tagFilter||'all'));let active=validCategories.has(archiveUrl.searchParams.get('category')||'')?archiveUrl.searchParams.get('category')||'all':'all';let activeTag=validTags.has(archiveUrl.searchParams.get('tag')||'')?archiveUrl.searchParams.get('tag')||'all':'all';
const syncArchiveUrl=()=>{const params=new URLSearchParams();const q=(archiveSearch?.value||'').trim();if(active!=='all')params.set('category',active);if(activeTag!=='all')params.set('tag',activeTag);if(q)params.set('q',q);const next=params.toString();history.replaceState(null,'',`${location.pathname}${next?`?${next}`:''}`);};
const filterArchive=()=>{const q=(archiveSearch?.value||'').trim().toLowerCase();let count=0;archiveItems.forEach(item=>{const tags=(item.dataset.tags||'').toLowerCase().split('|');const visible=(active==='all'||item.dataset.category===active)&&(activeTag==='all'||tags.includes(activeTag.toLowerCase()))&&(!q||(item.textContent||'').toLowerCase().includes(q));item.hidden=!visible;item.classList.toggle('is-filtered-out',!visible);item.setAttribute('aria-hidden',String(!visible));if(visible)count++;});if(resultCount)resultCount.textContent=`${count} 篇结果`;};
filters.forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter||'all';filters.forEach(b=>{const selected=b===button;b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected));});syncArchiveUrl();filterArchive();}));
tagFilters.forEach(button=>button.addEventListener('click',()=>{activeTag=button.dataset.tagFilter||'all';tagFilters.forEach(b=>{const selected=b===button;b.classList.toggle('is-active',selected);b.setAttribute('aria-pressed',String(selected));});syncArchiveUrl();filterArchive();}));
if(archiveSearch){archiveSearch.value=archiveUrl.searchParams.get('q')||'';}
filters.forEach(button=>{const selected=(button.dataset.filter||'all')===active;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));});
tagFilters.forEach(button=>{const selected=(button.dataset.tagFilter||'all')===activeTag;button.classList.toggle('is-active',selected);button.setAttribute('aria-pressed',String(selected));});
archiveSearch?.addEventListener('input',()=>{syncArchiveUrl();filterArchive();});filterArchive();

const articleToc=document.querySelector<HTMLElement>('#articleToc');
const articleTocLinks=document.querySelector<HTMLElement>('#articleTocLinks');
const articleHeadings=[...document.querySelectorAll<HTMLElement>('.article-body h2')];
if(articleToc&&articleTocLinks&&articleHeadings.length>1){
  const tocLinks=articleHeadings.map((heading,index)=>{
    if(!heading.id)heading.id=`section-${String(index+1).padStart(2,'0')}`;
    const link=document.createElement('a');
    link.href=`#${heading.id}`;
    const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
    const label=document.createElement('b');label.textContent=heading.textContent?.trim()||`第 ${index+1} 节`;
    link.append(number,label);articleTocLinks.append(link);return link;
  });
  articleToc.hidden=false;
  let tocFrame=0;
  const updateToc=()=>{tocFrame=0;let current=0;articleHeadings.forEach((heading,index)=>{if(heading.getBoundingClientRect().top<=150)current=index;});tocLinks.forEach((link,index)=>{const selected=index===current;link.classList.toggle('is-active',selected);if(selected)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});};
  addEventListener('scroll',()=>{if(!tocFrame)tocFrame=requestAnimationFrame(updateToc);},{passive:true});
  updateToc();
}

document.querySelectorAll<HTMLTableElement>('.article-body table').forEach(table=>{
  if(table.closest('.markdown-table-wrap'))return;
  const frame=document.createElement('div');frame.className='article-table-frame';
  const label=document.createElement('div');label.className='article-content-label';label.innerHTML='<span>TABLE</span><small>横向滑动查看完整表格 →</small>';
  const wrap=document.createElement('div');wrap.className='markdown-table-wrap';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','可横向滚动的表格');
  table.before(frame);frame.append(label,wrap);wrap.append(table);
});

document.querySelectorAll<HTMLElement>('.article-body pre').forEach(pre=>{
  if(pre.closest('.article-code-frame'))return;
  const code=pre.querySelector('code');
  const language=[...(code?.classList||[])].find(name=>name.startsWith('language-'))?.replace('language-','')||'TEXT';
  const frame=document.createElement('div');frame.className='article-code-frame';
  const toolbar=document.createElement('div');toolbar.className='article-code-toolbar';
  const label=document.createElement('span');label.textContent=language.toUpperCase();
  const copy=document.createElement('button');copy.type='button';copy.textContent='复制';copy.setAttribute('aria-label','复制代码');
  copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(code?.textContent||pre.textContent||'');copy.textContent='已复制 ✓';window.setTimeout(()=>copy.textContent='复制',1400);}catch{copy.textContent='复制失败';}});
  pre.before(frame);toolbar.append(label,copy);frame.append(toolbar,pre);
});

const lightbox=document.createElement('dialog');lightbox.className='article-lightbox';lightbox.setAttribute('aria-label','文章图片预览');
const lightboxClose=document.createElement('button');lightboxClose.type='button';lightboxClose.className='article-lightbox-close';lightboxClose.setAttribute('aria-label','关闭图片预览');lightboxClose.textContent='×';
const lightboxImage=document.createElement('img');lightboxImage.alt='';
const lightboxCaption=document.createElement('p');
lightbox.append(lightboxClose,lightboxImage,lightboxCaption);document.body.append(lightbox);
const closeLightbox=()=>{if(lightbox.open)lightbox.close();};
lightboxClose.addEventListener('click',closeLightbox);lightbox.addEventListener('click',event=>{if(event.target===lightbox)closeLightbox();});lightbox.addEventListener('close',()=>{lightboxImage.removeAttribute('src');lightboxCaption.textContent='';});
document.querySelectorAll<HTMLImageElement>('.article-body img').forEach(img=>{
  img.loading='lazy';img.decoding='async';
  if(img.closest('a'))return;
  const link=document.createElement('a');link.className='article-image-link';link.href=img.currentSrc||img.src;link.setAttribute('aria-label',`${img.alt||'文章图片'}：放大查看`);link.setAttribute('aria-haspopup','dialog');
  link.addEventListener('click',event=>{event.preventDefault();lightboxImage.src=link.href;lightboxImage.alt=img.alt||'文章图片';lightboxCaption.textContent=img.alt||'文章图片';lightbox.showModal();});
  img.before(link);link.append(img);
});
addEventListener('keydown',event=>{if(event.key==='Escape'&&lightbox.open)closeLightbox();});
