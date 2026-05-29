// =============================================
// AFI DECORATION — App Router & Init
// =============================================

const App = {
  currentPage: 'dashboard',

  pages: {
    dashboard: { module: 'DashboardPage', label: 'Dashboard' },
    booking: { module: 'BookingPage', label: 'Booking' },
    stok: { module: 'StokPage', label: 'Manajemen Stok' },
    kas: { module: 'KasPage', label: 'Arus Kas' },
  },

  init() {
    // Init data store
    DataStore.init();

    // Handle hash routing
    this.handleRoute();
    window.addEventListener('hashchange', () => this.handleRoute());

    // Sidebar navigation
    this.initSidebar();

    // Mobile toggle
    this.initMobileNav();
  },

  handleRoute() {
    const hash = window.location.hash.slice(1) || 'dashboard';
    this.navigateTo(hash);
  },

  navigateTo(page) {
    if (!this.pages[page]) page = 'dashboard';
    this.currentPage = page;

    // Update dynamic sidebar badges
    this.updateBadges();

    // Update sidebar active
    document.querySelectorAll('.sidebar__item').forEach(item => {
      item.classList.toggle('active', item.dataset.page === page);
    });

    // Hide all pages, show target
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const pageEl = document.getElementById(`page-${page}`);

    if (pageEl) {
      // Render page content
      const moduleMap = {
        dashboard: DashboardPage,
        booking: BookingPage,
        stok: StokPage,
        kas: KasPage,
      };
      const module = moduleMap[page];
      if (module) {
        pageEl.innerHTML = module.render();
        pageEl.classList.add('active');

        // Init page interactions
        requestAnimationFrame(() => {
          if (module.init) module.init();
        });
      }
    }

    // Close mobile nav
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.sidebar__overlay')?.classList.remove('active');

    // Update URL hash
    if (window.location.hash !== `#${page}`) {
      history.replaceState(null, '', `#${page}`);
    }
  },

  updateBadges() {
    const badge = document.getElementById('booking-badge');
    if (badge) {
      // Filter out cancelled bookings to show active ones, or just show total!
      const activeBookings = DataStore.getAllBookings().filter(b => b.status !== 'batal').length;
      badge.textContent = activeBookings;
      badge.style.display = activeBookings > 0 ? 'inline-block' : 'none';
    }
  },

  initSidebar() {
    document.querySelectorAll('.sidebar__item[data-page]').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        this.navigateTo(page);
      });
    });
  },

  initMobileNav() {
    const toggle = document.querySelector('.sidebar__toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar__overlay');

    toggle?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('active');
    });

    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
    });
  },
};

// ── Start App ──
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
