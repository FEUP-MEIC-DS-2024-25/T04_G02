import React, { useState } from "react";  
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from "./Header";

const Layout = ({update, setUpdate}) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
        <Header setSideBarOpen={setIsOpen} isSideBarOpen={isOpen} />
          <div id="main">
              <Sidebar isOpen={isOpen} update = {update} setUpdate={setUpdate}/>
              <Outlet />
          </div>
    </>
  );
};

export default Layout;