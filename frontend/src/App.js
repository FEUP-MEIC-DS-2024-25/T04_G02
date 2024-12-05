import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import SectionInput from "./components/SectionInput";
import LanguageSelector from "./components/LanguageSelector";

const App = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [file, setFile] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [error, setError] = useState("");
  const [editingStory, setEditingStory] = useState(null);
  const [tempContent, setTempContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

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
        body: JSON.stringify({ 
          query: content,
          language: selectedLanguage 
        }),
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

  const handleEditClick = (storyIndex) => {
    const storyToEdit = userStories[storyIndex];
    setEditingStory(storyIndex);
    setTempContent(storyToEdit.user_story);
  };

  const handleCancelEdit = () => {
    setEditingStory(null);
    setTempContent("");
  };

  const handleSaveEdit = () => {
    if (!tempContent.trim()) {
      setError("User story content cannot be empty.");
      return;
    }
    const updatedStories = [...userStories];
    updatedStories[editingStory].user_story = tempContent;
    setUserStories(updatedStories);
    setEditingStory(null);
    setTempContent("");
    setError("");
  };

  return (
    <>
      <Header />
      <main>
        <SectionInput />
        <div id="sectionInput">
          <h1>User Story Generator</h1>
          <div id="divProject">
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
            
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />

          <textarea
            id="userInput"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter text or leave empty to upload a file."
            rows={5}
          />
    
          <div id="fileControlsContainer">
            <input
              id="uploadButton"
              type="file"
              accept=".txt,.md,.csv"
              onChange={handleFileChange}
            />
            {file && (
              <button id="deleteButton" onClick={() => setFile(null)}>
                <i className="fa fa-trash"></i>
                Remove File
              </button>
            )}
          </div>
          
          {error && <div id="fileError">{error}</div>}
  
          <button id="submitButton" onClick={handleSubmit}>
            Generate User Stories
          </button>
  
          {userStories.length > 0 && (
            <div id="sectionUserStories">
              <h2>Generated User Stories</h2>
              <table id="userStoriesTable">
                <thead>
                  <tr>
                    <th>Index</th>
                    <th>User Story</th>
                    <th>Acceptance Criteria</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userStories.map((story, idx) => (
                    <tr key={idx}>
                      <td>{story.index}</td>
                      <td>
                        {editingStory === idx ? (
                          <textarea
                            id="editUserStory"
                            value={tempContent}
                            onChange={(e) => setTempContent(e.target.value)}
                            rows={3}
                            style={{ width: '100%' }}
                          />
                        ) : (
                          story.user_story
                        )}
                      </td>
                      <td>
                        <ul>
                          {story.acceptance_criteria.map((ac, i) => (
                            <li key={i}>{ac}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        {editingStory === idx ? (
                          <>
                            <button className="saveEdit" onClick={handleSaveEdit}>Save</button>
                            <button className="saveEdit" onClick={handleCancelEdit}>Cancel</button>
                          </>
                        ) : (
                          <button onClick={() => handleEditClick(idx)}>
                            <img src="/edit.png" alt="Edit this user story" style={{ width: "20px", height: "20px" }} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div id="buttonContainer">
                <button id="exportButton" onClick={downloadUserStories}>
                  Download Stories
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default App;