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
      path: "/",
      ariaLabel: "Accéder à l'accueil",
    },
    {
      icon: Search,
      label: "Découvrir",
      path: "/discover",
      ariaLabel: "Découvrir du contenu",
    },
    {
      icon: PlusCircle,
      label: "Ajouter",
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-lg border-t">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {tabs.map((tab) => (
          <NavTab
            key={tab.path}
            icon={tab.icon}
            label={tab.label}
            isActive={currentPath === tab.path}
            onClick={() => navigate(tab.path)}
            ariaLabel={tab.ariaLabel}
          />
        ))}
      </div>
    </nav>
  );
};