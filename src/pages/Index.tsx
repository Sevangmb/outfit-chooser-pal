import { useEffect } from "react";
import { ClothingCard } from "@/components/ClothingCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { AddClothingDialog } from "@/components/AddClothingDialog";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <div className="text-primary animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-secondary p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-primary">Ma Garde-robe</h1>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background/95 backdrop-blur-lg">
              <SheetHeader>
                <SheetTitle className="text-primary">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-8">
                <AddClothingDialog />
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full border-primary/20 hover:bg-primary/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-primary">Ma Garde-robe</h1>
          <div className="flex gap-4">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un vêtement
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="border-primary/20 hover:bg-primary/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8 px-4 mx-auto mt-16 md:mt-0">
        {clothes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Aucun vêtement dans votre garde-robe</p>
            <AddClothingDialog />
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Index;