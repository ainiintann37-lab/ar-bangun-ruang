/* ==========================================================
   Scene3D — Three.js untuk halaman belajar (3D + jaring-jaring)
   VERSI FINAL: kubus/balok lipat benar + tabung gulung
   ========================================================== */
(function() {
  let renderer, scene, camera, controls;
  let currentMesh = null;
  let netGroup = null;
  let pivots = [];
  let foldProgress = 0;
  let foldAnimating = false;
  let running = false;
  let currentShape = null;
  let animFrameId = null;
  let initialized = false;

  const canvas = document.getElementById('canvas-3d');
  const container = document.getElementById('learn-3d-container');

  const SIDE_COLORS = [0xff5252, 0xffb300, 0x66bb6a, 0x29b6f6, 0xab47bc, 0xff7043];

  function init() {
    if (initialized) return;
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 0, 6);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.enablePan = false;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x88ccff, 1.0));
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(5, 10, 7);
    scene.add(dir);
    const dir2 = new THREE.DirectionalLight(0xffffff, 0.35);
    dir2.position.set(-5, -5, -5);
    scene.add(dir2);

    window.addEventListener('resize', onResize);
    initialized = true;
  }

  function onResize() {
    if (!renderer || !container) return;
    const w = container.clientWidth, h = container.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function clearSceneObjects() {
    if (currentMesh) { scene.remove(currentMesh); disposeObj(currentMesh); currentMesh = null; }
    if (netGroup) { scene.remove(netGroup); disposeObj(netGroup); netGroup = null; }
    pivots = [];
    foldAnimating = false;
  }

  function disposeObj(obj) {
    obj.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
        else { if (o.material.map) o.material.map.dispose(); o.material.dispose(); }
      }
    });
  }

  function mat(color) {
    return new THREE.MeshStandardMaterial({
      color: color, roughness: 0.5, metalness: 0.05, side: THREE.DoubleSide
    });
  }

  /* ============================================================
     SOLID: kubus / balok / tabung / kerucut / bola
     ============================================================ */
  function buildSolid(shapeKey) {
    if (shapeKey === 'kubus' || shapeKey === 'balok') {
      const W = shapeKey === 'kubus' ? 1 : 1.4;
      const H = shapeKey === 'kubus' ? 1 : 0.8;
      const D = shapeKey === 'kubus' ? 1 : 1.0;
      // Urutan material BoxGeometry: +X, -X, +Y, -Y, +Z, -Z
      const mats = [
        mat(SIDE_COLORS[4]), // +X kanan (E)
        mat(SIDE_COLORS[3]), // -X kiri (D)
        mat(SIDE_COLORS[1]), // +Y atas (B)
        mat(SIDE_COLORS[2]), // -Y bawah (C)
        mat(SIDE_COLORS[0]), // +Z depan (A)
        mat(SIDE_COLORS[5])  // -Z belakang (F)
      ];
      const geom = new THREE.BoxGeometry(W, H, D);
      const mesh = new THREE.Mesh(geom, mats);
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom),
        new THREE.LineBasicMaterial({ color: 0x213547 })));
      return mesh;
    }
    const S = window.SHAPES[shapeKey];
    let geom, mesh;
    if (shapeKey === 'tabung') {
      geom = new THREE.CylinderGeometry(1.1, 1.1, 2.4, 48);
      mesh = new THREE.Mesh(geom, mat(new THREE.Color(S.warna)));
    } else if (shapeKey === 'kerucut') {
      geom = new THREE.ConeGeometry(1.2, 2.4, 48);
      mesh = new THREE.Mesh(geom, mat(new THREE.Color(S.warna)));
    } else {
      geom = new THREE.SphereGeometry(1.4, 40, 28);
      mesh = new THREE.Mesh(geom, mat(new THREE.Color(S.warna)));
    }
    mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geom, 25),
      new THREE.LineBasicMaterial({ color: 0x213547, transparent: true, opacity: 0.3 })));
    return mesh;
  }

  /* ============================================================
     JARING-JARING LIPAT — KUBUS & BALOK
     ============================================================
     Konsep: setiap panel yang akan dilipat dibungkus Pivot Group.
     Pivot berada di TEPI panel induk. Panel anak di-parent ke pivot
     dengan offset setengah ukuran panel anak.

     Arah lipat: semua panel dilipat KE DEPAN (menjauhi kamera)
     dengan tanda rotasi yang sesuai.
     ============================================================ */

  function makeMesh(w, h, color) {
    const g = new THREE.PlaneGeometry(w, h);
    const m = new THREE.Mesh(g, mat(color));
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),
      new THREE.LineBasicMaterial({ color: 0x213547 })));
    return m;
  }

  function buildNetKubusBalok(shapeKey) {
    const W = shapeKey === 'kubus' ? 1 : 1.4;
    const H = shapeKey === 'kubus' ? 1 : 0.8;
    const D = shapeKey === 'kubus' ? 1 : 1.0;

    const root = new THREE.Group();

    /* ---------- Panel A: DEPAN (tetap) ---------- */
    const panelA = makeMesh(W, H, SIDE_COLORS[0]);
    panelA.position.set(0, 0, 0);
    root.add(panelA);

    /* ---------- Panel B: ATAS ----------
       Pivot di tepi atas A. Panel B naik.
       Rotasi +90° di sumbu X → panel lipat ke depan (naik). */
    const pivotB = new THREE.Group();
    pivotB.position.set(0, H / 2, 0);
    const panelB = makeMesh(W, D, SIDE_COLORS[1]);
    panelB.position.set(0, D / 2, 0);
    pivotB.add(panelB);
    root.add(pivotB);
    pivots.push({ pivot: pivotB, axis: 'x', target: Math.PI / 2 });

    /* ---------- Panel C: BAWAH ----------
       Pivot di tepi bawah A. Panel C turun.
       Rotasi -90° di sumbu X → panel lipat ke depan (turun). */
    const pivotC = new THREE.Group();
    pivotC.position.set(0, -H / 2, 0);
    const panelC = makeMesh(W, D, SIDE_COLORS[2]);
    panelC.position.set(0, -D / 2, 0);
    pivotC.add(panelC);
    root.add(pivotC);
    pivots.push({ pivot: pivotC, axis: 'x', target: -Math.PI / 2 });

    /* ---------- Panel D: KIRI ----------
       Pivot di tepi kiri A. Panel D ke kiri.
       Rotasi -90° di sumbu Y → panel lipat ke depan (kiri). */
    const pivotD = new THREE.Group();
    pivotD.position.set(-W / 2, 0, 0);
    const panelD = makeMesh(D, H, SIDE_COLORS[3]);
    panelD.position.set(-D / 2, 0, 0);
    pivotD.add(panelD);
    root.add(pivotD);
    pivots.push({ pivot: pivotD, axis: 'y', target: -Math.PI / 2 });

    /* ---------- Panel E: KANAN ----------
       Pivot di tepi kanan A. Panel E ke kanan.
       Rotasi +90° di sumbu Y → panel lipat ke depan (kanan). */
    const pivotE = new THREE.Group();
    pivotE.position.set(W / 2, 0, 0);
    const panelE = makeMesh(D, H, SIDE_COLORS[4]);
    panelE.position.set(D / 2, 0, 0);
    pivotE.add(panelE);
    root.add(pivotE);
    pivots.push({ pivot: pivotE, axis: 'y', target: Math.PI / 2 });

    /* ---------- Panel F: BELAKANG ----------
       Anak dari pivotE. Rotasi +90° di sumbu Y. */
    const pivotF = new THREE.Group();
    pivotF.position.set(D, 0, 0);
    const panelF = makeMesh(W, H, SIDE_COLORS[5]);
    panelF.position.set(W / 2, 0, 0);
    pivotF.add(panelF);
    pivotE.add(pivotF);
    pivots.push({ pivot: pivotF, axis: 'y', target: Math.PI / 2 });

    return root;
  }

  /* ============================================================
     JARING-JARING TABUNG
     ============================================================ */
  function buildNetTabung() {
    const g = new THREE.Group();
    const r = 1.1, t = 2.4, circ = 2 * Math.PI * r;

    // ---- Selimut: persegi panjang di tengah ----
    const rm = makeMesh(circ, t, SIDE_COLORS[2]);
    rm.position.set(0, 0, 0);
    rm.userData.netKind = 'selimut';
    rm.userData.startPos = rm.position.clone();
    g.add(rm);

    // ---- Alas: lingkaran kiri ----
    const cg = new THREE.CircleGeometry(r, 48);
    const cm1 = new THREE.Mesh(cg, mat(SIDE_COLORS[0]));
    cm1.position.set(-circ / 2 - r - 0.3, 0, 0);
    cm1.add(new THREE.LineSegments(new THREE.EdgesGeometry(cg),
      new THREE.LineBasicMaterial({ color: 0x213547 })));
    cm1.userData.netKind = 'lingkaran';
    cm1.userData.startPos = cm1.position.clone();
    cm1.userData.targetPos = new THREE.Vector3(0, t / 2, 0);
    g.add(cm1);

    // ---- Tutup: lingkaran kanan ----
    const cm2 = new THREE.Mesh(cg, mat(SIDE_COLORS[1]));
    cm2.position.set(circ / 2 + r + 0.3, 0, 0);
    cm2.add(new THREE.LineSegments(new THREE.EdgesGeometry(cg),
      new THREE.LineBasicMaterial({ color: 0x213547 })));
    cm2.userData.netKind = 'lingkaran';
    cm2.userData.startPos = cm2.position.clone();
    cm2.userData.targetPos = new THREE.Vector3(0, -t / 2, 0);
    g.add(cm2);

    return g;
  }

  /* ============================================================
     JARING-JARING KERUCUT
     ============================================================ */
  function buildNetKerucut() {
    const g = new THREE.Group();
    const r = 1.2, t = 2.4, s = Math.sqrt(r * r + t * t);
    const sectorAngle = 2 * Math.PI * r / s;

    // ---- Selimut: juring ----
    const sg = new THREE.CircleGeometry(s, 48, 0, sectorAngle);
    const sm = new THREE.Mesh(sg, mat(SIDE_COLORS[5]));
    sm.position.set(0, 0, 0);
    sm.add(new THREE.LineSegments(new THREE.EdgesGeometry(sg),
      new THREE.LineBasicMaterial({ color: 0x213547 })));
    g.add(sm);

    // ---- Alas: lingkaran ----
    const cg = new THREE.CircleGeometry(r, 48);
    const cm = new THREE.Mesh(cg, mat(SIDE_COLORS[0]));
    cm.position.set(-s - 0.4, 0, 0);
    cm.add(new THREE.LineSegments(new THREE.EdgesGeometry(cg),
      new THREE.LineBasicMaterial({ color: 0x213547 })));
    g.add(cm);

    return g;
  }

  /* ============================================================
     JARING-JARING BOLA (tidak ada, tampilkan bola transparan)
     ============================================================ */
  function buildNetBola() {
    const g = new THREE.Group();
    const s = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 32, 24),
      new THREE.MeshStandardMaterial({
        color: 0xab47bc, roughness: 0.5, transparent: true, opacity: 0.5
      })
    );
    g.add(s);
    const w = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(1.21, 16, 12)),
      new THREE.LineBasicMaterial({ color: 0x213547, transparent: true, opacity: 0.5 })
    );
    g.add(w);
    return g;
  }

  /* ============================================================
     ANIMASI TABUNG: lingkaran naik/turun, selimut mengecil
     ============================================================ */
  let tubeAnim = null;
  function startTubeAnimation() {
    if (!netGroup) return;
    const start = performance.now();
    const duration = 2500;

    // reset
    netGroup.children.forEach(c => {
      if (c.userData.netKind === 'lingkaran') {
        c.position.copy(c.userData.startPos);
      } else if (c.userData.netKind === 'selimut') {
        c.scale.set(1, 1, 1);
      }
    });

    function step() {
      if (!netGroup) return;
      const elapsed = performance.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = easeInOut(p);

      netGroup.children.forEach(c => {
        if (c.userData.netKind === 'lingkaran') {
          c.position.lerpVectors(c.userData.startPos, c.userData.targetPos, eased);
        } else if (c.userData.netKind === 'selimut') {
          const sx = 1 - eased * 0.7;
          c.scale.set(sx, 1, 1);
        }
      });

      if (p < 1) {
        tubeAnim = requestAnimationFrame(step);
      } else {
        tubeAnim = null;
      }
    }
    if (tubeAnim) cancelAnimationFrame(tubeAnim);
    step();
  }

  /* ============================================================
     PUBLIC API
     ============================================================ */
  function start(shapeKey) {
    init();
    onResize();
    currentShape = shapeKey;
    clearSceneObjects();
    currentMesh = buildSolid(shapeKey);
    scene.add(currentMesh);
    camera.position.set(3, 3, 5);
    controls.target.set(0, 0, 0);
    controls.update();
    if (!running) { running = true; animate(); }
  }

  function pause() {
    running = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = null;
    if (tubeAnim) { cancelAnimationFrame(tubeAnim); tubeAnim = null; }
    foldAnimating = false;
  }

  function showSolid() {
    if (!initialized) init();
    if (tubeAnim) { cancelAnimationFrame(tubeAnim); tubeAnim = null; }
    clearSceneObjects();
    if (currentShape) {
      currentMesh = buildSolid(currentShape);
      scene.add(currentMesh);
    }
    camera.position.set(3, 3, 5);
    controls.target.set(0, 0, 0);
    controls.update();
    if (!running) { running = true; animate(); }
    onResize();
  }

  function showNet(shapeKey) {
    if (!initialized) init();
    if (tubeAnim) { cancelAnimationFrame(tubeAnim); tubeAnim = null; }
    onResize();
    clearSceneObjects();

    // Bangun jaring-jaring sesuai jenis
    if (shapeKey === 'kubus' || shapeKey === 'balok') {
      netGroup = buildNetKubusBalok(shapeKey);
      // reset pivot
      pivots.forEach(p => {
        p.pivot.rotation.x = 0;
        p.pivot.rotation.y = 0;
        p.pivot.rotation.z = 0;
      });
      foldProgress = 0;
      foldAnimating = true;
      camera.position.set(0, 0, 8);
    } else if (shapeKey === 'tabung') {
      netGroup = buildNetTabung();
      camera.position.set(0, 0, 8);
      // mulai animasi gulung setelah jaring-jaring muncul
      setTimeout(() => startTubeAnimation(), 300);
    } else if (shapeKey === 'kerucut') {
      netGroup = buildNetKerucut();
      camera.position.set(0, 0, 8);
    } else {
      netGroup = buildNetBola();
      camera.position.set(0, 0, 6);
    }

    scene.add(netGroup);
    controls.target.set(0, 0, 0);
    controls.update();

    if (!running) { running = true; animate(); }
    setTimeout(() => onResize(), 100);
    setTimeout(() => onResize(), 350);
  }

  function resetView() {
    if (netGroup) {
      camera.position.set(0, 0, 8);
    } else {
      camera.position.set(3, 3, 5);
    }
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function zoom(factor) {
    const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
    dir.multiplyScalar(factor);
    camera.position.copy(controls.target).add(dir);
    controls.update();
  }

  function playFoldAnimation() {
    if (!netGroup) return;

    // Tabung: ulangi animasi gulung
    if (currentShape === 'tabung') {
      startTubeAnimation();
      return;
    }

    // Kubus/balok: reset pivot & mulai lipat
    pivots.forEach(p => {
      p.pivot.rotation.x = 0;
      p.pivot.rotation.y = 0;
      p.pivot.rotation.z = 0;
    });
    camera.position.set(0, 0, 8);
    controls.target.set(0, 0, 0);
    controls.update();
    foldProgress = 0;
    foldAnimating = true;
    if (!running) { running = true; animate(); }
  }

  function animate() {
    if (!running) return;
    animFrameId = requestAnimationFrame(animate);

    if (foldAnimating && pivots.length > 0) {
      foldProgress += 0.006;  // ~2.8 detik untuk 0→1
      if (foldProgress >= 1) {
        foldProgress = 1;
        foldAnimating = false;
      }
      const eased = easeInOut(foldProgress);
      pivots.forEach(p => {
        p.pivot.rotation[p.axis] = p.target * eased;
      });
    }

    controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  window.Scene3D = { start, pause, showSolid, showNet, resetView, zoom, playFoldAnimation };
})();