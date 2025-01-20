import { Form } from "@/components/ui/form";
import { ClothingFormFields } from "./clothing-form/ClothingFormFields";
import { ImageUploadTabs } from "./clothing-form/ImageUploadTabs";
import { useImageUpload } from "./clothing-form/useImageUpload";
import { ImageAnalysisButton } from "./clothing-form/ImageAnalysisButton";
import { SubmitButton } from "./clothing-form/SubmitButton";
import { useClothingForm } from "./clothing-form/hooks/useClothingForm";

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const { form, onSubmit } = useClothingForm(onSuccess);
  const { isUploading, previewUrl, handleImageUpload, resetPreview } = useImageUpload();

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg')
      );
      
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        form.setValue("image", imageUrl);
      }
    } catch (error) {
      console.error("Error capturing image:", error);
      toast.error("Erreur lors de la capture de l'image");
    }
  };

  const handleUrlImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], "url-image.jpg", { type: blob.type });
      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        form.setValue("image", imageUrl);
        form.setValue("imageUrl", "");
      }
    } catch (error) {
      console.error("Error downloading image from URL:", error);
      toast.error("Erreur lors du téléchargement de l'image depuis l'URL");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
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

        <SubmitButton isUploading={isUploading} />
      </form>
    </Form>
  );
};