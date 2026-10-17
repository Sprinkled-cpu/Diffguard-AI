import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = '',
}) => {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block ${
        disabled
          ? 'text-slate-400'
          : 'bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200 bg-[200%_auto] bg-clip-text text-transparent animate-shine'
      } ${className}`}
      style={{
        animationDuration: disabled ? undefined : animationDuration,
      }}
    >
      {text}
    </span>
  );
};

export default ShinyText;
