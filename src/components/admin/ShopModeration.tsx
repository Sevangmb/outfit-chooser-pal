import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Check, X, Search } from "lucide-react";

interface ShopProfile {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
  is_verified: boolean | null;
  status: string | null;
  latitude: number | null;
  longitude: number | null;
  profiles: {
    email: string | null;
  } | null;
}

const ShopModeration = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: shops, isLoading } = useQuery({
    queryKey: ['pending-shops'],
    queryFn: async () => {
      console.log("Fetching pending shops...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data: shopData, error: shopError } = await supabase
        .from('shop_profiles')
        .select(`
          *,
          profiles!shop_profiles_user_id_fkey (
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (shopError) {
        console.error('Error fetching shops:', shopError);
        throw shopError;
      }

      console.log("Fetched shop data:", shopData);
      return (shopData || []) as ShopProfile[];
    }
  });

  const updateShopStatusMutation = useMutation({
    mutationFn: async ({ shopId, status }: { shopId: string, status: 'approved' | 'rejected' }) => {
      console.log(`Updating shop ${shopId} status to ${status}`);
      const { error } = await supabase
        .from('shop_profiles')
        .update({ 
          status: status,
          is_verified: status === 'approved'
        })
        .eq('id', shopId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-shops'] });
      toast.success('Statut de la boutique mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Error updating shop status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  });

  const filteredShops = shops?.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une boutique..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Date de création</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredShops?.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell>{shop.name}</TableCell>
                <TableCell>{shop.profiles?.email}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {shop.description}
                </TableCell>
                <TableCell>
                  {new Date(shop.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600"
                      onClick={() => updateShopStatusMutation.mutate({ 
                        shopId: shop.id, 
                        status: 'approved' 
                      })}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600"
                      onClick={() => updateShopStatusMutation.mutate({ 
                        shopId: shop.id, 
                        status: 'rejected' 
                      })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export { ShopModeration };