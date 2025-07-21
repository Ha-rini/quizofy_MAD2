export default {
    template: ` 
    <div>
        <h4 class="text-center mt-2">Update Chapter</h4>
        <div class="row border" style="width:50%; margin: auto;">
            <div>
                <img :src="chaptersData.image" class="card-img-top" alt="Chapter Thumbnail">
            </div>
            <div class="mb-3">
                <label for="chaptername" class="form-label">Chapter Name</label>
                <input type="text" class="form-control" id="chaptername" placeholder="Enter chapter name" v-model="chaptersData.name">
            </div>
            <div class="mb-3">
                <label for="chapterdescription" class="form-label">Chapter Description</label>
                <textarea class="form-control" id="chapterdescription" rows="2" v-model="chaptersData.description"></textarea>
            </div>
            <div class="mb-3">
                <label for="chapterimage" class="form-label">Chapter Image</label>
                <input type="file" class="form-control" id="chapterimage" accept="image/*" ref="chapterImage">
            </div>
            <div class="mb-3 text-end">
                <button class="btn btn-primary" @click="updateChapter">Update Chapter</button>
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
        updateChapter() {
            
        }
    }
}