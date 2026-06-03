// =============================================
// AFI DECORATION — Mock Data, Supabase & Cache Sync
// =============================================

const DataStore = {
  // ── Keys ──
  KEYS: {
    BOOKINGS: 'afi_bookings',
    STOK_ITEMS: 'afi_stok_items',
    STOK_PAKET: 'afi_stok_paket',
    KAS: 'afi_kas',
    LOG: 'afi_log',
    COUNTER: 'afi_counter',
  },

  // ── Supabase Config ──
  client: null,
  isOnline: false,
  realtimeChannel: null,

  // ── Init ──
  async init() {
    // 1. Initialize local schema counters if missing
    if (!localStorage.getItem(this.KEYS.COUNTER)) {
      localStorage.setItem(this.KEYS.COUNTER, JSON.stringify({
        booking: 0, stok: 0, kas: 0, log: 0, paket: 0
      }));
    }

    // 2. Setup database click and toggle listeners
    this.setupUI();

    // 3. Initialize Supabase
    try {
      const config = JSON.parse(localStorage.getItem('afi_supabase_config')) || { url: '', key: '' };
      
      if (!config.url || !config.key) {
        throw new Error('Supabase configuration missing. Please setup in Settings.');
      }

      if (typeof supabase !== 'undefined') {
        this.client = supabase.createClient(config.url, config.key);
        this.setDbStatus('connecting', 'Menghubungkan...');
        await this.syncWithSupabase();
      } else {
        throw new Error('Supabase SDK not loaded');
      }
    } catch (err) {
      console.warn('Supabase initialization failed, falling back to Offline Local mode:', err);
      this.setDbStatus('offline', 'Mode Offline (Lokal)');
      
      // Fallback seed if local storage is empty
      const hasBeenSeeded = localStorage.getItem('afi_seeded') === 'true';
      if (!hasBeenSeeded && !this.getAll(this.KEYS.BOOKINGS).length) {
        this.seedData();
      }
    }
  },

  setupUI() {
    const container = document.getElementById('db-status-container');
    if (container) {
      container.addEventListener('click', () => {
        if (this.client) {
          Components.toast('info', 'Sinkronisasi Ulang', 'Sedang menghubungkan ke Supabase...');
          this.syncWithSupabase();
        }
      });
    }
  },

  setDbStatus(state, text) {
    const dot = document.getElementById('db-status-dot');
    const textEl = document.getElementById('db-status-text');
    if (dot && textEl) {
      dot.className = `db-status-dot ${state}`;
      textEl.textContent = text;
    }
  },

  async syncWithSupabase() {
    try {
      // Test querying counters to see if tables exist
      const { data: counterData, error: counterError } = await this.client
        .from('afi_counters')
        .select('*');

      if (counterError) {
        // If error indicates relation does not exist, trigger the wizard!
        if (counterError.code === '42P01') {
          this.setDbStatus('offline', 'Tabel Belum Dibuat');
          this.showSetupWizard();
          return;
        }
        throw counterError;
      }

      this.isOnline = true;
      this.setDbStatus('syncing', 'Menyinkronkan...');

      // Check if database is empty (no bookings)
      const { data: testBookings, error: testError } = await this.client
        .from('afi_bookings')
        .select('id')
        .limit(1);

      if (testError) throw testError;

      // If Supabase is empty and hasn't been seeded yet, seed it!
      const hasBeenSeeded = localStorage.getItem('afi_seeded') === 'true';
      if (!hasBeenSeeded && (!testBookings || testBookings.length === 0)) {
        await this.seedSupabaseFromLocal();
      } else {
        // Otherwise, download data from Supabase and overwrite local cache!
        await this.downloadSupabaseData();
      }

      this.setDbStatus('connected', 'Terhubung ke Supabase');
      
      // Setup Realtime subscriptions
      this.setupRealtime();
      
      // Force refresh active page to display downloaded data!
      if (typeof App !== 'undefined' && App.currentPage) {
        App.navigateTo(App.currentPage);
      }
    } catch (err) {
      console.error('Failed to sync with Supabase:', err);
      this.isOnline = false;
      this.setDbStatus('offline', 'Koneksi Gagal');
      
      // Toast error alert
      if (typeof Components !== 'undefined') {
        Components.toast('danger', 'Gagal Sinkronisasi Cloud', err.message || 'Koneksi atau skema database bermasalah');
      }
      
      // Seed local storage if empty as fallback
      const hasBeenSeeded = localStorage.getItem('afi_seeded') === 'true';
      if (!hasBeenSeeded && !this.getAll(this.KEYS.BOOKINGS).length) {
        this.seedData();
      }
    }
  },

  setupRealtime() {
    if (!this.isOnline || !this.client) return;

    if (this.realtimeChannel) {
      this.client.removeChannel(this.realtimeChannel);
    }

    this.realtimeChannel = this.client
      .channel('afi_realtime_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        async (payload) => {
          console.log('Perubahan real-time terdeteksi:', payload);
          this.setDbStatus('syncing', 'Menyinkronkan...');
          try {
            await this.downloadSupabaseData();
            this.setDbStatus('connected', 'Terhubung ke Supabase');
            
            // Re-render active page smoothly
            if (typeof App !== 'undefined' && App.currentPage) {
              App.navigateTo(App.currentPage);
            }
            Components.toast('info', 'Data Terbarui', 'Pembaruan data otomatis dari cloud berhasil diterapkan');
          } catch (err) {
            console.error('Gagal mengunduh perubahan real-time:', err);
          }
        }
      )
      .subscribe();
  },

  async seedSupabaseFromLocal() {
    this.setDbStatus('syncing', 'Menginisialisasi basis data cloud...');
    
    // Seed initial local storage first if it is empty, so we have data to push
    const hasBeenSeeded = localStorage.getItem('afi_seeded') === 'true';
    if (!hasBeenSeeded && !this.getAll(this.KEYS.BOOKINGS).length) {
      this.seedData();
    }

    const bookings = this.getAll(this.KEYS.BOOKINGS);
    const stokItems = this.getAll(this.KEYS.STOK_ITEMS);
    const stokPaket = this.getAll(this.KEYS.STOK_PAKET);
    const kas = this.getAll(this.KEYS.KAS);
    const logs = this.getAll(this.KEYS.LOG);
    const counters = JSON.parse(localStorage.getItem(this.KEYS.COUNTER)) || { booking: 4, stok: 10, kas: 8, log: 8, paket: 3 };

    // Format fields for relational postgres columns
    const mappedStokItems = stokItems.map(item => ({
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      total_stok: item.totalStok,
      stok_tersedia: item.stokTersedia,
      harga_sewa: item.hargaSewa,
      kondisi: item.kondisi,
      created_at: item.createdAt || new Date().toISOString()
    }));

    const mappedStokPaket = stokPaket.map(paket => ({
      id: paket.id,
      nama: paket.nama,
      harga_base: paket.hargaBase,
      komponen: paket.komponen,
      created_at: paket.createdAt || new Date().toISOString()
    }));

    const mappedBookings = bookings.map(b => ({
      id: b.id,
      nama_klien: b.namaKlien,
      kontak: b.kontak,
      tanggal_acara: b.tanggalAcara,
      venue: b.venue,
      jenis_sewa: b.jenisSewa,
      paket_id: b.paketId,
      paket_nama: b.paketNama,
      items: b.items,
      total_biaya: b.totalBiaya,
      dp: b.dp,
      sisa_bayar: b.sisaBayar,
      status: b.status,
      created_at: b.createdAt || new Date().toISOString()
    }));

    const mappedKas = kas.map(k => ({
      id: k.id,
      tipe: k.tipe,
      nominal: k.nominal,
      kategori: k.kategori,
      keterangan: k.keterangan,
      nota: k.nota,
      created_at: k.createdAt || new Date().toISOString()
    }));

    const mappedLogs = logs.map(l => ({
      id: l.id,
      type: l.type,
      action: l.action,
      detail: l.detail,
      timestamp: l.timestamp || new Date().toISOString()
    }));

    const mappedCounters = Object.keys(counters).map(key => ({
      type: key,
      val: counters[key]
    }));

    // Sequential inserts to prevent race condition / foreign key violations
    const tables = [
      { name: 'afi_stok_items', data: mappedStokItems },
      { name: 'afi_stok_paket', data: mappedStokPaket },
      { name: 'afi_bookings', data: mappedBookings },
      { name: 'afi_kas', data: mappedKas },
      { name: 'afi_log', data: mappedLogs },
      { name: 'afi_counters', data: mappedCounters }
    ];

    for (const table of tables) {
      const { error } = await this.client.from(table.name).upsert(table.data);
      if (error) {
        throw new Error(`Gagal menulis tabel ${table.name}: ${error.message} (${error.details || ''})`);
      }
    }
  },

  async downloadSupabaseData() {
    this.setDbStatus('syncing', 'Mengunduh data...');

    const [
      { data: bookings },
      { data: stokItems },
      { data: stokPaket },
      { data: kas },
      { data: logs },
      { data: counters }
    ] = await Promise.all([
      this.client.from('afi_bookings').select('*').order('created_at', { ascending: false }),
      this.client.from('afi_stok_items').select('*').order('created_at', { ascending: false }),
      this.client.from('afi_stok_paket').select('*').order('created_at', { ascending: false }),
      this.client.from('afi_kas').select('*').order('created_at', { ascending: false }),
      this.client.from('afi_log').select('*').order('timestamp', { ascending: false }),
      this.client.from('afi_counters').select('*')
    ]);

    // Map fields back from postgres snake_case to JS camelCase
    const mappedBookings = (bookings || []).map(b => ({
      id: b.id,
      namaKlien: b.nama_klien,
      kontak: b.kontak,
      tanggalAcara: b.tanggal_acara,
      venue: b.venue,
      jenisSewa: b.jenis_sewa,
      paketId: b.paket_id,
      paketNama: b.paket_nama,
      items: b.items,
      totalBiaya: Math.round(Number(b.total_biaya || 0)),
      dp: Math.round(Number(b.dp || 0)),
      sisaBayar: Math.round(Number(b.sisa_bayar || 0)),
      status: b.status,
      createdAt: b.created_at
    }));

    const mappedStokItems = (stokItems || []).map(item => ({
      id: item.id,
      nama: item.nama,
      kategori: item.kategori,
      totalStok: item.total_stok,
      stokTersedia: item.stok_tersedia,
      hargaSewa: Math.round(Number(item.harga_sewa || 0)),
      kondisi: item.kondisi,
      createdAt: item.created_at
    }));

    const mappedStokPaket = (stokPaket || []).map(paket => ({
      id: paket.id,
      nama: paket.nama,
      hargaBase: Math.round(Number(paket.harga_base || 0)),
      komponen: paket.komponen,
      createdAt: paket.created_at
    }));

    const mappedKas = (kas || []).map(k => ({
      id: k.id,
      tipe: k.tipe,
      nominal: Math.round(Number(k.nominal || 0)),
      kategori: k.kategori,
      keterangan: k.keterangan,
      nota: k.nota,
      createdAt: k.created_at
    }));

    const mappedLogs = (logs || []).map(l => ({
      id: l.id,
      type: l.type,
      action: l.action,
      detail: l.detail,
      timestamp: l.timestamp
    }));

    const localCounters = {};
    (counters || []).forEach(c => {
      localCounters[c.type] = c.val;
    });

    // Save to local storage
    this.save(this.KEYS.BOOKINGS, mappedBookings);
    this.save(this.KEYS.STOK_ITEMS, mappedStokItems);
    this.save(this.KEYS.STOK_PAKET, mappedStokPaket);
    this.save(this.KEYS.KAS, mappedKas);
    this.save(this.KEYS.LOG, mappedLogs);
    if (Object.keys(localCounters).length > 0) {
      localStorage.setItem(this.KEYS.COUNTER, JSON.stringify(localCounters));
    }
    
    // Tandai bahwa data sudah disinkronisasi/diinisialisasi agar dummy tidak muncul lagi
    localStorage.setItem('afi_seeded', 'true');
  },

  async queueWrite(table, data, isInsert = true) {
    if (!this.isOnline || !this.client) return;

    this.setDbStatus('syncing', 'Menyinkronkan...');
    try {
      let error;
      if (isInsert) {
        ({ error } = await this.client.from(table).insert(data));
      } else {
        ({ error } = await this.client.from(table).update(data).eq('id', data.id));
      }

      if (error) throw error;
      
      // Update counters in Supabase as well
      const counters = JSON.parse(localStorage.getItem(this.KEYS.COUNTER));
      const mappedCounters = Object.keys(counters).map(key => ({
        type: key,
        val: counters[key]
      }));
      await this.client.from('afi_counters').upsert(mappedCounters);

      this.setDbStatus('connected', 'Terhubung ke Supabase');
    } catch (err) {
      console.warn(`Supabase write to ${table} failed, will try next reload:`, err);
      this.setDbStatus('offline', 'Koneksi Terputus');
      this.isOnline = false;
    }
  },

  showSetupWizard() {
    const sqlScript = `-- 1. Tabel Item Stok
CREATE TABLE IF NOT EXISTS afi_stok_items (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    kategori TEXT NOT NULL,
    total_stok INTEGER NOT NULL,
    stok_tersedia INTEGER NOT NULL,
    harga_sewa NUMERIC NOT NULL,
    kondisi TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabel Paket Stok
CREATE TABLE IF NOT EXISTS afi_stok_paket (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    harga_base NUMERIC NOT NULL,
    komponen JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabel Booking
CREATE TABLE IF NOT EXISTS afi_bookings (
    id TEXT PRIMARY KEY,
    nama_klien TEXT NOT NULL,
    kontak TEXT NOT NULL,
    tanggal_acara DATE NOT NULL,
    venue TEXT NOT NULL,
    jenis_sewa TEXT NOT NULL,
    paket_id TEXT REFERENCES afi_stok_paket(id) ON DELETE SET NULL,
    paket_nama TEXT,
    items JSONB NOT NULL,
    total_biaya NUMERIC NOT NULL,
    dp NUMERIC NOT NULL,
    sisa_bayar NUMERIC NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabel Kas
CREATE TABLE IF NOT EXISTS afi_kas (
    id TEXT PRIMARY KEY,
    tipe TEXT NOT NULL,
    nominal NUMERIC NOT NULL,
    kategori TEXT NOT NULL,
    keterangan TEXT NOT NULL,
    nota TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabel Log
CREATE TABLE IF NOT EXISTS afi_log (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabel Sequence/Counter
CREATE TABLE IF NOT EXISTS afi_counters (
    type TEXT PRIMARY KEY,
    val INTEGER NOT NULL
);

-- Seed counter awal
INSERT INTO afi_counters (type, val) VALUES 
('booking', 4),
('stok', 10),
('kas', 8),
('log', 8),
('paket', 3)
ON CONFLICT (type) DO NOTHING;

-- Matikan Row Level Security (RLS) agar API Publik anon bisa menulis langsung tanpa login
ALTER TABLE afi_stok_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE afi_stok_paket DISABLE ROW LEVEL SECURITY;
ALTER TABLE afi_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE afi_kas DISABLE ROW LEVEL SECURITY;
ALTER TABLE afi_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE afi_counters DISABLE ROW LEVEL SECURITY;

-- Tambahkan Kebijakan Akses Publik Bebas (jika RLS tidak sengaja aktif kembali di Supabase UI)
DROP POLICY IF EXISTS "Public access stok items" ON afi_stok_items;
CREATE POLICY "Public access stok items" ON afi_stok_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access stok paket" ON afi_stok_paket;
CREATE POLICY "Public access stok paket" ON afi_stok_paket FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access bookings" ON afi_bookings;
CREATE POLICY "Public access bookings" ON afi_bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access kas" ON afi_kas;
CREATE POLICY "Public access kas" ON afi_kas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access log" ON afi_log;
CREATE POLICY "Public access log" ON afi_log FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access counters" ON afi_counters;
CREATE POLICY "Public access counters" ON afi_counters FOR ALL USING (true) WITH CHECK (true);`;

    Components.openModal({
      title: 'Inisialisasi Database Supabase',
      size: 'lg',
      content: `
        <div style="display: flex; flex-direction: column; gap: var(--space-4); max-height: 70vh; overflow-y: auto;">
          <p style="color: var(--text-secondary); line-height: 1.6;">
            Koneksi ke Supabase berhasil! Namun, tabel-tabel database belum dibuat di proyek Supabase Anda. Ikuti langkah mudah ini untuk menyiapkannya:
          </p>
          <ol style="margin-left: var(--space-5); color: var(--text-secondary); line-height: 1.8; display: flex; flex-direction: column; gap: var(--space-2);">
            <li>Klik tombol <strong>"Salin SQL Script"</strong> di bawah ini.</li>
            <li>Buka <a href="https://supabase.com/dashboard/project/zsemhbdlukxetlyjhgol" target="_blank" style="color: var(--green-400); text-decoration: underline; font-weight: 500;">Supabase Dashboard SQL Editor</a>.</li>
            <li>Klik <strong>"New query"</strong>, tempel (paste) script SQL, lalu klik tombol <strong>"Run"</strong>.</li>
            <li>Setelah selesai dijalankan, kembali ke sini dan klik tombol <strong>"Selesai & Cek Database"</strong>.</li>
          </ol>
          <div style="margin-top: var(--space-2);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: var(--text-xs); color: var(--text-muted); font-family: var(--font-mono);">setup_afi_decoration.sql</span>
              <button class="btn btn-sm btn-outline" id="btn-copy-sql" style="padding: 2px 8px; font-size: 11px;">Salin SQL Script</button>
            </div>
            <pre style="background: var(--dark-input); border: 1px solid var(--dark-border-subtle); padding: var(--space-4); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); overflow-x: auto; max-height: 180px;"><code>${sqlScript}</code></pre>
          </div>
        </div>
      `,
      footer: `
        <button class="btn btn-secondary" onclick="Components.closeModal()">Tutup</button>
        <button class="btn btn-primary" id="btn-verify-db">Selesai & Cek Database</button>
      `,
    });

    document.getElementById('btn-copy-sql')?.addEventListener('click', () => {
      navigator.clipboard.writeText(sqlScript);
      Components.toast('success', 'Disalin!', 'SQL script berhasil disalin ke clipboard');
      const btn = document.getElementById('btn-copy-sql');
      if (btn) btn.textContent = 'Tersalin! ✓';
    });

    document.getElementById('btn-verify-db')?.addEventListener('click', async () => {
      const verifyBtn = document.getElementById('btn-verify-db');
      if (verifyBtn) {
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Memverifikasi...';
      }
      
      try {
        const { data, error } = await this.client.from('afi_counters').select('*').limit(1);
        if (error) throw error;

        Components.closeModal();
        Components.toast('success', 'Verifikasi Sukses!', 'Tabel database berhasil ditemukan. Melakukan sinkronisasi data...');
        this.syncWithSupabase();
      } catch (err) {
        console.warn('Verifikasi gagal, tabel mungkin belum dibuat:', err);
        Components.toast('danger', 'Verifikasi Gagal', 'Tabel afi_counters belum terdeteksi. Pastikan Anda telah mengklik "Run" di SQL Editor.');
        if (verifyBtn) {
          verifyBtn.disabled = false;
          verifyBtn.textContent = 'Selesai & Cek Database';
        }
      }
    });
  },

  // ── Generic CRUD ──
  getAll(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  },

  save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },

  getById(key, id) {
    return this.getAll(key).find(item => item.id === id);
  },

  add(key, item) {
    const data = this.getAll(key);
    data.unshift(item);
    this.save(key, data);
    return item;
  },

  update(key, id, updates) {
    const data = this.getAll(key);
    const idx = data.findIndex(item => item.id === id);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...updates };
      this.save(key, data);
      return data[idx];
    }
    return null;
  },

  remove(key, id) {
    const data = this.getAll(key).filter(item => item.id !== id);
    this.save(key, data);
  },

  // ── Counter ──
  nextId(type) {
    const counters = JSON.parse(localStorage.getItem(this.KEYS.COUNTER));
    counters[type] = (counters[type] || 0) + 1;
    localStorage.setItem(this.KEYS.COUNTER, JSON.stringify(counters));
    return counters[type];
  },

  // ── Booking Operations ──
  getAllBookings() { return this.getAll(this.KEYS.BOOKINGS); },

  addBooking(booking) {
    const id = this.nextId('booking');
    const now = new Date().toISOString();
    const newBooking = {
      id: `BK-${String(id).padStart(4, '0')}`,
      ...booking,
      createdAt: now,
      status: 'pending',
    };
    this.add(this.KEYS.BOOKINGS, newBooking);

    // Sync in background
    this.queueWrite('afi_bookings', {
      id: newBooking.id,
      nama_klien: newBooking.namaKlien,
      kontak: newBooking.kontak,
      tanggal_acara: newBooking.tanggalAcara,
      venue: newBooking.venue,
      jenis_sewa: newBooking.jenisSewa,
      paket_id: newBooking.paketId,
      paket_nama: newBooking.paketNama,
      items: newBooking.items,
      total_biaya: newBooking.totalBiaya,
      dp: newBooking.dp,
      sisa_bayar: newBooking.sisaBayar,
      status: newBooking.status,
      created_at: newBooking.createdAt
    });

    this.addLog({
      type: 'booking',
      action: 'Booking Baru',
      detail: `Booking ${newBooking.id} - ${booking.namaKlien} pada ${booking.tanggalAcara}`,
    });
    return newBooking;
  },

  updateBooking(id, updates) {
    const result = this.update(this.KEYS.BOOKINGS, id, updates);
    if (result) {
      // Sync in background
      const mappedUpdates = { id };
      if ('namaKlien' in updates) mappedUpdates.nama_klien = updates.namaKlien;
      if ('kontak' in updates) mappedUpdates.kontak = updates.kontak;
      if ('tanggalAcara' in updates) mappedUpdates.tanggal_acara = updates.tanggalAcara;
      if ('venue' in updates) mappedUpdates.venue = updates.venue;
      if ('status' in updates) mappedUpdates.status = updates.status;
      if ('dp' in updates) mappedUpdates.dp = updates.dp;
      if ('sisaBayar' in updates) mappedUpdates.sisa_bayar = updates.sisaBayar;

      this.queueWrite('afi_bookings', mappedUpdates, false);

      this.addLog({
        type: 'booking',
        action: 'Update Booking',
        detail: `Booking ${id} diupdate`,
      });
    }
    return result;
  },

  // ── Stok Operations ──
  getAllStok() { return this.getAll(this.KEYS.STOK_ITEMS); },
  getAllPaket() { return this.getAll(this.KEYS.STOK_PAKET); },

  addStokItem(item) {
    const id = this.nextId('stok');
    const newItem = {
      id: `STK-${String(id).padStart(4, '0')}`,
      ...item,
      kondisi: 'baik',
      createdAt: new Date().toISOString(),
    };
    this.add(this.KEYS.STOK_ITEMS, newItem);

    // Sync in background
    this.queueWrite('afi_stok_items', {
      id: newItem.id,
      nama: newItem.nama,
      kategori: newItem.kategori,
      total_stok: newItem.totalStok,
      stok_tersedia: newItem.stokTersedia,
      harga_sewa: newItem.hargaSewa,
      kondisi: newItem.kondisi,
      created_at: newItem.createdAt
    });

    this.addLog({
      type: 'stok',
      action: 'Tambah Stok',
      detail: `Item baru: ${item.nama} (${item.totalStok} unit)`,
    });
    return newItem;
  },

  addPaket(paket) {
    const id = this.nextId('paket');
    const newPaket = {
      id: `PKT-${String(id).padStart(4, '0')}`,
      ...paket,
      createdAt: new Date().toISOString(),
    };
    this.add(this.KEYS.STOK_PAKET, newPaket);

    // Sync in background
    this.queueWrite('afi_stok_paket', {
      id: newPaket.id,
      nama: newPaket.nama,
      harga_base: newPaket.hargaBase,
      komponen: newPaket.komponen,
      created_at: newPaket.createdAt
    });

    this.addLog({
      type: 'stok',
      action: 'Tambah Paket',
      detail: `Paket baru: ${paket.nama} — ${paket.komponen.length} item`,
    });
    return newPaket;
  },

  updateStokKondisi(id, kondisi) {
    const result = this.update(this.KEYS.STOK_ITEMS, id, { kondisi });
    if (result) {
      // Sync in background
      this.queueWrite('afi_stok_items', {
        id: result.id,
        kondisi: result.kondisi
      }, false);

      this.addLog({
        type: 'stok',
        action: 'Update Kondisi',
        detail: `${result.nama} diubah ke status "${kondisi}"`,
      });
    }
    return result;
  },

  // ── Kas Operations ──
  getAllKas() { return this.getAll(this.KEYS.KAS); },

  addKas(transaksi) {
    const id = this.nextId('kas');
    const newTrans = {
      id: `KAS-${String(id).padStart(4, '0')}`,
      ...transaksi,
      createdAt: new Date().toISOString(),
    };
    this.add(this.KEYS.KAS, newTrans);

    // Sync in background
    this.queueWrite('afi_kas', {
      id: newTrans.id,
      tipe: newTrans.tipe,
      nominal: newTrans.nominal,
      kategori: newTrans.kategori,
      keterangan: newTrans.keterangan,
      nota: newTrans.nota,
      created_at: newTrans.createdAt
    });

    const prefix = transaksi.tipe === 'inflow' ? '+' : '-';
    this.addLog({
      type: 'kas',
      action: transaksi.tipe === 'inflow' ? 'Pemasukan' : 'Pengeluaran',
      detail: `${prefix} ${formatCurrency(transaksi.nominal)} — ${transaksi.kategori}: ${transaksi.keterangan}`,
    });
    return newTrans;
  },

  // ── Log Operations ──
  getAllLog() { return this.getAll(this.KEYS.LOG); },

  addLog(entry) {
    const id = this.nextId('log');
    const newEntry = {
      id: `LOG-${String(id).padStart(5, '0')}`,
      ...entry,
      timestamp: new Date().toISOString(),
    };
    this.add(this.KEYS.LOG, newEntry);

    // Sync in background
    this.queueWrite('afi_log', {
      id: newEntry.id,
      type: newEntry.type,
      action: newEntry.action,
      detail: newEntry.detail,
      timestamp: newEntry.timestamp
    });

    return newEntry;
  },

  // ── Computed ──
  getFinancialSummary() {
    const kas = this.getAllKas();
    const bookings = this.getAllBookings();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const isThisMonth = (dateStr) => {
      const d = new Date(dateStr);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };
    
    const isLastMonth = (dateStr) => {
      const d = new Date(dateStr);
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      if (prevMonth < 0) {
        prevMonth = 11;
        prevYear -= 1;
      }
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    };

    const totalInflow = kas
      .filter(k => k.tipe === 'inflow')
      .reduce((sum, k) => sum + k.nominal, 0);

    const inflowThisMonth = kas.filter(k => k.tipe === 'inflow' && isThisMonth(k.createdAt)).reduce((s, k) => s + k.nominal, 0);
    const inflowLastMonth = kas.filter(k => k.tipe === 'inflow' && isLastMonth(k.createdAt)).reduce((s, k) => s + k.nominal, 0);
    const omsetTrend = inflowLastMonth === 0 ? (inflowThisMonth > 0 ? 100 : 0) : Math.round(((inflowThisMonth - inflowLastMonth) / inflowLastMonth) * 100);

    const totalOutflow = kas
      .filter(k => k.tipe === 'outflow')
      .reduce((sum, k) => sum + k.nominal, 0);

    // Kategori Biaya Langsung (HPP): pembelian barang/transport terkait event
    const biayaLangsung = kas
      .filter(k => k.tipe === 'outflow' && ['pembelian', 'transport'].includes(k.kategori))
      .reduce((sum, k) => sum + k.nominal, 0);

    // Kategori Biaya Operasional: gaji bulanan, operasional, lainnya
    const biayaOperasional = kas
      .filter(k => k.tipe === 'outflow' && ['gaji', 'operasional', 'lainnya'].includes(k.kategori))
      .reduce((sum, k) => sum + k.nominal, 0);

    const totalPiutang = bookings
      .filter(b => b.status !== 'lunas' && b.status !== 'batal')
      .reduce((sum, b) => sum + ((b.totalBiaya || 0) - (b.dp || 0)), 0);

    const piutangThisMonth = bookings.filter(b => b.status !== 'lunas' && b.status !== 'batal' && isThisMonth(b.createdAt)).reduce((sum, b) => sum + ((b.totalBiaya || 0) - (b.dp || 0)), 0);
    const piutangLastMonth = bookings.filter(b => b.status !== 'lunas' && b.status !== 'batal' && isLastMonth(b.createdAt)).reduce((sum, b) => sum + ((b.totalBiaya || 0) - (b.dp || 0)), 0);
    const piutangTrend = piutangLastMonth === 0 ? (piutangThisMonth > 0 ? 100 : 0) : Math.round(((piutangThisMonth - piutangLastMonth) / piutangLastMonth) * 100);

    const labaKotor = totalInflow - biayaLangsung;
    const labaBersih = labaKotor - biayaOperasional; 

    return {
      omset: totalInflow,
      piutang: totalPiutang,
      sisaKas: totalInflow - totalOutflow,
      totalInflow,
      totalOutflow,
      biayaLangsung,
      biayaOperasional,
      labaKotor,
      labaBersih,
      omsetTrend,
      piutangTrend
    };
  },

  getUpcomingAgenda() {
    const now = new Date();
    return this.getAllBookings()
      .filter(b => {
        const d = new Date(b.tanggalAcara);
        return d >= now && b.status !== 'batal';
      })
      .sort((a, b) => new Date(a.tanggalAcara) - new Date(b.tanggalAcara))
      .slice(0, 5);
  },

  getStokStats() {
    const items = this.getAllStok();
    const paket = this.getAllPaket();
    return {
      total: items.length,
      baik: items.filter(i => i.kondisi === 'baik').length,
      rusak: items.filter(i => i.kondisi === 'rusak' || i.kondisi === 'perbaikan').length,
      paket: paket.length,
    };
  },

  // ── Seed Data ──
  seedData() {
    if (localStorage.getItem('afi_seeded') === 'true') return;
    
    // Sample stok items
    const stokItems = [
      { id: 'STK-0001', nama: 'Tenda Dekorasi 4x6', kategori: 'Tenda', totalStok: 8, stokTersedia: 5, hargaSewa: 2500000, kondisi: 'baik', createdAt: '2026-05-01T08:00:00Z' },
      { id: 'STK-0002', nama: 'Meja Akad Ukir Jati', kategori: 'Meja', totalStok: 4, stokTersedia: 3, hargaSewa: 1500000, kondisi: 'baik', createdAt: '2026-05-01T08:00:00Z' },
      { id: 'STK-0003', nama: 'Kursi Tiffany Gold', kategori: 'Kursi', totalStok: 200, stokTersedia: 140, hargaSewa: 35000, kondisi: 'baik', createdAt: '2026-05-01T08:00:00Z' },
      { id: 'STK-0004', nama: 'Backdrop Bunga Premium', kategori: 'Backdrop', totalStok: 6, stokTersedia: 4, hargaSewa: 3500000, kondisi: 'baik', createdAt: '2026-05-01T08:00:00Z' },
      { id: 'STK-0005', nama: 'Standing Flower', kategori: 'Dekorasi', totalStok: 20, stokTersedia: 14, hargaSewa: 250000, kondisi: 'baik', createdAt: '2026-05-01T08:00:00Z' },
      { id: 'STK-0006', nama: 'Karpet Merah 1x10m', kategori: 'Karpet', totalStok: 10, stokTersedia: 7, hargaSewa: 500000, kondisi: 'baik', createdAt: '2026-05-02T08:00:00Z' },
      { id: 'STK-0007', nama: 'Lampu Hias Crystal', kategori: 'Lampu', totalStok: 12, stokTersedia: 8, hargaSewa: 750000, kondisi: 'baik', createdAt: '2026-05-02T08:00:00Z' },
      { id: 'STK-0008', nama: 'Rangkaian Bunga Meja', kategori: 'Bunga', totalStok: 30, stokTersedia: 22, hargaSewa: 150000, kondisi: 'baik', createdAt: '2026-05-02T08:00:00Z' },
      { id: 'STK-0009', nama: 'Pelaminan Set Mewah', kategori: 'Pelaminan', totalStok: 3, stokTersedia: 2, hargaSewa: 8000000, kondisi: 'baik', createdAt: '2026-05-02T08:00:00Z' },
      { id: 'STK-0010', nama: 'Gate Entrance Bunga', kategori: 'Dekorasi', totalStok: 4, stokTersedia: 3, hargaSewa: 2000000, kondisi: 'perbaikan', createdAt: '2026-05-03T08:00:00Z' },
    ];
    this.save(this.KEYS.STOK_ITEMS, stokItems);

    // Sample paket
    const paketList = [
      {
        id: 'PKT-0001', nama: 'Paket Intimate Garden', hargaBase: 25000000,
        komponen: [
          { itemId: 'STK-0001', nama: 'Tenda Dekorasi 4x6', qty: 1 },
          { itemId: 'STK-0002', nama: 'Meja Akad Ukir Jati', qty: 1 },
          { itemId: 'STK-0003', nama: 'Kursi Tiffany Gold', qty: 50 },
          { itemId: 'STK-0004', nama: 'Backdrop Bunga Premium', qty: 1 },
          { itemId: 'STK-0005', nama: 'Standing Flower', qty: 6 },
        ],
        createdAt: '2026-05-03T10:00:00Z',
      },
      {
        id: 'PKT-0002', nama: 'Paket Grand Ballroom', hargaBase: 55000000,
        komponen: [
          { itemId: 'STK-0001', nama: 'Tenda Dekorasi 4x6', qty: 3 },
          { itemId: 'STK-0002', nama: 'Meja Akad Ukir Jati', qty: 2 },
          { itemId: 'STK-0003', nama: 'Kursi Tiffany Gold', qty: 150 },
          { itemId: 'STK-0004', nama: 'Backdrop Bunga Premium', qty: 2 },
          { itemId: 'STK-0005', nama: 'Standing Flower', qty: 12 },
          { itemId: 'STK-0006', nama: 'Karpet Merah 1x10m', qty: 3 },
          { itemId: 'STK-0007', nama: 'Lampu Hias Crystal', qty: 6 },
          { itemId: 'STK-0009', nama: 'Pelaminan Set Mewah', qty: 1 },
        ],
        createdAt: '2026-05-04T10:00:00Z',
      },
      {
        id: 'PKT-0003', nama: 'Paket Rustic Chic', hargaBase: 35000000,
        komponen: [
          { itemId: 'STK-0001', nama: 'Tenda Dekorasi 4x6', qty: 2 },
          { itemId: 'STK-0002', nama: 'Meja Akad Ukir Jati', qty: 1 },
          { itemId: 'STK-0003', nama: 'Kursi Tiffany Gold', qty: 80 },
          { itemId: 'STK-0004', nama: 'Backdrop Bunga Premium', qty: 1 },
          { itemId: 'STK-0008', nama: 'Rangkaian Bunga Meja', qty: 10 },
          { itemId: 'STK-0010', nama: 'Gate Entrance Bunga', qty: 1 },
        ],
        createdAt: '2026-05-05T10:00:00Z',
      },
    ];
    this.save(this.KEYS.STOK_PAKET, paketList);

    // Sample bookings
    const bookings = [
      {
        id: 'BK-0001', namaKlien: 'Anisa & Budi', kontak: '0812-3456-7890',
        tanggalAcara: '2026-06-15', venue: 'Hotel Grand Mercure Bandung',
        jenisSewa: 'paket', paketId: 'PKT-0002', paketNama: 'Paket Grand Ballroom',
        items: [], totalBiaya: 55000000, dp: 27500000, sisaBayar: 27500000,
        status: 'confirmed', createdAt: '2026-05-10T09:00:00Z',
      },
      {
        id: 'BK-0002', namaKlien: 'Citra & Dimas', kontak: '0856-1234-5678',
        tanggalAcara: '2026-06-22', venue: 'The Springs Club Summarecon',
        jenisSewa: 'paket', paketId: 'PKT-0001', paketNama: 'Paket Intimate Garden',
        items: [], totalBiaya: 25000000, dp: 12500000, sisaBayar: 12500000,
        status: 'confirmed', createdAt: '2026-05-12T14:00:00Z',
      },
      {
        id: 'BK-0003', namaKlien: 'Eka & Fajar', kontak: '0878-9012-3456',
        tanggalAcara: '2026-07-05', venue: 'Gedung Savoy Homann',
        jenisSewa: 'mix', paketId: null, paketNama: null,
        items: [
          { itemId: 'STK-0004', nama: 'Backdrop Bunga Premium', qty: 2, harga: 3500000 },
          { itemId: 'STK-0003', nama: 'Kursi Tiffany Gold', qty: 100, harga: 35000 },
          { itemId: 'STK-0005', nama: 'Standing Flower', qty: 8, harga: 250000 },
          { itemId: 'STK-0007', nama: 'Lampu Hias Crystal', qty: 4, harga: 750000 },
        ],
        totalBiaya: 13500000, dp: 5000000, sisaBayar: 8500000,
        status: 'pending', createdAt: '2026-05-20T11:00:00Z',
      },
      {
        id: 'BK-0004', namaKlien: 'Gita & Hendra', kontak: '0813-5678-9012',
        tanggalAcara: '2026-07-19', venue: 'Padma Hotel Bandung',
        jenisSewa: 'paket', paketId: 'PKT-0003', paketNama: 'Paket Rustic Chic',
        items: [], totalBiaya: 35000000, dp: 15000000, sisaBayar: 20000000,
        status: 'pending', createdAt: '2026-05-25T10:00:00Z',
      },
    ];
    this.save(this.KEYS.BOOKINGS, bookings);

    // Sample kas
    const kasData = [
      { id: 'KAS-0001', tipe: 'inflow', nominal: 27500000, kategori: 'dp', keterangan: 'DP Booking BK-0001 - Anisa & Budi', nota: 'INV-001', createdAt: '2026-05-10T09:30:00Z' },
      { id: 'KAS-0002', tipe: 'inflow', nominal: 12500000, kategori: 'dp', keterangan: 'DP Booking BK-0002 - Citra & Dimas', nota: 'INV-002', createdAt: '2026-05-12T14:30:00Z' },
      { id: 'KAS-0003', tipe: 'outflow', nominal: 3500000, kategori: 'operasional', keterangan: 'Pembelian bunga segar untuk stok', nota: 'NTA-001', createdAt: '2026-05-14T10:00:00Z' },
      { id: 'KAS-0004', tipe: 'outflow', nominal: 5000000, kategori: 'gaji', keterangan: 'Gaji tim dekor bulan Mei', nota: 'NTA-002', createdAt: '2026-05-15T08:00:00Z' },
      { id: 'KAS-0005', tipe: 'inflow', nominal: 5000000, kategori: 'dp', keterangan: 'DP Booking BK-0003 - Eka & Fajar', nota: 'INV-003', createdAt: '2026-05-20T11:30:00Z' },
      { id: 'KAS-0006', tipe: 'outflow', nominal: 2000000, kategori: 'transport', keterangan: 'Biaya transportasi survei venue', nota: 'NTA-003', createdAt: '2026-05-22T09:00:00Z' },
      { id: 'KAS-0007', tipe: 'inflow', nominal: 15000000, kategori: 'dp', keterangan: 'DP Booking BK-0004 - Gita & Hendra', nota: 'INV-004', createdAt: '2026-05-25T10:30:00Z' },
      { id: 'KAS-0008', tipe: 'outflow', nominal: 1500000, kategori: 'pembelian', keterangan: 'Pembelian kain backdrop baru', nota: 'NTA-004', createdAt: '2026-05-27T14:00:00Z' },
    ];
    this.save(this.KEYS.KAS, kasData);

    // Sample activity log
    const logData = [
      { id: 'LOG-00001', type: 'booking', action: 'Booking Baru', detail: 'Booking BK-0004 — Gita & Hendra pada 19 Jul 2026', timestamp: '2026-05-25T10:00:00Z' },
      { id: 'LOG-00002', type: 'kas', action: 'Pemasukan', detail: '+ Rp 15.000.000 — DP: DP Booking BK-0004', timestamp: '2026-05-25T10:30:00Z' },
      { id: 'LOG-00003', type: 'stok', action: 'Update Kondisi', detail: 'Gate Entrance Bunga diubah ke status "perbaikan"', timestamp: '2026-05-26T08:00:00Z' },
      { id: 'LOG-00004', type: 'kas', action: 'Pengeluaran', detail: '- Rp 1.500.000 — Pembelian: Pembelian kain backdrop baru', timestamp: '2026-05-27T14:00:00Z' },
      { id: 'LOG-00005', type: 'booking', action: 'Update Booking', detail: 'Booking BK-0001 status diubah ke "confirmed"', timestamp: '2026-05-28T09:00:00Z' },
      { id: 'LOG-00006', type: 'invoice', action: 'Cetak Invoice', detail: 'Invoice INV-0004 untuk BK-0004 — Gita & Hendra', timestamp: '2026-05-28T09:30:00Z' },
      { id: 'LOG-00007', type: 'stok', action: 'Tambah Stok', detail: 'Item baru: Rangkaian Bunga Meja (30 unit)', timestamp: '2026-05-28T11:00:00Z' },
      { id: 'LOG-00008', type: 'booking', action: 'Booking Baru', detail: 'Booking BK-0003 — Eka & Fajar pada 5 Jul 2026', timestamp: '2026-05-29T08:00:00Z' },
    ];
    this.save(this.KEYS.LOG, logData);

    // Update counters
    localStorage.setItem(this.KEYS.COUNTER, JSON.stringify({
      booking: 4, stok: 10, kas: 8, log: 8, paket: 3
    }));

    // Mark as seeded!
    localStorage.setItem('afi_seeded', 'true');
  },
};

// ── Utility Functions ──
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return formatDateShort(dateStr);
}

function daysUntil(dateStr) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - now) / 86400000);
}

function generateInvoiceId() {
  const count = DataStore.nextId('invoice') || 1;
  return `INV-${String(count).padStart(4, '0')}`;
}
