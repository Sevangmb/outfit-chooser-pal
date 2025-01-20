import { Header } from "@/components/Header";
import { OutfitFeed } from "@/components/feed/OutfitFeed";
import { BottomNav } from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <Header className="container py-8" />
      <div className="container py-8 px-4 mx-auto">
        <OutfitFeed />
      </div>
      <BottomNav />
    </div>
  );
};

export default Index;