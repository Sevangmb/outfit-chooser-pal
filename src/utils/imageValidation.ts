export const validateImageFile = async (file: File): Promise<boolean> => {
  console.log("Validating image file:", file.name);
  
  // Check MIME type
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validImageTypes.includes(file.type)) {
    console.error("Invalid file type:", file.type);
    return false;
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    console.error("File too large:", file.size);
    return false;
  }

  // Additional validation: check if file can be loaded as an image
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log("Image validated successfully");
      resolve(true);
    };
    img.onerror = () => {
      console.error("Failed to load image");
      resolve(false);
    };
    img.src = URL.createObjectURL(file);
  });
};

export const verifyImageUrl = async (url: string): Promise<boolean> => {
  console.log("Verifying image URL:", url);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new Error('Not an image');
    }

    // Additional validation: check if URL can be loaded as an image
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        console.log("Image URL validated successfully");
        resolve(true);
      };
      img.onerror = () => {
        console.error("Failed to load image from URL");
        resolve(false);
      };
      img.src = url;
    });
  } catch (error) {
    console.error("Error verifying image URL:", error);
    return false;
  }
};