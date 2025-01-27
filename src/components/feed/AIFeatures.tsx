import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

export const AIFeatures = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Button 
        variant="outline" 
        className="flex items-center gap-2 h-auto py-4"
        onClick={() => {}}
        disabled
      >
        <Brain className="h-4 w-4" />
        <div className="text-left">
          <div className="font-medium">Style personnel</div>
          <div className="text-sm text-muted-foreground">Suggestions basées sur vos préférences</div>
        </div>
      </Button>
    </div>
  );
};