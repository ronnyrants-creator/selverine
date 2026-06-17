'use client';
import { useInView } from '@/hooks/useInView';

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  fade?: 'up' | 'in';
}

export function ScrollReveal({ children, className = '', delay = 0, fade = 'up' }: Props) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`${fade === 'up' ? 'fade-up' : 'fade-in'} ${inView ? 'in-view' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
