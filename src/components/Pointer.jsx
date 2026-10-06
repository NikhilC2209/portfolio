import React, { useRef, useEffect } from "react";
import { trailFor, trailStorageKey } from "../data/themes.js";
import { playIgnite } from "../scripts/saber-sound.js";
import { pokeballSprite, SPRITE_SIZE } from "../scripts/pokeball-sprites.js";

// Clicks on these never cycle the palette — they already do something.
const INTERACTIVE =
  'a, button, input, textarea, select, label, summary, [role="button"], [role="menuitemradio"]';

function activePalette() {
  const root = document.documentElement;
  const { shape, palettes } = trailFor(root.dataset.theme);
  const palette = palettes.find((p) => p.id === root.dataset.trail) ?? palettes[0];
  return { shape, palette, palettes };
}

// Resolves the active palette into canvas-ready colours. Entries are either a colour
// role mapping to the theme's CSS variable (e.g. "heading" -> --c-heading) or a hex value.
function readTrailStyle() {
  const { shape, palette } = activePalette();
  const styles = getComputedStyle(document.documentElement);

  const resolve = (color) => {
    if (color.startsWith("#")) return color;
    const channels = styles.getPropertyValue(`--c-${color}`).trim().split(/\s+/);
    return channels.length === 3 ? `rgb(${channels.join(", ")})` : null;
  };

  const colors = palette.colors.map(resolve).filter(Boolean);
  // The blade's glow and white-hot core: the palette's `glitch` pair, which titles
  // and cards already light up with, so every saber effect matches.
  const [glow, core] = (palette.glitch ?? []).map(resolve);

  return { shape, colors, glow: glow ?? colors[0], core: core ?? "#FFFFFF", ball: palette.ball };
}

// How long a point stays on the blade, in milliseconds.
const BLADE_LIFE = 260;

// Draws the trail as a lightsaber: a wide coloured glow with a white-hot core, both
// tapering off as the segment ages.
function drawBlade(ctx, points, now, style) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1];
    const to = points[i];
    const fade = Math.max(0, 1 - (now - to.t) / BLADE_LIFE);
    if (fade <= 0) continue;

    const segment = () => {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    };

    ctx.shadowColor = style.glow;
    ctx.strokeStyle = style.glow;
    ctx.globalAlpha = 0.5 * fade;
    ctx.lineWidth = 15 * fade;
    ctx.shadowBlur = 20 * fade;
    segment();

    ctx.strokeStyle = style.core;
    ctx.globalAlpha = 0.95 * fade;
    ctx.lineWidth = 4 * fade;
    ctx.shadowBlur = 10 * fade;
    segment();
  }

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

// Poké Ball trail tuning. Distances are CSS pixels, times milliseconds.
const BALL = {
  scale: 2, // screen pixels per sprite pixel
  every: 48, // pointer travel between balls
  life: 800,
  fadeFrom: 0.55, // fraction of its life after which a ball starts to fade
  gravity: 0.0016, // px/ms²
  max: 40,
};
const SPARK_LIFE = 420;

const random = (min, max) => Math.random() * (max - min) + min;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// A ball popped off the pointer: it hops up, drifts the way the pointer was going, and
// falls away. It stays upright, since a ball on its side no longer reads as one at this
// size. `dx` is the pointer's latest horizontal movement.
function newBall(x, y, dx, now) {
  const vx = clamp(dx * 0.03, -0.35, 0.35) + random(-0.05, 0.05);
  return { x, y, vx, vy: random(-0.42, -0.26), born: now };
}

// A four-point capture sparkle that shrinks away.
function newSpark(x, y, color, now) {
  return { x, y, vx: random(-0.06, 0.06), vy: random(-0.08, 0.02), color, born: now };
}

function drawBalls(ctx, balls, sparks, now, dt, style) {
  const sprite = pokeballSprite(style.ball);
  const size = SPRITE_SIZE * BALL.scale;
  ctx.imageSmoothingEnabled = false;

  for (const ball of balls) {
    ball.vy += BALL.gravity * dt;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    const age = (now - ball.born) / BALL.life;
    ctx.globalAlpha = age < BALL.fadeFrom ? 1 : Math.max(0, (1 - age) / (1 - BALL.fadeFrom));
    // Whole pixels only, so the sprite stays crisp.
    ctx.drawImage(sprite, Math.round(ball.x - size / 2), Math.round(ball.y - size / 2), size, size);
  }
  ctx.globalAlpha = 1;

  for (const spark of sparks) {
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    const arm = Math.round(3 * (1 - (now - spark.born) / SPARK_LIFE));
    if (arm <= 0) continue;
    const x = Math.round(spark.x);
    const y = Math.round(spark.y);
    ctx.fillStyle = spark.color;
    ctx.fillRect(x - 1, y - 1 - arm * 2, 2, arm * 4 + 2);
    ctx.fillRect(x - 1 - arm * 2, y - 1, arm * 4 + 2, 2);
  }
}

export default function Pointer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
    let blade = [];
    let balls = [];
    let sparks = [];
    let travelled = 0;
    let lastFrame = performance.now();
    let frame;
    let timer;
    let style = readTrailStyle();

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const onThemeChange = () => {
      style = readTrailStyle();
    };

    // Only where the trail is actually drawn: the canvas is hidden below md, and
    // touch devices have no cursor to leave a trail.
    const canCycle = window.matchMedia("(min-width: 768px) and (hover: hover)");

    const onClick = (e) => {
      if (!canCycle.matches) return;
      if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return;
      if (window.getSelection()?.toString()) return;

      const { palette, palettes } = activePalette();
      if (palettes.length < 2) return;
      const next = palettes[(palettes.indexOf(palette) + 1) % palettes.length];

      document.documentElement.dataset.trail = next.id;
      style = readTrailStyle();
      // A burst of sparkles where the new ball was picked.
      if (style.shape === "pokeball") {
        const now = performance.now();
        for (let i = 0; i < 8; i++) {
          const color = style.colors[i % style.colors.length];
          sparks.push(newSpark(e.clientX + random(-26, 26), e.clientY + random(-26, 26), color, now));
        }
      }
      // Themes with a sound effect ignite on the colour change, if the visitor
      // has switched sound on.
      playIgnite();
      try {
        window.localStorage.setItem(trailStorageKey, next.id);
      } catch {
        // Storage blocked — the palette still applies for this page.
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("themechange", onThemeChange);
    document.addEventListener("click", onClick);

    const mouse = {
      x: undefined,
      y: undefined,
      last_x: undefined,
      last_y: undefined,
    };

    const onMouseMove = (e) => {
      mouse.last_x = mouse.x;
      mouse.last_y = mouse.y;
      mouse.x = e.x;
      mouse.y = e.y;
      if (style.shape === "blade") blade.push({ x: e.x, y: e.y, t: performance.now() });
      if (style.shape === "pokeball" && mouse.last_x !== undefined) {
        const dx = mouse.x - mouse.last_x;
        travelled += Math.hypot(dx, mouse.y - mouse.last_y);
        if (travelled >= BALL.every && balls.length < BALL.max) {
          travelled = 0;
          const now = performance.now();
          balls.push(newBall(e.x, e.y, dx, now));
          for (let i = 0; i < 2; i++) {
            const color = style.colors[Math.floor(Math.random() * style.colors.length)];
            sparks.push(newSpark(e.x + random(-16, 16), e.y + random(-16, 16), color, now));
          }
        }
      }
    };

    const onMouseOut = () => {
      mouse.x = mouse.last_x;
      mouse.y = mouse.last_y;
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseout", onMouseOut);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();
      // Capped so a backgrounded tab doesn't fling everything off screen on return.
      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;
      balls = balls.filter((ball) => now - ball.born < BALL.life);
      sparks = sparks.filter((spark) => now - spark.born < SPARK_LIFE);
      if (balls.length || sparks.length) drawBalls(ctx, balls, sparks, now, dt, style);
      if (style.shape === "pokeball") {
        frame = requestAnimationFrame(animate);
        return;
      }
      if (style.shape === "blade") {
        blade = blade.filter((point) => now - point.t < BLADE_LIFE);
        if (blade.length > 1) drawBlade(ctx, blade, now, style);
        frame = requestAnimationFrame(animate);
        return;
      }
      particles.forEach((particle, index) => {
        if (particle.isDead()) {
          particles.splice(index, 1);
        } else {
          particle.update();
        }
      });
      frame = requestAnimationFrame(animate);
    }

    animate();

    const particlesConfig = {
      radius_in: [2, 5],
      vx_in: [-1, 1],
      vy_in: [-1, 1],
      spread: 10,
      life: 20,
      interval: 1,
      threshold: 3,
      derivative_ratio: 10,
    };

    function createParticle() {
      // The blade and Poké Balls are drawn from the pointer's path instead of particles.
      if (style.shape === "blade" || style.shape === "pokeball") {
        timer = setTimeout(createParticle, particlesConfig.interval);
        return;
      }
      const radius = random(...particlesConfig.radius_in);
      const x = mouse.x;
      const y = mouse.y;
      let vx = random(...particlesConfig.vx_in);
      let vy = random(...particlesConfig.vy_in);
      const color = style.colors[Math.floor(Math.random() * style.colors.length)];
      const life = particlesConfig.life;
      const spread = particlesConfig.spread;
      const threshold = particlesConfig.threshold;
      const derivative_ratio = particlesConfig.derivative_ratio;

      if (
        Math.abs(mouse.x - mouse.last_x) < threshold &&
        Math.abs(mouse.y - mouse.last_y) < threshold
      ) {
        timer = setTimeout(createParticle, particlesConfig.interval);
        return;
      }

      if (mouse.last_x && mouse.last_y) {
        // Derivative of mouse position
        vx = (mouse.x - mouse.last_x) / derivative_ratio;
        vy = (mouse.y - mouse.last_y) / derivative_ratio;
      }

      if (color) {
        particles.push(
          new Particle(x, y, vx, vy, radius, color, style.shape, life, spread, ctx)
        );
      }

      // Call createParticle again after interval
      timer = setTimeout(createParticle, particlesConfig.interval);
    }

    // Initial call to start creating particles
    createParticle();

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("themechange", onThemeChange);
      document.removeEventListener("click", onClick);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseout", onMouseOut);
      particles = [];
      blade = [];
      balls = [];
      sparks = [];
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 hidden md:block not-sr-only"
    ></canvas>
  );
}

function Particle(x, y, vx, vy, radius, color, shape, life, spread, ctx) {
  this.x = x + Math.random() * spread - spread / 2;
  this.y = y + Math.random() * spread - spread / 2;
  this.vx = vx;
  this.vy = vy;
  this.radius = radius;
  this.color = color;
  this.shape = shape;
  this.life = life;
  this.ctx = ctx;

  this.draw = function () {
    this.ctx.fillStyle = this.color;
    if (this.shape === "square") {
      // Snap to whole pixels so the fragments stay crisp rather than blurry.
      const size = Math.round(this.radius * 1.6);
      this.ctx.fillRect(Math.round(this.x - size / 2), Math.round(this.y - size / 2), size, size);
      return;
    }
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    this.ctx.fill();
    this.ctx.closePath();
  };

  this.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 1;
    this.draw();
  };

  this.isDead = function () {
    return this.life <= 0;
  };
}
