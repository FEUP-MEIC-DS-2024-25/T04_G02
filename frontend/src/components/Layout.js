import React, { useState } from "react";  
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from "./Header";

const Layout = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
        <Header setSideBarOpen={setIsOpen} isSideBarOpen={isOpen} />
          <div id="main">
              <Sidebar isOpen={isOpen}/>
              <Outlet />
          </div>
    </>
  );
};

export default Layout;