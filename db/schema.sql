DROP SCHEMA IF EXISTS req_to_story CASCADE;

CREATE SCHEMA req_to_story;

SET search_path TO req_to_story;

CREATE TABLE Project(
    id SERIAL PRIMARY KEY, 
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE Requirements (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES Project(id),
    content TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE RequirementsHistory (
    original_id INTEGER REFERENCES Requirements(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    new_content TEXT NOT NULL,
    PRIMARY KEY(original_id, version)
);

CREATE TABLE Theme (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE Epic (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE UserStory (
    index INTEGER PRIMARY KEY,
    content TEXT NOT NULL,
    feedback INTEGER CHECK (feedback IN (-1, 0, 1)) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    theme_id INTEGER REFERENCES Theme(id),
    epic_id INTEGER REFERENCES Epic(id),
    req_id INTEGER REFERENCES Requirements(id)  ON DELETE CASCADE,
    req_ver INTEGER DEFAULT NULL,
    FOREIGN KEY (req_id, req_ver) REFERENCES RequirementsHistory(original_id, version)  ON DELETE CASCADE
);

CREATE TABLE UserStoryHistory (
    userstory_id INTEGER REFERENCES UserStory(index) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    new_content TEXT NOT NULL,
    feedback INTEGER CHECK (feedback IN (-1, 0, 1)) DEFAULT 0,
    PRIMARY KEY(userstory_id, version)
);

CREATE TABLE AcceptanceTest (
    id SERIAL PRIMARY KEY,
    userstory_index INTEGER REFERENCES UserStory(index)  ON DELETE CASCADE,
    scenario TEXT NOT NULL,
    content TEXT NOT NULL
);


CREATE OR REPLACE FUNCTION increment_version_requirements()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := COALESCE(
    (SELECT MAX(version) + 1 FROM RequirementsHistory WHERE original_id = NEW.original_id),
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_version_trigger_requirements
BEFORE INSERT ON RequirementsHistory
FOR EACH ROW
EXECUTE FUNCTION increment_version_requirements();


CREATE OR REPLACE FUNCTION increment_version_userstory()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := COALESCE(
    (SELECT MAX(version) + 1 FROM UserStoryHistory WHERE userstory_id = NEW.userstory_id),
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_version_trigger_userstory
BEFORE INSERT ON UserStoryHistory
FOR EACH ROW
EXECUTE FUNCTION increment_version_userstory();
