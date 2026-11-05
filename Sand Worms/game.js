/* Sand Worms: buildless Canvas prototype. No dependencies or external assets. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('game'), ctx = canvas.getContext('2d');
  const COLORS = window.SAND_COLORS, LEVELS = window.SAND_LEVELS;
  const CELL = 40, PAD = 16, GRAINS = 8, STEP = .085;
  let COLS = 4, ROWS = 7, WIDTH = 192, HEIGHT = 312, footprint = null;
  const settings = {radius:1.2, speed:300, simulation:1, areas:false, grid:false};
  const directions = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
  const key = p => p.x + ',' + p.y;
  const same = (a,b) => a.x === b.x && a.y === b.y;
  const copy = cells => cells.map(p=>({...p}));
  const center = p => ({x:PAD+(p.x+.5)*CELL,y:PAD+(p.y+.5)*CELL});
  let levelIndex = 0, tanks = [], worms = [], walls = new Set(), drag = null;
  let effects = [], sparks = [], initial = [], collected = 0, total = 0;
  let won = false, sandClock = 0, time = 0, lastTime = 0, countsClock = 0, tick = 0;

  function boardCell(p) {
    return p.x>=0 && p.y>=0 && p.x<COLS && p.y<ROWS && (!footprint || footprint[p.y]?.[p.x]==='#');
  }

  // Cell masks describe the actual volume: movement, physics and contact use it alike.
  function tankCell(t,x,y) {
    const lx=x-t.x,ly=y-t.y;
    return lx>=0 && ly>=0 && lx<t.w && ly<t.h && (!t.shape || t.shape[ly]?.[lx]==='#');
  }

  // Artwork is the initial color of real grains, with no empty/decorative pixels.
  function sandColor(spec,u,v) {
    const palette=spec.colors,n=palette.length;
    let band=v,index;
    if(spec.art==='columns') band=u;
    if(spec.art==='diagonal') band=Math.max(0,Math.min(.999,v+.35*(u-.5)));
    index=Math.min(n-1,Math.floor(band*n));
    const x=u-.5,y=v-.46,r=Math.hypot(x,y),a=Math.atan2(y,x);
    if(spec.art==='heart') {
      const hx=x*2.7,hy=(.48-v)*2.8;
      const inside=(hx*hx+hy*hy-.55)**3-hx*hx*hy*hy*hy<0;
      index=inside?0:(n>2 && v>.77?2:Math.min(1,n-1));
    } else if(spec.art==='flower') {
      index=n-1;
      if(n>3 && Math.abs(x)<.035 && v>.45) index=2;
      if(r<.23+.07*Math.cos(a*6)) index=Math.min(1,n-1);
      if(n>3 && ((Math.abs(x)<.035 && v>.67) || ((x+.13)/.11)**2+((v-.71)/.045)**2<1)) index=2;
      if(r<.085) index=0;
    } else if(spec.art==='star') {
      const edge=.22+.085*Math.cos(a*5-Math.PI*.5);
      index=r<edge?0:(n>2 && v>.8?2:Math.min(1,n-1));
    } else if(spec.art==='diamond') {
      const d=Math.abs(x)+Math.abs(y)*.85;
      index=d<.23?0:d<.37?Math.min(1,n-1):n-1;
    } else if(spec.art==='rings') index=Math.floor(r*9)%n;
    else if(spec.art==='chevrons') index=Math.floor(v*n*1.6+Math.abs(x)*4)%n;
    else if(spec.art==='mosaic') index=(Math.floor(u*6)+Math.floor(v*4))%n;
    else if(spec.art==='waves') index=Math.floor(Math.max(0,v+.09*Math.sin(u*Math.PI*3))*n*2)%n;
    else if(spec.art==='butterfly') {
      const wing=((Math.abs(x)-.19)/.21)**2+((y+.03)/.29)**2<1;
      index=n-1;
      if(wing) index=x<0?Math.min(1,n-1):Math.min(2,n-1);
      if(Math.abs(x)<.035 && Math.abs(y)<.30) index=0;
    }
    return palette[index];
  }

  function makeTank(spec) {
    const t = {...spec, width:spec.w*GRAINS, height:spec.h*GRAINS};
    t.data = new Uint8Array(t.width*t.height);
    t.mask = new Uint8Array(t.data.length);
    t.cells=[];
    for(let y=t.y;y<t.y+t.h;y++) for(let x=t.x;x<t.x+t.w;x++) if(tankCell(t,x,y)) t.cells.push({x,y});
    t.layer = document.createElement('canvas');
    t.layer.width = t.width; t.layer.height = t.height;
    t.context = t.layer.getContext('2d');
    t.pixels = t.context.createImageData(t.width,t.height);
    t.dirty = true;
    for (let y=0;y<t.height;y++) for (let x=0;x<t.width;x++) {
      const u=(x+.5)/t.width, v=(y+.5)/t.height;
      const at=y*t.width+x;
      if(!tankCell(t,t.x+Math.floor(x/GRAINS),t.y+Math.floor(y/GRAINS))) continue;
      t.mask[at]=1;
      const c=sandColor(spec,u,v);
      t.data[y*t.width+x]=c;
      if(c) initial[c]=(initial[c]||0)+1;
    }
    return t;
  }

  function endDrag() {
    if(drag && canvas.hasPointerCapture(drag.pointer)) canvas.releasePointerCapture(drag.pointer);
    drag=null;
    canvas.style.cursor='grab';
  }

  function loadLevel(index) {
    endDrag();
    levelIndex=Math.max(0,Math.min(LEVELS.length-1,index));
    const level=LEVELS[levelIndex];
    COLS=level.cols;ROWS=level.rows;footprint=level.footprint || null;
    WIDTH=COLS*CELL+PAD*2;HEIGHT=ROWS*CELL+PAD*2;
    canvas.width=WIDTH;canvas.height=HEIGHT;
    canvas.parentElement.style.setProperty('--board-ratio',WIDTH/HEIGHT);
    canvas.parentElement.style.setProperty('--board-min',WIDTH+'px');
    initial=Array(COLORS.length).fill(0);
    tanks=level.tanks.map(makeTank);
    walls=new Set(level.walls.map(([x,y])=>key({x,y})));
    worms=level.worms.map((w,id)=>({...w,id,cells:copy(w.cells),previous:copy(w.cells),move:1,filled:0,credit:0,contacts:[]}));
    for(let c=1;c<COLORS.length;c++) {
      const group=worms.filter(w=>w.color===c), n=initial[c];
      if(n && !group.length) throw new Error('Missing worm for color '+c);
      group.forEach((w,i)=>{w.capacity=Math.floor(n/group.length)+(i<n%group.length?1:0);});
    }
    // Fail early on an invalid edited board rather than hiding overlapping bodies.
    const occupied=new Set(walls);
    for(const [x,y] of level.walls) if(!boardCell({x,y})) throw new Error('Invalid wall: '+level.title);
    for(const t of tanks) for(const p of t.cells) {
      if(!boardCell(p) || occupied.has(key(p))) throw new Error('Invalid tank: '+level.title);
      occupied.add(key(p));
    }
    for(const w of worms) w.cells.forEach((p,i)=>{
      if(!boardCell(p) || occupied.has(key(p)) || !w.capacity || (i && Math.abs(p.x-w.cells[i-1].x)+Math.abs(p.y-w.cells[i-1].y)!==1)) throw new Error('Invalid board: '+level.title);
      occupied.add(key(p));
    });
    total=initial.reduce((a,b)=>a+b,0);collected=0;won=false;
    effects=[];sparks=[];sandClock=0;countsClock=0;
    $('victory').hidden=true;
    $('levelNumber').textContent='УРОВЕНЬ '+String(levelIndex+1).padStart(2,'0')+' / '+LEVELS.length;
    $('levelTitle').textContent=level.title;
    $('hint').textContent=level.hint;
    $('previous').disabled=levelIndex===0;
    $('next').disabled=levelIndex===LEVELS.length-1;
    updateCounts(); updateProgress();
  }

  function inTank(p) {return tanks.some(t=>tankCell(t,p.x,p.y));}
  function canStep(w,next,end) {
    if(!boardCell(next) || walls.has(key(next)) || inTank(next)) return false;
    for(const other of worms) for(let i=0;i<other.cells.length;i++) {
      // The opposite end vacates its cell in this same step.
      if(other===w && i===(end===0 ? w.cells.length-1 : 0)) continue;
      if(same(other.cells[i],next)) return false;
    }
    return true;
  }

  function moveDrag() {
    if(!drag || drag.cooldown>0) return;
    const w=drag.worm,end=drag.end===0 ? 0 : w.cells.length-1,p=w.cells[end];
    const dx=drag.target.x-(p.x+.5),dy=drag.target.y-(p.y+.5);
    if(Math.max(Math.abs(dx),Math.abs(dy))<.52) return;
    const options=directions.map(d=>({x:p.x+d.x,y:p.y+d.y}))
      .filter(n=>Math.hypot(drag.target.x-n.x-.5,drag.target.y-n.y-.5)<Math.hypot(dx,dy)-.06)
      .sort((a,b)=>Math.hypot(drag.target.x-a.x-.5,drag.target.y-a.y-.5)-Math.hypot(drag.target.x-b.x-.5,drag.target.y-b.y-.5));
    const previous=drag.history[drag.history.length-1];
    for(const next of options) {
      let nextCells;
      if(previous && same(next,previous[end])) {
        nextCells=drag.history.pop(); // Undo whole-body steps during the same gesture.
      } else {
        if(!canStep(w,next,drag.end)) continue;
        drag.history.push(copy(w.cells));
        nextCells=drag.end===0 ? [next,...w.cells.slice(0,-1)] : [...w.cells.slice(1),next];
      }
      w.previous=copy(w.cells);w.cells=nextCells;w.move=0;
      drag.cooldown=STEP;
      return;
    }
  }

  function pointerPosition(event) {
    const r=canvas.getBoundingClientRect();
    return {x:((event.clientX-r.left)*WIDTH/r.width-PAD)/CELL,y:((event.clientY-r.top)*HEIGHT/r.height-PAD)/CELL};
  }
  canvas.addEventListener('pointerdown',event=>{
    if(window.GameEntry?.current?.isOpen() || drag || won || (event.pointerType==='mouse' && event.button!==0)) return;
    const p=pointerPosition(event);
    let best=null,distance=.68;
    for(const w of worms) for(const end of [0,w.cells.length-1]) {
      const q=w.cells[end],d=Math.hypot(p.x-q.x-.5,p.y-q.y-.5);
      if(d<distance) {distance=d;best={worm:w,end:end===0?0:1};}
    }
    if(!best) return;
    event.preventDefault();
    drag={...best,target:p,pointer:event.pointerId,cooldown:0,history:[]};
    canvas.setPointerCapture(event.pointerId);canvas.style.cursor='grabbing';
  });
  canvas.addEventListener('pointermove',event=>{
    if(drag && event.pointerId===drag.pointer) {event.preventDefault();drag.target=pointerPosition(event);}
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(type,event=>{
    if(drag && event.pointerId===drag.pointer) endDrag();
  });
  window.addEventListener('blur',endDrag);
  document.addEventListener('visibilitychange',()=>{lastTime=0;if(document.hidden) endDrag();});

  function simulate(t) {
    const d=t.data,w=t.width,h=t.height;
    const reverse=(tick&1)===0;
    for(let y=h-2;y>=0;y--) for(let i=0;i<w;i++) {
      const x=reverse ? w-1-i : i,at=y*w+x;
      if(!d[at]) continue;
      let to=at+w;
      if(!t.mask[to] || d[to]) {
        const side=Math.random()<.5 ? -1 : 1;
        if(x+side>=0 && x+side<w && t.mask[at+side] && t.mask[to+side] && !d[to+side]) to+=side;
        else if(x-side>=0 && x-side<w && t.mask[at-side] && t.mask[to-side] && !d[to-side]) to-=side;
        else continue;
      }
      d[to]=d[at];d[at]=0;t.dirty=true;
    }
  }

  function getContacts(w) {
    const contacts=[];
    for(const p of w.cells) for(const t of tanks) for(const d of directions) {
      const q={x:p.x+d.x,y:p.y+d.y};
      if(!tankCell(t,q.x,q.y)) continue;
      const side=d.y===-1?'bottom':d.y===1?'top':d.x===1?'left':'right';
      contacts.push({t,p,side,wall:{x:p.x+.5+d.x*.5,y:p.y+.5+d.y*.5}});
    }
    return contacts;
  }

  function collect(w,dt) {
    w.contacts=getContacts(w);
    if(!w.contacts.length) {w.credit=0;return;}
    // One rate per worm, regardless of contact count. No banked burst after waiting.
    w.credit=Math.min(w.credit+settings.speed*dt,settings.speed*.12+1);
    let budget=Math.min(Math.floor(w.credit),w.capacity-w.filled);
    if(!budget) return;
    const radius=settings.radius, candidates=[];
    // Each tank cell is considered once, even when multiple segment disks overlap.
    for(const t of tanks) {
      const contacts=w.contacts.filter(c=>c.t===t);
      if(!contacts.length) continue;
      for(let y=t.height-1;y>=0;y--) for(let x=0;x<t.width;x++) {
        const at=y*t.width+x;
        if(t.data[at]!==w.color) continue;
        const gx=t.x+(x+.5)/GRAINS,gy=t.y+(y+.5)/GRAINS;
        let nearest=Infinity,contact;
        for(const c of contacts) {
          // Restrict absorption to the reservoir side of this particular face.
          if((c.side==='bottom' && gy>c.wall.y) || (c.side==='top' && gy<c.wall.y) ||
             (c.side==='left' && gx<c.wall.x) || (c.side==='right' && gx>c.wall.x)) continue;
          const dist=(gx-c.p.x-.5)**2+(gy-c.p.y-.5)**2;
          if(dist<nearest) {nearest=dist;contact=c;}
        }
        if(nearest<=radius*radius) candidates.push({t,at,x:gx,y:gy,dist:nearest,contact});
      }
    }
    candidates.sort((a,b)=>a.dist-b.dist);
    const amount=Math.min(budget,candidates.length);
    for(let i=0;i<amount;i++) {
      const c=candidates[i];c.t.data[c.at]=0;c.t.dirty=true;
      if(i%5===0 && sparks.length<150) {
        const to=center(c.contact.p);
        sparks.push({x:PAD+c.x*CELL,y:PAD+c.y*CELL,to,color:w.color,life:0,duration:.22});
      }
    }
    w.filled+=amount;collected+=amount;w.credit-=amount;
    if(amount<budget) w.credit=Math.min(w.credit,1);
    if(w.filled===w.capacity) {
      effects.push({cells:visualCells(w),color:w.color,life:0});
      if(drag?.worm===w) endDrag();
    }
  }

  function update(dt) {
    time+=dt;
    for(const w of worms) w.move=Math.min(1,w.move+dt/STEP);
    if(drag) {drag.cooldown-=dt;moveDrag();}
    sandClock+=dt*60*settings.simulation;
    // Limit catch-up after a stalled tab; never skip particles or delete them.
    let steps=0;
    while(sandClock>=1 && steps<8) {for(const t of tanks) simulate(t);sandClock--;tick++;steps++;}
    sandClock=Math.min(sandClock,8);
    if(!won) {
      for(const w of worms) collect(w,dt);
      worms=worms.filter(w=>w.filled<w.capacity);
      updateProgress();
      if(!worms.length && collected===total) {
        won=true;endDrag();
        $('continue').textContent=levelIndex===LEVELS.length-1 ? 'Пройти ещё раз ↻' : 'Следующий уровень →';
        $('winText').textContent=levelIndex===LEVELS.length-1 ? 'Все '+LEVELS.length+' уровней завершены. Спасибо за тест!' : 'Каждая песчинка нашла своего червя.';
      }
    }
    for(const e of effects) e.life+=dt;
    effects=effects.filter(e=>e.life<.5);
    if(won && !effects.length) $('victory').hidden=false;
    for(const s of sparks) s.life+=dt;
    sparks=sparks.filter(s=>s.life<s.duration);
    countsClock+=dt;
    if(countsClock>.25) {if($('debug').open) updateCounts();countsClock=0;}
  }

  function updateProgress() {
    const percent=total?Math.floor(collected/total*100):0;
    $('progressText').textContent=percent+'%';
    $('progressFill').style.width=percent+'%';
  }
  function updateCounts() {
    const remaining=Array(COLORS.length).fill(0),capacity=Array(COLORS.length).fill(0),filled=Array(COLORS.length).fill(0);
    for(const t of tanks) for(const c of t.data) if(c) remaining[c]++;
    for(const w of worms) {capacity[w.color]+=w.capacity-w.filled;filled[w.color]+=w.filled;}
    $('counts').innerHTML=COLORS.slice(1).map((c,i)=>initial[i+1]?'<div class="count-row"><span class="swatch" style="background:'+c.hex+'"></span>'+c.name+'<strong>'+remaining[i+1]+' / '+capacity[i+1]+'</strong></div>':'').join('');
    return {initial:[...initial],remaining,capacity,collected,total};
  }

  function round(x,y,w,h,r,fill,stroke) {
    ctx.beginPath();ctx.roundRect(x,y,w,h,r);
    if(fill) {ctx.fillStyle=fill;ctx.fill();}
    if(stroke) {ctx.strokeStyle=stroke;ctx.stroke();}
  }
  function path(points) {
    ctx.beginPath();points.forEach((p,i)=>{const q=center(p);if(i) ctx.lineTo(q.x,q.y);else ctx.moveTo(q.x,q.y);});
    ctx.lineCap='round';ctx.lineJoin='round';
  }
  function visualCells(w) {
    const t=w.move*w.move*(3-2*w.move);
    return w.cells.map((p,i)=>({x:w.previous[i].x+(p.x-w.previous[i].x)*t,y:w.previous[i].y+(p.y-w.previous[i].y)*t}));
  }

  function tankOutline(t,edges=false) {
    ctx.beginPath();
    for(const p of t.cells) {
      const x=PAD+p.x*CELL,y=PAD+p.y*CELL;
      if(!edges) {ctx.rect(x,y,CELL,CELL);continue;}
      // Only exposed faces: no decorative internal walls between mask cells.
      if(!tankCell(t,p.x,p.y-1)) {ctx.moveTo(x,y);ctx.lineTo(x+CELL,y);}
      if(!tankCell(t,p.x+1,p.y)) {ctx.moveTo(x+CELL,y);ctx.lineTo(x+CELL,y+CELL);}
      if(!tankCell(t,p.x,p.y+1)) {ctx.moveTo(x+CELL,y+CELL);ctx.lineTo(x,y+CELL);}
      if(!tankCell(t,p.x-1,p.y)) {ctx.moveTo(x,y+CELL);ctx.lineTo(x,y);}
    }
  }

  function drawTank(t) {
    const x=PAD+t.x*CELL,y=PAD+t.y*CELL,w=t.w*CELL,h=t.h*CELL;
    if(t.shape) {
      tankOutline(t);ctx.fillStyle='#fbf5e8';ctx.fill();
      tankOutline(t,true);ctx.lineWidth=6;ctx.lineJoin='round';ctx.strokeStyle='#d1d8c6';ctx.stroke();
    } else {
      round(x-2,y-2,w+4,h+4,9,'#d1d8c6');
      round(x,y,w,h,7,'#fbf5e8');
    }
    if(t.dirty) {
      const pixels=t.pixels.data;
      for(let i=0;i<t.data.length;i++) {
        const c=t.data[i],at=i*4;
        if(!c) {pixels[at+3]=0;continue;}
        const hex=COLORS[c].hex;
        const noise=((i*13+(i%t.width)*7)%11-5)*2;
        pixels[at]=Math.max(0,Math.min(255,parseInt(hex.slice(1,3),16)+noise));
        pixels[at+1]=Math.max(0,Math.min(255,parseInt(hex.slice(3,5),16)+noise));
        pixels[at+2]=Math.max(0,Math.min(255,parseInt(hex.slice(5,7),16)+noise));pixels[at+3]=255;
      }
      t.context.putImageData(t.pixels,0,0);t.dirty=false;
    }
    ctx.save();
    if(t.shape) tankOutline(t);
    else {ctx.beginPath();ctx.roundRect(x+2,y+2,w-4,h-4,5);}
    ctx.clip();
    ctx.imageSmoothingEnabled=false;ctx.drawImage(t.layer,x,y,w,h);
    if(settings.areas) {
      for(const worm of worms) for(const c of worm.contacts) if(c.t===t) {
        const p=center(c.p);ctx.beginPath();ctx.arc(p.x,p.y,settings.radius*CELL,0,Math.PI*2);
        ctx.fillStyle=COLORS[worm.color].hex+'50';ctx.fill();ctx.strokeStyle=COLORS[worm.color].dark;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
      }
    }
    ctx.restore();
    // Every reservoir face is a permeable collection wall, but blocks worm movement.
    ctx.lineWidth=3;
    if(t.shape) {tankOutline(t,true);ctx.strokeStyle='#eff3dc';ctx.stroke();}
    else round(x+1,y+1,w-2,h-2,7,null,'#eff3dc');
  }

  function drawWorm(w) {
    const cells=visualCells(w),color=COLORS[w.color],active=drag?.worm===w;
    ctx.save();
    ctx.translate(0,3);path(cells);ctx.lineWidth=33;ctx.strokeStyle='#4b59331b';ctx.stroke();ctx.translate(0,-3);
    path(cells);ctx.lineWidth=33;ctx.strokeStyle=color.dark;ctx.stroke();
    ctx.lineWidth=28;ctx.strokeStyle=color.hex;ctx.stroke();
    // Filling dots live on the body, alongside a readable percentage label.
    const ratio=w.filled/w.capacity;
    for(let i=0;i<cells.length;i++) {
      const p=center(cells[i]);
      ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);ctx.fillStyle=i/(cells.length-1)<=ratio && ratio>0 ? '#fff6cb90' : '#ffffff13';ctx.fill();
    }
    const head=center(cells[0]),neck=center(cells[1]);
    const angle=Math.atan2(head.y-neck.y,head.x-neck.x);
    ctx.save();ctx.translate(head.x,head.y);ctx.rotate(angle);
    for(const ey of [-5.5,5.5]) {
      ctx.beginPath();ctx.arc(5,ey,4,0,Math.PI*2);ctx.fillStyle='#fffdf1';ctx.fill();
      ctx.beginPath();ctx.arc(6.3,ey,1.9,0,Math.PI*2);ctx.fillStyle='#34443a';ctx.fill();
    }
    ctx.restore();
    const tail=center(cells[cells.length-1]);
    for(const offset of [-3,3]) {ctx.beginPath();ctx.arc(tail.x+offset,tail.y,1.8,0,Math.PI*2);ctx.fillStyle='#fff8dfb0';ctx.fill();}
    if(active) {
      const p=drag.end===0?head:tail;
      ctx.beginPath();ctx.arc(p.x,p.y,20,0,Math.PI*2);ctx.lineWidth=2;ctx.strokeStyle=color.dark;ctx.setLineDash([3,4]);ctx.stroke();ctx.setLineDash([]);
    }
    const label=center(cells[Math.floor(cells.length/2)]),percent=Math.min(99,Math.floor(ratio*100));
    round(label.x-18,label.y-10,36,20,8,'#fffcf2ed');
    ctx.fillStyle=color.dark;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='800 11px "Segoe UI",sans-serif';ctx.fillText(percent+'%',label.x,label.y+.5);ctx.textBaseline='alphabetic';
    for(const c of w.contacts) {
      const x=PAD+c.wall.x*CELL,y=PAD+c.wall.y*CELL;
      ctx.beginPath();ctx.arc(x,y,4+Math.sin(time*8)*.8,0,Math.PI*2);ctx.fillStyle=color.hex;ctx.fill();
    }
    ctx.restore();
  }

  function render() {
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    round(0,0,WIDTH,HEIGHT,22,'#e8eddd');
    if(footprint) {
      ctx.beginPath();
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(boardCell({x,y})) ctx.rect(PAD+x*CELL,PAD+y*CELL,CELL,CELL);
      ctx.fillStyle='#f2f2e6';ctx.fill();
      ctx.beginPath();
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(boardCell({x,y})) {
        const px=PAD+x*CELL,py=PAD+y*CELL;
        if(!boardCell({x,y:y-1})) {ctx.moveTo(px,py);ctx.lineTo(px+CELL,py);}
        if(!boardCell({x:x+1,y})) {ctx.moveTo(px+CELL,py);ctx.lineTo(px+CELL,py+CELL);}
        if(!boardCell({x,y:y+1})) {ctx.moveTo(px+CELL,py+CELL);ctx.lineTo(px,py+CELL);}
        if(!boardCell({x:x-1,y})) {ctx.moveTo(px,py+CELL);ctx.lineTo(px,py);}
      }
      ctx.lineWidth=5;ctx.strokeStyle='#d6dfc9';ctx.lineJoin='round';ctx.stroke();
    } else round(PAD-4,PAD-4,COLS*CELL+8,ROWS*CELL+8,11,'#f2f2e6');
    ctx.save();ctx.beginPath();ctx.roundRect(PAD,PAD,COLS*CELL,ROWS*CELL,8);ctx.clip();
    for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) {
      if(!boardCell({x,y})) continue;
      if((x+y)%2===0) {ctx.fillStyle='#e7ecdc55';ctx.fillRect(PAD+x*CELL,PAD+y*CELL,CELL,CELL);}
      if(settings.grid) {ctx.strokeStyle='#8b9c7c33';ctx.lineWidth=1;ctx.strokeRect(PAD+x*CELL,PAD+y*CELL,CELL,CELL);}
      else {ctx.beginPath();ctx.arc(PAD+(x+.5)*CELL,PAD+(y+.5)*CELL,1,0,Math.PI*2);ctx.fillStyle='#d6dfc9';ctx.fill();}
    }
    ctx.restore();
    for(const k of walls) {
      const [x,y]=k.split(',').map(Number),px=PAD+x*CELL,py=PAD+y*CELL;
      round(px+2,py+5,36,34,7,'#b8c4ad');round(px+2,py+2,36,33,7,'#cbd4bf');
      round(px+7,py+6,26,3,2,'#dce4d4');
    }
    for(const t of tanks) drawTank(t);
    for(const w of worms) drawWorm(w);
    for(const s of sparks) {
      const p=s.life/s.duration,e=p*p;
      ctx.globalAlpha=1-p;ctx.beginPath();ctx.arc(s.x+(s.to.x-s.x)*e,s.y+(s.to.y-s.y)*e,2.8*(1-p)+.8,0,Math.PI*2);ctx.fillStyle=COLORS[s.color].hex;ctx.fill();
    }
    ctx.globalAlpha=1;
    for(const e of effects) {
      const p=e.life/.5;ctx.globalAlpha=1-p;
      e.cells.forEach((c,i)=>{
        const q=center(c);ctx.beginPath();ctx.arc(q.x,q.y,15+p*17,0,Math.PI*2);ctx.lineWidth=3*(1-p);ctx.strokeStyle=COLORS[e.color].hex;ctx.stroke();
        if(i===Math.floor(e.cells.length/2)) {ctx.fillStyle=COLORS[e.color].dark;ctx.font='800 14px "Segoe UI",sans-serif';ctx.textAlign='center';ctx.fillText('100%',q.x,q.y-12-p*20);}
      });ctx.globalAlpha=1;
    }
  }

  $('previous').onclick=()=>loadLevel(levelIndex-1);
  $('next').onclick=()=>loadLevel(levelIndex+1);
  $('restart').onclick=()=>loadLevel(levelIndex);
  $('continue').onclick=()=>loadLevel(levelIndex===LEVELS.length-1?0:levelIndex+1);
  for(const [id,property,format] of [
    ['radius','radius',v=>v.toFixed(2)+' кл.'],
    ['speed','speed',v=>v+' / с'],
    ['simulation','simulation',v=>v.toFixed(1)+'×']
  ]) {
    const input=$(id);input.oninput=()=>{settings[property]=Number(input.value);$(id+'Value').textContent=format(settings[property]);};input.oninput();
  }
  for(const id of ['areas','grid']) $(id).onchange=()=>{settings[id]=$(id).checked;};
  $('debug').addEventListener('toggle',updateCounts);
  canvas.style.cursor='grab';
  // Small read-only inspection surface for a producer's manual balancing pass.
  window.sandWorms={
    get settings(){return {...settings};},
    setEntryMode(mode){
      endDrag();
      if(mode!=='developer') {
        for(const [id,value] of [['radius',1.2],['speed',300],['simulation',1]]) {$(id).value=value;$(id).oninput();}
        for(const id of ['areas','grid']) {$(id).checked=false;settings[id]=false;}
        $('debug').open=false;
      }
    },
    snapshot(){return {level:levelIndex+1,cols:COLS,rows:ROWS,won,...updateCounts(),worms:worms.map(w=>({color:w.color,cells:copy(w.cells),filled:w.filled,capacity:w.capacity,contacts:getContacts(w).length}))};}
  };
  loadLevel(0);
  function frame(stamp) {
    const dt=lastTime?Math.min((stamp-lastTime)/1000,.05):0;lastTime=stamp;
    if(window.GameEntry?.current?.isOpen()) {if(drag) endDrag();}
    else update(dt);
    render();requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
