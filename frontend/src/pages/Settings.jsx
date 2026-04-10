import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
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
  Moon,
  Globe,
  Save,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const { user, updateUserRole } = useAuth();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    language: 'en',
  });

  const handleRoleChange = async (role) => {
    setSaving(true);
    try {
      await updateUserRole(role);
      toast.success(`Role updated to ${role}`);
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
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
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Role Section (Demo) */}
          <Card className="animate-fade-in stagger-1" data-testid="role-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Role (Demo Mode)
              </CardTitle>
              <CardDescription>Switch roles to explore different dashboards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Label>Current Role:</Label>
                <Select
                  value={user?.role}
                  onValueChange={handleRoleChange}
                  disabled={saving}
                >
                  <SelectTrigger className="w-40" data-testid="role-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Note: In a real app, role changes would require admin approval.
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

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} data-testid="save-settings-btn">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
