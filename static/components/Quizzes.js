export default {
  template: `
    <div class="container">
      <h3 class="text-center mt-3">Quizzes for Chapter ID: {{ chapter_id }}</h3>
      <div class="row">
        <div class="col-8">
          <div v-if="quizzes.length === 0" class="alert alert-info">No quizzes found.</div>
          <div v-for="quiz in quizzes" :key="quiz.id" class="card mb-2">
            <div class="card-body">
              <h5 class="card-title">{{ quiz.name }}</h5>
              <p class="card-text">{{ quiz.description }}</p>
              <p><strong>Date:</strong> {{ quiz.date_of_quiz }}</p>
              <p><strong>Marks:</strong> {{ quiz.marks }} | <strong>Duration:</strong> {{ quiz.time_duration }} mins</p>
              <p><strong>Single Attempt:</strong> {{ quiz.single_attempt ? 'Yes' : 'No' }}</p>
              <!-- User view -->
              <div v-if="isReadOnly">
                <p v-if="user_scores[quiz.id] && quiz.single_attempt">
                  Attempted. Score: {{ user_scores[quiz.id][0].total_scored }} / {{ quiz.marks }}
                </p>
                <div v-else-if="user_scores[quiz.id] && !quiz.single_attempt">
                  <p>Attempts:</p>
                  <ul>
                    <li v-for="s in user_scores[quiz.id]">
                      {{ s.total_scored }} / {{ s.total_possible_score }} on {{ s.time_stamp_of_attempt }}
                    </li>
                  </ul>
                </div>
                <!-- Show Start only if: 
                  - today matches quiz date 
                  - AND it's not a single-attempt already attempted -->
              <button
                v-if="shouldShowStartButton(quiz)"
                class="btn btn-success"
                @click="goPlay(quiz.id)"
              >
                Start
              </button>

              </div>


              <!-- Admin-only options -->
              <div v-if="!isReadOnly" class="mt-2">
                <button class="btn btn-info me-2" @click="goQuestions(quiz.id)">Questions</button>
                <button class="btn btn-warning me-2" @click="setEditQuiz(quiz)">Edit</button>
                <button class="btn btn-danger" @click="deleteQuiz(quiz.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin-only Add/Edit Form -->
        <div class="col-4" v-if="!isReadOnly">
          <h5 class="text-center">{{ editMode ? 'Edit Quiz' : 'Add Quiz' }}</h5>

          <div class="mb-2">
            <input type="text" class="form-control" placeholder="Quiz Name" v-model="quizForm.name">
            <small class="text-danger" v-if="errors.name">{{ errors.name }}</small>
          </div>

          <div class="mb-2">
            <textarea class="form-control" placeholder="Description" v-model="quizForm.description"></textarea>
            <small class="text-danger" v-if="errors.description">{{ errors.description }}</small>
          </div>

          <div class="mb-2">
            <input type="date" class="form-control" v-model="quizForm.date_of_quiz">
            <small class="text-danger" v-if="errors.date_of_quiz">{{ errors.date_of_quiz }}</small>
          </div>

          <div class="mb-2">
            <input type="number" class="form-control" placeholder="Duration (mins)" v-model="quizForm.time_duration">
            <small class="text-danger" v-if="errors.time_duration">{{ errors.time_duration }}</small>
          </div>

          <div class="mb-2">
            <input type="number" class="form-control" placeholder="Marks" v-model="quizForm.marks">
            <small class="text-danger" v-if="errors.marks">{{ errors.marks }}</small>
          </div>

          <div class="form-check mb-2">
            <input class="form-check-input" type="checkbox" v-model="quizForm.single_attempt" id="singleAttempt">
            <label class="form-check-label" for="singleAttempt">Single Attempt Only</label>
          </div>

          <div class="text-end">
            <button class="btn btn-success" @click="submitQuiz">{{ editMode ? 'Update' : 'Create' }}</button>
            <button v-if="editMode" class="btn btn-secondary ms-2" @click="resetForm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      chapter_id: this.$route.params.chapter_id,
      quizzes: [],
      editMode: false,
      editId: null,
      quizForm: {
        name: '',
        description: '',
        date_of_quiz: '',
        time_duration: '',
        marks: '',
        single_attempt: false
      },
      errors: {},
      user_id: null,
      user_scores: {},

    };
  },
  
  mounted() {
    this.fetchQuizzes();
    this.getCurrentUser();  
    console.log("Params:", this.$route.params);
    console.log("Query:", this.$route.query);
    console.log("Readonly detected?", this.isReadOnly);
  },
  computed: {
    isReadOnly() {
      const role = localStorage.getItem('user_role');
      return role !== 'admin' && (this.$route.query.readonly === "true" || this.$route.query.readonly === true);
    }
  },
  methods: {
    fetchQuizzes() {
      fetch(`/api/quiz/get_by_chapter/${this.chapter_id}`, {
        headers: {
          'Authentication-Token': localStorage.getItem("auth_token")
        }
      })
      .then(res => res.json())
      .then(data => {
        this.quizzes = data;
      })
      .catch(err => console.error("Error fetching quizzes", err));
    },
    shouldShowStartButton(quiz) {
    const today = new Date().toISOString().split('T')[0]; // format: YYYY-MM-DD

    // Not today's quiz
    if (quiz.date_of_quiz !== today) return false;

    const attempts = this.user_scores[quiz.id] || [];

    // If it's a single-attempt quiz and already attempted, don't show
    if (quiz.single_attempt && attempts.length > 0) {
      return false;
    }

    return true;
  },
    validateForm() {
      this.errors = {};
      const { name, description, date_of_quiz, time_duration, marks } = this.quizForm;

      if (!name.trim()) this.errors.name = "Quiz name is required.";
      if (!description.trim()) this.errors.description = "Description is required.";
      if (!date_of_quiz) this.errors.date_of_quiz = "Date of quiz is required.";
      if (!time_duration || time_duration <= 0) this.errors.time_duration = "Duration must be a positive number.";
      if (!marks || marks <= 0) this.errors.marks = "Marks must be a positive number.";

      return Object.keys(this.errors).length === 0;
    },
    goPlay(quiz_id) {
      this.$router.push({ name: 'PlayQuiz', params: { quiz_id } });
    },
    submitQuiz() {
      if (!this.validateForm()) return;

      const isEdit = this.editMode;
      const url = isEdit
        ? `/api/quiz/update/${this.editId}`
        : '/api/quiz/create';

      const fetchOptions = {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Authentication-Token': localStorage.getItem("auth_token")
        }
      };

      if (isEdit) {
        const payload = {
          ...this.quizForm,
          chapter_id: parseInt(this.chapter_id),
          marks: parseInt(this.quizForm.marks),
          time_duration: parseInt(this.quizForm.time_duration),
          single_attempt: !!this.quizForm.single_attempt
        };
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(payload);
      } else {
        const formData = new FormData();
        for (const key in this.quizForm) {
          formData.append(key, this.quizForm[key]);
        }
        formData.append("chapter_id", this.chapter_id);
        fetchOptions.body = formData;
      }

      fetch(url, fetchOptions)
        .then(res => res.json())
        .then(data => {
          alert(data.message);
          this.fetchQuizzes();
          this.resetForm();
        })
        .catch(err => console.error("Quiz submission error", err));
    },
    getCurrentUser() {
      fetch('/api/user/me', {
        headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
      })
        .then(res => res.json())
        .then(data => {
          this.user_id = data.id;
          this.fetchUserScores(); // after getting user ID
        });
    },

    fetchUserScores() {
      fetch('/api/score/by_user', {
        headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
      })
        .then(res => res.json())
        .then(data => {
          // Store scores indexed by quiz ID
          this.user_scores = {};
          data.forEach(score => {
            if (!this.user_scores[score.quiz_id]) {
              this.user_scores[score.quiz_id] = [];
            }
            this.user_scores[score.quiz_id].push(score);
          });
        });
    },

    deleteQuiz(quizId) {
      if (!confirm("Delete this quiz?")) return;
      fetch(`/api/quiz/delete/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authentication-Token': localStorage.getItem("auth_token")
        }
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        this.fetchQuizzes();
      });
    },
    setEditQuiz(quiz) {
      this.quizForm = {
        name: quiz.name,
        description: quiz.description,
        date_of_quiz: quiz.date_of_quiz,
        time_duration: quiz.time_duration,
        marks: quiz.marks,
        single_attempt: quiz.single_attempt
      };
      this.editId = quiz.id;
      this.editMode = true;
      this.errors = {};
    },
    resetForm() {
      this.quizForm = {
        name: '',
        description: '',
        date_of_quiz: '',
        time_duration: '',
        marks: '',
        single_attempt: false
      };
      this.errors = {};
      this.editMode = false;
      this.editId = null;
    },
    goQuestions(qid) {
      this.$router.push({ name: 'QuestionsPage', params: { quiz_id: qid } });
    }
  }
};
