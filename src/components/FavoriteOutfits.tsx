import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star } from "lucide-react";
import { User } from "@supabase/supabase-js";

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
        clothes: outfit.clothes.map((item: any) => item.clothes)
      }));
    },
  });

  const { data: friendsFavorites = [] } = useQuery<Outfit[]>({
    queryKey: ["friends-favorite-outfits"],
    queryFn: async () => {
      console.log("Fetching friends' favorite outfits...");
      // D'abord, récupérer les IDs des amis
      const { data: friendships, error: friendshipsError } = await supabase
        .from("friendships")
        .select("*")
        .eq("status", "accepted");

      if (friendshipsError) throw friendshipsError;

      const currentUserId = (await supabase.auth.getSession()).data.session?.user.id;
      const friendIds = friendships
        .map(f => f.user_id === currentUserId ? f.friend_id : f.user_id)
        .filter(id => id !== currentUserId);

      if (friendIds.length === 0) return [];

      // Ensuite, récupérer les tenues favorites des amis
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

      // Récupérer les emails des amis
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) throw usersError;

      const outfitsWithUserEmails = outfits.map((outfit: any) => ({
        ...outfit,
        clothes: outfit.clothes.map((item: any) => item.clothes),
        user_email: (users as User[]).find(u => u.id === outfit.user_id)?.email || "Utilisateur inconnu"
      }));

      console.log("Fetched friends' favorite outfits:", outfitsWithUserEmails);
      return outfitsWithUserEmails;
    },
  });

  const OutfitCard = ({ outfit }: { outfit: Outfit }) => (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex flex-col">
          <h3 className="font-semibold">{outfit.name}</h3>
          {outfit.user_email && (
            <p className="text-sm text-muted-foreground">Par {outfit.user_email}</p>
          )}
        </div>
        <Star className="h-4 w-4 fill-primary text-primary" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {outfit.clothes.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              <span>{item.name}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{item.color}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="my-favorites" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="my-favorites">Mes Favoris</TabsTrigger>
        <TabsTrigger value="friends-favorites">Favoris des Amis</TabsTrigger>
      </TabsList>
      <TabsContent value="my-favorites">
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {myFavorites.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Vous n'avez pas encore de tenues favorites
              </p>
            ) : (
              myFavorites.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>
      <TabsContent value="friends-favorites">
        <ScrollArea className="h-[600px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {friendsFavorites.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Vos amis n'ont pas encore de tenues favorites
              </p>
            ) : (
              friendsFavorites.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};