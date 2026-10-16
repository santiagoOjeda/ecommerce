import { storage, isFirebaseConfigured } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

let isStorageAvailable: boolean | null = null;

/**
 * Compresses an image file locally using an off-screen HTML5 canvas.
 * Yields an optimized Base64 JPEG (~50-100KB) that renders instantly
 * and fits safely in Firestore without any cloud storage or CORS dependencies.
 */
export function compressImageFile(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available for canvas image processing'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        reject(new Error('No se pudo leer el archivo de imagen.'));
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
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
            resolve(dataUrl);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (err) {
          console.warn('Canvas compression error, using raw image data:', err);
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        // Fallback to uncompressed dataUrl if image rendering fails
        resolve(dataUrl);
      };

      // Set src AFTER attaching onload / onerror to avoid race condition
      img.src = dataUrl;
    };

    reader.onerror = (err) => reject(err);

    // Call readAsDataURL AFTER attaching onload / onerror
    reader.readAsDataURL(file);
  });
}

export const storageService = {
  /**
   * Uploads an image file for a product.
   * If Firebase Storage is uninitialized, unavailable, or throws CORS/404,
   * it seamlessly falls back to high-performance local canvas compression.
   */
  async uploadProductImage(tenantId: string, file: File): Promise<{ url: string; isCloud: boolean }> {
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `tenants/${tenantId}/products/${cleanFileName}`;

    // If storage already failed previously in this session, fallback directly to avoid unnecessary CORS console errors
    if (isStorageAvailable !== false && isFirebaseConfigured && storage && typeof window !== 'undefined') {
      try {
        const storageRef = ref(storage, storagePath);

        // Upload with timeout to avoid long pending requests if bucket doesn't exist
        const uploadPromise = uploadBytes(storageRef, file, {
          contentType: file.type || 'image/jpeg',
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Storage timeout')), 4000)
        );

        const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        isStorageAvailable = true;
        return { url: downloadUrl, isCloud: true };
      } catch (cloudErr) {
        console.warn(
          'Firebase Storage no disponible o sin CORS configurado. Usando compresión local optimizada:',
          cloudErr
        );
        isStorageAvailable = false;
      }
    }

    // Instant local fallback: Compress image to efficient base64 data URL
    const fallbackDataUrl = await compressImageFile(file, 1024, 1024, 0.8);
    return { url: fallbackDataUrl, isCloud: false };
  },

  /**
   * Uploads a store logo with local fallback.
   */
  async uploadTenantLogo(tenantId: string, file: File): Promise<{ url: string; isCloud: boolean }> {
    const cleanFileName = `logo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storagePath = `tenants/${tenantId}/brand/${cleanFileName}`;

    if (isStorageAvailable !== false && isFirebaseConfigured && storage && typeof window !== 'undefined') {
      try {
        const storageRef = ref(storage, storagePath);
        const uploadPromise = uploadBytes(storageRef, file, {
          contentType: file.type || 'image/jpeg',
        });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Storage timeout')), 4000)
        );

        const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        isStorageAvailable = true;
        return { url: downloadUrl, isCloud: true };
      } catch (cloudErr) {
        console.warn('Firebase Storage no disponible para logo. Usando compresión local:', cloudErr);
        isStorageAvailable = false;
      }
    }

    const fallbackDataUrl = await compressImageFile(file, 512, 512, 0.85);
    return { url: fallbackDataUrl, isCloud: false };
  },
};
