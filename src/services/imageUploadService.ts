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

  // Extraction de l'extension depuis le type MIME pour garantir la cohérence
  const fileExt = file.type.split('/')[1];
  console.log("File extension from MIME type:", fileExt);

  // Génération d'un nom de fichier unique avec l'extension correcte
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  console.log("Generated filename:", fileName);

  const { data, error } = await supabase.storage
    .from('clothes')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
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

  // Récupération de l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('clothes')
    .getPublicUrl(data.path);

  // Vérification que l'URL est bien formée
  const finalUrl = new URL(publicUrl).toString();
  console.log("Final public URL:", finalUrl);

  // Vérification de l'accessibilité de l'image
  try {
    const response = await fetch(finalUrl);
    console.log("URL verification response:", {
      status: response.status,
      contentType: response.headers.get('content-type'),
      url: finalUrl
    });

    if (!response.ok) {
      throw new Error(`Failed to verify image URL: ${response.status}`);
    }
  } catch (error) {
    console.error("Error verifying URL:", error);
    throw error;
  }

  return finalUrl;
};