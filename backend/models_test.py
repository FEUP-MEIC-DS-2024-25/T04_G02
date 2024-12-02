from google.cloud import firestore
from db import db
class Project:
    def __init__(self, id=None, name=None):
        self.id = id
        self.name = name

    @classmethod
    def from_firestore(cls, doc):
        data = doc.to_dict()
        return cls(id=doc.id, name=data.get("name"))

    def save(self):
        doc_ref = db.collection("ReqToStory").document(self.id) if self.id else db.collection("ReqToStory").document()
        doc_ref.set({"name": self.name})
        self.id = doc_ref.id 
        return self

    @staticmethod
    def get_by_id(project_id):
        doc_ref = db.collection("ReqToStory").document(project_id).get()
        if doc_ref.exists:
            return Project.from_firestore(doc_ref)
        return None

    @staticmethod
    def get_all():
        docs = db.collection("ReqToStory").stream()
        return [Project.from_firestore(doc) for doc in docs]

    def delete(self):
        if self.id:
            db.collection("ReqToStory").document(self.id).delete()



class Requirement:
    def __init__(self, id=None, content=None, project_id=None, version=1):
        self.id = id
        self.content = content
        self.project_id = project_id
        self.version = version  # Novo campo para armazenar a versão

    def save(self):
        if not self.project_id:
            raise ValueError("Project ID é necessário para salvar o requisito.")
        
        project_ref = db.collection("Projects").document(self.project_id)
        
        requirements_ref = project_ref.collection("Requirements")
        
    
        if self.id:
            doc_ref = requirements_ref.document(self.id)
            doc_ref.set({
                "content": self.content,
                "project_id": self.project_id,
                "version": self.version
            }, merge=True)
        else:
            
            doc_ref = requirements_ref.document()
            doc_ref.set({
                "content": self.content,
                "project_id": self.project_id,
                "version": self.version
            })

        # Atualiza o ID do requisito após ser salvo (caso seja um novo requisito)
        self.id = doc_ref.id
        
        return self

    @classmethod
    def get_by_id(cls, project_id, requirement_id):
        doc_ref = db.collection("Projects").document(project_id).collection("Requirements").document(requirement_id).get()
        
        if doc_ref.exists:
            data = doc_ref.to_dict()
            return cls(id=doc_ref.id, content=data.get("content"), project_id=data.get("project_id"), version=data.get("version"))
        else:
            return None

    @classmethod
    def get_all_by_project_id(cls, project_id):
        docs = db.collection("Projects").document(project_id).collection("Requirements").stream()
        return [cls(id=doc.id, content=doc.to_dict().get("content"), project_id=project_id, version=doc.to_dict().get("version")) for doc in docs]

    def increment_version(self):
        self.version += 1

    def delete(self):
        if self.id:
            doc_ref = db.collection("Projects").document(self.project_id).collection("Requirements").document(self.id)
            doc_ref.delete()


class UserStory:
    def __init__(self, index, content, feedback = 0, project_id=None,  req_version=1, theme = None , epic = None):
        self.index = index
        self.content = content
        self.feedback = feedback
        self.project_id = project_id
        self.req_version = req_version  
        self.theme = theme
        self.epic = epic 

    def save(self):
        if not self.project_id:
            raise ValueError("Project ID é necessário para salvar o requisito.")
        
        project_ref = db.collection("ReqtoStory").document(self.project_id)
        
        requirements_ref = project_ref
        
    
        if self.id:
            doc_ref = requirements_ref.document(self.id)
            doc_ref.set({
                "content": self.content,
                "project_id": self.project_id,
                "version": self.version
            }, merge=True)
        else:
            
            doc_ref = requirements_ref.document()
            doc_ref.set({
                "content": self.content,
                "project_id": self.project_id,
                "version": self.version
            })

        # Atualiza o ID do requisito após ser salvo (caso seja um novo requisito)
        self.id = doc_ref.id
        
        return self

    @classmethod
    def get_by_id(cls, project_id, requirement_id):
        doc_ref = db.collection("Projects").document(project_id).collection("Requirements").document(requirement_id).get()
        
        if doc_ref.exists:
            data = doc_ref.to_dict()
            return cls(id=doc_ref.id, content=data.get("content"), project_id=data.get("project_id"), version=data.get("version"))
        else:
            return None

    @classmethod
    def get_all_by_project_id(cls, project_id):
        docs = db.collection("Projects").document(project_id).collection("Requirements").stream()
        return [cls(id=doc.id, content=doc.to_dict().get("content"), project_id=project_id, version=doc.to_dict().get("version")) for doc in docs]

    def increment_version(self):
        self.version += 1

    def delete(self):
        if self.id:
            doc_ref = db.collection("Projects").document(self.project_id).collection("Requirements").document(self.id)
            doc_ref.delete()




#############################################################################################
class Project:
    def __init__(self, db):
        self.db = db

    def get_all_projects(self):
        projects_ref = self.db.collection("ReqToStory").stream()
        return [{"id": project.id, "name": project.to_dict().get("name")} for project in projects_ref]

    def save_project(self, name):
        projects_ref = self.db.collection("ReqToStory")
        existing_project = projects_ref.where("name", "==", name).stream()

        for project in existing_project:
            return project.id

        new_project = projects_ref.add({"name": name})
        return new_project[1].id

    def get_project_by_id(self, project_id):
        project_ref = self.db.collection("ReqToStory").document(project_id).get()
        if project_ref.exists:
            return {"id": project_ref.id, **project_ref.to_dict()}
        return None

    def get_project_content(self, project_id):
        project = self.get_project_by_id(project_id)
        if not project:
            return None

        requirements = Requirement(self.db)
        requirements_ref = self.db.collection("ReqToStory").document(project_id).collection("Requirements").stream()

        project_content = []
        for requirement in requirements_ref:
            original_data = requirement.to_dict()
            user_stories = requirements.get_user_stories(project_id, requirement.id)

            req_dict = {
                "version": original_data.get("version"),
                "content": original_data.get("content"),
                "user_stories": user_stories,
            }
            project_content.append(req_dict)

        return project_content


class Requirement:
    def __init__(self, db):
        self.db = db

    def save_requirement(self, project_id, content):
        requirements_ref = self.db.collection("ReqToStory").document(project_id).collection("Requirements")
        existing_requirement = list(requirements_ref.stream())

        requirement = requirements_ref.document()
        requirement.set({
            "version": len(existing_requirement) + 1,
            "content": content
        })

        return requirement.id

    def get_user_stories(self, project_id, req_id):
        user_story_manager = UserStory(self.db)
        user_stories_ref = self.db.collection("ReqToStory").document(project_id).collection("Requirements").document(req_id).collection("UserStories")

        user_stories = user_stories_ref.stream()
        all_content = []
        for user_story in user_stories:
            story_data = user_story.to_dict()
            us_dict = {
                "index": story_data.get("index"),
                "versions": user_story_manager.get_versions(user_stories_ref, user_story.id)
            }
            all_content.append(us_dict)

        return all_content


class UserStory:
    def __init__(self, db):
        self.db = db

    def save_user_story(self, project_id, req_id, index, content, feedback=0, theme_id=None, epic_id=None):
        user_stories_ref = self.db.collection("ReqToStory").document(project_id).collection("Requirements").document(req_id).collection("UserStories")
        existing_user_story_ref = user_stories_ref.where("index", "==", index)

        existing_story = list(existing_user_story_ref.stream())
        if existing_story:
            story = existing_story[0]
            story_ref = user_stories_ref.document(story.id)

            story_ref.collection("History").add({
                "version": len(list(story_ref.collection("History").stream())) + 1,
                "content": content,
                "feedback": feedback
            })
        else:
            new_story = {
                "index": index,
                "content": content,
                "feedback": feedback,
                "theme_id": theme_id,
                "epic_id": epic_id,
            }
            user_stories_ref.add(new_story)

        return index

    def get_versions(self, user_stories_ref, user_story_id):
        histories = user_stories_ref.document(user_story_id).collection("History").stream()
        return [{"version": history.to_dict().get("version"), "content": history.to_dict().get("content"), "feedback": history.to_dict().get("feedback")} for history in histories]
