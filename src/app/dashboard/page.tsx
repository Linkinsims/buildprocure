import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FolderKanban, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { formatCurrency, formatDate, getDaysUntilExpiry, getExpiryAlertLevel } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

async function getDashboardData(organisationId: string) {
  const [
    projectCount,
    activeProjects,
    rfqCount,
    openRfqs,
    poCount,
    activePos,
    deliveryCount,
    pendingDeliveries,
    contractorCount,
    expiringContracts,
    alerts
  ] = await Promise.all([
    prisma.project.count({ where: { organisationId } }),
    prisma.project.count({ where: { organisationId, status: "ACTIVE" } }),
    prisma.rfq.count({ where: { organisationId: { organisationId } } }),
    prisma.rfq.count({ where: { status: { in: ["SENT", "QUOTES_RECEIVED"] } } }),
    prisma.purchaseOrder.count({ where: { project: { organisationId } } }),
    prisma.purchaseOrder.count({ where: { status: { notIn: ["CLOSED", "CANCELLED"] } } }),
    prisma.delivery.count({ where: { project: { organisationId } } }),
    prisma.delivery.count({ where: { status: "PENDING" } }),
    prisma.contractor.count({ where: { organisationId } }),
    prisma.contractor.count({ 
      where: { 
        organisationId,
        OR: [
          { cidbExpiry: { lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } },
          { taxClearanceExpiry: { lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } },
          { publicLiabilityExpiry: { lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) } }
        ]
      }
    }),
    prisma.alert.findMany({
      where: { organisationId, isRead: false },
      take: 5,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const projects = await prisma.project.findMany({
    where: { organisationId, status: "ACTIVE" },
    take: 5,
    include: { budgets: true }
  });

  const budgets = await prisma.budget.findMany({
    where: { project: { organisationId } }
  });

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.totalBudget), 0);
  const totalCommitted = budgets.reduce((sum, b) => sum + Number(b.committed), 0);
  const totalActual = budgets.reduce((sum, b) => sum + Number(b.actual), 0);

  return {
    projectCount,
    activeProjects,
    rfqCount,
    openRfqs,
    poCount,
    activePos,
    deliveryCount,
    pendingDeliveries,
    contractorCount,
    expiringContracts,
    alerts,
    projects,
    budgetOverview: { totalBudget, totalCommitted, totalActual }
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  const organisationId = (session.user as any).organisationId;
  const data = await getDashboardData(organisationId);

  const budgetData = [
    { name: "Committed", value: data.budgetOverview.totalCommitted, color: "#3B82F6" },
    { name: "Actual", value: data.budgetOverview.totalActual, color: "#10B981" },
    { name: "Remaining", value: Math.max(0, data.budgetOverview.totalBudget - data.budgetOverview.totalCommitted - data.budgetOverview.totalActual), color: "#E5E7EB" }
  ];

  const projectStatusData = [
    { name: "Active", value: data.activeProjects, color: "#10B981" },
    { name: "Planning", value: data.projectCount - data.activeProjects, color: "#F59E0B" }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600">Welcome back! Here&apos;s your portfolio overview.</p>
      </div>

      {data.alerts.length > 0 && (
        <div className="mb-8 space-y-2">
          {data.alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg flex items-center gap-3 ${
                alert.type === "DOCUMENT_EXPIRY" 
                  ? "bg-red-50 border border-red-200" 
                  : alert.type === "BUDGET_VARIANCE"
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <AlertTriangle className={`h-5 w-5 ${
                alert.type === "DOCUMENT_EXPIRY" ? "text-red-500" : "text-yellow-500"
              }`} />
              <div className="flex-1">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm text-slate-600">{alert.message}</p>
              </div>
              <Button variant="ghost" size="sm">View</Button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Projects</p>
                <p className="text-3xl font-bold">{data.activeProjects}</p>
                <p className="text-xs text-slate-500 mt-1">of {data.projectCount} total</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Open RFQs</p>
                <p className="text-3xl font-bold">{data.openRfqs}</p>
                <p className="text-xs text-slate-500 mt-1">{data.rfqCount} total</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active POs</p>
                <p className="text-3xl font-bold">{data.activePos}</p>
                <p className="text-xs text-slate-500 mt-1">{data.poCount} total</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Pending Deliveries</p>
                <p className="text-3xl font-bold">{data.pendingDeliveries}</p>
                <p className="text-xs text-slate-500 mt-1">{data.deliveryCount} total</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Truck className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Budget Overview</CardTitle>
            <Link href="/dashboard/budget">
              <Button variant="ghost" size="sm">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Total Budget</p>
                <p className="text-xl font-bold">{formatCurrency(data.budgetOverview.totalBudget)}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Committed</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(data.budgetOverview.totalCommitted)}</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">Actual Spend</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(data.budgetOverview.totalActual)}</p>
              </div>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {budgetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contractor Compliance</CardTitle>
            <Link href="/dashboard/compliance">
              <Button variant="ghost" size="sm">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600">{data.contractorCount} contractors</p>
                <p className="text-sm text-slate-500">{data.expiringContracts} with expiring documents</p>
              </div>
            </div>
            {data.expiringContracts > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">{data.expiringContracts} contractor documents expiring soon</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Projects</CardTitle>
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Project</th>
                  <th className="text-left py-3 px-4 font-medium">Location</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Budget</th>
                  <th className="text-right py-3 px-4 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      No active projects. <Link href="/dashboard/projects/new" className="text-blue-600 hover:underline">Create one</Link>
                    </td>
                  </tr>
                ) : (
                  data.projects.map((project) => {
                    const budget = project.budgets[0];
                    const progress = budget ? (Number(budget.actual) / Number(budget.totalBudget)) * 100 : 0;
                    return (
                      <tr key={project.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <Link href={`/dashboard/projects/${project.id}`} className="font-medium hover:text-blue-600">
                            {project.name}
                          </Link>
                          <p className="text-sm text-slate-500">{project.code}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {project.city}, {project.location}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={project.status === "ACTIVE" ? "success" : "secondary"}>
                            {project.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(budget?.totalBudget || 0)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full">
                              <div 
                                className="h-2 bg-blue-600 rounded-full" 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-600 w-12">{progress.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}