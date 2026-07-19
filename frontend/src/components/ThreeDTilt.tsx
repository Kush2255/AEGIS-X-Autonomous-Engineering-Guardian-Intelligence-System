import React, { useRef, useState } from 'react';

interface ThreeDTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;      // Maximum tilt in degrees
  perspective?: number;  // Depth perspective in pixels
}

export const ThreeDTilt: React.FC<ThreeDTiltProps> = ({
  children,
  className = '',
  maxTilt = 10,
  perspective = 1000
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    transformStyle: 'preserve-3d',
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Cursor coordinates relative to the element (from 0 to width/height)
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    // Normalize coordinates: range from -0.5 to 0.5
    const normX = (cursorX / width) - 0.5;
    const normY = (cursorY / height) - 0.5;

    // Calculate rotation angles
    const rotX = -normY * maxTilt;
    const rotY = normX * maxTilt;

    setStyle({
      transform: `perspective(${perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03, 1.03, 1.03)`,
      transition: 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)',
      transformStyle: 'preserve-3d',
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`,
      transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      transformStyle: 'preserve-3d',
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`will-change-transform ${className}`}
    >
      {children}
    </div>
  );
};
