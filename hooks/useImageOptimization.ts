/**
 * Image Optimization Utilities
 * Generates responsive srcsets and handles image format conversion
 */

import { DEVICE_SIZES, IMAGE_SIZES } from '../tokens';

/**
 * Generate srcset for responsive images
 * @param basePath - Base path without extension (e.g., '/assets/image')
 * @param format - Image format ('jpg', 'webp', 'avif')
 * @param widths - Array of widths to generate
 * @returns srcset string
 */
export const generateSrcSet = (
  basePath: string,
  format: 'jpg' | 'webp' | 'avif' = 'jpg',
  widths: number[] = [480, 768, 1024, 1440, 1920]
): string => {
  return widths
    .map((width) => `${basePath}-${width}w.${format} ${width}w`)
    .join(', ');
};

/**
 * Generate optimized srcset with multiple formats (webp fallback)
 * @param basePath - Base path without extension
 * @returns object with srcSet and type
 */
export const generateMultiFormatSrcSet = (
  basePath: string,
  widths: number[] = [480, 768, 1024, 1440, 1920]
) => {
  return {
    webp: generateSrcSet(basePath, 'webp', widths),
    jpg: generateSrcSet(basePath, 'jpg', widths),
  };
};

/**
 * Get responsive sizes attribute for different image use cases
 */
export const getResponsiveSizes = (type: keyof typeof IMAGE_SIZES): string => {
  return IMAGE_SIZES[type];
};

/**
 * Format image path for responsive optimization
 * Converts /path/to/image.jpg to /path/to/image-{width}w.{format}
 */
export const formatImagePath = (path: string, width: number, format: string): string => {
  if (!path) return '';
  const basePath = path.replace(/\.[^/.]+$/, '');
  return `${basePath}-${width}w.${format}`;
};

/**
 * Check if image URL is external
 */
export const isExternalImage = (src: string): boolean => {
  return src.startsWith('http://') || src.startsWith('https://');
};

/**
 * Get next image variant width (useful for lazy loading)
 */
export const getNextImageWidth = (currentWidth: number): number => {
  const widths = Object.values(DEVICE_SIZES);
  const nextWidth = widths.find((w) => w > currentWidth);
  return nextWidth || widths[widths.length - 1];
};

/**
 * Generate picture element with multiple sources for maximum compatibility
 * Returns HTML string for use in dangerouslySetInnerHTML or SSR
 */
export const generatePictureHTML = (
  basePath: string,
  alt: string,
  className?: string
): string => {
  const widths = [480, 768, 1024, 1440];
  return `
    <picture>
      <source
        type="image/webp"
        srcset="${generateSrcSet(basePath, 'webp', widths)}"
        sizes="${getResponsiveSizes('hero')}"
      />
      <source
        type="image/jpeg"
        srcset="${generateSrcSet(basePath, 'jpg', widths)}"
        sizes="${getResponsiveSizes('hero')}"
      />
      <img
        src="${basePath}-1024w.jpg"
        alt="${alt}"
        class="${className || ''}"
        loading="lazy"
      />
    </picture>
  `;
};

/**
 * Create blur-up placeholder (SVG-based)
 */
export const createBlurPlaceholder = (
  width: number = 400,
  height: number = 300,
  color: string = '#e5e7eb'
): string => {
  return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"%3E%3Crect fill="%23${color.replace('#', '')}" width="${width}" height="${height}"/%3E%3C/svg%3E`;
};

/**
 * Estimate image dimensions while maintaining aspect ratio
 */
export const calculateResponsiveDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number
): { width: number; height: number } => {
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalHeight / originalWidth;
  return {
    width: maxWidth,
    height: Math.round(maxWidth * aspectRatio),
  };
};
