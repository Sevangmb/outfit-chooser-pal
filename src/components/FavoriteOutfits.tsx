import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@supabase/supabase-js";
import { FavoritesList } from "./favorites/FavoritesList";

interface Outfit {
  id: number;
  name: string;
  description: string | null;
  is_favorite: boolean;
  user_id: string;
  user_email?: string;
  clothes: {
    id: number;
    name: string;
    category: string;
    color: string;
    image: string | null;
  }[];
}

export const FavoriteOutfits = () => {
  const { data: myFavorites = [] } = useQuery<Outfit[]>({
    queryKey: ["my-favorite-outfits"],
    queryFn: async () => {
      console.log("Fetching my favorite outfits...");
      const { data: outfits, error } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .eq("is_favorite", true)
        .eq("user_id", (await supabase.auth.getSession()).data.session?.user.id);

      if (error) {
        console.error("Error fetching my favorite outfits:", error);
        throw error;
      }

      console.log("Fetched my favorite outfits:", outfits);
      return outfits.map((outfit: any) => ({
        ...outfit,
        clothes: outfit.clothes.map((item: any) => item.clothes),
      }));
    },
  });

  const { data: friendsFavorites = [] } = useQuery<Outfit[]>({
    queryKey: ["friends-favorite-outfits"],
    queryFn: async () => {
      console.log("Fetching friends' favorite outfits...");
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted");

      if (friendshipsError) throw friendshipsError;

      const currentUserId = (await supabase.auth.getSession()).data.session?.user.id;
      const friendIds = friendships
        .map((f) => (f.user_id === currentUserId ? f.friend_id : f.user_id))
        .filter((id) => id !== currentUserId);

      if (friendIds.length === 0) return [];

      const { data: outfits, error: outfitsError } = await supabase
        .from("outfits")
        .select(`
          *,
          clothes:outfit_clothes(
            clothes(id, name, category, color, image)
          )
        `)
        .eq("is_favorite", true)
        .in("user_id", friendIds);

      if (outfitsError) {
        console.error("Error fetching friends' favorite outfits:", outfitsError);
        throw outfitsError;
      }

      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      const userArray = Array.isArray(users) ? users : [];

      const outfitsWithUserEmails = outfits.map((outfit: any) => ({
        ...outfit,
        clothes: outfit.clothes.map((item: any) => item.clothes),
        user_email: userArray.find((u) => u.id === outfit.user_id)?.email || "Utilisateur inconnu",
      }));

      console.log("Fetched friends' favorite outfits:", outfitsWithUserEmails);
      return outfitsWithUserEmails;
    },
  });

  return (
    <Tabs defaultValue="my-favorites" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="my-favorites">Mes Favoris</TabsTrigger>
        <TabsTrigger value="friends-favorites">Favoris des Amis</TabsTrigger>
      </TabsList>
      <TabsContent value="my-favorites">
        <FavoritesList
          outfits={myFavorites}
          emptyMessage="Vous n'avez pas encore de tenues favorites"
        />
      </TabsContent>
      <TabsContent value="friends-favorites">
        <FavoritesList
          outfits={friendsFavorites}
          emptyMessage="Vos amis n'ont pas encore de tenues favorites"
        />
      </TabsContent>
    </Tabs>
  );
};