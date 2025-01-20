export const validateImageFile = async (file: File): Promise<boolean> => {
  console.log("Validating image file:", file.name);
  
  if (!file.type.startsWith('image/')) {
    console.error("Invalid file type:", file.type);
    return false;
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    console.error("File too large:", file.size);
    return false;
  }

  return true;
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

    return true;
  } catch (error) {
    console.error("Error verifying image URL:", error);
    return false;
  }
};