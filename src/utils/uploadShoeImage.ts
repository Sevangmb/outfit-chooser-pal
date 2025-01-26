import { uploadImageToSupabase } from "./uploadImage";

export const uploadShoeImage = async () => {
  const imageUrl = "public/lovable-uploads/2b12cb1d-2809-4cf9-ba2f-c2630c1a6b4e.png";
  const result = await uploadImageToSupabase(imageUrl);
  
  if (result) {
    console.log("Shoe image uploaded successfully:", result);
    return result;
  } else {
    console.error("Failed to upload shoe image");
    return null;
  }
};