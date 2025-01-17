import { Button } from "@/components/ui/button";
import { AddClothingDialog } from "./AddClothingDialog";
import { LogOut } from "lucide-react";

interface HeaderProps {
  onLogout: () => void;
  className?: string;
}

export const Header = ({ onLogout, className }: HeaderProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-primary">Ma Garde-robe</h1>
        <div className="flex gap-4">
          <AddClothingDialog />
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="border-primary/20 hover:bg-primary/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </div>
    </div>
  );
};