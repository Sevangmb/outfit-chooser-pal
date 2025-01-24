import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Utilisateur non connecté");
        return;
      }

      // Upload to Storage
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

      // Save file metadata
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

  const deleteFile = async (fileId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('user_files')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
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
        console.log("Attempting to get public URL for file:", file.file_path);
        
        const { data: { publicUrl } } = supabase.storage
          .from('user_files')
          .getPublicUrl(file.file_path);

        if (!publicUrl) {
          console.error("No public URL returned for file:", file.file_path);
          toast.error("Erreur lors de la récupération de l'image");
          return;
        }

        // Verify the URL structure
        const url = new URL(publicUrl);
        console.log("Generated public URL:", url.toString());
        
        setPreviewImage(publicUrl);
      } catch (error) {
        console.error("Error handling file click:", error);
        toast.error("Erreur lors de l'affichage de l'image");
      }
    }
  };

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="flex-1"
        />
        <Button disabled={uploading}>
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Upload en cours..." : "Upload"}
        </Button>
      </div>

      <div className="grid gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-secondary/50 cursor-pointer"
            onClick={() => handleFileClick(file)}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{file.filename}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteFile(file.id, file.file_path);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Aperçu de l'image</DialogTitle>
            <DialogDescription>
              Cliquez en dehors de la fenêtre pour fermer
            </DialogDescription>
          </DialogHeader>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Aperçu" 
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                console.error("Error loading image:", previewImage);
                toast.error("Erreur lors du chargement de l'image");
                setPreviewImage(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};