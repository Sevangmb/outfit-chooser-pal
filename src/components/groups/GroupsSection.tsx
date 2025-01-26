import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Users, Plus, Settings } from "lucide-react";
import { GroupMembersDialog } from "./GroupMembersDialog";

interface Group {
  id: number;
  name: string;
  description: string | null;
  privacy: 'public' | 'private' | 'secret';
  cover_image: string | null;
  created_by: string;
  created_at: string;
  rules: string | null;
  member_count: number;
}

interface NewGroup {
  name: string;
  description: string;
  privacy: 'public' | 'private' | 'secret';
}

export const GroupsSection = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [newGroup, setNewGroup] = useState<NewGroup>({
    name: "",
    description: "",
    privacy: "public",
  });

  const { data: groups, isLoading, refetch } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      console.log("Fetching groups...");
      const { data, error } = await supabase
        .from("message_groups")
        .select(`
          *,
          member_count:message_group_members(count)
        `);

      if (error) {
        console.error("Error fetching groups:", error);
        throw error;
      }

      const transformedGroups = data.map(group => ({
        ...group,
        member_count: group.member_count[0]?.count || 0
      }));

      console.log("Groups fetched:", transformedGroups);
      return transformedGroups as Group[];
    },
  });

  const createGroup = async () => {
    try {
      console.log("Creating group:", newGroup);
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const { data: group, error } = await supabase
        .from("message_groups")
        .insert([{
          ...newGroup,
          created_by: userId,
        }])
        .select()
        .single();

      if (error) throw error;

      const { error: memberError } = await supabase
        .from("message_group_members")
        .insert([
          {
            group_id: group.id,
            user_id: userId,
            role: "admin",
            is_approved: true,
          },
        ]);

      if (memberError) throw memberError;

      toast.success("Groupe créé avec succès");
      setIsCreating(false);
      setNewGroup({ name: "", description: "", privacy: "public" });
      refetch();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Erreur lors de la création du groupe");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Groupes</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Créer un groupe</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau groupe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input
                placeholder="Nom du groupe"
                value={newGroup.name}
                onChange={(e) =>
                  setNewGroup((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <Textarea
                placeholder="Description"
                value={newGroup.description}
                onChange={(e) =>
                  setNewGroup((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <Select
                value={newGroup.privacy}
                onValueChange={(value: "public" | "private" | "secret") =>
                  setNewGroup((prev) => ({ ...prev, privacy: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Confidentialité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Privé</SelectItem>
                  <SelectItem value="secret">Secret</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createGroup} className="w-full">
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups?.map((group) => (
          <div
            key={group.id}
            className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow"
          >
            {group.cover_image && (
              <img
                src={group.cover_image}
                alt={group.name}
                className="w-full h-32 object-cover rounded-md"
              />
            )}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-600">{group.description}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedGroupId(group.id)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{group.member_count} membres</span>
            </div>
          </div>
        ))}
      </div>

      {selectedGroupId && (
        <GroupMembersDialog
          groupId={selectedGroupId}
          isOpen={!!selectedGroupId}
          onClose={() => setSelectedGroupId(null)}
        />
      )}
    </div>
  );
};