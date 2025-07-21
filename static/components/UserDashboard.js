export default {
    template: `
    <div>
        <h2>Hello, {{ userData.username }}! </h2>
        <div class ="row border">
            <div class="col-8 border">
                <h3 class="text-center">Upcoming Quizzes</h3> 
                
                <table class="table">
                    <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">No. of Questions</th>
                                <th scope="col">Quiz Name</th>
                                <th scope="col">Quiz Description</th>
                                <th scope="col">Date</th>
                                <th scope="col">Duration</th>
                                <th scope="col">Marks</th>
                                <th scope="col">Chapter</th>
                                <th scope="col">Single Attempt </th>
                                <th scope="col">Actions</th>
                            </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(quiz, index) in quizzes" :key="quiz.id">
                            <th scope="row">{{ index + 1 }}</th>
                            <td>{{ quiz.questions.length }}</td>
                            <td>{{ quiz.name }}</td>    
                            <td>{{ quiz.description }}</td>
                            <td>{{ quiz.date_of_quiz }}</td>
                            <td>{{ quiz.time_duration }}</td>
                            <td>{{ quiz.marks }}</td>
                            <td>{{ quiz.chapter_name }}</td>
                           <td>{{ quiz.single_attempt ? 'Yes' : 'No' }}</td>

                            <td>
                                <button class="btn btn-info mt-2" @click="viewQuiz(quiz)">View</button>
                                <button class="btn btn-success mt-2" @click="playQuiz(quiz)">Start</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            
            <div class="border">
                <h3 class="text-center">Explore the Subjects</h3>

                <div class="d-flex flex-wrap">
                    <div v-for="sub in subjects" class="card mx-3 mt-3" style="width: 18rem;">
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
            <div class="col-4 border">
                <h3 class="text-center"> View Quiz</h3>
                <p class="text-center">Select a quiz to view details</p>
                <div v-if="selectedQuiz" class="mx-2"   >
                    <h4>{{ selectedQuiz.name }}</h4>
                    <p>{{ selectedQuiz.description }}</p>
                    <p>Date: {{ selectedQuiz.date_of_quiz }}</p>
                    <p>Duration: {{ selectedQuiz.time_duration }} minutes</p>
                    <p>Marks: {{ selectedQuiz.marks }}</p>
                    <p>Chapter: {{ selectedQuiz.chapter_name }}</p>
                    <p>Single Attempt: {{ selectedQuiz.single_attempt ? 'Yes' : 'No' }}</p>
                    <div class="text-center">
                        <button class="btn btn-success mt-2" @click="playQuiz(selectedQuiz)">Start</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            userData: "", // Initialize user data
            subjects: [], // Initialize subjects data
            quizzes: [], // Initialize quizzes data
            selectedQuiz: null // Initialize selected quiz
        }
    },
    mounted() {
        this.loadUser();
        this.fetchSubjects();
        this.fetchQuizzes();
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
        },
        fetchQuizzes() {
            fetch('/api/quiz/get', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': localStorage.getItem('auth_token')
                }
            })
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch quizzes");
                return response.json();
            })
            .then(data => {
                console.log(data);
                this.quizzes = data;
            })
            .catch(err => console.error(err));
        },
        viewQuiz(quiz) {
            // Set the selected quiz
            this.selectedQuiz = quiz;
        },
    }
}