import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AddClothingDialog } from "./AddClothingDialog";
import { LogOut, Menu } from "lucide-react";

interface MobileHeaderProps {
  onLogout: () => void;
}

export const MobileHeader = ({ onLogout }: MobileHeaderProps) => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-secondary p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-primary">Ma Garde-robe</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-primary">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background/95 backdrop-blur-lg">
            <SheetHeader>
              <SheetTitle className="text-primary">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              <AddClothingDialog />
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="w-full border-primary/20 hover:bg-primary/10"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};