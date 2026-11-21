/* View controls magnify existing art; all actions still use the puzzle controller. */
window.GameView = (() => {
  const stage = document.querySelector('#stage');
  const feedback = document.createElement('section');
  feedback.id = 'room-feedback'; feedback.setAttribute('aria-label', 'Room feedback');
  document.querySelector('.room-heading').after(feedback);
  feedback.append(document.querySelector('#message'), document.querySelector('#action-notice'), document.querySelector('#context-hint'));

  const tools = document.createElement('div'); tools.className = 'view-tools';
  tools.innerHTML = '<button id="zoom-room" aria-pressed="false" data-kind="info">Enlarge room</button><button id="inspect-mirror" data-kind="info" aria-haspopup="dialog" aria-controls="mirror-detail">Inspect mirror</button><p id="mirror-cue"></p><p id="zoom-hint" hidden>Scroll or swipe sideways to explore the enlarged room.</p>';
  stage.before(tools);
  const viewport = document.createElement('div'); viewport.className = 'scene-viewport';
  stage.before(viewport); viewport.append(stage);
  const zoom = tools.querySelector('#zoom-room');
  const inspect = tools.querySelector('#inspect-mirror');
  const cue = tools.querySelector('#mirror-cue');
  const detail = document.createElement('dialog');
  detail.id = 'mirror-detail'; detail.setAttribute('aria-labelledby','mirror-detail-title');
  detail.innerHTML = '<div class="mirror-detail-heading"><h2 id="mirror-detail-title">Mirror detail</h2><button id="close-mirror-detail" aria-label="Close mirror detail">Close</button></div><p id="mirror-detail-cue"></p><p id="mirror-detail-feedback" role="status"></p><div id="mirror-detail-art"></div>';
  document.body.append(detail);
  const narrow = matchMedia('(max-width: 750px)');
  let enlarged = false, lastRoom = null;
  function fit() {
    enlarged = false; stage.classList.remove('enlarged-room'); stage.style.width = '';
    zoom.textContent = 'Enlarge room'; zoom.setAttribute('aria-pressed','false');
    document.querySelector('#zoom-hint').hidden = true;
    viewport.scrollLeft = 0;
  }
  function frame() {
    const svg = stage.querySelector('svg');
    if (svg) svg.setAttribute('viewBox',narrow.matches?'120 15 830 565':'0 0 1000 590');
    if (enlarged) stage.style.width = Math.max(700, viewport.clientWidth * 1.65) + 'px';
  }
  function renderMirror() {
    const source = stage.querySelector('#obj-mirror');
    if (!source) { detail.close(); return; }
    const selectedAction = detail.contains(document.activeElement) ? document.activeElement.dataset.action : null;
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','205 65 175 320');
    svg.setAttribute('aria-label','Enlarged view of the same interactive mirror');
    const defs = stage.querySelector('svg > defs');
    if (defs) svg.append(defs.cloneNode(true));
    svg.append(source.cloneNode(true));
    const ids = new Map();
    svg.querySelectorAll('[id]').forEach(el => {
      const old = el.id; ids.set(old,'detail-'+old); el.id = 'detail-'+old;
    });
    svg.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        if (attr.value.includes('url(#')) {
          el.setAttribute(attr.name,attr.value.replace(/url\(#([^)]+)\)/g,(match,id)=>ids.has(id)?`url(#${ids.get(id)})`:match));
        }
      });
    });
    svg.querySelectorAll('[data-action]').forEach(el => {
      const activate = event => {
        if (event.type === 'keydown' && !['Enter',' '].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation(); act(el.dataset.action);
        if (detail.open) document.querySelector('#mirror-detail-feedback').textContent = document.querySelector('#message').textContent;
      };
      el.addEventListener('click',activate); el.addEventListener('keydown',activate);
    });
    document.querySelector('#mirror-detail-cue').textContent = cue.textContent;
    document.querySelector('#mirror-detail-feedback').textContent = document.querySelector('#message').textContent;
    document.querySelector('#mirror-detail-art').replaceChildren(svg);
    if (selectedAction) svg.querySelector(`[data-action="${selectedAction}"]`)?.focus();
  }
  function refresh() {
    if (lastRoom !== state.room) { fit(); detail.close(); lastRoom = state.room; }
    frame();
    const mirror = stage.querySelector('#obj-mirror');
    inspect.hidden = !mirror;
    cue.textContent = !mirror ? 'Use the key on the lock, then enter the doorway.' : mirror.dataset.kind === 'move'
      ? 'The mirror is now a passage. Click it to cross.'
      : 'Click the mirror frame to shift reality. Click details inside to investigate.';
    if (detail.open) renderMirror();
    if (!mirror) detail.close();
  }
  zoom.addEventListener('click',() => {
    if (enlarged) { fit(); return; }
    enlarged = true; stage.classList.add('enlarged-room'); frame();
    zoom.textContent = 'Fit whole room'; zoom.setAttribute('aria-pressed','true');
    document.querySelector('#zoom-hint').hidden = false;
    viewport.scrollLeft = (viewport.scrollWidth-viewport.clientWidth)/2;
  });
  inspect.addEventListener('click',() => { renderMirror(); detail.showModal(); });
  document.querySelector('#close-mirror-detail').addEventListener('click',() => detail.close());
  narrow.addEventListener('change',frame); window.addEventListener('resize',frame);
  return { refresh, closeMirror: () => detail.close(), reset: () => { fit(); detail.close(); lastRoom = null; } };
})();
