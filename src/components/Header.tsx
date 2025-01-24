import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface HeaderProps {
  className?: string;
}

export const Header = ({ className }: HeaderProps) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-8">
        {/* Title "Feed" removed */}
      </div>
    </div>
  );
};