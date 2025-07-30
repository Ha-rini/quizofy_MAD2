export default {
    template: ` 
    <div>
        <h4 class="text-center mt-2">Update Subject</h4>
        <div class="row border" style="width:50%; margin: auto;">
            <div>
                <img :src="subjectsData.image" class="card-img-top" alt="Subject Thumbnail" v-if="subjectsData.image">
            </div>
            <div class="mb-3">
                <label for="subjectname" class="form-label">Subject Name</label>
                <input type="text" class="form-control" id="subjectname" placeholder="Enter subject name" v-model="subjectsData.name">
            </div>
            <div class="mb-3">
                <label for="subjectdescription" class="form-label">Subject Description</label>
                <textarea class="form-control" id="subjectdescription" rows="2" v-model="subjectsData.description"></textarea>
            </div>
            <div class="mb-3">
                <label for="subjectimage" class="form-label">Subject Image (Leave empty to keep existing)</label>
                <input type="file" class="form-control" id="subjectimage" accept="image/*" ref="subjectImage">
            </div>
            <div class="mb-3 text-end">
                <button class="btn btn-primary" @click="updateSubject">Update Subject</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            subjectsData: {
                name: '',
                description: '',
                image: null
            }
        }
    },
    mounted() {
        this.fetchSubject();
    },
    methods: {
        fetchSubject() {
            const sub_id = this.$route.params.sub_id;
            fetch(`/api/subjects/get/${sub_id}`, {
                method: 'GET',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                this.subjectsData.name = data.name;
                this.subjectsData.description = data.description;
                this.subjectsData.image = data.image;
            })
            .catch(err => console.error(err));
        },

        updateSubject() {
            const sub_id = this.$route.params.sub_id;
            const fileInput = this.$refs.subjectImage;
            const formData = new FormData();
            formData.append("name", this.subjectsData.name);
            formData.append("description", this.subjectsData.description);
            if (fileInput.files.length) {
                formData.append("image", fileInput.files[0]);
            }

            fetch(`/api/subjects/update/${sub_id}`, {
                method: 'PUT',
                body: formData,
                headers: {
                    'Authentication-Token': localStorage.getItem('auth_token')
                }
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                this.$router.push('/admin'); // Redirect back to admin dashboard
            })
            .catch(err => console.error(err));
        }
    }
}
