import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquarePlus, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

export const SendMessageDialog = () => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [messageType, setMessageType] = useState("direct"); // "direct" or "group"
  const [groupName, setGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .neq("id", user.id);

      if (error) throw error;
      
      return data.map(profile => ({
        id: profile.id,
        email: profile.username
      }));
    },
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["messageGroups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_groups")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Veuillez entrer un nom de groupe");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: group, error: groupError } = await supabase
        .from("message_groups")
        .insert({
          name: groupName.trim(),
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add the creator as a member
      const { error: memberError } = await supabase
        .from("message_group_members")
        .insert({
          group_id: group.id,
          user_id: user.id,
        });

      if (memberError) throw memberError;

      toast.success("Groupe créé avec succès");
      setGroupName("");
      queryClient.invalidateQueries({ queryKey: ["messageGroups"] });
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Erreur lors de la création du groupe");
    }
  };

  const handleSend = async () => {
    if (!content.trim()) {
      toast.error("Veuillez entrer un message");
      return;
    }

    if (messageType === "direct" && !recipientId) {
      toast.error("Veuillez sélectionner un destinataire");
      return;
    }

    if (messageType === "group" && !selectedGroupId) {
      toast.error("Veuillez sélectionner un groupe");
      return;
    }

    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      if (messageType === "direct") {
        const { error } = await supabase
          .from("user_messages")
          .insert({
            sender_id: user.id,
            recipient_id: recipientId,
            content: content.trim(),
          });

        if (error) throw error;
      } else if (selectedGroupId) {
        const { error } = await supabase
          .from("group_messages")
          .insert({
            group_id: selectedGroupId,
            sender_id: user.id,
            content: content.trim(),
          });

        if (error) throw error;
      }

      toast.success("Message envoyé");
      setContent("");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["groupMessages"] });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageSquarePlus className="h-4 w-4" />
          Nouveau message
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Envoyer un message</DialogTitle>
        </DialogHeader>
        <Tabs value={messageType} onValueChange={setMessageType}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Message Direct</TabsTrigger>
            <TabsTrigger value="group">Groupe</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            <Select value={recipientId} onValueChange={setRecipientId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un destinataire" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nom du nouveau groupe"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              <Button onClick={handleCreateGroup} size="sm">
                <Users className="h-4 w-4 mr-2" />
                Créer
              </Button>
            </div>

            <Select 
              value={selectedGroupId?.toString() || ""} 
              onValueChange={(value) => setSelectedGroupId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="Votre message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? "Envoi..." : "Envoyer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
