"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

const PAYMENT_TERMS = [
  "Net 30",
  "Net 60",
  "Net 90",
  "Due on receipt",
  "50% advance, 50% on completion",
  "30% advance, 70% on delivery"
];

const UNITS = ["m³", "m²", "linear meters", "kg", "tons", "bags", "pieces", "sets", "units", "liters"];

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface RFQ {
  id: string;
  rfqNumber: string;
  title: string;
}

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [formData, setFormData] = useState({
    projectId: "",
    supplierId: "",
    rfqId: "",
    deliveryAddress: "",
    billingAddress: "",
    paymentTerms: "",
    requiredDate: "",
    notes: "",
  });
  const [items, setItems] = useState([
    { description: "", unit: "", quantity: "", unitPrice: "" }
  ]);

  useEffect(() => {
    fetch("/api/projects").then(res => res.json()).then(data => setProjects(data));
    fetch("/api/suppliers").then(res => res.json()).then(data => setSuppliers(data));
  }, []);

  const handleProjectChange = async (projectId: string) => {
    setFormData(prev => ({ ...prev, projectId }));
    if (projectId) {
      const res = await fetch(`/api/rfqs?projectId=${projectId}`);
      const data = await res.json();
      setRfqs(data.filter((r: any) => r.status === "AWARDED"));
    } else {
      setRfqs([]);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", unit: "", quantity: "", unitPrice: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + (qty * price);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.supplierId) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please select a project and supplier" });
      return;
    }

    const validItems = items.filter(item => item.description && item.quantity && item.unitPrice);
    if (validItems.length === 0) {
      toast({ variant: "destructive", title: "No items", description: "Please add at least one item" });
      return;
    }

    setIsLoading(true);

    const subtotal = calculateSubtotal();
    const vatAmount = subtotal * 0.15;
    const totalAmount = subtotal + vatAmount;

    try {
      const response = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: validItems.map(item => ({
            ...item,
            quantity: parseFloat(item.quantity) || 0,
            unitPrice: parseFloat(item.unitPrice) || 0,
            totalPrice: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
          })),
          subtotal,
          vatAmount,
          totalAmount
        }),
      });

      if (!response.ok) throw new Error("Failed to create PO");
      toast({ title: "PO Created", description: "Purchase order created successfully" });
      router.push("/dashboard/purchase-orders");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create PO" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">New Purchase Order</h1>
        <p className="text-slate-600">Create a new purchase order</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>PO Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={formData.projectId} onValueChange={handleProjectChange}>
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select value={formData.supplierId} onValueChange={(v) => handleChange("supplierId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Link to RFQ (optional)</Label>
                  <Select value={formData.rfqId} onValueChange={(v) => handleChange("rfqId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select RFQ" /></SelectTrigger>
                    <SelectContent>
                      {rfqs.map(r => <SelectItem key={r.id} value={r.id}>{r.rfqNumber} - {r.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <Input placeholder="Site delivery address" value={formData.deliveryAddress} onChange={(e) => handleChange("deliveryAddress", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Select value={formData.paymentTerms} onValueChange={(v) => handleChange("paymentTerms", v)}>
                    <SelectTrigger><SelectValue placeholder="Select terms" /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Required Date</Label>
                  <Input type="date" value={formData.requiredDate} onChange={(e) => handleChange("requiredDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Billing Address</Label>
                  <Input placeholder="Billing address" value={formData.billingAddress} onChange={(e) => handleChange("billingAddress", e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Additional notes..." value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1"><Input placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} /></div>
                    <div className="w-24"><Select value={item.unit} onValueChange={(v) => handleItemChange(index, "unit", v)}><SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger><SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent></Select></div>
                    <div className="w-24"><Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", e.target.value)} /></div>
                    <div className="w-32"><Input type="number" placeholder="Unit Price" value={item.unitPrice} onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)} /></div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-end gap-8">
                <div><span className="text-slate-600">Subtotal:</span> <span className="font-medium">R {calculateSubtotal().toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span></div>
                <div><span className="text-slate-600">VAT (15%):</span> <span className="font-medium">R {(calculateSubtotal() * 0.15).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span></div>
                <div><span className="text-slate-600">Total:</span> <span className="font-bold text-blue-600">R {(calculateSubtotal() * 1.15).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create PO"}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}