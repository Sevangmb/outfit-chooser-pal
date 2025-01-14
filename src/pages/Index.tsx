import { useEffect, useState } from "react";
import { ClothingCard } from "@/components/ClothingCard";
import { AddClothingButton } from "@/components/AddClothingButton";
import { toast } from "sonner";

interface Clothing {
  id: number;
  name: string;
  category: string;
  color: string;
  image?: string;
}

// Données de test initiales
const initialClothes = [
  {
    id: 1,
    name: "T-shirt blanc",
    category: "Haut",
    color: "Blanc",
    image: "/placeholder.svg"
  },
  {
    id: 2,
    name: "Jean slim",
    category: "Bas",
    color: "Bleu",
    image: "/placeholder.svg"
  },
  {
    id: 3,
    name: "Sneakers",
    category: "Chaussures",
    color: "Noir",
    image: "/placeholder.svg"
  }
];

const Index = () => {
  const [clothes, setClothes] = useState<Clothing[]>([]);

  // Charger les vêtements depuis localStorage au démarrage
  useEffect(() => {
    const savedClothes = localStorage.getItem('clothes');
    if (savedClothes) {
      setClothes(JSON.parse(savedClothes));
      console.log("Vêtements chargés depuis localStorage:", JSON.parse(savedClothes));
    } else {
      setClothes(initialClothes);
      localStorage.setItem('clothes', JSON.stringify(initialClothes));
      console.log("Données initiales sauvegardées dans localStorage");
    }
  }, []);

  // Sauvegarder les vêtements dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem('clothes', JSON.stringify(clothes));
    console.log("Vêtements sauvegardés dans localStorage:", clothes);
  }, [clothes]);

  const handleAddClothing = () => {
    console.log("Ouvrir le formulaire d'ajout");
    toast("Cette fonctionnalité sera bientôt disponible !");
  };

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