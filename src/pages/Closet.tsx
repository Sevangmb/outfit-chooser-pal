import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Shirt, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Closet = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navigation />
      <div className="container py-8 px-4 mx-auto mt-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="rounded-full bg-accent/10 p-6">
            <Shirt className="h-12 w-12 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Votre garde-robe est vide</h1>
          <p className="text-muted-foreground max-w-md">
            Ajoutez vos vêtements préférés à votre garde-robe pour commencer à créer des tenues uniques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate("/add")}
              variant="default"
              className="gap-2"
            >
              <Shirt className="h-4 w-4" />
              Ajouter des vêtements
            </Button>
            <Button 
              onClick={() => navigate("/discover")}
              variant="outline"
              className="gap-2"
            >
              <Search className="h-4 w-4" />
              Explorer les tenues
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Closet;