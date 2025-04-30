from datetime import datetime
from flask import Flask
from application.database import db
from application.models import User, Role, UserRoles, Subject, Chapter, Quiz, Questions, Scores
from application.config import LocalDevelopmentConfig
from flask_security import Security, SQLAlchemyUserDatastore
from flask_security import hash_password
from werkzeug.security import generate_password_hash, check_password_hash
from application.resources import *

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role) 
    
    app.security = Security(app, datastore)
    
    app.app_context().push()
    return app

app=create_app()

with app.app_context():
    db.create_all() #only if it does not exist

    app.security.datastore.find_or_create_role(name='admin', description='Administrator')
    app.security.datastore.find_or_create_role(name='user', description='general user')
    db.session.commit()

    #dob_str = "1990-01-01"
    #dob = datetime.strptime(dob_str, '%Y-%m-%d').date()
    if not app.security.datastore.find_user(email = "user@admin.com"):
        app.security.datastore.create_user(email="user@admin.com",
                                           password=generate_password_hash("adminpass"),
                                           username="admin",                                           
                                           roles=['admin'])
        
    if not app.security.datastore.find_user(email = "user1@gmail.com"):
        app.security.datastore.create_user(email="user1@gmail.com",
                                           password=generate_password_hash("pass@123"),
                                           username="user1",
                                           roles=['user'])
    db.session.commit()

from application.routes import *
    
if __name__ == "__main__":
    app.run() 