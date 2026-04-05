"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatZAR } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";
import NewProjectModal from "@/components/projects/NewProjectModal";

interface Project {
  id: string;
  name: string;
  code: string;
  sector: string;
  status: string;
  city: string | null;
  province: string | null;
  clientName: string | null;
  totalBudget: number;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your construction sites and developments.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!loading && projects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-lg font-medium">No projects yet</p>
          <p className="text-muted-foreground text-sm mt-1">Click "New Project" to create your first one.</p>
          <Button className="mt-4" onClick={() => setModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </div>
      )}

      {/* Projects list */}
      {!loading && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2 border-b mb-4">
                <div>
                  <CardTitle className="text-xl text-primary">{project.name}</CardTitle>
                  <div className="flex gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
                    <span>{project.code}</span>
                    {project.city && <><span>•</span><span>{project.city}{project.province ? `, ${project.province}` : ""}</span></>}
                    {project.clientName && <><span>•</span><span>Client: {project.clientName}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-xs px-2 py-1 rounded-full text-white inline-flex font-medium ${
                    project.status === "ACTIVE" ? "bg-emerald-500" :
                    project.status === "PLANNING" ? "bg-blue-500" :
                    project.status === "ON_HOLD" ? "bg-amber-500" :
                    project.status === "COMPLETED" ? "bg-gray-500" : "bg-red-500"
                  }`}>
                    {project.status.replace("_", " ")}
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sector</p>
                    <p className="font-semibold">{project.sector.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                    <p className="font-semibold text-lg">{formatZAR(project.totalBudget)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm text-muted-foreground">{project.description || "—"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
