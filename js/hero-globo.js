// Proposal 3 · El Globo: every album on a spinning world, circled by a ring of dance names. Drag to turn it.
(function () {
  const { tile, reduced } = Hero3D;
  const TEXT = ' BOLIVIA CARNAVAL · CAPORALES · TINKU · MORENADA · SALAY · DIABLADA · LLAMERADA · KULLAWADA ·';
  let world, tiles = [], ring, R = 260, age = 0, rx = -12, ry = 0, ringRot = 0, aimX = 0, aimY = 0, tiltX = 0, tiltY = 0;

  function place(scale) {
    for (const t of tiles) {
      const k = Math.max(0, Math.min(1, (age - t.delay) / 1.3));
      const e = 1 - Math.pow(1 - k, 4);
      const r = R * (scale ? e : 1) * (1 + 0.6 * (1 - e));
      t.el.style.transform = `rotateY(${t.lon}deg) rotateX(${t.lat}deg) translateZ(${r}px) scale(${scale ? 0.2 + 0.8 * e : 1})`;
      t.el.style.opacity = scale ? e : 1;
    }
  }

  Hero3D.run({
    build(w, albums, box, rebuild) {
      world = w;
      const mobile = box.width < 820;
      R = mobile ? Math.min(box.width * 0.34, box.height * 0.2) : Math.min(box.width * 0.2, box.height * 0.32, 320);
      const n = Math.max(albums.length, 44);
      const tw = Math.round(R * 0.52), th = Math.round(tw * 0.75);
      const golden = 180 * (3 - Math.sqrt(5));
      const core = document.createElement('div');
      core.className = 'core';
      // The glow sits behind the globe, outside the rotating world so it stays round.
      const cs = getComputedStyle(world);
      Object.assign(core.style, { width: R * 2.4 + 'px', height: R * 2.4 + 'px', left: cs.left, top: cs.top, margin: -R * 1.2 + 'px 0 0 ' + -R * 1.2 + 'px' });
      world.parentElement.querySelector('.core')?.remove();
      world.parentElement.insertBefore(core, world);
      tiles = Array.from({ length: n }, (_, i) => {
        const el = tile(albums[i % albums.length], tw, th);
        world.appendChild(el);
        const y = 1 - 2 * (i + 0.5) / n;
        return { el, lat: Math.asin(y) * 180 / Math.PI, lon: i * golden, delay: reduced ? 0 : 0.15 + (i % 11) * 0.06 + (i / n) * 0.5 };
      });
      // Ring of dance names, standing up around the globe like Saturn's ring.
      ring = document.createElement('div');
      ring.className = 'ring';
      const chars = [...TEXT], rr = R * 1.42, fs = Math.max(14, Math.round(R * 0.11));
      chars.forEach((c, i) => {
        const s = document.createElement('span');
        s.textContent = c;
        s.style.fontSize = fs + 'px';
        s.style.transform = `rotateY(${(i / chars.length) * 360}deg) translateZ(${rr}px)`;
        ring.appendChild(s);
      });
      world.appendChild(ring);
      if (!rebuild) age = reduced ? 10 : 0;
      place(!reduced && age < 3);
    },
    pointer(x, y) { aimX = x; aimY = y; },
    frame(dt, drag) {
      age += dt;
      if (age < 3) place(true); else if (age - dt < 3) place(false);
      // Arrival: the globe assembles from the centre while spinning fast.
      const intro = Math.max(0, 1 - age / 2);
      ry += (reduced ? 0 : 9 + 300 * intro * intro) * dt + drag.vx * 0.3;
      rx = Math.max(-45, Math.min(45, rx - drag.vy * 0.25));
      ringRot -= (reduced ? 0 : 22) * dt;
      tiltX += (aimY * -6 - tiltX) * 0.05;
      tiltY += (aimX * 8 - tiltY) * 0.05;
      world.style.transform = `rotateX(${rx + tiltX}deg) rotateY(${ry + tiltY}deg)`;
      // The ring keeps its own tilt and spins the other way.
      ring.style.transform = `rotateY(${-ry - tiltY}deg) rotateX(${-rx - tiltX}deg) rotateZ(-14deg) rotateX(14deg) rotateY(${ringRot}deg)`;
    },
  });
})();
