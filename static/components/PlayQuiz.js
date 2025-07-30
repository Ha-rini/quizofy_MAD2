export default {
  template: `
    <div class="container" v-if="!submitted">
      <h3 class="text-center mt-3">{{ quiz.name }}</h3>
      <div class="text-end">
        <span>Time left: {{ minutesLeft }}:{{ secondsLeft }}</span>
      </div>
      <form @submit.prevent="submit">
        <div v-for="q in quiz.questions" :key="q.id" class="mb-4">
          <p><strong>{{ q.question }}</strong></p>
          <div v-for="opt in q.options" :key="opt">
            <label>
              <input type="radio"
                     :name="'q' + q.id"
                     :value="opt"
                     v-model="answers[q.id]" /> {{ opt }}
            </label>
          </div>
        </div>
        <div class="text-center">
          <button class="btn btn-primary" type="submit">Submit Quiz</button>
        </div>
      </form>
    </div>
  `,
  data() {
    return {
      quiz: { name: '', time_duration: 0, questions: [], quiz_id: null, single_attempt: false },
      answers: {},
      timer: null,
      timeLeft: 0,
      submitted: false,
      startTime: null
    };
  },
  computed: {
    minutesLeft() {
      return String(Math.floor(this.timeLeft / 60)).padStart(2, '0');
    },
    secondsLeft() {
      return String(this.timeLeft % 60).padStart(2, '0');
    }
  },
  mounted() {
    this.loadQuiz();
  },
  methods: {
    loadQuiz() {
      fetch(`/api/quiz/play/${this.$route.params.quiz_id}`, {
        headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
      })
        .then(r => {
          if (r.status === 403) {
            alert("You have already attempted this single-attempt quiz.");
            this.$router.push({name: ScorePage, params : {quiz_id : this.quiz.quiz_id }});
            return;
          }
          return r.json();
        })
        .then(data => {
          if (!data) return;

          this.quiz = data;
          this.total = data.total_possible_score;
          this.timeLeft = data.time_duration * 60;
          this.quiz.quiz_id = data.quiz_id;
          this.quiz.single_attempt = data.single_attempt;
          this.startTime = Date.now();
          this.startTimer();
        })
        .catch(err => console.error(err));
    },
    startTimer() {
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          clearInterval(this.timer);
          this.submit();
        }
      }, 1000);
    },
    submit() {
      if (this.submitted) return; // prevent double submission
      this.submitted = true;
      if (this.timer) clearInterval(this.timer);

      const timeTakenSec = Math.floor((Date.now() - this.startTime) / 1000);

      fetch(`/api/quiz/play/${this.quiz.quiz_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('auth_token')
        },
        body: JSON.stringify({
          answers: this.answers,
          time_taken: timeTakenSec
        })
      })
        .then(r => r.json())
        .then(data => {
          if (data.message === "Single attempt quiz already attempted") {
            alert(data.message);
            this.$router.push("/dashboard");
            return;
          }

          // Redirect to result page with score info
          this.$router.push({
            name: "ScorePage",
            query: {
              score: data.score,
              total: data.total,
              quiz_id: this.quiz.quiz_id,
              single_attempt: this.quiz.single_attempt
            }
          });

        })
        .catch(err => console.error(err));
    }
  }
};
