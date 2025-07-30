export default {
    template: `
    <div>
        <h4 class="text-center mt-2">Update Chapter</h4>
        <div class="row border" style="width:50%; margin: auto;">
            <div class="mb-3">
                <label for="chaptername" class="form-label">Chapter Name</label>
                <input type="text" class="form-control" v-model="chaptersData.name">
            </div>
            <div class="mb-3">
                <label for="chapterdescription" class="form-label">Chapter Description</label>
                <textarea class="form-control" rows="2" v-model="chaptersData.description"></textarea>
            </div>
            <div class="mb-3 text-end">
                <button class="btn btn-primary" @click="updateChapter">Update Chapter</button>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            chaptersData: {
                name: '',
                description: '',
                subject_id: null
            }
        };
    },
    mounted() {
        this.fetchChapter();
    },
    methods: {
        fetchChapter() {
            const chapId = this.$route.params.chap_id;
            fetch(`/api/chapters/get_single/${chapId}`, {
                headers: {
                    'Authentication-Token': localStorage.getItem("auth_token")
                }
            })
            .then(res => res.json())
            .then(data => {
                this.chaptersData = {
                    name: data.name,
                    description: data.description,
                    subject_id: data.subject_id
                };
            });
        },
        updateChapter() {
            const chapId = this.$route.params.chap_id;
            const payload = {
                name: this.chaptersData.name,
                description: this.chaptersData.description,
                subject_id: this.chaptersData.subject_id
            };

            fetch(`/api/chapters/update/${chapId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem("auth_token")
                },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                this.$router.push(`/chapters/${this.chaptersData.subject_id}`);
            })
            .catch(err => console.error(err));
        }
    }
};