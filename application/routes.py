from .database import db
from .models import User, Role, UserRoles, Subject, Chapter, Quiz, Questions, Scores
from flask import current_app as app, jsonify, request
from flask_security import auth_required, roles_required, roles_accepted, current_user, login_user, logout_user
from flask_security import hash_password, verify_password
from werkzeug.security import generate_password_hash, check_password_hash

@app.route('/')
def home():
    return "<h1>Home Page</h1>"

@app.route('/api/login', methods=['POST'])
def user_login():
    credentials = request.get_json()
    email = credentials['email']
    password = credentials['password']

    if not email:
        return jsonify({
            "message": "Email is required!"
        }), 400
    
    if not password:
        return jsonify({
            "message": "Password is required!"
        }), 400

    user = app.security.datastore.find_user(email = email)
    if not user:
        return jsonify({
            "message": "User not found"
        }), 404
    
    if user: 
        if check_password_hash(user.password, password):
            # if current_user:
            #     return jsonify({
            #         "message": "User already logged in"
            #     }), 400
               
            login_user(user) #login the user
            
            return jsonify({
                "id": user.id,
                "username": user.username,
                "auth-token": user.get_auth_token()
            }), 200
        
        return jsonify({
            "message": "Invalid credentials!"
        }), 400


@app.route('/api/admin')
@auth_required('token') #authentication
@roles_required('admin') #rbac/authorization
def admin_home():
    return {
        "message": "Admin successfully logged in"
    }

@app.route('/api/user') #dont give user_id to avoid leaking info
@auth_required('token') #authentication
@roles_required('user') #rbac/authorization
def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "password": user.password
    })


@app.route('/api/register', methods=['POST'])
def create_user():
    credentials = request.get_json()
    if not app.security.datastore.find_user(email = credentials['email']):
        app.security.datastore.create_user(email = credentials['email'],
                                           password = generate_password_hash(credentials['password']),
                                           username = credentials['username'],                                           
                                           roles = ['user'])
        db.session.commit()
        return jsonify({
            "message": "User created successfully"
        }), 201
    return jsonify({
            "message": "User already exists!"
        }), 400




