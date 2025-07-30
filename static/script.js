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
import AdminStats from './components/AdminStats.js';
import Quizzes from './components/Quizzes.js';
import QuestionsPage from './components/QuestionsPage.js';
import AdminSearch from './components/AdminSearch.js';
import PlayQuiz from './components/PlayQuiz.js';

const routes = [
    {path: '/', component: Home},
    {path: '/login', component: Login},
    {path: '/register', component: Register},
    {path: '/admin', component: AdminDashboard, props : true},
    {path: '/userdashboard', component: UserDashboard, props : true},
    {path:'/admin/stats', name: 'AdminStats', component: AdminStats},
    {path: '/subject/update/:sub_id', name:'UpdateSubject', component: UpdateSubject, props : true},
    { path: '/chapters/:subject_id', name: 'Chapters', component: Chapters , props : true},
    { path: '/chapter/update/:chap_id', name: 'UpdateChapter', component: UpdateChapter , props : true},
    { path: '/quizzes/:chapter_id',  name: 'QuizPage', component: Quizzes, props : true },
    { path: '/questions/:quiz_id', name: 'QuestionsPage', component: QuestionsPage, props : true},
    {path: '/admin/search', name: 'AdminSearch', component: AdminSearch, props : true},
    {path: '/quiz/play/:quiz_id', name: 'PlayQuiz', component: PlayQuiz, props : true},
    {path: '/quiz/result/:quiz_id', name: 'ScorePage', component: () => import('./components/ScorePage.js')}, // Lazy load ScorePage
    {path: '/scorehistory', name: 'ScoreHistory', component: () => import('./components/ScoreHistory.js'), props : true},
    { path: '/user/search', name: 'SearchPage', component: () => import('./components/UserSearch.js'), props : true},
    { path: '/user/stats', name: 'UserStats', component: () => import('./components/UserStats.js'), props : true }



]

const router = new VueRouter({
    routes, // route: route
})

const app = new Vue({
  el: "#app",
  router,
  template: `
    <div class="container">
        <nav-bar :loggedIn="loggedIn" @logout="handleLogout"></nav-bar>
        <router-view :loggedIn="loggedIn" @login="handleLogin"></router-view>
        <footer-bar></footer-bar>
    </div>
  `,
  data() {
    return {
      loggedIn: false
    };
  },
  mounted() {
    // Re-evaluate login status from localStorage
    this.loggedIn = !!localStorage.getItem('auth_token');
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
      localStorage.removeItem('auth_token');
    }
  }
});
