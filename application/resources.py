from flask_cache import cache
from flask import request
from flask_restful import Api, Resource, reqparse
from .models import *
from flask_security import auth_required, roles_required, roles_accepted, current_user
from werkzeug.utils import secure_filename
import os
from .utils import roles_list

api = Api()


subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str)
subject_parser.add_argument('description', type=str)
subject_parser.add_argument('image', type=str)

UPLOAD_FOLDER = 'static/images'

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
        name = request.form.get('name')
        description = request.form.get('description')
        image_file = request.files.get('image')

        if not (name and description and image_file):
            return {"message": "All fields (name, description, image) are required"}, 400
        if Subject.query.filter_by(name=name).first():
            return {"message": "Subject with this name already exists"}, 400
        
        try:
        
            filename = secure_filename(image_file.filename)
            image_path = os.path.join(UPLOAD_FOLDER, filename)
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            image_file.save(image_path)

            subject = Subject(name=name, 
                            description=description, 
                            image=image_path)
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
        args = subject_parser.parse_args()
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

chapter_parser = reqparse.RequestParser()
chapter_parser.add_argument('name', type=str)
chapter_parser.add_argument('description', type=str)
chapter_parser.add_argument('subject_id', type=int)

class ChaptersApi(Resource):
    @auth_required('token')
    def get(self, subject_id):
        chapters = Chapter.query.filter_by(subject_id=subject_id).all()
        chapters_json = []
        for chapter in chapters:
            this_chapter = {
                "id": chapter.id,
                "name": chapter.name,
                "description": chapter.description,
                "subject_name": chapter.subject.name if chapter.subject else "N/A"
            }
            chapters_json.append(this_chapter)
        print(chapters_json)
        
        if chapters_json:
            return chapters_json, 200
        
        return {"message": "No chapters found"}, 404

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        name = request.form.get('name')
        description = request.form.get('description')
        subject_id = request.form.get('subject_id')

        if not (name and description and subject_id):
            return {"message": "All fields (name, description, subject_id) are required"}, 400

        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Invalid subject_id"}, 400

        try:
            chapter = Chapter(name=name, description=description, subject_id=subject_id)
            db.session.add(chapter)
            db.session.commit()
            return {"message": "Chapter created successfully"}, 201
        except Exception as e:
            return {"message": f"Error creating chapter: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def put(self, chap_id):
        args = chapter_parser.parse_args()
        chapter = Chapter.query.get(chap_id)

        if not chapter:
            return {"message": "Chapter not found"}, 404

        if not (args['name'] and args['description'] and args['subject_id']):
            return {"message": "All fields (name, description, subject_id) are required"}, 400

        subject = Subject.query.get(args['subject_id'])
        if not subject:
            return {"message": "Invalid subject_id"}, 400

        try:
            chapter.name = args['name']
            chapter.description = args['description']
            chapter.subject_id = args['subject_id']
            db.session.commit()
            return {"message": "Chapter updated successfully"}, 200
        except Exception as e:
            return {"message": f"Error updating chapter: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def delete(self, chap_id):
        chapter = Chapter.query.get(chap_id)

        if chapter:
            db.session.delete(chapter)
            db.session.commit()
            return {"message": "Chapter deleted successfully"}, 200
        
        return {"message": "Chapter not found"}, 404

api.add_resource(ChaptersApi,
                 '/api/chapters/get/<int:subject_id>',
                 '/api/chapters/create',
                 '/api/chapters/update/<int:chap_id>',
                 '/api/chapters/delete/<int:chap_id>')

# Create a parser for update (PUT) request
quiz_parser = reqparse.RequestParser()
quiz_parser.add_argument('name', type=str)
quiz_parser.add_argument('date_of_quiz', type=str)
quiz_parser.add_argument('time_duration', type=str)
quiz_parser.add_argument('marks', type=int)
quiz_parser.add_argument('description', type=str)
quiz_parser.add_argument('chapter_id', type=int)
quiz_parser.add_argument('single_attempt', type=bool)

class QuizApi(Resource):
    @cache.cached(timeout=300, key_prefix='quiz_data')
    @auth_required('token')
    def get(self):
        quizzes = Quiz.query.all()
        quizzes_json = []
        for quiz in quizzes:
            this_quiz = {
                "id": quiz.id,
                "name": quiz.name,
                "date_of_quiz": quiz.date_of_quiz,
                "time_duration": quiz.time_duration,
                "marks": quiz.marks,
                "description": quiz.description,
                "chapter_name": quiz.chapter.name if quiz.chapter else None,
                "single_attempt": quiz.single_attempt,
                "questions": [q.question_statement for q in quiz.questions]
            }
            quizzes_json.append(this_quiz)
        
        if quizzes_json:
            return quizzes_json, 200
        return {"message": "No quizzes found"}, 404

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        name = request.form.get('name')
        date_of_quiz = request.form.get('date_of_quiz')
        time_duration = request.form.get('time_duration')
        marks = request.form.get('marks')
        description = request.form.get('description')
        chapter_id = request.form.get('chapter_id')
        single_attempt = request.form.get('single_attempt', 'false').lower() == 'true'

        if not all([name, date_of_quiz, time_duration, marks, description, chapter_id]):
            return {"message": "All fields are required"}, 400
        if Quiz.query.filter_by(name=name).first():
            return {"message": "Quiz with this name already exists"}, 400

        try:
            quiz = Quiz(
                name=name,
                date_of_quiz=date_of_quiz,
                time_duration=time_duration,
                marks=int(marks),
                description=description,
                chapter_id=int(chapter_id),
                single_attempt=single_attempt
            )
            db.session.add(quiz)
            db.session.commit()
            return {"message": "Quiz created successfully"}, 201
        except Exception as e:
            return {"message": f"Error creating quiz: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def put(self, quiz_id):
        args = quiz_parser.parse_args()
        quiz = Quiz.query.get(quiz_id)

        if not quiz:
            return {"message": "Quiz not found"}, 404

        try:
            for attr in ['name', 'date_of_quiz', 'time_duration', 'marks', 'description', 'chapter_id', 'single_attempt']:
                if args[attr] is not None:
                    setattr(quiz, attr, args[attr])
            db.session.commit()
            return {"message": "Quiz updated successfully"}, 200
        except Exception as e:
            return {"message": f"Error updating quiz: {str(e)}"}, 500

    @auth_required('token')
    @roles_required('admin')
    def delete(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)

        if not quiz:
            return {"message": "Quiz not found"}, 404

        try:
            db.session.delete(quiz)
            db.session.commit()
            return {"message": "Quiz deleted successfully"}, 200
        except Exception as e:
            return {"message": f"Error deleting quiz: {str(e)}"}, 500


# Add the resource with multiple endpoints
api.add_resource(QuizApi,
                 '/api/quiz/get',
                 '/api/quiz/create',
                 '/api/quiz/update/<int:quiz_id>',
                 '/api/quiz/delete/<int:quiz_id>')
# class QuizApi(Resource):
#     @auth_required('token')
#     # @roles_required('admin')
#     def get(self):
#         quizzes = Quiz.query.all()
#         quizzes_json = []
#         for quiz in quizzes:
#             this_quiz = {}
#             this_quiz["id"] = quiz.id
#             this_quiz["name"] = quiz.name
#             this_quiz["date_of_quiz"] = quiz.date_of_quiz
#             this_quiz["time_duration"] = quiz.time_duration
#             this_quiz["marks"] = quiz.marks
#             this_quiz["description"] = quiz.description
#             this_quiz["chapter_name"] = quiz.chapter.name if quiz.chapter else None
#             this_quiz["single_attempt"] = quiz.single_attempt
#             this_quiz["questions"] = [q.question_statement for q in quiz.questions]
#             quizzes_json.append(this_quiz)
#         print(quizzes_json)
#         if quizzes_json:
#             return quizzes_json, 200
        
#         return {
#             "message": "No quizzes found"
#         }, 404

# class PlayQuizApi(Resource):
#     @auth_required('token')
#     @roles_accepted('user')
#     def get(self,id):
#         quiz = Quiz.query.get(id)
#         if not quiz:
#             return {"message": "Quiz not found"}, 404
        
#         questions = Questions.query.filter_by(quiz_id=id).all()
#         questions_json = []
#         for question in questions:
#             this_question = {
#                 "id": question.id,
#                 "question_statement": question.question_statement,
#                 "options": question.options,
#                 "correct_answer": question.correct_answer
#             }
#             questions_json.append(this_question)
        
#         return {
#             "quiz_name": quiz.name,
#             "questions": questions_json
#         }, 200
        

#     @auth_required('token')
#     @roles_accepted('user')
#     def post(self):
#         data = request.get_json()
#         quiz_id = data.get("quiz_id")
#         user_id = current_user.id

#         if not quiz_id:
#             return {"message": "Quiz ID is required"}, 400

#         # Logic to start the quiz for the user
#         return {"message": "Quiz started successfully"}, 200

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
                
                    


        