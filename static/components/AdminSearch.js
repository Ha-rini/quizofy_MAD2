export default {
  template: `
    <div class="container mt-4">
      <h3 class="text-center mb-4">Admin Search Panel</h3>

      <input v-model="searchTerm" @input="searchAll" class="form-control mb-4" placeholder="Search for quizzes or users">

      <div class="row">
        <div class="col-md-6">
          <h5>Matching Quizzes</h5>
          <div v-if="quizzes.length === 0 && searchTerm">No quizzes found.</div>
          <div v-for="quiz in quizzes" :key="quiz.id" class="card mb-2">
            <div class="card-body">
              <h5 class="card-title">{{ quiz.name }}</h5>
              <p><strong>Date:</strong> {{ quiz.date_of_quiz }} | <strong>Duration:</strong> {{ quiz.time_duration }} mins</p>
              <p><strong>Marks:</strong> {{ quiz.marks }} | <strong>Chapter:</strong> {{ quiz.chapter_name }}</p>
              <p><strong>Description:</strong> {{ quiz.description }}</p>
              <p><strong>Single Attempt:</strong> {{ quiz.single_attempt ? 'Yes' : 'No' }}</p>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <h5>Matching Users</h5>
          <div v-if="users.length === 0 && searchTerm">No users found.</div>
          <div v-for="user in users" :key="user.id" class="card mb-2">
            <div class="card-body">
              <h5 class="card-title">{{ user.username }} ({{ user.email }})</h5>
              <div v-if="user.scores.length === 0">No quiz attempts yet.</div>
              <ul v-else>
                <li v-for="score in user.scores" :key="score.quiz_id">
                  <strong>Quiz:</strong> {{ score.quiz_name }} |
                  <strong>Score:</strong> {{ score.total_scored }}/{{ score.total_possible_score }} |
                  <strong>Attempts:</strong> {{ score.attempts }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      searchTerm: '',
      quizzes: [],
      users: []
    };
  },
  methods: {
    searchAll() {
      if (this.searchTerm.trim() === '') {
        this.quizzes = [];
        this.users = [];
        return;
      }

      fetch(`/api/admin/search?query=${encodeURIComponent(this.searchTerm)}`, {
        headers: {
          'Authentication-Token': localStorage.getItem("auth_token")
        }
      })
        .then(res => res.json())
        .then(data => {
          this.quizzes = data.quizzes || [];
          this.users = data.users || [];
        })
        .catch(err => console.error("Search error:", err));
    }
  }
};
