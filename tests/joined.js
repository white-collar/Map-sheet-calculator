const fs=require('fs'),vm=require('vm');
const el=()=>({value:'',checked:false,textContent:'',hidden:false,addEventListener(){},replaceChildren(){},append(){},requestSubmit(){}});
const els={};const ctx={document:{getElementById:id=>els[id]||(els[id]=el()),createElement:el},location:{hash:''},history:{replaceState(){}},navigator:{},console,Math,String,Number};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2],'utf8').match(/<script>([\s\S]*)<\/script>/)[1]+';this.compute=compute;',ctx);
els.cyr.checked=true; let fail=0;
const L=['1M','500k','200k','100k','50k','25k','10k'];
const ex=[ // [source, lat, lon, level, expected]
 ['Wikipedia: Murmansk',68.97,33.08,0,'R-35,36'],
 ['Wikipedia: Franz Josef Land west',80.6,47,0,'U-37,38,39,40'],
 ['Wikipedia: Belushya Guba',71.55,52.32,1,'R-39-А,Б'],
 ['Wikipedia: doubled 200k',68.3,42.5,2,'R-38-XXXI,XXXII'],
 ['Wikipedia: tripled 200k',80.3,54.5,2,'U-40-XXXI,XXXII,XXXIII'],
 ['irsl: doubled 1M',62,25,0,'P-35,36'],
 ['irsl: tripled 200k',76.3,25,2,'T-35-XXXI,XXXII,XXXIII'],
 ['irsl: quadrupled 100k',76.1,24.6,3,'T-35-133,134,135,136'],
 ['irsl: quadrupled 50k',76.05,24.2,4,'T-35-133-В,Г,134-В,Г'],
 ['textbook: doubled 100k',68.1,60.6,3,'R-41-133,134'],
 ['textbook: quadrupled 100k',76.1,65,3,'T-41-141,142,143,144'],
 ['yug-gps: 100k odd+next even',63.1,31.4,3,'P-36-27,28'],['yug-gps: odd+next even, odd col',60.9,30.7,3,'P-36-109,110'],
 ['Wikipedia: southern',-1,10.5,1,'A-32-Б (Ю. П.)'],
 ['below 60 unchanged (Ryazan)',54.6269,39.6916,3,'N-37-56'],
];
for(const [src,la,lo,lv,exp] of ex){const got=ctx.compute(la,lo)[lv].name; const ok=got===exp; if(!ok)fail++;
  console.log((ok?'ok  ':'FAIL')+' '+src.padEnd(32)+L[lv].padEnd(5)+got+(ok?'':'   expected '+exp));}
console.log('\nFull rows at sample high-latitude points:');
for(const [la,lo] of [[69,33.2],[77.5,20.1],[-70,10]]) console.log(`(${la},${lo})`, ctx.compute(la,lo).map(s=>s.name).join(' | '));
// Consistency: every cell of a joined sheet must give the same joined name and box.
for(let t=0;t<40000;t++){
  const la=(60+Math.random()*28)*(Math.random()<.5?-1:1), lo=Math.random()*360-180;
  const sh=ctx.compute(la,lo);
  sh.forEach((s,j)=>{const b=s.box; for(let q=0;q<4;q++){const lo2=b.w+(q+0.5)*(b.e-b.w)/4, la2=(b.n+b.s)/2;
    const s2=ctx.compute(la2,lo2)[j]; if(s2.name!==s.name||Math.abs(s2.box.w-b.w)>1e-9||Math.abs(s2.box.e-b.e)>1e-9){fail++; if(fail<5)console.log('INCONSISTENT',la,lo,L[j],s.name,s2.name);}}});
}
console.log(fail?fail+' FAILURES':'\nall joined-sheet checks passed'); process.exitCode=fail?1:0;
