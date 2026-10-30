(() => {
  'use strict';
  // --- Synthesized game feedback; gem recordings are handled separately.
  const AudioFX = (() => {
    let ctx = null;
    const ensure = () => ctx ?? (ctx = new (window.AudioContext || window.webkitAudioContext)());
    const now = () => ensure().currentTime;

    function tone({type="sine", freq=440, dur=0.12, gain=0.06, detune=0, ramp=true}) {
      const c = ensure();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = detune;
      g.gain.value = 0.0001;
      o.connect(g);
      g.connect(c.destination);
      const t0 = now();
      o.start(t0);
      if (ramp) {
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      } else {
        g.gain.setValueAtTime(gain, t0);
        g.gain.setValueAtTime(0.0001, t0 + dur);
      }
      o.stop(t0 + dur + 0.01);
    }

    function swish() {
      // quick upward glide = "flip"
      const c = ensure();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "triangle";
      g.gain.value = 0.0001;
      o.connect(g); g.connect(c.destination);
      const t0 = now();
      o.frequency.setValueAtTime(260, t0);
      o.frequency.exponentialRampToValueAtTime(820, t0 + 0.12);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.06, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
      o.start(t0); o.stop(t0 + 0.16);
    }

    function buzz() {
      // low short "wrong"
      tone({type:"sawtooth", freq:110, dur:0.18, gain:0.05});
      tone({type:"sawtooth", freq:92, dur:0.18, gain:0.04, detune:-20});
    }

    function ding() {
      // pleasant "correct"
      tone({type:"sine", freq:784, dur:0.14, gain:0.05});
      tone({type:"sine", freq:1046.5, dur:0.12, gain:0.04, detune:5});
    }

    function brassNote(freq, startOffset){
      // "brassy" note: saw + lowpass filter + fast attack, short decay
      const c = ensure();
      const t0 = now() + (startOffset || 0);

      const o1 = c.createOscillator();
      const o2 = c.createOscillator();
      const g = c.createGain();
      const f = c.createBiquadFilter();

      o1.type = "sawtooth";
      o2.type = "square";
      o1.frequency.setValueAtTime(freq, t0);
      o2.frequency.setValueAtTime(freq * 2, t0);

      f.type = "lowpass";
      f.frequency.setValueAtTime(1400, t0);
      f.frequency.exponentialRampToValueAtTime(800, t0 + 0.18);

      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.10, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);

      o1.connect(f); o2.connect(f);
      f.connect(g); g.connect(c.destination);

      // tiny pitch "blat" for trumpet feel
      o1.frequency.exponentialRampToValueAtTime(freq * 0.995, t0 + 0.10);

      o1.start(t0); o2.start(t0);
      o1.stop(t0 + 0.30); o2.stop(t0 + 0.30);
    }

    function fanfare(){
      // Short celebratory fanfare: C5–E5–G5–C6 with a little ending flourish
      // Frequencies (Hz): C5 523.25, E5 659.25, G5 783.99, C6 1046.5, G5 783.99, E5 659.25
      const seq = [
        {f:523.25, t:0.00},
        {f:659.25, t:0.16},
        {f:783.99, t:0.32},
        {f:1046.5, t:0.48},
        {f:783.99, t:0.72},
        {f:659.25, t:0.88},
        {f:783.99, t:1.04},
      ];
      seq.forEach(n => brassNote(n.f, n.t));
    }

    return { swish, buzz, ding, fanfare, resume: () => ensure().resume() };
  })();

  const {GLYPH,LETTERS,Game,fresh,validate}=RuneMatch;
  const $=id=>document.getElementById(id);
  const SAVE_KEY='rune-match:save:v1';
  const LOCK_NAME='rune-match:save';
  const TUTORIAL_KEY='rune-match:tutorial:v1';
  let tutorialStep=0;
  let game=new Game(), muted=false, lastRaw=null, processing=false, timer=null, epoch=0;
  let storageAvailable=true, returnFocus=null;
  const cards=new Map();
  let gemPlayer=null,gemPlayerMuted=false;
  function prepareGemAudio(){
      if(!gemPlayer){
        const Context=window.AudioContext||window.webkitAudioContext;
        gemPlayer=GemAudio.create({context:new Context(),fetchAudio:url=>fetch(url),
          onError:()=>announce('This gem sound could not play. Try again.')});
        gemPlayer.preload();
      }
  }
  function playGem(color){
    if(muted)return;
    try {
      prepareGemAudio();
      gemPlayer.play(color);
    }catch{announce('Gem audio is unavailable in this browser.');}
  }
  for(const color of ['blue','green','purple','yellow','red']){
    const button=$('gem-'+color);
    button.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      playGem(color);
    });
    // Keyboard and assistive technology clicks have no pointer click count.
    button.addEventListener('click',event=>{if(event.detail===0)playGem(color);});
  }

  const announce=message=>{$('feedback').textContent=message;};
  const warn=message=>{$('saveStatus').textContent=message;sizeBoard();};
  function decode(raw) {
    const s=JSON.parse(raw);
    if (!s || s.version!==1 || typeof s.muted!=='boolean' || typeof s.revision!=='string') throw new Error('Invalid save');
    return {game:validate(s.game),muted:s.muted};
  }
  function cancelTurn() { clearTimeout(timer); timer=null; epoch++; game.settle(); }
  function adopt(raw, message) {
    cancelTurn();
    const s=raw===null?{game:fresh(),muted:false}:decode(raw);
    game=new Game(s.game); muted=s.muted; lastRaw=raw;
    if ($('completeOverlay').open) $('completeOverlay').close();
    buildBoard();render();
    if(message) announce(message);
  }
  function storageFailure() {
    storageAvailable=false;
    warn('Progress cannot be saved in this browser. You can keep playing, but keep this page open; closing or reloading may lose your progress.');
  }
  function remoteChanged() {
    if(!storageAvailable) return false;
    try {
      const raw=localStorage.getItem(SAVE_KEY);
      if(raw===lastRaw) return false;
      try { adopt(raw,'Progress changed in another tab. The latest saved game is now loaded; choose your card again.'); }
      catch { warn('Another tab wrote an unreadable save. Reload to recover before continuing.'); }
      return true;
    } catch {storageFailure();return false;}
  }
  function persist() {
    if(!storageAvailable) return;
    const raw=JSON.stringify({version:1,game:game.snapshot(),muted,revision:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2)});
    try {localStorage.setItem(SAVE_KEY,raw);lastRaw=raw;}
    catch {storageFailure();}
  }
  // Web Locks serializes the read/check/write across tabs. The fallback also
  // checks for external changes immediately before each synchronous mutation.
  async function transact(action) {
    if(processing) return;
    processing=true;
    const run=()=>{if(!remoteChanged()) action();};
    try {
      if(navigator.locks?.request && storageAvailable) await navigator.locks.request(LOCK_NAME,run);
      else run();
    } catch { warn('The browser could not coordinate this action. Try again, using one game tab.'); }
    finally {processing=false;}
  }
  function sound(name) {
    if(muted) return;
    try {
      // Never await sound in the input path, including a suspended audio context.
      const result=name==='resume'?AudioFX.resume():AudioFX[name]();
      if(result?.catch) result.catch(()=>{});
    } catch {} // An unavailable sound device must never affect the game.
  }
  function buildBoard() {
    cards.clear();$('grid').replaceChildren();
    game.state.deck.forEach((id,index)=>{
      const el=document.createElement('button');
      el.type='button';el.className='card';el.dataset.id=id;
      el.innerHTML=`<span class="inner" aria-hidden="true"><span class="face front"><span class="seal"></span><span class="cardSeal"></span></span><span class="face back"><span class="seal"></span>${RuneArtwork.render(id[0])}</span></span>`;
      el.addEventListener('click',()=>flip(id));
      el.dataset.position=String(index+1);cards.set(id,el);$('grid').append(el);
    });
  }
  function renderKey(target) {
    target.replaceChildren();
    const matched=game.state.matched;
    if(matched.length===0) {
      const p=document.createElement('p');p.className='emptyKey';p.textContent='Match two identical runes to discover your first letter.';target.append(p);return;
    }
    for(const letter of LETTERS.filter(l=>matched.includes(l))) {
      const row=document.createElement('div');row.className='keyTile';
      row.innerHTML=`<div class="L">${letter}</div><div class="G">${RuneArtwork.render(letter,"keyRune")}</div>`;
      row.setAttribute('aria-label',`${letter}: rune ${GLYPH[letter]}`);target.append(row);
    }
  }
  function render() {
    const matched=game.state.matched;
    $('downloadCipher').hidden=matched.length!==26;
    $('downloadCipherDialog').hidden=matched.length!==26;
    $('mute').textContent=muted?'Sound off':'Sound on';$('mute').setAttribute('aria-pressed',String(muted));
    if(gemPlayer && gemPlayerMuted!==muted){gemPlayer.setMuted(muted);gemPlayerMuted=muted;}
    $('mute').setAttribute('aria-label',muted?'Sound muted. Enable sound':'Sound enabled. Mute sound');
    for(const [id,el] of cards) {
      const done=matched.includes(id[0]),up=done||game.open.includes(id);
      el.classList.toggle('matched',done);el.classList.toggle('flipped',up);
      el.setAttribute('aria-disabled',String(done || game.open.length===2));
      el.setAttribute('aria-label',`Card ${el.dataset.position}: ${done?`matched, letter ${id[0]}, rune ${GLYPH[id[0]]}`:up?`exposed rune ${GLYPH[id[0]]}`:'hidden'}`);
    }
    $('cipherTitle').textContent=matched.length===26?'Cipher Complete — A–Z Key':'Discovered Cipher — '+matched.length+' / 26';
    if($('completeOverlay').open) renderKey($('fullKey'));
    sizeBoard();
  }
  function showCipher() {
    renderKey($('fullKey'));
    if(!$('completeOverlay').open) {
      returnFocus=document.activeElement;
      $('completeOverlay').showModal();$('closeOverlay').focus();
    }
  }
  function settle(result) {
    timer=null;game.settle();render();
    if(result.complete) {announce('Cipher complete. All 26 letters are available. Return here whenever you need the key.');sound('fanfare');showCipher();}
  }
  function flip(id) {
    if($('tutorial').open || $('completeOverlay').open) return;
    // The busy flag is set synchronously, before waiting for a cross-tab lock.
    transact(()=>{
      const result=game.select(id);
      if(result.type==='ignored') return;
      if(result.type!=='first') persist(); // Commit earned matches before animation.
      render();sound('resume');sound('swish');
      if(result.type==='first') {announce(`Rune ${GLYPH[id[0]]} exposed. Choose another card.`);return;}
      const thisEpoch=epoch;
      if(result.type==='match') {announce(`Match found. ${result.letter} is ${GLYPH[result.letter]}.`);sound('ding');}
      else {announce('Those runes do not match. Try again after they turn back over.');sound('buzz');}
      timer=setTimeout(()=>{if(epoch===thisEpoch) settle(result);},result.type==='match'?220:1000);
    });
  }
  $('mute').addEventListener('click',()=>transact(()=>{muted=!muted;persist();render();if(!muted)sound('resume');}));
  $('viewCipher').addEventListener('click',showCipher);
  $('closeOverlay').addEventListener('click',()=>$('completeOverlay').close());
  $('completeOverlay').addEventListener('click',e=>{if(e.target===$('completeOverlay')) $('completeOverlay').close();});
  $('completeOverlay').addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
  const tutorialPages=[
    {title:'Find matching runes',text:'Turn over two cards. Look for identical rune shapes. If they differ, they turn back over—remember where you saw them.',art:()=>`<span class="tutorialTile">${RuneArtwork.render('A')}</span><span class="tutorialTile">${RuneArtwork.render('A')}</span>`},
    {title:'Build your cipher',text:'Each matching pair reveals a letter. Open View cipher whenever you want to see the letters you have deciphered.',art:()=>`<span class="tutorialTile">${RuneArtwork.render('A')}</span><span class="tutorialLetter">= ?</span>`},
    {title:'Keep what you discover',text:'Your progress saves in this browser. Return here to keep playing or consult your cipher. Match all 26 pairs to download the complete key for later in your adventure.',art:()=>`<span class="tutorialTile">${RuneArtwork.render('S')}</span><span class="tutorialTile">${RuneArtwork.render('W')}</span>`}
  ];
  function renderTutorial(){
    const page=tutorialPages[tutorialStep];
    $('tutorialStep').textContent=`${tutorialStep+1} / ${tutorialPages.length}`;
    $('tutorialTitle').textContent=page.title;$('tutorialText').textContent=page.text;$('tutorialArt').innerHTML=page.art();
    $('tutorialBack').hidden=tutorialStep===0;
    $('tutorialNext').textContent=tutorialStep===tutorialPages.length-1?'Start playing':'Next';
  }
  function openTutorial(){
    if($('completeOverlay').open) $('completeOverlay').close();
    tutorialStep=0;renderTutorial();$('tutorial').showModal();$('tutorialNext').focus();
  }
  function finishTutorial(){
    try {localStorage.setItem(TUTORIAL_KEY,'seen');} catch {}
    $('tutorial').close();
  }
  $('tutorialNext').addEventListener('click',()=>{
    if(tutorialStep===tutorialPages.length-1)finishTutorial();
    else {tutorialStep++;renderTutorial();$('tutorialNext').focus();}
  });
  $('tutorialBack').addEventListener('click',()=>{tutorialStep=Math.max(0,tutorialStep-1);renderTutorial();$('tutorialNext').focus();});
  $('skipTutorial').addEventListener('click',finishTutorial);
  $('tutorial').addEventListener('cancel',e=>{e.preventDefault();finishTutorial();});
  $('tutorial').addEventListener('close',()=>{$('viewCipher').focus();});
  $('howToPlay').addEventListener('click',openTutorial);
  $('startOver').addEventListener('click',()=>{
    if(!window.confirm('Start over? This clears all discovered letters and shuffles a new board. Your sound preference will be kept.')) return;
    transact(()=>{
      cancelTurn();game=new Game();persist();buildBoard();render();
      $('completeOverlay').close();
      if($('grid').parentElement) $('grid').parentElement.scrollTop=0;
      announce('New game started. All discovered letters have been cleared.');
      cards.values().next().value?.focus();
    });
  });
  function sizeBoard(){
    const grid=$('grid');
    if(!grid.getBoundingClientRect)return;
    // Safari toolbars change the visual viewport without changing innerHeight.
    const viewport=window.visualViewport;
    document.documentElement.style.setProperty('--screen-height',`${viewport?.height || window.innerHeight}px`);
    const rect=grid.getBoundingClientRect(),gap=window.innerWidth<=480?6:8;
    const bottomPadding=parseFloat(window.getComputedStyle(document.body).paddingBottom)||0;
    const bottomGap=parseFloat(window.getComputedStyle(grid.parentElement).paddingBottom)||0;
    const main=grid.parentElement;
    const topGap=parseFloat(window.getComputedStyle(main).paddingTop)||0;
    const height=Math.max(44,main.clientHeight ? main.clientHeight-topGap-bottomGap : window.innerHeight-(rect.top+window.scrollY)-bottomGap-bottomPadding);
    const fitted=RuneLayout.fit(rect.width,height,52,gap,44,1086/1448);
    grid.style.gridTemplateColumns=`repeat(${fitted.columns}, minmax(0, 1fr))`;
    grid.style.gridTemplateRows=`repeat(${fitted.rows}, minmax(44px, 1fr))`;
    grid.style.height=`${fitted.height}px`;grid.style.minHeight='0';
    grid.style.setProperty('--tile-width',`${fitted.tileWidth}px`);
    grid.style.setProperty('--tile-height',`${fitted.tileHeight}px`);
  }
  window.addEventListener('resize',sizeBoard);
  window.visualViewport?.addEventListener('resize',sizeBoard);
  window.addEventListener('orientationchange',sizeBoard);
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(sizeBoard).observe($('gameHeader'));
  window.addEventListener('storage',e=>{if(e.key===SAVE_KEY || e.key===null) remoteChanged();});
  window.addEventListener('pageshow',()=>remoteChanged());
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) remoteChanged();
    // A hidden page may have its timers suspended. Resolve the visual turn now;
    // the saved state already contains the move and any earned match.
    if(document.hidden && timer!==null) {clearTimeout(timer);timer=null;game.settle();render();}
  });
  try {
    const raw=localStorage.getItem(SAVE_KEY);
    if(raw!==null) {
      try {const saved=decode(raw);game=new Game(saved.game);muted=saved.muted;lastRaw=raw;}
      catch {
        // Preserve the original for organizer recovery before replacing it.
        try {localStorage.setItem(SAVE_KEY+':recovery',raw);} catch {}
        lastRaw=raw;warn('The saved game could not be read. A fresh game has been started; an original copy was kept when browser storage allowed it.');
      }
    }
  } catch {storageFailure();}
  try {prepareGemAudio();} catch {} // Preload without starting audio; gestures resume it.
  buildBoard();render();
  try {if(localStorage.getItem(TUTORIAL_KEY)!=='seen')openTutorial();} catch {openTutorial();}
  if(game.state.matched.length===26) announce('Welcome back. Your complete cipher is available through View cipher.');
  // Initialize under the same lock as every other writer. A newer tab wins.
  transact(()=>{
    if(lastRaw!==null) {try {decode(lastRaw);return;} catch {}}
    persist();
  });
})();
