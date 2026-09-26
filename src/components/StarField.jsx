import { useEffect, useRef } from "react";
import { themes } from "../data/themes.js";

// Animated starfield for themes with `starfield: true` (see src/data/themes.js).
// Three layers, back to front:
//   deep sky   faint dust and a Milky Way band, drawn once per resize onto an
//              offscreen canvas; it shifts slightly with the mouse for parallax
//   stars      3D points the camera drifts slowly through, each twinkling on its own;
//              scrolling nudges the ship forward
//   meteors    the occasional shooting star
// Switching into the theme (or the first page of a visit) plays a hyperspace jump:
// the stars stretch into streaks, then drop back to cruising speed.

const CRUISE = 0.012; // depth units per second; a star takes ~80s to reach the edge
const WARP_PEAK = 2.4;
const WARP_MS = 2200;
const SESSION_KEY = "starfield-warped";

// Mostly white, with the blue-white and warm tints real stars have.
const TINTS = ["255 255 255", "255 255 255", "255 255 255", "210 228 255", "185 212 255", "255 241 218", "255 226 190"];

const random = (min, max) => Math.random() * (max - min) + min;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
// Roughly normal, for bunching stars along the galactic band.
const gaussian = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

const themeWantsStarfield = () =>
  themes.find((t) => t.id === document.documentElement.dataset.theme)?.starfield === true;

// Speed multiplier for the hyperspace jump at `elapsed` ms: a hard punch in, a short
// hold at peak, then a long ease back down to cruise.
function warpSpeed(elapsed) {
  const t = elapsed / WARP_MS;
  if (t >= 1) return 0;
  if (t < 0.18) return (t / 0.18) ** 2;
  if (t < 0.4) return 1;
  return (1 - (t - 0.4) / 0.6) ** 3;
}

function newStar(z = random(0.05, 1)) {
  return {
    x: random(-1, 1),
    y: random(-1, 1),
    z,
    size: random(0.4, 1.3),
    tint: pick(TINTS),
    phase: random(0, Math.PI * 2),
    rate: random(0.6, 2.4),
  };
}

function drawDeepSky(width, height, dpr) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * dpr);
  canvas.height = Math.ceil(height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  // The band runs corner to corner, bottom-left to top-right.
  const angle = Math.atan2(-height, width);
  const along = { x: Math.cos(angle), y: Math.sin(angle) };
  const across = { x: -along.y, y: along.x };
  const length = Math.hypot(width, height);
  const bandWidth = Math.min(width, height) * 0.22;
  const pointOnBand = (t, offset) => ({
    x: width / 2 + along.x * t * length * 0.5 + across.x * offset,
    y: height / 2 + along.y * t * length * 0.5 + across.y * offset,
  });

  // Glowing gas along the band: soft blobs of blue, violet and a warm core.
  const gas = ["120 150 255", "150 120 255", "90 180 255", "255 200 160"];
  for (let i = 0; i < 90; i++) {
    const { x, y } = pointOnBand(random(-1, 1), gaussian() * bandWidth * 0.6);
    const radius = random(bandWidth * 0.4, bandWidth * 1.3);
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgb(${pick(gas)} / ${random(0.03, 0.07)})`);
    glow.addColorStop(1, "rgb(0 0 0 / 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }

  const dot = (x, y, radius, alpha, tint = "255 255 255") => {
    ctx.fillStyle = `rgb(${tint} / ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  // Dust across the whole sky, then a denser drift of it packed into the band.
  const area = width * height;
  for (let i = 0; i < area / 1100; i++) {
    dot(random(0, width), random(0, height), random(0.3, 0.8), random(0.12, 0.55), pick(TINTS));
  }
  for (let i = 0; i < area / 450; i++) {
    const { x, y } = pointOnBand(random(-1, 1), gaussian() * bandWidth * 0.5);
    dot(x, y, random(0.25, 0.6), random(0.1, 0.45), pick(TINTS));
  }

  return canvas;
}

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0;
    let height = 0;
    let deepSky = null;
    let stars = [];
    let meteors = [];
    let frame = null;
    let active = false;
    let lastTime = 0;
    let warpStart = -Infinity;
    let scrollBoost = 0;
    let lastScrollY = window.scrollY;
    let nextMeteor = 0;
    // Parallax: `target` follows the mouse, `view` eases towards it.
    const target = { x: 0, y: 0 };
    const view = { x: 0, y: 0 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // A margin on every side so the parallax shift never exposes an edge.
      deepSky = drawDeepSky(width + 60, height + 60, dpr);
      const count = Math.min(420, Math.round((width * height) / 5200));
      stars = Array.from({ length: count }, () => newStar());
    };

    const spawnMeteor = () => {
      // Falls left or right, 17–35° below the horizontal.
      const angle = random(0.3, 0.6);
      const direction = Math.random() < 0.5 ? 1 : -1;
      const speed = random(700, 1100);
      meteors.push({
        x: random(width * 0.1, width * 0.9),
        y: random(0, height * 0.45),
        vx: Math.cos(angle) * speed * direction,
        vy: Math.sin(angle) * speed,
        age: 0,
        life: random(0.6, 1),
        length: random(90, 180),
      });
    };

    const render = (now, dt) => {
      const warp = warpSpeed(now - warpStart);
      const speed = CRUISE + warp * WARP_PEAK + scrollBoost;

      ctx.clearRect(0, 0, width, height);

      view.x += (target.x - view.x) * Math.min(1, dt * 2.5);
      view.y += (target.y - view.y) * Math.min(1, dt * 2.5);

      // The deep sky fades out while the ship is in hyperspace.
      if (deepSky) {
        ctx.globalAlpha = 1 - warp * 0.85;
        ctx.drawImage(deepSky, -30 - view.x * 14, -30 - view.y * 14, width + 60, height + 60);
        ctx.globalAlpha = 1;
      }

      // Stars project from a vanishing point that leans slightly towards the mouse.
      const cx = width / 2 - view.x * width * 0.03;
      const cy = height / 2 - view.y * height * 0.03;
      const fov = Math.max(width, height) * 0.5;
      // How far back each streak reaches, in depth units: grows with speed.
      const streak = Math.min(0.5, speed * 0.05);
      ctx.lineCap = "round";

      for (const star of stars) {
        star.z -= speed * dt;
        const sx = cx + (star.x / star.z) * fov;
        const sy = cy + (star.y / star.z) * fov;

        if (star.z <= 0.02 || sx < -50 || sx > width + 50 || sy < -50 || sy > height + 50) {
          Object.assign(star, newStar(random(0.85, 1)));
          continue;
        }

        const near = 1 - star.z;
        const twinkle = 0.7 + 0.3 * Math.sin(now / 1000 * star.rate + star.phase);
        const alpha = Math.min(1, (0.4 + near * 0.9) * (warp > 0.05 ? 1 : twinkle));
        const size = Math.min(2.8, star.size * (0.9 + near * 1.8));

        const tz = star.z + streak;
        const tx = cx + (star.x / tz) * fov;
        const ty = cy + (star.y / tz) * fov;

        if (Math.hypot(sx - tx, sy - ty) > 1.5) {
          const tail = ctx.createLinearGradient(tx, ty, sx, sy);
          tail.addColorStop(0, `rgb(${star.tint} / 0)`);
          tail.addColorStop(1, `rgb(${star.tint} / ${alpha})`);
          ctx.strokeStyle = tail;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        } else {
          ctx.fillStyle = `rgb(${star.tint} / ${alpha})`;
          ctx.beginPath();
          ctx.arc(sx, sy, size / 2, 0, Math.PI * 2);
          ctx.fill();
          // The brightest, nearest stars get a soft halo.
          if (size > 1.8) {
            ctx.fillStyle = `rgb(${star.tint} / ${alpha * 0.12})`;
            ctx.beginPath();
            ctx.arc(sx, sy, size * 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // A blue-white bloom at the vanishing point during the jump.
      if (warp > 0.05) {
        const bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, fov * 0.9);
        bloom.addColorStop(0, `rgb(200 225 255 / ${warp * 0.16})`);
        bloom.addColorStop(1, "rgb(200 225 255 / 0)");
        ctx.fillStyle = bloom;
        ctx.fillRect(0, 0, width, height);
      }

      if (now > nextMeteor && warp === 0) {
        spawnMeteor();
        nextMeteor = now + random(4000, 11000);
      }
      meteors = meteors.filter((m) => (m.age += dt) < m.life);
      for (const m of meteors) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        // Fade in fast, burn out slowly.
        const t = m.age / m.life;
        const alpha = Math.min(1, t * 8) * (1 - t);
        const norm = Math.hypot(m.vx, m.vy);
        const tailX = m.x - (m.vx / norm) * m.length;
        const tailY = m.y - (m.vy / norm) * m.length;
        const trail = ctx.createLinearGradient(tailX, tailY, m.x, m.y);
        trail.addColorStop(0, "rgb(120 200 255 / 0)");
        trail.addColorStop(1, `rgb(255 255 255 / ${alpha})`);
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(m.x, m.y);
        ctx.stroke();
      }

      scrollBoost *= Math.exp(-dt * 3);
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
      lastTime = now;
      render(now, dt);
      frame = requestAnimationFrame(loop);
    };

    const start = ({ warp }) => {
      active = true;
      canvas.hidden = false;
      resize();
      if (reducedMotion.matches) {
        // One still frame: the sky and stars, nothing moving.
        render(0, 0);
        return;
      }
      if (warp) warpStart = performance.now();
      nextMeteor = performance.now() + random(2500, 6000);
      lastTime = performance.now();
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      active = false;
      cancelAnimationFrame(frame);
      frame = null;
      ctx.clearRect(0, 0, width, height);
      canvas.hidden = true;
    };

    const onThemeChange = () => {
      if (themeWantsStarfield() && !active) start({ warp: true });
      else if (!themeWantsStarfield() && active) stop();
    };

    const onResize = () => {
      if (!active) return;
      resize();
      if (reducedMotion.matches) render(0, 0);
    };

    const onMouseMove = (e) => {
      target.x = (e.clientX / width) * 2 - 1;
      target.y = (e.clientY / height) * 2 - 1;
    };

    const onScroll = () => {
      const delta = Math.abs(window.scrollY - lastScrollY);
      lastScrollY = window.scrollY;
      scrollBoost = Math.min(0.25, scrollBoost + delta * 0.0006);
    };

    window.addEventListener("themechange", onThemeChange);
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    if (themeWantsStarfield()) {
      // Jump into hyperspace on the first page of a visit, not on every navigation.
      let warped = false;
      try {
        warped = window.sessionStorage.getItem(SESSION_KEY) === "1";
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // Storage blocked — skip the jump rather than replay it on every page.
        warped = true;
      }
      start({ warp: !warped });
    } else {
      canvas.hidden = true;
    }

    return () => {
      stop();
      window.removeEventListener("themechange", onThemeChange);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: -1 }}
    ></canvas>
  );
}
