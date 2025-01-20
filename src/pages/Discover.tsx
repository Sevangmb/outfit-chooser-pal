import { Navigation } from "@/components/Navigation";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Compass, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Discover = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary/30 pb-16">
      <Navigation />
      <div className="container py-8 px-4 mx-auto mt-16">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
          <div className="rounded-full bg-primary/10 p-6">
            <Compass className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Découvrez de nouvelles tenues</h1>
          <p className="text-muted-foreground max-w-md">
            Explorez les dernières tendances et trouvez l'inspiration auprès d'autres passionnés de mode.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate("/profile")}
              variant="default"
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Trouver des amis
            </Button>
            <Button 
              onClick={() => navigate("/add")}
              variant="outline"
              className="gap-2"
            >
              Créer une tenue
            </Button>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Discover;