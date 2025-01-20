import { Form } from "@/components/ui/form";
import { useImageUpload } from "./clothing-form/useImageUpload";
import { useClothingForm } from "./clothing-form/hooks/useClothingForm";
import { toast } from "sonner";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WizardNavigation } from "./clothing-form/WizardNavigation";
import { FormValidationErrors } from "./clothing-form/FormValidationErrors";
import { WizardStepContent } from "./clothing-form/WizardStepContent";
import { useWizardNavigation } from "./clothing-form/hooks/useWizardNavigation";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const navigate = useNavigate();
  
  const { form, onSubmit, isValid, isSubmitting, errors } = useClothingForm(async (values) => {
    try {
      console.log("Form submitted with values:", values);
      
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
  
  const { isUploading, previewUrl, uploadError, handleImageUpload, resetPreview } = useImageUpload();
  const { currentStep, totalSteps, handleNext, handlePrevious } = useWizardNavigation(form.getValues());

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Form validation errors:", errors);
    }
  }, [errors]);

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
        <FormValidationErrors errors={errors} />

        <div className="space-y-4">
          <WizardStepContent
            currentStep={currentStep}
            form={form}
            isUploading={isUploading}
            previewUrl={previewUrl}
            uploadError={uploadError}
            onImageUpload={handleImageUpload}
            onCameraCapture={handleCameraCapture}
            onUrlUpload={handleUrlImage}
          />
        </div>

        <WizardNavigation
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={currentStep === totalSteps - 1 ? form.handleSubmit(onSubmit) : handleNext}
          onPrevious={handlePrevious}
          isNextDisabled={currentStep === totalSteps - 1 ? isSubmitting || !isValid : false}
        />
      </form>
    </Form>
  );
};