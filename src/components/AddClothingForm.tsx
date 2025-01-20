import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Camera, Upload, Link } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  category: z.string().min(2, "La catégorie doit contenir au moins 2 caractères"),
  color: z.string().min(2, "La couleur doit contenir au moins 2 caractères"),
  image: z.string().nullable().optional(),
  imageUrl: z.string().url().optional(),
});

type FormValues = {
  name: string;
  category: string;
  color: string;
  image: string | null;
  imageUrl?: string;
};

interface AddClothingFormProps {
  onSuccess?: () => void;
}

export const AddClothingForm = ({ onSuccess }: AddClothingFormProps) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading file:", filePath);
      const { error: uploadError, data } = await supabase.storage
        .from('clothes')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      console.log("File uploaded successfully:", data);
      const { data: { publicUrl } } = supabase.storage
        .from('clothes')
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erreur lors du téléchargement de l'image");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

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
      setIsUploading(true);
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
    } finally {
      setIsUploading(false);
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
      setPreviewUrl(null);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding clothing:", error);
      toast.error("Erreur lors de l'ajout du vêtement");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="T-shirt blanc" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <FormControl>
                <Input placeholder="Haut" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Couleur</FormLabel>
              <FormControl>
                <Input placeholder="Blanc" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field: { onChange, value } }) => (
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
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const imageUrl = await handleImageUpload(file);
                          if (imageUrl) {
                            onChange(imageUrl);
                          }
                        }
                      }}
                    />
                  </FormControl>
                </TabsContent>

                <TabsContent value="camera">
                  <Button
                    type="button"
                    onClick={handleCameraCapture}
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
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const url = form.getValues("imageUrl");
                        if (url) handleUrlImage(url);
                      }}
                      disabled={isUploading}
                    >
                      Importer
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="Aperçu"
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
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