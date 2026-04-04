import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Users, 
  Truck,
  TrendingUp
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

async function getReportData(organisationId: string) {
  const [
    projectCount,
    activeProjects,
    rfqCount,
    poCount,
    supplierCount,
    contractorCount,
    deliveryCount,
    lateDeliveries,
    budgets
  ] = await Promise.all([
    prisma.project.count({ where: { organisationId } }),
    prisma.project.count({ where: { organisationId, status: "ACTIVE" } }),
    prisma.rfq.count({ where: { project: { organisationId } } }),
    prisma.purchaseOrder.count({ where: { project: { organisationId } } }),
    prisma.supplier.count({ where: { organisationId } }),
    prisma.contractor.count({ where: { organisationId } }),
    prisma.delivery.count({ where: { project: { organisationId } } }),
    prisma.delivery.count({ where: { project: { organisationId }, isLate: true } }),
    prisma.budget.findMany({ where: { project: { organisationId } } })
  ]);

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.totalBudget), 0);
  const totalCommitted = budgets.reduce((sum, b) => sum + Number(b.committed), 0);
  const totalActual = budgets.reduce((sum, b) => sum + Number(b.actual), 0);

  return {
    projectCount,
    activeProjects,
    rfqCount,
    poCount,
    supplierCount,
    contractorCount,
    deliveryCount,
    lateDeliveries,
    totalBudget,
    totalCommitted,
    totalActual
  };
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const organisationId = (session.user as any).organisationId;
  const data = await getReportData(organisationId);

  const reports = [
    {
      title: "Procurement Status Report",
      description: "Overview of all RFQs, quotes, and purchase orders",
      icon: FileText,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Budget Variance Report",
      description: "Detailed budget vs actual analysis per project and cost code",
      icon: TrendingUp,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Supplier Performance Report",
      description: "Delivery times, quality ratings, and compliance status",
      icon: Truck,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Contractor Compliance Report",
      description: "CIDB grading, BEE status, and document expiry tracking",
      icon: Users,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Delivery Performance Report",
      description: "On-time deliveries, short deliveries, and damage tracking",
      icon: BarChart3,
      color: "bg-teal-100 text-teal-600"
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-600">Generate and export detailed reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Projects</p>
                <p className="text-3xl font-bold">{data.projectCount}</p>
                <p className="text-xs text-slate-500">{data.activeProjects} active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Budget</p>
                <p className="text-3xl font-bold">{formatCurrency(data.totalBudget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Actual Spend</p>
                <p className="text-3xl font-bold">{formatCurrency(data.totalActual)}</p>
                <p className="text-xs text-slate-500">
                  {data.totalBudget > 0 ? ((data.totalActual / data.totalBudget) * 100).toFixed(1) : 0}% of budget
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${report.color}`}>
                  <report.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">{report.description}</p>
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}