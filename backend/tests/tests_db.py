import unittest
from unittest.mock import MagicMock
from db import db
from database import * 

class TestGetAllProjects(unittest.TestCase):

    def test_get_all_projects(self):
        # Arrange: Mock Firestore responses
        mock_project_1 = MagicMock()
        mock_project_1.id = "1"
        mock_project_1.to_dict.return_value = {"name": "Project 1"}

        mock_project_2 = MagicMock()
        mock_project_2.id = "2"
        mock_project_2.to_dict.return_value = {"name": "Project 2"}

        # Mock the collection stream to return these two mock projects
        db.collection = MagicMock(return_value=MagicMock(stream=MagicMock(return_value=[mock_project_1, mock_project_2])))

        # Act: Call the function
        result = get_all_projects()

        # Assert: Check if the results are as expected
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["name"], "Project 1")
        self.assertEqual(result[1]["name"], "Project 2")
        self.assertEqual(result[0]["id"], "1")
        self.assertEqual(result[1]["id"], "2")

class TestGetProjectById(unittest.TestCase):

    def test_get_project_by_id_existing(self):
        # Arrange: Mock Firestore response for an existing project
        mock_project = MagicMock()
        mock_project.id = "1"
        mock_project.exists = True

        db.collection = MagicMock(return_value=MagicMock(document=MagicMock(return_value=MagicMock(get=MagicMock(return_value=mock_project)))))

        # Act: Call the function
        result = get_project_by_id("1")

        # Assert: Check if the project was found
        self.assertEqual(result, {"id": "1"})

    def test_get_project_by_id_non_existing(self):
        # Arrange: Mock Firestore response for a non-existing project
        mock_project = MagicMock()
        mock_project.exists = False

        db.collection = MagicMock(return_value=MagicMock(document=MagicMock(return_value=MagicMock(get=MagicMock(return_value=mock_project)))))

        # Act: Call the function
        result = get_project_by_id("nonexistent_id")

        # Assert: Check if the result is None
        self.assertIsNone(result)


class TestGetProjectContent(unittest.TestCase):

    def test_get_project_content(self):
        # Arrange: Mock Firestore responses for project, requirements, and user stories
        mock_project = MagicMock()
        mock_project.id = "1"
        mock_project.exists = True

        mock_requirement = MagicMock()
        mock_requirement.id = "req1"
        mock_requirement.to_dict.return_value = {"version": 1, "content": "Some content"}
        
        mock_user_stories = MagicMock()
        mock_user_stories.stream.return_value = [MagicMock(to_dict=MagicMock(return_value={"version": 1, "user_stories": ["Story 1"]}))]

        db.collection = MagicMock(return_value=MagicMock(document=MagicMock(return_value=MagicMock(get=MagicMock(return_value=mock_project)))))
        db.collection().document().collection().stream = MagicMock(return_value=[mock_requirement])

        # Act: Call the function
        result = get_project_content("1")

        # Assert: Check if the project content matches the expected result
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["content"], "Some content")
        self.assertEqual(result[0]["user_stories"], [{"version": 1, "user_stories": ["Story 1"]}])

class TestSaveProject(unittest.TestCase):

    def test_save_project_existing(self):
        # Arrange: Mock Firestore responses to simulate an existing project
        mock_project = MagicMock()
        mock_project.id = "1"
        mock_project.name = "Existing Project"
        mock_project.n_versions = 2

        # Mock the query that would normally fetch the project based on the name
        mock_collection.return_value.where.return_value.stream.return_value = [mock_project]
        mock_collection = MagicMock()
        mock_collection.where.return_value.stream.return_value = [mock_project]  # Simulating a response with a single project
        db.collection = MagicMock(return_value=mock_collection)

        # Act: Call the function to save the project
        result = save_project("Existing Project")

        # Assert: Check if the function returns the correct project id and version
        self.assertEqual(result, ("1", 2))

        # Verify that the where query was executed to find the project by name
        mock_collection.where.assert_called_with("name", "==", "Existing Project")
        mock_collection.stream.assert_called_once()  

    def test_save_project_new(self):
        # Arrange: Mock Firestore responses to simulate a new project creation
        mock_collection = MagicMock()
        db.collection = MagicMock(return_value=mock_collection)
    
        # Simulate that there are no existing projects with the given name
        mock_collection.where.return_value.stream.return_value = []  # No projects found
    
        # Mock the creation of a new project
        new_project = MagicMock()
        new_project.id = "2"  # Explicitly set the id for the new document
        mock_collection.document.return_value = new_project  # Simulate document creation
        new_project.set = MagicMock()  # Mock the set method for the document
    
        # Act: Call the function to save the project
        result = save_project("New Project")
    
        # Assert: Check if the correct new project id and version is returned
        self.assertEqual(result, ("2", 0))
    
        # Ensure that the set method was called to create the new project
        new_project.set.assert_called_once_with({"name": "New Project", "n_versions": 0})


class TestSaveRequirement(unittest.TestCase):

    def test_save_new_requirement(self):
        # Arrange: Prepare inputs
        project_info = ("1", 0)
        content = "New requirement content"
        
        # Mock Firestore interactions for the requirement
        db.collection = MagicMock(return_value=MagicMock(document=MagicMock(return_value=MagicMock(collection=MagicMock(return_value=MagicMock(document=MagicMock()))))))

        # Act: Call the function
        result = save_requirement(project_info, content, True)

        # Assert: Ensure the requirement ID is returned
        self.assertIsNotNone(result)

class TestSaveUserStories(unittest.TestCase):

    def test_save_user_stories(self):
        # Arrange: Prepare inputs and mock Firestore interactions
        project_id = "1"
        req_id = "req1"
        user_stories = ["Story 1", "Story 2"]

        # Mock Firestore interactions for the requirement document
        mock_req_ref = MagicMock()
        mock_req_ref.exists = True
        mock_req_ref.to_dict.return_value = {"n_us_versions": 0}

        # Mock the requirement's user stories collection
        mock_user_stories_collection = MagicMock()
        mock_user_stories_doc = MagicMock()
        mock_user_stories_collection.document.return_value = mock_user_stories_doc

        # Mock Firestore chain
        db.collection.return_value.document.return_value = mock_req_ref
        mock_req_ref.collection.return_value = mock_user_stories_collection

        # Mock methods
        mock_user_stories_doc.set = MagicMock()
        mock_req_ref.update = MagicMock()

        # Act: Call the function
        save_user_stories(project_id, req_id, user_stories)

        # Assert: Ensure the user stories are saved and the version count is updated
        mock_user_stories_doc.set.assert_called_once_with({
            "version": 1,
            "user_stories": user_stories
        })
        mock_req_ref.update.assert_called_once_with({"n_us_versions": 1})