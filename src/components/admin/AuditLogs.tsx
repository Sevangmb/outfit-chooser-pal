import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface AuditLog {
  id: number;
  admin_id: string;
  action_type: string;
  action_details: any;
  created_at: string;
  users: {
    email: string;
  } | null;
}

export const AuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      console.log('Fetching audit logs...');
      const { data: logsData, error: logsError } = await supabase
        .from('audit_logs')
        .select(`
          *,
          users:profiles!audit_logs_admin_user_id_fkey (
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (logsError) {
        console.error('Error fetching audit logs from database:', logsError);
        toast.error("Erreur lors du chargement des logs d'audit. Veuillez réessayer plus tard.");
        return;
      }

      console.log('Audit logs data:', logsData);
      setLogs(logsData || []);
    } catch (error) {
      console.error('Unexpected error occurred while fetching audit logs:', error);
      toast.error("Une erreur inattendue est survenue lors du chargement des logs d'audit. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Détails</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                {new Date(log.created_at).toLocaleString()}
              </TableCell>
              <TableCell>{log.users?.email}</TableCell>
              <TableCell>{log.action_type}</TableCell>
              <TableCell>
                <pre className="text-sm">
                  {JSON.stringify(log.action_details, null, 2)}
                </pre>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};