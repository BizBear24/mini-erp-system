import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, Check, RefreshCcw, Save } from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ProfilePage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("account");
  const [location] = useLocation();
  
  // Parse the URL to determine which tab to show
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && (tab === 'security' || tab === 'notifications')) {
      setActiveTab(tab);
    }
  }, [location]);

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Handle profile update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Simulating API call
    setTimeout(() => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated.",
        variant: "default",
      });
      setSaving(false);
    }, 1000);
  };

  // Handle password change
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    // Simulating API call
    setTimeout(() => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
        variant: "default",
      });
      setSaving(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="account" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {/* Account Settings */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your personal and business information
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="Your full name" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName" 
                      placeholder="Your company name" 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="role">Role</Label>
                    <Input 
                      id="role" 
                      value={user?.role === "shop_owner" ? "Shop Owner" : "Vendor"}
                      readOnly
                      disabled
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button">Cancel</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Update your password and security preferences
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Password Requirements</AlertTitle>
                    <AlertDescription>
                      Passwords must be at least 8 characters long and include a mix of letters, numbers, and special characters.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-1">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      placeholder="Enter your current password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-1">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      placeholder="Enter your new password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="Confirm your new password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button">Cancel</Button>
                  <Button type="submit" disabled={saving || !currentPassword || !newPassword || !confirmPassword}>
                    {saving ? (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive order updates and important alerts via email
                    </p>
                  </div>
                  <Switch 
                    id="emailNotifications" 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketplaceAlerts">Marketplace Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about new marketplace offerings and price changes
                    </p>
                  </div>
                  <Switch id="marketplaceAlerts" defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="systemAlerts">System Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Important system updates and security notifications
                    </p>
                  </div>
                  <Switch id="systemAlerts" defaultChecked disabled />
                  <span className="text-xs text-muted-foreground ml-2">Required</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={() => {
                  toast({
                    title: "Notification settings updated",
                    description: "Your notification preferences have been saved.",
                  });
                }}>
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}