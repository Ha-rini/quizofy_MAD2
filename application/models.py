from .database import db
from flask_security import UserMixin, RoleMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100), unique = True,nullable=False)
    qualification = db.Column(db.String(100))
    dob = db.Column(db.String)
    fs_uniquifier = db.Column(db.String, unique = True, nullable=False)
    active = db.Column(db.Boolean, default=True)
    roles = db.relationship('Role', backref='bearer', lazy=True, secondary='user_roles')
    #profile_pic = db.Column(db.String(255), nullable=True, default = "pic.jgp")
    scores = db.relationship('Scores', backref='user', lazy=True, cascade='all, delete-orphan')

class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=False)

#many-to-many relationship between users and roles
class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id', ondelete='CASCADE'))

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    image = db.Column(db.String(255), nullable=False)
    chapters = db.relationship('Chapter', backref='subject', lazy=True, cascade='all, delete-orphan')
    
#one-to-many relationship between subject and chapters
class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id', ondelete='CASCADE'))
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True, cascade='all, delete-orphan')
    
#one-to-many relationship between chapter and quizzes
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    date_of_quiz = db.Column(db.String, nullable=False)
    time_duration = db.Column(db.String, nullable=False)
    marks = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    questions = db.relationship('Questions', backref='quiz', lazy=True, cascade='all, delete-orphan')
    scores = db.relationship('Scores', backref='quiz', lazy=True, cascade='all, delete-orphan')
    single_attempt = db.Column(db.Boolean, default=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id', ondelete='CASCADE'))
    

#one-to-many relationship between quiz and questions
class Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'))
    question_statement = db.Column(db.String(255), nullable=False)
    correct_option = db.Column(db.String(255), nullable=False)
    option1 = db.Column(db.String(255), nullable=False)
    option2 = db.Column(db.String(255), nullable=False)
    option3 = db.Column(db.String(255), nullable=False)
    option4 = db.Column(db.String(255), nullable=False)
#    explanation = db.Column(db.String(255), nullable=False)
    #etc: Additional fields (if any)

#one-to-many relationship between quiz and scores and many-to-many with user?
class Scores(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    time_stamp_of_attempt = db.Column(db.String, nullable=False)
    total_scored = db.Column(db.Integer, nullable=False)
    time_taken = db.Column(db.Integer, nullable=True)  # Time taken by the user to complete the quiz (in seconds)
    total_possible_score = db.Column(db.Integer, nullable=False)  # Total possible score for the quiz
    attempts = db.Column(db.Integer, default=1)  # Number of attempts made by the user
    
#check if any extra fields are required in the models