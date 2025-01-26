import { supabase } from "@/integrations/supabase/client";

export const testDriveConnection = async () => {
  try {
    console.log("Testing Google Drive connection...");
    const { data, error } = await supabase.functions.invoke('test-drive-connection');
    
    if (error) {
      console.error("Error testing connection:", error);
      throw error;
    }
    
    console.log("Connection test result:", data);
    return data;
  } catch (error) {
    console.error("Failed to test connection:", error);
    throw error;
  }
};