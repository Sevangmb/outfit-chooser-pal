import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export const NotificationsSection = () => {
  const { data: notifications, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      console.log("Fetching notifications...");
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        console.log("No user session found");
        return [];
      }

      const { data, error } = await supabase
        .from("admin_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        toast.error("Erreur lors du chargement des notifications");
        return [];
      }

      console.log("Fetched notifications:", data);
      return data;
    },
  });

  const markAsRead = async (notificationId: string) => {
    console.log("Marking notification as read:", notificationId);
    const { error } = await supabase
      .from("admin_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId);

    if (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Erreur lors du marquage de la notification comme lue");
      return;
    }

    toast.success("Notification marquée comme lue");
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!notifications?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Bell className="w-12 h-12 mb-4 opacity-50" />
        <p>Aucune notification pour le moment</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] rounded-md border p-4">
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${
              notification.read_at ? "bg-muted/50" : "bg-background"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{notification.subject}</h3>
              {!notification.read_at && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead(notification.id)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Marquer comme lu
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {notification.content}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(notification.created_at), "PPP 'à' p", {
                locale: fr,
              })}
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};