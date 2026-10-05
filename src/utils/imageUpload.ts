/**
 * ENVIO DE FOTOS PELO CLIENTE — valida, redimensiona e comprime antes de guardar.
 * Tudo acontece no navegador: a imagem nunca sai do dispositivo e chega ao
 * localStorage já reduzida (dataURL JPEG), para não estourar a cota (~5 MB).
 */

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // 10 MB antes de comprimir
const MAX_DIMENSION = 1600; // maior lado da foto guardada (px)
const JPEG_QUALITY = 0.82;

export const ACCEPTED_IMAGE_ATTR = 'image/jpeg,image/png,image/webp';

export function isAcceptedImageType(type: string): boolean {
  return ACCEPTED_TYPES.includes(type);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    img.src = src;
  });
}

/**
 * Lê um ficheiro escolhido pelo cliente e devolve dataURL JPEG pronto a guardar.
 * Lança Error com mensagem amigável (formato, tamanho ou leitura).
 */
export async function processImage(file: File): Promise<string> {
  if (!isAcceptedImageType(file.type)) {
    throw new Error('Formato não suportado. Escolha uma foto JPG, PNG ou WEBP.');
  }
  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('A imagem é demasiado grande. O máximo é 10 MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Não foi possível preparar a imagem.');

    // PNGs com transparência são fundidos em branco (o convite é papel).
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
