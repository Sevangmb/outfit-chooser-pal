import { UseFormReturn } from "react-hook-form";
import { FormValues } from "@/types/clothing";
import { BasicFields } from "./fields/BasicFields";
import { CategoryFields } from "./fields/CategoryFields";
import { ColorFields } from "./fields/ColorFields";
import { DetailsFields } from "./fields/DetailsFields";

interface ClothingFormFieldsProps {
  form: UseFormReturn<FormValues>;
}

export const ClothingFormFields = ({ form }: ClothingFormFieldsProps) => {
  return (
    <>
      <BasicFields form={form} />
      <CategoryFields form={form} />
      <ColorFields form={form} />
      <DetailsFields form={form} />
    </>
  );
};