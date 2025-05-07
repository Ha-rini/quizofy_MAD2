import Home from './components/Home.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import Navbar from './components/Navbar.js';
import Footer from './components/Footer.js';

const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register}
]

const router = new VueRouter({
    routes, // route: route
})

const app = new Vue({
    el:"#app",
    router, // router: router
    components: {
        'nav-bar': Navbar,
        'footer-bar': Footer
    },
    template: `
    <div class="container">
        <nav-bar></nav-bar>
        <router-view></router-view>
        <footer-bar></footer-bar> 
        
    </div>
    `,
    data: {
    
    }
})