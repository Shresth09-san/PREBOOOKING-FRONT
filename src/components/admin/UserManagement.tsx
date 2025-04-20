import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/admin-api'; // Assuming adminApi contains the functions for updating the user data
import { User } from '@/lib/models'; // Assuming User is your data model
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/use-toast';
import { 
  Users, 
  Search, 
  UserCog, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Mail,
  UserCheck,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const UserManagement = () => {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'homeowner' | 'provider'>('all');
  
  // Get user details from the Auth context (real data)
  const { getUserdetails, homeownerdetails, providerdetails, allusers } = useAuth();

  useEffect(() => {
    // Load user details when the component mounts
    const loadData = async () => {
      try {
        await getUserdetails(); // Fetch data from backend
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, [getUserdetails]);

  useEffect(() => {
    let result: User[] = [];

    // Switch data based on active tab filter
    if (activeFilter === 'all') {
      result = allusers || [];
    } else if (activeFilter === 'homeowner') {
      result = homeownerdetails || [];
    } else if (activeFilter === 'provider') {
      result = providerdetails || [];
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        user => 
          user?.name?.toLowerCase().includes(term) || 
          user?.email?.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(result);
  }, [searchTerm, activeFilter, allusers, homeownerdetails, providerdetails]);

  const handleStatusUpdate = async (userId: string, status: User['status']) => {
    try {
      const updatedUser = await adminApi.updateUserStatus(userId, status);
      // Update the user in the corresponding array (this could be improved with a more centralized state management)
      setFilteredUsers(filteredUsers.map(user => user.id === userId ? updatedUser : user));
      
      const statusMap: Record<User['status'], string> = {
        'active': 'activated',
        'inactive': 'deactivated',
        'suspended': 'suspended',
      };
      
      toast({
        title: "Status updated",
        description: `User account has been ${statusMap[status]}.`,
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: User['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500 hover:bg-red-600">Suspended</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'homeowner':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Homeowner</Badge>;
      case 'provider':
        return <Badge className="bg-doit-400 hover:bg-doit-500">Provider</Badge>;
      case 'admin':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-doit-400"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Tabs 
        defaultValue={activeFilter} 
        value={activeFilter} 
        onValueChange={(value) => setActiveFilter(value as any)} 
        className="w-full mb-6"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="homeowner">Homeowners</TabsTrigger>
          <TabsTrigger value="provider">Providers</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted-foreground">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted cursor-pointer"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsDialogOpen(true);
                    }}
                  >
                    <td className="p-4 align-middle">{user.name}</td>
                    <td className="p-4 align-middle">{user.email}</td>
                    <td className="p-4 align-middle">{getRoleBadge(user.role)}</td>
                    <td className="p-4 align-middle">{getStatusBadge(user.status)}</td>
                    <td className="p-4 align-middle">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          setIsDialogOpen(true);
                        }}
                      >
                        <UserCog size={16} className="mr-2" />
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedUser && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                View and manage user account
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <div>{getRoleBadge(selectedUser.role)}</div>
              </div>
              <div className="text-sm">Email: {selectedUser.email}</div>
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <Calendar size={16} /> 
                  {selectedUser.createdAt}
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  {selectedUser.email}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => handleStatusUpdate(selectedUser.id, 'active')}
              >
                Activate
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleStatusUpdate(selectedUser.id, 'suspended')}
              >
                Suspend
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagement;