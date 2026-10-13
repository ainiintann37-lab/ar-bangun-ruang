/* ==========================================================
   AR Module — MindAR + Three.js (ESM via importmap)
   Versi Final: objek nempel marker + ukuran pas + debug log
   ========================================================== */
import * as THREE from 'three';
import { MindARThree } from 'mind-ar';

(function() {
  let mindar = null;
  let anchorMap = {};
  let currentMode = null;
  let isRunning = false;
  let handlersAttached = false;

  const selectedShape = () => window.APP.selectedShape;
  const shapeName = (k) => (window.SHAPES[k] ? window.SHAPES[k].nama : k);

  function createMindAR(containerEl, mode) {
    destroyMindAR();

    let instance;
    try {
      instance = new MindARThree({
        container: containerEl,
        imageTargetSrc: 'markers/targets.mind',
        maxTrack: 2,
        uiLoading: 'no',
        uiScanning: 'no',
        uiError: 'no'
      });
    } catch (e) {
      showError('MindAR gagal dimuat: ' + e.message, mode);
      return null;
    }

    instance.scene.add(new THREE.HemisphereLight(0xffffff, 0x88ccff, 1.0));
    const d = new THREE.DirectionalLight(0xffffff, 0.95);
    d.position.set(1, 3, 2);
    instance.scene.add(d);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.5);
    d2.position.set(-2, -1, -2);
    instance.scene.add(d2);

    const order = ['kubus', 'balok', 'tabung', 'kerucut', 'bola'];
    anchorMap = {};
    order.forEach((key, i) => {
      const anchor = instance.addAnchor(i);
      anchor.group.visible = false;
      anchor.group.add(buildModelFor(key));
      
      const lbl = buildLabel(window.SHAPES[key].nama);
      lbl.position.set(0, 3, 0);  // di atas objek 3D
      anchor.group.add(lbl);
      
      anchor.userData = { shapeKey: key };
      anchorMap[key] = anchor;
    });

    attachDetectionHandlers(mode);
    return instance;
  }

  function destroyMindAR() {
    try { if (mindar && typeof mindar.stop === 'function' && isRunning) mindar.stop(); } catch (e) {}
    mindar = null;
    anchorMap = {};
    isRunning = false;
    handlersAttached = false;
  }

  /* ===== Model 3D — ukuran proporsional, warna cerah ===== */
  function buildModelFor(key) {
    const S = window.SHAPES[key];
    const color = new THREE.Color(S.warna);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.35,
      metalness: 0.15,
      side: THREE.DoubleSide
    });
    
    let mesh;
    switch (key) {
      case 'kubus':   mesh = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), mat); break;
      case 'balok':   mesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.6, 2), mat); break;
      case 'tabung':  mesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.2, 40), mat); break;
      case 'kerucut': mesh = new THREE.Mesh(new THREE.ConeGeometry(1.1, 2.2, 40), mat); break;
      case 'bola':    mesh = new THREE.Mesh(new THREE.SphereGeometry(1.3, 36, 24), mat); break;
    }
    if (mesh) {
      mesh.position.set(0, 0, 5);  // 1 satuan di atas marker
      mesh.add(new THREE.LineSegments(
        new THREE.EdgesGeometry(mesh.geometry),
        new THREE.LineBasicMaterial({ color: 0x213547 })
      ));
    }
    return mesh;
  }

  function buildLabel(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    roundRect(ctx, 0, 0, 256, 64, 16); ctx.fill();
    ctx.fillStyle = '#0288d1';
    ctx.font = 'bold 28px Segoe UI, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(1.4, 0.35, 1);
    return sp;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function attachDetectionHandlers(mode) {
    if (handlersAttached) return;
    handlersAttached = true;
    Object.values(anchorMap).forEach(anchor => {
      const key = anchor.userData.shapeKey;
      anchor.onTargetFound = () => {
        if (!isRunning) return;
        window.APP.detectedShape = key;
        handleDetection(key, mode);
      };
      anchor.onTargetLost = () => {
        if (window.APP.detectedShape === key) {
          window.APP.detectedShape = null;
          hideAllAnchors();
          updateUI(mode, 'scanning');
        }
      };
    });
  }

  function hideAllAnchors() {
    Object.values(anchorMap).forEach(a => { a.group.visible = false; });
  }

  function handleDetection(detected, mode) {
    const selected = selectedShape();
    if (!selected) {
      updateUI(mode, 'wrong', 'Belum ada bangun ruang yang dipilih.');
      hideAllAnchors();
      return;
    }
    if (detected === selected) {
      hideAllAnchors();
      const a = anchorMap[detected];
      if (a) a.group.visible = true;

      // Debug log (bisa dihapus nanti)
      console.log('=== DEBUG MARKER ===');
      console.log('Detected:', detected, '| Selected:', selected);
      console.log('Anchor group visible:', a ? a.group.visible : 'null');
      console.log('Children count:', a ? a.group.children.length : 0);
      if (a && a.group.children[0]) {
        const c = a.group.children[0];
        console.log('Child type:', c.type, '| pos:', c.position, '| scale:', c.scale);
        if (c.geometry) {
          c.geometry.computeBoundingBox();
          const bb = c.geometry.boundingBox;
          console.log('Size:', bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z);
        }
      }
      console.log('=== END DEBUG ===');

      updateUI(mode, 'success',
        '✅ Hebat! Kamu berhasil menemukan bangun ruang ' + shapeName(detected) + '!');
      if (window.playBeep) window.playBeep('ok');
    } else {
      hideAllAnchors();
      updateUI(mode, 'wrong',
        'Ups! Ini bukan ' + shapeName(selected) + '. Kamu sedang memindai ' + shapeName(detected) +
        '. Ayo cari marker ' + shapeName(selected) + ' yang benar!');
      if (window.playBeep) window.playBeep('no');
    }
  }

  function updateUI(mode, state, msg) {
    if (mode === 'page') {
      const successEl = document.getElementById('ar-overlay-success');
      const wrongEl = document.getElementById('ar-overlay-wrong');
      const scanEl = document.getElementById('ar-overlay-scan');
      if (!successEl || !wrongEl || !scanEl) return;
      if (state === 'success') {
        wrongEl.classList.add('hidden');
        scanEl.classList.add('hidden');
        successEl.textContent = msg;
        successEl.classList.remove('hidden');
        clearTimeout(window._successTO);
        window._successTO = setTimeout(() => successEl.classList.add('hidden'), 3500);
      } else if (state === 'wrong') {
        successEl.classList.add('hidden');
        scanEl.classList.add('hidden');
        document.getElementById('ar-wrong-msg').textContent = msg;
        wrongEl.classList.remove('hidden');
      } else if (state === 'scanning') {
        successEl.classList.add('hidden');
        wrongEl.classList.add('hidden');
        scanEl.classList.remove('hidden');
      }
    } else {
      const badge = document.getElementById('learn-ar-badge');
      const hint = document.getElementById('learn-ar-hint');
      if (!badge || !hint) return;
      if (state === 'success') {
        hint.classList.add('hidden');
        badge.textContent = msg;
        badge.style.background = '';
        badge.classList.remove('hidden');
        clearTimeout(window._learnSuccessTO);
        window._learnSuccessTO = setTimeout(() => badge.classList.add('hidden'), 3500);
      } else if (state === 'wrong') {
        badge.textContent = '⚠️ ' + msg;
        badge.style.background = '#e64a19';
        badge.classList.remove('hidden');
        clearTimeout(window._learnSuccessTO);
        window._learnSuccessTO = setTimeout(() => {
          badge.classList.add('hidden');
          badge.style.background = '';
        }, 5000);
      } else if (state === 'scanning') {
        badge.classList.add('hidden');
        hint.classList.remove('hidden');
      }
    }
  }

  function showError(msg, mode) {
    if (mode === 'page') {
      const el = document.getElementById('ar-error');
      if (!el) return;
      document.getElementById('ar-error-msg').textContent = msg;
      el.classList.remove('hidden');
    } else {
      const overlay = document.getElementById('learn-ar-overlay');
      if (!overlay) return;
      overlay.innerHTML =
        '<div class="learn-ar-card">' +
          '<div class="learn-ar-icon">⚠️</div>' +
          '<h3>Kamera Tidak Dapat Digunakan</h3>' +
          '<p>' + msg + '</p>' +
          '<button class="btn btn-primary" id="btn-learn-ar-retry">Coba Lagi</button>' +
        '</div>';
      overlay.classList.remove('hidden');
      const retry = document.getElementById('btn-learn-ar-retry');
      if (retry) retry.addEventListener('click', () => startLearn());
    }
  }

  function open(shapeKey) {
    document.getElementById('ar-target-name').textContent = shapeName(shapeKey);
    document.getElementById('ar-instr-shape').textContent = shapeName(shapeKey);
    document.getElementById('ar-overlay-instructions').classList.remove('hidden');
    document.getElementById('ar-overlay-wrong').classList.add('hidden');
    document.getElementById('ar-overlay-success').classList.add('hidden');
    document.getElementById('ar-overlay-scan').classList.add('hidden');
    document.getElementById('ar-error').classList.add('hidden');
    window.APP.detectedShape = null;
  }

  async function startCamera() {
    const container = document.getElementById('ar-container');

    // Bersihkan video/canvas lama
    [...container.children].forEach(child => {
      if (!child.classList.contains('ar-overlay') &&
          !child.id.includes('overlay') &&
          !child.classList.contains('ar-badge') &&
          !child.classList.contains('ar-scan-hint')) {
        container.removeChild(child);
      }
    });

    currentMode = 'page';
    mindar = createMindAR(container, 'page');
    if (!mindar) return;
    try {
      hideAllAnchors();
      window.APP.detectedShape = null;
      await mindar.start();
      isRunning = true;
      updateUI('page', 'scanning');
    } catch (e) {
      handleCameraError(e, 'page');
    }
  }

  async function startLearn() {
    const shapeKey = selectedShape();
    if (!shapeKey) return;
    const overlay = document.getElementById('learn-ar-overlay');
    const badge = document.getElementById('learn-ar-badge');
    const hint = document.getElementById('learn-ar-hint');
    if (overlay) overlay.classList.add('hidden');
    if (badge) badge.classList.add('hidden');
    if (hint) hint.classList.add('hidden');

    document.getElementById('learn-ar-shape').textContent = shapeName(shapeKey);
    document.getElementById('learn-ar-shape-2').textContent = shapeName(shapeKey);

    const container = document.getElementById('learn-ar-container');

    // Bersihkan video/canvas lama
    [...container.children].forEach(child => {
      if (!child.classList.contains('learn-ar-overlay') &&
          !child.classList.contains('learn-ar-badge') &&
          !child.classList.contains('learn-ar-hint')) {
        container.removeChild(child);
      }
    });

    currentMode = 'learn';
    mindar = createMindAR(container, 'learn');
    if (!mindar) return;
    try {
      hideAllAnchors();
      window.APP.detectedShape = null;
      await mindar.start();
      isRunning = true;
      updateUI('learn', 'scanning');
    } catch (e) {
      handleCameraError(e, 'learn');
    }
  }

  function handleCameraError(e, mode) {
    console.error(e);
    let msg = 'Kamera tidak dapat diakses. ';
    if (e && e.name === 'NotAllowedError') {
      msg += 'Izin kamera ditolak. Buka pengaturan browser dan izinkan akses kamera.';
    } else if (e && e.name === 'NotFoundError') {
      msg += 'Kamera tidak ditemukan pada perangkat ini.';
    } else {
      msg += (e && e.message) ? e.message : 'Pastikan situs dibuka melalui HTTPS atau localhost.';
    }
    showError(msg, mode);
  }

  function stop() {
    isRunning = false;
    try {
      if (mindar && typeof mindar.stop === 'function') mindar.stop();
    } catch (e) {}
    hideAllAnchors();
    window.APP.detectedShape = null;
    destroyMindAR();

    const overlay = document.getElementById('learn-ar-overlay');
    const badge = document.getElementById('learn-ar-badge');
    const hint = document.getElementById('learn-ar-hint');
    if (overlay) overlay.classList.remove('hidden');
    if (badge) badge.classList.add('hidden');
    if (hint) hint.classList.add('hidden');
  }

  function clearDetected() {
    hideAllAnchors();
    window.APP.detectedShape = null;
    updateUI(currentMode || 'page', 'scanning');
  }

  window.AR = { open, startCamera, startLearn, stop, clearDetected };
})();
