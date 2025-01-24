import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileHeaderProps {
  email: string;
  createdAt: string;
  isAdmin: boolean;
}

export const ProfileHeader = ({ email, createdAt, isAdmin }: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src="https://images.unsplash.com/photo-1527576539890-dfa815648363" />
          <AvatarFallback>
            {email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-semibold text-primary">{email}</h2>
          <p className="text-sm text-muted-foreground">
            Membre depuis le {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {isAdmin && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin")}
            className="border-primary/20 hover:bg-primary/10"
          >
            <Shield className="h-4 w-4" />
            <span className="sr-only">Administration</span>
          </Button>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/settings")}
          className="border-primary/20 hover:bg-primary/10"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Paramètres</span>
        </Button>
      </div>
    </div>
  );
};