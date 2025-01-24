import { supabase } from "@/integrations/supabase/client";

export const uploadImageToSupabase = async (file: File): Promise<string> => {
  console.log("Uploading to Supabase:", {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size
  });
  
  // Vérification du type MIME
  if (!file.type.startsWith('image/')) {
    throw new Error(`Invalid file type: ${file.type}. Only images are allowed.`);
  }

  // Extraction de l'extension depuis le nom du fichier ou le type MIME
  const fileExt = file.name.split('.').pop() || file.type.split('/')[1];
  console.log("File extension:", fileExt);

  // Génération d'un nom de fichier unique
  const fileName = `${Math.random()}.${fileExt}`;
  console.log("Generated filename:", fileName);

  const { data, error } = await supabase.storage
    .from('clothes')
    .upload(fileName, file, {
      contentType: file.type,
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

  // Vérification finale de l'URL
  try {
    const response = await fetch(publicUrl);
    console.log("URL verification response:", {
      status: response.status,
      contentType: response.headers.get('content-type'),
      url: publicUrl
    });
  } catch (error) {
    console.error("Error verifying URL:", error);
  }

  return publicUrl;
};