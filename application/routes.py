from flask import current_app as app, jsonify
from flask_security import auth_required, roles_required, roles_accepted, current_user

@app.route('/admin')
@auth_required('token') #authentication
@roles_required('admin') #rbac/authorization
def admin_home():
    return {
        "message": "Admin successfully logged in"
    }

@app.route('/user') #dont give user_id to avoid leaking info
@auth_required('token') #authentication
@roles_required('user') #rbac/authorization
def user_home():
    user = current_user
    return jsonify({
        "username": user.username,
        "email": user.email,
        "password": user.password
    })