/* 20 hand-authored layouts. Coordinates include reservoirs; paths run HEAD -> TAIL.
   Route letters expand only explicitly authored body segments, never generate levels.
   Intended solutions and manual-check priorities: LEVEL_DESIGN.md. */
window.SAND_COLORS = [null,
  {name:'Коралл', hex:'#ef7766', dark:'#b94b48'},
  {name:'Лайм', hex:'#a8c95d', dark:'#678b38'},
  {name:'Лагуна', hex:'#65bfc5', dark:'#357e91'},
  {name:'Солнце', hex:'#f2c65c', dark:'#aa8235'},
  {name:'Сирень', hex:'#b298d1', dark:'#775b9b'},
  {name:'Сапфир', hex:'#648fe1', dark:'#3c60a9'},
  {name:'Нефрит', hex:'#67bb83', dark:'#36774e'},
  {name:'Рубин', hex:'#e86c7e', dark:'#a83d53'}
];
(() => {
  const worm = (color,x,y,route) => {
    const cells=[{x,y}],step={U:[0,-1],R:[1,0],D:[0,1],L:[-1,0]};
    for(const d of route) {x+=step[d][0];y+=step[d][1];cells.push({x,y});}
    return {color,cells};
  };
  const tank = (x,y,w,h,colors,art='layers',shape) => ({x,y,w,h,colors,art,shape});
  const bar = (x,y,w,h=1) => Array.from({length:w*h},(_,i)=>[x+i%w,y+Math.floor(i/w)]);
  const masonry = (rows,y) => rows.flatMap((row,dy)=>[...row].flatMap((c,x)=>c==='#'?[[x,y+dy]]:[]));
  window.SAND_LEVELS = [
    // 1: short bodies, one island, lower lime layer first.
    {title:'Два берега',cols:4,rows:7,hint:'Лаймовый слой снизу. Подведи червя и меняй точку контакта.',
      tanks:[tank(0,0,4,2,[1,2],'diagonal')],walls:[[1,4]],
      worms:[worm(1,0,3,'DD'),worm(2,3,3,'DD')]},
    // 2: coral occupies the only gate; park it before bringing lime through tail-first.
    {title:'Один проход',cols:5,rows:7,hint:'Проход занят. Сначала найди короткому червю место сбоку.',
      tanks:[tank(0,0,5,2,[1,3,2])],walls:[...bar(0,4,2),...bar(3,4,2)],
      worms:[worm(1,2,3,'DD'),worm(2,0,5,'RD'),worm(3,4,5,'LD')]},
    // 3: five-cell sun crosses both exits; its removal creates the first shared turn.
    {title:'Поперечная перемычка',cols:5,rows:8,hint:'Поперечное тело занимает подход. После сбора появится общий поворот.',
      tanks:[tank(0,0,5,2,[4,6,5],'columns')],walls:[...bar(2,4,1,3)],
      worms:[worm(4,0,3,'RRRR'),worm(6,1,5,'DD'),worm(5,3,6,'R')]},
    // 4: a divider links the bays only above/below it; park coral by its right tail.
    {title:'По другую сторону острова',cols:5,rows:9,hint:'Верхний и нижний обходы связаны. Освободи подход для лагуны.',
      tanks:[tank(0,0,5,3,[1,4,3])],walls:[...bar(2,5,1,3)],
      worms:[worm(1,1,4,'RR'),worm(3,4,5,'DD'),worm(4,0,5,'DD'),worm(3,2,8,'R')]},
    // 5: a sole gate and a lower spur; parking one body must preserve the return path.
    {title:'Карман перед воротами',cols:6,rows:9,hint:'Оставь ворота свободными. Нижняя ветка поможет сменить ведущий конец.',
      tanks:[tank(0,0,6,2,[1,4,3])],walls:[...bar(0,4,2),...bar(3,4,3),...bar(3,6,1,2)],
      worms:[worm(1,2,3,'DDR'),worm(3,0,5,'DD'),worm(4,5,5,'DDL'),worm(3,2,8,'R')]},
    // 6: two collection fronts, unequal body lengths and a cropped bottom loop.
    {title:'Место для разворота',cols:6,rows:9,hint:'Короткий и длинный черви делят поворот, но собирают поровну.',
      footprint:['######','######','######','######','######','######','######','######','.####.'],
      tanks:[tank(0,0,6,3,[5,8,3,7],'mosaic')],walls:[...bar(2,5,1,2),...bar(4,6,1,2)],
      worms:[worm(5,0,4,'RRRR'),worm(7,5,4,'DDD'),worm(8,1,5,'DD'),worm(3,3,5,'DDDLL'),worm(8,0,6,'D')]},
    // 7: two pixel pictures; alternate collection fronts and opening the lower ring.
    {title:'Раздельные берега',cols:6,rows:9,hint:'Два рисунка разрушаются по-разному. Сохраняй нижний обход.',
      tanks:[tank(0,0,3,3,[8,3],'heart'),tank(3,0,3,3,[5,4],'rings')],walls:[...bar(2,6,2,2)],
      worms:[worm(8,1,4,'RRRD'),worm(3,0,5,'DD'),worm(4,5,6,'DD'),worm(5,1,7,'DRR')]},
    // 8: all starting segments have at least one empty cell before EVERY tank face.
    {title:'Сначала вниз, потом вверх',cols:7,rows:10,hint:'Нижняя секция — часть маршрута. Один цвет может требовать нескольких визитов.',
      tanks:[tank(0,0,7,2,[8,3],'waves'),tank(0,6,2,2,[4,7],'chevrons')],
      walls:[...bar(2,4,1,2),...bar(4,4,1,2),...bar(4,8,1,2)],
      worms:[worm(8,0,3,'RR'),worm(3,6,4,'DDL'),worm(4,3,4,'DDRD'),worm(7,0,9,'RR'),worm(3,5,8,'R')]},
    // 9: connected stair mask; diamond background, rim and core need different faces.
    {title:'Три высоты песка',cols:6,rows:10,hint:'Нижний уступ и верхняя полка доступны из разных коридоров.',
      tanks:[tank(0,0,6,4,[5,8,3],'diamond',['######','######','###...','##....'])],
      walls:[...bar(3,5,1,3),...bar(1,7,1,2),...bar(4,8,2)],
      worms:[worm(3,0,5,'DD'),worm(8,2,5,'DDDDR'),worm(5,5,5,'DDL'),worm(8,5,9,'L')]},
    // 10: upper slit is a parking bay; sapphire must leave the central route without filling.
    {title:'Две парковки',cols:7,rows:11,hint:'Верхняя щель и нижний карман решают разные задачи. Не занимай оба выхода.',
      footprint:['#######','#######','#######','#######','#######','#######','#######','#######','#######','#######','.#####.'],
      tanks:[tank(0,0,3,3,[8,7],'heart'),tank(4,0,3,3,[6,4],'star')],
      walls:masonry(['##...##','..#.#..','..#.#..','.......','#..#..#'],5),
      worms:[worm(8,1,4,'RRRRR'),worm(7,0,6,'DD'),worm(4,6,6,'DD'),worm(6,3,6,'DDRD'),worm(7,1,9,'D')]},
    // 11: closed lower circuit; shift the waiting turquoise BEFORE parking jade left.
    {title:'Замкнутый обход',cols:7,rows:10,hint:'Сначала сдвинь нижнего ожидающего. Верхний проход нужен сразу двум телам.',
      tanks:[tank(0,0,7,3,[8,7,3],'flower')],
      walls:masonry(['###.###','#.....#','#.###.#','#...#.#','###...#'],5),
      worms:[worm(8,1,4,'RRR'),worm(7,2,6,'RR'),worm(3,5,6,'DD'),worm(3,1,8,'RR')]},
    // 12: two separate necks share one bottom crossover and a finite parking socket.
    {title:'Развилка со звёздочкой',cols:8,rows:11,hint:'Нижний тупик — парковка, а не запасной выход. Не запирай там оба тела.',
      tanks:[tank(0,0,8,3,[4,6,5],'star')],
      walls:masonry(['##.##.##','#..##..#','#.####.#','#......#','###..###','##....##'],5),
      worms:[worm(4,2,4,'RRRD'),worm(5,2,6,'LD'),worm(6,5,6,'RDD'),worm(5,1,8,'RR')]},
    // 13: single S-neck and a lower ring; a six-move reversal changes which end exits.
    {title:'Алмаз за поворотом',cols:7,rows:12,hint:'Освободи поперечную дорожку, прежде чем вести червя через S-поворот.',
      tanks:[tank(0,0,7,3,[5,3,8],'diamond')],
      walls:masonry(['###.###','#...###','#.#####','#.....#','###.#.#','#...#.#','#.....#'],5),
      worms:[worm(5,3,4,'DDL'),worm(8,1,6,'DD'),worm(3,2,8,'RRRD'),worm(8,1,10,'RR')]},
    // 14: outside horseshoe and inside blind socket, linked only from BELOW.
    {title:'Подкова и внутренний двор',cols:8,rows:12,hint:'Во внутренний двор можно попасть только снизу. Сохрани путь обратно.',
      tanks:[tank(0,0,8,3,[6,4,5,7],'rings')],
      walls:masonry(['##.##.##','#..##..#','#.####.#','#.#..#.#','#.#..#.#','#......#','###..###'],5),
      worms:[worm(6,2,4,'RRRD'),worm(7,2,6,'LDD'),worm(4,5,6,'RDD'),worm(5,3,8,'DR'),worm(5,1,10,'RR')]},
    // 15: ONE multicolor heart. Crowded lower loop; the two turquoise bodies need the
    // green pair to clear support before they can finish. Ruby must be parked twice.
    {title:'Сердце в двойной петле',cols:8,rows:12,hint:'Две петли делят поворот. Освобождай нижний контур, пока сердце осыпается.',
      tanks:[tank(0,0,8,4,[8,3,7],'heart')],
      walls:masonry(['##.##.##','#..##..#','#.####.#','#......#','##.##.##','#......#'],6),
      worms:[worm(8,2,5,'RRRD'),worm(7,2,7,'LD'),worm(3,5,7,'RDD'),worm(7,1,9,'RR'),worm(8,2,11,'RR'),worm(3,6,11,'L')]},
    // 16: fewer colors and less width; the central through-pocket changes occupants.
    {title:'Звезда в тесном кольце',cols:7,rows:11,hint:'Освободившийся карман понадобится другому червю. Не занимай его надолго.',
      tanks:[tank(0,0,7,3,[6,5,4],'star')],
      walls:masonry(['###.###','#.....#','#.###.#','#.#...#','#.#.#.#','#.....#'],5),
      worms:[worm(6,3,4,'DDRR'),worm(4,1,6,'DD'),worm(5,5,7,'DDD'),worm(4,3,8,'DD'),worm(6,1,10,'R')]},
    // 17: ONE terraced flower volume. Its stepped wall is reached by two maze routes;
    // the two-cell blind spur requires a tail-first extraction of jade.
    {title:'Цветок над лабиринтом',cols:8,rows:12,hint:'Из правого тупика ведёт хвост. Цветок собирается через разные уступы.',
      tanks:[tank(0,0,8,4,[4,5,7,6],'flower',['########','########','########','###.....'])],
      walls:masonry(['###.####','#...#..#','#.#.#.##','#.#....#','#.###..#','#......#'],6),
      worms:[worm(5,3,5,'DDLLD'),worm(6,1,9,'DD'),worm(7,6,7,'LD'),worm(6,3,9,'RRD'),worm(4,3,11,'R')]},
    // 18: both reservoirs are multicolor. A narrow waist separates two lower sidings;
    // the turquoise worm has to revisit both pictures instead of emptying one box.
    {title:'Два рисунка, одна талия',cols:7,rows:12,hint:'Один нижний карман освобождается ценой другого. Не перекрывай талию поля.',
      tanks:[tank(0,0,3,3,[8,3,7],'heart'),tank(4,0,3,3,[6,4,3],'rings')],
      walls:masonry(['##.#.##','#..#..#','#.###.#','#.....#','###.###','#.....#','#.###.#'],5),
      worms:[worm(8,1,4,'RRRD'),worm(7,2,6,'LD'),worm(6,4,6,'RDD'),worm(3,1,8,'RRD'),worm(4,1,11,'UR')]},
    // 19: ONE connected reservoir with a right leg. A wall closes the short gallery
    // bypass: reaching the leg's bottom requires the full lower maze detour.
    {title:'Длинный путь к зигзагам',cols:8,rows:12,hint:'Боковая галерея не выводит к нижней грани. Нужен обход под лабиринтом.',
      tanks:[tank(0,0,8,6,[6,4,5,3],'chevrons',['########','########','########','......##','......##','......##'])],
      walls:masonry(['#.#.#...','#.#.##..','#...###.','###.#.#.','#...#...','#.###.##','#.....##'],5),
      worms:[worm(3,1,4,'RRDD'),worm(6,1,5,'DD'),worm(5,3,7,'DDLL'),worm(4,7,7,'DDL'),worm(6,3,11,'R')]},
    // 20: ONE butterfly, two necks and two lower sidings. Blue -> temporary parking
    // -> yellow -> ruby re-parking -> second blue -> right wing -> core; see notes.
    {title:'Бабочка: последняя перестановка',cols:8,rows:12,hint:'Освободи петлю и смени парковку. Левое крыло не открывает правое автоматически.',
      tanks:[tank(0,0,8,4,[8,4,5,6],'butterfly',['########','########','.######.','..####..'])],
      walls:masonry(['##.##.##','#..##..#','#.####.#','#...#..#','###.#.##','#......#'],6),
      worms:[worm(8,0,5,'RRRRRR'),worm(6,2,7,'LD'),worm(5,5,7,'RDD'),worm(4,1,9,'RRD'),worm(6,4,11,'RR')]}
  ];
})();
