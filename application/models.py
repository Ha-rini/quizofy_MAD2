from .database import db
from flask_security import UserMixin, RoleMixin

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(100), nullable=False)
    qualification = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    fs_uniquifier = db.Column(db.String, unique = True nullable=False)
    active = db.Column(db.Boolean, default=True)
    roles = db.relationship('Role', backref='bearer', lazy=True, secondary='user_roles')

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

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id', ondelete='CASCADE'))
    quizzes = db.relationship('Quiz', backref='chapter', lazy=True, cascade='all, delete-orphan')

class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id', ondelete='CASCADE'))
    date_of_quiz = db.Column(db.Date, nullable=False)
    time_duration = db.Column(db.Time, nullable=False)
    marks = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(255), nullable=False)
    questions = db.relationship('Questions', backref='quiz', lazy=True, cascade='all, delete-orphan')
    scores = db.relationship('Scores', backref='quiz', lazy=True, cascade='all, delete-orphan')

class Questions(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'))
    question_statement = db.Column(db.String(255), nullable=False)
    correct_option = db.Column(db.String(255), nullable=False)
    option1 = db.Column(db.String(255), nullable=False)
    option2 = db.Column(db.String(255), nullable=False)
    option3 = db.Column(db.String(255), nullable=False)
    option4 = db.Column(db.String(255), nullable=False)
    #explanation = db.Column(db.String(255), nullable=False)
    #etc: Additional fields (if any)

class Scores(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id', ondelete='CASCADE'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'))
    time_stamp_of_attempt = db.Column(db.DateTime, nullable=False)
    total_scored = db.Column(db.Integer, nullable=False)

#check if any extra fields are required in the models