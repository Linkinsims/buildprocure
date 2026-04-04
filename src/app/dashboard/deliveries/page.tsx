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
  Truck, 
  Search, 
  ArrowRight,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getDeliveries(organisationId: string) {
  return await prisma.delivery.findMany({
    where: { project: { organisationId } },
    include: {
      purchaseOrder: { include: { supplier: true, project: true } },
      items: { include: { poItem: true } },
      _count: { select: { items: true } }
    },
    orderBy: { expectedDate: "asc" }
  });
}

export default async function DeliveriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const organisationId = (session.user as any).organisationId;
  const deliveries = await getDeliveries(organisationId);

  const statusColors: Record<string, string> = {
    PENDING: "secondary",
    PARTIALLY_RECEIVED: "warning",
    FULLY_RECEIVED: "success",
    SHORT_DELIVERY: "destructive",
    DAMAGED: "destructive",
    REJECTED: "destructive"
  };

  const isOverdue = (expectedDate: Date | null) => {
    if (!expectedDate) return false;
    return new Date(expectedDate) < new Date();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Deliveries</h1>
          <p className="text-slate-600">Track and manage material deliveries</p>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search deliveries..." className="pl-10" />
        </div>
      </div>

      <div className="space-y-4">
        {deliveries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Truck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No deliveries scheduled</h3>
              <p className="text-slate-600">Deliveries will appear here when POs are created</p>
            </CardContent>
          </Card>
        ) : (
          deliveries.map((delivery) => (
            <Link key={delivery.id} href={`/dashboard/deliveries/${delivery.id}`}>
              <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isOverdue(delivery.expectedDate) && delivery.status === "PENDING" ? "border-red-300" : ""}`}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{delivery.deliveryNumber}</h3>
                        <Badge variant={statusColors[delivery.status] as any}>{delivery.status.replace("_", " ")}</Badge>
                        {delivery.isLate && <Badge variant="destructive">Late</Badge>}
                        {delivery.isShortDelivery && <Badge variant="warning">Short Delivery</Badge>}
                        {delivery.isDamaged && <Badge variant="destructive">Damaged</Badge>}
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {delivery._count.items} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="h-4 w-4" />
                          {delivery.purchaseOrder.supplier.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Expected: {delivery.expectedDate ? formatDate(delivery.expectedDate) : "Not set"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{delivery.purchaseOrder.project.name}</p>
                      <p className="text-sm text-slate-400">PO: {delivery.purchaseOrder.poNumber}</p>
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