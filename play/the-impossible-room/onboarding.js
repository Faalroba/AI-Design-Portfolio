/* First-visit guidance observes the existing controls without driving puzzle state. */
(() => {
  'use strict';

  const welcome = document.querySelector('#welcome');
  const help = document.querySelector('#controls-help');
  const tutorial = document.querySelector('#tutorial');
  const tutorialText = document.querySelector('#tutorial-text');
  const tutorialLabel = document.querySelector('#tutorial-label');
  const wand = document.querySelector('#wand');
  const stage = document.querySelector('#stage');
  const touchQuery = window.matchMedia('(hover: none) and (pointer: coarse)');
  const investigationActions = new Set(['table', 'chair', 'ornament', 'clue', 'cabinet']);
  let touchMode = touchQuery.matches;
  let touched = false;
  let phase = 'inactive';
  let shifted = false;
  let investigated = false;
  let promptTimer;
  let dismissTimer;

  function useTouchInstructions() {
    document.body.classList.toggle('touch-instructions', touchMode);
  }

  function clearHighlights() {
    document.querySelectorAll('.tutorial-target').forEach(element => {
      element.classList.remove('tutorial-target');
    });
    wand.classList.remove('tutorial-wand');
  }

  function closeTutorial() {
    window.clearTimeout(promptTimer);
    window.clearTimeout(dismissTimer);
    phase = 'inactive';
    tutorial.hidden = true;
    clearHighlights();
  }

  function paintTutorial() {
    clearHighlights();
    if (phase === 'inactive') return;
    tutorial.hidden = false;
    tutorialLabel.textContent = phase === 'done' ? 'THE ROOM IS YOURS' : 'A LITTLE GUIDANCE';

    if (phase === 'wand') {
      tutorialText.textContent = 'Your wand can reveal what the eye cannot see.';
      wand.classList.add('tutorial-wand');
      if (touchMode) stage.querySelector('#obj-mirror')?.classList.add('tutorial-target');
    }
    if (phase === 'shift') {
      tutorialText.textContent = touchMode
        ? 'Tap the mirror with your wand to shift reality.'
        : 'Use your wand to shift reality.';
      stage.querySelector('#obj-mirror')?.classList.add('tutorial-target');
      wand.classList.add('tutorial-wand');
    }
    if (phase === 'observe') {
      tutorialText.textContent = 'Look closely. What changed?';
    }
    if (phase === 'objects') {
      tutorialText.textContent = touchMode
        ? 'Some objects hide secrets. Tap an object to investigate.'
        : 'Some objects hide secrets. Move your cursor to discover them.';
      stage.querySelector('#obj-table')?.classList.add('tutorial-target');
    }
    if (phase === 'investigate') {
      tutorialText.textContent = touchMode ? 'Tap to investigate.' : 'Click to investigate.';
    }
    if (phase === 'done') {
      tutorialText.textContent = "You're ready. Explore both realities and uncover the secrets of this room.";
    }
  }

  function finishTutorial() {
    if (phase === 'inactive' || phase === 'done') return;
    window.clearTimeout(promptTimer);
    phase = 'done';
    paintTutorial();
    dismissTimer = window.setTimeout(closeTutorial, 4500);
  }

  function showWelcome() {
    closeTutorial();
    shifted = false;
    investigated = false;
    help.close();
    if (!welcome.open) welcome.showModal();
    welcome.querySelector('.welcome-content').scrollTop = 0;
  }

  function startIntroduction() {
    welcome.close();
    enter(0);
    phase = 'wand';
    paintTutorial();
    promptTimer = window.setTimeout(() => {
      if (phase !== 'wand') return;
      phase = 'shift';
      paintTutorial();
    }, 2400);
  }

  document.querySelector('#start-game').addEventListener('click', startIntroduction);
  document.querySelector('#skip-tutorial').addEventListener('click', closeTutorial);
  document.querySelector('#help').addEventListener('click', () => help.showModal());
  document.querySelector('#close-help').addEventListener('click', () => help.close());
  welcome.addEventListener('cancel', event => event.preventDefault());

  // Capture before SVG hotspots stop propagation, then inspect the result of their action.
  function observeInteraction(event) {
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    const target = event.target.closest('[data-action], button');
    if (!target) return;
    if (event.type === 'keydown' && !target.dataset.action) return;
    const action = target.dataset.action;
    const previousReality = state.reality;
    const restartRequested = target.id === 'confirm-restart' || target.id === 'play-again';

    window.setTimeout(() => {
      if (restartRequested) {
        showWelcome();
        return;
      }
      if (phase === 'inactive' || phase === 'done') return;
      if (state.view !== 'room' || state.room !== 0) {
        closeTutorial();
        return;
      }
      if (investigationActions.has(action)) {
        investigated = true;
        if (shifted) finishTutorial();
      }
      if (action === 'mirror' && state.reality !== previousReality && !shifted) {
        shifted = true;
        window.clearTimeout(promptTimer);
        phase = 'observe';
        paintTutorial();
        promptTimer = window.setTimeout(() => {
          if (phase !== 'observe') return;
          if (investigated) {
            finishTutorial();
          } else {
            phase = 'objects';
            paintTutorial();
          }
        }, 1800);
      }
    }, 0);
  }
  document.addEventListener('click', observeInteraction, true);
  document.addEventListener('keydown', observeInteraction, true);

  function offerInvestigation(event) {
    if (phase !== 'objects' || touchMode) return;
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!investigationActions.has(action)) return;
    phase = 'investigate';
    paintTutorial();
  }
  document.addEventListener('pointerover', offerInvestigation, true);
  document.addEventListener('focusin', offerInvestigation);
  document.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch') return;
    touched = true;
    if (touchMode) return;
    touchMode = true;
    useTouchInstructions();
    paintTutorial();
  }, true);
  touchQuery.addEventListener('change', () => {
    touchMode = touched || touchQuery.matches;
    useTouchInstructions();
    paintTutorial();
  });

  // Renders and room navigation replace hotspots, so restore only the current highlight.
  new MutationObserver(() => {
    if (phase === 'inactive') return;
    if (state.view !== 'room' || state.room !== 0) {
      closeTutorial();
      return;
    }
    paintTutorial();
  }).observe(stage, {childList: true});

  useTouchInstructions();
  showWelcome();
})();
