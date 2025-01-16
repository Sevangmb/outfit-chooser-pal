import { useEffect } from "react";
import { ClothingCard } from "@/components/ClothingCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AddClothingDialog } from "@/components/AddClothingDialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
}

const fetchClothes = async () => {
  console.log("Fetching clothes from Supabase...");
  const { data, error } = await supabase
    .from("clothes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching clothes:", error);
    throw error;
  }

  console.log("Fetched clothes:", data);
  return data;
};

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
    return <div>Chargement...</div>;
  }

  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Ma Garde-robe</h1>
        <div className="flex gap-4">
          <AddClothingDialog />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clothes.map((item) => (
          <ClothingCard
            key={item.id}
            image={item.image}
            name={item.name}
            category={item.category}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;