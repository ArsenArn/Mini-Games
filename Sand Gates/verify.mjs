// One bounded structural pass + one balance pass. No solver or state search.
// --level=15 also runs a fixed regression of the reported remainder (at most 300 frames).
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const sandbox={window:{},Uint8Array,console};vm.createContext(sandbox);
for(const file of ['levels.js','engine.js'])vm.runInContext(fs.readFileSync(new URL(file,import.meta.url),'utf8'),sandbox,{filename:file});
const {SGEngine:E,SG_LEVELS:levels}=sandbox.window;
assert.equal(levels.length,20,'exactly 20 levels');
const focused15=process.argv.includes('--level=15');
const selected=Array.from(levels.entries()).filter(([i])=>!focused15||i===14);
const hash=x=>createHash('sha256').update(x).digest('hex');
assert.equal(hash(JSON.stringify(levels[7])),'d76791a10e5a27d28a44a94ef117c79a1941f5622054294ebf3a1060abea9d3e','Shared Apron must remain intact at #8');
for(const [file,digest] of [['engine.js','0e854e2cc8885b5e2c1c194f1c3b31d49fc54b0a408ca8cf5de505edb6954538'],['game.js','37dad02f6f7349e0c7e75cfc1c6e45a178d8378e1e24ad84fdd753a7a9cdc234']])assert.equal(hash(fs.readFileSync(new URL(file,import.meta.url))),digest,`${file} changed`);
// Static perimeter fitting, not a route solver: place ONE shape against four faces.
// Other movable bodies and other removable containers are disregarded. This only
// establishes eventual geometric contact, not access to it in every game state.
function auditBottomContacts(s) {
  let pairs=0;
  for(const t of s.tanks)for(const color of new Set(t.sand.map(p=>p[0])))for(const b of s.blocks.filter(b=>b.color===color)) {
    const xs=b.cells.map(p=>p[0]),ys=b.cells.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
    const poses=[];
    for(let x=-minX;x<s.level.cols-maxX;x++)poses.push([x,t.y-maxY-1],[x,t.y+t.h-minY]);
    for(let y=-minY;y<s.level.rows-maxY;y++)poses.push([t.x-maxX-1,y],[t.x+t.w-minX,y]);
    const contacts=[];
    for(const [x,y] of poses) {
      const probe={...b,x,y};
      if(E.cells(probe).some(([cx,cy])=>!E.boardCell(s.level,cx,cy)||s.walls.has(`${cx},${cy}`)||E.inside(t,cx,cy)))continue;
      contacts.push(...s.contacts(probe).filter(c=>c.t===t));
    }
    for(let px=0;px<t.width;px++) {
      const gx=t.x+(px+.5)/E.GRAINS,gy=t.y+t.h-.5/E.GRAINS;
      assert.ok(contacts.some(c=>(gx-c.x)*c.dx+(gy-c.y)*c.dy>=0&&(gx-c.x)**2+(gy-c.y)**2<=1.2**2),`${b.id} cannot reach bottom grain ${px} of ${t.id}`);
    }
    pairs++;
  }
  return pairs;
}
const failures=[],states=[];
for(const [i,level] of selected) {
  try {
    assert.equal(level.footprint,undefined,'full rectangular board required');
    const s=new E.State(level);
    // Read existing contact geometry and real starting grains; do not absorb anything.
    for(const b of s.activeBlocks())for(const c of s.contacts(b)) {
      const t=c.t;
      for(let y=0;y<t.height;y++)for(let x=0;x<t.width;x++)if(t.data[y*t.width+x]===b.color) {
        const gx=t.x+(x+.5)/E.GRAINS,gy=t.y+(y+.5)/E.GRAINS;
        assert.ok((gx-c.x)**2+(gy-c.y)**2>1.2**2,`${b.id}: initial collection at ${t.id}`);
      }
    }
    const accessPairs=auditBottomContacts(s);
    const identities=s.blocks.map(b=>[b.id,b.x,b.y,b.color,b.capacity,JSON.stringify(b.cells)].join('|'));
    assert.equal(s.activeBlocks().length,level.blocks.length);
    assert.ok(s.tanks.every(t=>t.hidden.every(b=>!b.active)));
    for(const t of s.tanks){t.state='opening';t.openTime=0;}
    s.advanceGates(.31);
    assert.ok(s.tanks.every(t=>t.state==='gone')&&s.blocks.every(b=>b.active));
    assert.deepEqual(s.blocks.map(b=>[b.id,b.x,b.y,b.color,b.capacity,JSON.stringify(b.cells)].join('|')),identities);
    // Static color dependency graph, at most five vertices. No board-state enumeration.
    const edges=Array.from({length:6},()=>new Set());
    for(const t of level.tanks)for(const [c] of t.sand)for(const b of t.hidden)edges[c].add(b.color);
    const visiting=new Set(),done=new Set();
    const visit=c=>{assert.ok(!visiting.has(c),'cyclic hidden-color dependency');if(done.has(c))return;visiting.add(c);for(const to of edges[c])visit(to);visiting.delete(c);done.add(c);};
    for(let c=1;c<6;c++)visit(c);
    const area=level.tanks.reduce((n,t)=>n+t.w*t.h,0)+level.blocks.reduce((n,b)=>n+b.cells.length,0)+level.walls.length;
    console.log(`STRUCTURE ${String(i+1).padStart(2,'0')} OK: ${level.title}; ${level.cols}x${level.rows}; ${area}/${level.cols*level.rows} occupied; ${s.tanks.length} tanks; ${accessPairs} shape/tank bottom-contact checks`);
    states.push({s,i});
  } catch(e){failures.push(`STRUCTURE ${i+1}: ${e.message}`);}
}
let total=0,min=Infinity,max=0;
for(const {s,i} of states) {
  try {
    const c=s.counts();c.sand.forEach((n,color)=>assert.equal(n,c.available[color]+c.hidden[color]));
    for(const b of s.blocks) {
      const ratio=b.capacity/b.cells.length;min=Math.min(min,ratio);max=Math.max(max,ratio);
      assert.ok(ratio>=32&&ratio<=128,`${b.id}: disproportionate capacity ${ratio}`);
      for(const other of s.blocks)if(other.color===b.color&&other.cells.length>b.cells.length)assert.ok(other.capacity>=b.capacity,`${other.id} larger than ${b.id} but holds less`);
    }
    total+=s.total;
  } catch(e){failures.push(`BALANCE ${i+1}: ${e.message}`);}
}
function checkLevel15Remainder() {
  const level=levels[14];
  const prepare=spec=>{
    const s=new E.State(spec),red=s.blocks.find(b=>b.id==='r-L');
    for(const b of s.activeBlocks())if(b!==red){b.filled=b.capacity;b.removed=true;b.active=false;}
    Object.assign(red,{x:3,y:4,filled:228});
    const [a,b]=s.tanks;
    a.data.fill(0);
    for(let row=0;row<7;row++)for(let x=0;x<7-row;x++)a.data[(a.height-1-row)*a.width+x]=1;
    a.remaining=28;a.revision++;
    let purple=0;
    for(let i=0;i<b.data.length;i++)if(b.data[i]!==1&&!(b.data[i]===5&&purple++<96))b.data[i]=0;
    b.remaining=160;b.revision++;s.collected=516;
    const counts=s.counts();
    for(let color=1;color<6;color++)assert.equal(counts.sand[color]+counts.absorbed[color],s.initial[color]);
    assert.equal(Math.round(100*red.filled/red.capacity),71);
    assert.equal(Math.round(100*s.collected/s.total),73);
    return {s,red,a,b};
  };
  const old=JSON.parse(JSON.stringify(level));old.rows=8;old.tanks.find(t=>t.id==='B').y=7;
  const baseline=prepare(old);
  assert.equal(baseline.s.canMove(baseline.red,0,1),false,'old B blocks the lower bypass');
  const {s,red,a,b}=prepare(level);
  const steps=(body,dx,dy,n)=>{for(let i=0;i<n;i++)assert.ok(s.move(body,dx,dy),`${body.id}: blocked at ${body.x},${body.y} toward ${dx},${dy}`);};
  let frames=0;
  const frame=()=>{
    frames++;
    s.simulateAll();
    for(const body of s.activeBlocks())s.collect(body,1/60,{radius:1.2,speed:160});
    s.advanceGates(1/60);s.events.length=0;
    const counts=s.counts();
    for(let color=1;color<6;color++){
      assert.equal(counts.sand[color]+counts.absorbed[color],s.initial[color]);
      assert.equal(counts.sand[color],counts.available[color]+counts.hidden[color]);
    }
  };
  const hold=()=>{for(let i=0;i<60;i++)frame();};
  steps(red,0,1,1);steps(red,-1,0,3);steps(red,0,-1,2);
  assert.ok(a.state==='solid'&&b.state==='solid','lower bypass must work with BOTH containers closed');
  frame();assert.ok(a.remaining>0&&a.remaining<28,'collection remains gradual');
  for(let i=1;i<60;i++)frame();
  const purple=s.blocks.find(body=>body.id==='p-J');
  assert.equal(a.state,'gone');assert.equal(red.filled,256);assert.ok(purple.active);
  steps(red,0,1,2);hold();
  if(!red.removed){steps(red,1,0,1);hold();}
  assert.ok(red.removed);assert.equal(b.remaining,96);
  steps(purple,1,0,4);steps(purple,0,1,3);hold();
  if(!purple.removed){steps(purple,1,0,1);hold();}
  assert.ok(s.won,'reported remainder must finish with the existing physics and capacities');
  console.log(`REGRESSION 15 OK: 71% red / 73% total; both tanks closed; fixed bypass, A reveal and final B collection; ${frames} frames.`);
}
if(focused15&&!failures.length)try{checkLevel15Remainder();}catch(e){failures.push(`REGRESSION 15: ${e.message}`);}
if(failures.length){console.error(failures.join('\n'));process.exitCode=1;}
else {
  console.log(`BALANCE OK: ${selected.length} levels, ${total} real grains; ${min}..${max} grains/body-cell.`);
  console.log(`PRESERVED: Shared Apron at #8, engine.js, game.js. ${focused15?'Only the reported remainder was simulated.':'No simulation or playthrough.'} No solver. Perimeter contact does not prove routes or safety of all game states.`);
}
