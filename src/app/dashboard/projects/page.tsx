'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  // Add other properties as needed
}

const ProjectsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProjects = useCallback(async (): Promise<void> => {
        try {
            setLoading(true);
            const response = await fetch('/api/projects');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data: Project[] = await response.json();
            setProjects(data);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <div>
            <h1>Projects</h1>
            {loading && <div>Loading...</div>}
            {error && <div className="error" aria-label="Error message">{error}</div>}
            {projects.length > 0 ? (
                <ul>
                    {projects.map(project => (
                        <li key={project.id}>{project.name}</li>
                    ))}
                </ul>
            ) : (
                !loading && <p>No projects found</p>
            )}
        </div>
    );
};

export default ProjectsPage;
