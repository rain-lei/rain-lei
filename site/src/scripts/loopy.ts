import { initCursor } from './cursor';
import { initHomeOpening } from './home-opening';

const body=document.body;
const button=document.querySelector<HTMLButtonElement>('#motionToggle');
const reduced=matchMedia('(prefers-reduced-motion:reduce)');
const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
const allowed=()=>body.dataset.motion==='on'&&!reduced.matches&&!document.hidden;
let preference=true;
try { preference=localStorage.getItem('rain-motion')!=='off'; } catch {}
const transient=new Set<Animation>();
const animate=(element:Element,keyframes:Keyframe[],options:KeyframeAnimationOptions)=>{
  if(!allowed())return;
  const animation=element.animate(keyframes,options);transient.add(animation);
  const forget=()=>transient.delete(animation);animation.addEventListener('finish',forget,{once:true});animation.addEventListener('cancel',forget,{once:true});
  return animation;
};
const syncMotion=()=>{
  const enabled=preference&&!reduced.matches;body.dataset.motion=enabled?'on':'off';
  document.documentElement.style.scrollBehavior=enabled?'':'auto';
  if(button){button.disabled=reduced.matches;button.setAttribute('aria-pressed',String(enabled));const label=reduced.matches?'已跟随系统减少动态效果':enabled?'暂停动效':'开启动效';button.setAttribute('aria-label',label);button.title=label;}
  if(!enabled){transient.forEach(a=>a.cancel());transient.clear();}
  document.dispatchEvent(new CustomEvent('loopy:motion',{detail:{enabled}}));
};
button?.addEventListener('click',()=>{preference=!preference;try{localStorage.setItem('rain-motion',preference?'on':'off');}catch{}syncMotion();});
reduced.addEventListener('change',syncMotion);syncMotion();
document.addEventListener('visibilitychange',()=>{body.toggleAttribute('data-tab-hidden',document.hidden);if(document.hidden)transient.forEach(a=>a.cancel());});
initCursor(allowed);
const mobileTags=document.querySelector<HTMLDetailsElement>('.tag-details');
if(mobileTags&&matchMedia('(max-width:960px)').matches)mobileTags.open=false;
const mobileToc=document.querySelector<HTMLDetailsElement>('#articleTocDetails');
if(mobileToc&&matchMedia('(max-width:760px)').matches)mobileToc.open=false;

const nav=document.querySelector<HTMLElement>('.v2-nav');
if(nav){
  const links=[...nav.querySelectorAll<HTMLAnchorElement>('a')];
  const active=nav.querySelector<HTMLAnchorElement>('.is-active');
  if(active){
    const indicator=document.createElement('span');indicator.className='nav-indicator';indicator.setAttribute('aria-hidden','true');nav.prepend(indicator);nav.dataset.glide='';
    const point=(link:HTMLElement)=>{if(!nav.offsetWidth)return;indicator.style.setProperty('--nav-x',`${link.offsetLeft}px`);indicator.style.setProperty('--nav-width',`${link.offsetWidth}px`);};
    links.forEach(link=>{link.addEventListener('pointerenter',()=>{if(allowed()&&finePointer.matches)point(link);});link.addEventListener('focus',()=>point(link));});
    nav.addEventListener('pointerleave',()=>point(links.includes(document.activeElement as HTMLAnchorElement)?document.activeElement as HTMLElement:active));
    nav.addEventListener('focusout',e=>{if(!nav.contains(e.relatedTarget as Node))point(active);});
    new ResizeObserver(()=>point(active)).observe(nav);point(active);
    document.addEventListener('loopy:motion',()=>point(active));
  }
}

document.querySelectorAll<HTMLButtonElement>('.loopy-stage').forEach(stage=>{
  const scene=stage.closest<HTMLElement>('.loopy-scene')!;
  const greeting=stage.querySelector<HTMLElement>('.loopy-greeting')!;
  let x=0,y=0,vx=0,vy=0,tx=0,ty=0,frame=0,last=0,lastHello=-Infinity;
  let bounds:DOMRect|undefined;
  const paint=()=>{scene.style.setProperty('--look-x',`${(x*5).toFixed(2)}px`);scene.style.setProperty('--look-y',`${(y*3).toFixed(2)}px`);scene.style.setProperty('--look-tilt',`${(x*1.5).toFixed(2)}deg`);};
  const reset=()=>{cancelAnimationFrame(frame);frame=last=0;x=y=vx=vy=tx=ty=0;paint();};
  function step(time:number){
    frame=0;if(!allowed()){reset();return;}
    const dt=Math.min((time-(last||time-16.67))/1000,.032);last=time;
    vx+=((tx-x)*110-vx*17)*dt;vy+=((ty-y)*110-vy*17)*dt;x+=vx*dt;y+=vy*dt;paint();
    if(Math.abs(tx-x)+Math.abs(ty-y)+Math.abs(vx)+Math.abs(vy)>.001)frame=requestAnimationFrame(step);else last=0;
  }
  const aim=(nx:number,ny:number)=>{tx=nx;ty=ny;if(!frame&&allowed())frame=requestAnimationFrame(step);};
  scene.addEventListener('pointerenter',()=>{bounds=scene.getBoundingClientRect();});
  scene.addEventListener('pointermove',event=>{if(!allowed()||!finePointer.matches||event.pointerType!=='mouse')return;bounds||=scene.getBoundingClientRect();aim((event.clientX-bounds.left)/bounds.width*2-1,(event.clientY-bounds.top)/bounds.height*2-1);},{passive:true});
  scene.addEventListener('pointerleave',()=>aim(0,0));
  window.addEventListener('scroll',()=>{bounds=undefined;},{passive:true});window.addEventListener('resize',()=>{bounds=undefined;reset();});
  document.addEventListener('loopy:motion',()=>{if(!allowed())reset();});document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  stage.addEventListener('click',()=>{
    if(!allowed()||performance.now()-lastHello<900)return;lastHello=performance.now();
    animate(greeting,[{transform:'none'},{transform:'translateY(2px) rotate(-3deg)',offset:.18},{transform:'translateY(-7px) rotate(3deg)',offset:.4},{transform:'rotate(-1deg)',offset:.7},{transform:'none'}],{duration:850,easing:'cubic-bezier(.4,0,.2,1)'});
    stage.querySelectorAll('.hello-spark').forEach((spark,index)=>animate(spark,[{opacity:0,transform:'translateY(5px) scale(.4)'},{opacity:.7,transform:'scale(1)',offset:.35},{opacity:0,transform:'translateY(-13px) scale(.6)'}],{duration:700,delay:120+index*80,easing:'ease-out'}));
  });
});

initHomeOpening(allowed,animate);
if(allowed()){
  document.querySelectorAll('.page-heading').forEach((el,index)=>animate(el,[{opacity:0,translate:'0 9px'},{opacity:1,translate:'0 0'}],{duration:600,delay:Math.min(index*80,160),easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'}));
}

// Show the cached GitHub avatar immediately; refresh it only after a successful load.
const avatar=new Image();
avatar.addEventListener('load',()=>document.querySelectorAll<HTMLImageElement>('[data-github-avatar]').forEach(image=>{image.src=avatar.src;}),{once:true});
avatar.src='https://github.com/rain-lei.png?size=240';
document.addEventListener('keydown',event=>{
  if(event.key!=='/'||event.ctrlKey||event.metaKey||event.altKey||/input|textarea|select/i.test((event.target as HTMLElement)?.tagName||'')||(event.target as HTMLElement)?.isContentEditable)return;
  const input=document.querySelector<HTMLInputElement>('#archiveSearch');
  if(input){event.preventDefault();input.focus();}else if(!document.getElementById('pagefindInput')){event.preventDefault();location.assign('/search/');}
});
