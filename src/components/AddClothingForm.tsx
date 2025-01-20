import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ClothingFormFields } from "./clothing-form/ClothingFormFields";
import { ImageUploadTabs } from "./clothing-form/ImageUploadTabs";
import { useImageUpload } from "./clothing-form/useImageUpload";

export const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  category: z.string().min(2, "La catégorie doit contenir au moins 2 caractères"),
  color: z.string().min(2, "La couleur doit contenir au moins 2 caractères"),
  image: z.string().nullable().optional(),
  imageUrl: z.string().url().optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const queryClient = useQueryClient();
  const { isUploading, previewUrl, handleImageUpload, resetPreview } = useImageUpload();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      color: "",
      image: null,
      imageUrl: "",
    },
  });

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

  const onSubmit = async (values: FormValues) => {
    try {
      console.log("Submitting form with values:", values);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté pour ajouter un vêtement");
        return;
      }

      const { error } = await supabase.from("clothes").insert({
        name: values.name,
        category: values.category,
        color: values.color,
        image: values.image,
        user_id: user.id,
      });

      if (error) throw error;

      console.log("Successfully added clothing item");
      toast.success("Vêtement ajouté avec succès");
      queryClient.invalidateQueries({ queryKey: ["clothes"] });
      form.reset();
      resetPreview();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding clothing:", error);
      toast.error("Erreur lors de l'ajout du vêtement");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ClothingFormFields form={form} />
        
        <ImageUploadTabs
          form={form}
          isUploading={isUploading}
          previewUrl={previewUrl}
          onFileUpload={handleImageUpload}
          onCameraCapture={handleCameraCapture}
          onUrlUpload={handleUrlImage}
        />

        <Button type="submit" className="w-full" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Téléchargement...
            </>
          ) : (
            "Ajouter"
          )}
        </Button>
      </form>
    </Form>
  );
};