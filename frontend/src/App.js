
import React, { useState } from "react";  

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

