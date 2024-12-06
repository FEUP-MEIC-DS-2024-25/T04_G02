import React, { useEffect, useState } from 'react';
import '../styles/sidebar.css';
import { Link } from 'react-router-dom';

const Sidebar = ({isOpen,update, setUpdate}) => {
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);


  useEffect(() => {
    fetchProjects();
  }, [isOpen]);

  useEffect(() => {
    if(update) {
      fetchProjects();
      setUpdate(false)}
  }, [update]);

  
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
      <Link id="newButton" to="/">New Project</Link>
      <div id="divProjects">
        <h4>Projects</h4>
        {projects.length > 0 ? (
          <ul>
            {projects.map((project, index) => (
              <li className='projectsOp' key={index} >
                <Link to={`/project/${project.id}`} state={{ name: project.name }}>{project.name} </Link>
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
