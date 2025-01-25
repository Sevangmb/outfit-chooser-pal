import { cn } from "@/lib/utils";
import { Store, Upload, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { UserFiles } from "../files/UserFiles";
import { CreateShopDialog } from "../shop/CreateShopDialog";
import { useQuery } from "@tanstack/react-query";

interface ProfileMenuProps {
  isActive: boolean;
}

export const ProfileMenu = ({ isActive }: ProfileMenuProps) => {
  const navigate = useNavigate();
  const { data: notificationsCount } = useNotifications();
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const [showShopDialog, setShowShopDialog] = useState(false);

  const { data: shopProfile } = useQuery({
    queryKey: ["shopProfile"],
    queryFn: async () => {
      console.log("Fetching shop profile...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("shop_profiles")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching shop profile:", error);
        return null;
      }

      console.log("Fetched shop profile:", data);
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      console.log("Attempting to sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        toast.error("Erreur lors de la déconnexion");
        return;
      }
      console.log("Successfully signed out");
      toast.success("Vous avez été déconnecté");
      navigate("/landing");
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      toast.error("Une erreur inattendue s'est produite");
    }
  };

  return (
    <>
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
            <User className="w-4 h-4 mr-2" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowShopDialog(true)}>
            <Store className="w-4 h-4 mr-2" />
            {shopProfile ? "Gérer ma boutique" : "Créer ma boutique"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowFilesDialog(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Mes fichiers
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/messages")}>
            Messages
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/notifications")}>
            Notifications {notificationsCount > 0 && `(${notificationsCount})`}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Mes fichiers</DialogTitle>
          </DialogHeader>
          <UserFiles />
        </DialogContent>
      </Dialog>

      <Dialog open={showShopDialog} onOpenChange={setShowShopDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {shopProfile ? "Gérer ma boutique" : "Créer ma boutique"}
            </DialogTitle>
          </DialogHeader>
          <CreateShopDialog existingShop={shopProfile} />
        </DialogContent>
      </Dialog>
    </>
  );
};