import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { NewGroup } from "@/hooks/useGroups";

interface CreateGroupDialogProps {
  onCreateGroup: (group: NewGroup) => void;
  isCreating: boolean;
}

export const CreateGroupDialog = ({ onCreateGroup, isCreating }: CreateGroupDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newGroup, setNewGroup] = useState<NewGroup>({
    name: "",
    description: "",
    privacy: "public",
  });

  const handleCreate = () => {
    onCreateGroup(newGroup);
    setIsOpen(false);
    setNewGroup({ name: "", description: "", privacy: "public" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
          <Button onClick={handleCreate} className="w-full" disabled={isCreating}>
            {isCreating ? "Création..." : "Créer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};