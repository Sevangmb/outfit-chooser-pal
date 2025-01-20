import { Camera, Link, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { toast } from "sonner";
import { useCallback, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  onUrlUpload,
}: ImageUploadTabsProps) => {
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageLoad = useCallback(() => {
    console.log("Image loaded successfully");
    setImageLoadError(false);
  }, []);

  const handleImageError = useCallback(() => {
    console.log("Error loading image");
    setImageLoadError(true);
    toast.error("Erreur lors du chargement de l'image");
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("File selected:", file.name);
      setSelectedFile(file);
      const imageUrl = await onFileUpload(file);
      if (imageUrl) {
        console.log("Setting image URL in form:", imageUrl);
        form.setValue("image", imageUrl, { shouldValidate: true });
      }
    }
  };

  const handleUrlSubmit = async () => {
    const url = form.getValues("imageUrl");
    if (!url) {
      toast.error("Veuillez entrer une URL");
      return;
    }

    try {
      setIsVerifying(true);
      await onUrlUpload(url);
    } catch (error) {
      console.error("Error with URL:", error);
      toast.error("URL invalide ou image inaccessible");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <FormItem>
      <FormLabel>Image</FormLabel>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Galerie
          </TabsTrigger>
          <TabsTrigger value="camera">
            <Camera className="h-4 w-4 mr-2" />
            Photo
          </TabsTrigger>
          <TabsTrigger value="url">
            <Link className="h-4 w-4 mr-2" />
            URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </FormControl>
          {selectedFile && (
            <div className="mt-2 text-sm text-muted-foreground">
              Fichier sélectionné: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
            </div>
          )}
        </TabsContent>

        <TabsContent value="camera">
          <Button
            type="button"
            onClick={onCameraCapture}
            className="w-full"
            disabled={isUploading}
          >
            <Camera className="h-4 w-4 mr-2" />
            Prendre une photo
          </Button>
        </TabsContent>

        <TabsContent value="url">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              onChange={(e) => form.setValue("imageUrl", e.target.value)}
              disabled={isUploading || isVerifying}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              disabled={isUploading || isVerifying}
            >
              {isVerifying ? "Vérification..." : "Importer"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {uploadError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {previewUrl && (
        <div className="mt-4 relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
          <img
            src={previewUrl}
            alt="Aperçu"
            className={`object-cover w-full h-full ${imageLoadError ? 'opacity-50' : ''}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {imageLoadError && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50">
              <p className="text-destructive">Erreur lors du chargement de l'image</p>
            </div>
          )}
        </div>
      )}
      <FormMessage />
    </FormItem>
  );
};