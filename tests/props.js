const fs=require('fs'),vm=require('vm');
const el=()=>({value:'',checked:false,textContent:'',hidden:false,addEventListener(){},replaceChildren(){},append(){},requestSubmit(){}});
const els={};const ctx={document:{getElementById:id=>els[id]||(els[id]=el()),createElement:el},location:{hash:''},history:{replaceState(){}},navigator:{},console,Math,String,Number};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2],'utf8').match(/<script>([\s\S]*)<\/script>/)[1]+';this.compute=compute;this.parseAngle=parseAngle;this.roman=roman;',ctx);
let fail=0; const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m);}};
// 1. Point inside every reported box; boxes nested; sizes right.
const sizes=[[4,6],[2,3],[2/3,1],[1/3,0.5],[1/6,0.25],[1/12,0.125],[1/24,1/16]];
const parents=[null,0,0,0,3,4,5]; const eps=0.0005/3600;
for(let i=0;i<200000;i++){
  const lat=(Math.random()*176-88), lon=(Math.random()*360-180);
  const sh=ctx.compute(lat,lon);
  sh.forEach((s,j)=>{const b=s.box;
    ok(lat>=b.s-eps&&lat<=b.n+eps&&lon>=b.w-eps&&lon<=b.e+eps,`inside ${lat},${lon} ${s.scale}`);
    ok(Math.abs(b.n-b.s-sizes[j][0])<eps&&[1,2,3,4].some(g=>Math.abs(b.e-b.w-g*sizes[j][1])<eps),`size ${s.scale}`);
    if(parents[j]!==null){const p=sh[parents[j]].box; ok(b.s>=p.s-eps&&b.n<=p.n+eps&&b.w>=p.w-eps&&b.e<=p.e+eps,'nested');
      ok(s.cell.replace(' (S)','').startsWith(sh[parents[j]].cell.replace(' (S)','')+'-'),'name prefix');}
  });
  if(fail>5)break;
}
// 2. Every sheet number in range is reachable and unique per cell (scan a 1M sheet at cell centres).
const seen={};for(const lv of [[2,'500'],[6,'200'],[12,'100']]){const n=lv[0];const names=new Set();
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){const lat=52-(r+0.5)*4/n, lon=30+(c+0.5)*6/n; names.add(ctx.compute(lat,lon)[{2:1,6:2,12:3}[n]].name);}
  ok(names.size===n*n,`unique ${lv[1]}k: ${names.size}`);}
const first=ctx.compute(51.99,30.01), last=ctx.compute(48.01,35.99);
console.log('NW corner of M-36:',first.map(s=>s.name).join(' '));
console.log('SE corner of M-36:',last.map(s=>s.name).join(' '));
ok(ctx.roman(36)==='XXXVI'&&ctx.roman(4)==='IV'&&ctx.roman(19)==='XIX','roman');
// 3. Extremes.
for(const [la,lo] of [[0,0],[88,180],[-88,-180],[4,6],[0,-180],[-0.000001,179.999999],[60,0]])
  console.log(`(${la},${lo}) ->`,ctx.compute(la,lo).map(s=>s.name).join(' '));
// 4. Known published sheets.
const known=[['Kyiv 50°27′N 30°31′E',50.45,30.5167,0,'M-36'],['Kyiv 1:100k',50.45,30.5167,3,'M-36-50'],
 ['Moscow 55°45′N 37°37′E',55.7558,37.6173,0,'N-37'],['Moscow 1:200k',55.7558,37.6173,2,'N-37-II'],['Moscow 1:100k',55.7558,37.6173,3,'N-37-4'],
 ['St Petersburg 59°57′N 30°19′E',59.95,30.3167,0,'O-36'],['Donetsk 48°00′N 37°48′E',48.0159,37.8028,0,'M-37'],['London',51.5074,-0.1278,0,'M-30'],['Sydney',-33.87,151.21,0,'I-56 (S)']];
for(const [n,la,lo,lvl,exp] of known){const got=ctx.compute(la,lo)[lvl].name; ok(got===exp,`${n}: ${got} != ${exp}`); console.log(n.padEnd(32),got);}
// 5. Input parsing.
const P=(t,m=88)=>JSON.stringify(ctx.parseAngle(t,m));
for(const t of ['50 27 0','50 27','50','50.45','50,45','50°27′15″','  50  27  15 ','','abc','50 60','50 27 60','89','88 0 1','50.5 10','50 27.5 10','-5','1 2 3 4']) console.log(JSON.stringify(t).padEnd(16),P(t));
console.log('lon 180 0 1:',P('180 0 1',180));
console.log(fail?`${fail} FAILURES`:'all property checks passed'); process.exitCode=fail?1:0;
