import React, { useState, useEffect, useRef} from "react";
import ModalInfo from "./ModalInfo";


const MainContent = ({selectedProject, setSelectedProject}) => {
  const [reqInput, setReqInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const [versions, setVersions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [userStoryIndex, setUserStoryIndex] = useState(0);
  const [requirements, setRequirements] = useState("");
  const [userStories, setUserStories] = useState([]);

  const currentProj = useRef(null);
  const numberVersion = useRef(0);

  useEffect(() => {
    if(selectedProject !== null && selectedProject.id !== currentProj.current){
      fetchProjectContent(selectedProject.id);
      setCurrentIndex(0)
      setUserStoryIndex(0)
      currentProj.current = selectedProject.id;
    }
    if(selectedProject === null){
      setVersions([])
      setCurrentIndex(0)
      setUserStoryIndex(0)
      setRequirements("")
      setUserStories([])
      currentProj.current = null
      numberVersion.current = 0
    }
  }, [selectedProject]);

  useEffect(() => {
    if(versions.length === 0) return
    setRequirements(versions[currentIndex].content);
    numberVersion.current = versions[currentIndex].user_stories.length
  }, [currentIndex, versions]); 

  useEffect(() => {
    if (versions.length === 0 || !versions[currentIndex] || !versions[currentIndex].user_stories) return;
    const userStories = versions[currentIndex].user_stories[userStoryIndex].user_stories;
    setUserStories(JSON.parse(userStories));
  }, [currentIndex, versions, userStoryIndex]);

  const fetchProjectContent = async (projectId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/project/${projectId}/content`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }
      const data = await response.json();
      const content = data.response
      setVersions(content)
    } catch (error) {
      console.error(error);
    }
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setUserStoryIndex(0);
    }
  };

  
  const goForward = () => {
    if (currentIndex < versions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserStoryIndex(0);
    }
  };

  const goBackUS = () => {
    if (userStoryIndex > 0) {
        setUserStoryIndex(userStoryIndex - 1);
    }
  };

  
  const goForwardUS = () => {
    if (userStoryIndex < numberVersion.current - 1) {
        setUserStoryIndex(userStoryIndex + 1);
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
      let name = nameInput;
      let content = reqInput;
      if (file) {
        const fileContent = await file.text();
        content = fileContent;
      }

      if (!name || name.trim() === "") {
        throw new Error("Name cannot be null or an empty string.");
      }
      if (!content || content.trim() === "") {
        throw new Error("Content cannot be null or an empty string.");
      }

      const response = await fetch("http://localhost:5001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, query: content }),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data)
      const projectId = parseInt(data.response.project_id)
      const userStories = data.response.user_stories.replace("```json", "").replace("```", "")
      setSelectedProject(projectId)
      //updateVersion(name, projectId, content,userStories)
      
    } catch (error) {
      setError(`Failed to generate user stories:  ${error}.`);
      console.error(error);
    }
  };

  const updateVersion = (projName, projId, requirements, user_stories) => {
    if(selectedProject === null){
      const userSories = {
        "version": 1,
        "user_stories": user_stories
      }
      const version1 = {
        "verstion": 1,
        "content":requirements,
        "user_stories": [userSories]
      }
      const versions = [version1]
      setVersions(versions)
      currentProj.current = projId 
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
      <div id="sectionContent">
        {selectedProject === null? (
        <div id="sectionInput">
          <h1>User Story Generator</h1>
          <ModalInfo />
          <input
            id="nameInput"
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Project name"
            maxLength={255}
          />
          <textarea
            id="reqInput"
            value={reqInput}
            onChange={(e) => setReqInput(e.target.value)}
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
          
          <button id="submitButton" onClick={handleSubmit}>Generate User Stories</button>
        </div>
          ) : (
        <div id="projectContent">
            <div id="sectionRequirements">
                <h3 id="projectName">{selectedProject.name}</h3>
                <p>{requirements}</p>
                <div className="versionSelect">
                    <button onClick={goBack} disabled={currentIndex === 0}>⮜ </button>
                    <span>{currentIndex + 1}/{versions.length}</span>
                    <button onClick={goForward} disabled={currentIndex === versions.length - 1}> ⮞</button>
                </div>
            </div>
            <div id="sectionUserStories">
              <h2>Generated User Stories</h2>
              <div id="tableContainer">
                <table id="userStoriesTable">
                  <thead>
                    <tr>
                      <th>Index</th>
                      <th>User Story</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userStories.map((story, idx) => (
                      <tr key={idx}>
                        <td>{story.index}</td>
                        <td>{story.user_story}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="versionSelect">
                    <button onClick={goBackUS} disabled={userStoryIndex === 0}>⮜ </button>
                    <span>{userStoryIndex + 1}/{numberVersion.current}</span>
                    <button onClick={goForwardUS} disabled={userStoryIndex === numberVersion.current - 1}> ⮞</button>
              </div>
              <div id="buttonContainer">
                <button id="exportButton" onClick={downloadUserStories}>
                  Download Stories
                </button>
              </div>
            </div>
        </div> ) }
      </div>
    </>
  );
};
export default MainContent;