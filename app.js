const cfg=window.BRUHTUBE_CONFIG||{};
const sb=(cfg.url&&cfg.anonKey&&window.supabase)?window.supabase.createClient(cfg.url,cfg.anonKey):null;
const $=id=>document.getElementById(id);
const demo=[
 {id:'d1',title:'Самые красивые игровые миры 2026',channel:'PixelPlay',views:'128 тыс. просмотров',age:'2 дня назад',duration:'12:48',category:'Игры',thumb:'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=900&q=85',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',description:'Подборка красивых игровых миров и интересных игровых идей. Это демонстрационный ролик для проверки видеоплеера.'},
 {id:'d2',title:'Как создать свой первый сайт',channel:'WebStart',views:'84 тыс. просмотров',age:'5 дней назад',duration:'18:21',category:'Обучение',thumb:'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=85',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',description:'Простой старт в веб-разработке: HTML, CSS и JavaScript.'},
 {id:'d3',title:'Красивые места нашей планеты',channel:'Travel Time',views:'52 тыс. просмотров',age:'1 неделю назад',duration:'09:37',category:'Развлечения',thumb:'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=900&q=85',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',description:'Вдохновляющее путешествие по красивым местам.'},
 {id:'d4',title:'Технологии будущего уже здесь',channel:'TechZone',views:'210 тыс. просмотров',age:'3 дня назад',duration:'15:04',category:'Технологии',thumb:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=85',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',description:'Обзор интересных технологических идей.'},
 {id:'d5',title:'Музыка для продуктивной работы',channel:'LoFi Room',views:'1,4 млн просмотров',age:'1 месяц назад',duration:'32:10',category:'Музыка',thumb:'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900&q=85',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',description:'Фоновая музыка для учёбы и творчества.'},
 {id:'d6',title:'Эпичный футбольный матч',channel:'Sport Live',views:'96 тыс. просмотров',age:'6 дней назад',duration:'11:26',category:'Спорт',thumb:'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&q=85',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',description:'Спортивные моменты и лучшие игровые эпизоды.'},
 {id:'d7',title:'Постройка огромного дома в Minecraft',channel:'CraftBro',views:'430 тыс. просмотров',age:'Вчера',duration:'24:12',category:'Игры',thumb:'https://images.unsplash.com/photo-1607513746994-51f730a44832?w=900&q=85',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',description:'Демонстрация большой постройки. Видео для примера интерфейса.'},
 {id:'d8',title:'Секреты съёмки на телефон',channel:'Creator Lab',views:'31 тыс. просмотров',age:'2 недели назад',duration:'08:55',category:'Обучение',thumb:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=900&q=85',url:'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',description:'Несколько простых советов для начинающих авторов.'}
];
let videos=[...demo],category='Все',query='',activeFilter='home',current=null,register=false,user=null,localLikes=new Set();
const grid=$('videoGrid');
function toast(t){$('toast').textContent=t;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2400)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function card(v){return `<article class="video-card" data-id="${esc(v.id)}"><div class="thumbnail"><img loading="lazy" src="${esc(v.thumb||'')}" alt=""><span class="duration">${esc(v.duration||'Видео')}</span></div><div class="video-details"><div class="channel-avatar">${esc((v.channel||'B').slice(0,1).toUpperCase())}</div><div class="video-text"><h3>${esc(v.title)}</h3><p>${esc(v.channel||'Автор BruhTube')}</p><p>${esc(v.views||'0 просмотров')} · ${esc(v.age||'только что')}</p></div></div></article>`}
function render(){
 let list=videos.filter(v=>(category==='Все'||v.category===category)&&(`${v.title} ${v.channel} ${v.description||''}`).toLowerCase().includes(query));
 if(activeFilter==='my')list=list.filter(v=>v.owner_id&&user&&v.owner_id===user.id);
 $('resultCount').textContent=`${list.length} видео`;
 grid.innerHTML=list.map(card).join('');$('emptyState').classList.toggle('hidden',list.length>0);
 grid.querySelectorAll('.video-card').forEach(el=>el.addEventListener('click',()=>openVideo(el.dataset.id)));
}
function switchSection(section){
 $('homeSection').classList.toggle('hidden',section!=='home');$('watchSection').classList.add('hidden');$('uploadSection').classList.add('hidden');$('simpleSection').classList.add('hidden');$('chips').classList.toggle('hidden',section!=='home');
 if(section==='home'){render();return}
 if(section==='upload'){$('uploadSection').classList.remove('hidden');return}
 $('simpleSection').classList.remove('hidden');
 const labels={trending:['В тренде','Здесь будут самые популярные видео BruhTube.'],subscriptions:['Подписки','Войди в аккаунт, чтобы смотреть новые видео любимых каналов.'],history:['История просмотров','История просмотров будет доступна после входа в аккаунт.'],liked:['Понравившиеся','Ставь лайки видео, чтобы собрать их здесь.'],my:['Мои видео','Здесь появятся видео, которые ты опубликовал.']};
 $('simpleTitle').textContent=labels[section]?.[0]||'BruhTube';$('simpleText').textContent=labels[section]?.[1]||'';
 if(section==='my'&&user){const own=videos.filter(v=>v.owner_id===user.id);$('simpleText').textContent=own.length?`У тебя опубликовано видео: ${own.length}.`:'Ты пока не загрузил видео.'}
}
function openVideo(id){
 const v=videos.find(x=>x.id===id);if(!v)return;current=v;
 $('homeSection').classList.add('hidden');$('chips').classList.add('hidden');$('uploadSection').classList.add('hidden');$('simpleSection').classList.add('hidden');$('watchSection').classList.remove('hidden');
 $('videoPlayer').src=v.url;$('watchTitle').textContent=v.title;$('watchChannel').textContent=v.channel||'Автор BruhTube';$('watchAvatar').textContent=(v.channel||'B').slice(0,1).toUpperCase();$('watchViews').textContent=(v.views||'0 просмотров')+' · '+(v.age||'только что');$('watchDescription').textContent=v.description||'Описание отсутствует.';
 $('likeBtn').textContent=localLikes.has(v.id)?'♥ Понравилось':'♡ Нравится';
 $('relatedVideos').innerHTML=videos.filter(x=>x.id!==v.id).slice(0,5).map(x=>`<div class="related" data-id="${esc(x.id)}"><img src="${esc(x.thumb)}"><div><strong>${esc(x.title)}</strong><small>${esc(x.channel)}</small></div></div>`).join('');
 $('relatedVideos').querySelectorAll('.related').forEach(el=>el.addEventListener('click',()=>openVideo(el.dataset.id)));
 window.scrollTo({top:0,behavior:'smooth'});
}
$('likeBtn').addEventListener('click',()=>{if(!current)return;if(localLikes.has(current.id))localLikes.delete(current.id);else localLikes.add(current.id);$('likeBtn').textContent=localLikes.has(current.id)?'♥ Понравилось':'♡ Нравится';toast('Лайк обновлён на этом устройстве')});
$('backHome').addEventListener('click',()=>{ $('videoPlayer').pause();switchSection('home')});
document.querySelectorAll('.side-link').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.side-link').forEach(x=>x.classList.remove('active'));b.classList.add('active');activeFilter=b.dataset.filter;switchSection(activeFilter==='home'?'home':activeFilter)}));
document.querySelectorAll('.chip').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.chip').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');category=b.dataset.category;render()}));
$('searchForm').addEventListener('submit',e=>{e.preventDefault();query=$('searchInput').value.trim().toLowerCase();activeFilter='home';switchSection('home')});
$('searchInput').addEventListener('input',()=>{query=$('searchInput').value.trim().toLowerCase();render()});
$('homeLink').addEventListener('click',e=>{e.preventDefault();activeFilter='home';switchSection('home')});
$('uploadTop').addEventListener('click',()=>switchSection('upload'));$('emptyUpload').addEventListener('click',()=>switchSection('upload'));
$('uploadBack').addEventListener('click',()=>switchSection('home'));$('menuBtn').addEventListener('click',()=>$('sidebar').classList.toggle('open'));
$('authOpen').addEventListener('click',()=>{if(user){signOut();return}$('authMessage').textContent=sb?'':'Добавь ключи Supabase в supabase-config.js, чтобы включить аккаунты.';$('authDialog').showModal()});
$('switchAuth').addEventListener('click',()=>{register=!register;$('authHeading').textContent=register?'Создать аккаунт':'С возвращением!';$('authSubmit').textContent=register?'Зарегистрироваться':'Войти';$('switchAuth').textContent=register?'Уже есть аккаунт? Войти':'Нет аккаунта? Зарегистрироваться'});
$('authForm').addEventListener('submit',async e=>{e.preventDefault();if(!sb){$('authMessage').textContent='Supabase не настроен. Смотри README.md.';return}
 const email=$('authEmail').value,password=$('authPassword').value;
 const r=register?await sb.auth.signUp({email,password}):await sb.auth.signInWithPassword({email,password});
 if(r.error){$('authMessage').textContent=r.error.message;return}
 if(register){$('authMessage').textContent='Проверь почту для подтверждения регистрации.';return}
 $('authMessage').textContent='Вход выполнен!';setTimeout(()=>$('authDialog').close(),500);await loadUser();
});
async function loadUser(){if(!sb)return;const {data}=await sb.auth.getUser();user=data.user;$('authOpen').classList.toggle('hidden',!!user);$('userChip').classList.toggle('hidden',!user);if(user)$('userChip').textContent=(user.email||'B')[0].toUpperCase();await loadRemoteVideos()}
async function signOut(){await sb.auth.signOut();user=null;$('authOpen').classList.remove('hidden');$('userChip').classList.add('hidden');toast('Ты вышел из аккаунта');render()}
async function loadRemoteVideos(){
 if(!sb)return;const {data,error}=await sb.from('videos').select('*').order('created_at',{ascending:false}).limit(60);
 if(!error&&data){const remote=data.map(v=>({id:v.id,title:v.title,description:v.description,channel:v.channel_name||'Автор BruhTube',views:(v.views||0)+' просмотров',age:'новое видео',category:v.category||'Развлечения',thumb:v.thumbnail_url||'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=900',url:v.video_url,owner_id:v.owner_id,duration:'Видео'}));videos=[...remote,...demo];render()}
}
$('uploadForm').addEventListener('submit',async e=>{
 e.preventDefault();const file=$('videoFile').files[0],title=$('videoTitle').value.trim();if(!file||!title)return;
 if(file.size>100*1024*1024){$('uploadStatus').textContent='Файл больше 100 МБ. Выбери видео поменьше.';return}
 if(!sb||!user){$('uploadStatus').textContent='Для публикации в интернете нужно войти через Supabase. Пока можно проверить плеер на демо-видео.';if(!user)$('authDialog').showModal();return}
 $('publishBtn').disabled=true;$('publishBtn').textContent='Загрузка...';$('uploadStatus').textContent='Загружаем видео, не закрывай страницу.';
 const ext=(file.name.split('.').pop()||'mp4').toLowerCase(),path=`${user.id}/${Date.now()}.${ext}`;
 const up=await sb.storage.from('videos').upload(path,file,{contentType:file.type,upsert:false});
 if(up.error){$('uploadStatus').textContent='Ошибка загрузки: '+up.error.message;$('publishBtn').disabled=false;$('publishBtn').textContent='Опубликовать видео';return}
 const {data:pub}=sb.storage.from('videos').getPublicUrl(path);
 const row={owner_id:user.id,title,description:$('videoDescription').value,category:$('videoCategory').value,video_url:pub.publicUrl,channel_name:user.email.split('@')[0]};
 const ins=await sb.from('videos').insert(row).select().single();
 $('publishBtn').disabled=false;$('publishBtn').textContent='Опубликовать видео';
 if(ins.error){$('uploadStatus').textContent='Файл загружен, но не удалось сохранить описание: '+ins.error.message;return}
 $('uploadStatus').textContent='Видео опубликовано!';toast('Видео опубликовано');await loadRemoteVideos();switchSection('home');$('uploadForm').reset();
});
render();if(sb){sb.auth.onAuthStateChange(()=>loadUser());loadUser()}
