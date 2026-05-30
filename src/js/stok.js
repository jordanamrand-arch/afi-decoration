// =============================================
// AFI DECORATION — Stok Management Page
// =============================================

const StokPage = {
  currentTab: 'list', // list | tambah

  render() {
    const stats = DataStore.getStokStats();
    const items = DataStore.getAllStok();
    const paketList = DataStore.getAllPaket();

    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-header__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Manajemen Stok
          </h1>
          <p class="page-header__subtitle">Kelola properti & aset dekorasi</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn-icon theme-toggle" onclick="window.toggleTheme()" title="Ubah Tema" style="margin-right: var(--space-2); background: var(--dark-input); border: 1px solid var(--dark-border); padding: 8px; border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
            ${document.documentElement.getAttribute('data-theme') === 'light' 
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
            }
          </button>
          <button class="btn btn-primary" id="btn-tambah-stok">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tambah Stok
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stok-stats stagger-children">
        <div class="stok-stat">
          <div class="stok-stat__icon total">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div class="stok-stat__info">
            <div class="stok-stat__value">${stats.total}</div>
            <div class="stok-stat__label">Total Item</div>
          </div>
        </div>
        <div class="stok-stat">
          <div class="stok-stat__icon baik">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="stok-stat__info">
            <div class="stok-stat__value">${stats.baik}</div>
            <div class="stok-stat__label">Kondisi Baik</div>
          </div>
        </div>
        <div class="stok-stat">
          <div class="stok-stat__icon rusak">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="stok-stat__info">
            <div class="stok-stat__value">${stats.rusak}</div>
            <div class="stok-stat__label">Rusak / Perbaikan</div>
          </div>
        </div>
        <div class="stok-stat">
          <div class="stok-stat__icon paket">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div class="stok-stat__info">
            <div class="stok-stat__value">${stats.paket}</div>
            <div class="stok-stat__label">Total Paket</div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div id="stok-tabs">
        <div class="tabs" style="margin-bottom: var(--space-6); display: inline-flex;">
          <div class="tab active" data-tab="items">Daftar Item</div>
          <div class="tab" data-tab="paket">Daftar Paket</div>
        </div>

        <!-- Items Tab -->
        <div class="tab-panel active" data-panel="items">
          <div class="stok-content">
            <div class="stok-toolbar">
              <div class="stok-toolbar__left">
                <div class="search-input">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input type="text" placeholder="Cari item..." id="stok-search">
                </div>
              </div>
              <div class="stok-toolbar__right">
                <select class="form-select" id="stok-filter-kondisi" style="width: auto; padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);">
                  <option value="all">Semua Kondisi</option>
                  <option value="baik">Baik</option>
                  <option value="rusak">Rusak</option>
                  <option value="perbaikan">Perbaikan</option>
                </select>
              </div>
            </div>
            <div id="stok-items-list">
              ${items.map(item => this.renderStokRow(item)).join('')}
            </div>
          </div>
        </div>

        <!-- Paket Tab -->
        <div class="tab-panel" data-panel="paket">
          <div class="stok-content">
            <div style="padding: var(--space-2) 0;">
              ${paketList.map(p => this.renderPaketRow(p)).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderStokRow(item) {
    const kondisiMap = {
      baik: { badge: 'badge-success', text: 'Baik' },
      rusak: { badge: 'badge-danger', text: 'Rusak' },
      perbaikan: { badge: 'badge-warning', text: 'Perbaikan' },
    };
    const kondisi = kondisiMap[item.kondisi] || kondisiMap.baik;

    const emojiMap = {
      'Tenda': '⛺', 'Meja': '🪑', 'Kursi': '💺', 'Backdrop': '🌸',
      'Dekorasi': '🎨', 'Karpet': '🟥', 'Lampu': '💡', 'Bunga': '💐',
      'Pelaminan': '👑',
    };
    const emoji = emojiMap[item.kategori] || '📦';

    return `
      <div class="stok-item-row" data-id="${item.id}">
        <div class="stok-item__img">${emoji}</div>
        <div class="stok-item__info">
          <div class="stok-item__name">${item.nama}</div>
          <div class="stok-item__category">${item.kategori}</div>
        </div>
        <div class="stok-item__stock">
          <div class="stok-item__stock-value">${item.stokTersedia || item.totalStok}</div>
          <div class="stok-item__stock-label">/ ${item.totalStok} unit</div>
        </div>
        <span class="badge ${kondisi.badge} badge-dot">${kondisi.text}</span>
        <div class="stok-item__price">${formatCurrency(item.hargaSewa)}</div>
        <div class="stok-item__actions">
          <button class="btn btn-sm btn-secondary btn-edit-kondisi" data-id="${item.id}" title="Ubah Kondisi">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </div>
      </div>
    `;
  },

  renderPaketRow(paket) {
    return `
      <div class="stok-item-row" data-id="${paket.id}">
        <div class="stok-item__img">📦</div>
        <div class="stok-item__info">
          <div class="stok-item__name">${paket.nama}</div>
          <div class="stok-item__category">${paket.komponen.length} komponen</div>
        </div>
        <div class="stok-item__price" style="flex: 1; text-align: left;">
          <div style="font-size: var(--text-xs); color: var(--text-muted); margin-bottom: 2px;">Komponen:</div>
          ${paket.komponen.map(k => `<span style="font-size: 11px; color: var(--text-secondary)">${k.nama} (${k.qty}x) </span>`).join('• ')}
        </div>
        <div class="stok-item__price">${formatCurrency(paket.hargaBase)}</div>
      </div>
    `;
  },

  init() {
    const page = document.getElementById('page-stok');
    if (!page) return;

    // Tabs
    Components.initTabs('stok-tabs');

    // Search
    const search = page.querySelector('#stok-search');
    search?.addEventListener('input', () => this.filterItems(page));

    // Filter kondisi
    const filterKondisi = page.querySelector('#stok-filter-kondisi');
    filterKondisi?.addEventListener('change', () => this.filterItems(page));

    // Edit kondisi buttons
    page.querySelectorAll('.btn-edit-kondisi').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.showEditKondisi(id);
      });
    });

    // Tambah stok
    page.querySelector('#btn-tambah-stok')?.addEventListener('click', () => {
      this.showTambahStok();
    });
  },

  filterItems(page) {
    const search = page.querySelector('#stok-search')?.value.toLowerCase() || '';
    const kondisi = page.querySelector('#stok-filter-kondisi')?.value || 'all';
    const rows = page.querySelectorAll('#stok-items-list .stok-item-row');

    rows.forEach(row => {
      const name = row.querySelector('.stok-item__name')?.textContent.toLowerCase() || '';
      const itemKondisi = DataStore.getById(DataStore.KEYS.STOK_ITEMS, row.dataset.id)?.kondisi || 'baik';

      const matchSearch = name.includes(search);
      const matchKondisi = kondisi === 'all' || itemKondisi === kondisi;

      row.style.display = matchSearch && matchKondisi ? 'flex' : 'none';
    });
  },

  showEditKondisi(id) {
    const item = DataStore.getById(DataStore.KEYS.STOK_ITEMS, id);
    if (!item) return;

    Components.openModal({
      title: `Ubah Kondisi: ${item.nama}`,
      content: `
        <div class="form-group">
          <label class="form-label">Status Kondisi</label>
          <select class="form-select" id="edit-kondisi-value">
            <option value="baik" ${item.kondisi === 'baik' ? 'selected' : ''}>Baik</option>
            <option value="rusak" ${item.kondisi === 'rusak' ? 'selected' : ''}>Rusak</option>
            <option value="perbaikan" ${item.kondisi === 'perbaikan' ? 'selected' : ''}>Dalam Perbaikan</option>
          </select>
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
        <button class="btn btn-primary" id="btn-save-kondisi">Simpan</button>
      `,
    });

    document.getElementById('btn-save-kondisi')?.addEventListener('click', () => {
      const value = document.getElementById('edit-kondisi-value').value;
      DataStore.updateStokKondisi(id, value);
      Components.closeModal();
      Components.toast('success', 'Kondisi Diupdate', `${item.nama} → ${value}`);
      this.refresh();
    });
  },

  showTambahStok() {
    const stokItems = DataStore.getAllStok();

    Components.openModal({
      title: 'Tambah Stok Baru',
      size: 'lg',
      content: `
        <div class="stok-form-type" id="stok-add-type">
          <div class="stok-type-option selected" data-add-type="satuan">
            <div class="stok-type-option__icon">📦</div>
            <div class="stok-type-option__name">Satuan</div>
            <div class="stok-type-option__desc">Tambah item properti baru</div>
          </div>
          <div class="stok-type-option" data-add-type="paket">
            <div class="stok-type-option__icon">🎁</div>
            <div class="stok-type-option__name">Paket</div>
            <div class="stok-type-option__desc">Buat paket dari item yang ada</div>
          </div>
        </div>

        <!-- Satuan Form -->
        <div id="form-satuan">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Properti <span class="required">*</span></label>
              <input type="text" class="form-input" id="stok-nama" placeholder="Contoh: Tenda Dekorasi 4x6">
            </div>
            <div class="form-group">
              <label class="form-label">Kategori</label>
              <select class="form-select" id="stok-kategori">
                <option value="Tenda">Tenda</option>
                <option value="Meja">Meja</option>
                <option value="Kursi">Kursi</option>
                <option value="Backdrop">Backdrop</option>
                <option value="Dekorasi">Dekorasi</option>
                <option value="Karpet">Karpet</option>
                <option value="Lampu">Lampu</option>
                <option value="Bunga">Bunga</option>
                <option value="Pelaminan">Pelaminan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
          </div>
          <div class="form-row" style="margin-top: var(--space-4)">
            <div class="form-group">
              <label class="form-label">Total Stok <span class="required">*</span></label>
              <input type="number" class="form-input" id="stok-total" placeholder="0" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Harga Sewa <span class="required">*</span></label>
              <input type="number" class="form-input" id="stok-harga" placeholder="0">
            </div>
          </div>
        </div>

        <!-- Paket Form -->
        <div id="form-paket" style="display: none;">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nama Paket <span class="required">*</span></label>
              <input type="text" class="form-input" id="paket-nama" placeholder="Contoh: Paket Intimate Garden">
            </div>
            <div class="form-group">
              <label class="form-label">Harga Base <span class="required">*</span></label>
              <input type="number" class="form-input" id="paket-harga" placeholder="0">
            </div>
          </div>
          <div class="paket-composer" style="margin-top: var(--space-4)">
            <div class="paket-composer__header">
              <label class="form-label">Komponen Paket</label>
              <button class="btn btn-sm btn-outline" id="btn-add-komponen">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Tambah Item
              </button>
            </div>
            <div class="paket-composer__items" id="paket-komponen-list">
              <div class="paket-composer__item">
                <select class="form-select paket-komponen-select" style="flex:1">
                  ${stokItems.map(i => `<option value="${i.id}">${i.nama}</option>`).join('')}
                </select>
                <input type="number" class="form-input paket-komponen-qty" value="1" min="1" style="width: 70px;">
                <button class="paket-composer__item-remove btn-remove-komponen">✕</button>
              </div>
            </div>
          </div>
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
        <button class="btn btn-primary" id="btn-save-stok">Simpan Aset</button>
      `,
    });

    let addType = 'satuan';

    // Type toggle
    document.querySelectorAll('[data-add-type]').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('[data-add-type]').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        addType = opt.dataset.addType;
        document.getElementById('form-satuan').style.display = addType === 'satuan' ? 'block' : 'none';
        document.getElementById('form-paket').style.display = addType === 'paket' ? 'block' : 'none';
      });
    });

    // Add komponen
    document.getElementById('btn-add-komponen')?.addEventListener('click', () => {
      const list = document.getElementById('paket-komponen-list');
      const row = document.createElement('div');
      row.className = 'paket-composer__item';
      row.innerHTML = `
        <select class="form-select paket-komponen-select" style="flex:1">
          ${stokItems.map(i => `<option value="${i.id}">${i.nama}</option>`).join('')}
        </select>
        <input type="number" class="form-input paket-komponen-qty" value="1" min="1" style="width: 70px;">
        <button class="paket-composer__item-remove btn-remove-komponen">✕</button>
      `;
      list.appendChild(row);
      row.querySelector('.btn-remove-komponen').addEventListener('click', () => row.remove());
    });

    // Remove komponen
    document.querySelectorAll('.btn-remove-komponen').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.paket-composer__item').remove());
    });

    // Save
    document.getElementById('btn-save-stok')?.addEventListener('click', () => {
      if (addType === 'satuan') {
        const nama = document.getElementById('stok-nama')?.value.trim();
        const kategori = document.getElementById('stok-kategori')?.value;
        const totalStok = parseInt(document.getElementById('stok-total')?.value) || 0;
        const hargaSewa = Math.round(parseFloat(document.getElementById('stok-harga')?.value) || 0);

        if (!nama || !totalStok) {
          Components.toast('warning', 'Data Belum Lengkap', 'Isi nama dan total stok');
          return;
        }

        DataStore.addStokItem({ nama, kategori, totalStok, stokTersedia: totalStok, hargaSewa });
        Components.toast('success', 'Item Ditambahkan', nama);
      } else {
        const nama = document.getElementById('paket-nama')?.value.trim();
        const hargaBase = Math.round(parseFloat(document.getElementById('paket-harga')?.value) || 0);

        if (!nama || !hargaBase) {
          Components.toast('warning', 'Data Belum Lengkap', 'Isi nama paket dan harga');
          return;
        }

        const komponen = [];
        document.querySelectorAll('.paket-composer__item').forEach(row => {
          const itemId = row.querySelector('.paket-komponen-select')?.value;
          const qty = parseInt(row.querySelector('.paket-komponen-qty')?.value) || 1;
          const item = DataStore.getById(DataStore.KEYS.STOK_ITEMS, itemId);
          if (item) komponen.push({ itemId, nama: item.nama, qty });
        });

        DataStore.addPaket({ nama, hargaBase, komponen });
        Components.toast('success', 'Paket Ditambahkan', nama);
      }

      Components.closeModal();
      this.refresh();
    });
  },

  refresh() {
    const page = document.getElementById('page-stok');
    if (page) {
      page.innerHTML = this.render();
      this.init();
    }
  },
};
