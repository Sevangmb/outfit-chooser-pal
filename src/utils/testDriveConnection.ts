import { supabase } from "@/integrations/supabase/client";

export const testDriveConnection = async () => {
  try {
    console.log("Testing Google Drive connection...");
    const { data, error } = await supabase.functions.invoke('test-drive-connection');
    
    if (error) {
      console.error("Error testing connection:", error);
      return {
        success: false,
        message: error.message || "Erreur de connexion à Google Drive"
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