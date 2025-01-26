import { supabase } from "@/integrations/supabase/client";

export const testOneDriveConnection = async () => {
  try {
    console.log("Testing OneDrive connection...");
    const { data, error } = await supabase.functions.invoke('test-onedrive-connection');
    
    if (error) {
      console.error("Error testing connection:", error);
      return {
        success: false,
        message: error.message || "Erreur de connexion à OneDrive"
      };
    }
    
    console.log("Connection test result:", data);
    return {
      success: true,
      message: "Connexion établie avec succès"
    };
  } catch (error) {
    console.error("Failed to test connection:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erreur inattendue lors de la vérification"
    };
  }
};