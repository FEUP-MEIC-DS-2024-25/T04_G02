import React, { useEffect, useState } from 'react';
import '../styles/sidebar.css';

const Sidebar = ({setSelectedProject, isOpen}) => {
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);


  useEffect(() => {
    fetchProjects();
  }, [isOpen]);

  const handleSelectProject = (project) => {
      setSelectedProject(project);
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("http://localhost:5001/projects");
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      setProjects(data.response);
    } catch (error) {
      console.error(error);
      setError("Failed to load projects.");
    }
  };

  return (
    <nav className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <button id="newButton" onClick={() => handleSelectProject(null)}>
        New Project
      </button>
      <div id="divProjects">
        <h4>Projects</h4>
        {projects.length > 0 ? (
          <ul>
            {projects.map((project, index) => (
              <li className='projectsOp' key={index} onClick={() => handleSelectProject(project)}>
                {project.name}
              </li>
            ))}
          </ul> ):
          <p>There are no projects</p>
        }
      </div>
    </nav>
  );
};

export default Sidebar;
