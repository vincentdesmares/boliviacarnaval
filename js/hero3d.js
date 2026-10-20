// Shared plumbing for the 3D header proposals: album tiles, drag with inertia,
// pause when off screen, reduced-motion support. Each scene registers itself with Hero3D.run().
window.Hero3D = (function () {
  // Albums whose cover is a grid of several photos.
  const COLLAGE = /^(2023-03|2025-0[2-8](?!-paris-nouvel|-valencia))/;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tile(a, w, h) {
    const el = document.createElement('a');
    el.className = 'tile';
    el.href = a.link; el.target = '_blank'; el.rel = 'noopener';
    el.title = a.title;
    el.tabIndex = -1; // keyboard users get the album list below instead
    el.setAttribute('aria-label', a.title);
    el.style.width = w + 'px'; el.style.height = h + 'px';
    el.style.marginLeft = -w / 2 + 'px'; el.style.marginTop = -h / 2 + 'px';
    el.innerHTML = `<img src="img/hero/${a.id}.jpg" alt="" width="320" height="240" decoding="async" draggable="false">`;
    return el;
  }

  function run(scene) {
    const stage = document.getElementById('stage');
    const hero = stage.parentElement;
    const world = document.createElement('div');
    world.className = 'world';
    stage.appendChild(world);

    // Drag state shared with the scene: dx/dy are velocities in px per frame.
    const drag = { active: false, vx: 0, vy: 0, moved: 0 };
    let lastX = 0, lastY = 0;
    stage.addEventListener('pointerdown', e => {
      drag.active = true; drag.moved = 0; lastX = e.clientX; lastY = e.clientY;
      drag.vx = drag.vy = 0;
    });
    addEventListener('pointermove', e => {
      scene.pointer && scene.pointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
      if (!drag.active) return;
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      drag.vx = dx; drag.vy = dy;
      if (drag.moved > 6) stage.classList.add('dragging');
    });
    const end = () => { drag.active = false; stage.classList.remove('dragging'); };
    addEventListener('pointerup', end);
    addEventListener('pointercancel', end);
    // A drag should not open the album under the finger.
    stage.addEventListener('click', e => { if (drag.moved > 6) e.preventDefault(); }, true);

    let visible = true, ready = false, raf = 0, last = 0;
    function loop(now) {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      scene.frame(dt, drag);
      if (!drag.active) { drag.vx *= 0.94; drag.vy *= 0.94; }
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0;
    }
    const start = () => { if (ready && !raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } };
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; start(); }).observe(hero);
    document.addEventListener('visibilitychange', start);

    // Rebuild on real size changes only (not when the mobile URL bar shows or hides).
    let resizeT, lastW = innerWidth;
    addEventListener('resize', () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => {
        if (Math.abs(innerWidth - lastW) < 40) return;
        lastW = innerWidth;
        world.innerHTML = '';
        scene.build(world, albums, stage.getBoundingClientRect(), true);
      }, 150);
    });

    let albums = [];
    fetch('data/albums.json').then(r => r.json()).then(data => {
      // Single-photo covers first: they read better at small size than the collage covers.
      const isCollage = a => COLLAGE.test(a.id);
      albums = data.filter(a => a.cover).sort((a, b) => (isCollage(a) - isCollage(b)) || b.date.localeCompare(a.date));
      scene.build(world, albums, stage.getBoundingClientRect());
      ready = true;
      start();
    });
  }

  return { run, tile, reduced };
})();
