// =============================================
// AFI DECORATION — Dashboard Page
// =============================================

const DashboardPage = {
  render() {
    const summary = DataStore.getFinancialSummary();
    const logs = DataStore.getAllLog().slice(0, 15);
    const agenda = DataStore.getUpcomingAgenda();

    return `
      <div class="page-header">
        <div class="page-header__left">
          <h1 class="page-header__title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </h1>
          <p class="page-header__subtitle">Ringkasan operasional AFI Decoration hari ini</p>
        </div>
        <div class="page-header__actions">
          <button class="btn btn-icon theme-toggle" onclick="window.toggleTheme()" title="Ubah Tema" style="margin-right: var(--space-2); background: var(--dark-input); border: 1px solid var(--dark-border); padding: 8px; border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
            ${document.documentElement.getAttribute('data-theme') === 'light' 
              ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
              : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
            }
          </button>
          <span style="font-size: var(--text-xs); color: var(--text-muted); display: flex; align-items: center;">
            ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards stagger-children">
        <div class="summary-card summary-card--omset">
          <div class="summary-card__top">
            <div class="summary-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <div class="summary-card__trend ${summary.omsetTrend >= 0 ? 'up' : 'down'}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                ${summary.omsetTrend >= 0 
                  ? '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>' 
                  : '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>'}
              </svg>
              ${summary.omsetTrend >= 0 ? '+' : ''}${summary.omsetTrend}%
            </div>
          </div>
          <div class="summary-card__value">${formatCurrency(summary.omset)}</div>
          <div class="summary-card__label">Total Omset</div>
        </div>

        <div class="summary-card summary-card--piutang">
          <div class="summary-card__top">
            <div class="summary-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="summary-card__trend ${summary.piutangTrend >= 0 ? 'up' : 'down'}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                ${summary.piutangTrend >= 0 
                  ? '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>' 
                  : '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>'}
              </svg>
              ${summary.piutangTrend >= 0 ? '+' : ''}${summary.piutangTrend}%
            </div>
          </div>
          <div class="summary-card__value">${formatCurrency(summary.piutang)}</div>
          <div class="summary-card__label">Total Piutang</div>
        </div>

        <div class="summary-card summary-card--kas">
          <div class="summary-card__top">
            <div class="summary-card__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
          </div>
          <div class="summary-card__value">${formatCurrency(summary.sisaKas)}</div>
          <div class="summary-card__label">Sisa Kas</div>
        </div>

        <div class="summary-card summary-card--labakotor">
          <div class="summary-card__top">
            <div class="summary-card__icon" style="background: rgba(168, 85, 247, 0.1); color: #c084fc;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div class="summary-card__value">${formatCurrency(summary.labaKotor)}</div>
          <div class="summary-card__label">Laba Kotor</div>
        </div>

        <div class="summary-card summary-card--lababersih">
          <div class="summary-card__top">
            <div class="summary-card__icon" style="background: rgba(236, 72, 153, 0.1); color: #f472b6;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 9l-5-5-4 4-5-5"/></svg>
            </div>
          </div>
          <div class="summary-card__value">${formatCurrency(summary.labaBersih)}</div>
          <div class="summary-card__label">Laba Bersih</div>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="dashboard-grid stagger-children">
        <!-- Activity Log Stream -->
        <div class="activity-stream">
          <div class="activity-stream__header">
            <h3 class="activity-stream__title">
              <span class="pulse-dot"></span>
              Log Aktivitas
            </h3>
            <span style="font-size: var(--text-xs); color: var(--text-muted);">Real-time</span>
          </div>
          <div class="activity-stream__list" id="activity-list">
            ${logs.length ? logs.map(log => this.renderLogItem(log)).join('') : `
              <div class="empty-state" style="padding: var(--space-10)">
                <p style="color: var(--text-muted)">Belum ada aktivitas</p>
              </div>
            `}
          </div>
        </div>

        <!-- Upcoming Agenda -->
        <div class="agenda-section">
          <div class="agenda-section__header">
            <h3 class="agenda-section__title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" style="color: var(--green-400)"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Agenda Terdekat
            </h3>
            <span class="badge badge-success badge-dot">${agenda.length} event</span>
          </div>
          <div class="agenda-list" id="agenda-list">
            ${agenda.length ? agenda.map(a => this.renderAgendaItem(a)).join('') : `
              <div class="empty-state" style="padding: var(--space-10)">
                <p style="color: var(--text-muted)">Tidak ada agenda mendatang</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  renderLogItem(log) {
    const iconMap = {
      booking: { class: 'booking', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
      stok: { class: 'stok', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>` },
      kas: { class: 'kas', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>` },
      invoice: { class: 'invoice', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` },
    };

    const icon = iconMap[log.type] || iconMap.booking;

    return `
      <div class="activity-item">
        <div class="activity-item__icon ${icon.class}">${icon.icon}</div>
        <div class="activity-item__content">
          <div class="activity-item__text"><strong>${log.action}</strong> — ${log.detail}</div>
          <div class="activity-item__time">${timeAgo(log.timestamp)}</div>
        </div>
      </div>
    `;
  },

  renderAgendaItem(booking) {
    const days = daysUntil(booking.tanggalAcara);
    const d = new Date(booking.tanggalAcara);
    const day = d.getDate();
    const month = d.toLocaleDateString('id-ID', { month: 'short' }).toUpperCase();

    let countdownClass = '';
    if (days === 0) countdownClass = 'today';
    else if (days <= 3) countdownClass = 'urgent';

    const statusBadge = booking.status === 'confirmed'
      ? '<span class="badge badge-success badge-dot">Confirmed</span>'
      : '<span class="badge badge-warning badge-dot">Pending</span>';

    return `
      <div class="agenda-item">
        <div class="agenda-item__date">
          <span class="agenda-item__date-day">${day}</span>
          <span class="agenda-item__date-month">${month}</span>
        </div>
        <div class="agenda-item__info">
          <div class="agenda-item__name">${booking.namaKlien}</div>
          <div class="agenda-item__details">
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              ${booking.venue}
            </span>
          </div>
          <div style="margin-top: 4px">${statusBadge}</div>
        </div>
        <div class="agenda-item__countdown ${countdownClass}">
          <div class="agenda-item__countdown-value">${days === 0 ? 'HARI INI' : days}</div>
          <div class="agenda-item__countdown-label">${days === 0 ? '' : 'hari lagi'}</div>
        </div>
      </div>
    `;
  },
};
