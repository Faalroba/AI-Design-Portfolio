/* Opening controls and optional Help, without in-room tutorial prompts. */
(() => {
  'use strict';
  const help = document.querySelector('#controls-help');
  const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
  let touched = false;
  function useTouchInstructions() {
    document.body.classList.toggle('touch-instructions', touched || touchQuery.matches);
  }
  document.querySelector('#help').addEventListener('click', () => help.showModal());
  document.querySelector('#close-help').addEventListener('click', () => help.close());
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || touched) return;
    touched = true;
    useTouchInstructions();
  }, true);
  touchQuery.addEventListener('change', useTouchInstructions);
  useTouchInstructions();
})();