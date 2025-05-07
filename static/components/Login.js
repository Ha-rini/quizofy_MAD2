export default {
    template: `
    <div class ="row border">
        <div class="col" style="height: 500px">
            <div class="border mx-auto mt-5" style="height:350px; width:300px">
                <div>
                    <h2 class="text-center mt-5">Login</h2>
                    <div>
                        <label for="email">Email:</label>
                        <input type="email" id="email" v-model="formData.email">
                    </div>
                    <div>
                        <label for="password">Password:</label>
                        <input type="password" id="password" v-model="formData.password">
                    </div>
                    <div>
                        <button class="btn btn-dark" @click="loginuser">Login</button>
                    </div>

                </div>
            </div>
        </div>
    </div>
    `,
    data: function() {
        return {
            formData : {
            email: "",
            password: ""
            }
        }
    },
    methods: {
        loginuser: function() {
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.formData) //content goes to backend as JSON string
            })
            .then(response => response.json()) // response is converted to JSON
            .then(data => {
                localStorage.setItem("auth_token", data['auth-token'])// token is stored in local storage
                localStorage.setItem("id", data['id'])// user id is stored in local storage
                this.$router.push('/user'); // redirect to home page
            })            
        }
    }
}
