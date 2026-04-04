import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Plus
} from "lucide-react";
import { formatCurrency, getBudgetVariancePercentage } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

async function getBudgetData(organisationId: string) {
  const budgets = await prisma.budget.findMany({
    where: { project: { organisationId } },
    include: {
      project: true,
      costCodes: true
    }
  });

  const costCodes = await prisma.costCode.findMany({
    where: { project: { organisationId } },
    include: { project: true }
  });

  return { budgets, costCodes };
}

export default async function BudgetPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const organisationId = (session.user as any).organisationId;
  const { budgets, costCodes } = await getBudgetData(organisationId);

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.totalBudget), 0);
  const totalCommitted = budgets.reduce((sum, b) => sum + Number(b.committed), 0);
  const totalActual = budgets.reduce((sum, b) => sum + Number(b.actual), 0);
  const remaining = totalBudget - totalCommitted - totalActual;

  const chartData = budgets.map(b => ({
    name: b.project.code,
    Budget: Number(b.totalBudget),
    Committed: Number(b.committed),
    Actual: Number(b.actual)
  }));

  const costCodeByCategory = costCodes.reduce((acc: any, cc) => {
    if (!acc[cc.category]) {
      acc[cc.category] = { budget: 0, committed: 0, actual: 0 };
    }
    acc[cc.category].budget += Number(cc.budget);
    acc[cc.category].committed += Number(cc.committed);
    acc[cc.category].actual += Number(cc.actual);
    return acc;
  }, {});

  const categoryChartData = Object.entries(costCodeByCategory).map(([category, data]: [string, any]) => ({
    category,
    ...data
  }));

  const overBudgetCodes = costCodes.filter(cc => {
    const variance = getBudgetVariancePercentage(Number(cc.committed), Number(cc.budget));
    return variance >= 100;
  });

  const warningCodes = costCodes.filter(cc => {
    const variance = getBudgetVariancePercentage(Number(cc.committed), Number(cc.budget));
    return variance >= 80 && variance < 100;
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Budget vs Actual Tracking</h1>
          <p className="text-slate-600">Monitor project budgets and spending</p>
        </div>
        <Link href="/dashboard/budget/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Cost Code</Button>
        </Link>
      </div>

      {overBudgetCodes.length > 0 && (
        <Card className="mb-8 border-red-300">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Budget Exceeded - {overBudgetCodes.length} cost code(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overBudgetCodes.map(cc => (
                <div key={cc.id} className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-medium">{cc.project.name} - {cc.name}</p>
                    <p className="text-sm text-slate-600">{cc.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-600 font-medium">R {Number(cc.committed).toLocaleString()} / R {Number(cc.budget).toLocaleString()}</p>
                    <p className="text-xs text-red-500">{getBudgetVariancePercentage(Number(cc.committed), Number(cc.budget))}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {warningCodes.length > 0 && (
        <Card className="mb-8 border-yellow-300">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Budget Warning - {warningCodes.length} cost code(s) at 80%+
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {warningCodes.map(cc => (
                <div key={cc.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                  <div>
                    <p className="font-medium">{cc.project.name} - {cc.name}</p>
                    <p className="text-sm text-slate-600">{cc.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-600 font-medium">R {Number(cc.committed).toLocaleString()} / R {Number(cc.budget).toLocaleString()}</p>
                    <p className="text-xs text-yellow-500">{getBudgetVariancePercentage(Number(cc.committed), Number(cc.budget))}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Committed</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCommitted)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Actual Spend</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalActual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-slate-600">Remaining</p>
            <p className={`text-2xl font-bold ${remaining < 0 ? "text-red-600" : "text-slate-900"}`}>
              {formatCurrency(remaining)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Budget by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `R${value / 1000000}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="Budget" fill="#3B82F6" />
                  <Bar dataKey="Committed" fill="#F59E0B" />
                  <Bar dataKey="Actual" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis tickFormatter={(value) => `R${value / 1000000}M`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="budget" fill="#3B82F6" name="Budget" />
                  <Bar dataKey="committed" fill="#F59E0B" name="Committed" />
                  <Bar dataKey="actual" fill="#10B981" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cost Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Project</th>
                  <th className="text-left py-3 px-4 font-medium">Code</th>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-right py-3 px-4 font-medium">Budget</th>
                  <th className="text-right py-3 px-4 font-medium">Committed</th>
                  <th className="text-right py-3 px-4 font-medium">Actual</th>
                  <th className="text-right py-3 px-4 font-medium">Variance</th>
                </tr>
              </thead>
              <tbody>
                {costCodes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500">
                      No cost codes defined. Add cost codes to start tracking budget.
                    </td>
                  </tr>
                ) : (
                  costCodes.map(cc => {
                    const variance = getBudgetVariancePercentage(Number(cc.committed), Number(cc.budget));
                    return (
                      <tr key={cc.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">{cc.project.name}</td>
                        <td className="py-3 px-4 font-mono text-sm">{cc.code}</td>
                        <td className="py-3 px-4">{cc.name}</td>
                        <td className="py-3 px-4"><Badge variant="secondary">{cc.category}</Badge></td>
                        <td className="py-3 px-4 text-right">{formatCurrency(cc.budget)}</td>
                        <td className="py-3 px-4 text-right text-blue-600">{formatCurrency(cc.committed)}</td>
                        <td className="py-3 px-4 text-right text-green-600">{formatCurrency(cc.actual)}</td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant={variance >= 100 ? "destructive" : variance >= 80 ? "warning" : "success"}>
                            {variance}%
                          </Badge>
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