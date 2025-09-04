const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload a buffer to Cloudinary
 * @param {Buffer} buffer - file buffer
 * @param {Object} options - { folder: string, resourceType?: 'image'|'video'|'auto', filename?: string }
 * @returns {Promise<import('cloudinary').UploadApiResponse>}
 */
function uploadBufferToCloudinary(buffer, { folder, resourceType = 'image', filename } = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Get Cloudinary public_id from a secure URL
 * @param {string} url
 * @returns {string|null}
 */
function getPublicIdFromUrl(url) {
  try {
    if (!url || !url.includes('res.cloudinary.com')) return null;
    const u = new URL(url);
    // Example: /<cloud_name>/<resource_type>/upload/v1699999999/folder/name.jpg
    const parts = u.pathname.split('/').filter(Boolean);
    // parts[0] = cloud name, [1] = resource_type (image|video|raw), [2] = 'upload'
    const uploadIndex = parts.findIndex(p => p === 'upload');
    if (uploadIndex === -1) return null;
    const pathAfterUpload = parts.slice(uploadIndex + 1); // starts with version (v123...) optionally
    // Remove version component like v1699999999 if present
    const first = pathAfterUpload[0];
    const rest = first && first.startsWith('v') ? pathAfterUpload.slice(1) : pathAfterUpload;
    if (rest.length === 0) return null;
    const publicPath = rest.join('/');
    // Strip extension from last segment
    const lastSlash = publicPath.lastIndexOf('/');
    const folder = lastSlash >= 0 ? publicPath.slice(0, lastSlash) : '';
    const filename = lastSlash >= 0 ? publicPath.slice(lastSlash + 1) : publicPath;
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    return folder ? `${folder}/${nameWithoutExt}` : nameWithoutExt;
  } catch (e) {
    return null;
  }
}

/**
 * Delete a Cloudinary resource by URL
 * @param {string} url
 * @param {'image'|'video'|'raw'|'auto'} [resourceType]
 */
async function deleteFromCloudinaryByUrl(url, resourceType = 'image') {
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return { result: 'not_cloudinary' };
  const rt = resourceType === 'auto' ? 'image' : resourceType; // default to image
  return cloudinary.uploader.destroy(publicId, { resource_type: rt });
}

/**
 * Insert delivery transformations into a Cloudinary URL
 * E.g., add f_auto,q_auto after /upload/
 */
function withDeliveryTransformations(url, transformation = 'f_auto,q_auto') {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/${transformation}/`);
}

module.exports = {
  cloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinaryByUrl,
  getPublicIdFromUrl,
  withDeliveryTransformations,
};

