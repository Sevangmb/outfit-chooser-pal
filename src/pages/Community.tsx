import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessagingSection } from "@/components/messaging/MessagingSection";
import { GroupsSection } from "@/components/groups/GroupsSection";
import { NotificationsSection } from "@/components/notifications/NotificationsSection";
import { MessageSquare, Users, Bell, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";

const Community = () => {
  const navigate = useNavigate();
  const { data: unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-4 mx-auto mt-16">
        <h1 className="text-2xl font-bold mb-6">Communauté</h1>
        
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Groupes</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden md:inline">Trouver des amis</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <MessagingSection />
          </TabsContent>

          <TabsContent value="groups">
            <GroupsSection />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsSection />
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