export default {
  props: ['loggedIn'],
  template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light px-3 border-bottom">
      <div class="container-fluid d-flex justify-content-between align-items-center">
        <!-- Left Side: Brand + Nav Links -->
        <div class="d-flex align-items-center">
          <router-link class="navbar-brand fw-bold me-4" to="/">Quizofy</router-link>
          <ul class="navbar-nav flex-row gap-3" v-show="role">
            <!-- Admin Links -->
            <li class="nav-item" v-if="role === 'admin'">
              <router-link class="nav-link" to="/admin">Home</router-link>
            </li>
            <li class="nav-item" v-if="role === 'admin'">
              <router-link class="nav-link" to="/admin/search">Search</router-link>
            </li>
            <li class="nav-item" v-if="role === 'admin'">
              <router-link class="nav-link" to="/admin/stats">Stats</router-link>
            </li>

            <!-- User Links -->
            <li class="nav-item" v-if="role === 'user'">
              <router-link class="nav-link" to="/userdashboard">Home</router-link>
            </li>
            <li class="nav-item" v-if="role === 'user'">
              <router-link class="nav-link" to="/scorehistory">Score History</router-link>
            </li>
            <li class="nav-item" v-if="role === 'user'">
              <router-link class="nav-link" to="/user/search">Search</router-link>
            </li>
            <li class="nav-item" v-if="role === 'user'">
              <router-link class="nav-link" to="/user/stats">Stats</router-link>
            </li>
          </ul>
        </div>

        <!-- Right Side: Auth Buttons -->
        <div class="d-flex align-items-center">
          <router-link v-if="!loggedIn" class="btn btn-outline-primary me-2" to="/login">Login</router-link>
          <router-link v-if="!loggedIn" class="btn btn-primary" to="/register">Register</router-link>
          <button v-if="loggedIn" class="btn btn-outline-danger" @click="logoutUser">Logout</button>
        </div>
      </div>
    </nav>
  `,
  data() {
    return {
      role: null,
    };
  },
  mounted() {
    // Always check for auth token and fetch role on mount
    if (localStorage.getItem('auth_token')) {
      this.fetchUserRole();
    }
  },
  watch: {
    loggedIn(newVal) {
      if (newVal) {
        this.fetchUserRole();
      } else {
        this.role = null;
      }
    }
  },
  mounted() {
    if (this.loggedIn) {
      this.fetchUserRole();
    }
  },
  methods: {
    fetchUserRole() {
      fetch('/api/user/role', {
        headers: {
          'Authentication-Token': localStorage.getItem('auth_token')
        }
      })
        .then(res => res.json())
        .then(data => {
          this.role = data.role; // either 'admin' or 'user'
        })
        .catch(() => {
          this.role = null;
        });
    },
    logoutUser() {
      localStorage.clear();
      this.role = null;
      this.$emit('logout');
      this.$router.push('/');
    }
  }
};
