/* ==========================================================
   Nets.js — hook tambahan untuk jaring-jaring
   Implementasi utama ada di shape3d.js (buildNet, showNet,
   playFoldAnimation). File ini hanya menyediakan API global.
   ========================================================== */
window.Nets = {
  show(shapeKey) { if (window.Scene3D) window.Scene3D.showNet(shapeKey); },
  hide()         { if (window.Scene3D) window.Scene3D.showSolid(); },
  replay()       { if (window.Scene3D) window.Scene3D.playFoldAnimation(); }
};