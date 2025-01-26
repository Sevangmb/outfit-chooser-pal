import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { useGoogleDriveUpload } from "@/hooks/useGoogleDriveUpload";
import { toast } from "sonner";

export const GoogleDriveUploader = () => {
  const { isUploading, uploadFile } = useGoogleDriveUpload();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      if (url) {
        console.log('File uploaded to Google Drive:', url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Erreur lors du téléchargement du fichier");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Input
        type="file"
        onChange={handleFileChange}
        disabled={isUploading}
        className="flex-1"
      />
      <Button disabled={isUploading}>
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? "Téléchargement..." : "Télécharger"}
      </Button>
    </div>
  );
};