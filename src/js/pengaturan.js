// =============================================
// AFI DECORATION — Pengaturan (Settings) Page
// =============================================

const PengaturanPage = {
  render() {
    const creds = JSON.parse(localStorage.getItem('afi_credentials')) || { username: 'admin' };

    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-header__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Pengaturan Sistem
          </h1>
          <p class="page-header__subtitle">Kelola preferensi dan keamanan akun</p>
        </div>
      </div>

      <div class="pengaturan-layout stagger-children">
        <div class="pengaturan-card slide-up">
          <h2 class="pengaturan-card-title">Kredensial Akun</h2>
          <p class="pengaturan-card-desc">Ubah username dan password untuk login ke aplikasi AFI Decoration.</p>
          
          <form id="pengaturan-form" class="pengaturan-form">
            <div class="form-group">
              <label class="form-label" for="setting-username">Username Baru <span class="required">*</span></label>
              <input type="text" id="setting-username" class="form-input" value="${creds.username}" required>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="setting-password">Password Baru <span class="required">*</span></label>
              <input type="password" id="setting-password" class="form-input" placeholder="Masukkan password baru" required minlength="4">
            </div>

            <div class="form-group">
              <label class="form-label" for="setting-password-confirm">Konfirmasi Password Baru <span class="required">*</span></label>
              <input type="password" id="setting-password-confirm" class="form-input" placeholder="Ketik ulang password baru" required minlength="4">
            </div>

            <div id="pengaturan-alert" class="pengaturan-alert"></div>

            <div class="pengaturan-actions">
              <button type="submit" id="btn-save-pengaturan" class="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  init() {
    const page = document.getElementById('page-pengaturan');
    if (!page) return;

    const form = page.querySelector('#pengaturan-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveCredentials();
      });
    }
  },

  saveCredentials() {
    const username = document.getElementById('setting-username').value.trim();
    const password = document.getElementById('setting-password').value;
    const passwordConfirm = document.getElementById('setting-password-confirm').value;
    const alertBox = document.getElementById('pengaturan-alert');

    // Reset alert
    alertBox.className = 'pengaturan-alert';
    alertBox.style.display = 'none';

    if (password !== passwordConfirm) {
      this.showAlert('error', 'Konfirmasi password tidak cocok.');
      return;
    }

    if (username === '' || password === '') {
      this.showAlert('error', 'Username dan password tidak boleh kosong.');
      return;
    }

    // Save to localStorage
    const newCreds = { username, password };
    localStorage.setItem('afi_credentials', JSON.stringify(newCreds));

    this.showAlert('success', 'Kredensial berhasil diperbarui! Gunakan kredensial baru saat login berikutnya.');
    
    // Clear password fields
    document.getElementById('setting-password').value = '';
    document.getElementById('setting-password-confirm').value = '';

    if (typeof Components !== 'undefined') {
      Components.toast('success', 'Berhasil', 'Kredensial akun telah diperbarui');
    }
  },

  showAlert(type, message) {
    const alertBox = document.getElementById('pengaturan-alert');
    if (alertBox) {
      alertBox.textContent = message;
      alertBox.className = `pengaturan-alert ${type}`;
      
      // Hide alert after 5 seconds
      setTimeout(() => {
        alertBox.className = 'pengaturan-alert';
      }, 5000);
    }
  }
};
