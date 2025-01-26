import { useState } from "react";
import { useGroups } from "@/hooks/useGroups";
import { CreateGroupDialog } from "./CreateGroupDialog";
import { GroupCard } from "./GroupCard";
import { GroupMembersDialog } from "./GroupMembersDialog";

export const GroupsSection = () => {
  const { groups, isLoading, createGroup, isCreating } = useGroups();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

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
        <CreateGroupDialog onCreateGroup={createGroup} isCreating={isCreating} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups?.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onManageMembers={setSelectedGroupId}
          />
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