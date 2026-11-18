(() => {
  const byId = id => document.getElementById(id);
  const positions = {browser:[71,147,'Browser','Laptop'], nginx:[242,147,'Nginx','Public EC2'], dashboard:[466,62,'Dashboard','Private EC2 1'], api:[466,205,'Flask API','Private EC2 2'], db:[594,205,'SQLite','Local disk']};
  const read = [
    ['browser','nginx','GET /api/employees','The JavaScript running in your browser asks Nginx for the employee list.'],
    ['nginx','api','Forward API request','Nginx sends the request to Flask on port 8001 of Private Server 2.'],
    ['api','db','SELECT employees','Flask reads the shared employee table from the SQLite file on the same instance.'],
    ['db','api','Return rows','SQLite returns the stored rows to Flask.'],
    ['api','nginx','200 OK · JSON','Flask converts the rows into a JSON list and sends it to Nginx.'],
    ['nginx','browser','Display employees','Nginx delivers the JSON. The browser uses it to update the directory.']
  ];
  const flows = { load:[
    ['browser','nginx','GET /employees/','Your browser requests the dashboard from the public Nginx address.'],
    ['nginx','dashboard','Forward page request','Nginx routes /employees/ to the dashboard folder on Private Server 1, port 8000.'],
    ['dashboard','nginx','200 OK · HTML','Private Server 1 sends the dashboard HTML back to Nginx.'],
    ['nginx','browser','Load dashboard','The browser receives the page and loads its CSS and JavaScript through the same route.'],...read],
    save:[
    ['browser','nginx','POST /api/employees','Clicking Save sends the employee name, role, department and status as JSON.'],
    ['nginx','api','Forward employee details','Nginx forwards the POST to Flask on Private Server 2.'],
    ['api','db','INSERT employee','Flask validates the form and inserts the new employee into SQLite.'],
    ['db','api','Commit row','SQLite saves the record and supplies its employee ID.'],
    ['api','nginx','201 Created','Flask returns the saved employee and its ID through Nginx.'],
    ['nginx','browser','Confirm save','The browser receives confirmation, closes the form and requests the updated list.'],...read]};
  const actors = {
    browser:['📱','Your phone','Where you order'],
    nginx:['🛎️','Order counter','Sends messages to the right place'],
    dashboard:['📖','Menu desk','Provides the page you see'],
    api:['👩‍🍳','Order team','Checks and saves orders'],
    db:['📒','Order book','Keeps each order']
  };
  const reading = [
    ['Check your orders','Order list?','Your phone asks for the latest orders.','✉️'],
    ['Send the question','Order list?','The counter passes the question to the order team.','✉️'],
    ['Check the order book','Look up orders','The team looks up the saved orders.','🔎'],
    ['Find the saved orders','Saved orders','The book gives the team the saved order details.','📋'],
    ['Send back the orders','Order list','The team sends the list back through the counter.','📋'],
    ['See the order on your phone','Order list','The latest order appears on your phone.','📋']
  ];
  const stories = {
    load:[
      ['Open your orders','Open page','You tap My orders on your phone.','✉️'],
      ['Find the page','Page request','The counter asks the menu desk for the page layout.','✉️'],
      ['Send the page','Page layout','The desk sends back the page layout.','📄'],
      ['Show the page','Page layout','Your phone opens the page and gets ready to show your orders.','📄'],...reading],
    save:[
      ['Tap Place order','1 cheese pizza','You pick a cheese pizza and tap Place order.','🍕'],
      ['Pass along your order','1 cheese pizza','The counter forwards your order to the order team.','🍕'],
      ['Write down the order','1 cheese pizza','The team checks the order and writes it into the order book.','📝'],
      ['Get an order number','Order #104','The order is saved as number 104.','✅'],
      ['Send the confirmation','Order #104','The order team sends confirmation back to the counter.','✅'],
      ['See Order placed','Order #104','Your phone shows Order placed and checks the latest order list.','✅'],...reading]
  };
  function renderScreen(){
    const saving=byId('scenario').value==='save';
    const screen=byId('screen');
    if(saving && index<5){
      screen.innerHTML='<small>Your basket</small><h3>🍕 Cheese pizza</h3><p>Quantity: 1</p><div class="screenstate">Sending your order…</div>';
    }else if(index===steps().length-1){
      screen.innerHTML='<small>My orders</small><h3>Cheese pizza</h3><div class="screenrow newrow">Order #104 <small>Order placed ✓</small></div>';
    }else{
      screen.innerHTML='<small>My orders</small><h3>'+(saving?'Order placed ✓':'Opening your orders…')+'</h3><div class="placeholder"></div><div class="placeholder"></div>';
    }
  }
  const map=byId('map');
  function svg(tag,attrs,parent=map){
    const e=document.createElementNS('http://www.w3.org/2000/svg',tag);
    for(const [k,v] of Object.entries(attrs))e.setAttribute(k,v);
    parent.append(e);return e;
  }
  const edges=[['browser','nginx'],['nginx','dashboard'],['nginx','api'],['api','db']];
  for(const [from,to] of edges){
    const [x1,y1]=positions[from], [x2,y2]=positions[to];
    svg('line',{x1,y1,x2,y2,stroke:'#638478','stroke-width':2,'stroke-dasharray':'4 4'});
  }
  const nodes={};
  for(const [key,[x,y,title,sub]] of Object.entries(positions)){
    const g=svg('g',{class:'mapnode',transform:'translate('+x+' '+y+')'});nodes[key]=g;
    const w=key==='db'?76:112;
    svg('rect',{x:-w/2,y:-30,width:w,height:60,rx:10,fill:'#23483e',stroke:'#769485'},g);
    svg('text',{y:-2,'font-size':17,'font-weight':700},g).textContent=title;
    svg('text',{y:16,'font-size':12},g).textContent=sub;
  }
  const dot=svg('circle',{r:6,fill:'#e0ff85',stroke:'#183a2f','stroke-width':2});
  let index=0, progress=0, playing=false, frame=0, last=0, finished=false;
  const steps=()=>flows[byId('scenario').value];
  function paint(){
    const [from,to]=steps()[index];
    byId('parcel').style.left=(progress*100)+'%';
    const [x,y]=positions[from], [x2,y2]=positions[to];
    // Travel between the two card edges so the marker is always visible.
    const fraction=k=>Math.min((k==='db'?38:56)/Math.abs(x2-x),30/Math.abs(y2-y));
    const f=fraction(from)+(1-fraction(from)-fraction(to))*progress;
    dot.setAttribute('cx',x+(x2-x)*f);dot.setAttribute('cy',y+(y2-y)*f);
  }
  function show(){
    const [from,to,title,detail]=steps()[index];
    for(const [key,g] of Object.entries(nodes))g.classList.toggle('active',key===from||key===to);
    const [headline,cargo,caption,icon]=stories[byId('scenario').value][index];
    for(const [side,key] of [['left',from],['right',to]]){
      const [symbol,name,job]=actors[key];
      byId(side+'icon').textContent=symbol;
      byId(side+'name').textContent=name;
      byId(side+'job').textContent=job;
    }
    byId('cargo').textContent=cargo;byId('parcel').textContent=icon;
    byId('message').textContent=headline;byId('explain').textContent=caption;
    byId('tech').textContent=title+' — '+detail;
    byId('stepcount').textContent='MOMENT '+(index+1)+' OF '+steps().length;
    renderScreen();
    byId('prev').disabled=index===0;byId('next').disabled=index===steps().length-1;
    [...byId('events').children].forEach((e,i)=>{if(i===index)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current')});
    byId('play').textContent=playing?'Pause':finished?'Replay':'Play';paint();
  }
  function stop(){playing=false;cancelAnimationFrame(frame)}
  function tick(now){
    progress=Math.min(1,progress+(now-last)/5200);last=now;paint();
    if(progress>=1){
      if(index===steps().length-1){stop();finished=true;show();return}
      index++;progress=0;show();
    }
    frame=requestAnimationFrame(tick);
  }
  function start(){playing=true;last=performance.now();show();frame=requestAnimationFrame(tick)}
  function select(i){stop();index=i;progress=0;finished=false;show()}
  function scenario(){
    document.querySelector('.wfhead p').textContent=byId('scenario').value==='save'?'Follow a cheese pizza order from the moment you tap Place order to the confirmation on your phone.':'See how your phone finds a pizza order you placed earlier.';
    document.querySelector('.wfhead h1').textContent=byId('scenario').value==='save'?'What happens when you order a pizza?':'How does your phone find your order?';
    byId('events').replaceChildren(...steps().map((s,i)=>{
      const e=document.createElement('button');e.className='event';
      const num=document.createElement('b');num.textContent=String(i+1).padStart(2,'0');
      e.append(num,stories[byId('scenario').value][i][0]);e.onclick=()=>select(i);return e;
    }));select(0);
  }
  byId('play').onclick=()=>{if(playing){stop();show()}else{if(finished)select(0);start()}};
  byId('restart').onclick=()=>{select(0);start()};
  byId('next').onclick=()=>select(index+1);byId('prev').onclick=()=>select(index-1);
  byId('scenario').onchange=scenario;
  function view(){
    const directory=location.hash==='#directory';
    byId('workflow').hidden=directory;byId('directory').hidden=!directory;
    document.querySelectorAll('.viewnav a').forEach(a=>{if(a.hash===(directory?'#directory':'#workflow'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
    if(directory){stop();show()}
  }
  scenario();view();window.addEventListener('hashchange',view);
  // Let the viewer start the story when ready.
})();
