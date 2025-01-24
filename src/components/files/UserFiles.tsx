import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Trash2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const UserFiles = () => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      console.log("Starting file upload:", file.name);

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
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
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

  // Fetch files on component mount
  useState(() => {
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
            className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-secondary/50"
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
              onClick={() => deleteFile(file.id, file.file_path)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
});