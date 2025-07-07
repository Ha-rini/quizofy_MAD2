export default {
    template: `
    <div class ="row border">
        <div class="col" style="height: 500px">
            <div class="border mx-auto mt-5" style="height:350px; width:300px">
                Register Page
                <br>
                <div>
                        <label for="email">Email:</label> <br>
                        <input type="email" id="email" v-model="formData.email">
                    </div>
                    <div>
                        <label for="username">Username:</label> <br>
                        <input type="text" id="username" v-model="formData.username">
                    </div>
                    <div>
                        <label for="password">Password:</label> <br>
                        <input type="password" id="password" v-model="formData.password">
                    </div>
                    <div>
                        <button class="btn btn-dark" @click="registerUser">Register</button>
                    </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            formData : {
            email: "",
            username: "",
            password: ""
            }
        }
    },
    methods: {
        registerUser: function() {
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.formData) //content goes to backend as JSON string
            })
            .then(response => response.json()) // response is converted to JSON
            .then(data => {
                alert(data.message); // Show the response message
                console.log(data); // Log the response data for debugging
                this.$router.push('/login'); // redirect to login page
            })
        }
    }
}
