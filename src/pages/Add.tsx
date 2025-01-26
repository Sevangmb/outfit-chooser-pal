import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddClothingForm } from "@/components/AddClothingForm";
import { ClothingTab } from "@/components/ClothingTab";
import { OutfitCreator } from "@/components/OutfitCreator";
import { FavoriteOutfits } from "@/components/FavoriteOutfits";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Shirt, Suitcase } from "lucide-react";

const Add = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <div className="container mx-auto p-4 space-y-8 mt-16">
        <h1 className="text-2xl font-bold">Mon Espace Personnel</h1>

        <Tabs defaultValue="wardrobe" className="space-y-4">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TabsTrigger value="wardrobe">Ma Garde-Robe</TabsTrigger>
            <TabsTrigger value="outfits">Mes Tenues</TabsTrigger>
            <TabsTrigger value="suitcases">Mes Valises</TabsTrigger>
            <TabsTrigger value="favorites">Mes Favoris</TabsTrigger>
          </TabsList>

          <TabsContent value="wardrobe" className="space-y-4">
            <div className="flex justify-end gap-4">
              <Button onClick={() => navigate("/add")} className="gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un vêtement
              </Button>
              <Button onClick={() => navigate("/outfit/create")} className="gap-2">
                <Shirt className="h-4 w-4" />
                Créer une tenue
              </Button>
            </div>
            <ClothingTab />
          </TabsContent>

          <TabsContent value="outfits">
            <div className="flex justify-end gap-4 mb-4">
              <Button onClick={() => navigate("/outfit/create")} className="gap-2">
                <Shirt className="h-4 w-4" />
                Créer une tenue
              </Button>
              <Button onClick={() => navigate("/outfit/publish")} variant="secondary" className="gap-2">
                <Plus className="h-4 w-4" />
                Publier un look
              </Button>
            </div>
            <OutfitCreator clothes={[]} />
          </TabsContent>

          <TabsContent value="suitcases">
            <div className="flex justify-end mb-4">
              <Button onClick={() => navigate("/suitcase/create")} className="gap-2">
                <Suitcase className="h-4 w-4" />
                Créer une valise
              </Button>
            </div>
            {/* We'll implement the suitcase list component later */}
            <div className="text-center text-muted-foreground py-8">
              Vous n'avez pas encore créé de valise
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <FavoriteOutfits />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Add;