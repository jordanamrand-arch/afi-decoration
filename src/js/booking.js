// =============================================
// AFI DECORATION — Booking Page
// =============================================

const BookingPage = {
  currentView: 'list', // list | form
  selectedType: null,   // paket | mix
  selectedPaket: null,
  mixItems: [],

  render() {
    if (this.currentView === 'form') return this.renderForm();
    return this.renderList();
  },

  renderList() {
    const bookings = DataStore.getAllBookings();

    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-header__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Booking
          </h1>
          <p class="page-header__subtitle">Kelola pemesanan dekorasi wedding</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn-primary" id="btn-new-booking">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Booking Baru
          </button>
        </div>
      </div>

      <div class="booking-cards stagger-children" id="booking-list">
        ${bookings.length ? bookings.map(b => this.renderBookingCard(b)).join('') : `
          <div class="empty-state" style="grid-column: 1/-1">
            <div class="empty-state__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="64" height="64"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h3 class="empty-state__title">Belum ada booking</h3>
            <p class="empty-state__desc">Mulai dengan menambahkan booking pertama Anda</p>
            <button class="btn btn-primary" id="btn-empty-booking">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Booking Baru
            </button>
          </div>
        `}
      </div>
    `;
  },

  renderBookingCard(b) {
    const statusMap = {
      pending: { badge: 'badge-warning', text: 'Pending' },
      confirmed: { badge: 'badge-success', text: 'Confirmed' },
      selesai: { badge: 'badge-info', text: 'Selesai' },
      lunas: { badge: 'badge-success', text: 'Lunas' },
      batal: { badge: 'badge-danger', text: 'Batal' },
    };
    const status = statusMap[b.status] || statusMap.pending;
    const days = daysUntil(b.tanggalAcara);
    const daysText = days < 0 ? 'Sudah lewat' : days === 0 ? 'Hari ini!' : `${days} hari lagi`;

    return `
      <div class="booking-card" data-id="${b.id}">
        <div class="booking-card__header">
          <span class="booking-card__id">${b.id}</span>
          <span class="badge ${status.badge} badge-dot">${status.text}</span>
        </div>
        <div class="booking-card__client">
          <div class="booking-card__name">${b.namaKlien}</div>
          <div class="booking-card__contact">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            ${b.kontak}
          </div>
        </div>
        <div class="booking-card__meta">
          <div class="booking-card__meta-item">
            <span class="booking-card__meta-label">Tanggal</span>
            <span class="booking-card__meta-value">${formatDateShort(b.tanggalAcara)}</span>
          </div>
          <div class="booking-card__meta-item">
            <span class="booking-card__meta-label">Countdown</span>
            <span class="booking-card__meta-value" style="color: ${days <= 3 && days >= 0 ? 'var(--color-warning)' : 'inherit'}">${daysText}</span>
          </div>
          <div class="booking-card__meta-item">
            <span class="booking-card__meta-label">Venue</span>
            <span class="booking-card__meta-value">${b.venue}</span>
          </div>
          <div class="booking-card__meta-item">
            <span class="booking-card__meta-label">Paket</span>
            <span class="booking-card__meta-value">${b.paketNama || 'Mix & Match'}</span>
          </div>
        </div>
        <div class="booking-card__footer">
          <div class="booking-card__amount">
            <span class="booking-card__amount-label">Total Biaya</span>
            <span class="booking-card__amount-value">${formatCurrency(b.totalBiaya)}</span>
          </div>
          <div class="booking-card__actions">
            <button class="btn btn-sm btn-secondary btn-invoice" data-id="${b.id}" title="Cetak Invoice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            </button>
            <button class="btn btn-sm btn-outline btn-detail" data-id="${b.id}" title="Detail">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderForm() {
    const stokItems = DataStore.getAllStok().filter(i => i.kondisi === 'baik');
    const paketList = DataStore.getAllPaket();

    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-header__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Booking Baru
          </h1>
          <p class="page-header__subtitle">Buat pemesanan dekorasi wedding baru</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn-secondary" id="btn-back-booking">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Kembali
          </button>
        </div>
      </div>

      <div class="booking-form">
        <!-- Step 1: Data Klien -->
        <div class="booking-form__section">
          <h3 class="booking-form__section-title">
            <span class="step-number">1</span>
            Data Klien
          </h3>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Klien <span class="required">*</span></label>
              <input type="text" class="form-input" id="booking-nama" placeholder="Contoh: Anisa & Budi">
            </div>
            <div class="form-group">
              <label class="form-label">No. Kontak <span class="required">*</span></label>
              <input type="text" class="form-input" id="booking-kontak" placeholder="0812-xxxx-xxxx">
            </div>
          </div>
          <div class="form-row" style="margin-top: var(--space-4)">
            <div class="form-group">
              <label class="form-label">Tanggal Acara <span class="required">*</span></label>
              <input type="date" class="form-input" id="booking-tanggal">
            </div>
            <div class="form-group">
              <label class="form-label">Venue <span class="required">*</span></label>
              <input type="text" class="form-input" id="booking-venue" placeholder="Nama venue / gedung">
            </div>
          </div>
        </div>

        <!-- Step 2: Pilih Jenis Sewa -->
        <div class="booking-form__section">
          <h3 class="booking-form__section-title">
            <span class="step-number">2</span>
            Jenis Sewa
          </h3>
          <div class="package-type-selector">
            <div class="package-type-option" data-type="paket" id="opt-paket">
              <div class="package-type-option__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
              <div class="package-type-option__name">Paket Jadi</div>
              <div class="package-type-option__desc">Pilih dari paket yang sudah tersedia</div>
            </div>
            <div class="package-type-option" data-type="mix" id="opt-mix">
              <div class="package-type-option__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <div class="package-type-option__name">Mix & Match</div>
              <div class="package-type-option__desc">Pilih item satuan sesuai kebutuhan</div>
            </div>
          </div>

          <!-- Paket List (shown when paket selected) -->
          <div id="paket-section" style="display: none;">
            <h4 style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-4);">Pilih Paket:</h4>
            <div class="package-list">
              ${paketList.map(p => `
                <div class="package-item" data-paket-id="${p.id}">
                  <div class="package-item__name">${p.nama}</div>
                  <div class="package-item__price">${formatCurrency(p.hargaBase)}</div>
                  <div class="package-item__components">
                    ${p.komponen.map(k => `• ${k.nama} (${k.qty}x)`).join('<br>')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Mix & Match (shown when mix selected) -->
          <div id="mix-section" style="display: none;">
            <h4 style="font-size: var(--text-sm); color: var(--text-secondary); margin-bottom: var(--space-4);">Pilih Item:</h4>
            <div class="mix-match-items">
              ${stokItems.map(item => `
                <div class="mix-match-item" data-item-id="${item.id}">
                  <div class="mix-match-item__check" data-item-id="${item.id}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="12" height="12" style="display:none"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div class="mix-match-item__info">
                    <div class="mix-match-item__name">${item.nama}</div>
                    <div class="mix-match-item__stock">Tersedia: ${item.stokTersedia || item.totalStok} unit</div>
                  </div>
                  <input type="number" class="form-input mix-match-item__qty" min="1" value="1" data-item-id="${item.id}" style="display:none">
                  <div class="mix-match-item__price">${formatCurrency(item.hargaSewa)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Step 3: Pembayaran (shown after items selected) -->
        <div class="booking-form__section" id="payment-section" style="display: none;">
          <h3 class="booking-form__section-title">
            <span class="step-number">3</span>
            Pembayaran
          </h3>
          <div class="payment-summary" id="payment-summary">
            <!-- Filled dynamically -->
          </div>
          <div class="form-row" style="margin-top: var(--space-4)">
            <div class="form-group">
              <label class="form-label">Jumlah DP <span class="required">*</span></label>
              <input type="number" class="form-input" id="booking-dp" placeholder="0">
            </div>
          </div>
          <div style="margin-top: var(--space-6); display: flex; gap: var(--space-3); justify-content: flex-end;">
            <button class="btn btn-secondary" id="btn-check-stok">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Cek Ketersediaan
            </button>
            <button class="btn btn-primary" id="btn-save-booking">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              Simpan Booking
            </button>
          </div>
          <div id="stock-check-result"></div>
        </div>
      </div>
    `;
  },

  init() {
    const page = document.getElementById('page-booking');
    if (!page) return;

    // New booking button
    page.querySelectorAll('#btn-new-booking, #btn-empty-booking').forEach(btn => {
      btn?.addEventListener('click', () => {
        this.currentView = 'form';
        this.selectedType = null;
        this.selectedPaket = null;
        this.mixItems = [];
        page.innerHTML = this.render();
        this.initForm(page);
      });
    });

    // Invoice buttons
    page.querySelectorAll('.btn-invoice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        InvoicePage.showInvoice(id);
      });
    });

    // Detail buttons
    page.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.showDetail(id);
      });
    });
  },

  initForm(page) {
    // Back button
    page.querySelector('#btn-back-booking')?.addEventListener('click', () => {
      this.currentView = 'list';
      page.innerHTML = this.render();
      this.init();
    });

    // Type selector
    page.querySelectorAll('.package-type-option').forEach(opt => {
      opt.addEventListener('click', () => {
        this.selectedType = opt.dataset.type;
        page.querySelectorAll('.package-type-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');

        const paketSection = page.querySelector('#paket-section');
        const mixSection = page.querySelector('#mix-section');
        const paySection = page.querySelector('#payment-section');

        if (this.selectedType === 'paket') {
          paketSection.style.display = 'block';
          mixSection.style.display = 'none';
        } else {
          paketSection.style.display = 'none';
          mixSection.style.display = 'block';
        }
        paySection.style.display = 'block';
        this.updatePaymentSummary(page);
      });
    });

    // Paket items click
    page.querySelectorAll('.package-item').forEach(item => {
      item.addEventListener('click', () => {
        page.querySelectorAll('.package-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        this.selectedPaket = item.dataset.paketId;
        this.updatePaymentSummary(page);
      });
    });

    // Mix & match checkboxes
    page.querySelectorAll('.mix-match-item__check').forEach(check => {
      check.addEventListener('click', () => {
        const itemId = check.dataset.itemId;
        const isChecked = check.classList.toggle('checked');
        const svg = check.querySelector('svg');
        const qtyInput = check.closest('.mix-match-item').querySelector('.mix-match-item__qty');

        svg.style.display = isChecked ? 'block' : 'none';
        qtyInput.style.display = isChecked ? 'block' : 'none';

        if (isChecked) {
          const item = DataStore.getById(DataStore.KEYS.STOK_ITEMS, itemId);
          this.mixItems.push({ ...item, qty: 1 });
        } else {
          this.mixItems = this.mixItems.filter(i => i.id !== itemId);
        }
        this.updatePaymentSummary(page);
      });
    });

    // Mix qty change
    page.querySelectorAll('.mix-match-item__qty').forEach(input => {
      input.addEventListener('change', () => {
        const itemId = input.dataset.itemId;
        const idx = this.mixItems.findIndex(i => i.id === itemId);
        if (idx !== -1) {
          this.mixItems[idx].qty = parseInt(input.value) || 1;
        }
        this.updatePaymentSummary(page);
      });
    });

    // Check stock
    page.querySelector('#btn-check-stok')?.addEventListener('click', () => {
      this.checkStock(page);
    });

    // Save booking
    page.querySelector('#btn-save-booking')?.addEventListener('click', () => {
      this.saveBooking(page);
    });
  },

  updatePaymentSummary(page) {
    const summary = page.querySelector('#payment-summary');
    if (!summary) return;

    let total = 0;
    let rows = '';

    if (this.selectedType === 'paket' && this.selectedPaket) {
      const paket = DataStore.getById(DataStore.KEYS.STOK_PAKET, this.selectedPaket);
      if (paket) {
        total = paket.hargaBase;
        rows = `<div class="payment-summary__row">
          <span class="payment-summary__label">${paket.nama}</span>
          <span class="payment-summary__value">${formatCurrency(paket.hargaBase)}</span>
        </div>`;
      }
    } else if (this.selectedType === 'mix') {
      this.mixItems.forEach(item => {
        const subtotal = item.hargaSewa * item.qty;
        total += subtotal;
        rows += `<div class="payment-summary__row">
          <span class="payment-summary__label">${item.nama} x${item.qty}</span>
          <span class="payment-summary__value">${formatCurrency(subtotal)}</span>
        </div>`;
      });
    }

    summary.innerHTML = rows + `
      <div class="payment-summary__row total">
        <span class="payment-summary__label">Total Biaya</span>
        <span class="payment-summary__value">${formatCurrency(total)}</span>
      </div>
    `;
  },

  checkStock(page) {
    const resultDiv = page.querySelector('#stock-check-result');
    if (!resultDiv) return;

    // Simple mock check
    const available = Math.random() > 0.2; // 80% chance available
    resultDiv.innerHTML = available ? `
      <div class="stock-check-result available" style="animation: fadeInUp 0.3s ease">
        <div class="stock-check-result__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Stok Tersedia!
        </div>
        <p style="font-size: var(--text-sm); color: var(--text-secondary)">Semua item tersedia untuk tanggal yang dipilih. Silakan lanjutkan booking.</p>
      </div>
    ` : `
      <div class="stock-check-result unavailable" style="animation: fadeInUp 0.3s ease">
        <div class="stock-check-result__title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Stok Kurang!
        </div>
        <p style="font-size: var(--text-sm); color: var(--text-secondary)">Beberapa item tidak tersedia. Silakan ubah pilihan atau tanggal acara.</p>
      </div>
    `;

    Components.toast(
      available ? 'success' : 'warning',
      available ? 'Stok Tersedia' : 'Stok Kurang',
      available ? 'Semua item siap untuk tanggal tersebut' : 'Harap periksa kembali ketersediaan'
    );
  },

  saveBooking(page) {
    const nama = page.querySelector('#booking-nama')?.value.trim();
    const kontak = page.querySelector('#booking-kontak')?.value.trim();
    const tanggal = page.querySelector('#booking-tanggal')?.value;
    const venue = page.querySelector('#booking-venue')?.value.trim();
    const dp = Math.round(parseFloat(page.querySelector('#booking-dp')?.value) || 0);

    if (!nama || !kontak || !tanggal || !venue) {
      Components.toast('warning', 'Data Belum Lengkap', 'Harap isi semua field yang wajib diisi');
      return;
    }

    let totalBiaya = 0;
    let paketId = null;
    let paketNama = null;
    let items = [];

    if (this.selectedType === 'paket' && this.selectedPaket) {
      const paket = DataStore.getById(DataStore.KEYS.STOK_PAKET, this.selectedPaket);
      totalBiaya = paket.hargaBase;
      paketId = paket.id;
      paketNama = paket.nama;
    } else if (this.selectedType === 'mix') {
      items = this.mixItems.map(i => ({
        itemId: i.id, nama: i.nama, qty: i.qty, harga: i.hargaSewa,
      }));
      totalBiaya = items.reduce((sum, i) => sum + (i.harga * i.qty), 0);
    }

    if (totalBiaya === 0) {
      Components.toast('warning', 'Pilih Paket/Item', 'Harap pilih paket atau item terlebih dahulu');
      return;
    }

    const booking = DataStore.addBooking({
      namaKlien: nama,
      kontak,
      tanggalAcara: tanggal,
      venue,
      jenisSewa: this.selectedType,
      paketId,
      paketNama,
      items,
      totalBiaya: Math.round(totalBiaya),
      dp: Math.round(dp),
      sisaBayar: Math.round(totalBiaya - dp),
    });

    // Also add DP to kas if > 0
    if (dp > 0) {
      DataStore.addKas({
        tipe: 'inflow',
        nominal: dp,
        kategori: 'dp',
        keterangan: `DP Booking ${booking.id} - ${nama}`,
        nota: generateInvoiceId(),
      });
    }

    Components.toast('success', 'Booking Berhasil!', `${booking.id} — ${nama}`);

    // Go back to list
    this.currentView = 'list';
    page.innerHTML = this.render();
    this.init();
  },

  showDetail(id) {
    const b = DataStore.getById(DataStore.KEYS.BOOKINGS, id);
    if (!b) return;

    const statusOptions = ['pending', 'confirmed', 'selesai', 'lunas', 'batal'];

    Components.openModal({
      title: `Detail Booking ${b.id}`,
      size: 'lg',
      content: `
        <div style="display: flex; flex-direction: column; gap: var(--space-5);">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Klien</label>
              <div style="color: var(--text-primary); font-weight: 500;">${b.namaKlien}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Kontak</label>
              <div style="color: var(--text-primary);">${b.kontak}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Tanggal Acara</label>
              <div style="color: var(--text-primary);">${formatDate(b.tanggalAcara)}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Venue</label>
              <div style="color: var(--text-primary);">${b.venue}</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Paket / Jenis</label>
              <div style="color: var(--text-primary);">${b.paketNama || 'Mix & Match'}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-select" id="detail-status">
                ${statusOptions.map(s => `<option value="${s}" ${s === b.status ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="payment-summary">
            <div class="payment-summary__row">
              <span class="payment-summary__label">Total Biaya</span>
              <span class="payment-summary__value">${formatCurrency(b.totalBiaya)}</span>
            </div>
            <div class="payment-summary__row">
              <span class="payment-summary__label">DP Dibayar</span>
              <span class="payment-summary__value" style="color: var(--green-400)">${formatCurrency(b.dp)}</span>
            </div>
            <div class="payment-summary__row total">
              <span class="payment-summary__label">Sisa Bayar</span>
              <span class="payment-summary__value">${formatCurrency(b.sisaBayar)}</span>
            </div>
          </div>
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
        <button class="btn btn-primary" id="btn-update-status">Simpan Perubahan</button>
      `,
    });

    document.getElementById('btn-update-status')?.addEventListener('click', () => {
      const newStatus = document.getElementById('detail-status').value;
      DataStore.updateBooking(id, { status: newStatus });
      Components.closeModal();
      Components.toast('success', 'Status Diupdate', `${b.id} → ${newStatus}`);
      const page = document.getElementById('page-booking');
      this.currentView = 'list';
      page.innerHTML = this.render();
      this.init();
    });
  },
};
