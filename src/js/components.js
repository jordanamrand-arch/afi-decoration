// =============================================
// AFI DECORATION — UI Components (Modal, Toast, Tabs, Confirm)
// =============================================

const Components = {
  // ══════════════════════════════════════════
  // UTILITIES
  // ══════════════════════════════════════════
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  },

  // ══════════════════════════════════════════
  // TOAST NOTIFICATION SYSTEM
  // ══════════════════════════════════════════
  toastContainer: null,

  initToast() {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.className = 'toast-container';
      this.toastContainer.id = 'toast-container';
      document.body.appendChild(this.toastContainer);
    }
  },

  toast(type, title, message, duration = 4000) {
    this.initToast();

    const icons = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast__icon">${icons[type]}</div>
      <div class="toast__content">
        <div class="toast__title">${title}</div>
        ${message ? `<div class="toast__message">${message}</div>` : ''}
      </div>
      <button class="toast__close" onclick="Components.removeToast(this.parentElement)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    this.toastContainer.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => this.removeToast(toast), duration);
    }
  },

  removeToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 250);
  },

  // ══════════════════════════════════════════
  // MODAL SYSTEM
  // ══════════════════════════════════════════
  openModal(options) {
    const {
      title = '',
      content = '',
      size = '',
      footer = '',
      onClose = null,
      id = 'app-modal',
    } = options;

    // Remove existing
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const sizeClass = size ? `modal-${size}` : '';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    overlay.id = id;
    overlay.innerHTML = `
      <div class="modal ${sizeClass}">
        <div class="modal__header">
          <h3 class="modal__title">${title}</h3>
          <button class="modal__close" id="${id}-close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal__body">${content}</div>
        ${footer ? `<div class="modal__footer">${footer}</div>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    // Close handlers
    const closeBtn = document.getElementById(`${id}-close`);
    closeBtn.addEventListener('click', () => this.closeModal(id, onClose));

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal(id, onClose);
    });

    // ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal(id, onClose);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return overlay;
  },

  closeModal(id = 'app-modal', callback = null) {
    const overlay = document.getElementById(id);
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.remove();
        if (callback) callback();
      }, 200);
    }
  },

  // ══════════════════════════════════════════
  // CONFIRM DIALOG
  // ══════════════════════════════════════════
  confirm(options) {
    const {
      title = 'Konfirmasi',
      message = 'Apakah Anda yakin?',
      type = 'warning', // warning | danger
      confirmText = 'Ya, Lanjutkan',
      cancelText = 'Batal',
      onConfirm = null,
      onCancel = null,
    } = options;

    const icons = {
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      danger: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    };

    const content = `
      <div class="confirm-icon ${type}">${icons[type]}</div>
      <div class="confirm-text">
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    `;

    const confirmBtnClass = type === 'danger' ? 'btn btn-danger' : 'btn btn-primary';
    const footer = `
      <button class="btn btn-secondary" id="confirm-cancel">${cancelText}</button>
      <button class="${confirmBtnClass}" id="confirm-ok">${confirmText}</button>
    `;

    const modal = this.openModal({
      title: '',
      content,
      footer,
      id: 'confirm-dialog',
    });

    // Hide modal header for confirm dialog
    modal.querySelector('.modal__header').style.display = 'none';

    document.getElementById('confirm-cancel').addEventListener('click', () => {
      this.closeModal('confirm-dialog');
      if (onCancel) onCancel();
    });

    document.getElementById('confirm-ok').addEventListener('click', () => {
      this.closeModal('confirm-dialog');
      if (onConfirm) onConfirm();
    });
  },

  // ══════════════════════════════════════════
  // TAB SYSTEM
  // ══════════════════════════════════════════
  initTabs(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const tabs = container.querySelectorAll('.tab');
    const panels = container.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');
        const panel = container.querySelector(`[data-panel="${target}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  },
};
