import { MediaItem, VoiceNote } from '../types';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'memorando_preset';

export interface UploadProgressCallback {
  (progressPercent: number): void;
}

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

  return new Promise((resolve, reject) => {
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
        const mediaItem: MediaItem = {
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
        resolve(mediaItem);
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || 'Cloudinary upload failed'));
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
};

export const uploadVoiceNote = async (
  audioBlob: Blob,
  durationSeconds: number,
  onProgress?: UploadProgressCallback
): Promise<VoiceNote> => {
  const media = await uploadToCloudinary(audioBlob, 'video', onProgress); // Cloudinary processes audio under video or raw
  return {
    id: media.id,
    publicId: media.publicId,
    secureUrl: media.secureUrl,
    duration: durationSeconds,
    createdAt: new Date().toISOString(),
  };
};
