import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MembersTable } from "./members/MembersTable";
import { useGroupMembers } from "./hooks/useGroupMembers";

interface GroupMembersDialogProps {
  groupId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const GroupMembersDialog = ({ 
  groupId, 
  isOpen, 
  onClose 
}: GroupMembersDialogProps) => {
  const { members, loading, updateMemberRole, removeMember } = useGroupMembers(groupId);

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
        <MembersTable 
          members={members}
          onRoleUpdate={updateMemberRole}
          onRemove={removeMember}
        />
      </DialogContent>
    </Dialog>
  );
};