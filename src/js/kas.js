// =============================================
// AFI DECORATION — Arus Kas (Cash Flow) Page
// =============================================

const KasPage = {
  render() {
    const kas = DataStore.getAllKas();
    const summary = DataStore.getFinancialSummary();

    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-header__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Arus Kas
          </h1>
          <p class="page-header__subtitle">Catat & pantau arus keuangan</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn-primary" id="btn-tambah-kas">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Catat Transaksi
          </button>
        </div>
      </div>

      <!-- Summary -->
      <div class="kas-summary stagger-children">
        <div class="kas-summary-card">
          <div class="kas-summary-card__icon inflow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
          <div class="kas-summary-card__info">
            <div class="kas-summary-card__label">Total Pemasukan</div>
            <div class="kas-summary-card__value inflow">${formatCurrency(summary.totalInflow)}</div>
          </div>
        </div>
        <div class="kas-summary-card">
          <div class="kas-summary-card__icon outflow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          </div>
          <div class="kas-summary-card__info">
            <div class="kas-summary-card__label">Total Pengeluaran</div>
            <div class="kas-summary-card__value outflow">${formatCurrency(summary.totalOutflow)}</div>
          </div>
        </div>
        <div class="kas-summary-card">
          <div class="kas-summary-card__icon balance">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div class="kas-summary-card__info">
            <div class="kas-summary-card__label">Saldo Kas</div>
            <div class="kas-summary-card__value">${formatCurrency(summary.sisaKas)}</div>
          </div>
        </div>
      </div>

      <!-- Transactions Table -->
      <div class="kas-content">
        <div class="kas-toolbar">
          <div class="kas-toolbar__filters">
            <div class="search-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Cari transaksi..." id="kas-search">
            </div>
            <select class="form-select" id="kas-filter-type" style="width: auto; padding: var(--space-2) var(--space-8) var(--space-2) var(--space-3);">
              <option value="all">Semua</option>
              <option value="inflow">Pemasukan</option>
              <option value="outflow">Pengeluaran</option>
            </select>
          </div>
        </div>
        <div class="table-container" style="border: none; border-radius: 0;">
          <table class="table kas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th>Nota</th>
                <th class="text-right">Nominal</th>
              </tr>
            </thead>
            <tbody id="kas-tbody">
              ${kas.map(k => this.renderKasRow(k)).join('')}
            </tbody>
          </table>
          ${!kas.length ? `
            <div class="empty-state">
              <div class="empty-state__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <h3 class="empty-state__title">Belum ada transaksi</h3>
              <p class="empty-state__desc">Mulai catat pemasukan dan pengeluaran</p>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  renderKasRow(k) {
    const isInflow = k.tipe === 'inflow';
    const categoryLabels = {
      dp: 'DP', pelunasan: 'Pelunasan', sewa: 'Sewa',
      operasional: 'Operasional', pembelian: 'Pembelian',
      gaji: 'Gaji', transport: 'Transport', lainnya: 'Lainnya',
    };

    return `
      <tr data-id="${k.id}" data-type="${k.tipe}">
        <td><span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted)">${k.id}</span></td>
        <td>${formatDateShort(k.createdAt)}</td>
        <td>
          <span class="badge ${isInflow ? 'badge-success' : 'badge-danger'} badge-dot">
            ${isInflow ? 'Masuk' : 'Keluar'}
          </span>
        </td>
        <td>
          <div class="kas-category">
            <span class="kas-category__dot ${k.kategori}"></span>
            ${categoryLabels[k.kategori] || k.kategori}
          </div>
        </td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${k.keterangan}</td>
        <td><span style="font-family: var(--font-mono); font-size: 11px;">${k.nota || '-'}</span></td>
        <td class="text-right amount ${k.tipe}">
          ${isInflow ? '+' : '-'} ${formatCurrency(k.nominal)}
        </td>
      </tr>
    `;
  },

  init() {
    const page = document.getElementById('page-kas');
    if (!page) return;

    // Search
    page.querySelector('#kas-search')?.addEventListener('input', () => this.filterKas(page));

    // Filter type
    page.querySelector('#kas-filter-type')?.addEventListener('change', () => this.filterKas(page));

    // Add transaction
    page.querySelector('#btn-tambah-kas')?.addEventListener('click', () => {
      this.showTambahKas();
    });
  },

  filterKas(page) {
    const search = page.querySelector('#kas-search')?.value.toLowerCase() || '';
    const typeFilter = page.querySelector('#kas-filter-type')?.value || 'all';
    const rows = page.querySelectorAll('#kas-tbody tr');

    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const type = row.dataset.type;

      const matchSearch = text.includes(search);
      const matchType = typeFilter === 'all' || type === typeFilter;

      row.style.display = matchSearch && matchType ? '' : 'none';
    });
  },

  showTambahKas() {
    Components.openModal({
      title: 'Catat Transaksi Baru',
      content: `
        <div class="kas-form__type-toggle">
          <div class="kas-type-btn active inflow" data-kas-type="inflow">
            <div class="kas-type-btn__icon">📈</div>
            <div class="kas-type-btn__label">Pemasukan</div>
          </div>
          <div class="kas-type-btn" data-kas-type="outflow">
            <div class="kas-type-btn__icon">📉</div>
            <div class="kas-type-btn__label">Pengeluaran</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div class="form-group">
            <label class="form-label">Nominal <span class="required">*</span></label>
            <input type="number" class="form-input" id="kas-nominal" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label">Kategori <span class="required">*</span></label>
            <select class="form-select" id="kas-kategori">
              <option value="dp">DP</option>
              <option value="pelunasan">Pelunasan</option>
              <option value="sewa">Sewa</option>
              <option value="operasional">Operasional</option>
              <option value="pembelian">Pembelian</option>
              <option value="gaji">Gaji</option>
              <option value="transport">Transport</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Keterangan <span class="required">*</span></label>
            <textarea class="form-textarea" id="kas-keterangan" placeholder="Detail transaksi..." rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">No. Nota</label>
            <input type="text" class="form-input" id="kas-nota" placeholder="NTA-xxx / INV-xxx">
          </div>
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Components.closeModal()">Batal</button>
        <button class="btn btn-primary" id="btn-save-kas">Simpan Kas</button>
      `,
    });

    let kasType = 'inflow';

    // Type toggle
    document.querySelectorAll('[data-kas-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-kas-type]').forEach(b => {
          b.classList.remove('active', 'inflow', 'outflow');
        });
        kasType = btn.dataset.kasType;
        btn.classList.add('active', kasType);
      });
    });

    // Save
    document.getElementById('btn-save-kas')?.addEventListener('click', () => {
      const nominal = Math.round(parseFloat(document.getElementById('kas-nominal')?.value) || 0);
      const kategori = document.getElementById('kas-kategori')?.value;
      const keterangan = document.getElementById('kas-keterangan')?.value.trim();
      const nota = document.getElementById('kas-nota')?.value.trim();

      if (!nominal || !keterangan) {
        Components.toast('warning', 'Data Belum Lengkap', 'Isi nominal dan keterangan');
        return;
      }

      DataStore.addKas({ tipe: kasType, nominal, kategori, keterangan, nota });
      Components.closeModal();
      Components.toast('success', 'Transaksi Dicatat', `${kasType === 'inflow' ? 'Pemasukan' : 'Pengeluaran'} ${formatCurrency(nominal)}`);
      this.refresh();
    });
  },

  refresh() {
    const page = document.getElementById('page-kas');
    if (page) {
      page.innerHTML = this.render();
      this.init();
    }
  },
};
