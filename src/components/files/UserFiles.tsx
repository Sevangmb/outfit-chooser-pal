import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileUploadForm } from "./FileUploadForm";
import { FileList } from "./FileList";
import { FilePreviewDialog } from "./FilePreviewDialog";

export const UserFiles = () => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      console.log("Starting file upload:", file.name);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Utilisateur non connecté");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user_files')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        toast.error("Erreur lors de l'upload du fichier");
        return;
      }

      const { error: dbError } = await supabase
        .from('user_files')
        .insert({
          filename: file.name,
          file_path: filePath,
          content_type: file.type,
          size: file.size,
          user_id: user.id
        });

      if (dbError) {
        console.error("Database error:", dbError);
        toast.error("Erreur lors de l'enregistrement des métadonnées");
        return;
      }

      toast.success("Fichier uploadé avec succès");
      fetchFiles();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setUploading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Erreur lors du chargement des fichiers");
    }
  };

  const handleFileDelete = async (fileId: string, filePath: string) => {
    try {
      const { error: storageError } = await supabase.storage
        .from('user_files')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast.success("Fichier supprimé");
      fetchFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleFileClick = async (file: any) => {
    if (file.content_type.startsWith('image/')) {
      try {
        console.log("Getting public URL for file:", file.file_path);
        
        const { data: { publicUrl }, error } = supabase.storage
          .from('user_files')
          .getPublicUrl(file.file_path);

        if (error || !publicUrl) {
          console.error("Error getting public URL:", error);
          toast.error("Erreur lors de la récupération de l'URL de l'image");
          return;
        }

        console.log("Generated public URL:", publicUrl);
        setPreviewImage(publicUrl);
      } catch (error) {
        console.error("Error handling file click:", error);
        toast.error("Erreur lors de l'affichage de l'image");
      }
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="space-y-4">
      <FileUploadForm 
        uploading={uploading}
        onFileUpload={handleFileUpload}
      />
      <FileList 
        files={files}
        onFileClick={handleFileClick}
        onFileDelete={handleFileDelete}
      />
      <FilePreviewDialog 
        previewImage={previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      />
    </div>
  );
};