import { AddClothingForm } from "@/components/AddClothingForm";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const Add = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-4 mx-auto mt-16">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6">Ajouter un vêtement</h1>
          
          <div className="bg-card rounded-lg shadow-sm p-6">
            <AddClothingForm onSuccess={() => {
              navigate("/closet");
            }} />
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Ou explorez les tenues de la communauté
            </p>
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

export default Add;