import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";

interface ProfileMenuProps {
  isActive: boolean;
}

export const ProfileMenu = ({ isActive }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { data: notificationsCount } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex flex-col items-center justify-center w-full h-full relative transition-colors",
            isActive && "text-primary"
          )}
          aria-label="Menu profil"
          role="tab"
          aria-selected={isActive}
        >
          <User
            className={cn(
              "h-6 w-6 mb-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "text-xs transition-colors",
              isActive ? "text-primary font-medium" : "text-muted-foreground"
            )}
          >
            Profil
          </span>
          {notificationsCount > 0 && (
            <span className="absolute top-0 right-1/4 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationsCount > 9 ? "9+" : notificationsCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/profile")}>
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/notifications")}>
          Notifications {notificationsCount > 0 && `(${notificationsCount})`}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};