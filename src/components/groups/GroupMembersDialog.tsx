import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserX, Shield, User } from "lucide-react";

interface Member {
  id: number;
  user_id: string;
  role: string;
  joined_at: string;
  is_approved: boolean;
  user: {
    email: string;
  } | null;
}

interface GroupMembersDialogProps {
  groupId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const GroupMembersDialog = ({ groupId, isOpen, onClose }: GroupMembersDialogProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      console.log("Fetching group members for group:", groupId);
      
      const { data: membersData, error } = await supabase
        .from("message_group_members")
        .select(`
          id,
          user_id,
          role,
          joined_at,
          is_approved,
          user:profiles!inner(email)
        `)
        .eq("group_id", groupId);

      if (error) {
        console.error("Error fetching members:", error);
        toast.error("Erreur lors du chargement des membres");
        return;
      }

      console.log("Fetched members data:", membersData);
      
      if (membersData) {
        const transformedMembers: Member[] = membersData.map(member => ({
          id: member.id,
          user_id: member.user_id,
          role: member.role,
          joined_at: member.joined_at,
          is_approved: member.is_approved,
          user: member.user
        }));

        setMembers(transformedMembers);
      }
    } catch (error) {
      console.error("Error in fetchMembers:", error);
      toast.error("Erreur lors du chargement des membres");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, groupId]);

  const updateMemberRole = async (memberId: number, newRole: string) => {
    try {
      console.log("Updating member role:", memberId, newRole);
      const { error } = await supabase
        .from("message_group_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Rôle mis à jour avec succès");
      fetchMembers();
    } catch (error) {
      console.error("Error updating member role:", error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const removeMember = async (memberId: number) => {
    try {
      console.log("Removing member:", memberId);
      const { error } = await supabase
        .from("message_group_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Membre retiré avec succès");
      fetchMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Erreur lors de la suppression du membre");
    }
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Gestion des membres</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Date d'adhésion</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {member.user?.email || 'Email inconnu'}
                </TableCell>
                <TableCell>
                  <Select
                    value={member.role}
                    onValueChange={(value) => updateMemberRole(member.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Membre</SelectItem>
                      <SelectItem value="moderator">Modérateur</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(member.joined_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateMemberRole(member.id, "moderator")}
                      className="text-yellow-600"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeMember(member.id)}
                      className="text-red-600"
                    >
                      <UserX className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
};