import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FriendsList } from "@/components/FriendsList";
import { Header } from "@/components/Header";
import { MobileHeader } from "@/components/MobileHeader";
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

const Index = () => {
  const navigate = useNavigate();
  const { data: clothes = [], isLoading, error } = useQuery({
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
      <MobileHeader onLogout={handleLogout} />
      <Header onLogout={handleLogout} className="hidden md:block container py-8" />

      <div className="container py-8 px-4 mx-auto mt-16 md:mt-0">
        <Tabs defaultValue="outfits">
          <TabsList className="mb-8">
            <TabsTrigger value="outfits">Créer un ensemble</TabsTrigger>
            <TabsTrigger value="clothes">Mes Vêtements</TabsTrigger>
            <TabsTrigger value="friends">Mes Amis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="outfits">
            <OutfitCreator />
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