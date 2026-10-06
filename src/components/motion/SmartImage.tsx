import React from 'react';

type SmartImageProps = React.ImgHTMLAttributes<HTMLImageElement>;

/**
 * Imagem com esqueleto próprio: fundo com brilho até ao `load`, fade-in no fim
 * e carregamento lazy nativo por omissão.
 *
 * Não envolve a imagem em nenhum elemento — é substituição directa de `<img>`,
 * por isso não mexe nos layouts existentes.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  className = '',
  loading = 'lazy',
  decoding = 'async',
  alt = '',
  onLoad,
  ...rest
}) => {
  const ref = React.useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = React.useState(false);

  // Imagens em cache podem estar completas antes de o onLoad ser disparado.
  React.useLayoutEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true);
    onLoad?.(event);
  };

  return (
    <img
      {...rest}
      ref={ref}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onLoad={handleLoad}
      className={`${loaded ? '' : 'skeleton-img'} img-fade ${loaded ? 'is-loaded' : ''} ${className}`}
    />
  );
};
