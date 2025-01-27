import { useState } from 'react';
import { api } from '../utils/api';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = async (file: File): Promise<string> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Kreiraj FormData objekt
      const formData = new FormData();
      formData.append('image', file);

      // Konfiguriraj request s progress handlerom
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          setProgress(percentCompleted);
        },
      });

      return response.data.url;
    } catch (error) {
      throw new Error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    progress,
  };
};
