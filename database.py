from sqlalchemy import and_
from db import db
from models import *

def save_project(name):
   project = Project.query.filter(Project.name == name).first()
   if project:
       return project.id
   new_project = Project(name=name)
   db.session.add(new_project)
   db.session.commit()
   return new_project.id

def get_all_projects():
   return Project.query.all()

def get_project_by_id(project_id):
   return Project.query.get(project_id)

def get_project_contend(project_id):
    project = get_project_by_id(project_id)
    if project:
       return None
    project_contend = []
    original_requirement = Requirements.query.filter(Requirements.project_id == project_id).first()
    user_stories = get_user_stories_by_requiremente_id(original_requirement.id, 0)
    req_dic = {}
    req_dic.version = 0
    req_dic.content = requiremente.content
    req_dic.user_stories = user_stories
    project_contend.append(req_dic)
    
    if (original_requirement.active == False):
        all_vertion = RequirementsHistory.query.filter(RequirementsHistory.original_id == Requirements.id).all()
        for requiremente in all_vertion:
            req_dic = {}
            req_dic.version = requiremente.version
            req_dic.content = requiremente.new_content
            req_dic.user_storys = get_user_stories_by_requiremente_id(requiremente.id_original,  requiremente.version)
            project_contend.append(req_dic)

    return project_contend

def get_user_stories_by_requiremente_id(id, version):
    if(version == 0):
        user_stories = UserStory.query.filter(UserStory.req_id == id).all()
    else:
        user_stories = UserStory.query.filter(and_(UserStory.req_id == id, UserStory.version == version)).all()

    all_content = []

    for user_story in user_stories:
        us_dic = {}
        us_dic.index = user_stories.index

        version_list = []

        version_dic = {}
        version_dic.version = 0
        version_dic.content = user_story.content
        version_dic.feedback = user_story.feedback
        version_list.append(version_dic)
        
        all_vertion = get_user_stories_version_by_id(user_story.id)
        for us in all_vertion:
            version_dic = {}
            version_dic.version = us.version
            version_dic.content = us.new_content
            version_dic.feedback = us.feedback
            version_list.append(version_list)

        us_dic.list = version_list
        all_content.append(us_dic)

    return all_content
            

def get_user_stories_version_by_id(id):
    user_stories =  UserStoryHistory.query.filter(UserStoryHistory.userstory_id == id).all()

    for user_story in user_stories:
        if user_story.status not in ('To Do', 'In Progress', 'Completed'):
            raise ValueError('Status inválido')

    return user_stories



def add_theme(name: str):
    theme = Theme.query.filter(Theme.name == name).first()
    if theme:
        return None

    new_theme = Theme(name=name)
    db.session.add(new_theme)
    db.session.commit()

    return new_theme


def get_all_theme():
    return Theme.query.all()


# def add_epic(name):
#    epic = Epic.query.filter(Epic.name == name).first()
#    if epic:
#        return None
#
#    new_epic = Theme(name=name)
#    db.session.add(new_epic)
#    db.session.commit()
#
#    return new_epic
#
# def get_all_epic():
#    return Epic.query.all()
#
#

def save_user_story(index, content, req_id, feedback=0, theme_id=None, epic_id=None, req_ver = None):
    if(not req_ver):
        user_story = UserStory.query.filter(and_(UserStory.req_id == req_id, UserStory.req_ver == req_ver)).first()
    else:
        user_story = UserStory.query.filter(UserStory.req_id == req_id).first()
    if user_story:
        history_entry = UserStoryHistory(
            userstory_id=user_story.id,
            new_content=user_story.content,
            feedback = user_story.feedback
        )
        db.session.add(history_entry)

        user_story.content = content
        db.session.add(user_story)
    else:
        new_user_story = UserStory(
            index=index,
            content=content,
            feedback=feedback,
            theme_id=theme_id,
            epic_id=epic_id,
            req_id=req_id,
            req_ver=req_ver
        )
        db.session.add(new_user_story)


    db.session.commit()

    return new_user_story.index

# def get_all_userstories():
#    return UserStory.query.all()
#
#
# def update_userstory_feedback(userstory_id, feedback):
#    userstory = UserStory.query.get(userstory_id)
#    if userstory:
#        userstory.feedback = feedback
#        db.session.commit()
#        return userstory
#    return None
#
# def deactivate_userstory(userstory_id):
#    userstory = UserStory.query.get(userstory_id)
#    if userstory:
#        userstory.active = False
#        db.session.commit()
#        return userstory
#    return None
#
def save_requirement(project_id, content):
    requirement = Requirements.query.filter(Requirements.project_id == project_id).first()
    if requirement:
        history_entry = RequirementsHistory(
            original_id=requirement.id,
            new_content=requirement.content
        )
        db.session.add(history_entry)

        requirement.content = content
        db.session.add(requirement)
    else:
        requirement = Requirements(
            project_id=project_id,
            content=content
        )
        db.session.add(requirement)

    db.session.commit()
    return requirement.id
