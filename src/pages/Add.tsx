import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClothingTab } from "@/components/ClothingTab";
import { OutfitCreator } from "@/components/OutfitCreator";
import { FavoriteOutfits } from "@/components/FavoriteOutfits";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Image, Plus, Shirt, Suitcase } from "lucide-react";
import { SuitcaseDialog } from "@/components/suitcase/SuitcaseDialog";
import { AddClothingDialog } from "@/components/AddClothingDialog";

const Add = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <div className="container mx-auto p-4 space-y-8 mt-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mon Espace Personnel</h1>
          <div className="flex gap-2">
            <AddClothingDialog />
            <Button onClick={() => navigate("/outfit/create")} className="gap-2">
              <Shirt className="h-4 w-4" />
              Créer une tenue
            </Button>
            <Button onClick={() => navigate("/outfit/publish")} variant="secondary" className="gap-2">
              <Image className="h-4 w-4" />
              Publier un look
            </Button>
          </div>
        </div>

        <Tabs defaultValue="wardrobe" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 gap-4">
            <TabsTrigger value="wardrobe">
              <Shirt className="h-4 w-4 mr-2" />
              Ma Garde-Robe
            </TabsTrigger>
            <TabsTrigger value="outfits">
              <Image className="h-4 w-4 mr-2" />
              Mes Tenues
            </TabsTrigger>
            <TabsTrigger value="looks">
              <Image className="h-4 w-4 mr-2" />
              Mes Looks
            </TabsTrigger>
            <TabsTrigger value="suitcases">
              <Suitcase className="h-4 w-4 mr-2" />
              Mes Valises
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Mes Favoris
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wardrobe">
            <ClothingTab showFriendsClothes={false} />
          </TabsContent>

          <TabsContent value="outfits">
            <OutfitCreator clothes={[]} />
          </TabsContent>

          <TabsContent value="looks">
            <div className="text-center text-muted-foreground py-8">
              Vous n'avez pas encore publié de looks
            </div>
          </TabsContent>

          <TabsContent value="suitcases">
            <div className="flex justify-end mb-4">
              <SuitcaseDialog />
            </div>
            <div className="text-center text-muted-foreground py-8">
              Vous n'avez pas encore créé de valise
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            <Tabs defaultValue="clothes" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="clothes">Articles</TabsTrigger>
                <TabsTrigger value="outfits">Tenues</TabsTrigger>
                <TabsTrigger value="users">Utilisateurs</TabsTrigger>
                <TabsTrigger value="shops">Boutiques</TabsTrigger>
              </TabsList>
              <TabsContent value="clothes">
                <div className="text-center text-muted-foreground py-8">
                  Vous n'avez pas encore d'articles favoris
                </div>
              </TabsContent>
              <TabsContent value="outfits">
                <FavoriteOutfits />
              </TabsContent>
              <TabsContent value="users">
                <div className="text-center text-muted-foreground py-8">
                  Vous n'avez pas encore d'utilisateurs favoris
                </div>
              </TabsContent>
              <TabsContent value="shops">
                <div className="text-center text-muted-foreground py-8">
                  Vous n'avez pas encore de boutiques favorites
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Add;