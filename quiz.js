/* ==========================================================
   Quiz Module — 10 pertanyaan pilihan ganda
   ========================================================== */
(function() {
  const QUESTIONS = [
    { q: 'Bangun ruang yang memiliki 6 sisi berbentuk persegi sama besar adalah…',
      opts: ['Balok', 'Kubus', 'Tabung', 'Bola'], ans: 1,
      exp: 'Kubus memiliki 6 sisi persegi yang sama besar.' },
    { q: 'Berapa jumlah rusuk pada kubus?',
      opts: ['6', '8', '12', '16'], ans: 2,
      exp: 'Kubus memiliki 12 rusuk yang sama panjang.' },
    { q: 'Benda sehari-hari yang berbentuk tabung adalah…',
      opts: ['Dadu', 'Kaleng susu', 'Bola sepak', 'Topi ulang tahun'], ans: 1,
      exp: 'Kaleng susu berbentuk tabung.' },
    { q: 'Rumus volume kubus dengan rusuk s adalah…',
      opts: ['s × s', '6 × s', 's × s × s', '4 × s'], ans: 2,
      exp: 'Volume kubus = s × s × s.' },
    { q: 'Bangun ruang yang tidak memiliki titik sudut adalah…',
      opts: ['Kubus', 'Balok', 'Bola', 'Kerucut'], ans: 2,
      exp: 'Bola tidak memiliki rusuk dan tidak memiliki titik sudut.' },
    { q: 'Rumus volume tabung adalah…',
      opts: ['π × r² × t', 'p × l × t', '⅓ × π × r² × t', 's × s × s'], ans: 0,
      exp: 'Volume tabung = π × r² × t.' },
    { q: 'Bangun ruang yang memiliki 1 titik puncak adalah…',
      opts: ['Tabung', 'Bola', 'Kerucut', 'Balok'], ans: 2,
      exp: 'Kerucut memiliki 1 titik puncak.' },
    { q: 'Contoh benda berbentuk bola adalah…',
      opts: ['Kotak pensil', 'Globe', 'Kaleng', 'Rubik'], ans: 1,
      exp: 'Globe berbentuk bola.' },
    { q: 'Rumus luas permukaan bola dengan jari-jari r adalah…',
      opts: ['2πr', '4πr²', 'πr²', '⅓πr²'], ans: 1,
      exp: 'Luas permukaan bola = 4 × π × r².' },
    { q: 'Balok memiliki berapa titik sudut?',
      opts: ['4', '6', '8', '12'], ans: 2,
      exp: 'Balok memiliki 8 titik sudut.' }
  ];

  let idx = 0, score = 0, answered = false;

  const elQ = document.getElementById('quiz-question');
  const elOpts = document.getElementById('quiz-options');
  const elFb = document.getElementById('quiz-feedback');
  const elNext = document.getElementById('quiz-next');
  const elProg = document.getElementById('quiz-progress');
  const elScore = document.getElementById('quiz-score');
  const elResult = document.getElementById('quiz-result');
  const elBody = document.getElementById('quiz-body');

  function start() {
    idx = 0; score = 0;
    elResult.classList.add('hidden');
    elBody.classList.remove('hidden');
    render();
  }

  function render() {
    answered = false;
    const q = QUESTIONS[idx];
    elProg.textContent = 'Pertanyaan ' + (idx + 1) + ' / ' + QUESTIONS.length;
    elScore.textContent = 'Skor: ' + score;
    elQ.textContent = q.q;
    elOpts.innerHTML = '';
    q.opts.forEach((opt, i) => {
      const b = document.createElement('button');
      b.className = 'quiz-opt';
      b.textContent = String.fromCharCode(65 + i) + '. ' + opt;
      b.addEventListener('click', () => choose(i, b));
      elOpts.appendChild(b);
    });
    elFb.classList.add('hidden');
    elFb.className = 'quiz-feedback hidden';
    elNext.disabled = true;
    elNext.textContent = idx === QUESTIONS.length - 1 ? 'Lihat Hasil 🎉' : 'Lanjut ➡️';
  }

  function choose(i, btn) {
    if (answered) return;
    answered = true;
    const q = QUESTIONS[idx];
    const all = elOpts.querySelectorAll('.quiz-opt');
    all.forEach(b => b.disabled = true);
    if (i === q.ans) {
      btn.classList.add('correct');
      score++;
      elScore.textContent = 'Skor: ' + score;
      elFb.textContent = '✅ Benar! ' + q.exp;
      elFb.className = 'quiz-feedback ok';
      window.playBeep('ok');
    } else {
      btn.classList.add('wrong');
      all[q.ans].classList.add('correct');
      elFb.textContent = '❌ Belum tepat. ' + q.exp;
      elFb.className = 'quiz-feedback no';
      window.playBeep('no');
    }
    elNext.disabled = false;
  }

  elNext.addEventListener('click', () => {
    if (idx < QUESTIONS.length - 1) { idx++; render(); }
    else { finish(); }
  });

  function finish() {
    elBody.classList.add('hidden');
    elResult.classList.remove('hidden');
    document.getElementById('quiz-final-score').textContent =
      'Skor akhir: ' + score + ' / ' + QUESTIONS.length;
    let msg = '';
    if (score === QUESTIONS.length) msg = '🌟 Sempurna! Kamu hebat sekali!';
    else if (score >= 7) msg = '👍 Bagus! Sedikit lagi menuju sempurna.';
    else if (score >= 4) msg = '💪 Semangat! Coba pelajari lagi materinya, ya.';
    else msg = '📚 Jangan menyerah! Yuk baca materi lagi dari awal.';
    document.getElementById('quiz-message').textContent = msg;
  }

  document.getElementById('quiz-restart').addEventListener('click', start);

  window.Quiz = { start };
})();