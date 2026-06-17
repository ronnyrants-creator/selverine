'use client';
import { useEffect, useRef } from 'react';
import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

const CHIPS = [
  { label: 'Ingrédients premium', pos: 'orbit-item--1' },
  { label: 'Rituel quotidien',    pos: 'orbit-item--2' },
  { label: 'Non gras',            pos: 'orbit-item--3' },
  { label: 'Tous types',          pos: 'orbit-item--4' },
];

export function Why() {
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const frames: number[] = [];
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const amp = 5 + i * 2;
      const speed = 2800 + i * 600;
      const phase = i * (Math.PI / 2);
      let start: number | null = null;

      const tick = (ts: number) => {
        if (!start) start = ts;
        el.style.transform = `translateY(${Math.sin(((ts - start) / speed) * Math.PI * 2 + phase) * amp}px)`;
        frames[i] = requestAnimationFrame(tick);
      };
      frames[i] = requestAnimationFrame(tick);
    });
    return () => frames.forEach(cancelAnimationFrame);
  }, []);

  return (
    <section className="why section-dark" id="pourquoi">
      <div className="container container--narrow">
        <ScrollReveal className="why__header">
          <p className="eyebrow eyebrow--light">La Différence SELVERINE</p>
          <h2 className="section-headline section-headline--light">Un rituel conçu pour<br /><em>votre vie quotidienne.</em></h2>
        </ScrollReveal>

        <div className="why__bottle">
          <ImageFrame variant="product" label="PRODUCT 3:4" desc="Flacon SELVERINE sur fond sombre." />
          <div className="why__orbit" aria-hidden="true">
            {CHIPS.map(({ label, pos }, i) => (
              <div
                key={label}
                ref={el => { itemRefs.current[i] = el; }}
                className={`orbit-item ${pos}`}
              >
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
