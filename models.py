from db import db

class Project(db.Model):
   __tablename__ = 'project'
   __table_args__ = {'schema': 'req_to_story'}
   id = db.Column(db.Integer, primary_key=True)
   name = db.Column(db.String(255), unique=True, nullable=False)

class Requirements(db.Model):
   __tablename__ = 'requirements'
   __table_args__ = {'schema': 'req_to_story'}
   id = db.Column(db.Integer, primary_key=True)
   project_id = db.Column(db.Integer, db.ForeignKey('req_to_story.project.id'))
   content = db.Column(db.Text, nullable=False)
   active = db.Column(db.Boolean, default=True)
   project = db.relationship('Project', backref=db.backref('requirements', lazy=True))

class RequirementsHistory(db.Model):
   __tablename__ = 'requirementshistory'
   __table_args__ = {'schema': 'req_to_story'}
   original_id = db.Column(db.Integer, db.ForeignKey('req_to_story.requirements.id', ondelete='CASCADE'), primary_key=True)
   version = db.Column(db.Integer, primary_key=True, server_default='1')
   new_content = db.Column(db.Text, nullable=False)


class Theme(db.Model):
    __tablename__ = "theme"
    __table_args__ = {"schema": "req_to_story"}
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True, nullable=False)


class Epic(db.Model):
   __tablename__ = 'epic'
   __table_args__ = {'schema': 'req_to_story'}
   id = db.Column(db.Integer, primary_key=True)
   name = db.Column(db.Text, unique=True, nullable=False)
   
class UserStory(db.Model):
   __tablename__ = 'userstory'
   __table_args__ = {'schema': 'req_to_story'}
   index = db.Column(db.Integer, primary_key=True)
   content = db.Column(db.Text, nullable=False)
   feedback = db.Column(db.Integer, db.CheckConstraint('feedback IN (-1, 0, 1)'), default=0)
   active = db.Column(db.Boolean, default=True)
   theme_id = db.Column(db.Integer, db.ForeignKey('req_to_story.theme.id'))
   epic_id = db.Column(db.Integer, db.ForeignKey('req_to_story.epic.id'))
   req_id = db.Column(db.Integer, db.ForeignKey('req_to_story.requirements.id', ondelete='CASCADE'))
   req_ver = db.Column(db.Integer)
   # Relacionamento fixado
   req_version = db.relationship(
       'RequirementsHistory',
       primaryjoin="and_(UserStory.req_id == RequirementsHistory.original_id, UserStory.req_ver == RequirementsHistory.version)",
       foreign_keys=[req_id, req_ver],
       backref=db.backref('userstories', lazy=True)
   )
#
class UserStoryHistory(db.Model):
   __tablename__ = 'userstoryhistory'
   __table_args__ = {'schema': 'req_to_story'}
   userstory_id = db.Column(db.Integer, db.ForeignKey('req_to_story.userstory.index', ondelete='CASCADE'), primary_key=True)
   version = db.Column(db.Integer, primary_key=True, server_default='1')
   new_content = db.Column(db.Text, nullable=False)
   feedback = db.Column(db.Integer, db.CheckConstraint('feedback IN (-1, 0, 1)'), default=0)
#
# class AcceptanceTest(db.Model):
#    __tablename__ = 'acceptancetest'
#    __table_args__ = {'schema': 'req_to_story'}
#    id = db.Column(db.Integer, primary_key=True)
#    userstory_index = db.Column(db.Integer, db.ForeignKey('req_to_story.userstory.index', ondelete='CASCADE'))
#    scenario = db.Column(db.Text, nullable=False)
#    content = db.Column(db.Text, nullable=False)
#
#    userstory = db.relationship('UserStory', backref=db.backref('acceptancetests', lazy=True))
