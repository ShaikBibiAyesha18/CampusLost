(function(){
  var KEY='campuslost.items.v1';
  var CATS=['Electronics','Books & Notes','ID & Cards','Keys','Clothing','Bags','Accessories','Other'];
  var items=[],view='all';
  var $=function(s){return document.querySelector(s)};

  function today(){var d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
  function daysAgo(n){var d=new Date();d.setDate(d.getDate()-n);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  function load(){
    try{var r=localStorage.getItem(KEY);if(r){var a=JSON.parse(r);if(Array.isArray(a))return a}}catch(e){}
    return null;
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(items))}catch(e){toast('Could not save – storage is unavailable')}}
  function seed(){
    return [
      {id:'s1',type:'lost',name:'Black Casio calculator',category:'Electronics',location:'Exam Hall B',date:daysAgo(1),description:'fx-991 with a red sticker on the back.',contact:'rahul@college.edu',status:'open',created:Date.now()-1e5},
      {id:'s2',type:'found',name:'Set of keys with blue tag',category:'Keys',location:'Cafeteria',date:daysAgo(2),description:'Three keys on a ring, blue plastic tag marked 14B.',contact:'Security desk',status:'open',created:Date.now()-2e5},
      {id:'s3',type:'found',name:'Student ID card',category:'ID & Cards',location:'Bus stop near Gate 2',date:daysAgo(4),description:'ID card, 2nd year Mechanical.',contact:'9876500000',status:'open',created:Date.now()-3e5}
    ];
  }

  function fillSelects(){
    $('#category').innerHTML='<option value="">Select a category</option>'+CATS.map(function(c){return '<option>'+esc(c)+'</option>'}).join('');
    $('#fCat').innerHTML='<option value="">All categories</option>'+CATS.map(function(c){return '<option>'+esc(c)+'</option>'}).join('');
    $('#date').max=today();$('#date').value=today();
  }

  function filtered(){
    var q=$('#q').value.trim().toLowerCase(),cat=$('#fCat').value,sort=$('#fSort').value;
    var words=q?q.split(/\s+/):[];
    var out=items.filter(function(i){
      if(view==='lost'&&!(i.type==='lost'&&i.status==='open'))return false;
      if(view==='found'&&!(i.type==='found'&&i.status==='open'))return false;
      if(view==='resolved'&&i.status!=='resolved')return false;
      if(view==='all'&&false)return false;
      if(cat&&i.category!==cat)return false;
      var hay=(i.name+' '+i.category+' '+i.location+' '+i.description).toLowerCase();
      return words.every(function(w){return hay.indexOf(w)>-1});
    });
    out.sort(function(a,b){return sort==='old'?a.created-b.created:b.created-a.created});
    return out;
  }

  function render(){
    var open=function(t){return items.filter(function(i){return i.type===t&&i.status==='open'}).length};
    $('#sLost').textContent=open('lost');$('#sFound').textContent=open('found');
    $('#sDone').textContent=items.filter(function(i){return i.status==='resolved'}).length;
    var list=filtered(),el=$('#list');
    if(!list.length){
      el.innerHTML='<div class="empty">'+(items.length?'No items match your search. Try fewer keywords or clear the filters.':'Nothing posted yet. Use the form to report the first item.')+'</div>';return;
    }
    el.innerHTML=list.map(function(i){
      var done=i.status==='resolved';
      var badge=done?(i.type==='lost'?'Recovered':'Returned'):(i.type==='lost'?'Lost':'Found');
      var btn=done?'Reopen':(i.type==='lost'?'Mark as recovered':'Mark as returned');
      return '<article class="card '+i.type+(done?' resolved':'')+'">'+
        '<div class="top"><h3>'+esc(i.name)+'</h3><span class="badge">'+badge+'</span></div>'+
        '<div class="meta"><span>'+esc(i.category)+'</span><span>'+esc(i.location)+'</span><span>'+esc(i.date)+'</span></div>'+
        '<p class="desc">'+esc(i.description)+'</p>'+
        '<div class="meta"><span>Contact: '+esc(i.contact)+'</span></div>'+
        '<div class="actions"><button class="btn ghost" data-act="toggle" data-id="'+i.id+'">'+btn+'</button>'+
        '<button class="btn ghost del" data-act="del" data-id="'+i.id+'">Delete</button></div></article>';
    }).join('');
  }

  function toast(m){var t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove('show')},2200)}

  var rules={
    name:function(v){return v.length<3?'Enter an item name (at least 3 characters).':''},
    category:function(v){return v?'':'Choose a category.'},
    location:function(v){return v.length<3?'Enter where it was lost or found.':''},
    date:function(v){if(!v)return 'Pick a date.';return v>today()?'The date cannot be in the future.':''},
    description:function(v){return v.length<10?'Add at least 10 characters so the owner can identify it.':''},
    contact:function(v){
      if(!v)return 'Enter an email or phone number.';
      var email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),phone=/^[+\d][\d\s-]{6,}$/.test(v);
      return (email||phone||v.length>=4&&/[a-z]/i.test(v)&&!/@/.test(v))?'':'Enter a valid email or phone number.';
    }
  };
  function check(f){
    var v=f.value.trim(),msg=rules[f.name](v);
    f.classList.toggle('bad',!!msg);
    document.querySelector('.err[data-for="'+f.name+'"]').textContent=msg;
    return !msg;
  }

  $('#form').addEventListener('input',function(e){if(e.target.name&&rules[e.target.name]&&e.target.classList.contains('bad'))check(e.target)});
  $('#form').addEventListener('submit',function(e){
    e.preventDefault();
    var form=e.target,ok=true,first=null;
    Object.keys(rules).forEach(function(n){var f=form.elements[n];if(!check(f)){ok=false;if(!first)first=f}});
    if(!ok){first.focus();return}
    items.unshift({
      id:'i'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
      type:form.elements.type.value,
      name:form.elements.name.value.trim(),category:form.elements.category.value,
      location:form.elements.location.value.trim(),date:form.elements.date.value,
      description:form.elements.description.value.trim(),contact:form.elements.contact.value.trim(),
      status:'open',created:Date.now()
    });
    save();form.reset();$('#date').value=today();render();toast('Item posted');
  });

  $('#list').addEventListener('click',function(e){
    var b=e.target.closest('button[data-act]');if(!b)return;
    var id=b.dataset.id,i=items.find(function(x){return x.id===id});if(!i)return;
    if(b.dataset.act==='toggle'){
      i.status=i.status==='resolved'?'open':'resolved';save();render();
      toast(i.status==='resolved'?'Marked as '+(i.type==='lost'?'recovered':'returned'):'Item reopened');
    }else if(confirm('Delete "'+i.name+'"? This cannot be undone.')){
      items=items.filter(function(x){return x.id!==id});save();render();toast('Item deleted');
    }
  });

  $('#tabs').addEventListener('click',function(e){
    var t=e.target.closest('.tab');if(!t)return;
    view=t.dataset.v;
    document.querySelectorAll('.tab').forEach(function(x){x.setAttribute('aria-pressed',x===t)});
    render();
  });
  ['#q','#fCat','#fSort'].forEach(function(s){$(s).addEventListener('input',render)});

  fillSelects();
  items=load()||seed();
  save();render();
})();
