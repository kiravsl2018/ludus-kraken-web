(function(){
  var WA='34663782477';
  var works=window.WORKS||[];
  /* idioma de la página: los textos que crea este script salen en español o en inglés */
  var EN=document.documentElement.lang==='en';
  function L(es,en){return EN?en:es}
  var SN={'Todos':'All','Realismo':'Realism','Ilustrativo':'Illustrative','Color':'Colour'};
  function SL(s){return EN&&SN[s]||s}
  function byId(id){for(var i=0;i<works.length;i++) if(works[i].id===id) return works[i]}
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return [].slice.call((c||document).querySelectorAll(s))}
  function imgTag(w,cls,sizes){
    var srcset=w.src!==w.full?' srcset="'+w.src+' '+w.w+'w, '+w.full+' '+w.fw+'w" sizes="'+(sizes||'300px')+'"':'';
    return '<img'+(cls?' class="'+cls+'"':'')+' src="'+w.src+'"'+srcset+' width="'+w.w+'" height="'+w.h+'" alt="'+w.t.replace(/"/g,'&quot;')+'" loading="lazy" draggable="false">';
  }

  /* ---------- Cada página empieza arriba ---------- */
  // El navegador (y la vista previa) intentan recordar el scroll de la página anterior; lo forzamos a cero salvo que se pida un ancla.
  if('scrollRestoration' in history) history.scrollRestoration='manual';
  function toTop(){
    var h=location.hash; if(h&&h.length>1&&document.getElementById(h.slice(1))) return;
    var root=document.documentElement, prev=root.style.scrollBehavior;
    root.style.scrollBehavior='auto'; scrollTo(0,0); document.body.scrollTop=0;
    requestAnimationFrame(function(){scrollTo(0,0); root.style.scrollBehavior=prev});
  }
  toTop();
  addEventListener('pageshow',function(e){toTop()});
  addEventListener('load',toTop);

  /* ---------- Navegación ---------- */
  var nav=$('#nav'), mb=$('#menuBtn'), prog=$('#progress');
  function onScroll(){
    if(nav) nav.classList.toggle('scrolled',scrollY>20);
    if(prog){var h=document.documentElement.scrollHeight-innerHeight; prog.style.transform='scaleX('+(h>0?scrollY/h:0)+')'}
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();
  if(mb) mb.addEventListener('click',function(){var o=nav.classList.toggle('menu-open'); mb.setAttribute('aria-expanded',o)});
  var page=document.body.dataset.page;
  $$('#menu a').forEach(function(a){if(a.dataset.p===page) a.setAttribute('aria-current','page')});

  // Transición suave entre páginas (si el navegador no hace view transitions)
  if(!('onpagereveal' in window)){
    document.addEventListener('click',function(e){
      var a=e.target.closest('a'); if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||a.target==='_blank') return;
      var href=a.getAttribute('href')||'';
      if(!/^[a-z-]+\.html(#.*)?$/.test(href)) return;
      if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      e.preventDefault(); document.body.classList.add('leaving');
      setTimeout(function(){location.href=href},220);
    });
    addEventListener('pageshow',function(){document.body.classList.remove('leaving')});
  }

  /* ---------- Aparición al hacer scroll ---------- */
  if('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.remove('pre'); io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
    $$('.reveal').forEach(function(el,i){
      if(el.getBoundingClientRect().top>innerHeight){el.classList.add('pre'); el.style.transitionDelay=(i%3)*90+'ms'; io.observe(el)}
    });
  }

  /* ---------- Visor ampliado ---------- */
  var lb=$('#lightbox'), lbImg=$('#lbImg'), lbCap=$('#lbCap'), lbCount=$('#lbCount'), stage=$('#lbStage');
  var list=[], pos=0, lastFocus=null, galleryList=null;
  function show(){stage.classList.remove('zoom'); var w=list[pos]; lbImg.src=w.full; lbImg.alt=w.t; lbCap.textContent=w.t+(w.a?' · '+w.a:''); lbCount.textContent=SL(w.s)+' · '+(pos+1)+' / '+list.length}
  function open(id,from){
    list=(from&&from.length)?from:works.filter(function(w){return w.g});
    pos=Math.max(0,list.findIndex(function(w){return w.id===id}));
    show(); lastFocus=document.activeElement; lb.inert=false; lb.classList.add('open'); lb.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; $('#lbClose').focus();
  }
  function close(){lb.classList.remove('open'); lb.setAttribute('aria-hidden','true'); lb.inert=true; document.body.style.overflow=''; if(lastFocus) lastFocus.focus()}
  function step(d){pos=(pos+d+list.length)%list.length; show()}
  if(lb){
    lb.inert=true;
    lb.addEventListener('keydown',function(e){
      if(e.key!=='Tab') return;
      var f=$$('button',lb), first=f[0], last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault(); last.focus()}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault(); first.focus()}
    });
    stage.addEventListener('click',function(e){
      if(e.target!==lbImg){close(); return}
      var r=lbImg.getBoundingClientRect();
      lbImg.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%';
      stage.classList.toggle('zoom');
    });
    $('#lbClose').onclick=close; $('#lbPrev').onclick=function(){step(-1)}; $('#lbNext').onclick=function(){step(1)};
    lb.addEventListener('click',function(e){if(e.target===lb) close()});
    document.addEventListener('keydown',function(e){if(!lb.classList.contains('open')) return; if(e.key==='Escape') close(); if(e.key==='ArrowRight') step(1); if(e.key==='ArrowLeft') step(-1)});
    var tx=null; lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){if(tx===null) return; var dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>50) step(dx<0?1:-1); tx=null});
  }
  // Cualquier elemento con data-open abre el visor con las fotos de su grupo
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-open]'); if(!b||!lb) return;
    if(b.closest('.reel.moved')) return;
    var grp=b.closest('[data-group]'), ids;
    if(grp&&grp.dataset.group==='all') ids=null;
    else if(grp) ids=$$('[data-open]',grp).map(function(x){return x.dataset.open}).filter(function(v,i,a){return a.indexOf(v)===i});
    open(b.dataset.open, ids?ids.map(byId).filter(Boolean):(b.closest('#gallery')&&galleryList?galleryList():null));
  });

  /* ---------- Carruseles ---------- */
  $$('[data-reel]').forEach(function(box){
    var reel=$('.reel',box), bar=$('.reel-bar i',box), rc=$('.reel-count',box), slides=$$('.slide',reel);
    if(!slides.length) return;
    function sw(){return slides[0].getBoundingClientRect().width+parseFloat(getComputedStyle(reel).columnGap||16)}
    function upd(){var max=reel.scrollWidth-reel.clientWidth, f=max>0?reel.scrollLeft/max:0, vis=reel.clientWidth/reel.scrollWidth; if(bar){bar.style.width=(vis*100)+'%'; bar.style.transform='translateX('+(f*(1/vis-1)*100)+'%)'} if(rc){var i=Math.min(slides.length,Math.round(reel.scrollLeft/sw())+1); rc.textContent=('0'+i).slice(-2)+' / '+('0'+slides.length).slice(-2)}}
    reel.addEventListener('scroll',upd,{passive:true}); addEventListener('resize',upd); upd();
    var p=$('.reel-prev',box), n=$('.reel-next',box);
    if(p) p.onclick=function(){reel.scrollBy({left:-sw(),behavior:'smooth'})};
    if(n) n.onclick=function(){reel.scrollBy({left:sw(),behavior:'smooth'})};
    reel.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();reel.scrollBy({left:sw(),behavior:'smooth'})} if(e.key==='ArrowLeft'){e.preventDefault();reel.scrollBy({left:-sw(),behavior:'smooth'})}});
    var down=false,sx=0,sl=0;
    reel.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse') return; down=true; reel.classList.remove('moved'); sx=e.clientX; sl=reel.scrollLeft});
    addEventListener('pointermove',function(e){if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>5){reel.classList.add('dragging','moved')} reel.scrollLeft=sl-dx});
    addEventListener('pointerup',function(){if(!down) return; down=false; reel.classList.remove('dragging'); if(reel.classList.contains('moved')){var i=Math.round(reel.scrollLeft/sw()); reel.scrollTo({left:i*sw(),behavior:'smooth'}); setTimeout(function(){reel.classList.remove('moved')},50)}});
  });

  /* ---------- Muro animado (portfolio) ---------- */
  $$('[data-wall]').forEach(function(wall){
    var g=works.filter(function(w){return w.g}), rows=[[],[]];
    g.forEach(function(w,i){rows[i%2].push(w)});
    wall.innerHTML=rows.map(function(r,i){var h=r.map(function(w){return '<button data-open="'+w.id+'" tabindex="-1" aria-label="'+L('Ampliar ','Enlarge ')+w.t+'">'+imgTag(w,'','(max-width:640px) 160px, 260px')+'</button>'}).join(''); return '<div class="wall-row'+(i?' rev':'')+'">'+h+h+'</div>'}).join('');
  });

  var wt=$('#wallToggle');
  if(wt) wt.addEventListener('click',function(){var w=$('[data-wall]'), on=w.classList.toggle('paused'); wt.setAttribute('aria-pressed',on); wt.textContent=on?L('Reanudar muro','Resume wall'):L('Pausar muro','Pause wall')});
  var still=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Galería filtrable ---------- */
  var gal=$('#gallery'), fil=$('#filters');
  if(gal){
    var styles=['Todos','Realismo','Ilustrativo','Fine Line','Color','Lettering'], PAGE=16, shown=PAGE, current='Todos';
    var gw=works.filter(function(w){return w.g});
    /* las piezas vienen en el HTML (indexables); si faltan, se crean desde WORKS */
    if(!$('.piece',gal)) gw.forEach(function(w){
      var f=document.createElement('figure');
      f.className='piece'; f.tabIndex=0; f.dataset.style=w.s; f.dataset.open=w.id;
      f.setAttribute('role','button'); f.setAttribute('aria-label',L('Ampliar: ','Enlarge: ')+w.t);
      f.innerHTML=imgTag(w,'','(max-width:640px) 48vw, (max-width:1000px) 31vw, 300px')+'<figcaption><span>'+w.t+(w.a?' <em>'+w.a+'</em>':'')+'</span><span>'+SL(w.s)+'</span></figcaption>';
      gal.appendChild(f);
    });
    var moreBtn=$('#moreBtn');
    galleryList=function(){return gw.filter(function(w){return current==='Todos'||w.s===current})};
    function apply(){
      var n=0,total=0;
      $$('.piece',gal).forEach(function(p){var m=current==='Todos'||p.dataset.style===current; if(m) total++; p.classList.toggle('is-hidden',!m||++n>shown)});
      if(moreBtn) moreBtn.parentNode.hidden=total<=shown;
      $$('button',fil).forEach(function(x){x.setAttribute('aria-pressed',x.dataset.style===current?'true':'false')});
      $$('.spot').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.style===current?'true':'false')});
    }
    styles.forEach(function(s){
      var n=gw.filter(function(w){return s==='Todos'||w.s===s}).length;
      var b=document.createElement('button'); b.type='button'; b.dataset.style=s; b.innerHTML=SL(s)+'<span class="count">'+n+'</span>'; fil.appendChild(b);
    });
    window.setStyle=function(s,scroll){current=s; shown=PAGE; apply(); if(scroll) $('#portfolio-grid').scrollIntoView({behavior:'smooth'})};
    document.querySelectorAll('[data-go-style]').forEach(function(b){b.addEventListener('click',function(){setStyle(b.dataset.goStyle,true)})});
    fil.addEventListener('click',function(e){var b=e.target.closest('button'); if(b) setStyle(b.dataset.style)});
    if(moreBtn) moreBtn.addEventListener('click',function(){shown+=PAGE; apply()});
    gal.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.classList.contains('piece')){e.preventDefault(); e.target.click()}});
    apply();
  }

  /* ---------- Tarjetas por estilo con fundido ---------- */
  $$('.spot').forEach(function(card,ci){
    var s=card.dataset.style, items=works.filter(function(w){return w.g&&w.s===s}).slice(0,6);
    $('.lab span',card).textContent=items.length?works.filter(function(w){return w.g&&w.s===s}).length+' piezas':'';
    card.insertAdjacentHTML('afterbegin',items.map(function(w,i){return imgTag(w,i?'':'on','(max-width:640px) 48vw, 260px')}).join(''));
    var imgs=$$('img',card), k=0;
    var hover=false; card.addEventListener('mouseenter',function(){hover=true}); card.addEventListener('mouseleave',function(){hover=false});
    if(imgs.length>1&&!still) setTimeout(function(){setInterval(function(){if(hover||document.hidden) return; imgs[k].classList.remove('on'); k=(k+1)%imgs.length; imgs[k].classList.add('on')},3200)},ci*650);
    card.addEventListener('click',function(){if(window.setStyle) setStyle(s,true)});
  });

  /* ---------- Selector de servicios ---------- */
  var swl=$('#swList');
  if(swl){
    var frame=$('#swFrame'), bar=$('#swBar'), timer=null;
    function pick(btn){
      $$('button',swl).forEach(function(b){b.setAttribute('aria-selected',b===btn?'true':'false'); b.tabIndex=b===btn?0:-1});
      $('#swPanel').setAttribute('aria-labelledby',btn.id);
      $('#swTitle').textContent=btn.dataset.title; $('#swDesc').textContent=btn.dataset.desc;
      $('#swFor').textContent=btn.dataset.for; $('#swSize').textContent=btn.dataset.size;
      var ids=(btn.dataset.imgs||'').split(',').filter(Boolean);
      clearInterval(timer);
      if(!ids.length){frame.innerHTML='<div class="noimg"><div><svg viewBox="0 0 48 48"><path d="M8 36l10-10 8 8 14-14"/><path d="M30 20h10v10"/></svg>'+L('Tráenos una foto de tu tatuaje y te decimos cómo cubrirlo o renovarlo.','Bring us a photo of your tattoo and we will tell you how to cover or refresh it.')+'</div></div>'; return}
      frame.innerHTML=ids.map(function(id,i){var w=byId(id); var t=imgTag(w,i?'':'on','(max-width:640px) 90vw, 320px').replace('<img','<img data-open="'+id+'"'); return i?t:t.replace(' loading="lazy"','')}).join('')+'<div class="sw-bar"><i></i></div>';
      frame.dataset.group=ids.join(',');
      var imgs=$$('img',frame), k=0, bi=$('.sw-bar i',frame);
      function run(){bi.classList.remove('run'); void bi.offsetWidth; bi.classList.add('run')}
      if(still||imgs.length<2){bi.parentNode.hidden=true; return}
      run();
      timer=setInterval(function(){if(frame.matches(':hover')) return; imgs[k].classList.remove('on'); k=(k+1)%imgs.length; imgs[k].classList.add('on'); run()},3400);
    }
    swl.addEventListener('click',function(e){var b=e.target.closest('button'); if(b) pick(b)});
    swl.addEventListener('keydown',function(e){
      var tabs=$$('button',swl), i=tabs.indexOf(document.activeElement), j=-1;
      if(i<0) return;
      if(e.key==='ArrowDown'||e.key==='ArrowRight') j=(i+1)%tabs.length;
      else if(e.key==='ArrowUp'||e.key==='ArrowLeft') j=(i-1+tabs.length)%tabs.length;
      else if(e.key==='Home') j=0; else if(e.key==='End') j=tabs.length-1;
      if(j<0) return;
      e.preventDefault(); tabs[j].focus(); pick(tabs[j]);
    });
    pick($('button',swl));
  }

  /* ---------- Mapa ---------- */
  var top=true; try{top=window.top===window.self}catch(e){top=false}
  $$('[data-map]').forEach(function(box){
    if(!top) return; // dentro de una vista previa embebida no se puede cargar el mapa de Google
    var f=document.createElement('iframe');
    f.src='https://www.google.com/maps?q=Ludus+Kraken+Tattoo,+C.+Miguel+de+Mar%C3%ADa+Luque+6,+29680+Estepona&z=16&output=embed';
    f.loading='lazy'; f.title='Mapa de Ludus Kraken Tattoo en Estepona'; f.referrerPolicy='no-referrer-when-downgrade';
    box.insertBefore(f,box.firstChild); box.classList.add('live');
  });

  /* ---------- Horario: abierto ahora ---------- */
  $$('[data-now]').forEach(function(el){
    /* hora de Estepona, aunque quien mira la web esté en otro país */
    var d=new Date(), day=d.getDay(), m=d.getHours()*60+d.getMinutes();
    try{
      var parts={}; new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(d).forEach(function(x){parts[x.type]=x.value});
      day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(parts.weekday); m=(+parts.hour)*60+(+parts.minute);
    }catch(e){}
    var open=day>=1&&day<=5&&((m>=600&&m<840)||(m>=1020&&m<1230));
    el.innerHTML='<i class="dot'+(open?' open':'')+'"></i>'+(open?L('Abierto ahora','Open now'):L('Cerrado ahora','Closed now'));
  });

  /* ---------- Formulario de cita ---------- */
  var form=$('#bookingForm');
  if(form){
    var note=$('#formNote'), mailBtn=$('#mailBtn'), fileIn=$('#f-file'), drop=$('#drop'), thumb=$('#thumb'), dropText=$('#dropText');
    var sendBtn=$('button[type=submit]',form);
    // contador de la idea (máximo 500 caracteres, una explicación media o larga)
    var idea=$('#f-idea'), ideaCount=$('#ideaCount');
    if(idea&&ideaCount){var max=+idea.getAttribute('maxlength')||500; function cnt(){var n=idea.value.length; ideaCount.textContent=n+' / '+max; ideaCount.classList.toggle('near',n>=max*.9)} idea.addEventListener('input',cnt); cnt()}
    /* Subida de la foto (opcional). Con una carpeta de Cloudinary y un "upload preset" sin firma,
       la foto se sube al enviar y el enlace va dentro del mensaje de WhatsApp. Vacío = desactivado. */
    var UPLOAD={cloud:'',preset:'',folder:'reservas-web'};
    var photoUrl='', canUpload=!!(UPLOAD.cloud&&UPLOAD.preset);
    // sin subida: casilla "tengo fotos" y se adjuntan en el chat; con subida: campo para elegir la foto
    $('#photoField').hidden=!canUpload; $('#refHint').hidden=canUpload;
    function file(){return canUpload&&fileIn.files&&fileIn.files[0]}
    function refs(){return !!(file()||$('#f-refs').checked)}
    function setFile(f){if(!f||!/^image\//.test(f.type)) return; photoUrl=''; var r=new FileReader(); r.onload=function(){thumb.innerHTML='<img alt="" src="'+r.result+'">'}; r.readAsDataURL(f); dropText.innerHTML='<strong>'+f.name.replace(/[<>&"]/g,'')+'</strong><br>'+L('Lista para enviar con tu mensaje.','Ready to send with your message.')}
    fileIn.addEventListener('change',function(){setFile(file())});
    ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault(); drop.classList.add('over')})});
    ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault(); drop.classList.remove('over')})});
    drop.addEventListener('drop',function(e){var f=e.dataTransfer.files[0]; if(f){try{var dt=new DataTransfer(); dt.items.add(f); fileIn.files=dt.files}catch(err){} setFile(f)}});
    function message(){
      var d=new FormData(form), tbd=L('Por decidir','To be decided');
      var lines=[L('Hola Ludus Kraken, quiero pedir cita / presupuesto.','Hi Ludus Kraken, I would like to book an appointment / get a quote.'),L('• Nombre: ','• Name: ')+(d.get('name')||'').trim(),L('• Estilo: ','• Style: ')+d.get('style')];
      lines.push(L('• Zona: ','• Placement: ')+((d.get('zone')||'').trim()||tbd),L('• Tamaño: ','• Size: ')+(d.get('size')||tbd),L('• Mejor horario: ','• Best time: ')+d.get('when'));
      if((d.get('phone')||'').trim()) lines.push(L('• Teléfono: ','• Phone: ')+d.get('phone').trim());
      if((d.get('idea')||'').trim()) lines.push(L('• Idea: ','• Idea: ')+d.get('idea').trim());
      if(photoUrl) lines.push(L('• Foto de referencia: ','• Reference photo: ')+photoUrl);
      else if(refs()) lines.push(L('• Fotos de referencia: sí, te las mando ahora por aquí','• Reference photos: yes, I am sending them here now'));
      return lines.join('\n');
    }
    function valid(){var n=$('#f-name'); if(!n.value.trim()){note.innerHTML='<span class="error">'+L('Escribe tu nombre para que sepamos a quién responder.','Please write your name so we know who to reply to.')+'</span>'; n.focus(); return false} return true}
    function upload(f){
      var fd=new FormData(); fd.append('file',f); fd.append('upload_preset',UPLOAD.preset); fd.append('folder',UPLOAD.folder);
      return fetch('https://api.cloudinary.com/v1_1/'+UPLOAD.cloud+'/image/upload',{method:'POST',body:fd}).then(function(r){if(!r.ok) throw 0; return r.json()}).then(function(j){return j.secure_url||''});
    }
    function done(win){
      var url='https://wa.me/'+WA+'?text='+encodeURIComponent(message()), f=file();
      if(win){try{win.location.href=url}catch(err){win=null}}
      if(!win){try{win=window.open(url,'_blank','noopener')}catch(err){}}
      var link='<a href="'+url+'" target="_blank" rel="noopener">'+L('pulsa aquí para abrirlo','tap here to open it')+'</a>';
      var head=L('Mensaje preparado. Si WhatsApp no se ha abierto, ','Message ready. If WhatsApp did not open, ')+link;
      if(refs()&&!photoUrl) note.innerHTML=L('Se ha abierto WhatsApp con tu mensaje. Envíalo y, en ese mismo chat, adjunta tus fotos con el clip. Si no se ha abierto, ','WhatsApp has opened with your message. Send it and attach your photos in that same chat using the paperclip. If it did not open, ')+link+'.';
      else note.innerHTML=head+'.'+(photoUrl?' '+L('Tu foto va enlazada en el mensaje.','Your photo is linked in the message.'):'');
    }
    form.addEventListener('submit',function(e){
      e.preventDefault(); if(!valid()) return;
      var f=file();
      if(f&&!photoUrl&&UPLOAD.cloud&&UPLOAD.preset){
        // se abre la pestaña ya (si no, el navegador bloquea la ventana al terminar la subida)
        var win=null; try{win=window.open('','_blank')}catch(err){}
        sendBtn.disabled=true; note.textContent=L('Subiendo tu foto…','Uploading your photo…');
        upload(f).then(function(u){photoUrl=u}).catch(function(){photoUrl=''}).then(function(){sendBtn.disabled=false; done(win)});
        return;
      }
      done(null);
    });
    mailBtn.addEventListener('click',function(e){if(!valid()){e.preventDefault(); return} mailBtn.href='mailto:?subject='+encodeURIComponent(L('Cita Ludus Kraken Tattoo','Appointment · Ludus Kraken Tattoo'))+'&body='+encodeURIComponent(message())});
  }
})();
