import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { toast } from "sonner";
import { useCallback, useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ImagePreview } from "./ImagePreview";

interface ImageUploadTabsProps {
  form: UseFormReturn<FormValues>;
  isUploading: boolean;
  previewUrl: string | null;
  uploadError: string | null;
  onFileUpload: (file: File) => Promise<string | null>;
  onCameraCapture: () => Promise<void>;
  onUrlUpload: (url: string) => Promise<void>;
}

export const ImageUploadTabs = ({
  form,
  isUploading,
  previewUrl,
  uploadError,
  onFileUpload,
  onCameraCapture,
}: ImageUploadTabsProps) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    const imageValue = form.getValues("image");
    if (imageValue) {
      setDisplayUrl(imageValue);
      setImageLoadError(false);
    }
  }, [form]);

  const handleImageLoad = useCallback(() => {
    console.log("Image chargée avec succès");
    setImageLoadError(false);
  }, []);

  const handleImageError = useCallback(() => {
    console.log("Erreur lors du chargement de l'image");
    setImageLoadError(true);
    toast.error("Erreur lors du chargement de l'image");
    // Reset the form image value when there's an error
    form.setValue("image", null);
    setDisplayUrl(null);
  }, [form]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Le fichier doit être une image");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop volumineuse (max 5MB)");
        return;
      }

      console.log("Fichier sélectionné:", file.name);
      setSelectedFile(file);
      setImageLoadError(false);
      
      const imageUrl = await onFileUpload(file);
      console.log("Image URL received:", imageUrl);
      
      if (imageUrl) {
        console.log("Setting image URL in form:", imageUrl);
        form.setValue("image", imageUrl, { shouldValidate: true });
        setDisplayUrl(imageUrl);
        toast.success("Image téléchargée avec succès");
      } else {
        throw new Error("URL de l'image non reçue");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement de l'image");
      setSelectedFile(null);
      form.setValue("image", null);
      setDisplayUrl(null);
    }
  };

  return (
    <FormItem>
      <FormLabel>Image</FormLabel>
      <div className="space-y-4">
        <div className="flex gap-2">
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="flex-1"
            />
          </FormControl>
          <Button
            type="button"
            onClick={onCameraCapture}
            disabled={isUploading}
            variant="outline"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        {selectedFile && (
          <div className="text-sm text-muted-foreground">
            Fichier sélectionné: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
          </div>
        )}

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {displayUrl && !imageLoadError && (
          <ImagePreview
            form={form}
            previewUrl={displayUrl}
            isUploading={isUploading}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
      </div>
      <FormMessage />
    </FormItem>
  );
};