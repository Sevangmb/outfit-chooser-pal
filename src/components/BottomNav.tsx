import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusCircle, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

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
    {
      icon: User,
      label: "Profil",
      path: "/profile",
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
      </div>
    </nav>
  );
};