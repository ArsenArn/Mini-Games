/* Pure game rules, shared by the Canvas client and the bounded smoke check.
   Falling sand / local wall collection adapted from our own Sand Worms prototype.
   No path search, level solver, resource replacement or particle teleportation. */
(() => {
  'use strict';
  const GRAINS=8, DIRS=[[1,0],[-1,0],[0,1],[0,-1]];
  const key=(x,y)=>`${x},${y}`;
  const cells=b=>b.cells.map(([x,y])=>[b.x+x,b.y+y]);
  const inside=(t,x,y)=>x>=t.x && y>=t.y && x<t.x+t.w && y<t.y+t.h;
  const boardCell=(level,x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<level.cols&&y<level.rows&&(!level.footprint||level.footprint[y][x]==='#');
  function validate(level) {
    const fail=message=>{throw new Error(`${level.title}: ${message}`);};
    const inBoard=(x,y)=>boardCell(level,x,y);
    if(!Number.isInteger(level.cols)||!Number.isInteger(level.rows)||level.cols<1||level.rows<1) fail('invalid board');
    if(level.footprint&&(level.footprint.length!==level.rows||level.footprint.some(row=>row.length!==level.cols||/[^#.]/.test(row))))fail('invalid footprint');
    const occupied=new Set(),hiddenOccupied=new Set(),ids=new Set(),sand=Array(6).fill(0),capacity=Array(6).fill(0);
    const occupy=(x,y,set)=>{if(!inBoard(x,y)||set.has(key(x,y))) fail(`overlap / bounds at ${x},${y}`);set.add(key(x,y));};
    for(const [x,y] of level.walls) occupy(x,y,occupied);
    const checkBlock=(b,t)=>{
      if(ids.has(b.id)) fail(`duplicate block ${b.id}`);ids.add(b.id);
      if(!Number.isInteger(b.capacity)||b.capacity<1||!Number.isInteger(b.color)||b.color<1||b.color>5) fail(`invalid capacity / color ${b.id}`);
      if(!b.cells.length) fail(`empty shape ${b.id}`);
      const local=new Set();
      for(const [dx,dy] of b.cells) {
        if(!Number.isInteger(dx)||!Number.isInteger(dy)||local.has(key(dx,dy))) fail(`invalid shape ${b.id}`);
        local.add(key(dx,dy));
        const x=b.x+dx,y=b.y+dy;
        if(t && !inside(t,x,y)) fail(`hidden block ${b.id} outside ${t.id}`);
        occupy(x,y,t?hiddenOccupied:occupied);
      }
      // Shape connectivity only; this is not a board-state search.
      const seen=new Set(),queue=[b.cells[0]];
      while(queue.length) {const [x,y]=queue.pop(),k=key(x,y);if(seen.has(k))continue;seen.add(k);for(const [dx,dy] of DIRS) if(local.has(key(x+dx,y+dy))&&!seen.has(key(x+dx,y+dy)))queue.push([x+dx,y+dy]);}
      if(seen.size!==b.cells.length) fail(`disconnected shape ${b.id}`);
      capacity[b.color]+=b.capacity;
    };
    const tankIds=new Set();
    for(const t of level.tanks) {
      if(tankIds.has(t.id))fail(`duplicate container ${t.id}`);tankIds.add(t.id);
      if(!Number.isInteger(t.w)||!Number.isInteger(t.h)||t.w<1||t.h<1)fail(`invalid container ${t.id}`);
      for(let y=t.y;y<t.y+t.h;y++)for(let x=t.x;x<t.x+t.w;x++)occupy(x,y,occupied);
      let count=0;
      for(const [c,n] of t.sand) {if(!Number.isInteger(n)||n<1||!Number.isInteger(c)||c<1||c>5)fail(`invalid sand ${t.id}`);sand[c]+=n;count+=n;}
      if(count!==t.w*t.h*GRAINS*GRAINS)fail(`particle volume ${t.id}`);
      for(const b of t.hidden)checkBlock(b,t);
    }
    for(const b of level.blocks)checkBlock(b);
    for(let c=1;c<6;c++) {
      if(sand[c]!==capacity[c])fail(`color ${c}: sand ${sand[c]} != capacity ${capacity[c]}`);
    }
    return {title:level.title,sand,capacity,hidden:level.tanks.reduce((n,t)=>n+t.hidden.length,0),containers:level.tanks.length};
  }
  class State {
    constructor(level) {
      validate(level);this.level=level;this.tick=0;this.events=[];this.blocks=[];
      this.walls=new Set(level.walls.map(([x,y])=>key(x,y)));
      const makeBlock=(b,active)=>{const v={...b,cells:b.cells.map(c=>[...c]),active,removed:false,filled:0,credit:0};this.blocks.push(v);return v;};
      this.tanks=level.tanks.map(spec=>{
        const t={...spec,width:spec.w*GRAINS,height:spec.h*GRAINS,state:'solid',openTime:0,remaining:0,revision:0};
        t.data=new Uint8Array(t.width*t.height);t.hidden=spec.hidden.map(b=>makeBlock(b,false));
        // Explicit particle quotas, arranged in vertical color bands.
        let paletteIndex=0,left=spec.sand[0][1];
        for(let x=0;x<t.width;x++)for(let y=0;y<t.height;y++) {
          t.data[y*t.width+x]=spec.sand[paletteIndex][0];t.remaining++;
          if(--left===0 && paletteIndex+1<spec.sand.length)left=spec.sand[++paletteIndex][1];
        }
        return t;
      });
      level.blocks.forEach(b=>makeBlock(b,true));
      this.initial=this.counts().sand.slice();this.total=this.initial.reduce((a,b)=>a+b,0);this.collected=0;
    }
    activeBlocks() {return this.blocks.filter(b=>b.active&&!b.removed);}
    canMove(b,dx,dy) {
      if(!b.active||b.removed||Math.abs(dx)+Math.abs(dy)!==1)return false;
      for(const [x,y] of cells(b)) {
        const nx=x+dx,ny=y+dy;
        if(!boardCell(this.level,nx,ny)||this.walls.has(key(nx,ny)))return false;
        if(this.tanks.some(t=>t.state!=='gone'&&inside(t,nx,ny)))return false;
        if(this.activeBlocks().some(other=>other!==b&&cells(other).some(([ox,oy])=>ox===nx&&oy===ny)))return false;
      }
      return true;
    }
    move(b,dx,dy) {if(!this.canMove(b,dx,dy))return false;b.x+=dx;b.y+=dy;return true;}
    simulate(t) {
      if(t.state!=='solid')return;
      const d=t.data,w=t.width,h=t.height;
      let changed=false;
      for(let y=h-2;y>=0;y--)for(let i=0;i<w;i++) {
        const x=(this.tick&1)?i:w-1-i,at=y*w+x;
        if(!d[at])continue;
        let to=at+w;
        if(d[to]) {
          const side=((x+y+this.tick)&1)?1:-1;
          if(x+side>=0&&x+side<w&&!d[at+side]&&!d[to+side])to+=side;
          else if(x-side>=0&&x-side<w&&!d[at-side]&&!d[to-side])to-=side;
          else continue;
        }
        d[to]=d[at];d[at]=0;changed=true;
      }
      if(changed)t.revision++;
    }
    simulateAll() {for(const t of this.tanks)this.simulate(t);this.tick++;}
    contacts(b) {
      const result=[];
      for(const [x,y] of cells(b))for(const [dx,dy] of DIRS)for(const t of this.tanks) {
        if(t.state==='solid'&&inside(t,x+dx,y+dy)) result.push({t,x:x+.5+dx*.5,y:y+.5+dy*.5,dx,dy});
      }
      return result;
    }
    collect(b,dt,settings) {
      if(!b.active||b.removed)return;
      const contacts=this.contacts(b);
      if(!contacts.length){b.credit=0;return;}
      // A block gets one speed budget, even if it touches several faces / tanks.
      b.credit=Math.min(b.credit+settings.speed*dt,settings.speed*.1+1);
      const budget=Math.min(Math.floor(b.credit),b.capacity-b.filled);
      if(!budget)return;
      const candidates=[];
      for(const t of this.tanks) {
        const local=contacts.filter(c=>c.t===t);if(!local.length)continue;
        for(let y=0;y<t.height;y++)for(let x=0;x<t.width;x++) {
          const at=y*t.width+x;if(t.data[at]!==b.color)continue;
          const gx=t.x+(x+.5)/GRAINS,gy=t.y+(y+.5)/GRAINS;
          let best=Infinity,contact=null;
          for(const c of local) {
            // Keep the disk on the interior side of the contacted wall.
            if((gx-c.x)*c.dx+(gy-c.y)*c.dy<0)continue;
            const d=(gx-c.x)**2+(gy-c.y)**2;if(d<best){best=d;contact=c;}
          }
          if(best<=settings.radius**2)candidates.push({t,at,x:gx,y:gy,d:best,contact});
        }
      }
      candidates.sort((a,b)=>a.d-b.d);
      const amount=Math.min(budget,candidates.length);
      for(let i=0;i<amount;i++) {
        const p=candidates[i];p.t.data[p.at]=0;p.t.remaining--;p.t.revision++;
        if(i%5===0)this.events.push({type:'grain',color:b.color,x:p.x,y:p.y,toX:p.contact.x-p.contact.dx*.45,toY:p.contact.y-p.contact.dy*.45});
      }
      b.filled+=amount;this.collected+=amount;b.credit-=amount;
      if(amount<budget)b.credit=Math.min(b.credit,1);
      if(b.filled===b.capacity) {b.removed=true;b.active=false;this.events.push({type:'filled',block:b});}
      for(const t of this.tanks)if(t.state==='solid'&&t.remaining===0){t.state='opening';t.openTime=0;this.events.push({type:'opening',tank:t});}
    }
    advanceGates(dt) {
      for(const t of this.tanks)if(t.state==='opening') {
        t.openTime+=dt;
        if(t.openTime>=.3) {
          t.state='gone';for(const b of t.hidden)b.active=true;
          this.events.push({type:'revealed',tank:t});
        }
      }
    }
    counts() {
      const sand=Array(6).fill(0),available=Array(6).fill(0),hidden=Array(6).fill(0),absorbed=Array(6).fill(0);
      for(const t of this.tanks)for(const c of t.data)if(c)sand[c]++;
      for(const b of this.blocks) {
        absorbed[b.color]+=b.filled;
        if(!b.removed)(b.active?available:hidden)[b.color]+=b.capacity-b.filled;
      }
      return {sand,available,hidden,absorbed};
    }
    get won() {return this.collected===this.total&&this.blocks.every(b=>b.removed)&&this.tanks.every(t=>t.state==='gone');}
  }
  window.SGEngine={GRAINS,DIRS,cells,inside,boardCell,validate,State};
})();
