import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagingSection } from "@/components/messaging/MessagingSection";
import { MessageSquare, Users, Bell, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-4 mx-auto mt-16">
        <h1 className="text-2xl font-bold mb-6">Communauté</h1>
        
        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Messagerie</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Groupes</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden md:inline">Trouver des amis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="messages">
            <MessagingSection />
          </TabsContent>

          <TabsContent value="groups">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Fonctionnalité à venir : Groupes de discussion thématiques
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Fonctionnalité à venir : Centre de notifications
            </div>
          </TabsContent>

          <TabsContent value="friends">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Fonctionnalité à venir : Recherche d'amis
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;