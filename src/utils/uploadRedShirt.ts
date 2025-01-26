import { uploadImageToSupabase } from "./uploadImage";

export const uploadRedShirt = async () => {
  try {
    // Create a File object from the image URL
    const response = await fetch("public/lovable-uploads/a14de15f-69ee-4c05-bdae-84f313e5238c.png");
    const blob = await response.blob();
    const file = new File([blob], "red-shirt.png", { type: "image/png" });
    
    const publicUrl = await uploadImageToSupabase(file);
    
    if (publicUrl) {
      console.log("Red shirt image uploaded successfully:", publicUrl);
      return publicUrl;
    }
    
    return null;
  } catch (error) {
    console.error("Error uploading red shirt:", error);
    throw error;
  }
};