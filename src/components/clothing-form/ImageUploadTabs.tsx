import { Camera, Upload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { toast } from "sonner";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ImageUploadTabsProps {
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  uploadError: string | null;
  uploadProgress: number;
  onFileUpload: (file: File) => Promise<string | null>;
  onCameraCapture: () => Promise<void>;
  onUrlUpload: (url: string) => Promise<void>;
  onResetPreview: () => void;
}

export const ImageUploadTabs = ({
  form,
  isUploading,
  previewUrl,
  uploadError,
  uploadProgress,
  onFileUpload,
  onCameraCapture,
  onUrlUpload,
  onResetPreview,
}: ImageUploadTabsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileInputValue, setFileInputValue] = useState<string>("");
  const [userFiles, setUserFiles] = useState<any[]>([]);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const loadUserFiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: files, error } = await supabase
      .from('user_files')
      .select('*')
      .eq('user_id', user.id)
      .eq('content_type', 'like', 'image/%');

    if (error) {
      console.error("Error loading user files:", error);
      toast.error("Erreur lors du chargement des fichiers");
      return;
    }

    setUserFiles(files || []);
  };

  const handleFileSelect = async (file: any) => {
    try {
      const { data } = supabase.storage
        .from('user_files')
        .getPublicUrl(file.file_path);

      if (data?.publicUrl) {
        await onUrlUpload(data.publicUrl);
        setIsFileDialogOpen(false);
        toast.success("Image sélectionnée avec succès");
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      toast.error("Erreur lors de la sélection du fichier");
    }
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl) {
      toast.error("Veuillez entrer une URL");
      return;
    }

    try {
      const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i;
      if (!urlPattern.test(imageUrl)) {
        toast.error("L'URL doit pointer vers une image valide (JPG, PNG, WEBP ou GIF)");
        return;
      }

      console.log("Importation de l'image depuis l'URL:", imageUrl);
      form.setValue("image", imageUrl, { shouldValidate: true });
      await onUrlUpload(imageUrl);
      toast.success("Image importée avec succès");
    } catch (error) {
      console.error("Erreur d'import URL:", error);
      toast.error("Erreur lors de l'import de l'image");
      form.setValue("image", null);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) return;
    try {
      await onFileUpload(selectedFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Erreur lors de l'envoi du fichier");
    }
  };

  return (
    <FormItem>
      <FormLabel>Image</FormLabel>
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              value={fileInputValue}
              placeholder="Sélectionnez un fichier..."
              readOnly
              className="flex-1"
            />
            <div className="relative">
              <Input
                type="file"
                id="clothing-image"
                name="clothing-image"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                    setFileInputValue(file.name);
                  }
                }}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button type="button" variant="outline">
                Parcourir
              </Button>
            </div>
            <Button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading || !selectedFile}
            >
              <Upload className="h-4 w-4 mr-2" />
              Envoyer
            </Button>
          </div>
          <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  loadUserFiles();
                }}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Mes fichiers
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sélectionner une image</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {userFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileSelect(file)}
                    className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-accent"
                  >
                    <img
                      src={supabase.storage.from('user_files').getPublicUrl(file.file_path).data.publicUrl}
                      alt={file.filename}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{file.filename}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            onClick={onCameraCapture}
            disabled={isUploading}
            variant="outline"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        {isUploading && (
          <div className="space-y-2">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground text-center">
              Upload en cours... {uploadProgress}%
            </p>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="URL de l'image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={isUploading || !imageUrl}
              variant="outline"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {previewUrl && (
          <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
            <img
              src={previewUrl}
              alt="Aperçu"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Erreur de chargement de l'image:", previewUrl);
                e.currentTarget.style.display = 'none';
                toast.error("Erreur lors du chargement de l'image");
              }}
            />
          </div>
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
};