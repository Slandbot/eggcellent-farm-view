import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useUserRole } from '@/contexts/UserRoleContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
import { Users, UserPlus, Settings, Activity, DollarSign, Eye, EyeOff, Trash2, Edit, Shield } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Farm Manager' | 'Worker';
  status: 'active' | 'inactive';
  lastLogin: string;
  permissions: string[];
}

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details: string;
}

const UserManagement: React.FC = () => {
  const { userRole } = useUserRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'John Admin',
      email: 'john@farm.com',
      phone: '+233 24 123 4567',
      role: 'Admin',
      status: 'active',
      lastLogin: '2024-01-15 10:30',
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Sarah Manager',
      email: 'sarah@farm.com',
      phone: '+233 20 987 6543',
      role: 'Farm Manager',
      status: 'active',
      lastLogin: '2024-01-15 09:15',
      permissions: ['birds', 'feed', 'medicine', 'eggs', 'reports']
    },
    {
      id: '3',
      name: 'Mike Worker',
      email: 'mike@farm.com',
      phone: '+233 55 456 7890',
      role: 'Worker',
      status: 'active',
      lastLogin: '2024-01-15 08:00',
      permissions: ['feed_record', 'egg_record', 'tasks']
    }
  ]);

  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      user: 'John Admin',
      action: 'Created new user',
      timestamp: '2024-01-15 10:30',
      details: 'Added Mike Worker to the system'
    },
    {
      id: '2',
      user: 'Sarah Manager',
      action: 'Updated bird batch',
      timestamp: '2024-01-15 09:15',
      details: 'Modified batch #B001 information'
    },
    {
      id: '3',
      user: 'Mike Worker',
      action: 'Recorded feed usage',
      timestamp: '2024-01-15 08:00',
      details: 'Added 50kg feed consumption for Coop A'
    }
  ]);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Worker' as const,
    permissions: [] as string[]
  });

  const rolePermissions = {
    Admin: ['all'],
    'Farm Manager': ['birds', 'feed', 'medicine', 'eggs', 'reports'],
    Worker: ['feed_record', 'egg_record', 'tasks']
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Farm Manager': return 'bg-blue-100 text-blue-800';
      case 'Worker': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const handleAddUser = () => {
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      status: 'active',
      lastLogin: 'Never',
      permissions: rolePermissions[newUser.role]
    };
    setUsers([...users, user]);
    setNewUser({ name: '', email: '', phone: '', password: '', role: 'Worker', permissions: [] });
    setIsAddUserOpen(false);
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      setUsers(users.filter(user => user.id !== userToDelete));
      setUserToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleEditUser = () => {
    if (selectedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
      setSelectedUser(null);
      setIsEditUserOpen(false);
    }
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  // Role-based access control
  const canManageUsers = userRole === 'Admin';
  const canViewFinancials = userRole === 'Admin';
  const canViewActivityLogs = userRole === 'Admin' || userRole === 'Farm Manager';

  if (!canManageUsers && userRole !== 'Farm Manager') {
    return (
      <div className="h-screen overflow-hidden flex bg-gray-50">
        <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col">
          <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-full">
              <Card className="w-96">
                <CardHeader className="text-center">
                  <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <CardTitle>Access Denied</CardTitle>
                  <CardDescription>
                    You don't have permission to access user management.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex bg-gray-50">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 min-w-0">
            {/* Page Header */}
            <div className="flex flex-col space-y-3 sm:space-y-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 px-1 sm:px-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">User Management</h1>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-1 line-clamp-2">
                  {userRole === 'Admin' ? 'Manage users, roles, and system settings' : 'View user information and activity'}
                </p>
              </div>
              {canManageUsers && (
                <Button onClick={() => setIsAddUserOpen(true)} className="w-full sm:w-auto mx-1 sm:mx-0">
                  <UserPlus className="h-4 w-4 mr-2" />
                  <span className="sm:inline">Add User</span>
                </Button>
              )}
            </div>

            <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:grid-cols-none lg:flex min-w-max">
                  <TabsTrigger value="users" className="text-xs sm:text-sm whitespace-nowrap">Users</TabsTrigger>
                  {canViewActivityLogs && <TabsTrigger value="activity" className="text-xs sm:text-sm whitespace-nowrap">Activity</TabsTrigger>}
                  {canManageUsers && <TabsTrigger value="settings" className="text-xs sm:text-sm whitespace-nowrap">Settings</TabsTrigger>}
                  {canViewFinancials && <TabsTrigger value="financials" className="text-xs sm:text-sm whitespace-nowrap">Financial</TabsTrigger>}
                </TabsList>
              </div>

              {/* Users Tab */}
              <TabsContent value="users" className="mt-0">
                <Card className="mx-1 sm:mx-0">
                  <CardHeader className="pb-3 sm:pb-6">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      System Users
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Manage user accounts and their access levels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6">
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <div className="min-w-full inline-block align-middle">
                        <Table className="min-w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden sm:table-cell">Email</TableHead>
                            <TableHead className="hidden lg:table-cell">Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="hidden lg:table-cell">Last Login</TableHead>
                            {canManageUsers && <TableHead>Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                <div>
                                  <div>{user.name}</div>
                                  <div className="text-sm text-gray-500 sm:hidden">{user.email}</div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                              <TableCell className="hidden lg:table-cell">{user.phone}</TableCell>
                              <TableCell>
                                <Badge className={getRoleBadgeColor(user.role)}>
                                  <span className="hidden sm:inline">{user.role.replace('_', ' ').toUpperCase()}</span>
                                  <span className="sm:hidden">{user.role.charAt(0)}</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge className={getStatusBadgeColor(user.status)}>
                                  {user.status.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">{user.lastLogin}</TableCell>
                              {canManageUsers && (
                                <TableCell>
                                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1 min-w-0">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setIsEditUserOpen(true);
                                      }}
                                      className="w-full sm:w-auto justify-start sm:justify-center px-3 py-2 sm:px-2 sm:py-1"
                                    >
                                      <Edit className="h-4 w-4 mr-2 sm:mr-0 flex-shrink-0" />
                                      <span className="sm:hidden">Edit User</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => toggleUserStatus(user.id)}
                                      className="w-full sm:w-auto justify-start sm:justify-center px-3 py-2 sm:px-2 sm:py-1"
                                    >
                                      {user.status === 'active' ? <EyeOff className="h-4 w-4 mr-2 sm:mr-0 flex-shrink-0" /> : <Eye className="h-4 w-4 mr-2 sm:mr-0 flex-shrink-0" />}
                                      <span className="sm:hidden">{user.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteUser(user.id)}
                                      className="text-red-600 hover:text-red-700 w-full sm:w-auto justify-start sm:justify-center px-3 py-2 sm:px-2 sm:py-1"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2 sm:mr-0 flex-shrink-0" />
                                      <span className="sm:hidden">Delete User</span>
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Logs Tab */}
              {canViewActivityLogs && (
                <TabsContent value="activity" className="mt-0">
                  <Card className="mx-1 sm:mx-0">
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Activity Logs
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Track user actions and system changes
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                      <div className="overflow-x-auto -mx-2 sm:mx-0">
                        <div className="min-w-full inline-block align-middle">
                          <Table className="min-w-full">
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Action</TableHead>
                              <TableHead>Timestamp</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {activityLogs.map((log) => (
                              <TableRow key={log.id}>
                                <TableCell className="font-medium">{log.user}</TableCell>
                                <TableCell>{log.action}</TableCell>
                                <TableCell>{log.timestamp}</TableCell>
                                <TableCell>{log.details}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {/* Settings Tab */}
              {canManageUsers && (
                <TabsContent value="settings" className="mt-0">
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mx-1 sm:mx-0">
                    <Card>
                      <CardHeader className="pb-3 sm:pb-6">
                        <CardTitle className="flex items-center text-base sm:text-lg">
                          <Settings className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          System Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="user-registration">Allow User Registration</Label>
                          <Switch id="user-registration" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <Switch id="email-notifications" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="activity-logging">Activity Logging</Label>
                          <Switch id="activity-logging" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Role Permissions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-red-600">Admin</Label>
                            <p className="text-sm text-gray-600">Full system access</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-blue-600">Farm Manager</Label>
                            <p className="text-sm text-gray-600">Operations and reports</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-green-600">Worker</Label>
                            <p className="text-sm text-gray-600">Daily tasks only</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}

              {/* Financial Reports Tab */}
              {canViewFinancials && (
                <TabsContent value="financials" className="mt-0">
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-1 sm:mx-0">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">₵45,231</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">₵23,456</div>
                        <p className="text-xs text-muted-foreground">+5.2% from last month</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">₵21,775</div>
                        <p className="text-xs text-muted-foreground">+48.2% from last month</p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Add User Dialog */}
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with appropriate permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="Enter password for login"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Farm Manager">Farm Manager</SelectItem>
                      <SelectItem value="Worker">Worker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
                  Cancel
                </Button>
                <Button onClick={handleAddUser} className="w-full sm:w-auto order-1 sm:order-2">
                  Add User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
            <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update user information and permissions.
                </DialogDescription>
              </DialogHeader>
              {selectedUser && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Full Name</Label>
                    <Input
                      id="edit-name"
                      value={selectedUser.name}
                      onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email Address</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input
                      id="edit-phone"
                      type="tel"
                      value={selectedUser.phone}
                      onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-role">Role</Label>
                    <Select value={selectedUser.role} onValueChange={(value: any) => setSelectedUser({ ...selectedUser, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Farm Manager">Farm Manager</SelectItem>
                        <SelectItem value="Worker">Worker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditUserOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
                  Cancel
                </Button>
                <Button onClick={handleEditUser} className="w-full sm:w-auto order-1 sm:order-2">
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this user? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="w-full sm:w-auto order-2 sm:order-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteUser} className="w-full sm:w-auto order-1 sm:order-2">
                  Delete User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;