from flask_restful import Api, Resource, reqparse
from .models import *
from flask_security import auth_required, roles_required, roles_accepted, current_user

api = Api()

def roles_list(roles):
    roles_list = []
    for role in roles:
        roles_list.append(role.name)
    return roles_list

parser = reqparse.RequestParser()
parser.add_argument('name', type=str)
parser.add_argument('description', type=str)
parser.add_argument('image', type=str)

class SubjectsApi(Resource):
    @auth_required('token')
    # @roles_required('admin')
    def get(self):
        subjects = Subject.query.all()
        subjects_json = []
        for subject in subjects:
            this_subject = {}
            this_subject["id"] = subject.id
            this_subject["name"] = subject.name
            this_subject['description'] = subject.description
            this_subject['image'] = subject.image
            subjects_json.append(this_subject)
        print(subjects_json)
        if subjects_json:
            return subjects_json, 200
        
        return {
                "message": "No subjects found"
        }, 404
        
    @auth_required('token')
    @roles_required('admin')
    def post(self):
        args = parser.parse_args()
        if not (args['name'] and args['description'] and args['image']):
            return {"message": "All fields (name, description, image) are required"}, 400
        if Subject.query.filter_by(name=args['name']).first():
            return {"message": "Subject with this name already exists"}, 400
        
        try:
            subject = Subject(name=args['name'], 
                            description=args['description'], 
                            image=args['image'])
            db.session.add(subject)
            db.session.commit()
            return {
                "message": "Subject created successfully"
            }, 201
        except:
            return {
                "message": "Error creating subject: One or more required fields are missing"
            }, 400
    
    @auth_required('token')
    @roles_required('admin')
    def put(self, sub_id):
        args = parser.parse_args()
        subject = Subject.query.get(sub_id)

        if not (args['name'] and args['description'] and args['image']):
            return {"message": "All fields (name, description, image) are required"}, 400
        

        if subject:
            try:
                subject.name = args['name']
                subject.description = args['description']
                subject.image = args['image']
                db.session.commit()
                return {
                    "message": "Subject updated successfully"
                }, 200
            except:
                return {
                    "message": "Error updating subject: One or more required fields are missing"
                }, 400
            
    @auth_required('token')
    @roles_required('admin')
    def delete(self, sub_id):
        subject = Subject.query.get(sub_id)

        if subject:
            db.session.delete(subject)
            db.session.commit()
            return {
                "message": "Subject deleted successfully"
            }, 200
        return {
            "message": "Subject not found"
        }, 404
       
   
api.add_resource(SubjectsApi, '/api/subjects/get',
                            '/api/subjects/create',
                            '/api/subjects/update/<int:sub_id>',
                            '/api/subjects/delete/<int:sub_id>')    

class ChaptersApi(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        chapters = Chapter.query.all()
        chapters_json = []
        for chapter in chapters:
            this_chapter = {}
            this_chapter["id"] = chapter.id
            this_chapter["name"] = chapter.name
            this_chapter['description'] = chapter.description
            this_chapter['subject_name'] = chapter.subject.name
            chapters_json.append(this_chapter)
            
        if this_chapter:
            return chapters_json, 200
        
        return {
                "message": "No chapters found"
        }, 404
    
api.add_resource(ChaptersApi, '/api/chapters/get')

#class QuizApi(Resource):



class QuizscoresApi(Resource):
    @auth_required('token')
    @roles_accepted('admin', 'user')
    def get(self):
        scores = []
        scores_json = []
        if "admin" in roles_list(current_user.roles):
            scores = Scores.query.all()
        else:
            scores = current_user.scores
        for score in scores:
            this_score = {}
            this_score["id"] = score.id
            this_score["quiz_id"] = score.quiz_id
            this_score["user_id"] = score.user_id
            this_score["time_stamp_of_attempt"] = score.time_stamp_of_attempt
            this_score["total_scored"] = score.total_scored
            scores_json.append(this_score)

        if scores_json:
            return scores_json, 200
        
        return {
            "message": "No scores found"
            }, 404

api.add_resource(QuizscoresApi, '/api/quizscores/get')
                
                    


        