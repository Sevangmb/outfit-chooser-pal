import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavTabProps {
  icon: LucideIcon;
  label: string;
  path: string;
  ariaLabel: string;
  isActive: boolean;
  onClick: () => void;
}

export const NavTab = ({
  icon: Icon,
  label,
  path,
  ariaLabel,
  isActive,
  onClick,
}: NavTabProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full transition-colors",
        path === "/add" && "relative -top-3"
      )}
      aria-label={ariaLabel}
      role="tab"
      aria-selected={isActive}
    >
      <Icon
        className={cn(
          "h-6 w-6 mb-1 transition-colors",
          isActive ? "text-primary" : "text-muted-foreground",
          path === "/add" && "h-12 w-12 text-primary bg-background rounded-full p-2 shadow-lg"
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