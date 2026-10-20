// Proposal 2 · El Túnel: you fly through a tunnel of photos at warp speed. Scrolling or dragging speeds it up.
(function () {
  const { tile, reduced } = Hero3D;
  const FAR = -5200, NEAR = 650, COLORS = ['#e0452f', '#f2c230', '#2fa36b'];
  let items = [], streaks = [], speed = 600, boost = 0, age = 0, spin = 0;
  let stage, ox = 50, oy = 50, aimX = 0, aimY = 0;

  // Scrolling the page gives the tunnel a kick.
  let lastScroll = scrollY;
  addEventListener('scroll', () => { boost = Math.min(9000, boost + Math.abs(scrollY - lastScroll) * 40); lastScroll = scrollY; }, { passive: true });
  addEventListener('wheel', e => { boost = Math.min(9000, boost + Math.abs(e.deltaY) * 25); }, { passive: true });

  Hero3D.run({
    build(world, albums, box, rebuild) {
      stage = world.parentElement;
      const mobile = box.width < 820;
      const Rt = mobile ? Math.max(box.width * 0.62, box.height * 0.32) : Math.max(box.width, box.height) * 0.4;
      const w = Math.round(mobile ? box.width * 0.42 : Math.min(300, box.width * 0.2)), h = Math.round(w * 0.75);
      const n = Math.min(albums.length, mobile ? 26 : 36);
      const golden = Math.PI * (3 - Math.sqrt(5));
      items = albums.slice(0, n).map((a, i) => {
        const el = tile(a, w, h);
        world.appendChild(el);
        const th = i * golden * 2.3, r = Rt * (0.8 + ((i * 37) % 10) / 25);
        return { el, x: Math.cos(th) * r, y: Math.sin(th) * r * (mobile ? 1.25 : 0.8), z: FAR + (i / n) * (NEAR - FAR), tilt: ((i * 53) % 21) - 10 };
      });
      streaks = Array.from({ length: mobile ? 26 : 48 }, (_, i) => {
        const el = document.createElement('i');
        el.className = 'streak';
        el.style.background = `linear-gradient(${COLORS[i % 3]}, transparent)`;
        world.appendChild(el);
        const th = i * golden * 5.1, r = Rt * (0.5 + ((i * 29) % 13) / 10);
        return { el, x: Math.cos(th) * r, y: Math.sin(th) * r, z: FAR + ((i * 71) % 100) / 100 * (NEAR - FAR) };
      });
      if (!rebuild) age = reduced ? 10 : 0;
    },
    pointer(x, y) { aimX = x; aimY = y; },
    frame(dt, drag) {
      age += dt;
      // Arrival: start at warp speed and brake into the cruise.
      const intro = Math.max(0, 1 - age / 2.5);
      boost = boost * 0.93 + Math.abs(drag.vy + drag.vx) * 60;
      const target = reduced ? 0 : 600 + 9000 * intro * intro + boost;
      speed += (target - speed) * 0.12;
      spin += (reduced ? 0 : 4 * dt) + drag.vx * 0.15;
      ox += (50 + aimX * 18 - ox) * 0.05; oy += (50 + aimY * 18 - oy) * 0.05;
      stage.style.perspectiveOrigin = `${ox}% ${oy}%`;
      const len = NEAR - FAR, move = speed * dt;
      const cs = Math.cos(spin * Math.PI / 180), sn = Math.sin(spin * Math.PI / 180);
      for (const it of items) {
        it.z += move; if (it.z > NEAR) it.z -= len;
        const fadeIn = Math.min(1, Math.max(0, (it.z - FAR - 1200) / 1800)), fadeOut = Math.min(1, (NEAR - it.z) / 450);
        const x = it.x * cs - it.y * sn, y = it.x * sn + it.y * cs;
        it.el.style.transform = `translate3d(${x}px,${y}px,${it.z}px) rotateZ(${it.tilt}deg) rotateY(${-x / 40}deg) rotateX(${y / 40}deg)`;
        it.el.style.opacity = Math.max(0, Math.min(fadeIn, fadeOut)).toFixed(3);
      }
      const stretch = 1 + Math.min(14, speed / 700);
      for (const s of streaks) {
        s.z += move * 1.6; if (s.z > NEAR) s.z -= len;
        const x = s.x * cs - s.y * sn, y = s.x * sn + s.y * cs;
        s.el.style.transform = `translate3d(${x}px,${y}px,${s.z}px) rotateX(90deg) scaleY(${stretch})`;
        s.el.style.opacity = Math.max(0, Math.min(1, (s.z - FAR) / 1500, (NEAR - s.z) / 300)).toFixed(3);
      }
    },
  });
})();
