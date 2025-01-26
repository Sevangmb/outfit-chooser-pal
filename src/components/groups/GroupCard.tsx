import { Button } from "@/components/ui/button";
import { Users, Settings } from "lucide-react";
import { Group } from "@/hooks/useGroups";

interface GroupCardProps {
  group: Group;
  onManageMembers: (groupId: number) => void;
}

export const GroupCard = ({ group, onManageMembers }: GroupCardProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-2 hover:shadow-md transition-shadow">
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
          onClick={() => onManageMembers(group.id)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="h-4 w-4" />
        <span>{group.member_count} membres</span>
      </div>
    </div>
  );
};