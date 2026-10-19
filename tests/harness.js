// Loads the page script with DOM stubs; reads "latStr latHem lonStr lonHem" lines on stdin, prints sheet names.
const fs=require('fs'),vm=require('vm');
const el=()=>({value:'',checked:false,textContent:'',hidden:false,addEventListener(){},replaceChildren(){},append(){},requestSubmit(){}});
const els={};
const ctx={document:{getElementById:id=>els[id]||(els[id]=el()),createElement:el},location:{hash:''},history:{replaceState(){}},navigator:{},console,Math,String,Number};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2],'utf8').match(/<script>([\s\S]*)<\/script>/)[1]+';this.compute=compute;this.parseAngle=parseAngle;',ctx);
if(process.argv[3]==='cyr') els.cyr.checked=true;
const out=[];
for(const line of fs.readFileSync(0,'utf8').trim().split('\n')){
  const [la,lh,lo,loh]=line.split('|');
  const a=ctx.parseAngle(la,88),b=ctx.parseAngle(lo,180);
  if(a.error||b.error){out.push('ERR:'+(a.error||'')+'/'+(b.error||''));continue;}
  out.push(ctx.compute(a.value*+lh,b.value*+loh).map(s=>s.cell).join(' '));
}
console.log(out.join('\n'));
