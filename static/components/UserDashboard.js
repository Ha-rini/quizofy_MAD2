export default {
    template: `
    <div>
        <h2>Hello, {{ userData.username }}! </h2>
        <div class ="row border">
            <div class="border">
                <h3 class="text-center">Upcoming Quizzes</h3> 
            </div>
            <div class="border">
                <h3 class="text-center">Explore the Subjects</h3>
                <div v-for="sub in subjects" class="card" style="width: 18rem;">
                    <img :src="sub.image" class="card-img-top" alt="Subject Thumbnail">
                    <div class="card-body">
                        <h5 class="card-title">{{sub.name}}</h5>
                        <p class="card-text">{{sub.description}}</p>
                        <a href="#" class="btn btn-primary">See chapters</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            userData: "", // Initialize user data
            subjects: [] // Initialize subjects data
        }
    },
    mounted() {
        this.loadUser();
        this.fetchSubjects();
    },
    methods: {
        loadUser() {
            // Fetch user data when the component is mounted
            fetch('/api/userdashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('auth_token') // Include the auth token in the request headers
                }
            })
            .then(response => {
                
                return response.json();
            })
            .then(data => {
                this.userData = data; // Handle the user data as needed
            });
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
        }
    }
}