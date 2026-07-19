import React, { useEffect, useRef } from 'react';

export const ThreeDConstellation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX - width / 2) / (width / 2);
      mouseRef.current.targetY = (e.clientY - height / 2) / (height / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);

    interface Point3D {
      x: number;
      y: number;
      z: number;
    }

    const numPoints = 65;
    const points: Point3D[] = [];
    const maxDist = 140;
    const speed = 0.0006;

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: (Math.random() - 0.5) * 900,
        y: (Math.random() - 0.5) * 900,
        z: (Math.random() - 0.5) * 900
      });
    }

    let angleY = 0;
    let angleX = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      angleY = speed + mouse.x * 0.003;
      angleX = speed * 0.5 + mouse.y * 0.003;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projected: { sx: number; sy: number; depth: number }[] = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Y-axis rotation
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        // X-axis rotation
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        const cameraDistance = 700;
        const scale = 600 / (z2 + cameraDistance);

        if (z2 + cameraDistance > 100) {
          const sx = x1 * scale + width / 2;
          const sy = y2 * scale + height / 2;
          projected.push({ sx, sy, depth: z2 });
        } else {
          projected.push({ sx: -999, sy: -999, depth: z2 });
        }
      }

      // Draw connections
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        if (p1.sx < 0 || p1.sx > width || p1.sy < 0 || p1.sy > height) continue;

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (p2.sx < 0 || p2.sx > width || p2.sy < 0 || p2.sy > height) continue;

          const dx = p1.sx - p2.sx;
          const dy = p1.sy - p2.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            
            // Render depth-based colored lines (blue-purple gradient effect)
            if (p1.depth < 0) {
              ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            } else {
              ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            }
            ctx.lineWidth = 0.5 + (1 - dist / maxDist) * 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        if (p.sx < 0 || p.sx > width || p.sy < 0 || p.sy > height) continue;

        const size = Math.max(0.6, (p.depth + 450) / 250);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, size, 0, Math.PI * 2);
        
        if (p.depth < 0) {
          ctx.fillStyle = `rgba(59, 130, 246, 0.45)`;
        } else {
          ctx.fillStyle = `rgba(236, 72, 153, 0.35)`;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 bg-cyber-grid"
    />
  );
};
