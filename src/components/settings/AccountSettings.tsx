import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Save, Upload } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCameraCapture } from "@/components/clothing-form/hooks/useCameraCapture";

interface ProfileStats {
  clothes_count: number;
  outfits_count: number;
  followers_count: number;
  following_count: number;
  likes_received: number;
}

export const AccountSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { handleCameraCapture } = useCameraCapture((imageData) => {
    setAvatarPreview(imageData);
    // Convert base64 to File object
    fetch(imageData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "camera-capture.png", { type: "image/png" });
        setAvatar(file);
      });
  });

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

  const { data: stats } = useQuery({
    queryKey: ["profileStats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Get the user's outfit IDs first
      const { data: outfits } = await supabase
        .from("outfits")
        .select("id")
        .eq("user_id", user.id);
      
      const outfitIds = outfits?.map(outfit => outfit.id) || [];

      const [clothes, outfitsCount, followers, following, likes] = await Promise.all([
        supabase.from("clothes").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("outfits").select("id", { count: "exact" }).eq("user_id", user.id),
        supabase.from("followers").select("id", { count: "exact" }).eq("following_id", user.id),
        supabase.from("followers").select("id", { count: "exact" }).eq("follower_id", user.id),
        outfitIds.length > 0 
          ? supabase.from("outfit_votes").select("id", { count: "exact" }).in("outfit_id", outfitIds)
          : Promise.resolve({ count: 0 })
      ]);

      return {
        clothes_count: clothes.count || 0,
        outfits_count: outfitsCount.count || 0,
        followers_count: followers.count || 0,
        following_count: following.count || 0,
        likes_received: likes.count || 0
      };
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      let avatarUrl = profile?.avatar_url;

      if (avatar) {
        const fileExt = avatar.name.split('.').pop();
        const fileName = `${user.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatar, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        avatarUrl = publicUrl;
      }

      const updates = {
        username: formData.get("username")?.toString(),
        bio: formData.get("bio")?.toString(),
        avatar_url: avatarUrl,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    }
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
      await updateProfileMutation.mutateAsync(formData);
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
          <div className="flex gap-2">
            <Label
              htmlFor="avatar"
              className="cursor-pointer flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80"
            >
              <Upload className="w-4 h-4" />
              Importer
            </Label>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCameraCapture}
            >
              <Camera className="w-4 h-4 mr-2" />
              Photo
            </Button>
          </div>
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
          placeholder="Parlez-nous de votre style, vos marques préférées..."
          rows={4}
        />
      </div>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Statistiques du profil</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats?.clothes_count || 0}</div>
            <div className="text-sm text-muted-foreground">Vêtements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats?.outfits_count || 0}</div>
            <div className="text-sm text-muted-foreground">Tenues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats?.followers_count || 0}</div>
            <div className="text-sm text-muted-foreground">Abonnés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats?.following_count || 0}</div>
            <div className="text-sm text-muted-foreground">Abonnements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats?.likes_received || 0}</div>
            <div className="text-sm text-muted-foreground">J'aime reçus</div>
          </div>
        </div>
      </Card>

      <Separator />

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