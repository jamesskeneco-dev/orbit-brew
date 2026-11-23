// Chatbot: a Dify chatbot (Orbi) that opens in a panel from the coffee button.
// It is used on both pages.
(function chat() {
  const BOT = 'https://udify.app/chatbot/4KtTYpd3NOUHhDjg';
  const btn = document.createElement('button');
  btn.id = 'chat-toggle';
  btn.setAttribute('aria-label', 'Open the Orbit Brew chatbot');
  btn.innerHTML = '<span aria-hidden="true">☕</span> Chat with Orbi';
  const win = document.createElement('div');
  win.id = 'chat-window';
  document.body.append(win, btn);

  function toggle(forceOpen) {
    if (!win.firstChild) {
      const f = document.createElement('iframe');
      f.src = BOT;
      f.title = 'Orbit Brew chatbot';
      f.allow = 'microphone; clipboard-write';
      win.appendChild(f);
    }
    const open = win.classList.toggle('open', forceOpen === true ? true : undefined);
    btn.innerHTML = open ? '✕ Close chat' : '<span aria-hidden="true">☕</span> Chat with Orbi';
    btn.setAttribute('aria-label', open ? 'Close the chatbot' : 'Open the Orbit Brew chatbot');
  }
  btn.addEventListener('click', () => toggle());
  document.querySelectorAll('[data-open-chat]').forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); toggle(true); }));
  window.openOrbitChat = () => toggle(true);
})();

// Blend Finder (the landing page's extra feature)
(function blendFinder() {
  const box = document.getElementById('quiz');
  if (!box) return;

  const blends = {
    launchpad: { name: 'Launchpad', color: '#e0894a', note: 'A dark roast with chocolate notes. It is the strongest of the four and holds up well to milk.', how: 'Try it: 1 part concentrate to 2 parts cold water, over ice.' },
    moonbeam: { name: 'Moonbeam', color: '#d9a066', note: 'A medium roast with caramel and vanilla notes. It is the sweetest-tasting blend without adding sugar.', how: 'Try it: 1 part concentrate to 2 parts oat or whole milk.' },
    nebula: { name: 'Nebula', color: '#e07a98', note: 'A light roast with berry and citrus notes. It is bright and less bitter than a typical cold brew.', how: 'Try it: 1 part concentrate to 2 parts tonic water with a slice of orange.' },
    zerog: { name: 'Zero-G', color: '#7aa6c2', note: 'A Swiss Water decaf with a nutty finish, for coffee in the afternoon or evening.', how: 'Try it: 1 part concentrate to 2 parts milk, warmed if you like.' }
  };

  const questions = [
    { q: 'When do you usually drink coffee?', a: [['Early morning', 'launchpad'], ['Mid-afternoon', 'moonbeam'], ['Weekend brunch', 'nebula'], ['After dinner', 'zerog']] },
    { q: 'Which dessert sounds best?', a: [['Dark chocolate', 'launchpad'], ['Crème brûlée', 'moonbeam'], ['Lemon tart', 'nebula'], ['Almond biscotti', 'zerog']] },
    { q: 'How do you take your coffee?', a: [['Black', 'launchpad'], ['With milk', 'moonbeam'], ['Over tonic or sparkling water', 'nebula'], ['Decaf only', 'zerog']] }
  ];

  let step = 0;
  let score = {};

  function render() {
    const pct = (step / questions.length) * 100;

    if (step === questions.length) {
      // Highest score wins; ties go to the most recent answer.
      const last = box.dataset.last;
      const best = Object.keys(score).sort((a, b) => score[b] - score[a] || (b === last) - (a === last))[0];
      const b = blends[best];
      box.innerHTML = `
        <div class="progress"><div style="width:100%"></div></div>
        <div class="result">
          <p class="label">Your match</p>
          <h3 style="color:${b.color}">${b.name}</h3>
          <p>${b.note}</p>
          <p class="how">${b.how}</p>
          <div class="actions" style="justify-content:center;display:flex;gap:12px;flex-wrap:wrap;margin-top:18px">
            <button class="btn" id="again">Start over</button>
            <button class="btn ghost" id="ask">Ask Orbi about ${b.name}</button>
          </div>
        </div>`;
      document.getElementById('again').onclick = () => { step = 0; score = {}; render(); };
      document.getElementById('ask').onclick = () => window.openOrbitChat && window.openOrbitChat();
      return;
    }

    const cur = questions[step];
    box.innerHTML = `
      <div class="progress"><div style="width:${pct}%"></div></div>
      <p class="sub">Question ${step + 1} of ${questions.length}</p>
      <h3>${cur.q}</h3>
      <div class="options">${cur.a.map(([text, key]) => `<button data-k="${key}">${text}</button>`).join('')}</div>`;
    box.querySelectorAll('.options button').forEach(btn => btn.onclick = () => {
      const k = btn.dataset.k;
      score[k] = (score[k] || 0) + 1;
      box.dataset.last = k;
      step++;
      render();
    });
  }

  render();
})();
