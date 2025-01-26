import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Member } from "../types/member";
import { MemberRow } from "./MemberRow";

interface MembersTableProps {
  members: Member[];
  onRoleUpdate: (memberId: number, newRole: string) => void;
  onRemove: (memberId: number) => void;
}

export const MembersTable = ({
  members,
  onRoleUpdate,
  onRemove,
}: MembersTableProps) => {
  return (
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
          <MemberRow
            key={member.id}
            id={member.id}
            email={member.email}
            role={member.role}
            joinedAt={member.joined_at}
            onRoleUpdate={onRoleUpdate}
            onRemove={onRemove}
          />
        ))}
      </TableBody>
    </Table>
  );
};