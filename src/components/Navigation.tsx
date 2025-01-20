import { NavLink } from "react-router-dom";
import { Home, Search, PlusCircle, ShoppingBag, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { motion } from "framer-motion";

export const Navigation = () => {
  const links = [
    { to: "/", icon: Home, label: "Accueil", description: "Fil d'actualité" },
    { to: "/discover", icon: Search, label: "Découvrir", description: "Explorer les tendances" },
    { to: "/add", icon: PlusCircle, label: "Ajouter", description: "Créer une tenue" },
    { to: "/closet", icon: ShoppingBag, label: "Placard", description: "Gérer vos vêtements" },
    { to: "/profile", icon: User, label: "Profil", description: "Voir votre profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-t border-border md:top-0 md:bottom-auto">
      <div className="container mx-auto px-4">
        <div className="flex justify-around md:justify-end items-center h-16 gap-2">
          {links.map(({ to, icon: Icon, label, description }) => (
            <Tooltip key={to} delayDuration={300}>
              <TooltipTrigger asChild>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      "relative transition-colors hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative"
                    >
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-[1.5px] left-0 right-0 h-0.5 bg-primary"
                          initial={false}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className="sr-only">{label}</span>
                    </Button>
                  )}
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex flex-col items-start">
                <p className="font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </nav>
  );
};