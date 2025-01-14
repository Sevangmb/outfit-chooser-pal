import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddClothingButtonProps {
  onClick: () => void;
}

export const AddClothingButton = ({ onClick }: AddClothingButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="flex items-center gap-2"
      variant="outline"
    >
      <Plus className="w-4 h-4" />
      Ajouter un vêtement
    </Button>
  );
};