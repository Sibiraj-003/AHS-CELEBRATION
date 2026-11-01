import React, { useEffect, useRef } from 'react';
import './Aurora.css';

export interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  time?: number;
  height?: number;
  scale?: number;
  glow?: number;
  brightness?: number;
  layers?: number;
  direction?: 'top' | 'bottom';
  mouseInteraction?: boolean;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Aurora: React.FC<AuroraProps> = ({
  colorStops = ['#1677FF', '#42D9FF', '#7C5CFF'],
  amplitude = 1.0,
  speed = 0.5,
  opacity = 0.85,
  mouseInteraction = true,
  className = '',
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let clock = 0;

    const resize = () => {
      width = Math.max(1, container.clientWidth);
      height = Math.max(1, container.clientHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!mouseInteraction) return;
      const rect = container.getBoundingClientRect();
      targetMouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      targetMouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    resize();

    // Map provided colorStops to aurora wave palettes
    const palette = colorStops && colorStops.length >= 3 ? colorStops : ['#42D9FF', '#1677FF', '#7C5CFF', '#00F2FE'];
    
    const auroraWaves = [
      {
        color: palette[0] ? `${palette[0]}55` : 'rgba(66, 217, 255, 0.35)',
        baseY: 0.28,
        freq: 0.0022,
        speedMultiplier: 0.8,
        amp: 65 * amplitude,
        phase: 0
      },
      {
        color: palette[1] ? `${palette[1]}60` : 'rgba(22, 119, 255, 0.4)',
        baseY: 0.35,
        freq: 0.0018,
        speedMultiplier: 0.6,
        amp: 85 * amplitude,
        phase: 2.1
      },
      {
        color: palette[2] ? `${palette[2]}55` : 'rgba(124, 92, 255, 0.32)',
        baseY: 0.42,
        freq: 0.0014,
        speedMultiplier: 0.45,
        amp: 75 * amplitude,
        phase: 4.2
      },
      {
        color: palette[3] ? `${palette[3]}45` : 'rgba(0, 242, 254, 0.25)',
        baseY: 0.22,
        freq: 0.0028,
        speedMultiplier: 0.9,
        amp: 55 * amplitude,
        phase: 1.2
      }
    ];

    const render = () => {
      clock += 0.015 * speed;

      // Smooth mouse follow
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Clear with transparent background (revealing the deep dark navy background behind)
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = opacity;

      // Draw each organic undulating curtain
      auroraWaves.forEach((wave, i) => {
        const currentBaseY = height * wave.baseY + mouseY * 35;
        const currentAmp = wave.amp * (1 + Math.sin(clock * 0.5 + i) * 0.2);

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, currentBaseY);

        const step = 8;
        for (let x = 0; x <= width; x += step) {
          const harmonic1 = Math.sin(x * wave.freq + clock * wave.speedMultiplier + wave.phase);
          const harmonic2 = Math.cos(x * wave.freq * 2.2 - clock * 0.35 + wave.phase) * 0.4;
          const harmonic3 = Math.sin(x * 0.0008 + clock * 0.2 + mouseX * 1.5) * 0.3;
          const yOffset = (harmonic1 + harmonic2 + harmonic3) * currentAmp;
          ctx.lineTo(x, currentBaseY + yOffset);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Create elegant flowing vertical gradient for each curtain
        const gradient = ctx.createLinearGradient(0, currentBaseY - currentAmp, 0, currentBaseY + currentAmp * 3.5);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.2, wave.color);
        gradient.addColorStop(0.65, wave.color.replace(/[\d.]+\)$/, '0.12)'));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fill();
      });

      // Subtle atmospheric top glow curtain
      const topGlow = ctx.createRadialGradient(
        width * 0.5 + mouseX * 100,
        height * 0.2,
        10,
        width * 0.5,
        height * 0.2,
        width * 0.7
      );
      topGlow.addColorStop(0, 'rgba(66, 217, 255, 0.15)');
      topGlow.addColorStop(0.4, 'rgba(124, 92, 255, 0.08)');
      topGlow.addColorStop(0.8, 'rgba(22, 119, 255, 0.04)');
      topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = topGlow;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
    };
  }, [amplitude, speed, opacity, mouseInteraction]);

  return (
    <div ref={containerRef} className={`aurora-container ${className}`} style={style}>
      <canvas ref={canvasRef} className="aurora-canvas" aria-hidden="true" />
    </div>
  );
};

export default Aurora;
