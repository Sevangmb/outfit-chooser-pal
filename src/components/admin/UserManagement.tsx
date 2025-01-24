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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserCheck, UserX, Mail, Ban, Search } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: "admin" | "user";
  status: "active" | "inactive" | "banned";
  last_login: string | null;
}

interface MessageForm {
  subject: string;
  content: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messageForm, setMessageForm] = useState<MessageForm>({
    subject: "",
    content: "",
  });

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...");
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, status, last_login');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        status: profile.status || 'active',
        last_login: profile.last_login,
        role: roles.find((r: any) => r.user_id === profile.id)?.role || 'user'
      }));

      console.log("Users fetched:", usersWithRoles);
      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateUserRole = async (userId: string, newRole: "admin" | "user") => {
    try {
      console.log("Updating user role:", userId, newRole);
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: newRole }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success("Rôle mis à jour avec succès");
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error("Erreur lors de la mise à jour du rôle");
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      console.log("Updating user status:", userId, newStatus);
      const { error } = await supabase
        .rpc('update_user_status', {
          user_id: userId,
          new_status: newStatus
        });

      if (error) throw error;

      toast.success("Statut mis à jour avec succès");
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const sendMessage = async (userId: string) => {
    try {
      console.log("Sending message to user:", userId, messageForm);
      const { error } = await supabase
        .from('admin_messages')
        .insert({
          user_id: userId,
          subject: messageForm.subject,
          content: messageForm.content
        });

      if (error) throw error;

      toast.success("Message envoyé avec succès");
      setMessageForm({ subject: "", content: "" });
      setSelectedUser(null);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Rechercher par email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role}
                  onValueChange={(value: "admin" | "user") => updateUserRole(user.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={user.status}
                  onValueChange={(value) => updateUserStatus(user.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="banned">Banni</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Jamais'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateUserRole(user.id, 'admin')}
                    className="text-green-600"
                  >
                    <UserCheck className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateUserRole(user.id, 'user')}
                    className="text-red-600"
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Envoyer un message à {user.email}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input
                          placeholder="Sujet"
                          value={messageForm.subject}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                        />
                        <Input
                          placeholder="Message"
                          value={messageForm.content}
                          onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                        />
                        <Button onClick={() => sendMessage(user.id)}>
                          Envoyer
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateUserStatus(user.id, 'banned')}
                    className="text-red-600"
                  >
                    <Ban className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};