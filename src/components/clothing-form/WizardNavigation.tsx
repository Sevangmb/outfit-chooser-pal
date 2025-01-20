import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled?: boolean;
}

export const WizardNavigation = ({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  isNextDisabled = false,
}: WizardNavigationProps) => {
  return (
    <div className="flex justify-between items-center mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Précédent
      </Button>
      <div className="text-sm text-muted-foreground">
        Étape {currentStep + 1} sur {totalSteps}
      </div>
      <Button
        type="button"
        onClick={onNext}
        disabled={isNextDisabled}
      >
        {currentStep === totalSteps - 1 ? "Terminer" : "Suivant"}
        {currentStep !== totalSteps - 1 && (
          <ChevronRight className="h-4 w-4 ml-2" />
        )}
      </Button>
    </div>
  );
};