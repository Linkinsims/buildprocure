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

const MATERIAL_CATEGORIES = [
  "Concrete",
  "Steel & Reinforcement",
  "Timber & Shutterboard",
  "Waterproofing",
  "Insulation",
  "Roofing",
  "Finishes",
  "Plumbing",
  "Electrical",
  "Civil Works",
  "Other"
];

const UNITS = [
  "m³", "m²", "linear meters", "kg", "tons", "bags", "pieces", "sets", "units", "liters"
];

interface Project {
  id: string;
  name: string;
  code: string;
}

interface Supplier {
  id: string;
  name: string;
}

export default function NewRFQPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState({
    projectId: "",
    title: "",
    description: "",
    category: "",
    requiredBy: "",
    deliveryAddress: "",
    notes: "",
    selectedSuppliers: [] as string[],
  });
  const [items, setItems] = useState([
    { description: "", unit: "", quantity: "", specs: "" }
  ]);

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => setProjects(data));
    fetch("/api/suppliers")
      .then(res => res.json())
      .then(data => setSuppliers(data));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", unit: "", quantity: "", specs: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const toggleSupplier = (supplierId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSuppliers: prev.selectedSuppliers.includes(supplierId)
        ? prev.selectedSuppliers.filter(id => id !== supplierId)
        : [...prev.selectedSuppliers, supplierId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.projectId || !formData.title || !formData.category) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in all required fields" });
      return;
    }

    const validItems = items.filter(item => item.description && item.quantity);
    if (validItems.length === 0) {
      toast({ variant: "destructive", title: "No items", description: "Please add at least one item" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/rfqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: validItems.map(item => ({
            ...item,
            quantity: parseFloat(item.quantity) || 0
          }))
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create RFQ");
      }

      toast({ title: "RFQ created", description: "Your RFQ has been created" });
      router.push("/dashboard/rfqs");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to create RFQ" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">New RFQ</h1>
        <p className="text-slate-600">Create a Request for Quotation</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>RFQ Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={formData.projectId} onValueChange={(value) => handleChange("projectId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MATERIAL_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. Concrete Supply for Phase 1"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Additional details about the RFQ..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Required By</Label>
                  <Input
                    type="date"
                    value={formData.requiredBy}
                    onChange={(e) => handleChange("requiredBy", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <Input
                    placeholder="Site delivery address"
                    value={formData.deliveryAddress}
                    onChange={(e) => handleChange("deliveryAddress", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Select value={item.unit} onValueChange={(value) => handleItemChange(index, "unit", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {UNITS.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.selectedSuppliers.includes(supplier.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => toggleSupplier(supplier.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border ${
                        formData.selectedSuppliers.includes(supplier.id)
                          ? "bg-blue-500 border-blue-500"
                          : "border-slate-300"
                      }`} />
                      <span>{supplier.name}</span>
                    </div>
                  </div>
                ))}
                {suppliers.length === 0 && (
                  <p className="text-slate-500 text-sm col-span-2">No suppliers available. Add suppliers first.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create RFQ"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}