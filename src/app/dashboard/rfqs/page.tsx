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
  FileText, 
  Plus, 
  Search, 
  ArrowRight,
  Calendar,
  Users,
  Package
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

async function getRFQs(organisationId: string) {
  return await prisma.rfq.findMany({
    where: { project: { organisationId } },
    include: {
      project: true,
      quotes: {
        include: { supplier: true }
      },
      awardedTo: true,
      _count: { select: { items: true, quotes: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export default async function RFQsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }

  const organisationId = (session.user as any).organisationId;
  const rfqs = await getRFQs(organisationId);

  const statusColors: Record<string, string> = {
    DRAFT: "secondary",
    SENT: "info",
    QUOTES_RECEIVED: "warning",
    AWARDED: "success",
    CANCELLED: "destructive"
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Request for Quotations</h1>
          <p className="text-slate-600">Create and manage RFQs to suppliers</p>
        </div>
        <Link href="/dashboard/rfqs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New RFQ
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Search RFQs..." className="pl-10" />
        </div>
      </div>

      <div className="space-y-4">
        {rfqs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No RFQs yet</h3>
              <p className="text-slate-600 mb-4">Create your first RFQ to request quotes from suppliers</p>
              <Link href="/dashboard/rfqs/new">
                <Button>Create RFQ</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          rfqs.map((rfq) => (
            <Link key={rfq.id} href={`/dashboard/rfqs/${rfq.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{rfq.title}</h3>
                        <Badge variant={statusColors[rfq.status] as any}>{rfq.status.replace("_", " ")}</Badge>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {rfq._count.items} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {rfq._count.quotes} quotes
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {rfq.requiredBy ? formatDate(rfq.requiredBy) : "No deadline"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">{rfq.project.name}</p>
                      <p className="text-xs text-slate-400">{rfq.rfqNumber}</p>
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