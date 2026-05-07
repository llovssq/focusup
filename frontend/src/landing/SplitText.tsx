import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: 'left' | 'center' | 'right' | 'inherit';
}

export default function SplitText({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  tag: Tag = 'p',
  textAlign = 'inherit'
}: SplitTextProps) {
  const elRef = useRef<HTMLElement>(null);

  const words = useMemo(() => text.split(' '), [text]);

  useEffect(() => {
    if (!elRef.current) return;

    const chars = elRef.current.querySelectorAll('.split-char');
    
    const tl = gsap.fromTo(chars, 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: duration,
        ease: ease,
        stagger: delay / 1000,
        scrollTrigger: {
          trigger: elRef.current,
          start: `top ${90}%`,
          once: true,
        },
      }
    );

    return () => {
      tl.kill();
    };
  }, [text, delay, duration, ease]);

  return (
    <Tag 
      ref={elRef as any}
      className={`split-parent overflow-hidden inline-block whitespace-normal ${className}`}
      style={{ textAlign, wordWrap: 'break-word', willChange: 'transform, opacity' }}
    >
      {words.map((word, wordIdx) => (
        <span key={wordIdx} className="split-word inline-block whitespace-nowrap">
          {word.split('').map((char, charIdx) => (
            <span key={charIdx} className="split-char inline-block">
              {char}
            </span>
          ))}
          {wordIdx < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
