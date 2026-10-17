import React, { useEffect, useState, useRef } from 'react';

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: 'view' | 'hover' | 'mount';
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = true,
  revealDirection = 'start',
  characters = '01!@#$%^&*()_+-=[]{}|;:,.<>?/ABCDEF0123456789',
  className = '',
  parentClassName = '',
  encryptedClassName = 'text-electric-400 opacity-70',
  animateOn = 'mount',
}) => {
  const [displayText, setDisplayText] = useState<string>(text);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isScrambling, setIsScrambling] = useState<boolean>(false);
  const iterationRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scramble = () => {
    setIsScrambling(true);
    iterationRef.current = 0;

    if (timeoutRef.current) clearInterval(timeoutRef.current);

    timeoutRef.current = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iterationRef.current) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('');
      });

      iterationRef.current += 1;

      if (iterationRef.current > text.length + maxIterations) {
        if (timeoutRef.current) clearInterval(timeoutRef.current);
        setDisplayText(text);
        setIsScrambling(false);
      }
    }, speed);
  };

  useEffect(() => {
    if (animateOn === 'mount') {
      scramble();
    }
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [text]);

  const handleMouseEnter = () => {
    if (animateOn === 'hover') {
      scramble();
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <span
      className={`inline-block font-mono ${parentClassName}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className={`${className} ${isScrambling ? encryptedClassName : ''}`}>
        {displayText}
      </span>
    </span>
  );
};

export default DecryptedText;
