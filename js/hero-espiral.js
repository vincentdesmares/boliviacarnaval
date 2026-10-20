// Proposal 1 · La Espiral: a tower of photos that screws upward forever. Drag to spin it.
(function () {
  const { tile, reduced } = Hero3D;
  let tiles = [], R = 300, N = 0, dy = 60, step = 40, H = 800;
  let rot = 0, t = 0, age = 0, tiltX = 0, tiltY = 0, aimX = 0, aimY = 0;

  Hero3D.run({
    build(world, albums, box, rebuild) {
      const mobile = box.width < 820;
      H = box.height;
      R = mobile ? Math.min(box.width * 0.38, 180) : Math.min(box.width * 0.22, box.height * 0.42, 400);
      const w = Math.round(R * (mobile ? 0.8 : 0.74)), h = Math.round(w * 0.75);
      const perTurn = 8;
      step = 360 / perTurn;
      dy = h * 0.34;
      N = Math.min(albums.length, mobile ? 30 : 40);
      tiles = albums.slice(0, N).map(a => { const el = tile(a, w, h); world.appendChild(el); return el; });
      if (!rebuild) age = reduced ? 10 : 0;
    },
    pointer(x, y) { aimX = x; aimY = y; },
    frame(dt, drag) {
      age += dt;
      // Arrival: tiles fall in from a wide ring while the tower spins fast, then settle.
      const intro = Math.max(0, 1 - age / 2.2), e = intro * intro * intro;
      const auto = reduced ? 0 : 1;
      rot += (auto * (14 + 520 * e)) * dt + drag.vx * 0.35;
      t += (auto * 0.55 * dt) - drag.vy * 0.02;
      tiltX += (aimY * -7 - tiltX) * 0.05;
      tiltY += (aimX * 10 - tiltY) * 0.05;
      const r = R * (1 + 3 * e);
      const half = H / 2;
      for (let i = 0; i < N; i++) {
        const p = (((i + t) % N) + N) % N;
        const ang = p * step + rot;
        const y = (N / 2 - p) * dy;
        const facing = (Math.cos(ang * Math.PI / 180) + 1) / 2;
        const fade = Math.max(0, 1 - Math.max(0, Math.abs(y) - half * 0.7) / (half * 0.45));
        const el = tiles[i];
        el.style.transform = `rotateX(${tiltX - 8}deg) rotateY(${tiltY}deg) translate3d(0,${y}px,0) rotateY(${ang}deg) translateZ(${r}px)`;
        el.style.opacity = (fade * (0.3 + 0.7 * facing) * (1 - e * 0.6)).toFixed(3);
      }
    },
  });
})();
