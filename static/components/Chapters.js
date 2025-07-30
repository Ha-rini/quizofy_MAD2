export default {
  template: `
    <div>
      <div class="row border">        
        <div class="col-8 border" style="overflow-y: scroll; height: 80vh;">
          <h2 class="mt-2 text-center">{{ subjectName }}</h2>
          <h5 class="mt-2 text-center">Chapters</h5>
          <div v-for="chap in chapters" :key="chap.id" class="card mt-2" style="width: 18rem;">
            <div class="card-body">
              <h5 class="card-title">{{ chap.name }}</h5>
              <p class="card-text">{{ chap.description }}</p>
              <router-link :to="{ name: 'QuizPage', params: { chapter_id: chap.id }, query: { readonly: true } }" class="btn btn-primary" v-if="isReadOnly">
                See Quizzes
              </router-link>

              
              <div v-if="!isReadOnly">
                <router-link :to="{ name: 'QuizPage', params: { chapter_id: chap.id }}" class="btn btn-primary">
                  See Quizzes
                </router-link>
                <router-link :to="{ name: 'UpdateChapter', params: { chap_id: chap.id } }" class="btn btn-warning mt-2">Edit</router-link>
                <button class="btn btn-danger mt-2" @click="deleteChapter(chap.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <div class="col-4 border" v-if="!isReadOnly">
          <h4 class="mt-2 text-center">Add New Chapter</h4>
          <div class="mb-3">
            <label for="chaptername" class="form-label">Chapter Name</label>
            <input type="text" class="form-control" id="chaptername" placeholder="Enter chapter name" v-model="chaptersData.name">
          </div>
          <div class="mb-3">
            <label for="chapterdescription" class="form-label">Chapter Description</label>
            <textarea class="form-control" id="chapterdescription" rows="2" v-model="chaptersData.description"></textarea>
          </div>
          <div class="mb-3 text-end">
            <button class="btn btn-primary" @click="addChapter">Add Chapter</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      subjectName: '',
      subject_id: this.$route.params.subject_id,
      chapters: [],
      chaptersData: {
        name: '',
        description: ''
      }
    };
  },
  mounted() {
    this.fetchSubjectName();
    this.fetchChapters(this.subject_id);
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
    fetchSubjectName() {
      fetch(`/api/subjects/get/${this.subject_id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('auth_token')
        }
      })
      .then(res => res.json())
      .then(data => {
        this.subjectName = data.name || '';
      })
      .catch(err => console.error(err));
    },
    fetchChapters(subjectId) {
      fetch(`/api/chapters/get/${subjectId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem("auth_token")
        }
      })
      .then(res => res.json())
      .then(data => {
        this.chapters = data;
      })
      .catch(err => console.error(err));
    },
    addChapter() {
      const payload = {
        name: this.chaptersData.name,
        description: this.chaptersData.description,
        subject_id: this.subject_id
      };

      fetch(`/api/chapters/create/${this.subject_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem("auth_token")
        },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        this.fetchChapters(this.subject_id);
        this.chaptersData = { name: '', description: '' };
      })
      .catch(err => console.error(err));
    },
    deleteChapter(chapId) {
      if (!confirm("Are you sure you want to delete this chapter?")) return;
      fetch(`/api/chapters/delete/${chapId}`, {
        method: 'DELETE',
        headers: {
          'Authentication-Token': localStorage.getItem('auth_token')
        }
      })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        this.fetchChapters(this.subject_id);
      })
      .catch(err => console.error(err));
    }
  }
};
