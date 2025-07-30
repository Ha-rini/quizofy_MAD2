export default {
    template: `
    <div class="row border">
        <div class="col" style="height: 500px">
            <div class="border mx-auto mt-5" style="height: 450px; width: 300px;">
                <div>
                    <h2 class="text-center mt-4">Register</h2>
                    <p class="mx-2 mt-2 text-danger">{{message}}</p>
                    
                    <div class="mx-2 mb-2">
                        <label for="email" class="form-label">Email address:</label>
                        <input type="email" class="form-control" id="email" placeholder="name@example.com" v-model="formData.email">
                    </div>

                    <div class="mx-2 mb-2">
                        <label for="username" class="form-label">Username:</label>
                        <input type="text" class="form-control" id="username" v-model="formData.username">
                    </div>

                    <div class="mx-2 mb-3">
                        <label for="password" class="form-label">Password:</label>
                        <input type="password" class="form-control" id="password" v-model="formData.password">
                    </div>

                    <div class="mx-2 mb-3 text-center">
                        <button class="btn btn-dark" @click="registerUser">Register</button>
                    </div>

                    <div class="text-center py-3">
                        <router-link to="/login" class="small">Already have an account? Login</router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            formData: {
                email: "",
                username: "",
                password: ""
            },
            message: ""
        }
    },
    methods: {
        registerUser: function() {
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.formData)
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                    this.$router.push('/login');
                } else {
                    this.message = "Registration failed. Please try again.";
                }
            })
            .catch(err => {
                console.error(err);
                this.message = "Something went wrong.";
            });
        }
    }
}
