import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Plus, 
  Search, 
  ArrowRight,
  Shield,
  AlertTriangle,
  Star
} from "lucide-react";
import { formatDate, getDaysUntilExpiry, getExpiryAlertLevel } from "@/lib/utils";

async function getContractors(organisationId: string) {
  return await prisma.contractor.findMany({
    where: { organisationId },
    include: {
      _count: { select: { projects: true, documents: true } },
      performanceRatings: true
    },
    orderBy: { companyName: "asc" }
  });
}

export default async function ContractorsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const organisationId = (session.user as any).organisationId;
  const contractors = await getContractors(organisationId);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE": return "success";
      case "INACTIVE": return "secondary";
      case "EXPIRED": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contractors & Subcontractors</h1>
          <p className="text-slate-600">Manage your contractor database</p>
        </div>
        <Link href="/dashboard/contractors/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Contractor</Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search contractors..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No contractors yet</h3>
              <p className="text-slate-600 mb-4">Add your first contractor to start tracking compliance</p>
              <Link href="/dashboard/contractors/new"><Button>Add Contractor</Button></Link>
            </CardContent>
          </Card>
        ) : (
          contractors.map((contractor) => {
            const daysUntilExpiry = getDaysUntilExpiry(contractor.cidbExpiry);
            const expiryAlert = getExpiryAlertLevel(daysUntilExpiry);
            const avgRating = contractor.performanceRatings.length > 0
              ? contractor.performanceRatings.reduce((sum, r) => sum + r.overallRating, 0) / contractor.performanceRatings.length
              : 0;

            return (
              <Link key={contractor.id} href={`/dashboard/contractors/${contractor.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{contractor.companyName}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">{contractor.email}</p>
                      </div>
                      <Badge variant={getStatusBadge(contractor.status) as any}>{contractor.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {contractor.cidbGrade && (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-slate-400" />
                          <span>CIDB Grade {contractor.cidbGrade}</span>
                          {expiryAlert && (
                            <Badge variant={expiryAlert === "critical" ? "destructive" : "warning"} className="ml-auto">
                              {daysUntilExpiry} days
                            </Badge>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="h-4 w-4" />
                        {contractor._count.projects} projects
                      </div>
                      {avgRating > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating) ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}`} />
                          ))}
                          <span className="text-slate-500 ml-1">({avgRating.toFixed(1)})</span>
                        </div>
                      )}
                      {(contractor.cidbExpiry && daysUntilExpiry !== null && daysUntilExpiry <= 90) && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          CIDB expires {formatDate(contractor.cidbExpiry)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}