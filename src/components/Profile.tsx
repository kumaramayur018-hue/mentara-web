import React, { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner@2.0.3";
import { 
  User, Settings, Bell, Shield, HelpCircle, LogOut, 
  Calendar, Award, Target, TrendingUp, Edit, Camera, Upload, Check, ArrowLeft, Package
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
}

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first mood check-in',
    icon: '🎯',
    earned: true
  },
  {
    id: '2',
    title: 'Consistency Champion',
    description: 'Log mood for 7 consecutive days',
    icon: '📅',
    earned: true
  },
  {
    id: '3',
    title: 'Community Helper',
    description: 'Support 5 community members',
    icon: '🤝',
    earned: false,
    progress: 60
  },
  {
    id: '4',
    title: 'Mindfulness Master',
    description: 'Complete 30 meditation sessions',
    icon: '🧘',
    earned: false,
    progress: 40
  },
  {
    id: '5',
    title: 'Wellness Warrior',
    description: 'Use app for 30 consecutive days',
    icon: '⭐',
    earned: false,
    progress: 83
  }
];

const weeklyGoals = [
  { title: 'Daily Mood Check-ins', current: 5, target: 7, unit: 'days' },
  { title: 'Meditation Minutes', current: 45, target: 60, unit: 'minutes' },
  { title: 'Community Interactions', current: 3, target: 5, unit: 'posts' },
  { title: 'Resource Reading', current: 2, target: 3, unit: 'articles' }
];

interface ProfileProps {
  onBack?: () => void;
  onNavigateToOrders?: () => void;
  onNavigateToBookedSessions?: () => void;
}

export function Profile({ onBack, onNavigateToOrders, onNavigateToBookedSessions }: ProfileProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    university: '',
    profileImage: ''
  });
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    communityUpdates: true,
    sessionReminders: true,
    weeklyReports: false
  });

  // Load user profile data
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/profile/${user?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setProfileData({
          name: result.profile.name || '',
          email: result.profile.email || '',
          university: result.profile.university || '',
          profileImage: result.profile.profileImage || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/profile/${user?.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setEditMode(false);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user?.id || '');

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a40ffbb5/upload/profile-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setProfileData(prev => ({ ...prev, profileImage: result.imageUrl }));
        toast.success('Profile picture updated!');
      } else {
        toast.error(result.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Back Button */}
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="mb-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            {profileData.profileImage ? (
              <img 
                src={profileData.profileImage} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <Avatar className="w-24 h-24 bg-primary text-primary-foreground text-2xl">
                {profileData.name ? profileData.name.charAt(0).toUpperCase() : user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            )}
            <label 
              htmlFor="profile-image-upload" 
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
            >
              {uploadingImage ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Camera size={14} />
              )}
            </label>
            <input
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
          <div>
            <h2>{profileData.name || user?.name || 'User'}</h2>
            <p className="text-muted-foreground">{profileData.email || user?.email}</p>
            <Badge variant="secondary" className="mt-2">Level 3 • Wellness Explorer</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Awards</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 text-center">
                <Calendar className="mx-auto text-blue-500 mb-2" size={24} />
                <p className="text-2xl">28</p>
                <p className="text-sm text-muted-foreground">Days Active</p>
              </Card>
              <Card className="p-4 text-center">
                <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
                <p className="text-2xl">4.2</p>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Completed mood check-in</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Helped a community member</p>
                    <p className="text-xs text-muted-foreground">Yesterday</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">Read "Managing Exam Stress"</p>
                    <p className="text-xs text-muted-foreground">2 days ago</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* My Orders */}
            {onNavigateToOrders && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3>My Orders</h3>
                  <Button variant="ghost" size="sm" onClick={onNavigateToOrders}>
                    View All
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onNavigateToOrders}
                >
                  <Package size={16} className="mr-2" />
                  Track your therapeutic product orders
                </Button>
              </Card>
            )}

            {/* Booked Sessions */}
            {onNavigateToBookedSessions && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3>Booked Sessions</h3>
                  <Button variant="ghost" size="sm" onClick={onNavigateToBookedSessions}>
                    View All
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={onNavigateToBookedSessions}
                >
                  <Calendar size={16} className="mr-2" />
                  View your counseling session bookings
                </Button>
              </Card>
            )}

            {/* Personal Insights */}
            <Card className="p-6">
              <h3 className="mb-4">Personal Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
                  <h4 className="text-sm mb-2">📈 Mood Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    Your mood has improved by 15% this month compared to last month!
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="text-sm mb-2">🏆 Streak Achievement</h4>
                  <p className="text-sm text-muted-foreground">
                    You're on a 7-day mood tracking streak. Keep it up!
                  </p>
                </div>
                <div className="p-4 bg-accent rounded-lg border border-border">
                  <h4 className="text-sm mb-2">💡 Recommendation</h4>
                  <p className="text-sm text-muted-foreground">
                    Based on your activity, try the "Morning Meditation" resource.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="text-center">
              <h3>Your Achievements</h3>
              <p className="text-muted-foreground">Keep up the great work on your wellness journey!</p>
            </div>

            <div className="space-y-4">
              {achievements.map(achievement => (
                <Card key={achievement.id} className={`p-4 ${achievement.earned ? 'bg-green-50 border-green-200' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      achievement.earned ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {achievement.earned ? achievement.icon : '🔒'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                      {!achievement.earned && achievement.progress && (
                        <div className="space-y-1">
                          <Progress value={achievement.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">{achievement.progress}% complete</p>
                        </div>
                      )}
                    </div>
                    {achievement.earned && (
                      <Award className="text-green-600" size={20} />
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 text-center">
              <Award className="mx-auto text-yellow-500 mb-3" size={48} />
              <h3 className="mb-2">Level 3: Wellness Explorer</h3>
              <p className="text-muted-foreground mb-4">Complete 2 more achievements to reach Level 4</p>
              <Progress value={60} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">3 of 5 achievements earned</p>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3>Weekly Goals</h3>
              <Button variant="outline" size="sm">
                <Edit size={16} className="mr-1" />
                Customize
              </Button>
            </div>

            <div className="space-y-4">
              {weeklyGoals.map((goal, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm">{goal.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      {goal.current}/{goal.target} {goal.unit}
                    </span>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {goal.target - goal.current} more {goal.unit} to reach your goal
                  </p>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <h3 className="mb-4">Goal Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-800 dark:text-green-200">🎯 You're ahead of schedule on mood check-ins!</p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">⚡ Consider increasing meditation time gradually</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">📚 You're doing great with resource engagement</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Account Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <User size={20} />
                <h3>Account Information</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm mb-2 block">Full Name</label>
                  <Input 
                    value={profileData.name} 
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!editMode} 
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="text-sm mb-2 block">Email</label>
                  <Input 
                    value={profileData.email} 
                    disabled 
                    className="opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-sm mb-2 block">University/College</label>
                  <Input 
                    value={profileData.university} 
                    onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                    disabled={!editMode}
                    placeholder="Enter your university"
                  />
                </div>
                {editMode ? (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setEditMode(false);
                        loadProfile(); // Reset changes
                      }}
                      disabled={saving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check size={16} className="mr-1" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setEditMode(true)}
                  >
                    <Edit size={16} className="mr-1" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bell size={20} />
                <h3>Notifications</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Daily Reminders</p>
                    <p className="text-xs text-muted-foreground">Get reminded to check in daily</p>
                  </div>
                  <Switch 
                    checked={notifications.dailyReminders}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, dailyReminders: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Community Updates</p>
                    <p className="text-xs text-muted-foreground">New posts and replies</p>
                  </div>
                  <Switch 
                    checked={notifications.communityUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, communityUpdates: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Session Reminders</p>
                    <p className="text-xs text-muted-foreground">Upcoming counselor sessions</p>
                  </div>
                  <Switch 
                    checked={notifications.sessionReminders}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, sessionReminders: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Weekly Reports</p>
                    <p className="text-xs text-muted-foreground">Summary of your progress</p>
                  </div>
                  <Switch 
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Privacy & Security */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={20} />
                <h3>Privacy & Security</h3>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Download My Data
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Settings
                </Button>
              </div>
            </Card>

            {/* App Settings */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings size={20} />
                <h3>App Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Theme</p>
                    <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </Card>

            {/* Account Actions */}
            <Card className="p-6">
              <div className="space-y-3">
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  onClick={signOut}
                >
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </Card>

            {/* Support */}
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <HelpCircle size={20} />
                <h3>Support</h3>
              </div>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Help Center
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Contact Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Terms of Service
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Privacy Policy
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}