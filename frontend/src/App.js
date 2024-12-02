import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import SectionInput from "./components/SectionInput";

const App = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [file, setFile] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const fetchProjectContent = async (projectId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/project/${projectId}/content`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Project Content:", data.response);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      if (
        !["text/plain", "text/markdown", "text/csv"].includes(selectedFile.type)
      ) {
        setError("Only text files (.txt, .md, .csv) are supported.");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async () => {
    try {
      let content = userInput;
      if (file) {
        const fileContent = await file.text();
        content = fileContent;
      }
      const response = await fetch("http://127.0.0.1:5001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: content }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      const parsedStories = JSON.parse(
        data.response.replace("```json", "").replace("```", "")
      );
      setUserStories(parsedStories);
    } catch (error) {
      setError("Failed to generate user stories.");
      console.error(error);
    }
  };

  const downloadUserStories = () => {
    const blob = new Blob([JSON.stringify(userStories, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "user_stories.json";
    link.click();
  };

  return (
    <>
      <Header />
      <main>
        <SectionInput />
        <div>
          <h1>User Story Generator</h1>
          <div>
            <label htmlFor="project-dropdown">Select Project: </label>
            <select
              id="project-dropdown"
              value={selectedProjectId || ""}
              onChange={(e) => {
                const projectId = e.target.value;
                setSelectedProjectId(projectId);
                if (projectId) {
                  fetchProjectContent(projectId);
                }
              }}
            >
              <option value="">Select a Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
            
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter text or leave empty to upload a file."
            rows={5}
            style={{ width: "100%" }}
          />
    
          <div>
            <input
              type="file"
              accept=".txt,.md,.csv"
              onChange={handleFileChange}
            />
            {file && (
              <button onClick={() => setFile(null)}>Remove File</button>
            )}
          </div>
          
          {error && <div style={{ color: "red" }}>{error}</div>}
          
          <button onClick={handleSubmit}>Generate User Stories</button>
          
          {userStories.length > 0 && (
            <div>
              <h2>Generated User Stories</h2>
              <table>
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>User Story</th>
                    <th>Acceptance Criteria</th>
                  </tr>
                </thead>
                <tbody>
                  {userStories.map((story, idx) => (
                    <tr key={idx}>
                      <td>{story.index}</td>
                      <td>{story.user_story}</td>
                      <td>
                        <ul>
                          {story.acceptance_criteria.map((ac, i) => (
                            <li key={i}>{ac}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={downloadUserStories}>Download Stories</button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default App;