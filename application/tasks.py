import csv
from celery import shared_task
import time
import requests
from sqlalchemy import func
from application.mail import send_email
from application.utils import format_report
from .models import User, Role, UserRoles, Subject, Chapter, Quiz, Questions, Scores
from datetime import date, datetime

@shared_task(ignore_result=False, name='download_csv_report')
def csv_report():
    scores = Scores.query.all()
    csv_file_name = f'quiz_scores_{datetime.now().strftime("%f")}.csv'
    with open(f'static/{csv_file_name}', 'w', newline="") as f:
        sr_no = 1
        score_csv = csv.writer(f, delimiter=',')
        score_csv.writerow(["Sr_No","User_Name", "Quiz_Name", "Score", "Date", "Time_Taken"])
        for score in scores:
            score_csv.writerow([sr_no, score.user.username, score.quiz.name, score.total_scored, score.time_stamp_of_attempt, score.time_taken])
            sr_no += 1

    return csv_file_name

@shared_task(ignore_result=False, name='monthly_report')
def monthly_report():
    print("Running monthly_report task") 
    users = User.query.all()
    for user in users[1:]:
        user_data = {}
        user_data['username'] = user.username
        user_data['email'] = user.email
        user_quiz_scores = []
        for score in user.scores:
            user_quiz_scores.append({
                'quiz_name': score.quiz.name,
                'total_scored': score.total_scored,
                'time_stamp_of_attempt': score.time_stamp_of_attempt,
                'time_taken': score.time_taken,
                'total_possible_score': score.total_possible_score,
                'attempts': score.attempts
            })
        user_data['quiz_scores'] = user_quiz_scores
        message = format_report('templates/mail_details.html', data=user_data)
        send_email(user.email, "Quizofy's Monthly Performance Report", message=message, content="html")

    return "Monthly report sent to email"

@shared_task(ignore_result=False, name='daily_reminder')
def daily_reminder():
    print("Running daily_reminder task")
    users = User.query.all()
    for user in users[1:]:
        user_data = {}
        user_data['username'] = user.username
        user_data['email'] = user.email   
        quizzes = Quiz.query.all()
        upcoming_quizzes = []
        for quiz in quizzes:
            upcoming_quizzes.append({
                'quiz_name': quiz.name,
                'date_of_quiz': quiz.date_of_quiz,
                'time_duration': quiz.time_duration,
                'marks': quiz.marks,
                'description': quiz.description,
                'single_attempt': quiz.single_attempt
            })
        user_data['upcoming_quizzes'] = upcoming_quizzes
        if upcoming_quizzes:  # Send only if there are upcoming quizzes
            message = format_report('templates/daily_reminder.html', data=user_data)
            send_email(user.email, "Quizofy's Daily Reminder", message=message, content="html")

    return "Daily reminder sent to email"
    

