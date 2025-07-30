from sqlalchemy import func
from application.tasks import csv_report, daily_reminder, monthly_report
from .database import db
from .models import User, Role, UserRoles, Subject, Chapter, Quiz, Questions, Scores
from flask import current_app as app, jsonify, render_template, request, send_from_directory
from flask_security import auth_required, roles_required, roles_accepted
from flask_login import current_user, login_user, logout_user
from flask_security import hash_password, verify_password
from werkzeug.security import generate_password_hash, check_password_hash
from .utils import roles_list
from celery.result import AsyncResult

@app.route('/')
def home():
    return render_template('index.html') 


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
    
    if user: 
        if check_password_hash(user.password, password):
            # if current_user:
            #     return jsonify({
            #         "message": "User already logged in"
            #     }), 400
               
            #login the user
            login_user(user)
            print(current_user)
            
            
            return jsonify({
                "id": user.id,
                "username": user.username,
                "auth-token": user.get_auth_token(),
                "roles": roles_list(user.roles)
            }), 200
        else:
            return jsonify({
                "message": "Invalid credentials!"
            }), 400
        
    else:
        return jsonify({
            "message": "User not found"
        }), 404

@app.route('/api/user/role')
@auth_required('token')
def get_user_role():
    user = current_user
    roles = [role.name for role in user.roles]
    return jsonify({'role': roles[0] if roles else 'user'})


@app.route('/api/admin')
@auth_required('token') #authentication
@roles_required('admin') #rbac/authorization
def admin_home():
    return {
        "message": "Admin successfully logged in"
    }

@app.route('/api/userdashboard') #dont give user_id to avoid leaking info
@auth_required('token') #authentication
@roles_required('user') #rbac/authorization
def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "roles": roles_list(user.roles)
    }), 200


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


# @app.route('/api/logout')
# @auth_required('token') #authentication
# def user_logout():
#     if current_user.is_authenticated:
#         logout_user()
#         return jsonify({
#             "message": "User logged out successfully"
#         }), 200
#     return jsonify({
#         "message": "User not logged in"
#     }), 400


# @app.route("/api/admin/stats")
# @auth_required('token') #authentication
# def admin_statistics():
#     total_students = User.query.count()
#     total_subjects = Subject.query.count()
#     total_chapters = Chapter.query.count()
#     total_quizzes = Quiz.query.count()

#     # Subject-wise average performance
#     subject_scores = db.session.query(
#         Subject.name,
#         db.func.avg(Scores.total_scored).label("avg_score")
#     ).join(Chapter).join(Quiz).join(Scores).group_by(Subject.id).all()

#     subject_scores_list = [{"subject": s[0], "avg_score": round(s[1], 2)} for s in subject_scores]

#     # User-wise average quiz performance
#     user_scores = db.session.query(
#         User.username,
#         db.func.avg(Scores.total_scored).label("avg_score")
#     ).join(Scores).group_by(User.id).limit(10).all()

#     user_scores_list = [{"username": u[0], "avg_score": round(u[1], 2)} for u in user_scores]

#     return jsonify({
#         "total_students": total_students,
#         "total_subjects": total_subjects,
#         "total_chapters": total_chapters,
#         "total_quizzes": total_quizzes,
#         "subject_scores": subject_scores_list,
#         "user_scores": user_scores_list
#     })

@app.route('/api/user/me')
@auth_required('token') #authentication
def get_user_info():
    return jsonify({"id": current_user.id, "username": current_user.username})

@app.route('/api/score/by_user')
@auth_required('token') #authentication
def get_user_scores():
    scores = Scores.query.filter_by(user_id=current_user.id).all()
    return jsonify([
        {
            "quiz_id": s.quiz_id,
            "total_scored": s.total_scored,
            "total_possible_score": s.total_possible_score,
            "time_stamp_of_attempt": s.time_stamp_of_attempt,
            "attempts": s.attempts
        } for s in scores
    ])


@app.route('/api/export') # manually trigger the task
def export_csv():
    result = csv_report.delay() #async object
    return jsonify({
        "message": "CSV download initiated",
        "id": result.id,
        "result": result.result
    }), 202

@app.route('/api/csv_result/<id>') # just to check the status of the result
def csv_result(id):
    res = AsyncResult(id)
    return send_from_directory('static', res.result)

@app.route('/api/mail')
def send_monthly_report():
    res = monthly_report.delay()
    return {
        "res": res.result,
    }

@app.route('/api/daily_reminder')
def send_daily_reminder():
    res = daily_reminder.delay()
    return {
        "res": res.result,
    }