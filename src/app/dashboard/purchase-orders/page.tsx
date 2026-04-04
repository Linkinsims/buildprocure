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
  ShoppingCart, 
  Plus, 
  Search, 
  ArrowRight,
  Calendar,
  Package,
  MapPin
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getPurchaseOrders(organisationId: string) {
  return await prisma.purchaseOrder.findMany({
    where: { project: { organisationId } },
    include: {
      project: true,
      supplier: true,
      items: true,
      _count: { select: { items: true, deliveries: true } }
    },
    orderBy: { createdAt: "desc" }
  });
}

export default async function PurchaseOrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  const organisationId = (session.user as any).organisationId;
  const purchaseOrders = await getPurchaseOrders(organisationId);

  const statusColors: Record<string, string> = {
    DRAFT: "secondary",
    SENT: "info",
    ACKNOWLEDGED: "warning",
    PARTIALLY_DELIVERED: "warning",
    FULLY_DELIVERED: "success",
    CLOSED: "success",
    CANCELLED: "destructive"
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Purchase Orders</h1>
          <p className="text-slate-600">Create and manage purchase orders</p>
        </div>
        <Link href="/dashboard/purchase-orders/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New PO
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search POs..." className="pl-10" />
        </div>
      </div>

      <div className="space-y-4">
        {purchaseOrders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Purchase Orders yet</h3>
              <p className="text-slate-600 mb-4">Create your first PO from an awarded RFQ or manually</p>
              <Link href="/dashboard/purchase-orders/new">
                <Button>Create PO</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          purchaseOrders.map((po) => (
            <Link key={po.id} href={`/dashboard/purchase-orders/${po.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{po.poNumber}</h3>
                        <Badge variant={statusColors[po.status] as any}>{po.status.replace("_", " ")}</Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {po._count.items} items
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {po.supplier.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(po.orderDate)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">{formatCurrency(po.totalAmount)}</p>
                      <p className="text-sm text-slate-500">{po.project.name}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 ml-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}