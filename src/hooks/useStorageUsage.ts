import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const MAX_STORAGE_BYTES = 100 * 1024 * 1024; // 100 MB in bytes

export const useStorageUsage = () => {
  const { data: storageUsage, isLoading } = useQuery({
    queryKey: ['storageUsage'],
    queryFn: async () => {
      console.log("Fetching storage usage...");
      const { data: files, error } = await supabase
        .from('user_files')
        .select('size')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        console.error("Error fetching storage usage:", error);
        throw error;
      }

      const totalSize = files?.reduce((acc, file) => acc + (file.size || 0), 0) || 0;
      console.log("Total storage used:", totalSize, "bytes");
      
      return {
        used: totalSize,
        total: MAX_STORAGE_BYTES,
        percentage: (totalSize / MAX_STORAGE_BYTES) * 100
      };
    }
  });

  return {
    storageUsage,
    isLoading
  };
};