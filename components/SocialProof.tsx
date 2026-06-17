import { ImageFrame } from './ImageFrame';
import { ScrollReveal } from './ScrollReveal';

const UGC: Array<{ v: 'ugc-square' | 'ugc-portrait' }> = [
  { v: 'ugc-portrait' }, { v: 'ugc-square' }, { v: 'ugc-square' },
  { v: 'ugc-portrait' }, { v: 'ugc-square' }, { v: 'ugc-square' },
  { v: 'ugc-square' },   { v: 'ugc-portrait'}, { v: 'ugc-square' },
];

export function SocialProof() {
  return (
    <section className="social-proof section-white" id="communaute">
      <div className="container">
        <ScrollReveal className="social-proof__header">
          <p className="eyebrow">Communauté</p>
          <h2 className="section-headline">Elles ont adopté<br /><em>le rituel SELVERINE.</em></h2>
          <p className="social-proof__handle">@selverine.ma</p>
        </ScrollReveal>
        <div className="masonry-grid">
          {UGC.map(({ v }, i) => (
            <div className="masonry-item" key={i}>
              <ImageFrame variant={v} label={`UGC ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
