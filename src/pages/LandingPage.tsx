import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <main 
      className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-gradient-to-br from-background to-secondary/20"
      role="main"
      aria-label="Page d'accueil"
    >
      <div className="w-full md:w-1/2 p-8 flex flex-col items-center md:items-start space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 
            className="text-4xl md:text-6xl font-bold text-primary tracking-tight"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            Ma Garde-robe
          </h1>
        </motion.div>

        <motion.p 
          className="text-lg md:text-xl text-foreground/90 max-w-md text-center md:text-left leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Créez votre garde-robe virtuelle, composez des tenues uniques et partagez votre style avec vos amis. Une nouvelle façon de gérer et d'explorer votre style personnel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 focus:ring-2 focus:ring-primary/50 focus:outline-none"
            aria-label="Commencer l'aventure et créer votre compte"
          >
            Commencer l'aventure
          </Button>
        </motion.div>
      </div>
      
      <motion.div 
        className="w-full md:w-1/2 p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <img
          src="/lovable-uploads/214daa53-7c97-4a36-8f7f-2e67ae8b1d97.png"
          alt="Illustration d'une garde-robe virtuelle montrant différentes tenues et styles vestimentaires"
          className="rounded-lg shadow-2xl max-w-md mx-auto transform hover:scale-105 transition-transform duration-300"
          loading="eager"
          width="600"
          height="400"
        />
      </motion.div>
    </main>
  );
};

export default LandingPage;