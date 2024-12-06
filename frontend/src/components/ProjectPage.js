import React, { useState, useEffect, useRef} from "react";
import { useParams, useLocation } from 'react-router-dom';
import { Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import LanguageSelector from "./LanguageSelector";


const ProjectPage = () => {

  const [error, setError] = useState("");
  

  const [versions, setVersions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [userStoryIndex, setUserStoryIndex] = useState(0);
  const [requirements, setRequirements] = useState({});
  const [userStories, setUserStories] = useState([]);
  const numberVersion = useRef(0);

  const { projectId } = useParams();
  const location = useLocation(); 
  const { name, version } = location.state || {};

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(requirements.content);

  const [showModal, setShowModal] = useState(false);

  const [editingStory, setEditingStory] = useState(null);
  const [tempContent, setTempContent] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    if(!version){
      fetchProjectContent(projectId);
    }
    else {
      setVersions(version)
    }
    setCurrentIndex(0)
    setUserStoryIndex(0)
  }, [projectId, version]);


  useEffect(() => {
    if(versions.length === 0) return
    setRequirements({content: versions[currentIndex].content, version:versions[currentIndex].version});
    numberVersion.current = versions[currentIndex].user_stories.length
    setEditContent(versions[currentIndex].content)
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


  const handleSubmit = async (projId, reqVersion, newContent) => {
    try {
      setShowModal(true);
      let content = editContent;

      if(!newContent){
        content = requirements.content
      }

      if (!content.trim()) {
        throw new Error("Content cannot be null or an empty string.");
      }

      const response = await fetch("http://localhost:5001/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projId, query: content, req_version:reqVersion, newContent: newContent , language: selectedLanguage}),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
  
      const userStories = data.response.replace("```json", "").replace("```", "")
      
      updateVersion(content, userStories, newContent)
      
    } catch (error) {
      setError(`Failed to generate user stories:  ${error}.`);
      console.error(error);
    }
    finally{
      setShowModal(false);
    }
  };


  const updateVersion = (req, user_stories, newContent) => {
    const updatedVersions = [...versions];
  
    if (newContent) {
      const lastVersion = Math.max(...updatedVersions.map(v => v.version), 0);
      const newReqVersion = {
        version: lastVersion + 1,
        content: req,
        user_stories: [{ version: 1, user_stories }]
      };
      updatedVersions.push(newReqVersion);
    } else {
      const currentVersion = updatedVersions.find(v => v.version === requirements.version);
      if (currentVersion) {
        const lastUSVersion = Math.max(...currentVersion.user_stories.map(us => us.version), 0);
        currentVersion.user_stories.push({ version: lastUSVersion + 1, user_stories });
      }
    }
  
    setVersions(updatedVersions);
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

  const handleEditClickReq = () => {
      setIsEditing(true);
  };

  const handleSaveClick = () => {
    handleSubmit(projectId, requirements.version, true)
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditContent(requirements.content)
  };

  const handleEditClick = (storyIndex) => {
    const storyToEdit = userStories[storyIndex];
    setEditingStory(storyIndex);
    setTempContent(storyToEdit.user_story);
  }

  const handleCancelEdit = () => {
    setEditingStory(null);
    setTempContent("");
  }

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
      <div id="sectionContent">
        <div id="projectContent">
          <LanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
            <div id="sectionRequirements">
                <h3 id="projectName">{name}</h3>
                {isEditing ? (
                  <div className="editReq">
                    <textarea id="reqInput" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                    < div className="versionSelect">
                      <button onClick={handleSaveClick}>Save</button>
                      <button onClick={handleCancelClick}>Cancel</button>
                    </div>
                  </div>
                  ) : (
                  <div>
                    <p>{requirements.content}</p>
                    < div className="versionSelect">
                    <FontAwesomeIcon icon={faPenToSquare} onClick={handleEditClickReq}  style={{ cursor: 'pointer' }}/>
                    <button onClick={goBack} disabled={currentIndex === 0}>⮜ </button>
                    <span>{currentIndex + 1}/{versions.length}</span>
                    <button onClick={goForward} disabled={currentIndex === versions.length - 1}> ⮞</button>
                    </div>
                  </div>
                 )}

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
                  {/*<tbody>
                    {userStories.map((story, idx) => (
                      <tr key={idx}>
                        <td>{story.index}</td>
                        <td>{story.user_story}</td>
                      </tr>
                    ))}*/}
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
                <button id="regenerateButton" onClick={() => handleSubmit(projectId, requirements.version, false)} style={{ marginLeft: '10px' }}>
                  Regenerate User Stories
                </button>
              </div>
              <LoadingModal show={showModal} onHide={() => setShowModal(false)} />
            </div>
        </div>
      </div>
    </>
  );
};
export default ProjectPage;


const LoadingModal = ({ show, onHide }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Body className="text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">generating...</span>
        </Spinner>
        <p className="mt-3">Generating new User Stories, please wait...</p>
      </Modal.Body>
    </Modal>
  );
};
