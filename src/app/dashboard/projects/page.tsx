import React, { useCallback, useEffect, useState } from 'react';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [error, setError] = useState(null);

    const fetchProjects = useCallback(async () => {
        try {
            const response = await fetch('/api/projects');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setProjects(data);
        } catch (err) {
            setError(err.message);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <div>
            <h1>Projects</h1>
            {error && <div className="error" aria-label="Error message">{error}</div>}
            {/* UI for displaying projects */}
        </div>
    );
};

export default ProjectsPage;