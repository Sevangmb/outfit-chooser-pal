import { useLocation, useNavigate } from "react-router-dom";
import { Home, Search, PlusCircle, Store, User } from "lucide-react";
import { NavTab } from "./navigation/NavTab";

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const tabs = [
    {
      icon: Home,
      label: "Accueil",
      path: "/app",
      ariaLabel: "Aller à l'accueil",
    },
    {
      icon: Search,
      label: "Découvrir",
      path: "/discover",
      ariaLabel: "Découvrir de nouvelles tenues",
    },
    {
      icon: PlusCircle,
      label: "",
      path: "/add",
      ariaLabel: "Ajouter un vêtement ou une tenue",
    },
    {
      icon: Store,
      label: "Boutiques",
      path: "/shop",
      ariaLabel: "Explorer les boutiques",
    },
    {
      icon: User,
      label: "Profil",
      path: "/profile",
      ariaLabel: "Voir mon profil",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {tabs.map((tab) => (
          <NavTab
            key={tab.path}
            {...tab}
            isActive={currentPath === tab.path}
            isAdd={tab.path === "/add"}
            onClick={() => navigate(tab.path)}
          />
        ))}
      </div>
    </nav>
  );
};