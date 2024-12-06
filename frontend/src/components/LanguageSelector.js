import React from "react";

const LanguageSelector = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div id="languageSelector">
      <select
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        className="language-dropdown"
      >
        <option value="en">English</option>
        <option value="pt">Português</option>
        <option value="es">Español</option>
      </select>
    </div>
  );
};

export default LanguageSelector;