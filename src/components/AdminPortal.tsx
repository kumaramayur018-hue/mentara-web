import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { useAdminCounselors, useAdminResources, useAdminProducts } from './hooks/useData';
import { Users, Calendar, BookOpen, Settings, Plus, Edit, Trash2, LogOut, ShoppingBag, UserX, AlertTriangle, Key, RefreshCw } from 'lucide-react';
import { toast, Toaster } from 'sonner@2.0.3';
import { AdminUserCard } from './AdminUserCard';
import { SecurePasswordManager } from './SecurePasswordManager';

interface AdminPortalProps {
  onLogout: () => void;
  onBackToApp: () => void;
}

interface Counselor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  availability: string[];
  bio: string;
}

interface Section {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'audio' | 'interactive';
  content: string;
  category: string;
}

interface UserInfo {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
}

export function AdminPortal({ onLogout, onBackToApp }: AdminPortalProps) {
  const { 
    counselors, 
    loading: counselorsLoading, 
    error: counselorsError, 
    addCounselor, 
    deleteCounselor 
  } = useAdminCounselors();
  
  const { 
    resources: sections, 
    loading: sectionsLoading, 
    error: sectionsError, 
    addResource: addSection, 
    deleteResource: deleteSection 
  } = useAdminResources();

  const {
    products,
    loading: productsLoading,
    error: productsError,
    addProduct,
    deleteProduct
  } = useAdminProducts();

  const [userInfo, setUserInfo] = useState<UserInfo>({ totalUsers: 0, activeUsers: 0, newUsersThisMonth: 0 });
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteAction, setDeleteAction] = useState<'ban' | 'soft-delete'>('ban');
  const [banDuration, setBanDuration] = useState<'forever' | 'custom'>('forever');
  const [customBanDays, setCustomBanDays] = useState('30');
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<any>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);

  // Form states
  const [newCounselor, setNewCounselor] = useState({
    name: '',
    specialization: '',
    experience: '',
    rating: 5,
    availability: '',
    bio: '',
    price: 800,
    languages: 'English, Hindi',
    sessionTypes: 'video, audio, chat',
    credentials: '',
    image: ''
  });

  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    author: 'Mentara Team',
    tags: '',
    duration: '',
    image: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Supplements',
    rating: 4.5,
    reviews: 0,
    image: '',
    benefits: '',
    ingredients: '',
    usage: '',
    inStock: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Debug: Log user state changes
  useEffect(() => {
    if (users.length > 0) {
      console.log('[UI STATE] Users updated:',{
        total: users.length,
        active: users.filter((u: any) => !u.isDeleted && !u.isBanned).length,
        banned: users.filter((u: any) => u.isBanned).length,
        deleted: users.filter((u: any) => u.isDeleted).length,
        refreshKey
      });
    }
  }, [users, refreshKey]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      // Add cache busting
      const timestamp = new Date().getTime();
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users?t=${timestamp}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        console.log('[LOAD USERS] Received users from server:', result.users.length);
        console.log('[LOAD USERS] Banned users:', result.users.filter((u: any) => u.isBanned).length);
        console.log('[LOAD USERS] Deleted users:', result.users.filter((u: any) => u.isDeleted).length);
        console.log('[LOAD USERS] Active users:', result.users.filter((u: any) => !u.isBanned && !u.isDeleted).length);
        
        // Log each user's state for debugging
        result.users.forEach((u: any) => {
          if (u.isBanned || u.isDeleted) {
            console.log(`[LOAD USERS] User ${u.email}: isBanned=${u.isBanned}, isDeleted=${u.isDeleted}`);
          }
        });
        
        setUsers(result.users);
        // Force re-render with new data
        setRefreshKey(prev => prev + 1);
        
        // Filter out deleted users for statistics
        const activeUsersList = result.users.filter((u: any) => !u.isDeleted);
        setUserInfo({
          totalUsers: activeUsersList.length,
          activeUsers: activeUsersList.filter((u: any) => u.isOnline).length,
          newUsersThisMonth: activeUsersList.filter((u: any) => {
            const created = new Date(u.createdAt);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          }).length
        });
      } else {
        console.error('[LOAD USERS] Failed to load users:', result.error);
      }
    } catch (error) {
      console.error('[LOAD USERS] Exception while loading users:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleAddCounselor = async () => {
    if (!newCounselor.name || !newCounselor.specialization) {
      setError('Name and specialization are required');
      return;
    }

    try {
      const counselorData = {
        ...newCounselor,
        availability: newCounselor.availability.split(',').map(day => day.trim()),
        specialization: newCounselor.specialization.split(',').map(spec => spec.trim()),
        languages: newCounselor.languages.split(',').map(lang => lang.trim()),
        sessionTypes: newCounselor.sessionTypes.split(',').map(type => type.trim())
      };

      await addCounselor(counselorData);

      setNewCounselor({
        name: '',
        specialization: '',
        experience: '',
        rating: 5,
        availability: '',
        bio: '',
        price: 800,
        languages: 'English, Hindi',
        sessionTypes: 'video, audio, chat',
        credentials: '',
        image: ''
      });
      setError('');
    } catch (err) {
      setError('Failed to add counselor');
    }
  };

  const handleDeleteCounselor = async (id: string) => {
    try {
      await deleteCounselor(id);
    } catch (err) {
      setError('Failed to delete counselor');
    }
  };

  const handleAddSection = async () => {
    if (!newSection.title || !newSection.description) {
      setError('Title and description are required');
      return;
    }

    try {
      const sectionData = {
        ...newSection,
        tags: newSection.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      await addSection(sectionData);

      setNewSection({
        title: '',
        description: '',
        content: '',
        category: '',
        author: 'Mentara Team',
        tags: '',
        duration: '',
        image: ''
      });
      setError('');
    } catch (err) {
      setError('Failed to add section');
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      await deleteSection(id);
    } catch (err) {
      setError('Failed to delete section');
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.description) {
      setError('Name and description are required');
      return;
    }

    try {
      const productData = {
        ...newProduct,
        benefits: newProduct.benefits.split(',').map(b => b.trim()).filter(Boolean)
      };

      await addProduct(productData);

      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: 'Supplements',
        rating: 4.5,
        reviews: 0,
        image: '',
        benefits: '',
        ingredients: '',
        usage: '',
        inStock: true
      });
      setError('');
    } catch (err) {
      setError('Failed to add product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteReason.trim()) {
      setError('Please provide a reason');
      return;
    }

    if (deleteAction === 'ban' && banDuration === 'custom' && (!customBanDays || parseInt(customBanDays) <= 0)) {
      setError('Please enter a valid number of days');
      return;
    }

    setDeletingUser(true);
    setError('');

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      let banUntil = null;
      if (deleteAction === 'ban') {
        if (banDuration === 'forever') {
          banUntil = 'forever';
        } else {
          // Calculate ban end date
          const days = parseInt(customBanDays);
          const banEndDate = new Date();
          banEndDate.setDate(banEndDate.getDate() + days);
          banUntil = banEndDate.toISOString();
        }
      }
      
      console.log(`Processing ${deleteAction} action for user:`, userToDelete.email);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${userToDelete.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            reason: deleteReason,
            action: deleteAction,
            banUntil: banUntil
          }),
        }
      );

      const result = await response.json();
      console.log('Delete/Ban response:', result);

      if (result.success) {
        console.log(`Successfully ${deleteAction === 'ban' ? 'banned' : 'deleted'} user:`, userToDelete.email);
        
        // Show success notification
        toast.success(
          deleteAction === 'ban' 
            ? `✅ User ${userToDelete.name} has been banned` 
            : `✅ User ${userToDelete.name} has been deleted`
        );
        
        // Close dialog and reset form
        setDeleteUserDialog(false);
        setUserToDelete(null);
        setDeleteReason('');
        setDeleteAction('ban');
        setBanDuration('forever');
        setCustomBanDays('30');
        setError('');
        
        // Reload users from server to get updated status
        console.log('Reloading users list...');
        // Delay to ensure backend write completes and propagates
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadUsers();
        console.log('Users list reloaded');
      } else {
        console.error('Delete/Ban failed:', result.error);
        setError(result.error || 'Failed to process request');
      }
    } catch (error) {
      console.error('Delete/Ban error:', error);
      setError('Failed to process request: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDeletingUser(false);
    }
  };

  const handleUnbanUser = async (user: any) => {
    if (!window.confirm(`Are you sure you want to unban ${user.name}?`)) {
      return;
    }

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      console.log('[UNBAN USER] Unbanning user:', user.email);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${user.id}/unban`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      console.log('[UNBAN USER] Response:', result);

      if (result.success) {
        console.log('[UNBAN USER] Successfully unbanned, reloading users...');
        
        // Show success notification
        toast.success(`✅ User ${user.name} has been unbanned`);
        
        // Delay to ensure backend write completes and propagates
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Reload users from server to get updated status
        await loadUsers();
        console.log('[UNBAN USER] Users reloaded');
      } else {
        console.error('[UNBAN USER] Failed:', result.error);
        setError(result.error || 'Failed to unban user');
      }
    } catch (error) {
      console.error('[UNBAN USER] Exception:', error);
      setError('Failed to unban user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const loadUserPassword = async (userId: string) => {
    setLoadingPassword(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${userId}/password`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setCurrentPassword(result.password || 'Not available');
      } else {
        setCurrentPassword('Unable to retrieve');
      }
    } catch (error) {
      setCurrentPassword('Unable to retrieve');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/${userToChangePassword.id}/password`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setChangePasswordDialog(false);
        setUserToChangePassword(null);
        setCurrentPassword('');
        setNewPassword('');
        setError('');
        alert(`Password changed successfully for ${userToChangePassword.name}`);
      } else {
        setError(result.error || 'Failed to change password');
      }
    } catch (error) {
      setError('Failed to change password');
    }
  };

  const handleClearAllUsers = async () => {
    setUsersLoading(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/admin/users/all/clear`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        // Clear local state
        setUsers([]);
        setUserInfo({
          totalUsers: 0,
          activeUsers: 0,
          newUsersThisMonth: 0
        });
        alert(`✅ Successfully cleared all users!\n\nDeleted ${result.deletedCount} users from the system.`);
      } else {
        setError(result.error || 'Failed to clear users');
        alert(`❌ Error: ${result.error || 'Failed to clear users'}`);
      }
    } catch (error) {
      setError('Failed to clear users');
      alert('❌ Network error: Failed to clear users');
    } finally {
      setUsersLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-center" richColors />
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 gap-3">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Logo size="sm" showText={false} />
            <div>
              <h1 className="text-base sm:text-lg">Admin Portal</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Mentara Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Button variant="outline" onClick={onBackToApp} size="sm" className="text-xs sm:text-sm flex-1 sm:flex-none">
              Back to App
            </Button>
            <ThemeToggle />
            <Button variant="outline" onClick={onLogout} size="sm" className="text-xs sm:text-sm">
              <LogOut size={14} className="sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-6">
        {(error || counselorsError || sectionsError || productsError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error || counselorsError || sectionsError || productsError}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2">
              <Settings size={14} className="sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Home</span>
            </TabsTrigger>
            <TabsTrigger value="counselors" className="text-xs sm:text-sm px-2">
              <Users size={14} className="sm:mr-2" />
              <span className="hidden sm:inline">Counselors</span>
              <span className="sm:hidden">Docs</span>
            </TabsTrigger>
            <TabsTrigger value="sections" className="text-xs sm:text-sm px-2">
              <BookOpen size={14} className="sm:mr-2" />
              <span className="hidden sm:inline">Content</span>
              <span className="sm:hidden">Content</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs sm:text-sm px-2">
              <ShoppingBag size={14} className="sm:mr-2" />
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">Shop</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm px-2">
              <Calendar size={14} className="sm:mr-2" />
              <span className="hidden sm:inline">Users</span>
              <span className="sm:hidden">Users</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                  <CardDescription>Registered on platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl">{userInfo.totalUsers}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl text-primary">{userInfo.activeUsers}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>New Users</CardTitle>
                  <CardDescription>This month</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl text-green-600">{userInfo.newUsersThisMonth}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Counselors Available</span>
                  <Badge variant="secondary">{counselors.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Content Sections</span>
                  <Badge variant="secondary">{sections.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Therapeutic Products</span>
                  <Badge variant="secondary">{products.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>System Health</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Counselors Tab */}
          <TabsContent value="counselors" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl">Manage Counselors</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus size={14} className="mr-2" />
                    <span className="hidden sm:inline">Add Counselor</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Counselor</DialogTitle>
                    <DialogDescription>
                      Add a new mental health counselor to the platform.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newCounselor.name}
                        onChange={(e) => setNewCounselor({...newCounselor, name: e.target.value})}
                        placeholder="Dr. Jane Smith"
                      />
                    </div>
                    <div>
                      <Label>Specialization (comma-separated)</Label>
                      <Input
                        value={newCounselor.specialization}
                        onChange={(e) => setNewCounselor({...newCounselor, specialization: e.target.value})}
                        placeholder="Anxiety, Depression, Academic Stress"
                      />
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <Input
                        value={newCounselor.experience}
                        onChange={(e) => setNewCounselor({...newCounselor, experience: e.target.value})}
                        placeholder="5 years"
                      />
                    </div>
                    <div>
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        value={newCounselor.price}
                        onChange={(e) => setNewCounselor({...newCounselor, price: parseInt(e.target.value) || 0})}
                        placeholder="800"
                      />
                    </div>
                    <div>
                      <Label>Languages (comma-separated)</Label>
                      <Input
                        value={newCounselor.languages}
                        onChange={(e) => setNewCounselor({...newCounselor, languages: e.target.value})}
                        placeholder="English, Hindi, Gujarati"
                      />
                    </div>
                    <div>
                      <Label>Session Types (comma-separated)</Label>
                      <Input
                        value={newCounselor.sessionTypes}
                        onChange={(e) => setNewCounselor({...newCounselor, sessionTypes: e.target.value})}
                        placeholder="video, audio, chat"
                      />
                    </div>
                    <div>
                      <Label>Availability (comma-separated)</Label>
                      <Input
                        value={newCounselor.availability}
                        onChange={(e) => setNewCounselor({...newCounselor, availability: e.target.value})}
                        placeholder="Monday, Wednesday, Friday"
                      />
                    </div>
                    <div>
                      <Label>Credentials</Label>
                      <Input
                        value={newCounselor.credentials}
                        onChange={(e) => setNewCounselor({...newCounselor, credentials: e.target.value})}
                        placeholder="M.A. Psychology, Ph.D. Clinical Psychology"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Profile Image URL</Label>
                      <Input
                        value={newCounselor.image}
                        onChange={(e) => setNewCounselor({...newCounselor, image: e.target.value})}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={newCounselor.bio}
                        onChange={(e) => setNewCounselor({...newCounselor, bio: e.target.value})}
                        placeholder="Professional background and approach..."
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddCounselor}>Add Counselor</Button>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {counselors.map(counselor => (
                <Card key={counselor.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{counselor.name}</CardTitle>
                        <CardDescription>
                          {Array.isArray(counselor.specialization) 
                            ? counselor.specialization.join(', ') 
                            : counselor.specialization}
                        </CardDescription>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCounselor(counselor.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Experience:</strong> {counselor.experience}</p>
                      <p className="text-sm"><strong>Rating:</strong> {counselor.rating}/5</p>
                      <p className="text-sm"><strong>Price:</strong> ₹{counselor.price || 800}/session</p>
                      <p className="text-sm"><strong>Languages:</strong> {Array.isArray(counselor.languages) ? counselor.languages.join(', ') : counselor.languages || 'English, Hindi'}</p>
                      <p className="text-sm"><strong>Session Types:</strong> {Array.isArray(counselor.sessionTypes) ? counselor.sessionTypes.join(', ') : counselor.sessionTypes || 'video, audio, chat'}</p>
                      <p className="text-sm"><strong>Available:</strong> {Array.isArray(counselor.availability) ? counselor.availability.join(', ') : counselor.availability}</p>
                      <p className="text-sm">{counselor.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Content Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-lg sm:text-xl">Manage Content</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus size={14} className="mr-2" />
                    <span className="hidden sm:inline">Add Section</span>
                    <span className="sm:hidden">Add</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Content Section</DialogTitle>
                    <DialogDescription>
                      Create new wellness content for users.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={newSection.title}
                        onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                        placeholder="Content title"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newSection.description}
                        onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                        placeholder="Brief description"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={newSection.category}
                          onChange={(e) => setNewSection({...newSection, category: e.target.value})}
                          placeholder="Mindfulness, Academic, etc."
                        />
                      </div>
                      <div>
                        <Label>Duration</Label>
                        <Input
                          value={newSection.duration}
                          onChange={(e) => setNewSection({...newSection, duration: e.target.value})}
                          placeholder="5 min read, 10 min video"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Author</Label>
                        <Input
                          value={newSection.author}
                          onChange={(e) => setNewSection({...newSection, author: e.target.value})}
                          placeholder="Dr. Jane Smith"
                        />
                      </div>
                      <div>
                        <Label>Tags (comma-separated)</Label>
                        <Input
                          value={newSection.tags}
                          onChange={(e) => setNewSection({...newSection, tags: e.target.value})}
                          placeholder="anxiety, stress, meditation"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Image URL</Label>
                      <Input
                        value={newSection.image}
                        onChange={(e) => setNewSection({...newSection, image: e.target.value})}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={newSection.content}
                        onChange={(e) => setNewSection({...newSection, content: e.target.value})}
                        placeholder="Content body..."
                        rows={4}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddSection}>Add Section</Button>
                </DialogContent>
              </Dialog>
            </div>

            {sectionsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading resources...</p>
              </div>
            ) : sections.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="mb-2">No Resources Yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first mental health resource to get started.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map(section => (
                  <Card key={section.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{section.title}</CardTitle>
                          <CardDescription>{section.description}</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="secondary">{section.category}</Badge>
                          {section.duration && (
                            <Badge variant="outline">{section.duration}</Badge>
                          )}
                        </div>
                        <p className="text-sm"><strong>Author:</strong> {section.author || 'Mentara Team'}</p>
                        {section.tags && Array.isArray(section.tags) && section.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {section.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                            {section.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{section.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {section.content ? `${section.content.substring(0, 150)}...` : 'No content preview available'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2>Manage Products</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus size={16} className="mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                      Add therapeutic products for mental wellness.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Product Name</Label>
                      <Input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Ashwagandha Stress Relief"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        placeholder="Natural supplement to reduce stress..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price (₹)</Label>
                        <Input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                          placeholder="599"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <select 
                          className="w-full p-2 border rounded"
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        >
                          <option value="Supplements">Supplements</option>
                          <option value="Books">Books</option>
                          <option value="Journals">Journals</option>
                          <option value="Aromatherapy">Aromatherapy</option>
                          <option value="Meditation Tools">Meditation Tools</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Rating (1-5)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          value={newProduct.rating}
                          onChange={(e) => setNewProduct({...newProduct, rating: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label>Reviews</Label>
                        <Input
                          type="number"
                          value={newProduct.reviews}
                          onChange={(e) => setNewProduct({...newProduct, reviews: Number(e.target.value)})}
                          placeholder="100"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Benefits (comma-separated)</Label>
                      <Textarea
                        value={newProduct.benefits}
                        onChange={(e) => setNewProduct({...newProduct, benefits: e.target.value})}
                        placeholder="Reduces stress, Improves focus, Better sleep"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Ingredients</Label>
                      <Input
                        value={newProduct.ingredients}
                        onChange={(e) => setNewProduct({...newProduct, ingredients: e.target.value})}
                        placeholder="300mg Ashwagandha Extract, Vitamin B12"
                      />
                    </div>
                    <div>
                      <Label>Usage Instructions</Label>
                      <Textarea
                        value={newProduct.usage}
                        onChange={(e) => setNewProduct({...newProduct, usage: e.target.value})}
                        placeholder="Take 1 capsule daily with water"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Image URL</Label>
                      <Input
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="inStock"
                        checked={newProduct.inStock}
                        onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="inStock">In Stock</Label>
                    </div>
                    <Button onClick={handleAddProduct} className="w-full">
                      Add Product
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsLoading ? (
                <p>Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-muted-foreground col-span-3 text-center py-8">No products yet. Add your first product!</p>
              ) : (
                products.map((product: any) => (
                  <Card key={product.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4>{product.name}</h4>
                            <Badge variant="secondary" className="mt-1">{product.category}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 size={16} className="text-destructive" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm"><strong>Price:</strong> ₹{product.price}</p>
                          <p className="text-sm"><strong>Rating:</strong> {product.rating} ⭐ ({product.reviews} reviews)</p>
                          <p className="text-sm">
                            <strong>Status:</strong> {' '}
                            {product.inStock ? (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">In Stock</Badge>
                            ) : (
                              <Badge variant="destructive">Out of Stock</Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2>User Management</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadUsers} disabled={usersLoading}>
                  <RefreshCw size={16} className={usersLoading ? 'animate-spin' : ''} />
                  Refresh Users
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    if (window.confirm('⚠️ WARNING: This will permanently delete ALL registered users from both the frontend and backend. This action CANNOT be undone!\n\nAre you absolutely sure you want to continue?')) {
                      handleClearAllUsers();
                    }
                  }}
                >
                  Clear All Users
                </Button>
              </div>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl">{userInfo.totalUsers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Active Now</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-green-600">{userInfo.activeUsers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">New This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-blue-600">{userInfo.newUsersThisMonth}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Engagement Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl text-purple-600">
                    {userInfo.totalUsers > 0 ? Math.round(userInfo.activeUsers / userInfo.totalUsers * 100) : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Regular Users Table */}
            <Card key={`active-users-${refreshKey}`}>
              <CardHeader>
                <CardTitle>Active Users</CardTitle>
                <CardDescription>Currently active user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading users...</p>
                ) : users.filter((user: any) => !user.isDeleted && !user.isBanned).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No active users found</p>
                ) : (
                  <>
                    {/* Mobile View - Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      {users.filter((user: any) => !user.isDeleted && !user.isBanned).map((user: any) => (
                        <AdminUserCard
                          key={user.id}
                          user={user}
                          variant="active"
                          onChangePassword={(user) => {
                            setUserToChangePassword(user);
                            setChangePasswordDialog(true);
                            loadUserPassword(user.id);
                          }}
                          onBanDelete={(user) => {
                            setUserToDelete(user);
                            setDeleteUserDialog(true);
                          }}
                        />
                      ))}
                    </div>
                    {/* Desktop View - Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Password</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Joined</th>
                            <th className="text-left p-3">Last Active</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter((user: any) => !user.isDeleted && !user.isBanned).map((user: any) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                <p>{user.name}</p>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                              <td className="p-3">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {user.password || '••••••'}
                                </code>
                              </td>
                              <td className="p-3">
                                {user.isOnline ? (
                                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    Online
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">Offline</Badge>
                                )}
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="p-3">
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setUserToChangePassword(user);
                                      setChangePasswordDialog(true);
                                      loadUserPassword(user.id);
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Key size={16} className="mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setDeleteUserDialog(true);
                                    }}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <UserX size={16} className="mr-1" />
                                    Ban/Delete
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Banned Users Table */}
            <Card key={`banned-users-${refreshKey}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive" size={20} />
                  Banned Users
                </CardTitle>
                <CardDescription>Users who are banned from accessing the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading users...</p>
                ) : users.filter((user: any) => user.isBanned).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No banned users</p>
                ) : (
                  <>
                    {/* Mobile View - Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      {users.filter((user: any) => user.isBanned).map((user: any) => (
                        <AdminUserCard
                          key={user.id}
                          user={user}
                          variant="banned"
                          onUnban={handleUnbanUser}
                        />
                      ))}
                    </div>
                    {/* Desktop View - Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Password</th>
                            <th className="text-left p-3">Ban Status</th>
                            <th className="text-left p-3">Banned On</th>
                            <th className="text-left p-3">Reason</th>
                            <th className="text-left p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter((user: any) => user.isBanned).map((user: any) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                <p>{user.name}</p>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                              <td className="p-3">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {user.password || '••••••'}
                                </code>
                              </td>
                              <td className="p-3">
                                <div className="space-y-1">
                                  <Badge variant="destructive">
                                    {user.banUntil === 'forever' ? 'Banned Forever' : 'Temporary Ban'}
                                  </Badge>
                                  {user.banUntil !== 'forever' && (
                                    <p className="text-xs text-muted-foreground">
                                      Until: {new Date(user.banUntil).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {user.bannedAt ? new Date(user.bannedAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-3 text-sm text-muted-foreground max-w-xs">
                                {user.banReason || 'No reason provided'}
                              </td>
                              <td className="p-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnbanUser(user)}
                                  className="text-green-600 hover:text-green-700 border-green-600"
                                >
                                  Unban
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Deleted Users Table */}
            <Card key={`deleted-users-${refreshKey}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 size={20} />
                  Deleted Users
                </CardTitle>
                <CardDescription>Users who have been soft-deleted (can re-register)</CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading users...</p>
                ) : users.filter((user: any) => user.isDeleted && !user.isBanned).length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No deleted users</p>
                ) : (
                  <>
                    {/* Mobile View - Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                      {users.filter((user: any) => user.isDeleted && !user.isBanned).map((user: any) => (
                        <AdminUserCard
                          key={user.id}
                          user={user}
                          variant="deleted"
                        />
                      ))}
                    </div>
                    {/* Desktop View - Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Name</th>
                            <th className="text-left p-3">Email</th>
                            <th className="text-left p-3">Password</th>
                            <th className="text-left p-3">Deleted On</th>
                            <th className="text-left p-3">Reason</th>
                            <th className="text-left p-3">Can Re-register</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.filter((user: any) => user.isDeleted && !user.isBanned).map((user: any) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="p-3">
                                <p className="text-muted-foreground line-through">{user.name}</p>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">{user.email}</td>
                              <td className="p-3">
                                <code className="text-xs bg-muted px-2 py-1 rounded">
                                  {user.password || '••••••'}
                                </code>
                              </td>
                              <td className="p-3 text-sm text-muted-foreground">
                                {user.deletedAt ? new Date(user.deletedAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="p-3 text-sm text-muted-foreground max-w-xs">
                                {user.deleteReason || 'No reason provided'}
                              </td>
                              <td className="p-3">
                                <Badge variant={user.allowRecreation ? 'default' : 'secondary'}>
                                  {user.allowRecreation ? 'Yes' : 'No'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete User Dialog */}
      <Dialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle size={20} />
              User Account Action
            </DialogTitle>
            <DialogDescription>
              Select an action to take on this user account.
            </DialogDescription>
            <DialogDescription>
              Choose an action for <strong>{userToDelete?.name}</strong> ({userToDelete?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Action Selection */}
            <div className="space-y-3">
              <Label>Select Action Type *</Label>
              <div className="space-y-3">
                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    deleteAction === 'ban' 
                      ? 'border-destructive bg-destructive/5' 
                      : 'border-border hover:border-destructive/50'
                  }`}
                  onClick={() => setDeleteAction('ban')}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={deleteAction === 'ban'}
                      onChange={() => setDeleteAction('ban')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive">Ban User (Prevent Login)</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        User cannot login again. Account is locked. No recreation allowed.
                      </p>
                    </div>
                  </div>
                  
                  {/* Ban Duration Options */}
                  {deleteAction === 'ban' && (
                    <div className="ml-7 mt-4 space-y-3">
                      <Label className="text-sm">Ban Duration</Label>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="ban-forever"
                            checked={banDuration === 'forever'}
                            onChange={() => setBanDuration('forever')}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="ban-forever" className="text-sm font-normal cursor-pointer">
                            Permanent Ban (Forever)
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="ban-custom"
                            checked={banDuration === 'custom'}
                            onChange={() => setBanDuration('custom')}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="ban-custom" className="text-sm font-normal cursor-pointer">
                            Temporary Ban (Custom Duration)
                          </Label>
                        </div>
                        {banDuration === 'custom' && (
                          <div className="ml-6 mt-2">
                            <Label className="text-xs">Number of Days</Label>
                            <Input
                              type="number"
                              min="1"
                              value={customBanDays}
                              onChange={(e) => setCustomBanDays(e.target.value)}
                              placeholder="30"
                              className="w-32 mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    deleteAction === 'soft-delete' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setDeleteAction('soft-delete')}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      checked={deleteAction === 'soft-delete'}
                      onChange={() => setDeleteAction('soft-delete')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">Delete Account (Allow Recreation)</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Account is deleted with reason shown. User can recreate account with same email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <Label htmlFor="deleteReason">
                Reason {deleteAction === 'ban' ? 'for Ban' : 'for Deletion'} *
              </Label>
              <Textarea
                id="deleteReason"
                placeholder={
                  deleteAction === 'ban' 
                    ? "Enter the reason for banning this user (will be shown to user)..." 
                    : "Enter the reason for account deletion (will be shown to user)..."
                }
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {deleteAction === 'ban' ? (
                  <>
                    The user will see: "Your account has been banned by administrator: [your reason]. 
                    {banDuration === 'forever' ? ' This ban is permanent.' : ` Ban expires in ${customBanDays} days.`}"
                  </>
                ) : (
                  "The user will see: \"Account deleted by administrator: [your reason]. You may recreate your account.\""
                )}
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteUserDialog(false);
                setUserToDelete(null);
                setDeleteReason('');
                setDeleteAction('ban');
                setBanDuration('forever');
                setCustomBanDays('30');
                setError('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={deleteAction === 'ban' ? 'destructive' : 'default'}
              onClick={handleDeleteUser}
              disabled={!deleteReason.trim() || deletingUser}
            >
              <UserX size={16} className="mr-2" />
              {deletingUser ? 'Processing...' : (deleteAction === 'ban' ? 'Ban User' : 'Delete Account')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Secure Password Management */}
      {userToChangePassword && (
        <SecurePasswordManager
          open={changePasswordDialog}
          onOpenChange={(open) => {
            setChangePasswordDialog(open);
            if (!open) {
              setUserToChangePassword(null);
              setCurrentPassword('');
              setNewPassword('');
            }
          }}
          user={userToChangePassword}
          adminId="admin-temp-id"
        />
      )}
    </div>
  );
}