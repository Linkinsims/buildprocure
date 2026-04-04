"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const CIDB_GRADES = [
  { value: "1", label: "Grade 1" },
  { value: "2", label: "Grade 2" },
  { value: "3", label: "Grade 3" },
  { value: "4", label: "Grade 4" },
  { value: "5", label: "Grade 5" },
  { value: "6", label: "Grade 6" },
  { value: "7", label: "Grade 7" },
  { value: "8", label: "Grade 8" },
  { value: "9", label: "Grade 9" },
];

const BEE_LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "Non-compliant"];

const SA_CITIES = [
  "Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", 
  "Bloemfontein", "East London", "Polokwane", "Nelspruit", "Kimberley"
];

export default function NewContractorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    cidbGrade: "",
    cidbNumber: "",
    cidbExpiry: "",
    taxClearanceExpiry: "",
    beeCertificateExpiry: "",
    beeLevel: "",
    publicLiabilityExpiry: "",
    publicLiabilityValue: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName || !formData.email) {
      toast({ variant: "destructive", title: "Missing fields", description: "Company name and email are required" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/contractors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cidbGrade: formData.cidbGrade ? parseInt(formData.cidbGrade) : null,
          publicLiabilityValue: formData.publicLiabilityValue ? parseFloat(formData.publicLiabilityValue) : 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to create contractor");

      toast({ title: "Contractor added", description: "New contractor has been added successfully" });
      router.push("/dashboard/contractors");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create contractor" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Add Contractor</h1>
        <p className="text-slate-600">Register a new contractor or subcontractor</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input placeholder="Company name" value={formData.companyName} onChange={(e) => handleChange("companyName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="email@company.co.za" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input type="tel" placeholder="+27 82 123 4567" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={formData.city} onValueChange={(v) => handleChange("city", v)}>
                    <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      {SA_CITIES.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Company address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>CIDB Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CIDB Grade</Label>
                  <Select value={formData.cidbGrade} onValueChange={(v) => handleChange("cidbGrade", v)}>
                    <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                    <SelectContent>
                      {CIDB_GRADES.map(grade => <SelectItem key={grade.value} value={grade.value}>{grade.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>CIDB Number</Label>
                  <Input placeholder="CIDB registration number" value={formData.cidbNumber} onChange={(e) => handleChange("cidbNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>CIDB Expiry</Label>
                  <Input type="date" value={formData.cidbExpiry} onChange={(e) => handleChange("cidbExpiry", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Compliance Documents</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tax Clearance Expiry</Label>
                  <Input type="date" value={formData.taxClearanceExpiry} onChange={(e) => handleChange("taxClearanceExpiry", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>BEE Certificate Expiry</Label>
                  <Input type="date" value={formData.beeCertificateExpiry} onChange={(e) => handleChange("beeCertificateExpiry", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>BEE Level</Label>
                  <Select value={formData.beeLevel} onValueChange={(v) => handleChange("beeLevel", v)}>
                    <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>
                      {BEE_LEVELS.map(level => <SelectItem key={level} value={level}>Level {level}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Public Liability Expiry</Label>
                  <Input type="date" value={formData.publicLiabilityExpiry} onChange={(e) => handleChange("publicLiabilityExpiry", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Public Liability Value (ZAR)</Label>
                <Input type="number" placeholder="e.g. 5000000" value={formData.publicLiabilityValue} onChange={(e) => handleChange("publicLiabilityValue", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Adding..." : "Add Contractor"}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}