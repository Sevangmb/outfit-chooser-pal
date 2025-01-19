import { NavLink } from "react-router-dom";
import { Home, Heart, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export const Navigation = () => {
  const links = [
    { to: "/", icon: Home, label: "Accueil" },
    { to: "/favorites", icon: Heart, label: "Favoris" },
    { to: "/contest", icon: Trophy, label: "Concours" },
    { to: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-secondary md:top-0 md:bottom-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-around md:justify-end items-center h-16 gap-2">
          {links.map(({ to, icon: Icon, label }) => (
            <Tooltip key={to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )
                  }
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                  >
                    <Icon className="h-5 w-5" />
                  </Button>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </nav>
  );
};