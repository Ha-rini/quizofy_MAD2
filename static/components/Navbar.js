export default {
    template: `
    <div class ="row border">
        <div class="col-10 fs-2">
           
            Quizofy
            
        </div>
        <div class="col-2 border text-right">

            <div class="mt-1" v-if="!loggedIn">
                <router-link class="btn btn-dark my-2" to="/login">Login</router-link>
                <router-link class="btn btn-primary my-2" to="/register">Register</router-link>
            </div>
            <div class="mt-1" v-else>
                <button class="btn btn-dark">Logout</button>
            </div>
        </div>
    </div>
    `,
    data:
    function() {
        return {
            user: null,
            loggedIn: localStorage.getItem('auth_token') ? true : false
        };
    },
    watch: {
        loggedIn(newVal, oldVal) {
            if (newVal !== oldVal) {
                this.$router.go(0); // Refresh the page to reflect the login state change
            }
        }
    }
}