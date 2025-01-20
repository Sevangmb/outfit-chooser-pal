import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export const Navigation = () => {
  const navigate = useNavigate();

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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Home - Refreshes feed */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent"
            onClick={() => {
              navigate("/");
              window.location.reload();
            }}
          >
            <Home className="h-5 w-5" />
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-accent relative">
                <User className="h-5 w-5" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationsCount > 9 ? "9+" : notificationsCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
      </div>
    </nav>
  );
};