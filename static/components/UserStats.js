export default {
  template: `
    <div class="container mt-4">
      <h2 class="text-center">User Dashboard & Statistics</h2>

      <div v-if="stats" class="mt-4">
        <!-- Profile Card -->
        <div class="card p-3 shadow-sm mb-4">
          <h4>Profile Summary</h4>
          <p><strong>Username:</strong> {{ stats.user.username }}</p>
          <p><strong>Email:</strong> {{ stats.user.email }}</p>
          <p><strong>Qualification:</strong> {{ stats.user.qualification }}</p>
          <p><strong>Date of Birth:</strong> {{ stats.user.dob }}</p>
        </div>

        <!-- Overall Stats -->
        <div class="row text-center mb-4">
          <div class="col-md-3" v-for="(value, label) in overallStats" :key="label">
            <div class="card shadow-sm p-3">
              <h5>{{ label }}</h5>
              <h4>{{ value }}</h4>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="row mb-4">
          <div class="col-md-6 chart-container">
            <h5 class="text-center">Score Distribution</h5>
            <canvas id="pieChart"></canvas>
          </div>
        </div>

        <div class="row mb-4">
          <div class="col-md-6 chart-container">
            <h5 class="text-center">Quiz Score Over Time</h5>
            <canvas id="lineChart"></canvas>
          </div>
        </div>
      </div>

      <div v-else>
        <p>Loading statistics...</p>
      </div>
    </div>
  `,
  data() {
    return {
      stats: null
    };
  },
  computed: {
    overallStats() {
      if (!this.stats) return {};
      return {
        "Quizzes Played": this.stats.total_quizzes_played,
        "Chapters Attempted": this.stats.total_chapters_played,
        "Subjects Attempted": this.stats.total_subjects_played,
        "Total Score": `${this.stats.total_score} / ${this.stats.total_possible}`
      };
    }
  },
  mounted() {
    fetch('/api/user/stats', {
      headers: {
        'Authentication-Token': localStorage.getItem('auth_token')
      }
    })
    .then(res => res.json())
    .then(data => {
      this.stats = data;
      this.$nextTick(this.renderCharts); // Ensure DOM is ready
    })
    .catch(err => console.error('Failed to fetch stats:', err));
  },
  methods: {
    renderCharts() {
      if (!this.stats) return;

      const quizLabels = this.stats.quiz_stats.map(q => q.quiz);
      const quizScores = this.stats.quiz_stats.map(q => q.score);
      const timeTaken = this.stats.quiz_stats.map(q => q.time_taken || 0); // fallback if missing
      const dates = this.stats.quiz_stats.map(q => q.date);

      // Pie Chart: Score Distribution
      const pieCtx = document.getElementById('pieChart')?.getContext('2d');
      if (pieCtx) {
        new Chart(pieCtx, {
          type: 'pie',
          data: {
            labels: ['Correct', 'Remaining'],
            datasets: [{
              data: [this.stats.total_score, this.stats.total_possible - this.stats.total_score],
              backgroundColor: ['#28a745', '#dc3545']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }

      // Line Chart: Score over time
      const lineCtx = document.getElementById('lineChart')?.getContext('2d');
      if (lineCtx) {
        new Chart(lineCtx, {
          type: 'line',
          data: {
            labels: dates,
            datasets: [{
              label: 'Score',
              data: quizScores,
              fill: false,
              borderColor: '#007bff',
              tension: 0.2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }

      // Bar Chart: Time taken
      const barCtx = document.getElementById('barChart')?.getContext('2d');
      if (barCtx) {
        new Chart(barCtx, {
          type: 'bar',
          data: {
            labels: quizLabels,
            datasets: [{
              label: 'Time Taken (s)',
              data: timeTaken,
              backgroundColor: '#f39c12'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
    }
  }
};
