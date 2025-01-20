import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusCircle, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Fetch notifications count with better error handling and retry
  const { data: notificationsCount } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      console.log("Fetching notifications count...");
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Current session:", session);
        
        if (!session) {
          console.log("No session found, returning 0");
          return 0;
        }

        console.log("Fetching unread messages for user:", session.user.id);
        const { count, error } = await supabase
          .from("admin_messages")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .is("read_at", null);

        if (error) {
          console.error("Error fetching notifications:", error);
          throw error;
        }

        console.log("Unread messages count:", count);
        return count || 0;
      } catch (error) {
        console.error("Error in notification query:", error);
        return 0;
      }
    },
    retry: 3,
    retryDelay: 1000,
    staleTime: 30000,
    refetchOnWindowFocus: true
  });

  const tabs = [
    {
      icon: Home,
      label: "Accueil",
      path: "/",
    },
    {
      icon: Search,
      label: "Découvrir",
      path: "/discover",
    },
    {
      icon: PlusCircle,
      label: "",
      path: "/add",
    },
    {
      icon: ShoppingBag,
      label: "Placard",
      path: "/closet",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.path;
          const isAdd = tab.path === "/add";

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                isAdd && "relative -top-3"
              )}
              aria-label={tab.label || "Créer"}
              role="tab"
              aria-selected={isActive}
            >
              <Icon
                className={cn(
                  "h-6 w-6 mb-1",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground",
                  isAdd && "h-12 w-12 text-primary bg-background rounded-full p-2 shadow-lg"
                )}
              />
              {tab.label && (
                <span
                  className={cn(
                    "text-xs",
                    isActive
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center w-full h-full relative",
                currentPath === "/profile" && "text-primary"
              )}
              aria-label="Profile"
              role="tab"
              aria-selected={currentPath === "/profile"}
            >
              <User className={cn(
                "h-6 w-6 mb-1",
                currentPath === "/profile" ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs",
                currentPath === "/profile" ? "text-primary font-medium" : "text-muted-foreground"
              )}>
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
      </div>
    </nav>
  );
};