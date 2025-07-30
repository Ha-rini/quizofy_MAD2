export default {
  template: `
    <div class="container text-center mt-4">
      <h3>Quiz Score</h3>
      <div class="d-flex justify-content-center">
        <canvas id="scoreChart" width="250" height="250"></canvas>
      </div>
      <div class="mt-3">
        <router-link to="/userdashboard" class="btn btn-secondary me-2">Back to Dashboard</router-link>
        <button class="btn btn-primary" v-if="!isSingleAttempt" @click="reattemptQuiz">Reattempt</button>
      </div>
    </div>
  `,
  computed: {
    score() {
      return parseInt(this.$route.query.score);
    },
    total() {
      return parseInt(this.$route.query.total);
    },
    quiz_id() {
      return parseInt(this.$route.query.quiz_id);
    },
    isSingleAttempt() {
      return this.$route.query.single_attempt === 'true' || this.$route.query.single_attempt === true;
    }
  },
  mounted() {
    this.$nextTick(() => {
      const ctx = document.getElementById('scoreChart').getContext('2d');
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: ['Correct', 'Incorrect'],
          datasets: [{
            data: [this.score, this.total - this.score],
            backgroundColor: ['#28a745', '#dc3545']
          }]
        },
        options: {
          responsive: false,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    });
  },
  methods: {
    reattemptQuiz() {
      this.$router.push({ name: 'PlayQuiz', params: { quiz_id: this.quiz_id } });
    }
  }
};
