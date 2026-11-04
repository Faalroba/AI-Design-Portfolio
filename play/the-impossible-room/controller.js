/* All puzzle and navigation actions use the shared progression guards. */
function showWorld(){
 clearTimeout(completionTimer);
 if(state.escaped){showEnding();return;}
 state.view='world';state.insideMirror=false;$('#room').hidden=true;$('#ending').hidden=true;$('#world').hidden=false;
 document.querySelectorAll('[data-room]').forEach(btn=>{const i=Number(btn.dataset.room),available=P.available(state,i),done=roomDone(i);btn.classList.toggle('locked',!available);btn.setAttribute('aria-disabled',String(!available));btn.dataset.kind=available?'move':'info';btn.querySelector('span').textContent=done?'Complete · revisit ↗':available?'Pathway open · enter ↗':`Locked · complete Room ${i}`;btn.setAttribute('aria-label',`${ROOMS[i].title}, ${done?'completed':available?'available':'locked'}`);});
 $('#lock2').textContent=roomDone(1)?'✦ ROOM 02 · COMPLETE':P.available(state,1)?'↗ ROOM 02 · OPEN':'◇ ROOM 02 · SEALED';$('#lock3').textContent=roomDone(2)?'✦ ROOM 03 · COMPLETE':P.available(state,2)?'↗ ROOM 03 · OPEN':'◇ ROOM 03 · SEALED';
 $('#lock2').classList.toggle('unsealed',P.available(state,1));$('#lock3').classList.toggle('unsealed',P.available(state,2));
 $('#world').dataset.progress=String(state.completed.length);
 const next=nextDestination();$('#begin').textContent=P.allComplete(state)?'Return to the mirror ↗':`Enter ${ROOMS[next].title} ↗`;
 $('#world-intro').innerHTML=P.allComplete(state)?'Three puzzles answered.<br>The mirror is waiting for you.':'A key waits beyond the glass.<br>Follow the next light.';
 $('#world-feedback').textContent='';$('#wand').dataset.mode='';
}
function nextDestination(){return Math.min(state.completed.length,2);}
function enter(index=0){
 if(!P.enter(state,index)){if(state.escaped)return;$('#world-feedback').textContent=`The pathway is sealed. Complete Room ${index} first.`;feedback(false);return false;}
 clearTimeout(completionTimer);state.view='room';state.reality=state.realities[index];hintCount=0;$('#world').hidden=true;$('#ending').hidden=true;$('#room').hidden=false;draw();
 say(roomDone(index)?P.allComplete(state)?'All three rooms are complete. Return to the key within the mirror.':'This room is solved. Its open door leads onward.':['The mirror is awake. Something in this room is out of place.','Six marks. Some lights change; some remain.','Three doors stand in the room. The mirror shows four.'][index]);return true;
}
function shift(){
 if(state.view!=='room')return;
 state.reality=state.reality==='warm'?'cool':'warm';state.realities[state.room]=state.reality;
 if(state.room===2&&!roomDone())state.comparedFalseRealities=true;
 draw();
 $('#stage').classList.remove('shift-wash');void $('#stage').offsetWidth;$('#stage').classList.add('shift-wash');chime();
 say(state.room===0?(state.reality==='cool'?'The table has moved. What was beneath it?':'The room returns. You remember what changed.'):state.room===1?'The lights have changed. Which symbols still glow?':'Which doorway in the mirror kept its mark? Click the frame to look again.');
}
function finishRoom(index){
 const previous=state.completed.length;if(!P.complete(state,index))return;
 if(index===0)state.cabinet=true;
 draw();animateProgress(previous);feedback(true);
 say(['The marks agree. Your room door opens; the final exit in the mirror opens a little.','The pattern holds. Your room door opens; the final exit opens halfway.','The false exits fade. The true doorway opens; the mirror releases its key.'][index]);
 clearTimeout(completionTimer);completionTimer=setTimeout(()=>{if(!roomDone(index)||state.escaped||state.room!==index||state.view!=='room')return;
  $('#completion-label').textContent=`ROOM 0${index+1} COMPLETE`;
  $('#completion-title').textContent=['A crack in the impossible.','Order beneath the illusion.','The glass tells the truth.'][index];
  $('#completion-copy').textContent=['The first door opens. The golden key remains inside the mirror, waiting for two more answers.','The second door opens. The same final exit opens further. One puzzle still protects the key.','All three puzzles are complete. This is not the escape yet: return to the mirror and retrieve the golden key.'][index];
  $('#completion-progress').innerHTML=[0,1,2].map(n=>`<${n<state.completed.length?'b':'span'}>0${n+1}</${n<state.completed.length?'b':'span'}>`).join('<span>—</span>');
  $('#continue').textContent=index<2?`Follow the pathway to Room ${index+2} ↗`:'Return to the mirror ↗';
  if(!$('#complete').open)$('#complete').showModal();
 },1350);
}
function pickSymbol(i){
 if(roomDone()){say('The pattern is already restored. The open door leads to the False Exit.');return;}
 if(state.selection.includes(i)){state.selection=[];state.attempts[1]++;draw();say('The same mark cannot appear twice. Try another order.');feedback(false);return;}
 state.selection.push(i);draw();
 if(state.selection.length<3){say(`${state.selection.length} of 3 marks chosen. The mirror remembers their order.`);return;}
 if(state.selection.every((v,n)=>v===PATTERN_SOLUTION[n]))finishRoom(1);
 else{state.attempts[1]++;state.selection=[];draw();say('The pattern breaks. Look for marks that glow in both realities, then follow their reflected order.');feedback(false);}
}
function chooseReflectedDoor(index){
 if(state.room!==2||roomDone())return;
 if(!state.comparedFalseRealities){
  say('You have seen the marks in only one reality. Click the mirror frame to compare.');
  return;
 }
 const [original,alternate]=FALSE_DOORS[index].marks;
 if(original===alternate){finishRoom(2);return;}
 state.attempts[2]++;
 say(`That mark changes from ${original} to ${alternate}. Look for a doorway that keeps its mark.`);
}
function act(id){
 if(state.escaped)return;
 if(id.startsWith('symbol-')){pickSymbol(Number(id.slice(7)));return;}
 if(id.startsWith('reflection-')){chooseReflectedDoor(Number(id.slice(11)));return;}
 if(id.startsWith('false-')&&id!=='false-note'){say('The door has a mark. Find the matching frame in the mirror and watch it across realities.');return;}
 switch(id){
 case'mirror':if(P.allComplete(state)&&state.key){if(P.crossMirror(state)){state.view='beyond';draw();say('You have crossed the glass. The final lock waits for the golden key.');chime();}}else shift();break;
 case'key':if(P.collectKey(state)){clearTimeout(completionTimer);draw();say('The golden key rests in your keeping. The mirror is now a passage.');feedback(true);}else{say('The key is behind the glass. Three solved rooms will make it reachable.');feedback(false);}break;
 case'clue':state.clue=true;say('The floor remembers: crescent moon → diamond → star.');chime();break;
 case'table':say(state.reality==='warm'?'The table covers a worn patch of floor. In the reflection, it stands elsewhere.':'Where the table once stood, three marks catch the light.');break;
 case'chair':say('A crescent chair. In the mirror, its place is empty.');break;
 case'ornament':say('The crystal has no thread. Its reflection hangs somewhere else.');break;
 case'cabinet':if(roomDone(0))say('The cabinet is open. The matching marks released the room door.');else openPuzzle();break;
 case'door':if(roomDone()&&state.room<2)enter(state.room+1);else{say('The room door is sealed. Compare the clues on both sides of reality.');feedback(false);}break;
 case'pattern-note':say('Keep the lights that survive both realities. Read their order in the mirror.');break;
 case'false-note':say(FALSE_INSCRIPTION);break;
 case'final-lock':if(P.unlock(state)){draw();feedback(true);say('The golden key turns. The final door is unlocked. Step through.');}else{say('The golden key must be collected before this lock will open.');feedback(false);}break;
 case'escape-door':if(state.finalUnlocked&&P.escape(state)){chime();showEnding();}else{say('One last lock. Use your golden key on the glowing lock.');feedback(false);}break;
 case'map':showWorld();break;
 }
}
function renderDials(){
 $('#dials').innerHTML=state.dials.map((n,i)=>`<button data-kind="interact" aria-label="Symbol ${i+1}: ${SYMBOLS[n]}. Click to change." data-dial="${i}">${SYMBOLS[n]}</button>`).join('');
 document.querySelectorAll('[data-dial]').forEach(el=>el.onclick=()=>{const i=Number(el.dataset.dial);state.dials[i]=(state.dials[i]+1)%SYMBOLS.length;renderDials();document.querySelector(`[data-dial="${i}"]`).focus();});
}
function openPuzzle(){renderDials();$('#puzzle-message').textContent='Click each symbol to change it.';$('#puzzle').showModal();}
function showEnding(){clearTimeout(completionTimer);state.view='ending';$('#world').hidden=true;$('#room').hidden=true;document.querySelectorAll('dialog[open]').forEach(d=>d.close());$('#ending').hidden=false;$('#ending-title').focus();$('#wand').dataset.mode='';}
function restart(){clearTimeout(completionTimer);clearTimeout(feedbackTimer);document.querySelectorAll('dialog[open]').forEach(d=>d.close());state=fresh();hintCount=0;$('#stage').className='stage';$('#wand').classList.remove('wrong-wand');showWorld();}
$('#check').onclick=()=>{if(state.dials.every((n,i)=>SYMBOLS[n]===SOLUTION[i])){$('#puzzle').close();finishRoom(0);}else{state.attempts[0]++;$('#puzzle-message').textContent='The marks dim. Nothing is lost. Look for their order in the other reality.';$('#dials').classList.remove('wrong');void $('#dials').offsetWidth;$('#dials').classList.add('wrong');feedback(false);}};
$('#begin').onclick=()=>enter(nextDestination());document.querySelectorAll('[data-room]').forEach(el=>el.onclick=()=>enter(Number(el.dataset.room)));
$('#map').onclick=()=>{if(state.view==='beyond'){state.insideMirror=false;enter(2);}else showWorld();};$('#home').onclick=e=>{e.preventDefault();showWorld();};
$('#continue').onclick=()=>{clearTimeout(completionTimer);$('#complete').close();if(state.room<2)enter(state.room+1);else{draw();say('Return to the key inside the mirror. The glass will let you reach it now.');document.querySelector('#obj-key')?.focus();}};
$('#stay').onclick=()=>$('#complete').close();$('.close').onclick=()=>$('#puzzle').close();
$('#clear-pattern').onclick=()=>{state.selection=[];draw();say('The sequence clears. You can compare the realities again.');};
$('#hint').onclick=()=>{
 let hints;
 if(state.view==='beyond')hints=[state.finalUnlocked?'The doorway is unlocked. Click it to escape.':'Click the golden lock to use the key.'];
 else if(P.allComplete(state))hints=[state.key?'Click the mirror to cross into the final passage.':'Click the golden key inside the mirror.'];
 else if(roomDone())hints=['The open room door leads to the next room.'];
 else if(state.room===0)hints=state.reality==='warm'?['Touch the mirror. Watch the table.','The table hides three marks. Look in the other reality.']:['Investigate the floor where the table used to stand.','The cabinet needs moon, diamond, star—in that order.'];
 else if(state.room===1)hints=['Compare which symbols glow before and after the mirror shifts.','Three lights are shared: diamond, triangle, star. The mirror shows their order.'];
 else hints=state.comparedFalseRealities?['Follow the same frame across the shift. Choose the doorway whose mark stays the same.']:['Read the floor inscription. Look at the four marks in the glass, then click the mirror frame to shift.'];
 say(hints[Math.min(hintCount++,hints.length-1)]);
};
$('#restart').onclick=()=>$('#reset-dialog').showModal();$('#cancel-restart').onclick=()=>$('#reset-dialog').close();$('#confirm-restart').onclick=restart;$('#play-again').onclick=restart;
$('#sound').onclick=()=>{sound=!sound;$('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-pressed',String(sound));if(sound)chime();};
// One cursor: the wand tip is the pointer. Star effects communicate the action.
function updateWand(target){const wandElement=$('#wand');const host=target?.closest?.('dialog[open]')||document.body;if(wandElement.parentElement!==host)host.append(wandElement);const el=target?.closest?.('[data-kind],button,a');const mode=el?.dataset.kind||(el?'interact':'explore');$('#wand').dataset.mode=mode;if(!$('#room').hidden)$('#focus-label').textContent=el?.dataset.label||'Move your wand. Let the room answer.';}
document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;document.documentElement.classList.add('wand-ready');const wand=$('#wand');wand.style.display='block';wand.style.left=(e.clientX-58)+'px';wand.style.top=(e.clientY-18)+'px';updateWand(e.target);});
document.addEventListener('pointerover',e=>updateWand(e.target));document.addEventListener('focusin',e=>updateWand(e.target));document.addEventListener('pointerout',e=>{if(!e.relatedTarget){$('#wand').style.display='none';document.documentElement.classList.remove('wand-ready');}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){$('#wand').style.display='none';document.documentElement.classList.remove('wand-ready');}});
showWorld();

