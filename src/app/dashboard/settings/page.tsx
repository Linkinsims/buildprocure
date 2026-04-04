import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Building2, 
  CreditCard, 
  Users, 
  Bell,
  Shield
} from "lucide-react";

async function getOrganisationData(organisationId: string) {
  const organisation = await prisma.organisation.findUnique({
    where: { id: organisationId },
    include: {
      _count: { select: { users: true, projects: true } }
    }
  });
  return organisation;
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const organisationId = (session.user as any).organisationId;
  const organisation = await getOrganisationData(organisationId);
  const userRole = (session.user as any).role;

  const tierInfo = {
    STARTER: { name: "Starter", price: "R1,999/mo", projects: "1", users: "3" },
    GROWTH: { name: "Growth", price: "R6,000/mo", projects: "10", users: "15" },
    ENTERPRISE: { name: "Enterprise", price: "R15,000/mo", projects: "Unlimited", users: "Unlimited" }
  };

  const tier = tierInfo[organisation?.tier as keyof typeof tierInfo] || tierInfo.STARTER;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your account and organisation settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Organisation</p>
                <p className="font-medium">{organisation?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Plan</p>
                <p className="font-medium">{tier.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Users</p>
                <p className="font-medium">{organisation?._count?.users || 1} / {tier.users}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Projects</p>
                <p className="font-medium">{organisation?._count?.projects || 0} / {tier.projects}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input defaultValue={session.user?.name || ""} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={session.user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Badge variant="secondary">{userRole.replace("_", " ")}</Badge>
            </div>
            <Button>Update Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organisation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input defaultValue={organisation?.name || ""} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={organisation?.email || ""} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input defaultValue={organisation?.phone || ""} />
            </div>
            <Button>Update Organisation</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{tier.name} Plan</span>
                <Badge>{organisation?.tier}</Badge>
              </div>
              <p className="text-sm text-slate-600">{tier.price}</p>
              {organisation?.trialEndsAt && new Date(organisation.trialEndsAt) > new Date() && (
                <p className="text-xs text-yellow-600 mt-2">
                  Trial ends: {organisation.trialEndsAt.toLocaleDateString("en-ZA")}
                </p>
              )}
            </div>
            <Button variant="outline" className="w-full">Manage Subscription</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-slate-600">Receive email updates</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Expiry Alerts</p>
                <p className="text-sm text-slate-600">Document & license expiry warnings</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Budget Alerts</p>
                <p className="text-sm text-slate-600">80% and 100% budget warnings</p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <Button variant="outline" className="w-full">Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}