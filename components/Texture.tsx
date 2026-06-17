'use client';
import { useEffect, useRef, useState } from 'react';
import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

const BARS = [
  { label: 'Légèreté',  value: 'Ultra-légère', pct: 20 },
  { label: 'Absorption',value: 'Rapide',        pct: 95 },
  { label: 'Finition',  value: 'Soyeuse',       pct: 85 },
  { label: 'Effet gras',value: 'Aucun',         pct: 0  },
];

export function Texture() {
  const sectionRef = useRef<HTMLElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setAnimated(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="texture section-beige" id="texture" ref={sectionRef}>
      <div className="container">
        <div className="texture__grid">
          <div className="texture__image">
            <ImageFrame variant="wide" label="TEXTURE MACRO 16:9" desc="Macro de l'huile SELVERINE. Texture soyeuse, reflets dorés." />
          </div>
          <ScrollReveal className="texture__content">
            <p className="eyebrow">L'Expérience Sensorielle</p>
            <h2 className="section-headline">La texture qui<br /><em>disparaît au toucher.</em></h2>
            <div className="texture-props">
              {BARS.map(({ label, value, pct }) => (
                <div className="texture-prop" key={label}>
                  <div className="texture-prop__info">
                    <span>{label}</span>
                    <span className="texture-prop__value">{value}</span>
                  </div>
                  <div className="texture-prop__bar">
                    <div
                      className="texture-prop__fill"
                      style={{ width: animated ? `${pct}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="section-body" style={{ marginTop: '2rem' }}>
              Appliquée en 60 secondes, sans traces, sans résidu — prête pour une journée chargée.
            </p>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
