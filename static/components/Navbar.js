export default {
    props: ['loggedIn'],
    template: `
    <div class ="row border">
        <div class="col-10 fs-2">
           
            Quizofy
            
        </div>
        <div class="col-2 border text-right">

            <div class="mt-1"  >
                <router-link v-if="!loggedIn" class="btn btn-dark my-2" to="/login">Login</router-link>
                <router-link v-if="!loggedIn" class="btn btn-primary my-2" to="/register">Register</router-link>
                <button  v-if="loggedIn" class="btn btn-dark" @click="logoutUser">Logout</button>
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
    methods: {
        logoutUser: function() {
            localStorage.clear(); // clear local storage
            this.$emit('logout'); // emit logout event to parent component
            this.$router.push('/');
        }
    },
}