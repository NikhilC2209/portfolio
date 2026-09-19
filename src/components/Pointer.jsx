import React, { useRef, useEffect } from "react";
import { trailFor, trailStorageKey } from "../data/themes.js";

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

  const colors = palette.colors
    .map((color) => {
      if (color.startsWith("#")) return color;
      const channels = styles.getPropertyValue(`--c-${color}`).trim().split(/\s+/);
      return channels.length === 3 ? `rgb(${channels.join(", ")})` : null;
    })
    .filter(Boolean);

  return { shape, colors };
}

export default function Pointer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let particles = [];
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
    };

    const onMouseOut = () => {
      mouse.x = mouse.last_x;
      mouse.y = mouse.last_y;
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseout", onMouseOut);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    const random = (min, max) => Math.random() * (max - min) + min;

    function createParticle() {
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
