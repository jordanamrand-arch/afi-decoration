// =============================================
// AFI DECORATION — Invoice Generator
// =============================================

const InvoicePage = {
  showInvoice(bookingId) {
    const booking = DataStore.getById(DataStore.KEYS.BOOKINGS, bookingId);
    if (!booking) {
      Components.toast('danger', 'Error', 'Booking tidak ditemukan');
      return;
    }

    const invoiceId = `INV-${bookingId.replace('BK-', '')}`;
    const now = new Date();

    // Build items table
    let itemsHtml = '';
    if (booking.jenisSewa === 'paket' && booking.paketId) {
      const paket = DataStore.getById(DataStore.KEYS.STOK_PAKET, booking.paketId);
      if (paket) {
        paket.komponen.forEach((k, i) => {
          itemsHtml += `
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; color: #a3c9b2;">${i + 1}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; color: #f0fdf4;">${k.nama}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; text-align: center; color: #a3c9b2;">${k.qty}</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; text-align: right; color: #a3c9b2;">-</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; text-align: right; color: #a3c9b2;">-</td>
            </tr>
          `;
        });
        itemsHtml += `
          <tr>
            <td colspan="4" style="padding: 10px 12px; text-align: right; font-weight: 600; color: #f0fdf4;">Harga Paket: ${booking.paketNama}</td>
            <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #4ade80; font-size: 16px;">${formatCurrency(booking.totalBiaya)}</td>
          </tr>
        `;
      }
    } else if (booking.items && booking.items.length) {
      booking.items.forEach((item, i) => {
        const subtotal = item.harga * item.qty;
        itemsHtml += `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; color: #a3c9b2;">${i + 1}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; color: #f0fdf4;">${item.nama}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; text-align: center; color: #a3c9b2;">${item.qty}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; text-align: right; color: #a3c9b2;">${formatCurrency(item.harga)}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #1e3226; text-align: right; color: #a3c9b2;">${formatCurrency(subtotal)}</td>
          </tr>
        `;
      });
    }

    const invoiceContent = `
      <div id="invoice-print-area" style="background: #0e1a13; color: #f0fdf4; padding: 40px; border-radius: 16px; border: 1px solid #1e3226;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #16a34a;">
          <div>
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #16a34a, #10b981); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; font-family: 'Outfit', sans-serif;">A</div>
              <div>
                <div style="font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 700;">AFI DECORATION</div>
                <div style="font-size: 12px; color: #5f8a6e;">Wedding & Event Decoration</div>
              </div>
            </div>
            <div style="font-size: 12px; color: #5f8a6e; margin-top: 12px; line-height: 1.6;">
              Jl. Dekorasi Indah No. 123<br>
              Bandung, Jawa Barat 40133<br>
              Tel: 022-1234567
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 700; color: #4ade80;">INVOICE</div>
            <div style="font-size: 13px; color: #a3c9b2; margin-top: 4px;">
              <div><strong style="color: #f0fdf4;">No:</strong> ${invoiceId}</div>
              <div><strong style="color: #f0fdf4;">Tanggal:</strong> ${formatDate(now.toISOString())}</div>
              <div><strong style="color: #f0fdf4;">Ref:</strong> ${booking.id}</div>
            </div>
          </div>
        </div>

        <!-- Client Info -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
          <div style="background: #142019; padding: 16px; border-radius: 12px; border: 1px solid #1e3226;">
            <div style="font-size: 11px; text-transform: uppercase; color: #5f8a6e; letter-spacing: 1px; margin-bottom: 8px;">Ditagihkan Kepada</div>
            <div style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">${booking.namaKlien}</div>
            <div style="font-size: 13px; color: #a3c9b2;">${booking.kontak}</div>
          </div>
          <div style="background: #142019; padding: 16px; border-radius: 12px; border: 1px solid #1e3226;">
            <div style="font-size: 11px; text-transform: uppercase; color: #5f8a6e; letter-spacing: 1px; margin-bottom: 8px;">Detail Acara</div>
            <div style="font-size: 13px; color: #a3c9b2; line-height: 1.6;">
              <strong style="color: #f0fdf4;">Tanggal:</strong> ${formatDate(booking.tanggalAcara)}<br>
              <strong style="color: #f0fdf4;">Venue:</strong> ${booking.venue}<br>
              <strong style="color: #f0fdf4;">Tipe:</strong> ${booking.paketNama || 'Mix & Match'}
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background: #142019;">
              <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #5f8a6e; letter-spacing: 0.5px; border-bottom: 1px solid #1e3226;">No</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #5f8a6e; letter-spacing: 0.5px; border-bottom: 1px solid #1e3226;">Item</th>
              <th style="padding: 10px 12px; text-align: center; font-size: 11px; text-transform: uppercase; color: #5f8a6e; letter-spacing: 0.5px; border-bottom: 1px solid #1e3226;">Qty</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #5f8a6e; letter-spacing: 0.5px; border-bottom: 1px solid #1e3226;">Harga</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 11px; text-transform: uppercase; color: #5f8a6e; letter-spacing: 0.5px; border-bottom: 1px solid #1e3226;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <!-- Payment Summary -->
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 300px; background: #142019; padding: 16px; border-radius: 12px; border: 1px solid #1e3226;">
            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
              <span style="color: #5f8a6e;">Total Biaya</span>
              <span style="color: #f0fdf4;">${formatCurrency(booking.totalBiaya)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px;">
              <span style="color: #5f8a6e;">DP Dibayar</span>
              <span style="color: #4ade80;">${formatCurrency(booking.dp)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 0 4px; font-size: 16px; font-weight: 700; border-top: 1px solid #1e3226; margin-top: 8px;">
              <span style="color: #f0fdf4;">Sisa Bayar</span>
              <span style="color: #fbbf24;">${formatCurrency(booking.sisaBayar)}</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1e3226; display: flex; justify-content: space-between; align-items: flex-end;">
          <div style="font-size: 11px; color: #5f8a6e; line-height: 1.6;">
            <strong style="color: #a3c9b2;">Catatan:</strong><br>
            • Pembayaran dapat dilakukan melalui transfer bank<br>
            • Pelunasan paling lambat H-7 sebelum acara<br>
            • Invoice ini sah sebagai bukti pemesanan
          </div>
          <div style="text-align: center;">
            <div style="font-size: 12px; color: #5f8a6e; margin-bottom: 40px;">Hormat kami,</div>
            <div style="font-weight: 600; color: #f0fdf4;">AFI Decoration</div>
          </div>
        </div>
      </div>
    `;

    Components.openModal({
      title: `Invoice ${invoiceId}`,
      size: 'xl',
      content: invoiceContent,
      footer: `
        <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
        <button class="btn btn-primary" id="btn-print-invoice">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Cetak Invoice
        </button>
      `,
    });

    document.getElementById('btn-print-invoice')?.addEventListener('click', () => {
      this.printInvoice();
    });

    // Log the invoice generation
    DataStore.addLog({
      type: 'invoice',
      action: 'Cetak Invoice',
      detail: `Invoice ${invoiceId} untuk ${booking.id} — ${booking.namaKlien}`,
    });
  },

  printInvoice() {
    const printArea = document.getElementById('invoice-print-area');
    if (!printArea) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - AFI Decoration</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: #fff; padding: 20px; }
          @media print {
            body { padding: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        ${printArea.outerHTML}
        <script>
          setTimeout(() => { window.print(); window.close(); }, 500);
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();

    Components.toast('success', 'Invoice Dicetak', 'Halaman cetak telah dibuka');
  },
};
