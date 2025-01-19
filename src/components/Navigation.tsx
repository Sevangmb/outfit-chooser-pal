import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Home, Heart, Trophy, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface NavigationProps {
  className?: string;
}

export const Navigation = ({ className }: NavigationProps) => {
  const location = useLocation();

  const NavLinks = () => (
    <>
      <NavigationMenuItem>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2",
            location.pathname === "/" && "bg-primary/10 text-primary"
          )}
          asChild
        >
          <Link to="/">
            <Home className="h-4 w-4" />
            <span>Accueil</span>
          </Link>
        </Button>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2",
            location.pathname === "/favorites" && "bg-primary/10 text-primary"
          )}
          asChild
        >
          <Link to="/favorites">
            <Heart className="h-4 w-4" />
            <span>Favoris</span>
          </Link>
        </Button>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <Button
          variant="ghost"
          className={cn(
            "flex items-center gap-2",
            location.pathname === "/contest" && "bg-primary/10 text-primary"
          )}
          asChild
        >
          <Link to="/contest">
            <Trophy className="h-4 w-4" />
            <span>Concours</span>
          </Link>
        </Button>
      </NavigationMenuItem>
    </>
  );

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-secondary", className)}>
      {/* Desktop Navigation */}
      <div className="hidden md:block container">
        <NavigationMenu className="mx-auto">
          <NavigationMenuList className="space-x-2">
            <NavLinks />
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary">Ma Garde-robe</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col gap-2 mt-8">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};