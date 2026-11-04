'use strict';
const P=GameProgression;
const ROOMS=[{id:'mirror',title:'The Mirror Room'},{id:'pattern',title:'The Pattern Room'},{id:'false-exit',title:'The False Exit'}];
const SYMBOLS=['△','☾','◇','✦'],SOLUTION=['☾','◇','✦'];
const PATTERN=['△','◇','✦','⬡','○','□'],PATTERN_NAMES=['triangle','diamond','star','hexagon','circle','square'],PATTERN_SOLUTION=[1,0,2];
const $=s=>document.querySelector(s);
let state,sound=false,audio,completionTimer=null,feedbackTimer=null,hintCount=0;
function fresh(){return {...P.create(),view:'world',reality:'warm',realities:['warm','warm','warm'],clue:false,cabinet:false,dials:[0,0,0],selection:[],comparedFalseRealities:false,attempts:[0,0,0]};}
state=fresh();
const say=t=>{$('#message').textContent=t;};
function chime(good=true){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});[0,.16,.32].forEach((delay,i)=>{const o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=good?[523.25,659.25,783.99][i]:[220,196,174.6][i];g.gain.setValueAtTime(0,audio.currentTime+delay);g.gain.linearRampToValueAtTime(.045,audio.currentTime+delay+.02);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+delay+.5);o.connect(g).connect(audio.destination);o.start(audio.currentTime+delay);o.stop(audio.currentTime+delay+.6);});}catch{}}
function star(x,y,r=14){return `<path d="M${x} ${y-r}l${r*.3} ${r*.65} ${r*.7} ${r*.1} -${r*.53} ${r*.5} ${r*.15} ${r*.75} -${r*.62} -${r*.38} -${r*.62} ${r*.38} ${r*.15} -${r*.75} -${r*.53} -${r*.5} ${r*.7} -${r*.1}Z" fill="#f2d393"/>`;}
function hotspot(id,label,kind,content,halo=''){return `<g class="hotspot" id="obj-${id}" tabindex="0" role="button" aria-label="${label}" data-action="${id}" data-label="${label}" data-kind="${kind}"><title>${label}</title>${content}${halo}</g>`;}
function roomDone(index=state.room){return state.completed.includes(ROOMS[index].id);}
function doorOpening(count){return [1,.8,.46,.08][Math.min(count,3)];}
function mirrorArt(){
 const count=state.completed.length,all=P.allComplete(state),canCross=all&&state.key;
 const key=state.key?'':hotspot('key',all?'Pick up the golden key':'The golden key · beyond reach',all?'collect':'info',`<g class="key-art ${all?'key-ready':''}" filter="url(#glow)"><path d="M277 318h34" stroke="#f8d985" stroke-width="4"/><circle cx="272" cy="318" r="7" fill="none" stroke="#f8d985" stroke-width="4"/><path d="M302 318v7m7-7v7" stroke="#f8d985" stroke-width="3"/><rect x="260" y="306" width="57" height="24" fill="transparent"/></g>`,`<ellipse class="halo" cx="287" cy="318" rx="30" ry="13"/>`);
 const puzzleClue=state.room===1?`<text x="291" y="191" text-anchor="middle" fill="#ffe7a5" font-size="17" font-family="Georgia">◇ △ ✦</text>`:'';
 return hotspot('mirror',canCross?'Cross through the mirror':'Touch the mirror · shift reality',canCross?'move':'shift',`
 <path d="M240 347V175Q240 112 293 119Q345 125 345 188V355Z" fill="#211b38" stroke="#d9b46f" stroke-width="10"/>
 <path d="M251 342V177Q251 130 292 133Q333 138 333 186V347Z" fill="url(#mirrorFill)" stroke="#fae1a8" stroke-width="2"/>
 <g opacity=".45" fill="#d9bff5"><path d="M257 285V238L270 216L280 237V294Z"/><path d="M315 304V263L326 243L331 260V311Z"/></g>${puzzleClue}
 <path d="M284 295V226Q294 205 308 231V304Z" fill="#f3d5ba" stroke="#ecd18f" stroke-width="2"/>
 <g class="door-leaf" data-opening="${count}" style="transform:scaleX(${doorOpening(count)})"><path d="M285 295V226Q294 205 307 231V304Z" fill="#534064" stroke="#d4ae69" stroke-width="2"/><path d="M292 234L299 225L303 234V287L292 281Z" fill="none" stroke="#aa8b65"/><circle cx="302" cy="266" r="2" fill="#ffdf8a"/></g>
 ${!state.finalUnlocked?'<path d="M293 282v-7q4-8 7 0v7m-9 0h11v10h-11Z" fill="#e5c578" stroke="#a0784b"/>':''}
 ${key}
 <path d="M248 168Q218 144 235 131Q249 125 256 139M331 160Q355 147 346 131Q334 121 329 139M261 126Q249 101 268 101L292 84L314 110Q330 102 325 127" fill="none" stroke="#d6b371" stroke-width="5"/>
 <ellipse cx="292" cy="111" rx="9" ry="13" fill="#d9b8ed" stroke="#f3d79a" stroke-width="3"/>
 <path d="M245 352L241 367L270 358M335 360L346 374L318 364" fill="none" stroke="#d9b46f" stroke-width="5"/>
 <path d="M251 181L312 144M255 203L326 159" stroke="#ffedff" opacity=".25" stroke-width="3"/>
 ${[0,1,2].map(n=>`<path d="M${276+n*17} 339l5 -6 5 6 -5 6Z" fill="${n<count?'#f9df8d':'#78648e'}"/>`).join('')}
 ${canCross?'<path d="M252 357L280 349L306 358L334 351" fill="none" stroke="#fff1c6" stroke-width="4" class="clue"/>':''}
 ${state.room===2&&!roomDone()?reflectedDoorways():''}
 `,'<path class="halo" d="M232 356V175Q232 100 293 111Q353 119 353 188V362Z"/>');
}
function roomExit(x,y,w,h,next){const open=roomDone();return `<g transform="translate(${x} ${y}) scale(${w/60} ${h/150})">${hotspot('door',open?(next<3?`Follow the pathway to ${ROOMS[next].title}`:'The true exit is in the mirror'):'Examine the sealed room door',open&&next<3?'move':'info',`<path d="M0 150V28Q30 -26 60 28V150Z" fill="${open?'#d3eeeb':'#211c37'}" stroke="#caa773" stroke-width="4"/><g class="room-door-leaf" style="transform:scaleX(${open?.15:1})"><path d="M5 147V30Q30 -15 55 30V147Z" fill="#574264" stroke="#caa773" stroke-width="2"/><circle cx="44" cy="90" r="3" fill="#e9c987"/></g>${open?'<path d="M8 150L-25 175L35 199L58 150" fill="#e7d7a74a" stroke="#ecd391" stroke-width="2"/>':'<path d="M23 94v-9q7-12 14 0v9m-17 0h20v19H20Z" fill="#dfb97a"/>'}`,'<path class="halo" d="M-5 153V28Q30 -35 65 28V153Z"/>')}</g>`;}
function animateProgress(previous){document.querySelectorAll('.door-leaf').forEach(leaf=>{leaf.style.transform=`scaleX(${doorOpening(previous)})`;requestAnimationFrame(()=>requestAnimationFrame(()=>{leaf.style.transform=`scaleX(${doorOpening(state.completed.length)})`;}));});document.querySelectorAll('.room-door-leaf').forEach(leaf=>{leaf.style.transform='scaleX(1)';requestAnimationFrame(()=>requestAnimationFrame(()=>leaf.style.transform='scaleX(.15)'));});}
function feedback(correct=false){clearTimeout(feedbackTimer);$('#wand').classList.remove('wrong-wand');$('#stage').classList.remove('wrong-scene','success-flash');void $('#stage').offsetWidth;$('#stage').classList.add(correct?'success-flash':'wrong-scene');if(!correct)$('#wand').classList.add('wrong-wand');feedbackTimer=setTimeout(()=>{$('#wand').classList.remove('wrong-wand');$('#stage').classList.remove('wrong-scene','success-flash');},800);chime(correct);}
function bindHotspots(){document.querySelectorAll('.hotspot').forEach(el=>{el.addEventListener('click',e=>{e.stopPropagation();act(el.dataset.action);});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();act(el.dataset.action);}});});}
function updateUI(){
 const beyond=state.view==='beyond',i=state.room,done=roomDone();
 $('#room-label').textContent=beyond?'BEYOND THE MIRROR / THE FINAL THRESHOLD':`ROOM 0${i+1} / ${ROOMS[i].title.toUpperCase()}`;
 $('#reality-name').textContent=beyond?'One last lock.':state.reality==='cool'?['The world beneath it.','What survives the shift?','Promises in the glass.'][i]:['The world you know.','Not every light tells the truth.','Three doors. No way out.'][i];
 $('#reality-badge').textContent=beyond?'Beyond the glass':state.reality==='cool'?'Alternate reality':'Original reality';
 $('#map').textContent=beyond?'← Back to the mirror':'← World';
 $('#held').textContent=state.key?'✧ Golden key':'Nothing yet';$('#progress').textContent=`${state.completed.length} / 3`;
 document.querySelectorAll('.progress i').forEach((el,n)=>el.classList.toggle('on',n<state.completed.length));
 $('#room').setAttribute('aria-label',beyond?'Beyond the mirror':ROOMS[i].title);
 $('#room-prompt').textContent=beyond?(state.finalUnlocked?'Click the open doorway to escape':'Use the golden key on the final lock'):P.allComplete(state)?(state.key?'The mirror is now a passage':'The key can finally be reached'):'Click objects to explore · Touch the mirror to shift';
 $('#pattern-tools').hidden=beyond||i===0;
 if(i===1){$('#sequence-label').textContent=done?'PATTERN RESTORED':'SELECT THREE MARKS';$('#pattern-slots').innerHTML=[0,1,2].map(n=>`<span>${PATTERN[state.selection[n]]||'·'}</span>`).join('');$('#clear-pattern').hidden=done;}
 if(i===2){
  $('#sequence-label').textContent=done?'TRUE EXIT FOUND':state.comparedFalseRealities?'CHOOSE THE UNCHANGED MARK IN THE MIRROR':'COMPARE THE MIRROR IN BOTH REALITIES';
  $('#pattern-slots').textContent='';
  $('#clear-pattern').hidden=true;
 }
 $('#focus-label').textContent='Move your wand. Let the room answer.';$('#wand').dataset.mode='';
}
function draw(){$('#stage').classList.remove('shift-wash','wrong-scene','success-flash');if(state.view==='beyond')drawBeyond();else if(state.room===0)drawRoomOne();else if(state.room===1)drawPatternRoom();else drawFalseRoom();updateUI();bindHotspots();}
