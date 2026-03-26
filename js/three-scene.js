/* =========================================================
   three-scene.js — Wireframe hero scene
   Three rotating wireframe shapes with mouse parallax.
   Requires THREE.js loaded before this script.
   Call: initHeroScene(canvasElement)
   ========================================================= */

'use strict';

function initHeroScene(canvas) {
  if (!canvas || typeof THREE === 'undefined') return;

  // WebGL availability check
  try {
    if (!document.createElement('canvas').getContext('webgl')) return;
  } catch (e) { return; }

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const scale    = isMobile ? 0.65 : 1.0;

  /* ---- Renderer ---- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias:       true,
    alpha:           true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  /* ---- Scene / Camera ---- */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 300);
  camera.position.z = 80;

  /* ---- Wireframe group (receives parallax offset) ---- */
  const wfGroup = new THREE.Group();
  scene.add(wfGroup);

  /* ---- Wireframe shapes ---- */
  //  Icosahedron  — gold,  upper-right
  //  Tetrahedron  — fire,  left
  //  Dodecahedron — amber, lower-right
  const shapeDefs = [
    { geo: new THREE.IcosahedronGeometry(12 * scale, 0),  color: 0xF3C748, x:  28, y:  10, z: -32 },
    { geo: new THREE.TetrahedronGeometry( 9 * scale, 0),  color: 0xDE4926, x: -30, y:  -8, z: -22 },
    { geo: new THREE.DodecahedronGeometry(8 * scale, 0),  color: 0xE8832A, x:  13, y: -17, z: -28 },
  ];

  const wireframes = [];

  shapeDefs.forEach(({ geo, color, x, y, z }) => {
    const edges = new THREE.EdgesGeometry(geo);
    const mat   = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity:     0.40,
      blending:    THREE.AdditiveBlending,
    });
    const wf = new THREE.LineSegments(edges, mat);
    wf.position.set(x, y, z);
    // Random per-axis rotation speeds
    wf.userData = {
      rx:    (Math.random() - 0.5) * 0.006,
      ry:    (Math.random() - 0.5) * 0.009,
      rz:    (Math.random() - 0.5) * 0.004,
      phase: Math.random() * Math.PI * 2,
    };
    wfGroup.add(wf);
    wireframes.push(wf);
  });

  /* ---- Mouse / device-tilt parallax ---- */
  const target = { x: 0, y: 0 };
  const offset = { x: 0, y: 0 };

  window.addEventListener('mousemove', e => {
    target.x = (e.clientX / window.innerWidth  - 0.5) *  9;
    target.y = (e.clientY / window.innerHeight - 0.5) * -5;
  }, { passive: true });

  if (isMobile) {
    window.addEventListener('deviceorientation', e => {
      if (e.gamma != null) {
        target.x = (e.gamma / 35) * 5;
        target.y = (((e.beta || 45) - 45) / 35) * -3;
      }
    }, { passive: true });
  }

  /* ---- Resize handler ---- */
  function onResize() {
    const hero = canvas.parentElement;
    const w    = hero ? hero.clientWidth  : window.innerWidth;
    const h    = hero ? hero.clientHeight : window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize, { passive: true });
  onResize();

  /* ---- Animation loop ---- */
  const clock  = new THREE.Clock();
  let   rafId  = null;
  let   active = true;

  function tick() {
    if (!active) { rafId = null; return; }
    rafId = requestAnimationFrame(tick);

    const t = clock.getElapsedTime();

    // Smooth parallax
    offset.x += (target.x - offset.x) * 0.04;
    offset.y += (target.y - offset.y) * 0.04;
    wfGroup.position.x = offset.x;
    wfGroup.position.y = offset.y;

    // Slow global Y rotation
    scene.rotation.y += 0.00025;

    // Per-shape rotation + opacity pulse
    wireframes.forEach(wf => {
      wf.rotation.x += wf.userData.rx;
      wf.rotation.y += wf.userData.ry;
      wf.rotation.z += wf.userData.rz;
      wf.material.opacity = 0.28 + 0.32 * Math.abs(Math.sin(t * 0.5 + wf.userData.phase));
    });

    renderer.render(scene, camera);
  }

  /* ---- Pause RAF when hero scrolls out of view ---- */
  if ('IntersectionObserver' in window) {
    const heroEl = canvas.closest('section') || canvas.parentElement;
    if (heroEl) {
      new IntersectionObserver(entries => {
        active = entries[0].isIntersecting;
        if (active && !rafId) tick();
      }, { threshold: 0.01 }).observe(heroEl);
    }
  }

  tick();
}
