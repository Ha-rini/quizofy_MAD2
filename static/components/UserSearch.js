export default {
  template: `
    <div class="container mt-4">
      <h3 class="mb-3">Search</h3>
      <input v-model="query" class="form-control mb-3" placeholder="Search for subjects, chapters, or quizzes..." @input="searchAll" />

      <div v-if="results.subjects.length">
        <h4>Subjects</h4>
        <div class="card mb-2" v-for="subject in results.subjects" :key="subject.id">
          <div class="card-body">
            <h5 class="card-title">{{ subject.name }}</h5>
            <p class="card-text">{{ subject.description }}</p>
            <router-link
              class="btn btn-primary"
              :to="{ name: 'Chapters', params: { subject_id: subject.id }, query: { readonly: true } }">
              See Chapters
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="results.chapters.length">
        <h4>Chapters</h4>
        <div class="card mb-2" v-for="chapter in results.chapters" :key="chapter.id">
          <div class="card-body">
            <h5 class="card-title">{{ chapter.name }} 
              <small class="text-muted">({{ chapter.subject_name }})</small></h5>
            <p class="card-text">{{ chapter.description }}</p>
            <router-link
                class="btn btn-secondary"
                :to="{ name: 'QuizPage', params: { chapter_id: chapter.id }, query: { readonly: true } }">
                See Quizzes
            </router-link>

          </div>
        </div>
      </div>

      <div v-if="results.quizzes.length">
        <h4>Quizzes</h4>
        <div class="card mb-2" v-for="quiz in results.quizzes" :key="quiz.id">
          <div class="card-body">
            <h5 class="card-title">{{ quiz.name }}</h5>
            <p>{{ quiz.description }}</p>
            <p>
              <strong>Subject:</strong> {{ quiz.subject_name }},
              <strong>Chapter:</strong> {{ quiz.chapter_name }}<br>
              <strong>Marks:</strong> {{ quiz.marks }},
              <strong>Duration:</strong> {{ quiz.time_duration }} min
            </p>
            <p><strong>Attempts:</strong> {{ quiz.user_attempts }}</p>

            <button class="btn btn-success"
              v-if="quiz.single_attempt && quiz.user_attempts === 0"
              @click="startQuiz(quiz.id)">Start</button>

            <button class="btn btn-success"
              v-if="!quiz.single_attempt"
              @click="startQuiz(quiz.id)">Start (Multiple Attempts)</button>

            <span class="badge bg-warning text-dark" v-if="quiz.single_attempt && quiz.user_attempts > 0">
              Already Attempted
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      query: '',
      results: {
        subjects: [],
        chapters: [],
        quizzes: []
      }
    };
  },
  methods: {
    searchAll() {
      if (!this.query.trim()) {
        this.results = { subjects: [], chapters: [], quizzes: [] };
        return;
      }

      fetch(`/api/user/search?q=${this.query}`, {
        headers: {
          'Authentication-Token': localStorage.getItem('auth_token')
        }
      })
        .then(res => res.json())
        .then(data => {
          this.results = data;
        });
    },
    goToChapters(subjectId) {
      this.$router.push({ name: 'Chapters', params: { subject_id: subjectId }, query: { readonly: true } });
    },
    goToQuizzes(chapterId) {
      this.$router.push({ name: 'QuizPage', params: { chapter_id: chapterId }, query: { readonly: true } });
    },
    startQuiz(quizId) {
      this.$router.push({ name: 'PlayQuiz', params: { quiz_id: quizId } });
    }
  }
};
