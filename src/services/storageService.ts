import { storage, isFirebaseConfigured } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export function compressImageFile(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

export const storageService = {
  /**
   * Uploads an image file to Firebase Storage.
   * If Firebase Storage fails or is restricted, falls back gracefully to a compressed base64 data URL.
   */
  async uploadProductImage(tenantId: string, file: File): Promise<{ url: string; isCloud: boolean }> {
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `tenants/${tenantId}/products/${cleanFileName}`;

    if (isFirebaseConfigured && storage && typeof window !== 'undefined') {
      try {
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file, {
          contentType: file.type || 'image/jpeg',
        });
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return { url: downloadUrl, isCloud: true };
      } catch (cloudErr) {
        console.warn('Firebase Storage upload failed, utilizing optimized local image fallback:', cloudErr);
      }
    }

    // Fallback: Compress image to efficient base64 data URL
    const fallbackDataUrl = await compressImageFile(file);
    return { url: fallbackDataUrl, isCloud: false };
  },

  /**
   * Uploads a store logo to Firebase Storage with fallback.
   */
  async uploadTenantLogo(tenantId: string, file: File): Promise<{ url: string; isCloud: boolean }> {
    const cleanFileName = `logo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `tenants/${tenantId}/brand/${cleanFileName}`;

    if (isFirebaseConfigured && storage && typeof window !== 'undefined') {
      try {
        const storageRef = ref(storage, storagePath);
        const snapshot = await uploadBytes(storageRef, file, {
          contentType: file.type || 'image/jpeg',
        });
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return { url: downloadUrl, isCloud: true };
      } catch (cloudErr) {
        console.warn('Firebase Storage logo upload failed, utilizing fallback:', cloudErr);
      }
    }

    const fallbackDataUrl = await compressImageFile(file, 512, 512, 0.85);
    return { url: fallbackDataUrl, isCloud: false };
  },
};
