import datetime

from sqlalchemy import func
from flask_cache import cache
from flask import request
from flask_restful import Api, Resource, reqparse
from .models import *
from flask_security import auth_required, roles_required, roles_accepted, current_user
from werkzeug.utils import secure_filename
import os
from .utils import roles_list
from datetime import datetime

api = Api()


subject_parser = reqparse.RequestParser()
subject_parser.add_argument('name', type=str)
subject_parser.add_argument('description', type=str)

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
        name = request.form.get('name')
        description = request.form.get('description')
        image = request.files.get('image')

        subject = Subject.query.get(sub_id)
        if not subject:
            return {"message": "Subject not found"}, 404

        if not (name and description):
            return {"message": "All fields (name, description) are required"}, 400

        try:
            subject.name = name
            subject.description = description
            if image:
                filename = secure_filename(image.filename)
                image_path = os.path.join(UPLOAD_FOLDER, filename)
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                image.save(image_path)
                subject.image = image_path
            db.session.commit()
            return {"message": "Subject updated successfully"}, 200
        except Exception as e:
            return {"message": f"Error updating subject: {str(e)}"}, 400
        
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

class SingleSubjectApi(Resource):
    @auth_required('token')
    def get(self, sub_id):
        subject = Subject.query.get(sub_id)
        if not subject:
            return {"message": "Subject not found"}, 404
        
        subject_json = {
            "id": subject.id,
            "name": subject.name,
            "description": subject.description,
            "image": subject.image
        }
        
        return subject_json, 200
    
api.add_resource(SingleSubjectApi, '/api/subjects/get/<int:sub_id>')


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
    def post(self,subject_id):
        data = request.get_json()
        name = data.get('name')
        description = data.get('description')
        
        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Invalid subject_id"}, 400


        if not (name and description):
            return {"message": "All fields (name, description) are required"}, 400

        subject = Subject.query.get(subject_id)
        if not subject:
            return {"message": "Invalid subject_id"}, 400

        try:
            chapter = Chapter(name=name, description=description, subject_id=subject.id)
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
                 '/api/chapters/create/<int:subject_id>',
                 '/api/chapters/update/<int:chap_id>',
                 '/api/chapters/delete/<int:chap_id>')

class SingleChapterApi(Resource):
    @auth_required('token')
    def get(self, chap_id):
        chapter = Chapter.query.get(chap_id)
        if not chapter:
            return {"message": "Chapter not found"}, 404

        return {
            "id": chapter.id,
            "name": chapter.name,
            "description": chapter.description,
            "subject_id": chapter.subject_id,
            "image": chapter.image if hasattr(chapter, 'image') else None
        }, 200

api.add_resource(SingleChapterApi, '/api/chapters/get_single/<int:chap_id>')


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
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404

        data = request.get_json()

        if not data:
            return {"message": "No input data provided"}, 400

        try:
            for attr in ['name', 'date_of_quiz', 'time_duration', 'marks', 'description', 'chapter_id', 'single_attempt']:
                if attr in data:
                    setattr(quiz, attr, data[attr])
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

class QuizByChapter(Resource):
    @auth_required('token')
    def get(self, chapter_id):
        quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
        quizzes_json = []
        for quiz in quizzes:
            quizzes_json.append({
                "id": quiz.id,
                "name": quiz.name,
                "date_of_quiz": quiz.date_of_quiz,
                "time_duration": quiz.time_duration,
                "marks": quiz.marks,
                "description": quiz.description,
                "single_attempt": quiz.single_attempt
            })
        return quizzes_json, 200 if quizzes_json else 404

api.add_resource(QuizByChapter, '/api/quiz/get_by_chapter/<int:chapter_id>')

class AdminStats(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        total_students = User.query.filter(User.roles.any(name='user')).count()
        total_subjects = Subject.query.count()
        total_chapters = Chapter.query.count()
        total_quizzes = Quiz.query.count()

        # Subject-wise average scores
        subject_scores = db.session.query(
            Subject.name.label("subject"),
            func.avg(Scores.total_scored).label("avg_score")
        ).join(Chapter, Chapter.subject_id == Subject.id)\
         .join(Quiz, Quiz.chapter_id == Chapter.id)\
         .join(Scores, Scores.quiz_id == Quiz.id)\
         .group_by(Subject.name).all()

        subject_scores_json = [{"subject": s.subject, "avg_score": round(s.avg_score or 0, 2)} for s in subject_scores]

        # User-wise average scores
        user_scores = db.session.query(
            User.username,
            func.avg(Scores.total_scored).label("avg_score")
        ).join(Scores).group_by(User.username).all()

        user_scores_json = [{"username": u.username, "avg_score": round(u.avg_score or 0, 2)} for u in user_scores]

        # Chapter-wise quiz count
        chapter_quiz = db.session.query(
            Chapter.name.label("chapter"),
            func.count(Quiz.id).label("count")
        ).join(Quiz).group_by(Chapter.name).all()

        chapter_quiz_json = [{"chapter": c.chapter, "count": c.count} for c in chapter_quiz]

        # Quiz attempts by date
        quiz_activity = db.session.query(
            func.substr(Scores.time_stamp_of_attempt, 1, 10).label("date"),  # first 10 characters of timestamp
            func.count(Scores.id).label("count")
        ).group_by("date").order_by("date").all()

        quiz_activity_json = [{"date": q.date, "count": q.count} for q in quiz_activity]

        # Top 5 scorers
        top_students = db.session.query(
            User.username,
            func.sum(Scores.total_scored).label("total_score")
        ).join(Scores).group_by(User.username).order_by(func.sum(Scores.total_scored).desc()).limit(5).all()

        top_students_json = [{"username": t.username, "total_score": t.total_score} for t in top_students]

        return {
            "total_students": total_students,
            "total_subjects": total_subjects,
            "total_chapters": total_chapters,
            "total_quizzes": total_quizzes,
            "subject_scores": subject_scores_json,
            "user_scores": user_scores_json,
            "chapter_quiz_count": chapter_quiz_json,
            "quiz_activity_by_date": quiz_activity_json,
            "top_students": top_students_json
        }, 200

api.add_resource(AdminStats, '/api/admin/stats')


class UpcomingQuizzesApi(Resource):
    @auth_required('token')
    def get(self):
        today = datetime.today().date()
        quizzes = Quiz.query.all()
        upcoming_quizzes = []

        for quiz in quizzes:
            try:
                quiz_date = datetime.strptime(quiz.date_of_quiz, "%Y-%m-%d").date()
                if quiz_date >= today:
                    upcoming_quizzes.append({
                        "id": quiz.id,
                        "name": quiz.name,
                        "date_of_quiz": quiz.date_of_quiz,
                        "time_duration": quiz.time_duration,
                        "marks": quiz.marks,
                        "description": quiz.description,
                        "chapter_name": quiz.chapter.name if quiz.chapter else None,
                        "single_attempt": quiz.single_attempt,
                        "questions": [q.question_statement for q in quiz.questions]
                    })
            except Exception as e:
                print(f"Skipping quiz {quiz.name}: {e}")
                continue

        return upcoming_quizzes if upcoming_quizzes else {"message": "No upcoming quizzes"}, 200
    
api.add_resource(UpcomingQuizzesApi, '/api/quiz/upcoming')


question_parser = reqparse.RequestParser()
question_parser.add_argument('question_statement', type=str)
question_parser.add_argument('option1', type=str)
question_parser.add_argument('option2', type=str)
question_parser.add_argument('option3', type=str)
question_parser.add_argument('option4', type=str)
question_parser.add_argument('correct_option', type=str)
question_parser.add_argument('quiz_id', type=int)

class QuestionApi(Resource):
    @auth_required('token')
    def get(self, quiz_id):
        qs = Questions.query.filter_by(quiz_id=quiz_id).all()
        return [ {
            "id": q.id,
            "question_statement": q.question_statement,
            "option1": q.option1,
            "option2": q.option2,
            "option3": q.option3,
            "option4": q.option4,
            "correct_option": q.correct_option
        } for q in qs ], 200

    @auth_required('token')
    @roles_required('admin')
    def post(self):
        data = question_parser.parse_args()
        quiz = Quiz.query.get(data['quiz_id'])
        if not quiz:
            return {"message": "Invalid quiz_id"}, 400
        q = Questions(**data)
        db.session.add(q)
        db.session.commit()
        return {"message":"Question created", "id": q.id}, 201

    @auth_required('token')
    @roles_required('admin')
    def put(self, qid):
        q = Questions.query.get(qid)
        if not q:
            return {"message":"Question not found"},404
        args = question_parser.parse_args()
        for k, v in args.items():
            if v is not None:
                setattr(q, k, v)
        db.session.commit()
        return {"message":"Question updated"}, 200

    @auth_required('token')
    @roles_required('admin')
    def delete(self, qid):
        q = Questions.query.get(qid)
        if not q:
            return {"message":"Question not found"},404
        db.session.delete(q)
        db.session.commit()
        return {"message":"Deleted"},200

api.add_resource(QuestionApi,
    '/api/questions/get/<int:quiz_id>',
    '/api/questions/create',
    '/api/questions/update/<int:qid>',
    '/api/questions/delete/<int:qid>'
)

class AdminCombinedSearch(Resource):
    @auth_required('token')
    @roles_required('admin')
    def get(self):
        query = request.args.get('query', '').strip()
        if not query:
            return {"quizzes": [], "users": []}, 200

        # Search quizzes
        quiz_results = Quiz.query.filter(Quiz.name.ilike(f"%{query}%")).all()
        quizzes = []
        for quiz in quiz_results:
            quizzes.append({
                "id": quiz.id,
                "name": quiz.name,
                "description": quiz.description,
                "date_of_quiz": quiz.date_of_quiz,
                "time_duration": quiz.time_duration,
                "marks": quiz.marks,
                "single_attempt": quiz.single_attempt,
                "chapter_name": quiz.chapter.name if quiz.chapter else "N/A"
            })

        # Search users
        user_results = User.query.filter(
            (User.username.ilike(f"%{query}%")) | (User.email.ilike(f"%{query}%"))
        ).all()
        users = []
        for user in user_results:
            scores = []
            for score in user.scores:
                scores.append({
                    "quiz_id": score.quiz_id,
                    "quiz_name": score.quiz.name if score.quiz else "N/A",
                    "total_scored": score.total_scored,
                    "total_possible_score": score.total_possible_score,
                    "attempts": score.attempts
                })
            users.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "scores": scores
            })

        return {"quizzes": quizzes, "users": users}, 200

api.add_resource(AdminCombinedSearch, '/api/admin/search')


# Updated parser to include time_taken
play_parser = reqparse.RequestParser()
play_parser.add_argument('answers', type=dict, required=True, help='Answers must be provided')
play_parser.add_argument('time_taken', type=int, required=False)  # Optional but handled

class PlayQuizApi(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self, quiz_id):
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404

        user = current_user._get_current_object()

        # Check if single attempt and already attempted
        if quiz.single_attempt:
            existing = Scores.query.filter_by(quiz_id=quiz.id, user_id=user.id).first()
            if existing:
                return {"message": "Already attempted single attempt quiz"}, 403

        questions_list = [
            {
                "id": q.id,
                "question": q.question_statement,
                "options": [q.option1, q.option2, q.option3, q.option4]
            }
            for q in quiz.questions
        ]

        return {
            "quiz_id": quiz.id,
            "name": quiz.name,
            "time_duration": int(quiz.time_duration),
            "total_possible_score": quiz.marks,
            "questions": questions_list,
            "single_attempt": quiz.single_attempt
        }, 200

    @auth_required('token')
    @roles_required('user')
    def post(self, quiz_id):
        args = play_parser.parse_args()
        ans_map = args['answers']
        time_taken = args.get('time_taken') or 0  # fallback if not provided

        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return {"message": "Quiz not found"}, 404

        user = current_user._get_current_object()

        # Enforce single attempt check
        if quiz.single_attempt:
            existing = Scores.query.filter_by(quiz_id=quiz.id, user_id=user.id).first()
            if existing:
                return {"message": "Single attempt quiz already attempted"}, 400

        # Score calculation
        total_score = 0
        for q in quiz.questions:
            selected = ans_map.get(str(q.id))
            if selected and selected == q.correct_option:
                total_score += quiz.marks / len(quiz.questions)

        # Track existing attempts (only applies to non-single)
        previous = Scores.query.filter_by(quiz_id=quiz.id, user_id=user.id).all()
        attempt_count = len(previous) + 1

        # Save score entry
        new_score = Scores(
            quiz_id=quiz.id,
            user_id=user.id,
            time_stamp_of_attempt=datetime.utcnow().isoformat(),
            total_scored=int(total_score),
            total_possible_score=quiz.marks,
            time_taken=int(time_taken),
            attempts=attempt_count
        )
        db.session.add(new_score)
        db.session.commit()

        return {
            "message": "Quiz submitted",
            "score": new_score.total_scored,
            "total": new_score.total_possible_score
        }, 200

api.add_resource(PlayQuizApi,
    '/api/quiz/play/<int:quiz_id>'
)   

class UserScoresApi(Resource):
    @auth_required('token')
    def get(self):
        user = current_user._get_current_object()
        scores = Scores.query.filter_by(user_id=user.id).all()
        result = []
        for s in scores:
            quiz = s.quiz
            chapter = quiz.chapter
            subject = chapter.subject if chapter else None
            result.append({
                "quiz_name": quiz.name,
                "chapter_name": chapter.name if chapter else "N/A",
                "subject_name": subject.name if subject else "N/A",
                "score": s.total_scored,
                "out_of": s.total_possible_score,
                "attempts": s.attempts,
                "time_taken": s.time_taken,
                "date": s.time_stamp_of_attempt
            })
        return result, 200
    
api.add_resource(UserScoresApi, '/api/user/scores')

class UserSearchAllApi(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        query = request.args.get('q', '').lower()
        user_id = current_user.id

        subject_matches = Subject.query.filter(Subject.name.ilike(f"%{query}%")).all()
        chapter_matches = Chapter.query.filter(Chapter.name.ilike(f"%{query}%")).all()
        quiz_matches = Quiz.query.filter(Quiz.name.ilike(f"%{query}%")).all()

        subjects = [{
            'id': s.id,
            'name': s.name,
            'description': s.description,
            'image': s.image
        } for s in subject_matches]

        chapters = [{
            'id': c.id,
            'name': c.name,
            'description': c.description,
            'subject_id': c.subject.id,
            'subject_name': c.subject.name
        } for c in chapter_matches]

        quizzes = []
        for q in quiz_matches:
            attempt_count = Scores.query.filter_by(user_id=user_id, quiz_id=q.id).count()
            quizzes.append({
                'id': q.id,
                'name': q.name,
                'description': q.description,
                'marks': q.marks,
                'date_of_quiz': q.date_of_quiz,
                'time_duration': q.time_duration,
                'single_attempt': q.single_attempt,
                'chapter_id': q.chapter.id,
                'chapter_name': q.chapter.name,
                'subject_name': q.chapter.subject.name,
                'user_attempts': attempt_count
            })

        return {
            'subjects': subjects,
            'chapters': chapters,
            'quizzes': quizzes
        }, 200

api.add_resource(UserSearchAllApi, '/api/user/search')

class UserStatsApi(Resource):
    @auth_required('token')
    @roles_required('user')
    def get(self):
        user = current_user
        scores = Scores.query.filter_by(user_id=user.id).all()

        total_score = sum(int(s.total_scored) for s in scores)
        total_possible = sum(int(s.total_possible_score) for s in scores)

        quiz_ids = set(s.quiz_id for s in scores)
        chapter_ids = set(s.quiz.chapter_id for s in scores if s.quiz)
        subject_ids = set(s.quiz.chapter.subject_id for s in scores if s.quiz and s.quiz.chapter)

        # Quiz-wise performance (with date formatting)
        quiz_stats = []
        for s in scores:
            if s.quiz:
                try:
                    formatted_date = datetime.fromisoformat(s.time_stamp_of_attempt).strftime("%Y-%m-%d")
                except ValueError:
                    formatted_date = s.time_stamp_of_attempt  # fallback in case of format error

                quiz_stats.append({
                    'quiz': s.quiz.name,
                    'score': int(s.total_scored),
                    'date': formatted_date
                })

        # Subject-wise performance
        subject_scores = {}
        for s in scores:
            if not s.quiz or not s.quiz.chapter:
                continue
            subject = s.quiz.chapter.subject
            if subject:
                subject_name = subject.name
                subject_scores.setdefault(subject_name, []).append(int(s.total_scored))

        subject_stats = [
            {
                'subject': subject,
                'average_score': round(sum(scores_list) / len(scores_list), 2)
            }
            for subject, scores_list in subject_scores.items()
        ]

        return {
            'user': {
                'username': user.username,
                'email': user.email,
                'qualification': user.qualification,
                'dob': user.dob
            },
            'total_quizzes_played': len(quiz_ids),
            'total_chapters_played': len(chapter_ids),
            'total_subjects_played': len(subject_ids),
            'total_score': total_score,
            'total_possible': total_possible,
            'quiz_stats': quiz_stats,
            'subject_stats': subject_stats
        }, 200

api.add_resource(UserStatsApi, '/api/user/stats')



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
                
                    


        