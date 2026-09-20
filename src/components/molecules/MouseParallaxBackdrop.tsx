"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COUNT = 70;
const SPOTLIGHT_RADIUS_PX = 520;

/**
 * Animated background for the about page.
 *
 * Four layers react to pointer movement at different depths:
 *  - A far gradient field that moves least.
 *  - A mid field of amber glows.
 *  - A canvas-drawn particle field of wood-dust motes.
 *  - A soft spotlight that follows the pointer directly, at full strength.
 *
 * The spotlight is the layer the eye actually tracks; the others provide
 * depth without competing. All motion is written straight to the DOM or
 * canvas context, never through React state.
 */
export function MouseParallaxBackdrop() {
  const farRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let frame = 0;
    let targetX = 0.5;
    let targetY = 0.5;
    let currentX = 0.5;
    let currentY = 0.5;

    const onMove = (event: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      targetX = event.clientX / w;
      targetY = event.clientY / h;
    };

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 0.8 + Math.random() * 2.4,
      speed: 0.015 + Math.random() * 0.05,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.4,
      driftY: (Math.random() - 0.5) * 0.6,
    }));

    let dpr = 1;
    const resize = () => {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    let time = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      const dx = currentX - 0.5;
      const dy = currentY - 0.5;

      if (farRef.current) {
        farRef.current.style.transform = `translate3d(${dx * -80}px, ${dy * -60}px, 0)`;
      }
      if (midRef.current) {
        midRef.current.style.transform = `translate3d(${dx * -160}px, ${dy * -120}px, 0)`;
      }
      if (spotRef.current) {
        spotRef.current.style.transform = `translate3d(${currentX * 100}vw, ${currentY * 100}vh, 0) translate(-50%, -50%)`;
      }

      if (ctx && canvas) {
        time += 0.006;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        const h = canvas.height;

        for (const p of particles) {
          const drift = Math.sin(time * p.speed + p.phase);
          const px =
            ((p.x + drift * 0.03 + p.driftX * 0.01) % 1) * w + dx * 40 * dpr;
          const py =
            ((p.y + drift * 0.02 + p.driftY * 0.01) % 1) * h + dy * 40 * dpr;

          const alpha =
            0.12 + (Math.sin(time * 0.5 + p.phase) * 0.5 + 0.5) * 0.4;
          ctx.beginPath();
          ctx.arc(px, py, p.size * dpr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 196, 138, ${alpha})`;
          ctx.fill();
        }
      }

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", resize);
    resize();
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden"
    >
      <div
        ref={farRef}
        className="absolute -inset-40"
        style={{
          background:
            "radial-gradient(55% 50% at 22% 25%, rgba(210,140,60,0.30) 0%, rgba(210,140,60,0) 65%), radial-gradient(45% 55% at 80% 75%, rgba(140,90,50,0.28) 0%, rgba(140,90,50,0) 68%)",
        }}
      />

      <div
        ref={midRef}
        className="absolute -inset-24"
        style={{
          background:
            "radial-gradient(38% 34% at 65% 15%, rgba(240,170,90,0.24) 0%, rgba(240,170,90,0) 72%), radial-gradient(32% 36% at 15% 85%, rgba(180,120,60,0.20) 0%, rgba(180,120,60,0) 70%)",
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />

      <div
        ref={spotRef}
        className="absolute left-0 top-0"
        style={{
          width: `${SPOTLIGHT_RADIUS_PX}px`,
          height: `${SPOTLIGHT_RADIUS_PX}px`,
          background:
            "radial-gradient(circle, rgba(255,220,160,0.10) 0%, rgba(255,220,160,0) 65%)",
          willChange: "transform",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(237,228,211,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(237,228,211,0.6) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />
    </div>
  );
}
