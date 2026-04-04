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
  FolderKanban, 
  Plus, 
  Search, 
  MapPin, 
  Calendar,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getProjects(organisationId: string) {
  return await prisma.project.findMany({
    where: { organisationId },
    include: {
      budgets: true,
      _count: {
        select: {
          rfqs: true,
          purchaseOrders: true,
          deliveries: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  const organisationId = (session.user as any).organisationId;
  const projects = await getProjects(organisationId);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-600">Manage all your construction projects</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search projects..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No projects yet</h3>
              <p className="text-slate-600 mb-4">Create your first project to get started</p>
              <Link href="/dashboard/projects/new">
                <Button>Create Project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => {
            const budget = project.budgets[0];
            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">{project.code}</p>
                      </div>
                      <Badge variant={project.status === "ACTIVE" ? "success" : "secondary"}>
                        {project.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        {project.city}, {project.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4" />
                        {project.startDate ? formatDate(project.startDate) : "Not set"} - {project.endDate ? formatDate(project.endDate) : "Not set"}
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600">Budget</span>
                          <span className="font-medium">{formatCurrency(budget?.totalBudget || project.estimatedValue)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">Spent</span>
                          <span className="font-medium text-blue-600">{formatCurrency(budget?.actual || 0)}</span>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{project._count.rfqs} RFQs</span>
                        <span>{project._count.purchaseOrders} POs</span>
                        <span>{project._count.deliveries} Deliveries</span>
                      </div>
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