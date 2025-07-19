export default {
    template: ` 
    <div>
        <h4 class="text-center mt-2">Update Subject</h4>
        <div class="row border" style="width:50%; margin: auto;">
            <div>
                <img :src="subjectsData.image" class="card-img-top" alt="Subject Thumbnail">
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
                <label for="subjectimage" class="form-label">Subject Image</label>
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
            userData: "",
            subjectsData: {
                name: '',
                description: '',
                image: null
            },
        }
    },
    methods: {
        updateSubject() {
        }
    }
}