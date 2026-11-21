/* Original, gently evolving ambient score, synthesized locally without downloads. */
window.GameAmbience = (() => {
  const chords = [[48,55,62,63],[44,51,58,60],[51,58,62,65],[46,53,60,65]];
  let context, master, timer, chord = 0, active = false, muted = false;
  const voices = new Set();
  const note = n => 440 * 2 ** ((n - 69) / 12);
  function tone(midi, start, duration, level, bell = false, pan = 0) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const stereo = context.createStereoPanner();
    oscillator.type = 'sine'; oscillator.frequency.value = note(midi);
    stereo.pan.value = pan;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(level, start + (bell ? .04 : 2));
    gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(stereo).connect(master);
    voices.add(oscillator);
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); stereo.disconnect(); };
    oscillator.start(start); oscillator.stop(start + duration + .1);
  }
  function phrase() {
    const notes = chords[chord % chords.length];
    const now = context.currentTime + .04;
    notes.forEach((midi,i) => tone(midi, now, 10, .035, false, (i-1.5)*.3));
    tone(notes[2]+12, now+2.8, 3.5, .022, true, -.3);
    tone(notes[chord%2 ? 1 : 3]+12, now+6, 3.5, .018, true, .3);
    chord++;
  }
  function update() {
    const enabled = context && !muted && !document.hidden;
    if (enabled === active) return;
    active = Boolean(enabled);
    if (active) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(.7, context.currentTime, .5);
      phrase(); timer = setInterval(phrase, 8000);
    } else if (context) {
      clearInterval(timer);
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(0, context.currentTime, .12);
      voices.forEach(voice => { try { voice.stop(context.currentTime + .8); } catch {} });
    }
  }
  document.addEventListener('visibilitychange', update);
  return {
    start(audioContext) {
      if (!context) { context = audioContext; master = context.createGain(); master.gain.value = 0; master.connect(context.destination); }
      update();
    },
    setMuted(value) { muted = value; update(); }
  };
})();
