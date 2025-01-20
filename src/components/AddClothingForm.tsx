import { Form } from "@/components/ui/form";
import { useImageUpload } from "./clothing-form/useImageUpload";
import { useClothingForm } from "./clothing-form/hooks/useClothingForm";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FormValidationErrors } from "./clothing-form/FormValidationErrors";
import { ImageUploadTabs } from "./clothing-form/ImageUploadTabs";
import { ImageAnalysisButton } from "./clothing-form/ImageAnalysisButton";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import { BasicFields } from "./clothing-form/fields/BasicFields";
import { CategoryFields } from "./clothing-form/fields/CategoryFields";
import { ColorFields } from "./clothing-form/fields/ColorFields";
import { DetailsFields } from "./clothing-form/fields/DetailsFields";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const navigate = useNavigate();
  
  const { form, onSubmit, isValid, isSubmitting, errors } = useClothingForm(async (values) => {
    try {
      console.log("Form submitted with values:", values);
      
      if (!values.image) {
        toast.error("Une image est requise");
        return;
      }

      toast.success(`Le vêtement "${values.name}" a été ajouté à votre garde-robe`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate("/closet");
      onSuccess?.();
    } catch (error) {
      console.error("Error in form success callback:", error);
      toast.error("Une erreur est survenue lors de l'ajout du vêtement");
    }
  });
  
  const { isUploading, previewUrl, uploadError, handleImageUpload, resetPreview } = useImageUpload();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormValidationErrors errors={errors} />

        <div className="space-y-8">
          <ImageUploadTabs
            form={form}
            isUploading={isUploading}
            previewUrl={previewUrl}
            uploadError={uploadError}
            onFileUpload={handleImageUpload}
            onCameraCapture={async () => {
              try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                const video = document.createElement('video');
                video.srcObject = stream;
                await video.play();

                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                
                if (!context) {
                  throw new Error("Impossible de créer le contexte canvas");
                }
                
                context.drawImage(video, 0, 0);
                stream.getTracks().forEach(track => track.stop());

                const blob = await new Promise<Blob>((resolve) => 
                  canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8)
                );
                
                const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                const imageUrl = await handleImageUpload(file);
                
                if (imageUrl) {
                  form.setValue("image", imageUrl, { shouldValidate: true });
                  toast.success("Image capturée avec succès");
                }
              } catch (error) {
                console.error("Error capturing image:", error);
                toast.error("Erreur lors de la capture de l'image");
              }
            }}
            onUrlUpload={async (url) => {
              try {
                const response = await fetch(url);
                if (!response.ok) {
                  throw new Error(`Erreur HTTP: ${response.status}`);
                }
                
                const blob = await response.blob();
                if (!blob.type.startsWith('image/')) {
                  throw new Error("Le fichier n'est pas une image valide");
                }
                
                const file = new File([blob], "url-image.jpg", { type: blob.type });
                const imageUrl = await handleImageUpload(file);
                
                if (imageUrl) {
                  form.setValue("image", imageUrl, { shouldValidate: true });
                  form.setValue("imageUrl", "");
                  toast.success("Image téléchargée avec succès");
                }
              } catch (error) {
                console.error("Error downloading image from URL:", error);
                toast.error("Erreur lors du téléchargement de l'image depuis l'URL");
              }
            }}
          />

          {previewUrl && (
            <div className="space-y-4">
              <div className="aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              </div>
              <ImageAnalysisButton
                form={form}
                previewUrl={previewUrl}
                isUploading={isUploading}
              />
            </div>
          )}

          <div className="space-y-8 bg-background/50 backdrop-blur-sm rounded-lg border border-border p-6">
            <BasicFields form={form} />
            <CategoryFields form={form} />
            <ColorFields form={form} />
            <DetailsFields form={form} />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isUploading || isSubmitting || !isValid}
        >
          {(isUploading || isSubmitting) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isUploading ? "Téléchargement..." : isSubmitting ? "Ajout en cours..." : "Ajouter"}
        </Button>
      </form>
    </Form>
  );
};