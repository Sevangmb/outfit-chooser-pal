import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
  onLogout: () => void;
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-primary">Feed</h1>
      </div>
    </div>
  );
};