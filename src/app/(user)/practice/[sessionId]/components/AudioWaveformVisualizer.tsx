"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformVisualizerProps {
  isRecording: boolean;
  volume: number; // 0 to 100
  barCount?: number;
  height?: number;
}

export function AudioWaveformVisualizer({
  isRecording,
  volume,
  barCount = 36,
  height = 56,
}: AudioWaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef(0);
  const currentBarsRef = useRef<number[]>(new Array(barCount).fill(4));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      phaseRef.current += isRecording ? 0.12 : 0.03;
      const width = canvas.width;
      const ch = canvas.height;

      ctx.clearRect(0, 0, width, ch);

      const spacing = 4;
      const totalBarWidth = (width - spacing * (barCount - 1)) / barCount;
      const centerY = ch / 2;

      // Target amplitudes
      const normalizedVolume = isRecording ? Math.max(0.12, volume / 100) : 0.06;

      for (let i = 0; i < barCount; i++) {
        // Multi-frequency wave calculation for natural organic vibration
        const wave1 = Math.sin(phaseRef.current + i * 0.28);
        const wave2 = Math.cos(phaseRef.current * 0.7 + i * 0.45);
        const factor = Math.abs(wave1 * 0.6 + wave2 * 0.4);

        // Center emphasis (bell curve)
        const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
        const bell = Math.cos(centerDist * (Math.PI / 2.2));

        const targetHeight = Math.max(
          4,
          factor * bell * normalizedVolume * (ch - 8)
        );

        // Smooth lerp
        currentBarsRef.current[i] += (targetHeight - currentBarsRef.current[i]) * 0.22;
        const currentH = currentBarsRef.current[i];

        const x = i * (totalBarWidth + spacing);
        const y = centerY - currentH / 2;

        // Gradient bar styling
        const gradient = ctx.createLinearGradient(0, y, 0, y + currentH);
        if (isRecording) {
          gradient.addColorStop(0, "rgba(255, 122, 69, 0.95)");
          gradient.addColorStop(0.5, "rgba(255, 77, 79, 0.9)");
          gradient.addColorStop(1, "rgba(255, 178, 107, 0.8)");
        } else {
          gradient.addColorStop(0, "rgba(160, 170, 185, 0.3)");
          gradient.addColorStop(1, "rgba(140, 150, 170, 0.15)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        const radius = Math.min(totalBarWidth / 2, 2);
        ctx.roundRect(x, y, totalBarWidth, currentH, radius);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [barCount, isRecording, volume]);

  return (
    <div style={{ width: "100%", height, display: "flex", alignItems: "center" }}>
      <canvas
        ref={canvasRef}
        width={360}
        height={height}
        style={{
          width: "100%",
          height: `${height}px`,
          display: "block",
          borderRadius: "8px",
        }}
      />
    </div>
  );
}
