"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeDisplay({ value, size = 120, className }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 2,
      color: { dark: "var(--color-primary)", light: "var(--color-background)" },
    }).catch(() => {});
  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} className={className} />;
}
