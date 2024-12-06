import React, { useState } from "react";
import ModalInfo from "./ModalInfo";
import { useNavigate } from 'react-router-dom';
import { Modal, Spinner } from "react-bootstrap";
import LanguageSelector from "./LanguageSelector";

const InputSection = ({setUpdate}) => {
  const [reqInput, setReqInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      if (!["text/plain", "text/markdown", "text/csv"].includes(selectedFile.type)) {
        setError("Only text files (.txt, .md, .csv) are supported.");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleSubmit = async () => {
    try {

      setShowModal(true);
      let name = nameInput;
      let content = reqInput;
      if (file) {
        const fileContent = await file.text();
        content = fileContent;
      }

      if (!nameInput.trim()) {
        throw new Error("Name cannot be null or an empty string.");
      }
      if (!content.trim()) {
        throw new Error("Content cannot be null or an empty string.");
      }

      const response = await fetch("http://localhost:5001/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name, query: content, language: selectedLanguage}),
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data)
      const projectId = parseInt(data.response.project_id)
      const userStories = data.response.user_stories.replace("```json", "").replace("```", "")
      const version = createVersion(projectId, content, userStories)
      console.log(version)

      setShowModal(false);
      setUpdate(true);

      navigate(`/project/${projectId}`, {
        state: { name:name},
      });
      
    } catch (error) {
      setError(`Failed to generate user stories:  ${error}.`);
      console.error(error);
    }
    finally{
      setShowModal(false);
    }
    
  };

  const createVersion = (requirements, user_stories) => {
    const userStories = {
      "version": 1,
      "user_stories": user_stories
    }
    const version1 = {
      "version": 1,
      "content": requirements,
      "user_stories": [userStories]
    }
    const versions = [version1]
    return versions
  }

  return (
    <>
    <div id="sectionInput">
      <h1>User Story Generator</h1>
      <ModalInfo />
      <LanguageSelector
         selectedLanguage={selectedLanguage}
         onLanguageChange={setSelectedLanguage}
      />
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
        rows={10}
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
      <LoadingModal show={showModal} onHide={() => setShowModal(false)} />
    </div>
    </>
  );
};

export default InputSection;




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
          <span className="visually-hidden">Generating...</span>
        </Spinner>
        <p className="mt-3">Generating, please wait...</p>
      </Modal.Body>
    </Modal>
  );
};

