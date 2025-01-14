import { useEffect, useState } from "react";
import { ClothingCard } from "@/components/ClothingCard";
import { AddClothingButton } from "@/components/AddClothingButton";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  const handleAddClothing = () => {
    console.log("Ouvrir le formulaire d'ajout");
    toast("Cette fonctionnalité sera bientôt disponible !");
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="container py-8 px-4 mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold">Ma Garde-robe</h1>
        <AddClothingButton onClick={handleAddClothing} />
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