import { Form } from "@/components/ui/form";
import { ClothingFormFields } from "./clothing-form/ClothingFormFields";
import { ImageUploadTabs } from "./clothing-form/ImageUploadTabs";
import { useImageUpload } from "./clothing-form/useImageUpload";
import { ImageAnalysisButton } from "./clothing-form/ImageAnalysisButton";
import { SubmitButton } from "./clothing-form/SubmitButton";
import { useClothingForm } from "./clothing-form/hooks/useClothingForm";
import { toast } from "sonner";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const navigate = useNavigate();
  
  const { form, onSubmit, isValid, isSubmitting, errors } = useClothingForm(async (values) => {
    try {
      console.log("Form submitted with values:", values);
      
      // Validate image URL
      if (!values.image || values.image.startsWith('blob:')) {
        toast.error("L'image n'a pas été téléchargée correctement");
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
  
  const { isUploading, previewUrl, handleImageUpload, resetPreview } = useImageUpload();

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

  const getRequiredFieldsErrors = () => {
    const requiredFields = {
      name: "le nom",
      category: "la catégorie",
      color: "la couleur",
      image: "l'image"
    };
    
    return Object.entries(errors)
      .filter(([key]) => key in requiredFields)
      .map(([key]) => requiredFields[key as keyof typeof requiredFields]);
  };

  const missingFields = getRequiredFieldsErrors();

  const handleCameraCapture = async () => {
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
  };

  const handleUrlImage = async (url: string) => {
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {missingFields.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Champs requis manquants : {missingFields.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        <ImageUploadTabs
          form={form}
          isUploading={isUploading}
          previewUrl={previewUrl}
          onFileUpload={handleImageUpload}
          onCameraCapture={handleCameraCapture}
          onUrlUpload={handleUrlImage}
        />

        <ImageAnalysisButton
          form={form}
          previewUrl={previewUrl}
          isUploading={isUploading}
        />

        <ClothingFormFields form={form} />

        <SubmitButton 
          isUploading={isUploading} 
          isSubmitting={isSubmitting}
          isValid={isValid}
        />
      </form>
    </Form>
  );
};