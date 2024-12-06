import React, { useState } from "react";  
//import MainContent from './components/MainContent';
//import Sidebar from './components/Sidebar';
//import Header from "./components/Header";
//
//function App() {
//    const [selectedProject, setSelectedProject] = useState(null);
//    const [isOpen, setIsOpen] = useState(true);
//  return (
//    <>
//        <Header setSideBarOpen={setIsOpen} isSideBarOpen={isOpen} />
//          <div id="main">
//              <Sidebar setSelectedProject={setSelectedProject} isOpen={isOpen}/>
//              <MainContent selectedProject={selectedProject} setSelectedProject={setSelectedProject} />
//          </div>
//    </>
//  );
//}

// App.js

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InputSection from './components/InputSection';
import ProjectPage from './components/ProjectPage';
import Layout from "./components/Layout";

const App = () => {
  const [update, setUpdate] = useState(false);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout update = {update} setUpdate = {setUpdate}/>}>
          <Route index element={<InputSection  setUpdate = {setUpdate}/>} />
          <Route path="project/:projectId" element={<ProjectPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
