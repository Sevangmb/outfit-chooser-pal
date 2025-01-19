import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200">
      <div className="w-full md:w-1/2 p-8 flex flex-col items-center md:items-start space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-primary">
          Ma Garde-robe
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-md text-center md:text-left">
          Créez votre garde-robe virtuelle, composez des tenues uniques et partagez votre style avec vos amis. Une nouvelle façon de gérer et d'explorer votre style personnel.
        </p>
        <Button 
          onClick={() => navigate("/auth")}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
        >
          Commencer l'aventure
        </Button>
      </div>
      
      <div className="w-full md:w-1/2 p-8">
        <img
          src="/lovable-uploads/214daa53-7c97-4a36-8f7f-2e67ae8b1d97.png"
          alt="Fashion inspiration"
          className="rounded-lg shadow-2xl max-w-md mx-auto transform hover:scale-105 transition-transform duration-300"
        />
      </div>
    </div>
  );
};

export default LandingPage;