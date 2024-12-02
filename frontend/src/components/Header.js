import React from "react";

const Header = () => {

  return (
    <header>
      <div>
        <p>AI Generator of User Stories</p>
      </div>
      <div>
        <h1>ReqToStory</h1>
      </div>
      <div>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <button type="button" aria-label="Settings" id="settingsButton">
          <i className="fa fa-bars"></i>
        </button>
        <SettingsDropdown />
      </div>
    </header>
  );
};

const SettingsDropdown = () => {
  return (
    <div className="settings-dropdown" id="settingsDropdown">
      <h2>Settings</h2>
      <hr />
      <div className="settings-item">
        <h3>Priority</h3>
        <div className="settings-options">
          <label>
            <input type="radio" name="priority" value="high" />
            High
          </label>
          <label>
            <input type="radio" name="priority" value="medium" />
            Medium
          </label>
          <label>
            <input type="radio" name="priority" value="low" />
            Low
          </label>
        </div>
      </div>
      <div className="settings-item">
        <h3>Group By</h3>
        <div className="settings-options">
          <label>
            <input type="radio" name="groupBy" value="theme" />
            Group by Theme
          </label>
          <label>
            <input type="radio" name="groupBy" value="priority" />
            Group by Priority
          </label>
        </div>
      </div>
      <div className="settings-footer">
        <button className="settings-save-btn">Save Settings</button>
      </div>
    </div>
  );
};

export default Header;