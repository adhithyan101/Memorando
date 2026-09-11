import { MediaItem, VoiceNote } from '../types';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'memorando_preset';

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

/**
 * Compresses an image file and converts it into a JPEG Data URL.
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

export const uploadToCloudinary = async (
  file: File | Blob,
  resourceType: 'image' | 'video' | 'auto' = 'auto',
  onProgress?: UploadProgressCallback
): Promise<MediaItem> => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'memorando_uploads');

  try {
    const mediaItem = await new Promise<MediaItem>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const res = JSON.parse(xhr.responseText);
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
        } else {
          try {
            const errRes = JSON.parse(xhr.responseText);
            reject(new Error(errRes.error?.message || `Cloudinary upload failed (status ${xhr.status})`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during Cloudinary upload'));
      };

      xhr.send(formData);
    });

    return mediaItem;
  } catch (err: any) {
    console.warn('Cloudinary upload failed, falling back to local compressed data URL:', err.message);

    if (onProgress) onProgress(50);
    const dataUrl = await compressImageToDataUrl(file, 800, 800, 0.8);
    if (onProgress) onProgress(100);

    const isVideo = file.type.startsWith('video');
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mediaId,
      publicId: mediaId,
      secureUrl: dataUrl,
      resourceType: isVideo ? 'video' : 'image',
      createdAt: new Date().toISOString(),
    };
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

