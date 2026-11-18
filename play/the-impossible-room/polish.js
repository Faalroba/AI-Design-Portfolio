/* Presentation feedback only: puzzle rules remain in the existing controllers. */
window.GamePolish = (() => {
  const noticed = new Set();
  const notice = document.createElement('p');
  notice.id = 'action-notice';
  notice.setAttribute('role', 'status');
  const hint = document.createElement('p');
  hint.id = 'context-hint';
  hint.setAttribute('role', 'status');
  document.querySelector('.room-heading').after(hint);
  document.querySelector('#room').append(notice);
  let noticeTimer, hintTimer, shifted = false, learned = false;
  function clearHint() { clearTimeout(hintTimer); hint.textContent = ''; }
  function showHint(text, duration = 5500) {
    clearHint(); hint.textContent = text;
    hintTimer = setTimeout(clearHint, duration);
  }
  function announce(text) {
    clearTimeout(noticeTimer); notice.textContent = text;
    noticeTimer = setTimeout(() => { notice.textContent = ''; }, 2600);
  }
  function sparkle(id) {
    const object = document.querySelector('#obj-' + id);
    if (!object) return;
    const box = object.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const burst = document.createElement('span');
    burst.className = 'discovery-sparkles'; burst.textContent = '✧ · ✦ · ✧';
    burst.setAttribute('aria-hidden', 'true');
    burst.style.left = (box.x + box.width / 2) + 'px';
    burst.style.top = (box.y + box.height / 2) + 'px';
    document.body.append(burst); setTimeout(() => burst.remove(), 850);
  }
  function enter() {
    clearHint(); notice.textContent = '';
    if (!audio && sound) chime();
    const stage = document.querySelector('#stage');
    stage.classList.remove('room-arrival'); void stage.offsetWidth;
    stage.classList.add('room-arrival');
    if (state.room === 0 && !roomDone(0) && !learned && !shifted) {
      hintTimer = setTimeout(() => {
        if (state.view === 'room' && state.room === 0 && !roomDone(0) && !shifted && !document.querySelector('dialog[open]'))
          showHint('Try switching realities.');
      }, 12000);
    }
  }
  function discover(id) {
    if (noticed.has(id)) return;
    noticed.add(id); sparkle(id); announce('Clue discovered.'); chime();
    if (id === 'clue') { learned = true; clearHint(); }
  }
  function shift() {
    clearHint();
    if (state.room === 0 && !shifted && !learned && !roomDone(0)) showHint('Look closely. What changed?');
    shifted = true;
  }
  function solved() { clearHint(); announce('Puzzle solved!'); }
  function reset() {
    noticed.clear(); shifted = learned = false; clearHint();
    clearTimeout(noticeTimer); notice.textContent = '';
    document.querySelectorAll('.discovery-sparkles').forEach(el => el.remove());
  }
  document.querySelector('#map').addEventListener('click', clearHint);
  document.querySelector('#home').addEventListener('click', clearHint);
  return { enter, discover, shift, solved, reset };
})();
