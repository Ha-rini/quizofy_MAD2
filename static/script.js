import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';
import AdminDashboard from './components/AdminDashboard.js';
import UserDashboard from './components/UserDashboard.js';
import UpdateSubject from './components/UpdateSubject.js';

const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/admin', component: AdminDashboard},
    {path: '/userdashboard', component: UserDashboard},
    {path: '/subject/update/:sub_id', name:'UpdateSubject', component: UpdateSubject}
]

const router = new VueRouter({
    routes, // route: route
})

const app = new Vue({
    el:"#app",
    router, // router: router
    
    template: `
    <div class="container">
        <nav-bar></nav-bar>
        <router-view></router-view>
        <footer-bar></footer-bar> 
        
    </div>
    `,
    data: {
        section:"Frontend"
    },
    components: {
        'nav-bar': Navbar,
        'footer-bar': Footer
    }
})