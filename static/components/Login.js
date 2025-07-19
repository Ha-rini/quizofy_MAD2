export default {
    template: `
    <div class ="row border">
        <div class="col" style="height: 500px">
            <div class="border mx-auto mt-5" style="height:350px; width:300px">
                <div>
                    <h2 class="text-center mt-5">Login</h2>
                    <p class="mx-2 mt-2 text-danger">{{message}}</p>
                    <div class="mx-2 mb-3">
                            <label for="email" class="form-label">Email address:</label>
                            <input type="email" class="form-control" id="email" placeholder="name@example.com" v-model="formData.email">
                    </div>
                    
                    <div class="mx-2 mb-3">
                        <label for="password" class="form-label">Password:</label>
                        <input type="password" class="form-control" id="password" v-model="formData.password">
                    </div>
                    <div class="mx-2 mb-3 text-center">
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
            },
            message: ""
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
            .then(response => response.json())
            .then(data => {
                if (Object.keys(data).includes('auth-token')){
                    localStorage.setItem("auth_token", data['auth-token'])// token is stored in local storage
                    localStorage.setItem("id", data.id)// user id is stored in local storage
                    localStorage.setItem("username", data.username)// username is stored in local storage
                    //for admin login - done
                    if (data.roles.includes('admin')) {
                        this.$router.push('/admin');
                    } else {
                        this.$router.push('/userdashboard');
                    }
                }
                else {
                    this.message = data.message; // display error message) 
                }
            })
        }
    }
}

