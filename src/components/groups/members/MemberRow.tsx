import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableCell, TableRow } from "@/components/ui/table";
import { Shield, User, UserX } from "lucide-react";

interface MemberRowProps {
  id: number;
  email: string | null;
  role: string;
  joinedAt: string;
  onRoleUpdate: (memberId: number, newRole: string) => void;
  onRemove: (memberId: number) => void;
}

export const MemberRow = ({
  id,
  email,
  role,
  joinedAt,
  onRoleUpdate,
  onRemove,
}: MemberRowProps) => {
  return (
    <TableRow>
      <TableCell className="flex items-center gap-2">
        <User className="h-4 w-4" />
        {email || 'Email inconnu'}
      </TableCell>
      <TableCell>
        <Select
          value={role}
          onValueChange={(value) => onRoleUpdate(id, value)}
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
        {new Date(joinedAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRoleUpdate(id, "moderator")}
            className="text-yellow-600"
          >
            <Shield className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onRemove(id)}
            className="text-red-600"
          >
            <UserX className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};