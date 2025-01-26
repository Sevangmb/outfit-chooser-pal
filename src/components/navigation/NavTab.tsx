import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavTabProps {
  icon: LucideIcon;
  label: string;
  path: string;
  ariaLabel: string;
  isActive: boolean;
  onClick: () => void;
  color?: string;
}

export const NavTab = ({
  icon: Icon,
  label,
  path,
  ariaLabel,
  isActive,
  onClick,
  color,
}: NavTabProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full transition-colors",
        path === "/perso" && "relative -top-3"
      )}
      aria-label={ariaLabel}
      role="tab"
      aria-selected={isActive}
    >
      <Icon
        className={cn(
          "h-6 w-6 mb-1 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground",
          path === "/perso" && "h-12 w-12 bg-background rounded-full p-2 shadow-lg",
          path === "/perso" ? "text-red-500" : color === "red" ? "text-red-500" : ""
        )}
      />
      {label && (
        <span
          className={cn(
            "text-xs transition-colors",
            isActive ? "text-primary font-medium" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      )}
    </button>
  );
};