import { supabase } from "@/integrations/supabase/client";

export const testOneDriveConnection = async () => {
  try {
    console.log("Testing OneDrive connection...");
    
    // First check if we have a valid session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError || !refreshData.session) {
        throw new Error("Session expired. Please login again.");
      }
    }
    
    const { data, error } = await supabase.functions.invoke('test-onedrive-connection', {
      headers: {
        Authorization: `Bearer ${session?.access_token}`
      }
    });
    
    if (error) {
      console.error("Error testing connection:", error);
      return {
        success: false,
        error: error.message || "Erreur de connexion à OneDrive"
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
      error: error instanceof Error ? error.message : "Erreur inattendue lors de la vérification"
    };
  }
};