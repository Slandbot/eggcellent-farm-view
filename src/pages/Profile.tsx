import { useState, useEffect, useCallback } from "react"
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useUserRole } from "@/contexts/UserRoleContext"
import { authService } from "@/services/authService"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
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
  Activity,
  Loader2,
  Trash2
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
  [key: string]: boolean
}

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, userRole, changePassword, updateUser, isLoading } = useUserRole()
  const { toast } = useToast()

  // Dialogs & forms
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Profile state
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    joinDate: new Date().toISOString(),
    bio: "",
    avatar: "",
    role: "Worker",
    department: "",
    employeeId: ""
  })

  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Security & notifications
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    activityAlerts: true,
    weeklyReports: true,
    monthlyReports: false
  })
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [hasSettingsChanged, setHasSettingsChanged] = useState(false)

  // Avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Initialize profile
  useEffect(() => {
    if (isLoading) return
    if (!user) {
      setProfileLoading(false)
      return
    }

    // Initialize immediately from context
    // Get extended user data (may include avatar and other fields)
    const extendedUser = user as any
    const initialProfile: UserProfile = {
      id: user.id || "",
      name: user.name || "",
      email: user.email || "",
      phone: extendedUser.phone || "",
      address: extendedUser.address || "",
      dateOfBirth: extendedUser.dateOfBirth || "",
      joinDate: user.createdAt || new Date().toISOString(),
      bio: extendedUser.bio || "",
      avatar: extendedUser.avatar || user.avatar || "",
      role: user.role || userRole || "Worker",
      department: extendedUser.department || "",
      employeeId: user.id || ""
    }

    setProfile(initialProfile)
    setEditedProfile(initialProfile)
    setProfileLoading(false)

    // Fetch full profile from API
    const fetchFullProfile = async () => {
      try {
        setProfileError(null)
        const fullProfile = await authService.getProfile()
        
        // The getProfile now returns extended user data with all fields
        const apiProfile = fullProfile as any
        
        setProfile(prev => ({
          ...prev,
          // Update all fields from API response
          id: apiProfile.id || prev.id,
          name: apiProfile.name || prev.name,
          email: apiProfile.email || prev.email,
          phone: apiProfile.phone ?? prev.phone ?? "",
          address: apiProfile.address ?? prev.address ?? "",
          dateOfBirth: apiProfile.dateOfBirth ?? prev.dateOfBirth ?? "",
          bio: apiProfile.bio ?? prev.bio ?? "",
          avatar: apiProfile.avatar ?? prev.avatar ?? "",
          department: apiProfile.department ?? prev.department ?? "",
          role: apiProfile.role || prev.role,
          joinDate: apiProfile.createdAt || apiProfile.joinDate || prev.joinDate,
          employeeId: apiProfile.id || apiProfile.employeeId || prev.employeeId,
        }))
      } catch (error) {
        console.error('Failed to fetch full profile:', error)
        setProfileError('Some profile data could not be loaded')
      }
    }

    fetchFullProfile()
  }, [isLoading, user, userRole])

  // Sync editedProfile when profile changes
  useEffect(() => {
    setEditedProfile(profile)
  }, [profile])

  // Track settings changes
  useEffect(() => {
    setHasSettingsChanged(true)
  }, [securitySettings])

  const handleSaveProfile = async () => {
    if (isSaving) return
    setIsSaving(true)
    setProfileError(null)

    try {
      const updateData = {
        name: editedProfile.name,
        email: editedProfile.email,
        phone: editedProfile.phone,
        address: editedProfile.address,
        dateOfBirth: editedProfile.dateOfBirth,
        bio: editedProfile.bio,
        department: editedProfile.department,
      }

      await updateUser(updateData)
      
      // Refresh profile from API to get updated data
      try {
        const refreshedProfile = await authService.getProfile()
        const apiProfile = refreshedProfile as any
        
        setProfile(prev => ({
          ...prev,
          name: apiProfile.name || updateData.name || prev.name,
          email: apiProfile.email || updateData.email || prev.email,
          phone: apiProfile.phone || updateData.phone || prev.phone,
          address: apiProfile.address || updateData.address || prev.address,
          dateOfBirth: apiProfile.dateOfBirth || updateData.dateOfBirth || prev.dateOfBirth,
          bio: apiProfile.bio || updateData.bio || prev.bio,
          department: apiProfile.department || updateData.department || prev.department,
          avatar: apiProfile.avatar || prev.avatar,
        }))
      } catch (refreshError) {
        // If refresh fails, just update with the data we sent
        setProfile(prev => ({ ...prev, ...updateData }))
      }
      
      setIsEditing(false)
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update profile"
      setProfileError(msg)
      toast({
        title: "Update failed",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleChangePassword = async () => {
    setPasswordError(null)

    // New password and confirmation are always required
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError("New password and confirmation are required")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters")
      return
    }

    // Current password is optional - if empty, we're setting initial password
    // The backend will handle this case

    try {
      await changePassword(passwordData.currentPassword || "", passwordData.newPassword)
      setIsChangePasswordOpen(false)
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      toast({
        title: "Password set",
        description: passwordData.currentPassword 
          ? "Your password has been successfully updated."
          : "Your password has been set successfully.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password"
      setPasswordError(errorMessage)
      
      // Show toast with the error message (especially for "Password not set" case)
      if (errorMessage.includes("Password not set") || errorMessage.includes("passwordHash")) {
        toast({
          title: "Password Required",
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
  }

  const updateSecuritySetting = (key: keyof SecuritySettings, value: boolean) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSecuritySettings = async () => {
    if (isSavingSettings) return
    setIsSavingSettings(true)

    try {
      await authService.updateSecuritySettings(securitySettings)
      setHasSettingsChanged(false)
      toast({
        title: "Preferences saved",
        description: "Your notification settings have been updated.",
      })
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const result = await authService.uploadAvatar(formData)
      setProfile(prev => ({ ...prev, avatar: result.avatar }))
      toast({ title: "Avatar updated", description: "Your profile picture has been changed." })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not upload image"
      toast({ title: "Upload failed", description: errorMessage, variant: "destructive" })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!profile.avatar) return

    setUploadingAvatar(true)
    try {
      await authService.deleteAvatar()
      setProfile(prev => ({ ...prev, avatar: "" }))
      toast({ title: "Avatar removed", description: "Your profile picture has been removed." })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not delete avatar"
      toast({ title: "Delete failed", description: errorMessage, variant: "destructive" })
    } finally {
      setUploadingAvatar(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Manager": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Worker": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (isLoading || profileLoading) {
    return (
      <div className="h-screen bg-background flex overflow-hidden">
        <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col">
          <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 responsive-container responsive-spacing overflow-y-auto flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen bg-background flex overflow-hidden">
        <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col">
          <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 responsive-container responsive-spacing overflow-y-auto flex items-center justify-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col">
        <AppHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 responsive-container responsive-spacing overflow-y-auto">
          <div className="responsive-flex items-start sm:items-center justify-between mb-6">
            <div>
              <h1 className="responsive-title text-foreground">Profile Settings</h1>
              <p className="responsive-subtitle">Manage your account information and preferences</p>
            </div>
          </div>

          {profileError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{profileError}</AlertDescription>
            </Alert>
          )}

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
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>Update your personal details</CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                    >
                      {isEditing ? "Cancel" : "Edit Profile"}
                      <Edit className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage 
                          src={profile.avatar || undefined} 
                          alt={profile.name}
                          onError={(e) => {
                            // Hide broken image, show fallback
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <AvatarFallback className="text-lg">
                          {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="absolute -bottom-2 -right-2 flex gap-1">
                          <label className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition">
                            {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleAvatarChange}
                              disabled={uploadingAvatar}
                            />
                          </label>
                          {profile.avatar && (
                            <button
                              type="button"
                              onClick={handleDeleteAvatar}
                              disabled={uploadingAvatar}
                              className="h-8 w-8 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center cursor-pointer hover:bg-destructive/90 transition disabled:opacity-50"
                              title="Remove avatar"
                            >
                              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{profile.name || <Skeleton className="h-6 w-32" />}</h3>
                      <div className="flex gap-2">
                        <Badge className={getRoleBadgeColor(profile.role)}>{profile.role}</Badge>
                        {profile.department && <Badge variant="outline">{profile.department}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">ID: {profile.employeeId}</p>
                    </div>
                  </div>

                  <Separator />

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
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          value={isEditing ? editedProfile.email : profile.email}
                          onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          className="pl-10"
                          value={isEditing ? editedProfile.phone : profile.phone}
                          onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="dob"
                          type="date"
                          className="pl-10"
                          value={isEditing ? editedProfile.dateOfBirth : profile.dateOfBirth}
                          onChange={(e) => setEditedProfile({ ...editedProfile, dateOfBirth: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="address"
                          className="pl-10"
                          value={isEditing ? editedProfile.address : profile.address}
                          onChange={(e) => setEditedProfile({ ...editedProfile, address: e.target.value })}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        placeholder="Tell us about yourself..."
                        value={isEditing ? editedProfile.bio : profile.bio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <Label className="text-sm text-muted-foreground">Join Date</Label>
                      <p className="font-medium">{format(new Date(profile.joinDate), "PPP")}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Status</Label>
                      <Badge className="bg-green-100 text-green-800 mt-1">Active</Badge>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Last Login</Label>
                      <p className="font-medium">
                        {user.lastLogin ? format(new Date(user.lastLogin), "PPp") : "Never"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Session Timeout</Label>
                      <p className="font-medium">8 hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Manage authentication and privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Extra security layer</p>
                    </div>
                    <Switch
                      checked={securitySettings.twoFactorEnabled}
                      onCheckedChange={(v) => updateSecuritySetting('twoFactorEnabled', v)}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => setIsChangePasswordOpen(true)}>
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="h-4 w-4 mr-2" />
                      View Active Sessions
                    </Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Who can see your info</p>
                    </div>
                    <Select defaultValue="team">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasSettingsChanged && (
                    <div className="flex justify-end pt-4 border-t">
                      <Button onClick={saveSecuritySettings} disabled={isSavingSettings}>
                        {isSavingSettings ? "Saving..." : "Save Security Settings"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you receive updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Communication */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Communication</h4>
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications' },
                      { key: 'smsNotifications', label: 'SMS Notifications' },
                      { key: 'pushNotifications', label: 'Push Notifications' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label>{label}</Label>
                          <p className="text-sm text-muted-foreground">
                            {label.includes('Email') && "Receive updates via email"}
                            {label.includes('SMS') && "Critical alerts via text"}
                            {label.includes('Push') && "Browser notifications"}
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings[key as keyof SecuritySettings]}
                          onCheckedChange={(v) => updateSecuritySetting(key as keyof SecuritySettings, v)}
                        />
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Activity */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Activity & Reports</h4>
                    {[
                      { key: 'activityAlerts', label: 'Farm Activity Alerts' },
                      { key: 'weeklyReports', label: 'Weekly Reports' },
                      { key: 'monthlyReports', label: 'Monthly Reports' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label>{label}</Label>
                          <p className="text-sm text-muted-foreground">
                            {label.includes('Activity') && "Real-time farm updates"}
                            {label.includes('Weekly') && "Performance summary"}
                            {label.includes('Monthly') && "Detailed analytics"}
                          </p>
                        </div>
                        <Switch
                          checked={securitySettings[key as keyof SecuritySettings]}
                          onCheckedChange={(v) => updateSecuritySetting(key as keyof SecuritySettings, v)}
                        />
                      </div>
                    ))}
                  </div>

                  {hasSettingsChanged && (
                    <div className="flex justify-end pt-6 border-t">
                      <Button onClick={saveSecuritySettings} disabled={isSavingSettings}>
                        {isSavingSettings ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Notification Preferences"
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              {passwordData.currentPassword 
                ? "Enter your current and new password"
                : "Set your password (leave current password empty if you don't have one)"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="current">Current Password (Optional)</Label>
              <Input
                id="current"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Leave empty if setting initial password"
              />
              <p className="text-xs text-muted-foreground">
                If you don't have a password set, leave this field empty.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsChangePasswordOpen(false)
              setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
              setPasswordError(null)
            }}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile