// =============================================
// AFI DECORATION — Login System
// =============================================

const Login = {
  CREDENTIALS_KEY: 'afi_credentials',
  IS_LOGGED_IN_KEY: 'afi_is_logged_in',
  
  // Default credentials
  defaultUsername: 'admin',
  defaultPassword: 'password',

  init() {
    this.ensureCredentialsExist();
    this.bindEvents();
    this.checkLoginState();
  },

  ensureCredentialsExist() {
    if (!localStorage.getItem(this.CREDENTIALS_KEY)) {
      localStorage.setItem(this.CREDENTIALS_KEY, JSON.stringify({
        username: this.defaultUsername,
        password: this.defaultPassword
      }));
    }
  },

  getCredentials() {
    return JSON.parse(localStorage.getItem(this.CREDENTIALS_KEY));
  },

  checkLoginState() {
    const isLoggedIn = localStorage.getItem(this.IS_LOGGED_IN_KEY) === 'true';
    if (isLoggedIn) {
      this.hideLoginScreen();
      App.init(); // Initialize main app only after login
    } else {
      this.showLoginScreen();
    }
  },

  bindEvents() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }
  },

  handleLogin() {
    const usernameInput = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-submit');

    // Reset error
    errorEl.classList.remove('show');
    errorEl.textContent = '';
    
    // Simulate loading
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Memverifikasi...';
    submitBtn.disabled = true;

    setTimeout(() => {
      const creds = this.getCredentials();
      if (usernameInput === creds.username && passwordInput === creds.password) {
        // Success
        localStorage.setItem(this.IS_LOGGED_IN_KEY, 'true');
        this.hideLoginScreen();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Init main app
        App.init();
      } else {
        // Error
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        errorEl.textContent = 'Username atau Password salah.';
        errorEl.classList.add('show');
        
        // Remove and re-add class to trigger animation again if needed
        setTimeout(() => errorEl.classList.remove('show'), 3000);
      }
    }, 600); // Fake network delay for better UX
  },

  showLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    const appEl = document.getElementById('app');
    if (loginScreen) loginScreen.classList.remove('hidden');
    if (appEl) appEl.style.display = 'none'; // Hide main app completely
  },

  hideLoginScreen() {
    const loginScreen = document.getElementById('login-screen');
    const appEl = document.getElementById('app');
    if (loginScreen) {
      loginScreen.style.opacity = '0';
      setTimeout(() => {
        loginScreen.classList.add('hidden');
      }, 300); // match transition duration
    }
    if (appEl) {
      appEl.style.display = 'flex'; // Restore main app
      // Trigger resize for any charts/layouts
      window.dispatchEvent(new Event('resize'));
    }
  },

  logout() {
    localStorage.removeItem(this.IS_LOGGED_IN_KEY);
    window.location.reload();
  }
};
