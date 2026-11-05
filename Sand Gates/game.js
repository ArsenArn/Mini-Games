(() => {
  'use strict';
  const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d');
  const E=window.SGEngine,LEVELS=window.SG_LEVELS,COLORS=window.SG_COLORS;
  const CELL=48,PAD=12,STEP=.065,TAU=Math.PI*2;
  const settings={radius:1.2,speed:160,simulation:1,grid:false,areas:false,hiddenBlocks:false,particleCounts:false,timerOn:true,timerSeconds:240};
  let state,index=0,width=0,height=0,dpr=1,drag=null,motion=null,drops=null;
  let started=false,status='playing',remaining=240,last=0,sandClock=0,hudClock=0,time=0;
  let particles=[],effects=[],appear=new Map(),tankLayers=new Map();
  const visual=new Map(),paths=new Map();

  function boardSize() {
    if(!state)return;
    const parentWidth=$('game').closest('.app').clientWidth;
    const maxWidth=parentWidth-(parentWidth<=360?24:40)-20;
    const maxHeight=Math.min(570,Math.max(230,window.innerHeight-325));
    const scale=Math.min(maxWidth/width,maxHeight/height);
    canvas.style.width=`${Math.floor(width*scale)}px`;
    canvas.style.height=`${Math.floor(height*scale)}px`;
    canvas.parentElement.style.width=`${Math.floor(width*scale)+20}px`;
    canvas.parentElement.style.marginInline='auto';
    dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function stopDrag() {
    const pointer=drag?.pointer;drag=null;drops=null;
    if(pointer!==undefined&&canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);
    canvas.style.cursor='grab';
  }
  function loadLevel(next) {
    stopDrag();index=Math.max(0,Math.min(LEVELS.length-1,next));
    state=new E.State(LEVELS[index]);
    width=state.level.cols*CELL+PAD*2;height=state.level.rows*CELL+PAD*2;
    visual.clear();paths.clear();appear.clear();tankLayers.clear();
    for(const b of state.blocks)visual.set(b.id,{x:b.x,y:b.y});
    particles=[];effects=[];motion=null;started=false;status='playing';
    remaining=settings.timerSeconds;sandClock=0;hudClock=0;last=0;
    $('result').hidden=true;$('levelNumber').textContent=`УРОВЕНЬ ${String(index+1).padStart(2,'0')} / ${LEVELS.length}`;
    $('levelTitle').textContent=state.level.title;$('hint').textContent=state.level.hint;
    $('previous').disabled=index===0;$('next').disabled=index===LEVELS.length-1;$('levelSelect').value=index;
    boardSize();updateHUD();updateCounts();draw();
  }
  function pointerPosition(e) {
    const r=canvas.getBoundingClientRect();
    return {x:((e.clientX-r.left)*width/r.width-PAD)/CELL,y:((e.clientY-r.top)*height/r.height-PAD)/CELL};
  }
  function targetPosition(d,p) {return {x:Math.round(p.x-d.offsetX),y:Math.round(p.y-d.offsetY)};}
  function tryStep(b,target) {
    if(b.removed||motion)return false;
    const dx=target.x-b.x,dy=target.y-b.y;
    if(!dx&&!dy)return false;
    const axes=Math.abs(dx)>=Math.abs(dy)?[[Math.sign(dx),0],[0,Math.sign(dy)]]:[[0,Math.sign(dy)],[Math.sign(dx),0]];
    for(const [sx,sy] of axes) {
      if(!sx&&!sy)continue;
      const from={x:b.x,y:b.y};
      if(state.move(b,sx,sy)){motion={block:b,from,to:{x:b.x,y:b.y},elapsed:0};return true;}
    }
    return false;
  }
  canvas.addEventListener('pointerdown',e=>{
    if(status!=='playing'||drag||motion||drops||(e.pointerType==='mouse'&&e.button!==0))return;
    const p=pointerPosition(e),x=Math.floor(p.x),y=Math.floor(p.y);
    const b=state.activeBlocks().find(b=>E.cells(b).some(([bx,by])=>bx===x&&by===y));
    if(!b)return;
    e.preventDefault();started=true;
    drag={block:b,pointer:e.pointerId,offsetX:p.x-b.x,offsetY:p.y-b.y,target:{x:b.x,y:b.y}};
    canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';
  });
  canvas.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.pointer)return;
    e.preventDefault();drag.target=targetPosition(drag,pointerPosition(e));
    tryStep(drag.block,drag.target);
  });
  canvas.addEventListener('pointerup',e=>{
    if(!drag||e.pointerId!==drag.pointer)return;
    // Finish a fast gesture by checked orthogonal steps toward the release point.
    // No automatic detours: an obstructed drop stops at the last legal cell.
    const pending={block:drag.block,target:targetPosition(drag,pointerPosition(e))};
    stopDrag();drops=pending;
  });
  for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{
    if(drag?.pointer===e.pointerId)stopDrag();
  });
  window.addEventListener('blur',()=>{stopDrag();});
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden)stopDrag();});
  window.addEventListener('resize',boardSize);

  function drainEvents() {
    for(const e of state.events) {
      if(e.type==='grain'&&particles.length<160)particles.push({...e,age:0});
      if(e.type==='filled') {
        effects.push({type:'filled',block:e.block,x:e.block.x,y:e.block.y,age:0,duration:.32});
        if(drag?.block===e.block)stopDrag();
        if(drops?.block===e.block)drops=null;
      }
      if(e.type==='revealed') {
        effects.push({type:'ring',tank:e.tank,age:0,duration:.55});
        for(const b of e.tank.hidden)appear.set(b.id,0);
      }
    }
    state.events.length=0;
  }
  function finish(kind) {
    status=kind;stopDrag();drops=null;
    $('result').hidden=false;
    const won=kind==='won';
    $('resultIcon').textContent=won?'✦':'◷';
    $('resultEyebrow').textContent=won?'ПУТЬ ОТКРЫТ':'ВРЕМЯ ИСТЕКЛО';
    $('resultTitle').textContent=won?'Уровень пройден':'Ещё одна попытка?';
    $('resultText').textContent=won?`Весь песок собран. Все ${state.tanks.length} контейнера раскрыты.`:'Попробуйте другой маршрут или отключите таймер в Debug Menu.';
    $('resultNext').hidden=!won||index===LEVELS.length-1;
    $('resultRestart').textContent=won&&index===LEVELS.length-1?'Пройти заново':'Попробовать ещё раз';
    updateHUD();if(settings.particleCounts)updateCounts();
  }
  function update(dt) {
    time+=dt;
    for(const [id,age] of appear) {if(age>=.35)appear.delete(id);else appear.set(id,age+dt);}
    particles=particles.filter(p=>(p.age+=dt)<.23);
    effects=effects.filter(e=>(e.age+=dt)<e.duration);
    if(status!=='playing')return;
    if(motion) {
      motion.elapsed+=dt;
      const p=Math.min(1,motion.elapsed/STEP),ease=p*p*(3-2*p);
      visual.set(motion.block.id,{x:motion.from.x+(motion.to.x-motion.from.x)*ease,y:motion.from.y+(motion.to.y-motion.from.y)*ease});
      if(p===1)motion=null;
    }
    if(!motion) {
      if(drag)tryStep(drag.block,drag.target);
      else if(drops&&!tryStep(drops.block,drops.target))drops=null;
    }
    sandClock+=dt*60*settings.simulation;
    let steps=0;
    while(sandClock>=1&&steps<6){state.simulateAll();sandClock--;steps++;}
    sandClock=Math.min(sandClock,6);
    if(started) {
      for(const b of state.activeBlocks()) {
        // Use actual settled cells for collection; no remote collection during a slide.
        if(motion?.block===b){b.credit=0;continue;}
        state.collect(b,dt,settings);
      }
      state.advanceGates(dt);drainEvents();
      // Winning on this frame takes precedence over the clock reaching zero.
      if(state.won)finish('won');
      else if(settings.timerOn){remaining=Math.max(0,remaining-dt);if(remaining===0)finish('lost');}
    }
    hudClock+=dt;
    if(hudClock>.15){hudClock=0;updateHUD();if(settings.particleCounts)updateCounts();}
  }
  function updateHUD() {
    const percent=Math.floor(state.collected/state.total*100);
    $('progressFill').style.width=percent+'%';$('progressLabel').textContent=percent+'%';$('sandProgress').textContent=percent+'%';
    $('gateProgress').textContent=`${state.tanks.filter(t=>t.state==='gone').length} / ${state.tanks.length}`;
    const seconds=Math.ceil(remaining);
    $('timer').textContent=settings.timerOn?`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`:'∞';
    $('timer').classList.toggle('warning',settings.timerOn&&remaining<=30);
    $('timer').title=started?'':'Таймер начнётся с первого перетаскивания';
  }
  function updateCounts() {
    const c=state.counts();let html='<table><thead><tr><th>Цвет</th><th>Песок</th><th>Доступно</th><th>Скрыто</th><th>Поглощено</th></tr></thead><tbody>';
    for(let color=1;color<COLORS.length;color++)if(state.initial[color]) {
      const p=COLORS[color];
      html+=`<tr><td><i style="background:${p.hex}"></i>${p.name}</td><td>${c.sand[color]}</td><td>${c.available[color]}</td><td>${c.hidden[color]}</td><td>${c.absorbed[color]}</td></tr>`;
    }
    const balanced=c.sand.every((n,i)=>n===c.available[i]+c.hidden[i]&&n+c.absorbed[i]===state.initial[i]);
    $('counts').innerHTML=html+`</tbody></table><p class="balance-note">${balanced?'✓ Баланс сохранён':'⚠ Ошибка баланса'} · Песок = доступно + скрыто</p>`;
  }

  // Build one rounded outer silhouette, so polyominoes look and move as rigid bodies.
  function blockPath(b) {
    if(paths.has(b.id))return paths.get(b.id);
    const occupied=new Set(b.cells.map(([x,y])=>`${x},${y}`)),edges=new Map();
    const edge=(x,y,xx,yy)=>edges.set(`${x},${y}`,[xx,yy]);
    for(const [x,y] of b.cells) {
      if(!occupied.has(`${x},${y-1}`))edge(x,y,x+1,y);
      if(!occupied.has(`${x+1},${y}`))edge(x+1,y,x+1,y+1);
      if(!occupied.has(`${x},${y+1}`))edge(x+1,y+1,x,y+1);
      if(!occupied.has(`${x-1},${y}`))edge(x,y+1,x,y);
    }
    const first=[...edges.keys()][0].split(',').map(Number),vertices=[first];let next=edges.get(first.join(','));
    while(next&&next.join(',')!==first.join(',')&&vertices.length<=edges.size){vertices.push(next);next=edges.get(next.join(','));}
    const path=new Path2D(),n=vertices.length,r=.14;
    const toward=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]);return [(a[0]+(b[0]-a[0])*r/d)*CELL,(a[1]+(b[1]-a[1])*r/d)*CELL];};
    vertices.forEach((v,i)=>{
      const before=toward(v,vertices[(i+n-1)%n]),after=toward(v,vertices[(i+1)%n]);
      if(i===0)path.moveTo(...before);else path.lineTo(...before);
      path.quadraticCurveTo(v[0]*CELL,v[1]*CELL,...after);
    });path.closePath();paths.set(b.id,path);return path;
  }
  function round(x,y,w,h,r,fill,stroke) {
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);
    if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
  }
  function drawBlock(b,x,y,{alpha=1,scale=1,label=true,ghost=false,selected=false}={}) {
    const p=COLORS[b.color],bw=(Math.max(...b.cells.map(c=>c[0]))+1)*CELL,bh=(Math.max(...b.cells.map(c=>c[1]))+1)*CELL;
    ctx.save();ctx.globalAlpha=alpha;ctx.translate(PAD+x*CELL+bw/2,PAD+y*CELL+bh/2);
    ctx.scale(scale*(bw-5)/bw,scale*(bh-5)/bh);ctx.translate(-bw/2,-bh/2);
    const path=blockPath(b);
    if(!ghost){ctx.shadowColor=p.dark+'65';ctx.shadowBlur=selected?10:2;ctx.shadowOffsetY=4;}
    const gradient=ctx.createLinearGradient(0,0,0,bh);gradient.addColorStop(0,p.light);gradient.addColorStop(.28,p.hex);gradient.addColorStop(1,p.dark);
    ctx.fillStyle=ghost?p.hex:gradient;ctx.fill(path);ctx.shadowColor='transparent';
    ctx.lineWidth=2;ctx.strokeStyle=ghost?'#fff':p.dark;ctx.stroke(path);
    if(ghost){ctx.setLineDash([4,3]);ctx.strokeStyle='#fff';ctx.stroke(path);}
    else {
      ctx.save();ctx.clip(path);ctx.fillStyle='#ffffff22';ctx.fillRect(0,0,bw,5);
      const filledHeight=bh*b.filled/b.capacity;ctx.fillStyle='#ffffff2c';ctx.fillRect(0,bh-filledHeight,bw,filledHeight);
      ctx.restore();
      if(selected){ctx.lineWidth=3;ctx.strokeStyle='#fff7df';ctx.stroke(path);}
    }
    if(label) {
      // Label stays inside a real shape cell (including L and T shapes).
      const [lx,ly]=b.cells.find(([cx,cy])=>cx===Math.floor(bw/CELL/2)&&cy===0)||b.cells[0];
      const percent=b.removed?100:Math.min(99,Math.floor(b.filled/b.capacity*100));
      ctx.fillStyle='#ffffff';ctx.font='800 15px "Segoe UI",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.shadowColor='#31434766';ctx.shadowBlur=2;ctx.shadowOffsetY=1;ctx.fillText(percent+'%',(lx+.5)*CELL,(ly+.5)*CELL);
      ctx.shadowColor='transparent';
    }
    ctx.restore();
  }
  function tankLayer(t) {
    let layer=tankLayers.get(t.id);
    if(!layer) {
      const c=document.createElement('canvas');c.width=t.width;c.height=t.height;
      layer={canvas:c,context:c.getContext('2d'),revision:-1};layer.image=layer.context.createImageData(t.width,t.height);tankLayers.set(t.id,layer);
    }
    if(layer.revision!==t.revision) {
      const pixels=layer.image.data;
      for(let at=0;at<t.data.length;at++) {
        const color=t.data[at],offset=at*4;
        if(!color){pixels[offset+3]=0;continue;}
        const hex=COLORS[color].hex,n=parseInt(hex.slice(1),16),shade=((at*17+Math.floor(at/t.width)*13)%5-2)*7;
        pixels[offset]=Math.max(0,Math.min(255,(n>>16)+shade));pixels[offset+1]=Math.max(0,Math.min(255,((n>>8)&255)+shade));pixels[offset+2]=Math.max(0,Math.min(255,(n&255)+shade));pixels[offset+3]=255;
      }
      layer.context.putImageData(layer.image,0,0);layer.revision=t.revision;
    }
    return layer.canvas;
  }
  function drawTank(t) {
    if(t.state==='gone')return;
    const x=PAD+t.x*CELL+2,y=PAD+t.y*CELL+2,w=t.w*CELL-4,h=t.h*CELL-4;
    ctx.save();
    if(t.state==='opening') {
      const p=t.openTime/.3;ctx.globalAlpha=1-p;ctx.translate(x+w/2,y+h/2);ctx.scale(1-p*.08,1-p*.08);ctx.translate(-x-w/2,-y-h/2);
    }
    ctx.shadowColor='#58694b20';ctx.shadowBlur=4;ctx.shadowOffsetY=3;
    round(x,y,w,h,8,'#fbf5dd','#b9b49a');ctx.shadowColor='transparent';
    ctx.save();ctx.beginPath();ctx.roundRect(x+4,y+4,w-8,h-8,5);ctx.clip();ctx.imageSmoothingEnabled=false;
    ctx.drawImage(tankLayer(t),x+4,y+4,w-8,h-8);
    const gloss=ctx.createLinearGradient(x,y,x+w,y+h);gloss.addColorStop(0,'#ffffff25');gloss.addColorStop(.5,'#ffffff00');gloss.addColorStop(1,'#73552618');ctx.fillStyle=gloss;ctx.fillRect(x,y,w,h);ctx.restore();
    ctx.lineWidth=2;round(x+2,y+2,w-4,h-4,6,null,'#fff9e5b0');
    // Tiny corner rivets describe the removable shell, not an abstract color door.
    ctx.fillStyle='#a8a58b';for(const [px,py] of [[x+4,y+4],[x+w-4,y+h-4]]){ctx.beginPath();ctx.arc(px,py,1.3,0,TAU);ctx.fill();}
    ctx.font='800 9px "Segoe UI",sans-serif';ctx.textBaseline='middle';ctx.textAlign='center';
    round(x+7,y+7,17,16,5,'#fffbeddf');ctx.fillStyle='#72745a';ctx.fillText(t.id,x+15.5,y+15);
    if(t.hidden.length) {
      round(x+w-25,y+6,20,20,7,'#314e52');ctx.fillStyle='#fff8d7';ctx.font='800 12px "Segoe UI",sans-serif';ctx.fillText(t.hidden.length,x+w-15,y+16);
    }
    ctx.restore();
  }
  function draw() {
    ctx.clearRect(0,0,width,height);
    round(0,0,width,height,15,'#e8eee7');
    for(let y=0;y<state.level.rows;y++)for(let x=0;x<state.level.cols;x++) {
      if(!E.boardCell(state.level,x,y))continue;
      round(PAD+x*CELL+2,PAD+y*CELL+2,CELL-4,CELL-4,7,(x+y)%2?'#e0e8de':'#e3eae0');
      if(settings.grid){ctx.lineWidth=.8;round(PAD+x*CELL,PAD+y*CELL,CELL,CELL,0,null,'#93a89470');}
    }
    for(const [x,y] of state.level.walls) {
      round(PAD+x*CELL+2,PAD+y*CELL+5,CELL-4,CELL-5,8,'#a4b4a7');
      const g=ctx.createLinearGradient(0,PAD+y*CELL,0,PAD+(y+1)*CELL);g.addColorStop(0,'#c2cdbf');g.addColorStop(1,'#aebdaf');
      round(PAD+x*CELL+2,PAD+y*CELL+2,CELL-4,CELL-7,8,g);ctx.fillStyle='#91a28e';
      for(let d=0;d<3;d++){ctx.beginPath();ctx.arc(PAD+x*CELL+16+d*8,PAD+y*CELL+23,1.5,0,TAU);ctx.fill();}
    }
    for(const t of state.tanks)drawTank(t);
    if(settings.hiddenBlocks)for(const t of state.tanks)if(t.state!=='gone')for(const b of t.hidden)drawBlock(b,b.x,b.y,{alpha:.38,ghost:true,label:false});
    if(settings.areas)for(const b of state.activeBlocks())for(const c of state.contacts(b)) {
      ctx.save();ctx.beginPath();ctx.rect(PAD+c.t.x*CELL,PAD+c.t.y*CELL,c.t.w*CELL,c.t.h*CELL);ctx.clip();
      ctx.fillStyle=COLORS[b.color].hex+'28';ctx.strokeStyle=COLORS[b.color].dark+'90';ctx.lineWidth=1;ctx.setLineDash([4,3]);ctx.beginPath();ctx.arc(PAD+c.x*CELL,PAD+c.y*CELL,settings.radius*CELL,0,TAU);ctx.fill();ctx.stroke();ctx.restore();
    }
    for(const b of state.activeBlocks()) {
      const p=visual.get(b.id),age=appear.get(b.id),f=age===undefined?1:Math.min(1,age/.3);
      drawBlock(b,p.x,p.y,{alpha:f,scale:.7+.3*Math.sin(f*Math.PI/2),selected:drag?.block===b});
    }
    for(const e of effects) {
      const p=e.age/e.duration;
      if(e.type==='filled')drawBlock(e.block,e.x,e.y,{alpha:1-p,scale:1+p*.18});
      if(e.type==='ring') {
        const t=e.tank;ctx.save();ctx.globalAlpha=(1-p)*.7;ctx.lineWidth=3*(1-p);
        round(PAD+t.x*CELL-4*p,PAD+t.y*CELL-4*p,t.w*CELL+8*p,t.h*CELL+8*p,10,null,'#fff7ce');ctx.restore();
      }
    }
    for(const p of particles) {
      const f=p.age/.23,e=1-(1-f)**2,x=p.x+(p.toX-p.x)*e,y=p.y+(p.toY-p.y)*e;
      ctx.globalAlpha=1-f;ctx.fillStyle=COLORS[p.color].light;ctx.beginPath();ctx.arc(PAD+x*CELL,PAD+y*CELL,2.4*(1-f*.4),0,TAU);ctx.fill();
    }
    ctx.globalAlpha=1;
    if(!started&&time%3<2.2) {
      const b=state.activeBlocks()[0];if(b){const [x,y]=E.cells(b)[0];ctx.save();ctx.strokeStyle='#ffffffa0';ctx.lineWidth=2;ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(PAD+(x+.5)*CELL,PAD+(y+.5)*CELL,20+Math.sin(time*3)*2,0,TAU);ctx.stroke();ctx.restore();}
    }
  }
  function frame(now) {
    const dt=last?Math.min((now-last)/1000,.06):0;last=now;
    if(!document.hidden){update(dt);draw();}
    requestAnimationFrame(frame);
  }
  for(let i=0;i<LEVELS.length;i++){const o=document.createElement('option');o.value=i;o.textContent=`${i+1} · ${LEVELS[i].title}`;$('levelSelect').append(o);}
  $('restart').onclick=$('debugRestart').onclick=$('resultRestart').onclick=()=>loadLevel(index);
  $('previous').onclick=()=>loadLevel(index-1);$('next').onclick=$('resultNext').onclick=()=>loadLevel(index+1);
  $('levelSelect').onchange=e=>loadLevel(Number(e.target.value));
  $('debugToggle').onclick=()=>{const open=$('debug').hidden;$('debug').hidden=!open;$('debugToggle').setAttribute('aria-expanded',String(open));if(open)updateCounts();};
  for(const name of ['radius','speed','simulation'])$(name).oninput=e=>{
    settings[name]=Number(e.target.value);$(name+'Value').textContent=settings[name]+(name==='speed'?' / s':name==='simulation'?'×':'');
  };
  for(const name of ['grid','areas','hiddenBlocks','particleCounts','timerOn'])$(name).onchange=e=>{
    settings[name]=e.target.checked;
    if(name==='particleCounts'){$('counts').hidden=!settings.particleCounts;updateCounts();}updateHUD();
  };
  $('timerSeconds').onchange=e=>{
    const parsed=Number(e.target.value);settings.timerSeconds=Number.isFinite(parsed)?Math.max(10,Math.min(3600,Math.round(parsed))):240;
    e.target.value=settings.timerSeconds;remaining=settings.timerSeconds;updateHUD();
  };
  // Read-only snapshots for inspection, without providing an alternate way to play.
  window.SandGates={get snapshot(){return {level:index+1,status,started,remaining,settings:{...settings},counts:state.counts(),blocks:state.blocks.map(b=>({id:b.id,x:b.x,y:b.y,active:b.active,removed:b.removed,filled:b.filled,capacity:b.capacity})),containers:state.tanks.map(t=>({id:t.id,state:t.state,particles:t.remaining}))};}};
  try{loadLevel(0);requestAnimationFrame(frame);}catch(error){$('hint').textContent='Ошибка конфигурации: '+error.message;console.error(error);}
})();
