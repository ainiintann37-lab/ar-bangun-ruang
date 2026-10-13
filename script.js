/* ==========================================================
   GLOBAL STATE
   ========================================================== */
const APP = {
  selectedShape: null,
  detectedShape: null,
  soundOn: true,
  currentPage: 'home',
};

/* ==========================================================
   DATA MATERI BANGUN RUANG
   ========================================================== */
const SHAPES = {
  kubus: {
    nama: 'Kubus',
    icon: '🟨',
    warna: '#ffd54f',
    contoh: 'Dadu, rubik, kotak hadiah',
    pengertian: 'Kubus adalah bangun ruang yang memiliki 6 sisi berbentuk persegi yang sama besar.',
    ciri: [
      'Memiliki 6 sisi berbentuk persegi yang sama besar',
      'Memiliki 12 rusuk yang sama panjang',
      'Memiliki 8 titik sudut',
      'Semua sudutnya siku-siku (90°)'
    ],
    sisi: 6, rusuk: 12, titikSudut: 8,
    luas: 'L = 6 × s × s',
    volume: 'V = s × s × s',
    contohHitung: {
      soal: 'Sebuah kubus memiliki panjang rusuk 4 cm. Hitung luas permukaan dan volumenya!',
      langkah: [
        'Luas = 6 × s × s = 6 × 4 × 4 = 96 cm²',
        'Volume = s × s × s = 4 × 4 × 4 = 64 cm³'
      ]
    }
  },
  balok: {
    nama: 'Balok',
    icon: '🧱',
    warna: '#4fc3f7',
    contoh: 'Kotak pensil, kardus, buku',
    pengertian: 'Balok adalah bangun ruang yang memiliki 6 sisi berbentuk persegi panjang (atau 2 sisi persegi).',
    ciri: [
      'Memiliki 6 sisi (umumnya persegi panjang)',
      'Memiliki 12 rusuk (3 kelompok panjang berbeda)',
      'Memiliki 8 titik sudut',
      'Sisi-sisi yang berhadapan sama besar'
    ],
    sisi: 6, rusuk: 12, titikSudut: 8,
    luas: 'L = 2 × (p·l + p·t + l·t)',
    volume: 'V = p × l × t',
    contohHitung: {
      soal: 'Balok berukuran panjang 6 cm, lebar 3 cm, tinggi 4 cm. Hitung luas dan volumenya!',
      langkah: [
        'Luas = 2 × (6·3 + 6·4 + 3·4) = 2 × (18 + 24 + 12) = 2 × 54 = 108 cm²',
        'Volume = 6 × 3 × 4 = 72 cm³'
      ]
    }
  },
  tabung: {
    nama: 'Tabung',
    icon: '🥫',
    warna: '#66bb6a',
    contoh: 'Kaleng susu, gelas, drum',
    pengertian: 'Tabung adalah bangun ruang yang memiliki alas dan tutup berbentuk lingkaran serta selimut berbentuk persegi panjang yang melengkung.',
    ciri: [
      'Memiliki 2 sisi lingkaran (alas dan tutup)',
      'Memiliki 1 sisi lengkung (selimut tabung)',
      'Memiliki 2 rusuk lengkung (bukan rusuk lurus seperti kubus)',
      'Tidak memiliki titik sudut'
    ],
    sisi: 3, rusuk: '2 lengkung', titikSudut: 0,
    luas: 'L = 2 × π × r × (r + t)',
    volume: 'V = π × r² × t',
    contohHitung: {
      soal: 'Tabung dengan jari-jari 7 cm dan tinggi 10 cm. (π = 22/7). Hitung luas dan volumenya!',
      langkah: [
        'Luas = 2 × 22/7 × 7 × (7 + 10) = 2 × 22 × 17 = 748 cm²',
        'Volume = 22/7 × 7 × 7 × 10 = 22 × 7 × 10 = 1540 cm³'
      ]
    },
    catatan: 'Permukaan tabung terdiri dari sisi datar (lingkaran) dan sisi lengkung (selimut). Rusuknya berupa garis lengkung, bukan garis lurus.'
  },
  kerucut: {
    nama: 'Kerucut',
    icon: '🍦',
    warna: '#ff8a65',
    contoh: 'Topi ulang tahun, cone es krim, tumpeng',
    pengertian: 'Kerucut adalah bangun ruang yang memiliki alas berbentuk lingkaran dan satu titik puncak.',
    ciri: [
      'Memiliki 1 sisi alas berbentuk lingkaran',
      'Memiliki 1 sisi lengkung (selimut kerucut)',
      'Memiliki 1 titik puncak',
      'Memiliki 1 rusuk lengkung pada alas'
    ],
    sisi: 2, rusuk: '1 lengkung', titikSudut: 1,
    luas: 'L = π × r × (r + s)',
    volume: 'V = ⅓ × π × r² × t',
    contohHitung: {
      soal: 'Kerucut dengan r = 7 cm, t = 24 cm, s = 25 cm. (π = 22/7). Hitung luas dan volumenya!',
      langkah: [
        'Luas = 22/7 × 7 × (7 + 25) = 22 × 32 = 704 cm²',
        'Volume = ⅓ × 22/7 × 7 × 7 × 24 = ⅓ × 22 × 7 × 24 = 1232 cm³'
      ]
    },
    catatan: 'Kerucut memiliki sisi lengkung (selimut) dan sisi datar (alas lingkaran). Rusuknya berupa garis lengkung pada alas.'
  },
  bola: {
    nama: 'Bola',
    icon: '⚽',
    warna: '#ab47bc',
    contoh: 'Bola sepak, globe, kelereng',
    pengertian: 'Bola adalah bangun ruang yang semua titik permukaannya berjarak sama dari titik pusatnya.',
    ciri: [
      'Memiliki 1 sisi lengkung (seluruh permukaan)',
      'Tidak memiliki rusuk',
      'Tidak memiliki titik sudut',
      'Tidak memiliki jaring-jaring datar sederhana'
    ],
    sisi: 1, rusuk: 0, titikSudut: 0,
    luas: 'L = 4 × π × r²',
    volume: 'V = 4/3 × π × r³',
    contohHitung: {
      soal: 'Bola dengan jari-jari 7 cm. (π = 22/7). Hitung luas dan volumenya!',
      langkah: [
        'Luas = 4 × 22/7 × 7 × 7 = 4 × 22 × 7 = 616 cm²',
        'Volume = 4/3 × 22/7 × 7 × 7 × 7 = 4/3 × 22 × 49 = 1437,33 cm³'
      ]
    },
    catatan: 'Bola tidak memiliki jaring-jaring datar sederhana yang dapat dilipat menjadi bola sempurna. Permukaannya seluruhnya lengkung.'
  }
};

const SHAPE_ORDER = ['kubus', 'balok', 'tabung', 'kerucut', 'bola'];

/* ==========================================================
   NAVIGASI HALAMAN
   ========================================================== */
function goToPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + pageId);
  if (el) el.classList.add('active');
  APP.currentPage = pageId;

  if (pageId !== 'ar' && window.AR && typeof AR.stop === 'function') {
    AR.stop();
  }
  if (pageId !== 'learn' && window.Scene3D && typeof Scene3D.pause === 'function') {
    Scene3D.pause();
  }
}

/* ==========================================================
   MENU BANGUN RUANG
   ========================================================== */
function buildMenu() {
  const grid = document.getElementById('menu-grid');
  grid.innerHTML = '';
  SHAPE_ORDER.forEach(key => {
    const s = SHAPES[key];
    const card = document.createElement('div');
    card.className = 'shape-card';
    card.innerHTML = `
      <div class="shape-icon" style="background:${s.warna}">${s.icon}</div>
      <h3>${s.nama}</h3>
      <p class="shape-example">Contoh: ${s.contoh}</p>
      <button class="btn btn-primary" data-shape="${key}">Pelajari</button>
    `;
    card.querySelector('button').addEventListener('click', e => {
      e.stopPropagation();
      selectShape(key);
    });
    card.addEventListener('click', () => selectShape(key));
    grid.appendChild(card);
  });
}

function selectShape(key) {
  APP.selectedShape = key;
  APP.detectedShape = null;
  renderMaterial(key);
  document.getElementById('learn-title').textContent = SHAPES[key].nama;
  document.getElementById('learn-ar-shape').textContent = SHAPES[key].nama;
  document.getElementById('learn-ar-shape-2').textContent = SHAPES[key].nama;
  goToPage('learn');
  showLearnPanel('ar');
}

/* ==========================================================
   RENDER MATERI
   ========================================================== */
function renderMaterial(key) {
  const s = SHAPES[key];
  const mat = document.getElementById('learn-material');
  mat.innerHTML = `
    <h2>${s.icon} ${s.nama}</h2>
    <p>${s.pengertian}</p>

    <h3>✨ Ciri-Ciri</h3>
    <ul>${s.ciri.map(c => `<li>${c}</li>`).join('')}</ul>

    <h3>📊 Jumlah Sisi, Rusuk, Titik Sudut</h3>
    <div class="badge-row">
      <span class="badge">Sisi: ${s.sisi}</span>
      <span class="badge">Rusuk: ${s.rusuk}</span>
      <span class="badge">Titik Sudut: ${s.titikSudut}</span>
    </div>
    ${s.catatan ? `<p style="font-size:.85rem;color:#52606d;font-style:italic;">ℹ️ ${s.catatan}</p>` : ''}

    <h3>🌍 Contoh Benda Sehari-hari</h3>
    <p>${s.contoh}</p>

    <h3>🧮 Rumus</h3>
    <div class="formula-box">
      <div><strong>Luas Permukaan:</strong> ${s.luas}</div>
      <div style="margin-top:6px;"><strong>Volume:</strong> ${s.volume}</div>
    </div>

    <h3>✏️ Contoh Perhitungan</h3>
    <div class="example-box">
      <p><strong>Soal:</strong> ${s.contohHitung.soal}</p>
      <p style="margin-top:8px;"><strong>Penyelesaian:</strong></p>
      <ol>${s.contohHitung.langkah.map(l => `<li>${l}</li>`).join('')}</ol>
    </div>
  `;
}

/* ==========================================================
   Panel Kiri: AR / 3D / Jaring-jaring
   ========================================================== */
function showLearnPanel(mode) {
  const arBox = document.getElementById('learn-ar-container');
  const box3d = document.getElementById('learn-3d-container');
  const btnReset = document.getElementById('btn-reset-3d');
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const netControls = document.getElementById('net-controls');

  document.querySelectorAll('.canvas-controls .btn').forEach(b => b.classList.remove('btn-primary'));

  if (mode === 'ar') {
    if (window.AR) window.AR.stop();
    arBox.classList.remove('hidden');
    box3d.classList.add('hidden');
    [btnReset, btnZoomIn, btnZoomOut].forEach(b => b && b.classList.add('hidden'));
    netControls.classList.add('hidden');
    document.getElementById('btn-view-ar').classList.add('btn-primary');
    if (window.Scene3D) Scene3D.pause();
} else {
  if (window.AR) window.AR.stop();
  arBox.classList.add('hidden');
  box3d.classList.remove('hidden');
  [btnReset, btnZoomIn, btnZoomOut].forEach(b => b && b.classList.remove('hidden'));

  if (mode === 'net') {
    document.getElementById('btn-view-net').classList.add('btn-primary');
    netControls.classList.remove('hidden');
    if (window.Scene3D && APP.selectedShape) {
      // Delay lebih lama supaya container benar-benar tampil dulu
      setTimeout(() => {
        window.Scene3D.showNet(APP.selectedShape);
      }, 150);
    }
  } else {
    document.getElementById('btn-view-solid').classList.add('btn-primary');
    netControls.classList.add('hidden');
    if (window.Scene3D && APP.selectedShape) {
      setTimeout(() => {
        window.Scene3D.start(APP.selectedShape);
      }, 100);
    }
  }
}
}

/* ==========================================================
   EVENT BINDING
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  buildMenu();

  // Home & navigasi
  document.getElementById('btn-start').addEventListener('click', () => goToPage('menu'));
  document.getElementById('btn-home-1').addEventListener('click', () => goToPage('home'));
  document.getElementById('btn-home-2').addEventListener('click', () => goToPage('home'));
  document.getElementById('btn-home-3').addEventListener('click', () => goToPage('home'));
  document.getElementById('btn-back-menu').addEventListener('click', () => goToPage('menu'));
  document.getElementById('btn-quiz-back').addEventListener('click', () => goToPage('menu'));

  // Quiz
  document.getElementById('btn-open-quiz').addEventListener('click', () => {
    goToPage('quiz');
    if (window.Quiz) Quiz.start();
  });

  // AR layar penuh
  document.getElementById('btn-open-ar').addEventListener('click', () => {
    if (!APP.selectedShape) { alert('Pilih bangun ruang terlebih dahulu.'); return; }
    goToPage('ar');
    if (window.AR) AR.open(APP.selectedShape);
  });

  // Sound
  const soundBtn = document.getElementById('btn-toggle-sound');
  soundBtn.addEventListener('click', () => {
    APP.soundOn = !APP.soundOn;
    soundBtn.textContent = APP.soundOn ? '🔊' : '🔇';
  });

  // Tombol panel kiri
  document.getElementById('btn-view-ar').addEventListener('click', () => showLearnPanel('ar'));
  document.getElementById('btn-view-solid').addEventListener('click', () => showLearnPanel('solid'));
  document.getElementById('btn-view-net').addEventListener('click', () => showLearnPanel('net'));
  document.getElementById('btn-reset-3d').addEventListener('click', () => Scene3D.resetView());
  document.getElementById('btn-zoom-in').addEventListener('click', () => Scene3D.zoom(0.85));
  document.getElementById('btn-zoom-out').addEventListener('click', () => Scene3D.zoom(1.18));
  document.getElementById('btn-fold-anim').addEventListener('click', () => Scene3D.playFoldAnimation());
  document.getElementById('btn-back-3d').addEventListener('click', () => showLearnPanel('solid'));

  // AR embed (panel kiri)
  document.getElementById('btn-learn-ar-start').addEventListener('click', () => {
    if (window.AR) window.AR.startLearn();
  });

  // AR full page
  document.getElementById('btn-ar-exit').addEventListener('click', () => {
    AR.stop();
    goToPage('learn');
  });
  document.getElementById('btn-ar-help').addEventListener('click', () => {
    document.getElementById('ar-overlay-instructions').classList.remove('hidden');
  });
  document.getElementById('btn-ar-start').addEventListener('click', () => {
    document.getElementById('ar-overlay-instructions').classList.add('hidden');
    AR.startCamera();
  });
  document.getElementById('btn-ar-cancel').addEventListener('click', () => {
    AR.stop();
    goToPage('learn');
  });
  document.getElementById('btn-ar-retry').addEventListener('click', () => {
    document.getElementById('ar-overlay-wrong').classList.add('hidden');
    AR.clearDetected();
  });
  document.getElementById('btn-ar-back-menu').addEventListener('click', () => {
    AR.stop();
    goToPage('menu');
  });
  document.getElementById('btn-ar-error-close').addEventListener('click', () => {
    document.getElementById('ar-error').classList.add('hidden');
  });

  goToPage('home');
});

/* ==========================================================
   SOUND
   ========================================================== */
function playBeep(type) {
  if (!APP.soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = (type === 'ok') ? 880 : 300;
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.start(); o.stop(ctx.currentTime + 0.25);
  } catch(e) {}
}

window.APP = APP;
window.SHAPES = SHAPES;
window.SHAPE_ORDER = SHAPE_ORDER;
window.goToPage = goToPage;
window.playBeep = playBeep;
window.showLearnPanel = showLearnPanel;
window.selectShape = selectShape;