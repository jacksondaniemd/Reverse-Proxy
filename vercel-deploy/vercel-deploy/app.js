const el = id => document.getElementById(id);
const seed = [
  ['Ananya Rao','Product designer','Design','Active'],
  ['Arjun Nair','Backend engineer','Engineering','Active'],
  ['Diya Shah','People partner','People','On leave'],
  ['Ishan Patel','Data analyst','Analytics','Active'],
  ['Meera Iyer','Frontend engineer','Engineering','Active'],
  ['Rohan Das','Product manager','Product','Active']
].map(([name,role,department,status])=>({name,role,department,status}));
const colors=['#dce7c5','#e4dfef','#f2dcce','#d5e7e7'];
const key='roster-directory-v1';
const preview=()=>JSON.parse(localStorage.getItem(key)||'null')??seed;
let employees=[];
el('mode').textContent=window.ROSTER_API?'EC2 workspace':'Browser demo';
function render(){
  const depts=[...new Set(employees.map(e=>e.department))].sort();
  const chosen=el('filter').value;
  el('filter').replaceChildren(new Option('All departments',''),...depts.map(d=>new Option(d,d)));
  el('filter').value=depts.includes(chosen)?chosen:'';
  el('deptOptions').replaceChildren(...depts.map(d=>new Option(d,d)));
  el('total').textContent=employees.length;
  el('active').textContent=employees.filter(e=>e.status==='Active').length;
  el('departments').textContent=depts.length;
  const q=el('search').value.toLowerCase().trim();
  const visible=employees.filter(e=>(!el('filter').value||e.department===el('filter').value)&&(e.name+' '+e.role).toLowerCase().includes(q));
  el('rows').replaceChildren();
  visible.forEach(e=>{
    const row=el('rows').insertRow();
    const name=row.insertCell();
    const avatar=document.createElement('span');
    avatar.className='avatar';
    avatar.setAttribute('aria-hidden','true');
    avatar.style.background=colors[e.name.codePointAt(0)%colors.length];
    avatar.textContent=e.name.split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase();
    name.append(avatar,e.name);
    row.insertCell().textContent=e.role;
    row.insertCell().textContent=e.department;
    const badge=document.createElement('span');
    badge.className='status'+(e.status==='On leave'?' leave':'');
    badge.textContent=e.status;
    row.insertCell().append(badge);
  });
  el('count').textContent=visible.length?'Showing '+visible.length+' of '+employees.length+' employees':employees.length?'No employees match these filters.':'No employees yet. Add your first employee.';
}
let latest=0;
async function refresh(){
  const request=++latest;
  try{
    let next;
    if(window.ROSTER_API){
      const r=await fetch('/api/employees',{cache:'no-store'});
      if(!r.ok) throw Error();
      next=await r.json();
    }else next=preview();
    if(request!==latest)return;
    employees=next;el('notice').textContent='';render();
  }catch{if(request===latest)el('notice').textContent='Directory could not refresh. Check the connection and try again.'}
}
el('add').onclick=()=>{el('error').textContent='';el('editor').showModal()};
el('cancel').onclick=()=>el('editor').close();
el('search').oninput=render;el('filter').onchange=render;
el('form').onsubmit=async event=>{
  event.preventDefault();
  const form=event.currentTarget;
  const data=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,v.trim()]));
  if(Object.values(data).some(v=>!v)){el('error').textContent='Complete every field.';return}
  el('save').disabled=true;
  try{
    if(window.ROSTER_API){
      const r=await fetch('/api/employees',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      if(!r.ok)throw Error();
    }else localStorage.setItem(key,JSON.stringify([...preview(),data]));
    form.reset();el('editor').close();el('search').value='';el('filter').value='';await refresh();
  }catch{el('error').textContent='Could not save the employee. Please try again.'}
  finally{el('save').disabled=false}
};
refresh();
if(window.ROSTER_API)setInterval(refresh,5000);
else window.addEventListener('storage',refresh);
