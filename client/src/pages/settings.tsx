import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-context";
import { Settings as SettingsIcon, User, Building, Users, BarChart3, Mail } from "lucide-react";

export default function Settings() {
  const { user, organizations } = useAuth();
  const orgId = organizations?.[0]?.id;
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ["/api/usage", orgId],
    enabled: !!orgId,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Profile update logic would go here
    console.log("Profile update:", profileForm);
  };

  const handleInviteTeammate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Team invitation logic would go here
    console.log("Invite teammate");
  };

  const usage = usageData?.usage || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-slate-600">Manage your account and organization preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={user?.role === 'OWNER' ? 'default' : 'secondary'}>
                      {user?.role === 'OWNER' ? 'Business Owner' : 'Content Creator'}
                    </Badge>
                  </div>
                </div>

                <Button type="submit">Update Profile</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Organization Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {organizations?.[0] ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Organization Name</Label>
                    <Input value={organizations[0].name} readOnly />
                  </div>

                  <div className="space-y-2">
                    <Label>URL Slug</Label>
                    <Input value={organizations[0].slug} readOnly />
                    <p className="text-sm text-slate-500">
                      Your organization URL: reviewscope.com/{organizations[0].slug}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Created</Label>
                    <Input 
                      value={new Date(organizations[0].createdAt).toLocaleDateString()} 
                      readOnly 
                    />
                  </div>

                  <Button variant="outline">Edit Organization</Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Building className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No Organization</h3>
                  <p className="text-slate-500 mb-4">
                    You are not currently associated with any organization.
                  </p>
                  <Button>Create Organization</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {user?.role === 'OWNER' ? (
                <>
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium text-slate-900 mb-2">Invite Teammate</h3>
                    <form onSubmit={handleInviteTeammate} className="flex gap-2">
                      <Input
                        placeholder="teammate@example.com"
                        type="email"
                        className="flex-1"
                      />
                      <Button type="submit">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Invite
                      </Button>
                    </form>
                    <p className="text-sm text-slate-500 mt-2">
                      Invited members will have access to reviews and analytics.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium text-slate-900">Current Members</h3>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                        <Badge>Owner</Badge>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-slate-500">
                    Team management is only available to business owners.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usageLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                      <div className="h-8 bg-slate-200 rounded w-24"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-slate-900 mb-2">AI Calls (Last 30 days)</h3>
                      <div className="text-3xl font-bold text-slate-900 mb-1">
                        {usage.AI_CALL?.count || 0}
                      </div>
                      <div className="text-sm text-slate-500">
                        {usage.AI_CALL?.tokens || 0} tokens used
                      </div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h3 className="font-medium text-slate-900 mb-2">File Uploads</h3>
                      <div className="text-3xl font-bold text-slate-900 mb-1">
                        {usage.UPLOAD?.count || 0}
                      </div>
                      <div className="text-sm text-slate-500">
                        CSV files processed
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 bg-slate-50">
                    <h3 className="font-medium text-slate-900 mb-2">Usage Guidelines</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Free tier includes up to 100K tokens per month</li>
                      <li>• Unlimited CSV uploads and file processing</li>
                      <li>• Fair usage policy applies to API requests</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
