import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  User,
  Mail,
  Shield,
  Bell,
  Globe,
  Save,
  School,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Settings() {
  const { user, setUser } = useAuth();

  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    language: 'en',
  });

  // Profile fields – pre-filled from logged-in user
  const [profileFields, setProfileFields] = useState({
    name: user?.name || '',
    class_name: user?.class_name || '',
    division: user?.division || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await axios.put(
        `${API}/auth/profile`,
        {
          name: profileFields.name,
          class_name: profileFields.class_name || null,
          division: profileFields.division || null,
        },
        { withCredentials: true }
      );
      // Update in-memory user context if setUser is available
      if (setUser) setUser(res.data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err?.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveSettings = () => {
    toast.success('Settings saved successfully');
  };

  return (
    <div className="min-h-screen bg-background" data-testid="settings-page">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="animate-fade-in" data-testid="profile-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.picture} alt={user?.name} />
                  <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold">{user?.name}</h3>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                  <Badge variant="outline" className="capitalize">
                    <Shield className="w-3 h-3 mr-1" />
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Editable name */}
              <div className="space-y-2">
                <Label htmlFor="settings-name">Display Name</Label>
                <Input
                  id="settings-name"
                  value={profileFields.name}
                  onChange={e => setProfileFields({ ...profileFields, name: e.target.value })}
                  placeholder="Your full name"
                  data-testid="settings-name-input"
                />
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full sm:w-auto"
                data-testid="save-name-btn"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Name
              </Button>
            </CardContent>
          </Card>

          {/* Class & Division — visible to students AND teachers */}
          <Card className="animate-fade-in" data-testid="class-division-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5 text-primary" />
                Class &amp; Division
              </CardTitle>
              <CardDescription>
                {user?.role === 'teacher'
                  ? 'Set your default class and division. New lectures will automatically be assigned here.'
                  : 'Your assigned class and division determines which lectures you can access.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Current values info box */}
              {(user?.class_name || user?.division) && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    Currently set to: <strong>{user?.class_name || 'Not set'}</strong> / Division <strong>{user?.division || 'Not set'}</strong>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-class">
                    Class Name
                  </Label>
                  <Input
                    id="settings-class"
                    value={profileFields.class_name}
                    onChange={e => setProfileFields({ ...profileFields, class_name: e.target.value })}
                    placeholder="e.g., B.Tech IT"
                    data-testid="settings-class-input"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    e.g. "B.Tech IT", "MCA", "BSc CS"
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-division">
                    Division
                  </Label>
                  <Input
                    id="settings-division"
                    value={profileFields.division}
                    onChange={e => setProfileFields({ ...profileFields, division: e.target.value })}
                    placeholder="e.g., A"
                    data-testid="settings-division-input"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    e.g. "A", "B", "C"
                  </p>
                </div>
              </div>

              {user?.role === 'teacher' && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 space-y-1">
                  <p className="font-bold">How teacher isolation works:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                    <li>You only see lectures <em>you</em> created.</li>
                    <li>Students only see lectures assigned to their class &amp; division.</li>
                    <li>Accessing another teacher's lecture ID returns 403.</li>
                  </ul>
                </div>
              )}

              <Button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="w-full sm:w-auto"
                data-testid="save-class-division-btn"
              >
                {savingProfile ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Class &amp; Division
              </Button>
            </CardContent>
          </Card>

          {/* Role Section */}
          <Card className="animate-fade-in stagger-1" data-testid="role-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Role
              </CardTitle>
              <CardDescription>Your current account role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 rounded-lg bg-primary/10 text-accentText font-medium capitalize">
                  {user?.role || 'student'}
                </div>
                <p className="text-sm text-muted-foreground">
                  {user?.role === 'teacher'
                    ? 'You can create lectures and quizzes.'
                    : user?.role === 'admin'
                      ? 'You have full system access.'
                      : 'You can attend lectures and take quizzes.'}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Role changes can only be made by an administrator.
              </p>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="animate-fade-in stagger-2" data-testid="notifications-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Manage how you receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about new lectures and quizzes</p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                  data-testid="push-notifications-switch"
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive weekly progress reports via email</p>
                </div>
                <Switch
                  checked={settings.emailUpdates}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailUpdates: checked })}
                  data-testid="email-updates-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* Language */}
          <Card className="animate-fade-in stagger-3" data-testid="language-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Language
              </CardTitle>
              <CardDescription>Choose your preferred language</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label>Display Language:</Label>
                <Select
                  value={settings.language}
                  onValueChange={(val) => setSettings({ ...settings, language: val })}
                >
                  <SelectTrigger className="w-40" data-testid="language-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Other Settings */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} data-testid="save-settings-btn">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
