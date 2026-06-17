interface Props {
  label: string;
  desc?: string;
  variant?: 'hero' | 'portrait' | 'editorial' | 'square' | 'wide' | 'tall' | 'product' | 'product-lg' | 'circle' | 'ugc-square' | 'ugc-portrait';
  className?: string;
}

export function ImageFrame({ label, desc, variant = 'square', className = '' }: Props) {
  return (
    <div className={`img-frame img-frame--${variant} ${className}`}>
      <div className="img-frame__inner">
        <div className="img-frame__label">{label}</div>
        {desc && <div className="img-frame__desc">{desc}</div>}
      </div>
    </div>
  );
}
