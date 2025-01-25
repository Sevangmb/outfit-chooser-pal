import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

export const MobileHeader = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Mon Placard",
      items: [
        { name: "Voir mon placard", path: "/closet" },
        { name: "Ajouter un vêtement", path: "/add" },
        { name: "Mes favoris", path: "/favorites" },
      ],
    },
    {
      title: "Ma Boutique",
      items: [
        { name: "Voir ma boutique", path: "/shop" },
        { name: "Vendre un vêtement", path: "/add?sale=true" },
      ],
    },
    {
      title: "Social",
      items: [
        { name: "Découvrir", path: "/discover" },
        { name: "Concours", path: "/contest" },
      ],
    },
    {
      title: "Mon Compte",
      items: [
        { name: "Profil", path: "/profile" },
        { name: "Administration", path: "/admin" },
      ],
    },
  ];

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-secondary p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary">Feed</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background/95 backdrop-blur-lg w-[300px]">
            <SheetHeader>
              <SheetTitle className="text-primary mb-4">Menu</SheetTitle>
            </SheetHeader>
            <NavigationMenu orientation="vertical" className="w-full">
              <NavigationMenuList className="flex-col space-y-2">
                {menuItems.map((section) => (
                  <NavigationMenuItem key={section.title}>
                    <NavigationMenuTrigger className="w-full justify-between">
                      {section.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[250px] p-2">
                        {section.items.map((item) => (
                          <Button
                            key={item.path}
                            variant="ghost"
                            className="w-full justify-start text-left"
                            onClick={() => {
                              navigate(item.path);
                            }}
                          >
                            {item.name}
                          </Button>
                        ))}
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};