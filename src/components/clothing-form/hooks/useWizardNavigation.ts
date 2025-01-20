import { useState } from "react";
import { toast } from "sonner";

export interface Step {
  title: string;
  isComplete: (values: any) => boolean;
}

export const WIZARD_STEPS: Step[] = [
  {
    title: "Image",
    isComplete: (values: any) => !!values.image && !values.image.startsWith('blob:'),
  },
  {
    title: "Analyse",
    isComplete: () => true, // Optional step
  },
  {
    title: "Informations de base",
    isComplete: (values: any) => !!values.name && !!values.category,
  },
  {
    title: "Couleurs",
    isComplete: (values: any) => !!values.color,
  },
  {
    title: "Détails additionnels",
    isComplete: () => true, // Optional step
  },
];

export const useWizardNavigation = (formValues: any) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    const currentStepData = WIZARD_STEPS[currentStep];
    if (currentStepData.isComplete(formValues)) {
      setCurrentStep((prev) => Math.min(prev + 1, WIZARD_STEPS.length - 1));
    } else {
      toast.error("Veuillez remplir tous les champs requis avant de continuer");
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return {
    currentStep,
    totalSteps: WIZARD_STEPS.length,
    handleNext,
    handlePrevious,
  };
};