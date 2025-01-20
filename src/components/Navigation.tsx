import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Navigation = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications count with better error handling
  const { data: notificationsCount } = useQuery({
    queryKey: ["unread-notifications"],
    queryFn: async () => {
      console.log("Fetching notifications count...");
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Current session:", session);
      
      if (!session) {
        console.log("No session found, returning 0");
        return 0;
      }

      console.log("Fetching unread messages for user:", session.user.id);
      const { count, error } = await supabase
        .from("admin_messages")
        .select("*", { count: "exact" })
        .eq("user_id", session.user.id)
        .is("read_at", null);

      if (error) {
        console.error("Error fetching notifications:", error);
        return 0;
      }

      console.log("Unread messages count:", count);
      return count || 0;
    },
    retry: false
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home - Refreshes feed */}
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

          {/* Right side icons */}
          <div className="flex items-center space-x-2">
            {/* Search - Redirects to Discover page */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
              onClick={() => navigate("/discover")}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent"
                onClick={() => navigate("/notifications")}
              >
                <Bell className="h-5 w-5" />
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationsCount > 9 ? "9+" : notificationsCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Profile */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
              onClick={() => navigate("/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};