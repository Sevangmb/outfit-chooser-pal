import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useDropboxUpload } from "@/hooks/useDropboxUpload";
import { toast } from "sonner";

interface FileUploaderProps {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  onFileSelect?: (file: File) => void;
  accept?: string;
}

export const FileUploader = ({ 
  onUploadSuccess, 
  onUploadError,
  onFileSelect,
  accept = "*"
}: FileUploaderProps) => {
  const { isUploading, uploadFile } = useDropboxUpload();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      console.log("Starting file upload:", file.name);
      if (onFileSelect) {
        onFileSelect(file);
      }
      
      const url = await uploadFile(file);
      if (url && onUploadSuccess) {
        console.log("Upload successful:", url);
        onUploadSuccess(url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur lors du téléchargement";
      onUploadError?.(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        accept={accept}
        className="flex-1"
      />
      <Button disabled={isUploading}>
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? "Téléchargement..." : "Télécharger"}
      </Button>
    </div>
  );
};