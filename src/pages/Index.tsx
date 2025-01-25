import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WeatherWidget } from "@/components/weather/WeatherWidget";

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // D'abord, vérifions la session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erreur de session:", sessionError);
          toast.error("Erreur d'authentification");
          return;
        }

        if (!session?.user) {
          console.log("Pas de session utilisateur");
          return;
        }

        // Récupérer d'abord les IDs des groupes
        const { data: groupMemberships, error: groupError } = await supabase
          .from("message_group_members")
          .select("group_id")
          .eq("user_id", session.user.id);

        if (groupError) {
          console.error("Erreur lors de la récupération des groupes:", groupError);
          toast.error("Erreur lors de la récupération des messages");
          return;
        }

        const groupIds = groupMemberships?.map(row => row.group_id) || [];

        // Ensuite, récupérer les messages
        const { data: messages, error: messagesError } = await supabase
          .from("group_messages")
          .select(`
            *,
            sender:profiles!group_messages_sender_id_fkey(email),
            message_groups(name)
          `)
          .in("group_id", groupIds)
          .order("created_at", { ascending: false })
          .limit(10);

        if (messagesError) {
          console.error("Erreur lors de la récupération des messages:", messagesError);
          toast.error("Erreur lors de la récupération des messages");
          return;
        }

        setMessages(messages || []);
      } catch (error) {
        console.error("Erreur inattendue:", error);
        toast.error("Une erreur inattendue s'est produite");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <WeatherWidget />
        <h1 className="text-2xl font-bold">Fil d'actualité</h1>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Aucun message récent
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className="bg-card p-4 rounded-lg shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{message.sender?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {message.message_groups?.name}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-foreground">{message.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;