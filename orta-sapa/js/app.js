const K="ortasapa_v1";
const $=(s,r=document)=>r.querySelector(s);
let db;
try{db=JSON.parse(localStorage.getItem(K))}catch(e){db=null}
db=Object.assign({items:[],checks:[],ctx:{}},db||{});
db.ctx=Object.assign({role:ROLES[0],org:"",group:"",age:AGE[0],date:new Date().toISOString().slice(0,10)},db.ctx);
const save=()=>{try{localStorage.setItem(K,JSON.stringify(db))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const avg=a=>{a=a.filter(x=>x>0);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null};
const subAvg=(sc,si)=>avg(SUB[si].i.map((_,k)=>sc[si+"_"+k]));
const subs=sc=>SUB.map((_,i)=>subAvg(sc,i));
const total=sc=>avg(subs(sc));
const fmt=v=>v==null?"—":v.toFixed(1);
const lvl=v=>v==null?0:v<3?1:v<5?2:v<6.5?3:4;
const LN=["","Жеткіліксіз","Минималды","Жақсы","Тамаша"];
const tag=v=>`<span class="tg l${lvl(v)}">${lvl(v)?LN[lvl(v)]:"—"}</span>`;
const bar=(n,v)=>`<div class="br"><span>${n}</span><b>${fmt(v)}</b><div class="tr"><i class="l${lvl(v)}" style="width:${v?v/7*100:0}%"></i><u></u></div></div>`;
const lab=it=>`${it.date}, ${esc(it.org)} / ${esc(it.group)}`;
const em=(t,p)=>`<div class="empty"><h2>${t}</h2><p>${p}</p><button class="pb" data-go="ecers">Бағалауды бастау</button></div>`;
const opts=(a,v)=>a.map(x=>`<option ${x===v?"selected":""}>${x}</option>`).join("");
let tab="dash",draft={},ca=0,cb=1,ag=0,msg="";
const V={};
V.dash=()=>{
const it=db.items,l=it[it.length-1],p=it[it.length-2];
if(!l)return em("Әзірге бағалау жоқ","ECERS-3 бөлімінде алғашқы бағалауды толтырыңыз.");
const w=l.subs.map((v,i)=>[v,i]).filter(x=>x[0]!=null).sort((a,b)=>a[0]-b[0]).slice(0,2);
const d=p?l.total-p.total:null;
return `<div class="kp">
<div><small>Бағалау саны</small><strong>${it.length}</strong></div>
<div><small>Соңғы жалпы балл</small><strong>${fmt(l.total)}</strong>${tag(l.total)}</div>
<div><small>Алдыңғы бағалаумен салыстырғанда</small><strong class="${d>0?"up":d<0?"dn":""}">${d==null?"—":(d>0?"+":"")+d.toFixed(1)}</strong></div>
<div><small>Ең әлсіз сала</small><strong class="sm">${SUB[w[0][1]].n}</strong></div></div>
<div class="pn"><h2>Салалар бойынша нәтиже</h2><p class="mt">${lab(l)}</p>${SUB.map((x,i)=>bar(x.n,l.subs[i])).join("")}</div>
<div class="pn"><h2>Назар аударатын бағыттар</h2>${w.map(x=>`<div class="tip"><b>${SUB[x[1]].n}</b><p>${SUB[x[1]].t}</p></div>`).join("")}</div>`;
};
V.ecers=()=>`<div class="pn"><h2>ECERS-3 бағалау парағы</h2><p class="mt">Әр көрсеткіш үшін 1–7 балл таңдаңыз. Бағаланбаған көрсеткіш есепке алынбайды. Балды қайта басу таңдауды алып тастайды.</p><div class="lg">${[1,2,3,4].map(i=>`<span class="tg l${i}">${LN[i]}</span>`).join("")}</div></div>`+
SUB.map((x,si)=>`<div class="pn"><div class="hd"><h3>${x.n}</h3><b>${fmt(subAvg(draft,si))}</b></div>${x.i.map((n,k)=>`<div class="rw"><span>${n}</span><div class="sc">${[1,2,3,4,5,6,7].map(v=>`<button type="button" data-k="${si}_${k}" data-v="${v}" class="${draft[si+"_"+k]===v?"on l"+lvl(v):""}">${v}</button>`).join("")}</div></div>`).join("")}</div>`).join("")+
`<div class="bar"><div><small>Жалпы балл</small><strong>${fmt(total(draft))}</strong></div><span class="ms" role="alert">${msg}</span><button class="sb" data-act="clear">Тазарту</button><button class="pb" data-act="save">Бағалауды сақтау</button></div>`;
V.prog=()=>{
const g=db.checks.length;
return `<div class="pn"><h2>Жас тобы бойынша талаптар</h2><div class="ch">${AGE.map((a,i)=>`<button data-age="${i}" class="${i===ag?"on":""}">${a}</button>`).join("")}</div><ul class="ls">${GROUPREQ[GROUPMAP[ag]].map(t=>`<li>${t}</li>`).join("")}</ul></div>
<div class="pn"><div class="hd"><h2>Ортаға қойылатын жалпы талаптар</h2><b>${g} / ${GENERAL.length}</b></div><div class="tr"><i class="l3" style="width:${g/GENERAL.length*100}%"></i></div>${GENERAL.map((t,i)=>`<label class="ck"><input type="checkbox" data-c="${i}" ${db.checks.includes(i)?"checked":""}><span>${t}</span></label>`).join("")}</div>
<div class="pn"><h2>Балалар бастамасын қолдау жолдары</h2><ul class="ls" style="margin-top:12px">${SUPPORT.map(t=>`<li>${t}</li>`).join("")}</ul></div>`;
};
V.comp=()=>{
const it=db.items;
if(it.length<2)return em("Салыстыру үшін кемінде екі бағалау қажет","Бағалауды толтырып, сақтаңыз.");
ca=Math.min(ca,it.length-1);cb=Math.min(cb,it.length-1);
const A=it[ca],B=it[cb];
const o=n=>it.map((x,i)=>`<option value="${i}" ${i===n?"selected":""}>${lab(x)}</option>`).join("");
const r=(n,a,b)=>{const d=a!=null&&b!=null?b-a:null;return `<tr><td>${n}</td><td>${fmt(a)}</td><td>${fmt(b)}</td><td class="${d>0?"up":d<0?"dn":""}">${d==null?"—":(d>0?"+":"")+d.toFixed(1)}</td></tr>`};
return `<div class="pn"><h2>Бағалауларды салыстыру</h2><div class="cs" style="margin-top:14px"><label>Бірінші бағалау<select data-sel="a">${o(ca)}</select></label><label>Екінші бағалау<select data-sel="b">${o(cb)}</select></label></div>
<table><tr><th>Сала</th><th>Бірінші</th><th>Екінші</th><th>Айырма</th></tr>${SUB.map((x,i)=>r(x.n,A.subs[i],B.subs[i])).join("")}${r("<b>Жалпы балл</b>",A.total,B.total)}</table></div>`;
};
V.chart=()=>{
const it=db.items;
if(!it.length)return em("Диаграмма үшін дерек жоқ","Алғашқы бағалауды сақтаңыз.");
const W=720,H=300,L=40,R=20,T=16,B=36,n=it.length;
const x=i=>n>1?L+i*(W-L-R)/(n-1):(L+W-R)/2;
const y=v=>T+(7-v)*(H-T-B)/6;
let g="";
for(let v=1;v<=7;v++)g+=`<line x1="${L}" x2="${W-R}" y1="${y(v)}" y2="${y(v)}" class="gl${v===3||v===5?" ref":""}"/><text x="${L-8}" y="${y(v)+4}" text-anchor="end">${v}</text>`;
const line=(arr,c,w)=>{const p=arr.map((v,i)=>v==null?null:[x(i),y(v)]).filter(Boolean);return `<polyline fill="none" stroke="${c}" stroke-width="${w}" points="${p.map(q=>q.join(",")).join(" ")}"/>`+p.map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="${w+1.5}" fill="${c}"/>`).join("")};
const xl=it.map((a,i)=>`<text x="${x(i)}" y="${H-12}" text-anchor="middle">${a.date.slice(5)}</text>`).join("");
const ls=SUB.map((s,si)=>line(it.map(a=>a.subs[si]),COL[si],1.5)).join("")+line(it.map(a=>a.total),"#0b2a45",3);
const l=it[n-1];
return `<div class="pn"><h2>Мониторинг динамикасы</h2><p class="mt">Нүктелі сызықтар: 3 балл (минималды) және 5 балл (жақсы).</p><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Динамика">${g}${xl}${ls}</svg><div class="leg"><span><i style="background:#0b2a45"></i>Жалпы балл</span>${SUB.map((s,i)=>`<span><i style="background:${COL[i]}"></i>${s.n}</span>`).join("")}</div></div>
<div class="pn"><h2>Соңғы бағалау</h2><p class="mt">${lab(l)}</p>${SUB.map((s,i)=>bar(s.n,l.subs[i])).join("")}</div>`;
};
V.hist=()=>{
const it=db.items,lock=db.ctx.role==="Тәрбиеші";
if(!it.length)return em("Тарих бос","Сақталған бағалаулар осы жерде көрінеді.");
return `<div class="pn"><h2>Мониторинг тарихы</h2><table style="margin-top:12px"><tr><th>Күні</th><th>Ұйым</th><th>Топ</th><th>Жас тобы</th><th>Кабинет</th><th>Балл</th><th></th></tr>${it.slice().reverse().map(a=>{const i=it.indexOf(a);return `<tr><td>${a.date}</td><td>${esc(a.org)}</td><td>${esc(a.group)}</td><td>${esc(a.age)}</td><td>${a.role}</td><td>${fmt(a.total)} ${tag(a.total)}</td><td><button class="sb dg" data-del="${i}" ${lock?"disabled":""}>Жою</button></td></tr>`}).join("")}</table>
<div class="row"><button class="sb" data-act="csv">CSV жүктеу</button><button class="sb" data-act="json">JSON жүктеу</button><button class="sb dg" data-act="wipe" ${lock?"disabled":""}>Барлығын жою</button></div></div>`;
};
const render=top=>{
const y=window.scrollY;
document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("on",b.dataset.tab===tab));
$("#view").innerHTML=V[tab]();
window.scrollTo(0,top?0:y);
};
const dl=(name,txt,type)=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
const fillCtx=()=>{
const c=db.ctx;
$("#ctx").innerHTML=`<label>Кабинет<select name="role">${opts(ROLES,c.role)}</select></label><label>Балабақша / ұйым<input name="org" value="${esc(c.org)}"></label><label>Топ атауы<input name="group" value="${esc(c.group)}"></label><label>Жас тобы<select name="age">${opts(AGE,c.age)}</select></label><label>Бағалау күні<input type="date" name="date" value="${c.date}"></label>`;
};
document.addEventListener("click",e=>{
const t=e.target.closest("button");
if(!t)return;
const d=t.dataset;
if(d.tab||d.go){tab=d.tab||d.go;msg="";return render(true)}
if(d.k){const v=+d.v;if(draft[d.k]===v)delete draft[d.k];else draft[d.k]=v;msg="";return render()}
if(d.age){ag=+d.age;return render()}
if(d.del){if(confirm("Бағалауды жою керек пе?")){db.items.splice(+d.del,1);save();render()}return}
if(d.act==="clear"){draft={};msg="";return render()}
if(d.act==="save"){
const c=db.ctx,tt=total(draft);
if(!c.org.trim()||!c.group.trim()){msg="Ұйым мен топ атауын толтырыңыз.";return render()}
if(tt==null){msg="Кемінде бір балл енгізіңіз.";return render()}
db.items.push({id:Date.now(),date:c.date,role:c.role,org:c.org.trim(),group:c.group.trim(),age:c.age,scores:Object.assign({},draft),subs:subs(draft),total:tt});
save();draft={};msg="";tab="dash";return render(true);
}
if(d.act==="wipe"){if(confirm("Барлық бағалауды жою керек пе?")){db.items=[];save();render()}return}
if(d.act==="json")return dl("orta-sapa.json",JSON.stringify(db.items,null,2),"application/json");
if(d.act==="csv"){
const h=["Күні","Ұйым","Топ","Жас тобы","Кабинет","Жалпы балл"].concat(SUB.map(s=>s.n));
const q=v=>`"${String(v).replace(/"/g,'""')}"`;
const rows=db.items.map(a=>[a.date,a.org,a.group,a.age,a.role,fmt(a.total)].concat(a.subs.map(fmt)).map(q).join(","));
dl("orta-sapa.csv","\ufeff"+[h.map(q).join(",")].concat(rows).join("\n"),"text/csv");
}
});
document.addEventListener("input",e=>{
const t=e.target;
if(t.name&&t.form&&t.form.id==="ctx"){db.ctx[t.name]=t.value;save();if(t.name==="role"&&tab==="hist")render()}
});
document.addEventListener("change",e=>{
const t=e.target,d=t.dataset;
if(d.sel){if(d.sel==="a")ca=+t.value;else cb=+t.value;render()}
if(d.c!==undefined){const i=+d.c;db.checks=t.checked?db.checks.concat(i):db.checks.filter(v=>v!==i);save();render()}
});
fillCtx();
render(true);
