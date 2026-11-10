/* ════════════════════════════════════════════════
   필름잇다 프레젠테이션 엔진 — 모든 덱이 함께 씁니다
   ← → 이동 · F 전체화면 · N 메모 · O 목차 · B 빈칸
   T 타이머 · R 타이머 처음 · L 밝게 · G 3분할 격자
   P 이 장의 영상 재생/정지
   ════════════════════════════════════════════════ */
(function(){
'use strict';
const stage=document.getElementById('stage');
const slides=[...document.querySelectorAll('.slide')];
let cur=0;
const $=id=>document.getElementById(id);

/* ── 장치(목록 버튼 · 진행 막대 · 메모 · 목차 · 사진 확대) 자동 생성 ── */
stage.insertAdjacentHTML('beforeend',
  '<a id="hubbtn" href="../" title="프레젠테이션 목록으로">☰&nbsp; 프레젠테이션 목록</a>'+
  '<div id="bar"></div><div id="num"></div>'+
  '<div id="help"><a href="../">← 목록</a>&nbsp; · &nbsp;← → 이동 · F 전체화면 · N 메모 · O 목차 · B 빈칸 · L 밝게</div>');
document.body.insertAdjacentHTML('beforeend',
  '<div id="notes"></div>'+
  '<div id="ov"><h2>슬라이드 목차 — 클릭하면 이동합니다 (O 또는 Esc로 닫기)</h2><div id="ovg"></div></div>'+
  '<div id="lb"><img alt=""></div>');

try{if(localStorage.getItem('fs.slides.light')==='1')document.body.classList.add('light');}catch(e){}

function fit(){
  const vw=document.documentElement.clientWidth||innerWidth,vh=document.documentElement.clientHeight||innerHeight;
  stage.style.transform='translate(-50%,-50%) scale('+Math.min(vw/1600,vh/900)+')';
}
addEventListener('resize',()=>{if(!window.visualViewport||visualViewport.scale<1.02)fit();});
addEventListener('orientationchange',()=>setTimeout(fit,250));fit();

/* ── 유튜브: 썸네일 → 그 자리에서 재생 ── */
const FILE=location.protocol==='file:';
function ytBuild(box){
  const id=box.dataset.vid, t=box.dataset.title||'유튜브 영상';
  box.setAttribute('role','button');box.tabIndex=0;
  box.setAttribute('aria-label',t+' — 재생');
  box.innerHTML=
    '<img alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="https://i.ytimg.com/vi/'+id+'/hqdefault.jpg">'+
    '<div class="poster"><b>● YOUTUBE</b><span>눌러서 이 자리에서 재생</span></div>'+
    '<span class="play"></span>'+
    '<span class="cap">'+t+'</span>'+
    '<a class="ext" href="https://www.youtube.com/watch?v='+id+'" target="_blank" rel="noopener">유튜브에서 열기 ↗</a>';
  const img=box.querySelector('img');
  const bad=()=>box.classList.add('noimg');
  img.addEventListener('error',bad);
  /* 썸네일이 없는 영상은 120×90 회색 이미지가 오므로 그것도 실패로 봅니다 */
  img.addEventListener('load',()=>{if(img.naturalWidth<=120)bad();});
}
function ytPlay(box){
  if(box.querySelector('iframe'))return;
  const id=box.dataset.vid;
  /* 컴퓨터에서 파일을 바로 열면 유튜브가 퍼가기를 막습니다 → 새 탭으로 */
  if(FILE){window.open('https://www.youtube.com/watch?v='+id,'_blank','noopener');return;}
  const f=document.createElement('iframe');
  f.src='https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1'+(box.dataset.start?'&start='+box.dataset.start:'');
  f.title=box.dataset.title||'YouTube video';
  f.allow='accelerometer;autoplay;encrypted-media;picture-in-picture;fullscreen';
  f.allowFullscreen=true;
  f.referrerPolicy='strict-origin-when-cross-origin';
  box.classList.add('on');box.appendChild(f);
}
function ytStop(box){const f=box.querySelector('iframe');if(f){f.remove();box.classList.remove('on');}}
document.querySelectorAll('.yt[data-vid]').forEach(ytBuild);
document.addEventListener('click',e=>{
  const box=e.target.closest('.yt');if(!box||e.target.closest('.ext'))return;ytPlay(box);
});

/* ── 사이트 영상(mp4) ── */
function mvBuild(fig){
  const src=fig.dataset.src;
  const lab=fig.dataset.label?'<figcaption class="lab">'+fig.dataset.label+'</figcaption>':'';
  fig.innerHTML='<div class="box"><video controls playsinline preload="metadata" src="'+src+'"></video>'+
    '<button class="big" type="button" aria-label="영상 재생"></button>'+
    '<div class="err">영상을 불러오지 못했습니다<br>학습터 같은 강의에서 보세요</div></div>'+lab;
  const v=fig.querySelector('video');
  fig.querySelector('.big').addEventListener('click',()=>{v.play();});
  v.addEventListener('play',()=>fig.classList.add('playing'));
  v.addEventListener('pause',()=>{if(v.currentTime<0.05)fig.classList.remove('playing');});
  v.addEventListener('ended',()=>fig.classList.remove('playing'));
  v.addEventListener('error',()=>fig.classList.add('bad'));
}
document.querySelectorAll('.mv[data-src]').forEach(mvBuild);

/* ── 사진 ── */
document.querySelectorAll('.ph img').forEach(img=>{
  const fig=img.closest('.ph');
  img.addEventListener('error',()=>fig.classList.add('bad'));
  if(img.complete&&img.naturalWidth===0&&img.src)fig.classList.add('bad');
  if(fig.classList.contains('g3')){const g=document.createElement('i');g.className='grid3';img.parentNode.appendChild(g);}
});
document.addEventListener('click',e=>{
  const fr=e.target.closest('.ph .fr');if(!fr)return;
  const img=fr.querySelector('img');if(!img||fr.closest('.ph').classList.contains('bad'))return;
  $('lb').querySelector('img').src=img.src;$('lb').classList.add('on');
});
$('lb').addEventListener('click',()=>$('lb').classList.remove('on'));
/* 3분할 격자 버튼 (G 키와 같음) */
document.addEventListener('click',e=>{if(e.target.closest('.gbtn'))document.body.classList.toggle('grid');});

/* 슬라이드를 떠나면 재생 중인 영상은 모두 멈춥니다 */
function stopMedia(sl){
  if(!sl)return;
  sl.querySelectorAll('.yt').forEach(ytStop);
  sl.querySelectorAll('video').forEach(v=>{v.pause();try{v.currentTime=0;}catch(e){}v.closest('.mv')&&v.closest('.mv').classList.remove('playing');});
}

/* ── 이동 ── */
function show(i){
  const prev=slides[cur];
  cur=Math.max(0,Math.min(slides.length-1,i));
  if(prev!==slides[cur])stopMedia(prev);
  slides.forEach((s,j)=>s.classList.toggle('on',j===cur));
  $('bar').style.width=((cur+1)/slides.length*100)+'%';
  $('num').textContent=String(cur+1).padStart(2,'0')+' / '+slides.length;
  $('notes').innerHTML='<b>교사 메모</b>'+(slides[cur].dataset.note||'—');
  document.body.classList.toggle('hideblank',!!slides[cur].dataset.blank);
  document.querySelectorAll('.ovi').forEach((d,j)=>d.classList.toggle('cur',j===cur));
  if(history.replaceState)history.replaceState(null,'','#'+(cur+1));
}
addEventListener('keydown',e=>{
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  const k=e.key, onVideo=e.target&&e.target.tagName==='VIDEO';
  if(onVideo&&k===' ')return;                      /* 영상에 초점 → 스페이스는 재생/정지 */
  if(e.target&&e.target.closest&&e.target.closest('.yt')&&(k==='Enter'||k===' ')){e.preventDefault();ytPlay(e.target.closest('.yt'));return;}
  if(['ArrowRight','ArrowDown',' ','PageDown','Enter'].includes(k)){e.preventDefault();show(cur+1);}
  else if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(k)){e.preventDefault();show(cur-1);}
  else if(k==='Home')show(0);
  else if(k==='End')show(slides.length-1);
  else if(k==='f'||k==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen();}
  else if(k==='n'||k==='N')$('notes').classList.toggle('on');
  else if(k==='b'||k==='B')document.body.classList.toggle('hideblank');
  else if(k==='o'||k==='O')$('ov').classList.toggle('on');
  else if(k==='g'||k==='G')document.body.classList.toggle('grid');
  else if(k==='l'||k==='L'){const on=document.body.classList.toggle('light');try{localStorage.setItem('fs.slides.light',on?'1':'0');}catch(_){}}
  else if(k==='p'||k==='P'){
    const v=slides[cur].querySelector('video');
    if(v){v.paused?v.play():v.pause();}
    else{const y=slides[cur].querySelector('.yt');if(y)(y.querySelector('iframe')?ytStop(y):ytPlay(y));}
  }
  else if(k==='Escape'){$('ov').classList.remove('on');$('lb').classList.remove('on');}
});
document.querySelectorAll('.blank').forEach(b=>b.addEventListener('click',()=>{b.style.color='var(--amber)';}));
slides.forEach((s,i)=>{
  const d=document.createElement('div');d.className='ovi';
  d.innerHTML='<b>'+String(i+1).padStart(2,'0')+'</b>'+(s.dataset.title||'');
  d.onclick=()=>{show(i);$('ov').classList.remove('on');};
  $('ovg').appendChild(d);
});
/* 터치: 밀어서 이동, 화면 오른쪽/왼쪽 톡 */
let tx=0,ty=0,tt=0,multi=false;
const zoomed=()=>!!(window.visualViewport&&visualViewport.scale>1.02);
addEventListener('touchstart',e=>{const p=e.changedTouches[0];if(e.touches.length===1){multi=false;tx=p.clientX;ty=p.clientY;tt=Date.now();}else multi=true;},{passive:true});
addEventListener('touchend',e=>{if(multi||e.touches.length||zoomed())return;
  const p=e.changedTouches[0],d=p.clientX-tx,dy=p.clientY-ty;
  if(Math.abs(d)>60&&Math.abs(d)>Math.abs(dy)){show(cur+(d<0?1:-1));return;}
  if(Math.abs(d)<12&&Math.abs(dy)<12&&Date.now()-tt<500){
    if(e.target.closest('a,button,video,.yt,.ph,.timer,#ov,#notes,#lb,.blank'))return;
    const x=p.clientX/(document.documentElement.clientWidth||innerWidth);
    if(x>=0.6){e.preventDefault();show(cur+1);}else if(x<=0.3){e.preventDefault();show(cur-1);}
  }},{passive:false});

/* ── 타이머 ── */
const T={};
const pad=n=>String(n).padStart(2,'0');
const fmt=s=>{s=Math.max(0,Math.ceil(s));return pad(Math.floor(s/60))+':'+pad(s%60);};
const left=st=>st.run?st.left-(Date.now()-st.t0)/1000:st.left;
function paint(el){
  const st=T[el.dataset.tid];let l=left(st);
  if(l<=0&&st.run){st.run=false;st.left=0;l=0;}
  el.querySelector('.tval').textContent=fmt(l);
  el.classList.toggle('run',st.run);
  el.classList.toggle('warn',l<=Math.min(300,st.total/3)&&l>60);
  el.classList.toggle('last',l<=60&&l>0);
  el.classList.toggle('done',l<=0);
  el.querySelector('.tstate').textContent=l<=0?'시간 종료':st.run?'진행 중':(st.left<st.total?'일시정지':'대기');
}
function toggle(el){const st=T[el.dataset.tid];
  if(st.run){st.left=left(st);st.run=false;}else if(st.left>0){st.t0=Date.now();st.run=true;}paint(el);}
document.querySelectorAll('.timer').forEach((el,i)=>{
  el.dataset.tid=i;const m=+el.dataset.min;T[i]={total:m*60,left:m*60,run:false,t0:0};
  el.addEventListener('click',()=>toggle(el));paint(el);
});
setInterval(()=>document.querySelectorAll('.timer').forEach(paint),250);
addEventListener('keydown',e=>{
  const el=slides[cur].querySelector('.timer');if(!el)return;
  if(e.key==='t'||e.key==='T')toggle(el);
  else if(e.key==='r'||e.key==='R'){const st=T[el.dataset.tid];st.left=st.total;st.run=false;paint(el);}
});

/* 시험·디버그용 */
window.deck={show,get cur(){return cur;},slides,stopMedia};

const start=parseInt((location.hash||'').slice(1),10);
show(start>0?start-1:0);
})();
