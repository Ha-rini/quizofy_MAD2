import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import AdminDashboard from './components/AdminDashboard.js';
import UserDashboard from './components/UserDashboard.js';
import UpdateSubject from './components/UpdateSubject.js';
import Chapters from './components/Chapters.js';
import UpdateChapter from './components/UpdateChapter.js';

const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/admin', component: AdminDashboard},
    {path: '/userdashboard', component: UserDashboard},
    {path: '/subject/update/:sub_id', name:'UpdateSubject', component: UpdateSubject},
    {path: '/chapters', name:'Chapters', component: Chapters},
    {path: '/chapter/update/:chap_id', name:'UpdateChapter', component: UpdateChapter}
]

const router = new VueRouter({
    routes, // route: route
})

const app = new Vue({
    el:"#app",
    router, // router: router
    
    template: `
    <div class="container">
        <nav-bar :loggedIn = 'loggedIn' @logout="handleLogout"></nav-bar>
        <router-view :loggedIn = 'loggedIn' @login="handleLogin"></router-view>
        <footer-bar></footer-bar>

    </div>
    `,
    data: {
        loggedIn: false,
        navBarbtns: {
            summary: false,
            search: false,
            home: true,
            scores: false
        }
    },
    components: {
        'nav-bar': Navbar,
        'footer-bar': Footer
    },
    methods: {
        handleLogin() {
            this.loggedIn = true;
        },
        handleLogout() {
            this.loggedIn = false;
        }
    },
})