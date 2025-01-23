import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string> => {
  console.log("Uploading to Supabase:", file.name);
  
  const fileExt = "png"; // Always use PNG extension
  const fileName = `${Math.random()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('clothes')
    .upload(fileName, file, {
      contentType: "image/png",
      upsert: false
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  if (!data) {
    console.error("No data returned from Supabase");
    throw new Error("Upload failed");
  }

  console.log("Upload successful:", data);

  const { data: { publicUrl } } = supabase.storage
    .from('clothes')
    .getPublicUrl(data.path);

  console.log("Public URL:", publicUrl);
  return publicUrl;
};