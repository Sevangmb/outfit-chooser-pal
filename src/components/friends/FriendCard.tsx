import { Button } from "@/components/ui/button";
import { UserCheck, UserX } from "lucide-react";

interface FriendCardProps {
  friendEmail: string;
  status: string;
  onAccept: () => void;
  onRemove: () => void;
}

export const FriendCard = ({ friendEmail, status, onAccept, onRemove }: FriendCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-secondary/50">
      <span>{friendEmail}</span>
      <div className="flex gap-2">
        {status === "pending" && (
          <Button
            onClick={onAccept}
            variant="outline"
            size="sm"
          >
            <UserCheck className="w-4 h-4 mr-2" />
            Accepter
          </Button>
        )}
        <Button
          onClick={onRemove}
          variant="destructive"
          size="sm"
        >
          <UserX className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};