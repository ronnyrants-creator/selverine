'use client';
import { useEffect, useRef, useState } from 'react';

export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.unobserve(el);
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px', ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, inView };
}
