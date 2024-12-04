import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Permission } from '@/lib/types/permission';
import { useToast } from '@/components/ui/use-toast';
import { deletePermission } from '@/lib/api/permissions';
import PermissionDialog from './PermissionDialog';
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

interface PermissionTableProps {
  permissions: Permission[];
  onPermissionChange: () => void;
  loading?: boolean;
}

export default function PermissionTable({
  permissions,
  onPermissionChange,
  loading,
}: PermissionTableProps) {
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const { toast } = useToast();

  const handleDelete = async (permission: Permission) => {
    try {
      await deletePermission(permission.id);
      toast({
        title: 'Success',
        description: 'Permission deleted successfully',
      });
      onPermissionChange();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete permission',
      });
    } finally {
      setPermissionToDelete(null);
    }
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!permissions.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No permissions found</p>
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
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id}>
                <TableCell className="font-medium">{permission.name}</TableCell>
                <TableCell>{permission.description}</TableCell>
                <TableCell>
                  {new Date(permission.createdAt).toLocaleDateString()}
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
                      onClick={() => handleEdit(permission)}
                    />
                    <IconButton
                      icon={<TrashIcon />}
                      size="sm"
                      appearance="ghost"
                      style={{
                        color: 'red',
                      }}
                      onClick={() => setPermissionToDelete(permission)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <PermissionDialog
        permission={selectedPermission}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={onPermissionChange}
      />

      <AlertDialog
        open={!!permissionToDelete}
        onOpenChange={() => setPermissionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the permission
              and may affect roles that use it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => permissionToDelete && handleDelete(permissionToDelete)}
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