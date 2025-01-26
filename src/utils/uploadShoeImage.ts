import { uploadImageToSupabase } from "./uploadImage";

export const uploadShoeImage = async () => {
  // Create a File object from the image URL
  const response = await fetch("public/lovable-uploads/2b12cb1d-2809-4cf9-ba2f-c2630c1a6b4e.png");
  const blob = await response.blob();
  const file = new File([blob], "shoe.png", { type: "image/png" });
  
  const result = await uploadImageToSupabase(file);
  
  if (result) {
    console.log("Shoe image uploaded successfully:", result);
    return result;
  } else {
    console.error("Failed to upload shoe image");
    return null;
  }
};