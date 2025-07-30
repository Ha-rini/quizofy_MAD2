export default {
  template: `
    <div class="container mt-3">
      <h3>Manage Questions for Quiz ID: {{ quiz_id }}</h3>
      <button class="btn btn-primary mb-3" data-bs-toggle="modal" data-bs-target="#questionModal" @click="setNew()">+ Add New Question</button>

      <div v-for="q in questions" :key="q.id" class="card mb-3">
        <div class="card-body">
          <h5>Q: {{ q.question_statement }}</h5>
          <ul>
            <li>1. {{ q.option1 }}</li>
            <li>2. {{ q.option2 }}</li>
            <li>3. {{ q.option3 }}</li>
            <li>4. {{ q.option4 }}</li>
          </ul>
          <p><strong>Correct:</strong> {{ q.correct_option }}</p>
          <button class="btn btn-warning me-2" data-bs-toggle="modal" data-bs-target="#questionModal" @click="setEdit(q)">Edit</button>
          <button class="btn btn-danger" @click="deleteQuestion(q.id)">Delete</button>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal fade" id="questionModal" tabindex="-1" aria-labelledby="questionModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="questionModalLabel">{{ editMode ? 'Edit Question' : 'Add Question' }}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="cancelForm"></button>
            </div>
            <div class="modal-body">
              <div class="mb-2">
                <textarea class="form-control" v-model="form.question_statement" placeholder="Question"></textarea>
              </div>
              <div v-for="n in 4" :key="n" class="mb-2">
                <input class="form-control" v-model="form['option' + n]" :placeholder="'Option ' + n">
              </div>
              <div class="mb-2">
                <label>Select correct option:</label>
                <select class="form-select" v-model="form.correct_option">
                  <option disabled value="">Choose...</option>
                  <option v-for="n in 4" :key="n" :value="form['option' + n]">Option {{ n }}</option>
                </select>
              </div>
              <div class="text-danger mb-2" v-if="formError">{{ formError }}</div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="cancelForm">Cancel</button>
              <button type="button" class="btn btn-success" @click="submitQuestion">{{ editMode ? 'Update' : 'Create' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      quiz_id: this.$route.params.quiz_id,
      questions: [],
      editMode: false,
      editId: null,
      form: {
        question_statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: ''
      },
      formError: ''
    };
  },
  mounted() {
    this.loadQuestions();
  },
  methods: {
    loadQuestions() {
      fetch(`/api/questions/get/${this.quiz_id}`, {
        headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
      })
        .then(r => r.json())
        .then(d => this.questions = d)
        .catch(e => console.error(e));
    },
    setNew() {
      this.editMode = false;
      this.editId = null;
      this.formError = '';
      this.form = {
        question_statement: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correct_option: ''
      };
    },
    setEdit(q) {
      this.editMode = true;
      this.editId = q.id;
      this.form = { ...q };
      this.formError = '';
    },
    validateForm() {
      const f = this.form;
      if (!f.question_statement.trim()) return "Question cannot be empty.";
      for (let i = 1; i <= 4; i++) {
        if (!f['option' + i].trim()) return `Option ${i} is required.`;
      }
      if (!f.correct_option) return 'Select the correct answer.';
      return '';
    },
    submitQuestion() {
      const err = this.validateForm();
      if (err) {
        this.formError = err;
        return;
      }

      const url = this.editMode
        ? `/api/questions/update/${this.editId}`
        : '/api/questions/create';

      const payload = { ...this.form, quiz_id: this.quiz_id };

      fetch(url, {
        method: this.editMode ? 'PUT' : 'POST',
        headers: {
          'Authentication-Token': localStorage.getItem('auth_token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(r => r.json())
        .then(d => {
          alert(d.message);
          this.loadQuestions();
          this.cancelForm();
          // Hide modal
          const modal = bootstrap.Modal.getInstance(document.getElementById('questionModal'));
          if (modal) modal.hide();
        })
        .catch(err => console.error(err));
    },
    deleteQuestion(qid) {
      if (!confirm('Delete this question?')) return;
      fetch(`/api/questions/delete/${qid}`, {
        method: 'DELETE',
        headers: { 'Authentication-Token': localStorage.getItem('auth_token') }
      })
        .then(r => r.json())
        .then(d => {
          alert(d.message);
          this.loadQuestions();
        });
    },
    cancelForm() {
      this.editMode = false;
      this.editId = null;
      this.formError = '';
    }
  }
};
