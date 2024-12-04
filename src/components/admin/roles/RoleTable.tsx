import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Role } from '@/lib/types/role';
import { useToast } from '@/components/ui/use-toast';
import { deleteRole } from '@/lib/api/roles';
import RoleDialog from './RoleDialog';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IconButton } from 'rsuite';
import EditIcon from '@rsuite/icons/Edit';
import TrashIcon from '@rsuite/icons/Trash';

interface RoleTableProps {
  roles: Role[];
  onRoleChange: () => void;
  loading?: boolean;
}

export default function RoleTable({ roles, onRoleChange, loading }: RoleTableProps) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const { toast } = useToast();

  const handleDelete = async (role: Role) => {
    try {
      await deleteRole(role.id);
      toast({
        title: 'Success',
        description: 'Role deleted successfully',
      });
      onRoleChange();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete role',
      });
    } finally {
      setRoleToDelete(null);
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!roles.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No roles found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((rp) => (
                      <Badge key={rp.permission.id} variant="secondary">
                        {rp.permission.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      appearance="subtle"
                      style={{
                        color: 'blue',
                      }}
                      onClick={() => handleEdit(role)}
                    />
                    <IconButton
                      icon={<TrashIcon />}
                      size="sm"
                      appearance="ghost"
                      style={{
                        color: role.name === 'admin' ? 'gray' : 'red',
                        cursor: role.name === 'admin' ? 'not-allowed' : 'pointer',
                      }}
                      onClick={() => setRoleToDelete(role)}
                      disabled={role.name === 'admin'}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <RoleDialog
        role={selectedRole}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={onRoleChange}
      />

      <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              and remove all associated permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleToDelete && handleDelete(roleToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}