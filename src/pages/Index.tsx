import { Header } from "@/components/Header";
import { MobileHeader } from "@/components/MobileHeader";
import { OutfitFeed } from "@/components/feed/OutfitFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { AIFeatures } from "@/components/feed/AIFeatures";

export default function Index() {
  return (
    <>
      <MobileHeader />
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <Header />
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <WeatherWidget />
              <AIFeatures />
            </div>
            
            <Tabs defaultValue="feed" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="feed" className="flex-1">Feed</TabsTrigger>
                <TabsTrigger value="trending" className="flex-1">Tendances</TabsTrigger>
                <TabsTrigger value="following" className="flex-1">Abonnements</TabsTrigger>
              </TabsList>
              <TabsContent value="feed">
                <OutfitFeed />
              </TabsContent>
              <TabsContent value="trending">
                <OutfitFeed filter="trending" />
              </TabsContent>
              <TabsContent value="following">
                <OutfitFeed filter="following" />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}