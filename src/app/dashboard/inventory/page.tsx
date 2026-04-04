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
  Package, 
  Plus, 
  Search, 
  ArrowRight,
  AlertTriangle,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getInventory(organisationId: string) {
  return await prisma.inventory.findMany({
    where: { project: { organisationId } },
    include: { project: true },
    orderBy: { materialName: "asc" }
  });
}

export default function InventoryPage() {
  const sessionPromise = getServerSession(authOptions);
  
  return (
    <div className="p-8">
      {sessionPromise.then(session => {
        if (!session) {
          redirect("/auth/signin");
        }
        return null;
      })}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Site Inventory & Stock</h1>
          <p className="text-slate-600">Track materials on site</p>
        </div>
        <Link href="/dashboard/inventory/new">
          <Button><Plus className="mr-2 h-4 w-4" /> Add Material</Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search materials..." className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Materials</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Received</p>
                <p className="text-2xl font-bold text-green-600">R 0</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Issued</p>
                <p className="text-2xl font-bold text-red-600">R 0</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No inventory records</h3>
          <p className="text-slate-600 mb-4">Start tracking materials by adding your first item</p>
          <Link href="/dashboard/inventory/new"><Button>Add Material</Button></Link>
        </CardContent>
      </Card>
    </div>
  );
}