/**
 * Compresses an image data URL by resizing it and converting to JPEG.
 * @param {string} dataUrl The original image data URL (Base64)
 * @param {number} maxDimension Max width or height in pixels
 * @param {number} quality JPEG quality from 0 to 1
 * @returns {Promise<string>} Compressed image data URL
 */
export const compressImage = (dataUrl, maxDimension = 1200, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL("image/png");
      
      console.log(`[ImageUtils] Processed image from ${Math.round(dataUrl.length / 1024)}KB to ${Math.round(compressedDataUrl.length / 1024)}KB`);
      resolve(compressedDataUrl);
    };
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
};
