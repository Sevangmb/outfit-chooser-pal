import { useLocation, useNavigate } from "react-router-dom";
import { NavTab } from "./navigation/NavTab";
import { Home, Search, Heart, Store, MessageSquare } from "lucide-react";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationTabs = [
    {
      path: "/",
      icon: Home,
      label: "Accueil",
      ariaLabel: "Accéder à l'accueil",
    },
    {
      path: "/discover",
      icon: Search,
      label: "Découvrir",
      ariaLabel: "Découvrir du contenu",
    },
    {
      path: "/perso",
      icon: Heart,
      label: "Perso",
      ariaLabel: "Accéder à mon espace personnel",
      color: "red"
    },
    {
      path: "/shops",
      icon: Store,
      label: "Boutiques",
      ariaLabel: "Accéder aux boutiques",
    },
    {
      path: "/messages",
      icon: MessageSquare,
      label: "Communauté",
      ariaLabel: "Accéder à la communauté",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t">
      <div className="grid h-full grid-cols-5 mx-auto">
        {navigationTabs.map((tab) => (
          <NavTab
            key={tab.path}
            icon={tab.icon}
            label={tab.label}
            path={tab.path}
            isActive={currentPath === tab.path}
            onClick={() => navigate(tab.path)}
            ariaLabel={tab.ariaLabel}
            color={tab.color}
          />
        ))}
      </div>
    </nav>
  );
};