import React, { useRef, useEffect } from 'react';

interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left';
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  className?: string;
}

export const Squares: React.FC<SquaresProps> = ({
  direction = 'right',
  speed = 0.5,
  borderColor = 'rgba(51, 65, 85, 0.25)',
  squareSize = 40,
  hoverFillColor = 'rgba(99, 102, 241, 0.1)',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const numSquaresX = Math.ceil(canvas.width / squareSize) + 1;
      const numSquaresY = Math.ceil(canvas.height / squareSize) + 1;

      // Update movement offset
      switch (direction) {
        case 'right':
          gridOffset.current.x = (gridOffset.current.x + speed) % squareSize;
          break;
        case 'left':
          gridOffset.current.x = (gridOffset.current.x - speed + squareSize) % squareSize;
          break;
        case 'up':
          gridOffset.current.y = (gridOffset.current.y - speed + squareSize) % squareSize;
          break;
        case 'down':
          gridOffset.current.y = (gridOffset.current.y + speed) % squareSize;
          break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x + speed) % squareSize;
          gridOffset.current.y = (gridOffset.current.y + speed) % squareSize;
          break;
      }

      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1;

      for (let i = -1; i < numSquaresX; i++) {
        for (let j = -1; j < numSquaresY; j++) {
          const x = i * squareSize + gridOffset.current.x;
          const y = j * squareSize + gridOffset.current.y;

          if (
            hoveredSquare.current &&
            hoveredSquare.current.x >= x &&
            hoveredSquare.current.x < x + squareSize &&
            hoveredSquare.current.y >= y &&
            hoveredSquare.current.y < y + squareSize
          ) {
            ctx.fillStyle = hoverFillColor;
            ctx.fillRect(x, y, squareSize, squareSize);
          }

          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      hoveredSquare.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      hoveredSquare.current = null;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [direction, speed, borderColor, squareSize, hoverFillColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
    />
  );
};

export default Squares;
