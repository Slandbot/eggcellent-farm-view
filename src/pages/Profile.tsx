import { useState } from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useUserRole } from "@/contexts/UserRoleContext"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Bell, 
  Eye, 
  Lock, 
  Camera,
  Save,
  Edit,
  Settings,
  Activity
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  dateOfBirth: string
  joinDate: string
  bio: string
  avatar: string
  role: string
  department: string
  employeeId: string
}

interface SecuritySettings {
  twoFactorEnabled: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  activityAlerts: boolean
  weeklyReports: boolean
  monthlyReports: boolean
}

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { userRole } = useUserRole()
  
  // Mock user profile data
  const [profile, setProfile] = useState<UserProfile>({
    id: "USR001",
    name: "John Doe",
    email: "john.doe@farmtrack.com",
    phone: "+233 24 123 4567",
    address: "123 Farm Road, Accra, Ghana",
    dateOfBirth: "1985-06-15",
    joinDate: "2023-01-15",
    bio: "Experienced farm manager with over 10 years in poultry management. Passionate about sustainable farming practices and technology integration.",
    avatar: "/placeholder.svg",
    role: userRole || "Farm Manager",
    department: "Operations",
    employeeId: "EMP2023001"
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    activityAlerts: true,
    weeklyReports: true,
    monthlyReports: false
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)

  const handleSaveProfile = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const updateSecuritySetting = (key: keyof SecuritySettings, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Farm Manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Worker": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing overflow-y-auto">
          <div className="responsive-flex items-start sm:items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="responsive-title text-foreground">Profile Settings</h1>
              <p className="responsive-subtitle">Manage your account information and preferences</p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>
                        Update your personal details and profile information
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                    >
                      {isEditing ? (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture Section */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.avatar} alt={profile.name} />
                        <AvatarFallback className="text-lg">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{profile.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getRoleBadgeColor(profile.role)}>
                          {profile.role}
                        </Badge>
                        <Badge variant="outline">{profile.department}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Employee ID: {profile.employeeId}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile Form */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={isEditing ? editedProfile.name : profile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={isEditing ? editedProfile.email : profile.email}
                          onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={isEditing ? editedProfile.phone : profile.phone}
                          onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={isEditing ? editedProfile.dateOfBirth : profile.dateOfBirth}
                          onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          value={isEditing ? editedProfile.address : profile.address}
                          onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                          disabled={!isEditing}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={isEditing ? editedProfile.bio : profile.bio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Join Date</Label>
                      <p className="text-sm">{new Date(profile.joinDate).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                      <p className="text-sm">Today at 9:30 AM</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-muted-foreground">Session Timeout</Label>
                      <p className="text-sm">8 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account security and authentication preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(checked) => updateSecuritySetting('twoFactorEnabled', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Password & Authentication</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Eye className="h-4 w-4 mr-2" />
                        View Active Sessions
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Privacy Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-sm font-medium">Profile Visibility</Label>
                          <p className="text-sm text-muted-foreground">
                            Control who can see your profile information
                          </p>
                        </div>
                        <Select defaultValue="team">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="team">Team Only</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose how you want to receive notifications and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Communication Preferences</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.emailNotifications}
                        onCheckedChange={(checked) => updateSecuritySetting('emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive important alerts via SMS
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.smsNotifications}
                        onCheckedChange={(checked) => updateSecuritySetting('smsNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Push Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications in your browser
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.pushNotifications}
                        onCheckedChange={(checked) => updateSecuritySetting('pushNotifications', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Activity Notifications</h4>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Farm Activity Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about important farm activities
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.activityAlerts}
                        onCheckedChange={(checked) => updateSecuritySetting('activityAlerts', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly performance summaries
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.weeklyReports}
                        onCheckedChange={(checked) => updateSecuritySetting('weeklyReports', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Monthly Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive detailed monthly analytics
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.monthlyReports}
                        onCheckedChange={(checked) => updateSecuritySetting('monthlyReports', checked)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Schedule</h4>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="quiet-hours-start">Quiet Hours Start</Label>
                        <Input
                          id="quiet-hours-start"
                          type="time"
                          defaultValue="22:00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quiet-hours-end">Quiet Hours End</Label>
                        <Input
                          id="quiet-hours-end"
                          type="time"
                          defaultValue="07:00"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default Profile