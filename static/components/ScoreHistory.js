export default {
  template: `
    <div class="container mt-4">
      <h3 class="text-center mb-3">Your Quiz Attempts</h3>
      <div v-if="scores.length === 0" class="alert alert-info">No attempts found.</div>
      <div v-else class="table-responsive">
        <table class="table table-bordered table-striped">
          <thead class="table-dark">
            <tr>
              <th>Quiz Name</th>
              <th>Chapter</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Total</th>
              <th>Attempt No.</th>
              <th>Time Taken (sec)</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, i) in scores" :key="i">
              <td>{{ s.quiz_name }}</td>
              <td>{{ s.chapter_name }}</td>
              <td>{{ s.subject_name }}</td>
              <td>{{ s.score }}</td>
              <td>{{ s.out_of }}</td>
              <td>{{ s.attempts }}</td>
              <td>{{ s.time_taken ?? '—' }}</td>
              <td>{{ formatDate(s.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  data() {
    return {
      scores: []
    }
  },
  mounted() {
    fetch('/api/user/scores', {
      headers: {
        'Authentication-Token': localStorage.getItem('auth_token')
      }
    })
    .then(res => res.json())
    .then(data => {
      this.scores = data;
    })
    .catch(err => console.error("Failed to load scores", err));
  },
  methods: {
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return d.toLocaleString();
    }
  }
}
