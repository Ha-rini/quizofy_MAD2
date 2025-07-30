from flask import Flask, jsonify
from flask_caching import Cache
import sqlite3

app = Flask(__name__)

# Flask-Caching configuration with Redis
app.config['CACHE_TYPE'] = 'RedisCache'
app.config['CACHE_REDIS_HOST'] = 'localhost'  # Change if Redis is running elsewhere
app.config['CACHE_REDIS_PORT'] = 6379
app.config['CACHE_REDIS_DB'] = 2
app.config['CACHE_DEFAULT_TIMEOUT'] = 300  # Cache timeout in seconds

cache = Cache(app)

def get_db_connection():
    conn = sqlite3.connect('database.db')  # Update with your actual database
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/quiz/get', methods=['GET'])
@cache.cached(timeout=300, key_prefix='quiz_data')
def get_transactions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM quiz")  # Update with actual table name
    rows = cursor.fetchall()
    conn.close()

    quiz_data = [dict(row) for row in rows]
    return jsonify(quiz_data)

if __name__ == '__main__':
    app.run(debug=True)