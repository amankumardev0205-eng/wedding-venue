// Utility functions for image optimization

/**
 * Transforms a Cloudinary URL with optimizations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.crop - Crop mode (fill, fit, etc.)
 * @param {number} options.quality - Quality (1-100)
 * @param {string} options.format - Format (auto, webp, etc.)
 * @returns {string} - Transformed URL
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 80,
    format = 'auto'
  } = options;

  // Insert transformations before the image path
  // URL structure: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) return url;

  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformedUrl = `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;

  return transformedUrl;
};

/**
 * Gets optimized URL for venue card images
 * @param {string} url - Original image URL
 * @returns {string} - Optimized URL
 */
export const getVenueCardImageUrl = (url) => {
  return optimizeCloudinaryUrl(url, { width: 400, height: 300, crop: 'fill' });
};

/**
 * Gets optimized URL for venue detail images
 * @param {string} url - Original image URL
 * @returns {string} - Optimized URL
 */
export const getVenueDetailImageUrl = (url) => {
  return optimizeCloudinaryUrl(url, { width: 800, height: 600, crop: 'fill' });
};

/**
 * Gets optimized URL for gallery thumbnails
 * @param {string} url - Original image URL
 * @returns {string} - Optimized URL
 */
export const getGalleryThumbnailUrl = (url) => {
  return optimizeCloudinaryUrl(url, { width: 150, height: 150, crop: 'fill' });
};

export const getSrcSet = (url, widths = [320, 480, 768, 1024]) => {
  if (!url) return '';
  const parts = widths.map((w) => `${optimizeCloudinaryUrl(url, { width: w, height: Math.round((w * 3) / 4), crop: 'fill', quality: 80 })} ${w}w`);
  return parts.join(', ');
};

export const FALLBACK_IMAGE_URL = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%23f7ded6"/><path d="M150 180 h100 v60 h-100 z M130 180 l70 -60 l70 60 z M200 80 l20 20 h-40 z" fill="%23cf5577" opacity="0.6"/><text x="50%" y="85%" font-family="sans-serif" font-size="14" font-weight="bold" fill="%23cf5577" text-anchor="middle">Venue Image Not Available</text></svg>';

export const handleImageError = (e) => {
  if (e.target.src !== FALLBACK_IMAGE_URL) {
    e.target.src = FALLBACK_IMAGE_URL;
    if (e.target.srcset) {
      e.target.srcset = '';
    }
  }
};