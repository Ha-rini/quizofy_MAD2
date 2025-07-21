export default {
    template: `
    <div>
        
        <div class="row border">        
            <div class="col-8 border" style="overflow-y: scroll; height: 80vh;">
                <h4 class="mt-2 text-center">Your Chapters</h4>
                <div v-for="chap in chapters" :key="chap.id" class="card mt-2" style="width: 18rem;">
                    
                    <div class="card-body">
                        <h5 class="card-title">{{ chap.name }}</h5>
                        <p class="card-text">{{ chap.description }}</p>
                        <a href="#" class="btn btn-primary">See chapters</a>
                        <router-link :to="{ name: 'UpdateChapter', params: { chap_id: chap.id } }" class="btn btn-warning">Edit</router-link>
                        <a href="#" class="btn btn-danger">Delete</a>
                    </div>
                </div>
            </div>
            <div class="col-4 border">
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
            userData: "",
            chapters: [],
            chaptersData: {
                name: '',
                description: ''
            },
            message: ""
        };
    },
    mounted() {
        this.fetchChapters();
    },
    methods: {
        fetchChapters() {
            fetch('/api/chapters/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem("auth_token")}`
                }
            })
            .then(response => response.json())
            .then(data => {
                this.chapters = data;
            })
            .catch(err => console.error(err));
        },
        addChapter() {
            const formData = new FormData();
            formData.append('name', this.chaptersData.name);
            formData.append('description', this.chaptersData.description);
            if (this.$refs.chapterImage.files[0]) {
                formData.append('image', this.$refs.chapterImage.files[0]);
            }

            fetch('/api/chapters/create', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("auth_token")}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.fetchChapters();
                    this.chaptersData = { name: '', description: '' };
                    this.message = "Chapter added successfully!";
                } else {
                    this.message = data.message;
                }
            })
            .catch(err => console.error(err));
        }
    }
}