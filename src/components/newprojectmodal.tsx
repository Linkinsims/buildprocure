"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { SA_PROVINCES, SA_CITIES, PROJECT_SECTORS } from "@/lib/utils";

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PROJECT_STATUSES = [
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
];

export default function NewProjectModal({ open, onClose, onSuccess }: NewProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    sector: "RESIDENTIAL",
    status: "PLANNING",
    clientName: "",
    city: "",
    province: "",
    address: "",
    startDate: "",
    endDate: "",
    totalBudget: "",
  });

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code) {
      setError("Project name and code are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      onSuccess();
      onClose();
      // Reset form
      setForm({
        name: "", code: "", description: "", sector: "RESIDENTIAL",
        status: "PLANNING", clientName: "", city: "", province: "",
        address: "", startDate: "", endDate: "", totalBudget: "",
      });
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal */}
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-xl font-bold">New Project</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Fill in the project details below</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-5">

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Row 1 - Name & Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Project Name <span className="text-destructive">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Sandton Mixed-Use Development"
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                Project Code <span className="text-destructive">*</span>
              </label>
              <input
                name="code"
                value={form.code}
                onChange={handleChange}
                placeholder="e.g. PRJ-006"
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Row 2 - Sector & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Sector</label>
              <select
                name="sector"
                value={form.sector}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PROJECT_SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3 - Client */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Client Name</label>
            <input
              name="clientName"
              value={form.clientName}
              onChange={handleChange}
              placeholder="e.g. Atterbury Property Holdings"
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Row 4 - City & Province */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">City</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select city...</option>
                {SA_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Province</label>
              <select
                name="province"
                value={form.province}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select province...</option>
                {SA_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 5 - Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Site Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. 123 Rivonia Road, Sandton"
              className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Row 6 - Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Row 7 - Budget */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Total Budget (ZAR, excl. VAT)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R</span>
              <input
                type="number"
                name="totalBudget"
                value={form.totalBudget}
                onChange={handleChange}
                placeholder="0.00"
                className="h-10 pl-7 pr-3 rounded-lg border border-input bg-background text-sm w-full focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Row 8 - Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Brief project scope and description..."
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border sticky bottom-0 bg-card">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
