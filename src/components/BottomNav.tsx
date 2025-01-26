import { useLocation, useNavigate } from "react-router-dom";
import { NavTab } from "./navigation/NavTab";
import { Home, Search, PlusCircle, Store, User, TrendingUp, Trophy, Sparkles, LayoutList } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      hasSubmenu: true,
      submenuItems: [
        {
          path: "/",
          icon: LayoutList,
          label: "Fil d'actualité personnalisé",
        },
        {
          path: "/suggestions",
          icon: Sparkles,
          label: "Suggestions de tenues (IA)",
        },
        {
          path: "/trends",
          icon: TrendingUp,
          label: "Tendances actuelles",
        },
        {
          path: "/challenges",
          icon: Trophy,
          label: "Défis en cours",
        },
      ],
    },
    {
      path: "/discover",
      icon: Search,
      label: "Découvrir",
      ariaLabel: "Découvrir du contenu",
    },
    {
      path: "/add",
      icon: PlusCircle,
      label: "Ajouter",
      ariaLabel: "Ajouter du contenu",
    },
    {
      path: "/shops",
      icon: Store,
      label: "Boutiques",
      ariaLabel: "Accéder aux boutiques",
    },
    {
      path: "/profile",
      icon: User,
      label: "Profil",
      ariaLabel: "Accéder au profil",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-background border-t">
      <div className="grid h-full grid-cols-5 mx-auto">
        {navigationTabs.map((tab) => (
          tab.hasSubmenu ? (
            <DropdownMenu key={tab.path}>
              <DropdownMenuTrigger asChild>
                <button className="w-full">
                  <NavTab
                    icon={tab.icon}
                    label={tab.label}
                    path={tab.path}
                    isActive={currentPath === tab.path}
                    onClick={() => {}}
                    ariaLabel={tab.ariaLabel}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-56 mb-2">
                {tab.submenuItems?.map((item) => (
                  <DropdownMenuItem 
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <NavTab
              key={tab.path}
              icon={tab.icon}
              label={tab.label}
              path={tab.path}
              isActive={currentPath === tab.path}
              onClick={() => navigate(tab.path)}
              ariaLabel={tab.ariaLabel}
            />
          )
        ))}
      </div>
    </nav>
  );
};