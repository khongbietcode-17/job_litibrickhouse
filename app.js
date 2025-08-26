// Basic app for matrix + countdown + show name + image + settings stored in localStorage
(() => {
  const qs = s => document.querySelector(s);
  const matrix = qs('#matrix');
  const ctx = matrix.getContext('2d');
  let W, H;

  // Config with defaults (persisted)
  const defaultCfg = {
    text: 'HAPPY|BIRTHDAY|DEAR',
    color: '#ff69b4',
    delay: 3,
    audio: ''
  };
  const cfgKey = 'hb_cfg_v1';
  const cfg = Object.assign({}, defaultCfg, JSON.parse(localStorage.getItem(cfgKey) || '{}'));

  // Elements
  const countdownEl = qs('#countdown');
  const messageEl = qs('#message');
  const happyEl = qs('#happy');
  const nameEl = qs('#name');
  const portraitEl = qs('#portrait');
  const playBtn = qs('#playBtn');
  const settingsBtn = qs('#settingsBtn');
  const shareBtn = qs('#shareBtn');
  const modal = qs('#modal');
  const closeCfg = qs('#closeCfg');
  const saveCfg = qs('#saveCfg');
  const cfgText = qs('#cfgText');
  const cfgDelay = qs('#cfgDelay');
  const cfgColor = qs('#cfgColor');
  const cfgAudio = qs('#cfgAudio');
  const bgAudio = qs('#bgAudio');

  // parse query params
  const params = new URLSearchParams(location.search);
  const personName = decodeURIComponent(params.get('name') || params.get('n') || 'Someone');
  const imageURL = params.get('image') ? decodeURIComponent(params.get('image')) : null;

  // initialize settings UI
  cfgText.value = cfg.text;
  cfgDelay.value = cfg.delay;
  cfgColor.value = cfg.color;
  cfgAudio.value = cfg.audio || '';

  // set portrait src if provided
  if (imageURL) portraitEl.src = imageURL;

  // audio
  if (cfg.audio) bgAudio.src = cfg.audio;

  // set name
  nameEl.textContent = personName;

  // Resize canvas
  function resize() {
    W = matrix.width = innerWidth;
    H = matrix.height = innerHeight;
  }
  addEventListener('resize', resize);
  resize();

  // Matrix effect
  const fontSize = 20;
  let columns = Math.floor(W / fontSize);
  let drops = Array(columns).fill(1);
  function resetMatrix() {
    columns = Math.floor(W / fontSize);
    drops = Array(columns).fill(1);
  }
  resetMatrix();

  function drawMatrix() {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0,0,W,H);

    ctx.font = `${fontSize}px monospace`;
    const chars = cfg.text.split('|').join('').split('').concat([' ']); // base char set
    const color = cfg.color;

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      if (y > H && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  // animation loop
  let animId;
  function startMatrix() {
    cancelAnimationFrame(animId);
    function loop() {
      drawMatrix();
      animId = requestAnimationFrame(loop);
    }
    loop();
  }
  startMatrix();

  // Countdown and reveal sequence
  let running = false;
  async function runSequence() {
    if (running) return;
    running = true;
    // play audio if available
    if (bgAudio.src) {
      try { await bgAudio.play(); } catch(e) {}
    }
    const delay = Number(cfg.delay) || 3;
    countdownEl.classList.remove('hidden');
    messageEl.classList.add('hidden');
    portraitEl.classList.remove('show');

    for (let i = delay; i >= 1; i--) {
      countdownEl.textContent = i;
      await new Promise(r => setTimeout(r, 900));
    }
    // show message
    countdownEl.classList.add('hidden');
    messageEl.classList.remove('hidden');
    // animate happy -> name -> image
    happyEl.style.opacity = 0;
    happyEl.style.transition = 'opacity .8s ease';
    setTimeout(()=> happyEl.style.opacity = 1, 50);
    await new Promise(r => setTimeout(r, 1200));
    nameEl.style.opacity = 0;
    nameEl.style.transition = 'opacity .8s ease, transform .8s';
    setTimeout(()=> { nameEl.style.opacity = 1; nameEl.style.transform = 'translateY(0)'; }, 60);
    await new Promise(r => setTimeout(r, 1000));
    if (portraitEl.src) {
      portraitEl.classList.add('show');
    }
    running = false;
  }

  // UI events
  playBtn.addEventListener('click', runSequence);
  settingsBtn.addEventListener('click', () => modal.classList.remove('hidden'));
  closeCfg.addEventListener('click', () => modal.classList.add('hidden'));
  saveCfg.addEventListener('click', () => {
    cfg.text = cfgText.value || defaultCfg.text;
    cfg.delay = Number(cfgDelay.value) || defaultCfg.delay;
    cfg.color = cfgColor.value;
    cfg.audio = cfgAudio.value.trim();
    localStorage.setItem(cfgKey, JSON.stringify(cfg));
    // apply audio and immediate changes
    if (cfg.audio) bgAudio.src = cfg.audio;
    modal.classList.add('hidden');
    // refresh matrix settings
    resetMatrix();
  });

  // share: build a URL with params
  shareBtn.addEventListener('click', async () => {
    const u = new URL(location.href.split('?')[0]);
    u.searchParams.set('name', encodeURIComponent(personName));
    if (portraitEl.src) u.searchParams.set('image', encodeURIComponent(portraitEl.src));
    u.searchParams.set('delay', cfg.delay);
    // copy to clipboard
    try {
      await navigator.clipboard.writeText(u.toString());
      alert('Link đã được copy: ' + u.toString());
    } catch (e) {
      prompt('Copy link', u.toString());
    }
  });

  // Auto-read some param overrides
  if (params.get('delay')) cfg.delay = Number(params.get('delay'));
  if (params.get('text')) { cfg.text = decodeURIComponent(params.get('text')); }
  if (params.get('color')) cfg.color = params.get('color');

  // expose simple API for dev testing
  window.__hb = { cfg, runSequence, startMatrix, resetMatrix };

})();
