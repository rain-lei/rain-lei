export function initCursor(motionAllowed:()=>boolean) {
  const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
  const backdrop=document.querySelector<HTMLElement>('.loopy-backdrop');
  if(!backdrop)return;
  const canvas=document.createElement('canvas');
  canvas.className='loopy-cursor';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
  const context=canvas.getContext('2d');if(!context)return;
  const ctx:CanvasRenderingContext2D=context;
  ctx.lineJoin='round';ctx.lineCap='round';
  type Echo={x:number;y:number;born:number;tilt:number;size:number;drift:number};
  let echoes:Echo[]=[];
  let outline:Path2D|undefined;
  let frame=0,lastFrame=0,lastStamp=0,lastX=0,lastY=0,distance=0,hasPointer=false;
  let width=innerWidth,height=innerHeight,painted=false;
  const scene={x:0,y:0,tx:0,ty:0};
  const enabled=()=>motionAllowed()&&finePointer.matches;
  fetch('/images/loopy/outline.svg').then(r=>r.ok?r.text():Promise.reject())
    .then(source=>{const d=new DOMParser().parseFromString(source,'image/svg+xml').querySelector('path')?.getAttribute('d');if(d)outline=new Path2D(d);}).catch(()=>{});
  const clear=()=>{if(painted)ctx.clearRect(0,0,width,height);painted=false;};
  const paintScene=()=>{backdrop.style.setProperty('--scene-x',`${scene.x.toFixed(2)}px`);backdrop.style.setProperty('--scene-y',`${scene.y.toFixed(2)}px`);};
  const reset=()=>{cancelAnimationFrame(frame);frame=lastFrame=0;echoes=[];hasPointer=false;distance=0;clear();scene.x=scene.y=scene.tx=scene.ty=0;paintScene();};
  const resize=()=>{reset();width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);};
  function tick(now:number) {
    frame=0;if(!enabled()){reset();return;}
    const dt=Math.min((now-(lastFrame||now-16.67))/1000,.04);lastFrame=now;
    const ease=1-Math.exp(-5*dt);scene.x+=(scene.tx-scene.x)*ease;scene.y+=(scene.ty-scene.y)*ease;paintScene();
    clear();echoes=echoes.filter(e=>now-e.born<440);
    const dark=document.documentElement.dataset.theme==='dark';
    if(outline)for(const echo of echoes){
      const age=(now-echo.born)/440;
      const alpha=Math.sin(Math.min(1,age*5)*Math.PI/2)*Math.pow(1-age,1.7)*.36;
      const scale=echo.size/166*(1-age*.2);
      ctx.save();ctx.translate(echo.x+echo.drift*age,echo.y-age*9);ctx.rotate(echo.tilt+age*.12);ctx.scale(scale,scale);ctx.translate(-128,-95);
      ctx.globalAlpha=alpha;ctx.fillStyle=dark?'#d997b4':'#e7abc2';ctx.strokeStyle=dark?'#e4abc4':'#c07b99';ctx.lineWidth=.8/scale;
      ctx.fill(outline);ctx.globalAlpha=alpha*1.5;ctx.stroke(outline);ctx.restore();painted=true;
    }
    if(echoes.length||Math.abs(scene.tx-scene.x)+Math.abs(scene.ty-scene.y)>.02)frame=requestAnimationFrame(tick);else lastFrame=0;
  }
  window.addEventListener('pointermove',event=>{
    if(!enabled()||event.pointerType!=='mouse')return;
    const now=performance.now(),dx=event.clientX-lastX,dy=event.clientY-lastY;
    const excluded=(event.target as Element)?.closest('.markdown-body, input, textarea, pre, iframe, dialog');
    if(hasPointer)distance+=Math.min(Math.hypot(dx,dy),70);
    if(!excluded&&hasPointer&&distance>48&&now-lastStamp>85&&outline){
      echoes.push({x:event.clientX+12,y:event.clientY+16,born:now,tilt:Math.max(-.22,Math.min(.22,dx*.013)),size:19+(echoes.length%2)*3,drift:dx>0?-5:5});
      if(echoes.length>3)echoes.shift();lastStamp=now;distance=0;
    }
    if(excluded){echoes=[];clear();distance=0;}
    lastX=event.clientX;lastY=event.clientY;hasPointer=true;
    scene.tx=(event.clientX/width-.5)*9;scene.ty=(event.clientY/height-.5)*7;
    if(!frame)frame=requestAnimationFrame(tick);
  },{passive:true});
  document.addEventListener('pointerout',event=>{if(!event.relatedTarget)reset();});
  document.addEventListener('loopy:motion',()=>{if(!enabled())reset();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});
  window.addEventListener('blur',reset);window.addEventListener('pointercancel',reset);
  window.addEventListener('scroll',()=>{echoes=[];hasPointer=false;clear();},{passive:true});
  window.addEventListener('resize',resize);finePointer.addEventListener('change',reset);resize();
}
