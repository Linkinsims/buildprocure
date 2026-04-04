import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  XCircle,
  FileText
} from "lucide-react";
import { formatDate, getDaysUntilExpiry, getExpiryAlertLevel } from "@/lib/utils";

async function getComplianceData(organisationId: string) {
  const contractors = await prisma.contractor.findMany({
    where: { organisationId },
    include: {
      documents: true,
      projects: { include: { project: true } }
    }
  });

  const documents = await prisma.contractorDocument.findMany({
    where: { contractor: { organisationId } },
    include: { contractor: true },
    orderBy: { expiryDate: "asc" }
  });

  return { contractors, documents };
}

export default async function CompliancePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  const organisationId = (session.user as any).organisationId;
  const { contractors, documents } = await getComplianceData(organisationId);

  const expiringDocs = documents.filter(d => {
    if (!d.expiryDate) return false;
    const days = getDaysUntilExpiry(d.expiryDate);
    return days !== null && days <= 90;
  });

  const expiredDocs = documents.filter(d => {
    if (!d.expiryDate) return false;
    const days = getDaysUntilExpiry(d.expiryDate);
    return days !== null && days <= 0;
  });

  const validDocs = documents.filter(d => {
    if (!d.expiryDate) return true;
    const days = getDaysUntilExpiry(d.expiryDate);
    return days === null || days > 90;
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">CIDB Compliance Tracker</h1>
        <p className="text-slate-600">Monitor contractor compliance and document expiry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Contractors</p>
                <p className="text-3xl font-bold">{contractors.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Valid Documents</p>
                <p className="text-3xl font-bold text-green-600">{validDocs.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expiring Soon (90 days)</p>
                <p className="text-3xl font-bold text-yellow-600">{expiringDocs.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Expired</p>
                <p className="text-3xl font-bold text-red-600">{expiredDocs.length}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {expiredDocs.length > 0 && (
        <Card className="mb-8 border-red-300">
          <CardHeader className="bg-red-50">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Expired Documents - Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiredDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-medium">{doc.contractor.companyName}</p>
                    <p className="text-sm text-slate-600">{doc.type} - {doc.documentName}</p>
                  </div>
                  <Badge variant="destructive">Expired {formatDate(doc.expiryDate)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {expiringDocs.length > 0 && (
        <Card className="mb-8 border-yellow-300">
          <CardHeader className="bg-yellow-50">
            <CardTitle className="text-yellow-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Documents Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {expiringDocs.map(doc => {
                const days = getDaysUntilExpiry(doc.expiryDate);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                    <div>
                      <p className="font-medium">{doc.contractor.companyName}</p>
                      <p className="text-sm text-slate-600">{doc.type} - {doc.documentName}</p>
                    </div>
                    <Badge variant={days && days <= 30 ? "destructive" : "warning"}>
                      Expires in {days} days
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Contractor Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Contractor</th>
                  <th className="text-left py-3 px-4 font-medium">Document Type</th>
                  <th className="text-left py-3 px-4 font-medium">Document Name</th>
                  <th className="text-left py-3 px-4 font-medium">Expiry Date</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      No documents found. Add contractors and their compliance documents.
                    </td>
                  </tr>
                ) : (
                  documents.map(doc => {
                    const days = getDaysUntilExpiry(doc.expiryDate);
                    const alert = getExpiryAlertLevel(days);
                    return (
                      <tr key={doc.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">{doc.contractor.companyName}</td>
                        <td className="py-3 px-4">{doc.type.replace("_", " ")}</td>
                        <td className="py-3 px-4">{doc.documentName}</td>
                        <td className="py-3 px-4">{doc.expiryDate ? formatDate(doc.expiryDate) : "N/A"}</td>
                        <td className="py-3 px-4">
                          <Badge variant={alert === "critical" ? "destructive" : alert === "warning" ? "warning" : "success"}>
                            {days === null ? "No expiry" : days <= 0 ? "Expired" : days <= 30 ? "Critical" : days <= 90 ? "Expiring" : "Valid"}
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