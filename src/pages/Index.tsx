import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Navigation } from "@/components/Navigation";
import { OutfitFeed } from "@/components/feed/OutfitFeed";
import { BottomNav } from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <Navigation />
      <Header className="container py-8 mt-16" />

      <div className="container py-8 px-4 mx-auto">
        <OutfitFeed />
      </div>
      
      <BottomNav />
    </div>
  );
};

export default Index;