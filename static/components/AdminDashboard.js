export default {
    template: `
    <div>
        <h2 class="text-center mt-2">Welcome, Admin!</h2>
        <div class="row border">        
            <div class="col-8 border" style="overflow-y: scroll; height: 80vh;">
                <h4 class="mt-2 text-center">Your Subjects</h4>
                <div v-for="sub in subjects" :key="sub.id" class="card mt-2" style="width: 18rem;">
                    <img :src="sub.image" class="card-img-top" alt="Subject Thumbnail">
                    <div class="card-body">
                        <h5 class="card-title">{{ sub.name }}</h5>
                        <p class="card-text">{{ sub.description }}</p>
                        <a href="#" class="btn btn-primary">See chapters</a>
                        <router-link :to="{ name: 'UpdateSubject', params: { sub_id: sub.id } }" class="btn btn-warning">Edit</router-link>
                        <a href="#" class="btn btn-danger">Delete</a>
                    </div>
                </div>
            </div>
            <div class="col-4 border">
                <h4 class="mt-2 text-center">Add New Subject</h4>
                <div class="mb-3">
                    <label for="subjectname" class="form-label">Subject Name</label>
                    <input type="text" class="form-control" id="subjectname" placeholder="Enter subject name" v-model="subjectsData.name">
                </div>
                <div class="mb-3">
                    <label for="subjectdescription" class="form-label">Subject Description</label>
                    <textarea class="form-control" id="subjectdescription" rows="2" v-model="subjectsData.description"></textarea>
                </div>
                <div class="mb-3">
                    <label for="subjectimage" class="form-label">Subject Image</label>
                    <input type="file" class="form-control" id="subjectimage" accept="image/*" ref="subjectImage">
                </div>
                <div class="mb-3 text-end">
                    <button class="btn btn-primary" @click="addSubject">Add Subject</button>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            userData: "",
            subjects: [],
            subjectsData: {
                name: '',
                description: ''
            },
            message:""
        };
    },

    mounted() {
        this.loadUser();
        this.fetchSubjects();
    },

    methods: {
        loadUser() {
            fetch('/api/AdminDashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('auth_token')
                }
            })
            .then(response => response.json())
            .then(data => this.userData = data)
        },
            
        fetchSubjects() {
            fetch('/api/subjects/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('auth_token')
                }
            })
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch subjects");
                return response.json();
            })
            .then(data => {
                this.subjects = data;
            })
            .catch(err => console.error(err));
        },

        addSubject() {
            const fileInput = this.$refs.subjectImage;
            if (!fileInput || !fileInput.files.length) {
                alert("Please select an image.");
                return;
            }

            const formData = new FormData();
            formData.append("name", this.subjectsData.name);
            formData.append("description", this.subjectsData.description);
            formData.append("image", fileInput.files[0]);

            fetch('/api/subjects/create', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authentication-Token': localStorage.getItem('auth_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data.message);
                this.fetchSubjects();
                this.subjectsData.name = '';
                this.subjectsData.description = '';
                fileInput.value = ''; // Reset file input manually
            })
            .catch(err => {
                console.error(err);
            });
        }
    }
};
