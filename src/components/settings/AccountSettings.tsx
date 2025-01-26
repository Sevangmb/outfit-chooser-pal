import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AccountSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const updates = {
        username: formData.get("username"),
        bio: formData.get("bio"),
        shipping_address: formData.get("shipping_address"),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile?.id);

      if (error) throw error;

      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${profile?.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatar, { upsert: true });

        if (uploadError) throw uploadError;
      }

      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Photo de profil</Label>
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={avatarPreview || profile?.avatar_url} />
            <AvatarFallback>
              {profile?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <Label
            htmlFor="avatar"
            className="cursor-pointer flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
          >
            <Camera className="w-4 h-4" />
            Changer la photo
          </Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Nom d'utilisateur</Label>
        <Input
          id="username"
          name="username"
          defaultValue={profile?.username}
          placeholder="Votre nom d'utilisateur"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Biographie</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile?.bio}
          placeholder="Parlez-nous de vous"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="shipping_address">Adresse de livraison</Label>
        <Textarea
          id="shipping_address"
          name="shipping_address"
          defaultValue={profile?.shipping_address}
          placeholder="Votre adresse de livraison"
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          "Enregistrement..."
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer les modifications
          </>
        )}
      </Button>
    </form>
  );
};