"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface ChromaVideoCanvasProps {
  videoSrc: string;
  isPlaying: boolean;
  fallbackImageUrl: string;
  width?: number;
  height?: number;
  className?: string;
  characterName?: string;
}

export function ChromaVideoCanvas({
  videoSrc,
  isPlaying,
  fallbackImageUrl,
  width = 320,
  height = 420,
  className = "",
  characterName = "AI Interviewer",
}: ChromaVideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [hasVideoError, setHasVideoError] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Initialize offscreen processing canvas
  useEffect(() => {
    if (typeof window !== "undefined") {
      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      offscreenCanvasRef.current = off;
    }
  }, [width, height]);

  // Chroma Key Frame Processor (Removes green screen with edge despill)
  const processAndDrawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const offscreen = offscreenCanvasRef.current;

    if (!video || !canvas || !offscreen || video.readyState < 2) {
      return;
    }

    const offCtx = offscreen.getContext("2d", { willReadFrequently: true });
    const ctx = canvas.getContext("2d");
    if (!offCtx || !ctx) return;

    // Preserve aspect ratio focusing on character's head, face and shoulders
    const vWidth = video.videoWidth || 720;
    const vHeight = video.videoHeight || 1280;
    const cropWidth = vWidth;
    const cropHeight = Math.min(vHeight, vWidth * (height / width));

    // Draw source video to offscreen buffer
    offCtx.clearRect(0, 0, width, height);
    offCtx.drawImage(
      video,
      0,
      0,
      cropWidth,
      cropHeight,
      0,
      0,
      width,
      height
    );

    try {
      const frame = offCtx.getImageData(0, 0, width, height);
      const data = frame.data;
      const len = data.length;

      // Real-time green screen removal
      for (let i = 0; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const maxRB = Math.max(r, b);

        // Green dominance threshold calibrated for studio green screen
        if (g > 60 && g > maxRB * 1.14) {
          const diff = g - maxRB;
          if (diff > 14) {
            // Smooth alpha feathering on hair & clothing contour
            const alpha = Math.max(0, 255 - (diff - 14) * 8);
            data[i + 3] = alpha;
            // Despill green reflection on skin and clothing edges
            data[i + 1] = maxRB;
          }
        }
      }

      // Render keyed result to visible canvas
      ctx.clearRect(0, 0, width, height);
      ctx.putImageData(frame, 0, 0);
    } catch {
      // Direct render fallback
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(video, 0, 0, width, height);
    }
  }, [width, height]);

  // Continuous render loop when speaking
  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused || video.ended) {
      return;
    }
    processAndDrawFrame();
    animFrameIdRef.current = requestAnimationFrame(renderLoop);
  }, [processAndDrawFrame]);

  // Synchronize video playback with AI speaking state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideoLoaded) return;

    if (isPlaying) {
      video
        .play()
        .then(() => {
          if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
          animFrameIdRef.current = requestAnimationFrame(renderLoop);
        })
        .catch(() => {
          // Autoplay policy prevented playback
        });
    } else {
      video.pause();
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      // Draw stationary resting frame
      processAndDrawFrame();
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, isVideoLoaded, renderLoop, processAndDrawFrame]);

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      {/* Hidden processing video */}
      <video
        ref={videoRef}
        src={videoSrc}
        playsInline
        muted
        loop
        crossOrigin="anonymous"
        preload="auto"
        onLoadedData={() => {
          setIsVideoLoaded(true);
          // Immediately process and display first resting frame (green removed)
          setTimeout(() => {
            processAndDrawFrame();
          }, 80);
        }}
        onError={() => setHasVideoError(true)}
        style={{ display: "none" }}
      />

      {/* Visible transparent Chroma Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: "drop-shadow(0 16px 32px rgba(33, 25, 20, 0.22))",
          borderRadius: "20px",
        }}
        aria-label={`AI Interviewer Video: ${characterName}`}
      />

      {/* Fallback image if video fails */}
      {hasVideoError && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fallbackImageUrl}
          alt={characterName}
          className={className}
          style={{ width, height, objectFit: "cover", borderRadius: "24px" }}
        />
      )}
    </div>
  );
}