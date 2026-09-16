import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary if environment variables are provided
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads an image (Buffer, base64 data URI, or URL) to Cloudinary or falls back gracefully
 * @param {string|Buffer} imageInput - Base64 Data URI, remote URL, or binary buffer
 * @param {string} folder - Destination folder name
 * @returns {Promise<{ url: string, publicId: string, secureUrl: string }>}
 */
export async function uploadImage(imageInput, folder = 'kb-furniture-source-studio') {
  try {
    const isCloudinaryConfigured = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    );

    if (isCloudinaryConfigured) {
      const uploadOptions = {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      };

      let result;
      if (typeof imageInput === 'string') {
        result = await cloudinary.uploader.upload(imageInput, uploadOptions);
      } else if (Buffer.isBuffer(imageInput)) {
        const base64Data = `data:image/jpeg;base64,${imageInput.toString('base64')}`;
        result = await cloudinary.uploader.upload(base64Data, uploadOptions);
      }

      return {
        url: result.secure_url || result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
      };
    }

    // Fallback: If Cloudinary keys are not provided, return the data URI or input URL directly
    if (typeof imageInput === 'string') {
      return {
        url: imageInput,
        secureUrl: imageInput,
        publicId: `local-${Date.now()}`,
      };
    }

    if (Buffer.isBuffer(imageInput)) {
      const dataUri = `data:image/jpeg;base64,${imageInput.toString('base64')}`;
      return {
        url: dataUri,
        secureUrl: dataUri,
        publicId: `local-${Date.now()}`,
      };
    }

    throw new Error('Unsupported image input format');
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // If input is a valid URL or data URI, return it gracefully so flow continues
    if (typeof imageInput === 'string') {
      return {
        url: imageInput,
        secureUrl: imageInput,
        publicId: `fallback-${Date.now()}`,
      };
    }
    throw error;
  }
}

export default cloudinary;
