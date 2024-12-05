import React, { useState } from "react";  
import MainContent from './components/MainContent';
import Sidebar from './components/Sidebar';
import Header from "./components/Header";

function App() {
    const [selectedProject, setSelectedProject] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
  return (
    <>
        <Header setSideBarOpen={setIsOpen} isSideBarOpen={isOpen} />
          <div id="main">
              <Sidebar setSelectedProject={setSelectedProject} isOpen={isOpen}/>
              <MainContent selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
          </div>
    </>
  );
}

export default App;