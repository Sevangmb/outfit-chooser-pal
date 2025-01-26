import { BottomNav } from "@/components/BottomNav";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  TrendingUp, 
  Store, 
  Hash,
  MapPin
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { ShopSection } from "@/components/shop/ShopSection";
import { PopularOutfits } from "@/components/discover/PopularOutfits";
import { PopularItems } from "@/components/discover/PopularItems";
import { TrendingHashtags } from "@/components/discover/TrendingHashtags";

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container py-8 px-4 mx-auto space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Search className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Explorer</h1>
          <div className="w-full max-w-2xl relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher des vêtements, tenues, boutiques..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="trends" className="w-full">
          <TabsList className="w-full justify-start mb-6 overflow-x-auto">
            <TabsTrigger value="trends" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendances
            </TabsTrigger>
            <TabsTrigger value="shops" className="gap-2">
              <Store className="h-4 w-4" />
              Boutiques
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <MapPin className="h-4 w-4" />
              Carte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-8">
            <div className="grid gap-8">
              <section>
                <h2 className="text-xl font-semibold mb-4">Tenues Populaires</h2>
                <PopularOutfits />
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Articles Populaires</h2>
                <PopularItems />
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Hashtags Tendances</h2>
                <TrendingHashtags />
              </section>
            </div>
          </TabsContent>

          <TabsContent value="shops">
            <ShopSection />
          </TabsContent>

          <TabsContent value="map">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Carte interactive des boutiques à venir</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Discover;