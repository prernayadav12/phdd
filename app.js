/* PhD Application Season 2027: page logic. Data lives in data.js. */
PROGRAMS.forEach(p=>{const d=INTAKE[p.id]||{};p.term=d.term||"Fall 2027";p.intakes=d.intakes||["Fall"];p.iv=!!d.iv;p.itxt=d.itxt||""});
const TERMS=[["Any","Any start"],["Fall","Fall"],["Spring","Spring"],["Summer","Summer"],["Rolling","Flexible"]];
function intakeTxt(p){
  if(p.itxt)return p.itxt;
  const L=p.intakes.map(x=>x==="Rolling"?"Flexible start":x);
  if(!p.iv)return L.join(" + ")+" (other terms not listed)";
  if(p.intakes.length===1)return p.intakes[0]==="Rolling"?"Flexible start":L[0]+" only";
  return L.join(" + ");
}

const REGIONS=["All","US","UK","Europe","Canada","Asia","Middle East","Australia"];
const VTXT={confirmed:"Confirmed",annual:"Annual date",lastcycle:"Check date",estimate:"Check date"};
const state={region:"All",intake:"Any",hideDone:false,status:{},plan:{}};

function load(){try{const s=JSON.parse(localStorage.getItem("phd27")||"{}");state.status=s.status||{};state.plan=s.plan||{}}catch(e){}}
function cache(){try{localStorage.setItem("phd27",JSON.stringify({status:state.status,plan:state.plan}))}catch(e){}}

const DAY=86400000;
function daysLeft(iso){return Math.ceil((new Date(iso)-Date.now())/DAY)}
function fmtMonth(iso){return new Date(iso.slice(0,10)+"T12:00:00Z").toLocaleString("en-GB",{month:"long",year:"numeric",timeZone:"UTC"})}
function dd(iso){return iso.slice(8,10)}
function mon(iso){return new Date(iso.slice(0,10)+"T12:00:00Z").toLocaleString("en-GB",{month:"short",timeZone:"UTC"})}
function leftLabel(n){if(n<0)return{t:"Closed",c:"past"};if(n===0)return{t:"Today",c:"hot"};if(n===1)return{t:"1 day",c:"hot"};return{t:n+" days",c:n<=14?"hot":""}}
function esc(s){const d=document.createElement("div");d.textContent=s;return d.innerHTML}

function renderStrip(){
  const open=PROGRAMS.filter(p=>daysLeft(p.due)>=0&&state.status[p.id]!=="submitted"&&state.status[p.id]!=="skip").sort((a,b)=>new Date(a.due)-new Date(b.due));
  const nx=open[0];
  const in30=PROGRAMS.filter(p=>{const n=daysLeft(p.due);return n>=0&&n<=30}).length;
  const sub=PROGRAMS.filter(p=>state.status[p.id]==="submitted").length;
  document.getElementById("strip").innerHTML=
   `<div class="tile next"><div class="eyebrow">Next open deadline</div>${nx?`<div class="big">${leftLabel(daysLeft(nx.due)).t}</div><div class="what">${esc(nx.uni)} · ${esc(nx.name)}</div><div class="when">${dd(nx.due)} ${mon(nx.due)} · ${esc(nx.tz)}</div>`:`<div class="what">Everything is submitted or closed.</div>`}</div>
    <div class="tile"><div class="eyebrow">Closing in 30 days</div><div class="big">${in30}</div><div class="when">programs</div></div>
    <div class="tile"><div class="eyebrow">Submitted</div><div class="big">${sub}<span style="font-size:1rem;color:var(--muted)"> / ${PROGRAMS.length}</span></div><div class="when">tick them off below</div></div>`;
}

function renderFilters(){
  const f=document.getElementById("filters");
  f.innerHTML=`<span class="flabel">Region</span>`+REGIONS.map(r=>`<button class="chip" data-r="${r}" aria-pressed="${state.region===r}">${r}${r==="All"?"":" · "+PROGRAMS.filter(p=>p.region===r).length}</button>`).join("")+
   `<span class="spacer"></span><label><input type="checkbox" id="hideDone" ${state.hideDone?"checked":""}> Hide submitted and skipped</label>`+
   `<div class="frow"><span class="flabel">Start term</span>`+TERMS.map(([k,t])=>`<button class="chip" data-t="${k}" aria-pressed="${state.intake===k}">${t}${k==="Any"?"":" · "+PROGRAMS.filter(p=>p.intakes.includes(k)).length}</button>`).join("")+`</div>`;
  f.querySelectorAll(".chip[data-r]").forEach(b=>b.onclick=()=>{state.region=b.dataset.r;renderFilters();renderList()});
  f.querySelectorAll(".chip[data-t]").forEach(b=>b.onclick=()=>{state.intake=b.dataset.t;renderFilters();renderList()});
  document.getElementById("hideDone").onchange=e=>{state.hideDone=e.target.checked;renderList()};
}

function renderList(){
  const items=PROGRAMS.filter(p=>(state.region==="All"||p.region===state.region)&&(state.intake==="Any"||p.intakes.includes(state.intake))&&!(state.hideDone&&["submitted","skip"].includes(state.status[p.id])));
  // Soonest open deadline first; closed deadlines go to the end, most recently closed first.
  const now=Date.now();
  const open=items.filter(p=>new Date(p.due)>=now).sort((a,b)=>new Date(a.due)-new Date(b.due));
  const closed=items.filter(p=>new Date(p.due)<now).sort((a,b)=>new Date(b.due)-new Date(a.due));
  const groups={};open.forEach(p=>{const k=fmtMonth(p.due);(groups[k]=groups[k]||[]).push(p)});
  const section=(title,ps,extra="")=>`<div class="month ${extra}"><h2>${title}<span class="n">${ps.length} deadline${ps.length>1?"s":""}</span></h2><div class="rows">${ps.map(row).join("")}</div></div>`;
  const html=Object.entries(groups).map(([m,ps],i)=>section(i===0?`Up next · ${m}`:m,ps)).join("")+
    (closed.length?section("Already closed",closed,"closed"):"");
  const list=document.getElementById("list");
  list.innerHTML=html||`<p class="sub">No programs match this filter.</p>`;
  list.querySelectorAll("select").forEach(s=>s.onchange=()=>setStatus(s.dataset.id,s.value));
}
function row(p){
  const n=daysLeft(p.due),L=leftLabel(n),st=state.status[p.id]||"todo";
  const early=p.early?` · early ${dd(p.early)} ${mon(p.early)}`:"";
  return `<div class="row ${["submitted","skip"].includes(st)?"done":""}">
   <div class="date"><div class="d">${dd(p.due)}</div><div class="m">${mon(p.due)}</div><span class="left ${L.c}">${L.t}</span></div>
   <div class="prog"><div class="name"><a href="${p.url}" target="_blank" rel="noopener">${esc(p.name)}</a></div><div class="uni">${esc(p.uni)}</div>
    <div class="time">${esc(p.tz)}${early}${p.fee?" · fee "+esc(p.fee):""}</div>
    <div class="starts">Starts <strong>${esc(p.term)}</strong></div>
    <div class="meta"><span class="tag">${p.region}</span><span class="tag int">${esc(intakeTxt(p))}</span><span class="tag fund-${p.fund}">${esc(p.fundTxt)}</span><span class="tag v-${p.v}">${VTXT[p.v]}</span></div>
    <p class="note">${esc(p.note)}</p></div>
   <div class="status"><label class="st-label" for="st-${p.id}">Status</label><select id="st-${p.id}" data-id="${p.id}">
    ${[["todo","Not started"],["drafting","Drafting"],["submitted","Submitted"],["skip","Not applying"]].map(([v,t])=>`<option value="${v}" ${st===v?"selected":""}>${t}</option>`).join("")}
   </select></div></div>`;
}

function renderPlan(){
  const today=new Date().toISOString().slice(0,10);
  const nextIdx=PLAN.findIndex(s=>s.d>=today&&!state.plan[s.id]);
  document.getElementById("plan").innerHTML=PLAN.map((s,i)=>`<div class="step ${state.plan[s.id]?"done":""} ${i===nextIdx?"now":""}">
    <input type="checkbox" id="pl-${s.id}" data-id="${s.id}" ${state.plan[s.id]?"checked":""} aria-label="Mark done: ${esc(s.t)}">
    <div class="sd">${new Date(s.d+"T12:00:00Z").toLocaleString("en-GB",{weekday:"short",day:"numeric",month:"short",timeZone:"UTC"})}</div>
    <div class="body"><div class="st">${esc(s.t)}</div><div class="sx">${esc(s.x)}</div></div></div>`).join("");
  document.querySelectorAll("#plan input").forEach(c=>c.onchange=()=>setPlan(c.dataset.id,c.checked));
}

function setStatus(id,v){state.status[id]=v;cache();renderStrip();renderList()}
function setPlan(id,v){state.plan[id]=v;cache();renderPlan()}
function note(t){document.getElementById("saveNote").textContent=t}

document.getElementById("tab-programs").onclick=()=>tab("programs");
document.getElementById("tab-plan").onclick=()=>tab("plan");
function tab(t){["programs","plan"].forEach(k=>{document.getElementById("tab-"+k).setAttribute("aria-selected",k===t);document.getElementById("view-"+k).hidden=k!==t})}

document.getElementById("count").textContent=PROGRAMS.length;
load();renderStrip();renderFilters();renderList();renderPlan();
note("Your progress is saved in this browser. Use Export to back it up or move it to another device.");
document.getElementById("updated").textContent=UPDATED;

// Export and import progress as a JSON file (browser storage is per device and per browser).
document.getElementById("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify({app:"phd-tracker-2027",exported:new Date().toISOString(),status:state.status,plan:state.plan},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="phd-tracker-progress.json";
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  note("Progress exported as phd-tracker-progress.json.");
};
document.getElementById("importFile").onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(!d||typeof d!=="object"||typeof d.status!=="object"||typeof d.plan!=="object")throw new Error("shape");
      const ids=new Set(PROGRAMS.map(p=>p.id)),pids=new Set(PLAN.map(p=>p.id)),ok=["todo","drafting","submitted","skip"];
      let n=0;
      for(const [k,v] of Object.entries(d.status))if(ids.has(k)&&ok.includes(v)){state.status[k]=v;n++}
      for(const [k,v] of Object.entries(d.plan))if(pids.has(k)){state.plan[k]=!!v;n++}
      cache();renderStrip();renderFilters();renderList();renderPlan();
      note("Imported "+n+" saved item"+(n===1?"":"s")+" from "+f.name+".");
    }catch(err){note("That file isn't a tracker export. Choose a phd-tracker-progress.json file saved from this site.")}
    e.target.value="";
  };
  r.readAsText(f);
};
setInterval(renderStrip,60000);
// Re-sort every 10 minutes so a deadline that just passed moves to "Already closed".
setInterval(()=>{if(document.activeElement?.tagName!=="SELECT")renderList()},600000);
