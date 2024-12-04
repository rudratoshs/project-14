import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Search, Lock } from 'lucide-react';
import { Permission } from '@/lib/types/permission';
import { getPermissions } from '@/lib/api/permissions';
import PermissionTable from './PermissionTable';
import PermissionDialog from './PermissionDialog';

export default function PermissionList() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredPermissions, setFilteredPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const data = await getPermissions();
      setPermissions(data);
      setFilteredPermissions(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch permissions',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = permissions.filter(
        permission =>
          permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (permission.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
      setFilteredPermissions(filtered);
    } else {
      setFilteredPermissions(permissions);
    }
  }, [searchTerm, permissions]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Permissions</h2>
          <p className="text-muted-foreground">
            Manage system permissions and access controls
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2"
        >
          <Lock className="h-4 w-4" />
          Create Permission
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <PermissionTable
            permissions={filteredPermissions}
            onPermissionChange={fetchPermissions}
            loading={loading}
          />
        </CardContent>
      </Card>

      <PermissionDialog
        permission={null}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={fetchPermissions}
      />
    </div>
  );
}