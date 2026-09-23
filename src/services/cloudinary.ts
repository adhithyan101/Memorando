import { MediaItem, VoiceNote } from '../types';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

export interface CloudinaryUploadResult {
  success: boolean;
  secureUrl?: string;
  publicId?: string;
  resourceType?: 'image' | 'video' | 'raw';
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  createdAt?: string;
  error?: {
    message: string;
    status?: number;
    rawResponse?: string;
  };
}

/**
 * Validates development-time Cloudinary environment variables.
 */
export const validateCloudinaryConfig = (): { valid: boolean; error?: string } => {
  if (!CLOUD_NAME || CLOUD_NAME.trim() === '' || CLOUD_NAME === 'your_cloudinary_cloud_name') {
    return {
      valid: false,
      error: 'Cloudinary Configuration Error: VITE_CLOUDINARY_CLOUD_NAME is missing or unconfigured in .env',
    };
  }
  if (!UPLOAD_PRESET || UPLOAD_PRESET.trim() === '' || UPLOAD_PRESET === 'your_cloudinary_upload_preset') {
    return {
      valid: false,
      error: 'Cloudinary Configuration Error: VITE_CLOUDINARY_UPLOAD_PRESET is missing or unconfigured in .env',
    };
  }
  return { valid: true };
};

/**
 * Validates image file type and size prior to upload.
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'Please select an image file.' };
  }

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/svg+xml'];
  const isImage = file.type.startsWith('image/') || allowedTypes.includes(file.type.toLowerCase());

  if (!isImage) {
    return { valid: false, error: 'This image format isn\'t supported. Please select a JPG, PNG, WEBP, or GIF image.' };
  }

  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'That image is too large. Please choose a smaller image (under 10MB).' };
  }

  return { valid: true };
};

/**
 * Compress image to a local data URL using HTML5 Canvas.
 * Used as a reliable fallback when cloud storage is unavailable.
 */
export const compressImageToDataUrl = (
  file: File | Blob,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!file.type.startsWith('image/')) {
        return resolve(src);
      }

      const img = new Image();
      img.onerror = () => resolve(src);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(src);
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a media file (image/video/audio) directly to Cloudinary using the configured unsigned preset.
 */
export const uploadToCloudinary = async (
  file: File | Blob,
  resourceType: 'image' | 'video' | 'auto' = 'image',
  onProgress?: UploadProgressCallback
): Promise<MediaItem> => {
  if (import.meta.env.DEV) {
    console.log('[Memorando] Upload started', { resourceType, fileSize: file.size });
  }

  const configCheck = validateCloudinaryConfig();
  if (!configCheck.valid) {
    if (import.meta.env.DEV) {
      console.error('[Cloudinary Configuration Error]', configCheck.error);
    }
    throw new Error(configCheck.error || 'Cloudinary configuration error.');
  }

  const cleanCloudName = CLOUD_NAME.trim();
  const cleanPreset = UPLOAD_PRESET.trim();
  const url = `https://api.cloudinary.com/v1_1/${cleanCloudName}/${resourceType}/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', cleanPreset);

  try {
    const item = await new Promise<MediaItem>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
            if (import.meta.env.DEV && percent === 100) {
              console.log('[Memorando] Upload progress: 100%');
            }
          }
        };
      }

      xhr.onload = () => {
        const xcldError = xhr.getResponseHeader('X-Cld-Error');
        if (import.meta.env.DEV) {
          console.log('[Memorando] Cloudinary response received');
          console.log('[Memorando] Cloudinary HTTP status:', xhr.status);
          if (xcldError) {
            console.warn('[Memorando] Cloudinary X-Cld-Error header:', xcldError);
          }
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const res = JSON.parse(xhr.responseText);
            if (import.meta.env.DEV) {
              console.log('[Memorando] Cloudinary response:', res);
              console.log('[Memorando] Cloudinary secure_url:', res.secure_url);
            }
            const item: MediaItem = {
              id: res.public_id || `media_${Date.now()}`,
              publicId: res.public_id,
              secureUrl: res.secure_url,
              resourceType: res.resource_type === 'video' ? 'video' : 'image',
              format: res.format,
              width: res.width,
              height: res.height,
              duration: res.duration,
              createdAt: new Date().toISOString(),
            };
            resolve(item);
          } catch (parseErr: any) {
            if (import.meta.env.DEV) {
              console.error('[Cloudinary Response Parse Error]', parseErr, xhr.responseText);
            }
            reject(new Error('Failed to parse Cloudinary upload response.'));
          }
        } else {
          let errorMessage = `Cloudinary upload failed (status ${xhr.status})`;
          try {
            const errRes = JSON.parse(xhr.responseText);
            if (errRes.error && errRes.error.message) {
              errorMessage = errRes.error.message;
            }
          } catch {
            // ignore parse failure
          }

          if (import.meta.env.DEV) {
            console.error('[Cloudinary Upload Error Details]', {
              status: xhr.status,
              statusText: xhr.statusText,
              url,
              cloudName: cleanCloudName,
              uploadPreset: cleanPreset,
              xCldError: xcldError,
              errorMessage,
              rawResponseBody: xhr.responseText,
            });
          }

          reject(new Error(errorMessage));
        }
      };

      xhr.onerror = () => {
        if (import.meta.env.DEV) {
          console.error('[Cloudinary Network Error]', { url });
        }
        reject(new Error('Network error during photo upload. Please check your connection.'));
      };

      // Note: Do NOT set Content-Type header manually when using FormData!
      xhr.send(formData);
    });

    return item;
  } catch (err: any) {
    if (import.meta.env.DEV) {
      console.warn('[Memorando] Cloudinary primary upload failed, activating local image compression fallback:', err.message);
    }

    if (onProgress) onProgress(50);
    const dataUrl = await compressImageToDataUrl(file, 800, 800, 0.8);
    if (onProgress) onProgress(100);

    const isVideo = typeof file.type === 'string' && file.type.startsWith('video');
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fallbackItem: MediaItem = {
      id: mediaId,
      publicId: mediaId,
      secureUrl: dataUrl,
      resourceType: isVideo ? 'video' : 'image',
      createdAt: new Date().toISOString(),
    };

    if (import.meta.env.DEV) {
      console.log('[Memorando] Fallback secure_url generated:', fallbackItem.secureUrl.substring(0, 50) + '...');
    }

    return fallbackItem;
  }
};

export const uploadVoiceNote = async (
  audioBlob: Blob,
  durationSeconds: number,
  onProgress?: UploadProgressCallback
): Promise<VoiceNote> => {
  const media = await uploadToCloudinary(audioBlob, 'video', onProgress);
  return {
    id: media.id,
    publicId: media.publicId,
    secureUrl: media.secureUrl,
    duration: durationSeconds,
    createdAt: new Date().toISOString(),
  };
};

