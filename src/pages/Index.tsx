import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendsList } from "@/components/FriendsList";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { ClothingTab } from "@/components/ClothingTab";
import { OutfitCreator } from "@/components/OutfitCreator";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
  user_id: string;
}

const fetchClothes = async (): Promise<Clothing[]> => {
  console.log("Fetching clothes...");
  const { data, error } = await supabase.from("clothes").select("*");

  if (error) {
    console.error("Error fetching clothes:", error);
    throw error;
  }

  console.log("Fetched clothes:", data);
  return data || [];
};

const Index = () => {
  const navigate = useNavigate();
  const {
    data: clothes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["clothes"],
    queryFn: fetchClothes,
  });

  useEffect(() => {
    if (error) {
      console.error("Error in clothes query:", error);
      toast.error("Erreur lors du chargement des vêtements");
    }
  }, [error]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion");
    } else {
      navigate("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-primary animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <Header onLogout={handleLogout} className="container py-8 mt-16" />

      <div className="container py-8 px-4 mx-auto">
        <Tabs defaultValue="outfits">
          <TabsList className="mb-8">
            <TabsTrigger value="outfits">Créer un ensemble</TabsTrigger>
            <TabsTrigger value="clothes">Mes Vêtements</TabsTrigger>
            <TabsTrigger value="friends">Mes Amis</TabsTrigger>
          </TabsList>

          <TabsContent value="outfits">
            <OutfitCreator clothes={clothes} />
          </TabsContent>

          <TabsContent value="clothes">
            <ClothingTab clothes={clothes} />
          </TabsContent>

          <TabsContent value="friends">
            <FriendsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;