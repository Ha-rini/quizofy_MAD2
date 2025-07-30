export default {
  template: `
    <div class="container mt-4">
      <h2 class="text-center mb-4">Admin Statistics Dashboard</h2>

      <div class="row text-center mb-4">
        <div class="col-md-3" v-for="(count, label) in totals" :key="label">
          <div class="card shadow-sm p-3">
            <h5>{{ label }}</h5>
            <h3>{{ count }}</h3>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <h5 class="text-center">Subject-wise Average Performance</h5>
          <div class="chart-container">
            <canvas id="subjectChart"></canvas>
          </div>
        </div>
        <div class="col-md-6">
          <h5 class="text-center">User-wise Average Scores</h5>
          <div class="chart-container">
            <canvas id="userChart"></canvas>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <h5 class="text-center">Chapter-wise Quiz Count</h5>
          <div class="chart-container">
            <canvas id="chapterChart"></canvas>
          </div>
        </div>
        <div class="col-md-6">
          <h5 class="text-center">Quiz Attempts by Date</h5>
          <div class="chart-container">
            <canvas id="quizActivityChart"></canvas>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6 offset-md-3">
          <h5 class="text-center">Top 5 Highest Scoring Students</h5>
          <div class="chart-container">
            <canvas id="topStudentsChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      totals: {
        "Total Users": 0,
        "Total Subjects": 0,
        "Total Chapters": 0,
        "Total Quizzes": 0
      }
    };
  },
  mounted() {
    fetch('/api/admin/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authentication-Token': localStorage.getItem('auth_token')
      }
    })
    .then(res => res.json())
    .then(data => {
      this.totals["Total Users"] = data.total_students;
      this.totals["Total Subjects"] = data.total_subjects;
      this.totals["Total Chapters"] = data.total_chapters;
      this.totals["Total Quizzes"] = data.total_quizzes;

      this.renderSubjectChart(data.subject_scores);
      this.renderUserChart(data.user_scores);
      this.renderChapterChart(data.chapter_quiz_count);
      this.renderQuizActivityChart(data.quiz_activity_by_date);
      this.renderTopStudentsChart(data.top_students);
    })
    .catch(err => console.error('Failed to fetch stats:', err));
  },
  methods: {
    renderSubjectChart(data) {
      new Chart(document.getElementById('subjectChart'), {
        type: 'bar',
        data: {
          labels: data.map(d => d.subject),
          datasets: [{
            label: 'Avg Score',
            data: data.map(d => d.avg_score),
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    renderUserChart(data) {
      new Chart(document.getElementById('userChart'), {
        type: 'pie',
        data: {
          labels: data.map(d => d.username),
          datasets: [{
            data: data.map(d => d.avg_score),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    },
    renderChapterChart(data) {
      new Chart(document.getElementById('chapterChart'), {
        type: 'bar',
        data: {
          labels: data.map(d => d.chapter),
          datasets: [{
            label: 'Quiz Count',
            data: data.map(d => d.count),
            backgroundColor: '#8e44ad'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    },
    renderQuizActivityChart(data) {
      new Chart(document.getElementById('quizActivityChart'), {
        type: 'line',
        data: {
          labels: data.map(d => d.date),
          datasets: [{
            label: 'Quizzes Attempted',
            data: data.map(d => d.count),
            borderColor: '#27ae60',
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              title: { display: true, text: 'Date' }
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Attempts' }
            }
          }
        }
      });
    },
    renderTopStudentsChart(data) {
      new Chart(document.getElementById('topStudentsChart'), {
        type: 'bar',
        data: {
          labels: data.map(d => d.username),
          datasets: [{
            label: 'Total Score',
            data: data.map(d => d.total_score),
            backgroundColor: '#e67e22'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }
};
