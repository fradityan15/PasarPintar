<script setup lang="ts">
import { computed, ref } from 'vue'

export interface EcosystemStore {
  id: string
  name: string
  commodityFocus: string
  regency: string
  province: string
  nib: string
  pirt: string
  pirtWarning?: boolean
  coopStatus: string
  coopTone: 'green' | 'orange'
  lastUpdated: string
  actionType: 'approve' | 'request'
  isSelected: boolean
}

const emit = defineEmits<{ notify: [message: string]; navigateToSection: [section: string] }>()

const selectedTimeframe = ref('30 Hari Terakhir (Juni 2024)')
const selectedProvince = ref('Semua 38 Provinsi')
const activeTab = ref<'verifikasi' | 'kurasi' | 'sengketa' | 'pencairan'>('verifikasi')

const search = ref('')
const selectedCategory = ref('Semua Komoditas')
const selectedOssStatus = ref('Semua Status')

// Modals state
const showBroadcastModal = ref(false)
const broadcastSubject = ref('')
const broadcastMessage = ref('')
const broadcastTarget = ref('semua_seller')

const stores = ref<EcosystemStore[]>([
  {
    id: 'store-1',
    name: 'Koperasi Tani Sindoro Sejahtera',
    commodityFocus: 'Komoditas: Kopi Arabika Temanggung Green & Roasted',
    regency: 'Kab. Temanggung',
    province: 'Jawa Tengah (Sentra Dataran Tinggi Kedu)',
    nib: 'NIB: 9120008472910',
    pirt: 'P-IRT: 210332301048-26',
    coopStatus: 'Binaan Dinas + Koperasi Temanggung',
    coopTone: 'green',
    lastUpdated: 'Hari Ini, 09:14 WIB',
    actionType: 'approve',
    isSelected: false,
  },
  {
    id: 'store-2',
    name: 'Kriya Bambu Rajapolah Lestari',
    commodityFocus: 'Komoditas: Anyaman Dapur & Perabotan Bambu Halus',
    regency: 'Kab. Tasikmalaya',
    province: 'Jawa Barat (Sentra Rajapolah)',
    nib: 'NIB: 9120002841201',
    pirt: 'Kriya Non-Pangan (Bebas P-IRT)',
    coopStatus: 'Binaan Koperasi Pasundan',
    coopTone: 'green',
    lastUpdated: 'Hari Ini, 08:30 WIB',
    actionType: 'approve',
    isSelected: false,
  },
  {
    id: 'store-3',
    name: 'Sambal Roa Dapur Oma Manado',
    commodityFocus: 'Komoditas: Sambal Ikan Roa Asap Kemasan 200g',
    regency: 'Kota Manado',
    province: 'Sulawesi Utara (Sentra Malalayang)',
    nib: 'NIB: 9120004912011',
    pirt: 'P-IRT: ⚠️ Menunggu Dinkes',
    pirtWarning: true,
    coopStatus: 'Pendampingan Sentra Manado',
    coopTone: 'orange',
    lastUpdated: 'Kemarin, 16:45 WIB',
    actionType: 'request',
    isSelected: false,
  },
  {
    id: 'store-4',
    name: 'Madu Hutan Liar Siak Mandiri',
    commodityFocus: 'Komoditas: Madu Akasia & Sialang Asli 500ml',
    regency: 'Kab. Siak',
    province: 'Riau (Sentra Hutan Asri)',
    nib: 'NIB: 9120003498203',
    pirt: 'BPOM MD: 252110401020',
    coopStatus: 'Kemitraan Adim Siak',
    coopTone: 'green',
    lastUpdated: 'Kemarin, 14:10 WIB',
    actionType: 'approve',
    isSelected: false,
  },
])

const regionalData = [
  {
    region: 'Jawa Tengah (Solo, Jepara, Magelang)',
    share: '32%',
    nominal: 'Rp 474.4jt',
    commodities: 'Batik Cap, Kriya Kayu Jati, Kopi Temanggung',
  },
  {
    region: 'DI Yogyakarta & Bantul (Kerajinan & Herbal)',
    share: '24%',
    nominal: 'Rp 355.8jt',
    commodities: 'Anyaman Pandan, Jamu Herbal, Gudeg Kaleng',
  },
  {
    region: 'NTT & Bali (Kopi Bajawa, Anyaman Sasak)',
    share: '18%',
    nominal: 'Rp 266.8jt',
    commodities: 'Tenun Ikat Ende, Perak Celuk, Kopi Flores',
  },
  {
    region: 'Jawa Timur & Banten (Tempe Oven, Gula Aren)',
    share: '14%',
    nominal: 'Rp 207.5jt',
    commodities: 'Keripik Tempe Malang, Gula Aren Lebak',
  },
  {
    region: 'Sumatera & Sulawesi (Kopi Gayo, Sambal Roa)',
    share: '12%',
    nominal: 'Rp 177.9jt',
    commodities: 'Sambal Roa Manado, Minyak Atsiri Gayo',
  },
]

const filteredStores = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('id')
  return stores.value.filter((st) => {
    const matchesSearch =
      !query ||
      `${st.name} ${st.commodityFocus} ${st.regency} ${st.province} ${st.nib}`
        .toLocaleLowerCase('id')
        .includes(query)
    return matchesSearch
  })
})

function notify(msg: string) {
  emit('notify', msg)
}

function goToSection(section: string) {
  emit('navigateToSection', section)
}

function approveStore(store: EcosystemStore) {
  notify(`✓ ${store.name} berhasil disetujui & diterbitkan ke Etalase Resmi PasarPintar!`)
}

function requestDocs(store: EcosystemStore) {
  notify(`Permintaan kelengkapan dokumen telah dikirimkan ke pengurus ${store.name}.`)
}

function approveSelected() {
  const selected = stores.value.filter((s) => s.isSelected)
  if (selected.length === 0) return
  selected.forEach((s) => {
    s.isSelected = false
  })
  notify(`✓ ${selected.length} toko binaan berhasil disetujui massal!`)
}

function sendBroadcast() {
  if (!broadcastSubject.value.trim() || !broadcastMessage.value.trim()) return
  showBroadcastModal.value = false
  notify(`📢 Broadcast Pengumuman Nasional "${broadcastSubject.value}" berhasil terkirim ke 3.420 mitra UMKM!`)
  broadcastSubject.value = ''
  broadcastMessage.value = ''
}
</script>

<template>
  <div class="platform-summary-content">
    <!-- Header Section -->
    <header class="page-heading">
      <div class="heading-copy">
        <div class="admin-breadcrumb">
          ADMIN CONSOLE &nbsp;›&nbsp; <b>RINGKASAN MONITORING NASIONAL</b>
        </div>
        <h1>Pusat Kendali Ekosistem PasarPintar</h1>
      </div>

      <div class="heading-actions">
        <select v-model="selectedTimeframe" class="filter-select" aria-label="Rentang Waktu">
          <option value="30 Hari Terakhir (Juni 2024)">30 Hari Terakhir</option>
          <option value="7 Hari Terakhir">7 Hari Terakhir</option>
          <option value="Triwulan Q4 2024">Triwulan Q4 2024</option>
        </select>

        <select v-model="selectedProvince" class="filter-select" aria-label="Filter Provinsi">
          <option value="Semua 38 Provinsi">Semua 38 Provinsi</option>
          <option value="Jawa Tengah">Jawa Tengah</option>
          <option value="DI Yogyakarta">DI Yogyakarta</option>
          <option value="Nusa Tenggara Timur">Nusa Tenggara Timur</option>
          <option value="Jawa Timur">Jawa Timur</option>
          <option value="Sulawesi Utara">Sulawesi Utara</option>
        </select>

        <select class="filter-select export-dropdown" aria-label="Opsi Ekspor" @change="(e: Event) => { notify('Mengunduh rekap ringkasan...'); (e.target as HTMLSelectElement).value = ''; }">
          <option value="" disabled selected>Ekspor ▾</option>
          <option value="pdf">Unduh Rekap PDF</option>
          <option value="excel">Unduh Excel</option>
        </select>

        <button type="button" class="btn-primary" @click="showBroadcastModal = true">
          📢 + Broadcast
        </button>
      </div>
    </header>

    <!-- Priority Compact Alert -->
    <section class="priority-banner">
      <div class="banner-body">
        <div class="banner-title-row">
          <h2>Antrean Verifikasi: 14 Toko UMKM Baru</h2>
          <small class="sla-text">SLA: 1j 12m</small>
        </div>
      </div>
      <div class="banner-actions">
        <button type="button" class="btn-banner-red" @click="goToSection('Verifikasi Toko & UMKM')">
          Tinjau Antrean (14 Toko)
        </button>
      </div>
    </section>

    <!-- Metrics Grid (4 Cards) -->
    <section class="summary-stats-grid">
      <!-- Metric 1: GMV -->
      <article class="stat-card" title="Total 112.940 Transaksi Sukses • 38 Provinsi">
        <div class="stat-header">
          <span class="stat-title">VOLUME TRANSAKSI BRUTO</span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">Rp 1.482.650.000</strong>
        </div>
        <div class="stat-footer-row">
          <span class="delta-pill mint">+18.4% vs bulan lalu</span>
        </div>
      </article>

      <!-- Metric 2: Sellers -->
      <article class="stat-card" title="94% Lolos NIB/Halal • Kemenkop Hub">
        <div class="stat-header">
          <span class="stat-title">REGISTRI PENJUAL</span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">3.420 <small>Unit</small></strong>
        </div>
        <div class="stat-footer-row">
          <span class="delta-pill mint">+148 Toko Baru</span>
        </div>
      </article>

      <!-- Metric 3: Products -->
      <article class="stat-card" title="98.2% Lolos Uji Mutu • 6 Kurasi Laporan">
        <div class="stat-header">
          <span class="stat-title">KATALOG KOMODITAS</span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">48.910 <small>SKU</small></strong>
        </div>
        <div class="stat-footer-row">
          <span class="delta-pill mint">+320 Aktif Minggu Ini</span>
        </div>
      </article>

      <!-- Metric 4: Escrow -->
      <article class="stat-card" title="Auto-Settlement Aktif • Rekber Himbara">
        <div class="stat-header">
          <span class="stat-title">SISTEM REKBER AMAN</span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">Rp 342.180.000</strong>
        </div>
        <div class="stat-footer-row">
          <span class="delta-pill mint">0 Sengketa &gt; 48 Jam</span>
        </div>
      </article>
    </section>

    <!-- Middle Workspace: Sales Chart & Regional Mapping -->
    <div class="middle-grid">
      <!-- Left: Grouped Sales Chart -->
      <section class="chart-card">
        <header class="card-header">
          <div>
            <small class="kicker">METRIK AGREGAT PLATFORM</small>
            <h2>Tren Penjualan Komoditas UMKM 2024</h2>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><i class="dot makanan"></i> Makanan & Minuman</span>
            <span class="legend-item"><i class="dot kriya"></i> Kriya & Bambu</span>
            <span class="legend-item"><i class="dot wastra"></i> Wastra & Tenun</span>
          </div>
        </header>

        <div class="bar-chart-visualization">
          <div class="chart-y-axis">
            <span>Rp 1.5M</span>
            <span>Rp 1.0M</span>
            <span>Rp 500rb</span>
            <span>0</span>
          </div>

          <div class="chart-bars-group">
            <div class="month-col">
              <div class="bars">
                <div class="bar makanan" style="height: 45%" title="Makanan: Rp 450M"></div>
                <div class="bar kriya" style="height: 25%" title="Kriya: Rp 250M"></div>
                <div class="bar wastra" style="height: 30%" title="Wastra: Rp 300M"></div>
              </div>
              <span>Jan</span>
            </div>

            <div class="month-col">
              <div class="bars">
                <div class="bar makanan" style="height: 52%" title="Makanan: Rp 520M"></div>
                <div class="bar kriya" style="height: 28%" title="Kriya: Rp 280M"></div>
                <div class="bar wastra" style="height: 32%" title="Wastra: Rp 320M"></div>
              </div>
              <span>Feb</span>
            </div>

            <div class="month-col">
              <div class="bars">
                <div class="bar makanan" style="height: 65%" title="Makanan: Rp 650M"></div>
                <div class="bar kriya" style="height: 35%" title="Kriya: Rp 350M"></div>
                <div class="bar wastra" style="height: 40%" title="Wastra: Rp 400M"></div>
              </div>
              <span>Mar</span>
            </div>

            <div class="month-col peak-month">
              <span class="peak-tag">Puncak Ramadhan</span>
              <div class="bars">
                <div class="bar makanan" style="height: 95%" title="Makanan: Rp 950M"></div>
                <div class="bar kriya" style="height: 50%" title="Kriya: Rp 500M"></div>
                <div class="bar wastra" style="height: 60%" title="Wastra: Rp 600M"></div>
              </div>
              <span>Apr</span>
            </div>

            <div class="month-col">
              <div class="bars">
                <div class="bar makanan" style="height: 72%" title="Makanan: Rp 720M"></div>
                <div class="bar kriya" style="height: 42%" title="Kriya: Rp 420M"></div>
                <div class="bar wastra" style="height: 48%" title="Wastra: Rp 480M"></div>
              </div>
              <span>Mei</span>
            </div>

            <div class="month-col active-month">
              <div class="bars">
                <div class="bar makanan" style="height: 85%" title="Makanan: Rp 850M"></div>
                <div class="bar kriya" style="height: 48%" title="Kriya: Rp 480M"></div>
                <div class="bar wastra" style="height: 55%" title="Wastra: Rp 550M"></div>
              </div>
              <span>Jun (Aktif)</span>
            </div>
          </div>
        </div>

        <footer class="chart-footer-strip">
          <div class="strip-item">
            <span class="strip-icon">🛍</span>
            <div>
              <small>Rata-rata Nilai Keranjang (AOV)</small>
              <b>Rp 168.500 <span class="green-text">+6.2%</span></b>
            </div>
          </div>

          <div class="strip-item">
            <span class="strip-icon">🔄</span>
            <div>
              <small>Tingkat Repeat Order (ROR)</small>
              <b>34.2% <small>(Konsisten)</small></b>
            </div>
          </div>

          <div class="strip-item">
            <span class="strip-icon">🚚</span>
            <div>
              <small>Subsidi Logistik GBBI</small>
              <b>89.4% Tersalurkan</b>
            </div>
          </div>
        </footer>
      </section>

      <!-- Right: Regional Craft Activity -->
      <aside class="regional-card">
        <header class="card-header">
          <div>
            <small class="kicker">PEMETAAN REGIONAL</small>
            <h2>Aktivitas Sentra Pengrajin Teraktif</h2>
          </div>
          <span class="badge-tag-mint">38 Provinsi Terpetakan</span>
        </header>

        <div class="regional-list">
          <article v-for="item in regionalData" :key="item.region" class="regional-item">
            <div class="reg-header">
              <b>{{ item.region }}</b>
              <div class="reg-vals">
                <strong>{{ item.share }}</strong>
                <small>({{ item.nominal }})</small>
              </div>
            </div>
            <div class="reg-sub">{{ item.commodities }}</div>
          </article>
        </div>

        <footer class="regional-footer">
          <div class="logistic-pill">
            <span>🚚 LOGISTIK TERHUBUNG MULTI-KURIR</span>
            <small>Rata-rata Waktu Tiba: <strong>2.8 Hari</strong></small>
            <span class="on-time-tag">99.3% On-Time</span>
          </div>
        </footer>
      </aside>
    </div>

    <!-- Main Operational Table (Tasks & Antrean) -->
    <section class="table-container">
      <nav class="table-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'verifikasi' }"
          @click="activeTab = 'verifikasi'"
        >
          <span class="tab-icon">📋</span>
          Antrean Verifikasi Legalitas Toko
          <span class="badge-count-red">14</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'kurasi' }"
          @click="activeTab = 'kurasi'"
        >
          <span class="tab-icon">📦</span>
          Moderasi & Kurasi Produk
          <span class="badge-count-green">6</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'sengketa' }"
          @click="activeTab = 'sengketa'"
        >
          <span class="tab-icon">⚖</span>
          Sengketa & Mediasi Transaksi
          <span class="badge-count-orange">2</span>
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'pencairan' }"
          @click="activeTab = 'pencairan'"
        >
          <span class="tab-icon">💳</span>
          Pencairan Saldo Tertunda
          <span class="badge-count-gray">3</span>
        </button>
      </nav>

      <div class="table-controls-bar">
        <button type="button" class="btn-fast-approve" @click="approveSelected">
          ✓ Setujui Cepat Terpilih
        </button>

        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="search"
            type="search"
            placeholder="Cari nama toko, pengrajin, NIB, atau provinsi..."
            aria-label="Cari toko"
          />
        </div>

        <select v-model="selectedCategory" class="filter-select" aria-label="Filter Komoditas">
          <option value="Semua Komoditas">Kategori: Semua Komoditas</option>
          <option value="Kopi">Kopi & Minuman</option>
          <option value="Kriya">Kriya & Bambu</option>
          <option value="Sambal">Sambal & Olahan</option>
        </select>

        <select v-model="selectedOssStatus" class="filter-select" aria-label="Filter Validasi OSS">
          <option value="Semua Status">Status Validasi OSS: Semua Status</option>
          <option value="Valid">Valid matched</option>
          <option value="Pending">Menunggu Dinkes</option>
        </select>

        <button type="button" class="btn-refresh" title="Segarkan" @click="notify('Data antrean diperbarui.')">
          ↻
        </button>
      </div>

      <!-- Table View -->
      <div class="table-responsive">
        <table class="summary-table">
          <thead>
            <tr>
              <th class="col-check">
                <input type="checkbox" aria-label="Pilih Semua" />
              </th>
              <th>TOKO & PENGRAJIN</th>
              <th>SENTRA & KABUPATEN</th>
              <th>DOKUMEN LEGALITAS</th>
              <th>STATUS BINAAN</th>
              <th>TERAKHIR DIUBAH</th>
              <th class="text-right">TINDAKAN CEPAT</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="st in filteredStores" :key="st.id">
              <td class="col-check">
                <input type="checkbox" v-model="st.isSelected" :aria-label="`Pilih ${st.name}`" />
              </td>
              <td>
                <div class="store-cell">
                  <div class="store-name-row">
                    <b class="store-name" @click="goToSection('Verifikasi Toko & UMKM')">{{ st.name }}</b>
                    <span class="verified-icon">✓</span>
                  </div>
                  <small class="commodity-lbl">{{ st.commodityFocus }}</small>
                </div>
              </td>
              <td>
                <div class="regency-cell">
                  <b>{{ st.regency }}</b>
                  <small>{{ st.province }}</small>
                </div>
              </td>
              <td>
                <div class="docs-cell">
                  <code>{{ st.nib }}</code>
                  <small :class="{ warning: st.pirtWarning }">{{ st.pirt }}</small>
                </div>
              </td>
              <td>
                <span class="coop-badge" :class="st.coopTone">
                  ● {{ st.coopStatus }}
                </span>
              </td>
              <td>
                <small class="time-text">{{ st.lastUpdated }}</small>
              </td>
              <td class="text-right">
                <div class="action-cell">
                  <button
                    v-if="st.actionType === 'approve'"
                    type="button"
                    class="btn-approve"
                    @click="approveStore(st)"
                  >
                    Setujui & Terbitkan
                  </button>
                  <button
                    v-else
                    type="button"
                    class="btn-request"
                    @click="requestDocs(st)"
                  >
                    Minta Kelengkapan
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredStores.length === 0">
              <td colspan="7" class="empty-table-cell">
                Tidak ada antrean toko binaan yang sesuai dengan filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="table-pagination">
        <span>Menampilkan 1 - {{ filteredStores.length }} dari 14 antrean verifikasi toko binaan daerah</span>

        <div class="pagination-buttons">
          <button type="button" disabled>‹ Sebelumnya</button>
          <button type="button" class="active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">Berikutnya ›</button>
        </div>
      </footer>
    </section>

    <!-- Bottom Telemetry Status Cards (3 Cards) -->
    <div class="bottom-status-grid">
      <article class="status-box">
        <div class="box-header">
          <span class="box-title">Integrasi OSS BKPM</span>
          <span class="tag-online">ONLINE</span>
        </div>
        <p>Pengecekan NIB otomatis via API Nasional aktif. Sinkronisasi data legalitas toko berjalan lancar.</p>
        <small>Terakhir disinkronkan 4 menit yang lalu</small>
      </article>

      <article class="status-box">
        <div class="box-header">
          <span class="box-title">Rekber & Bank Himbara</span>
          <span class="tag-online">LANCAR</span>
        </div>
        <p>Escrow settlement BRI, Mandiri, BNI, BCA tanpa kendala pending. Likuiditas cadangan siap cair.</p>
        <small>Auto-settlement H+0 berjalan sesuai jadwal</small>
      </article>

      <article class="status-box">
        <div class="box-header">
          <span class="box-title">Audit Log Keamanan</span>
          <span class="tag-online">TEREKAM</span>
        </div>
        <p>Super Admin Hendri W. menyetujui toko 10 menit yang lalu dari IP 103.11.45.12</p>
        <small>ISO 27001 Log Monitoring Active</small>
      </article>
    </div>

    <!-- Broadcast Modal -->
    <div v-if="showBroadcastModal" class="modal-backdrop" @click.self="showBroadcastModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>PENGUMUMAN SELLER</small>
            <h2>📢 Broadcast Pengumuman Nasional</h2>
          </div>
          <button type="button" class="close-btn" @click="showBroadcastModal = false">×</button>
        </header>

        <form @submit.prevent="sendBroadcast">
          <label class="form-group">
            <span>Target Penerima</span>
            <select v-model="broadcastTarget">
              <option value="semua_seller">Seluruh 3.420 Toko UMKM Terverifikasi</option>
              <option value="sentra_3t">Sentra Daerah 3T (Afirmasi Ongkir)</option>
              <option value="koperasi_binaan">Pengurus Koperasi & Facilitator Sentra</option>
            </select>
          </label>

          <label class="form-group">
            <span>Subjek Pengumuman *</span>
            <input v-model="broadcastSubject" required placeholder="Contoh: Pembukaan Alokasi Subsidi Ongkir GBBI Q4 2024" />
          </label>

          <label class="form-group">
            <span>Isi Pesan Broadcast *</span>
            <textarea v-model="broadcastMessage" required placeholder="Tuliskan pesan pengumuman resmi yang akan dikirimkan via Dashboard & WhatsApp Seller..."></textarea>
          </label>

          <footer class="modal-footer">
            <button type="button" class="btn-cancel" @click="showBroadcastModal = false">Batal</button>
            <button type="submit" class="btn-primary">Kirim Broadcast Sekarang</button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.platform-summary-content {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 24px 28px 36px;
  color: #0f172a;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  font-size: 13.5px;
  line-height: 1.5;
}

.platform-summary-content * {
  box-sizing: border-box;
}

.platform-summary-content button,
.platform-summary-content input,
.platform-summary-content select,
.platform-summary-content textarea {
  font-family: inherit;
}

.platform-summary-content button {
  cursor: pointer;
}

/* Page Heading */
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 22px;
}

.heading-copy {
  max-width: 680px;
}

.admin-breadcrumb {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.4px;
}

.admin-breadcrumb b {
  color: #059669;
}

.page-heading h1 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 25px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.page-heading p {
  margin: 0;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
}

.heading-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.filter-select {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  background: #ffffff;
  font-size: 12px;
  font-weight: 600;
  outline: 0;
}

.btn-outline {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  background: #ffffff;
  font-size: 12.5px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.btn-outline:hover {
  background: #f8fafc;
}

.btn-primary {
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #059669;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
  transition: background 0.15s ease;
}

.btn-primary:hover {
  background: #047857;
}

/* Priority Banner */
.priority-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  padding: 16px 20px;
  border: 1px solid #fecdd3;
  border-radius: 12px;
  background: #fff1f2;
  box-shadow: 0 2px 8px rgba(225, 29, 72, 0.05);
}

.banner-icon-wrap {
  width: 38px;
  height: 38px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #e11d48;
  font-size: 20px;
  font-weight: 900;
}

.banner-body {
  flex: 1;
  min-width: 0;
}

.banner-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.banner-title-row h2 {
  margin: 0;
  color: #9f1239;
  font-size: 14.5px;
  font-weight: 800;
}

.badge-priority {
  padding: 2px 7px;
  border-radius: 4px;
  color: #ffffff;
  background: #e11d48;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.sla-text {
  color: #9f1239;
  font-size: 11px;
}

.banner-body p {
  margin: 4px 0 0;
  color: #be123c;
  font-size: 12px;
  line-height: 1.45;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.btn-banner-red {
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #ea580c;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.2);
}

.btn-banner-link {
  border: 0;
  background: transparent;
  color: #9f1239;
  font-size: 12px;
  font-weight: 700;
  text-decoration: underline;
}

/* Stats Grid */
.summary-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}

.stat-card {
  padding: 16px 18px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.stat-title {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
}

.stat-icon-wrap {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 7px;
}

.stat-icon-wrap svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.stat-icon-wrap.mint { color: #059669; background: #ecfdf5; }
.stat-icon-wrap.gold { color: #d97706; background: #fffbeb; }

.stat-lbl {
  display: block;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 2px;
}

.stat-value-row {
  margin-bottom: 6px;
}

.stat-value {
  color: #0f172a;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.stat-value small {
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.stat-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.delta-pill {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
}

.delta-pill.mint { color: #047857; background: #d1fae5; }

.stat-sub-info {
  color: #64748b;
  font-size: 11px;
}

.stat-sub-info b { color: #0f172a; }

.warning-text { color: #dc2626; font-weight: 700; }

.link-btn { color: #059669; font-weight: 700; text-decoration: none; }

/* Middle Grid */
.middle-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 20px;
  margin-bottom: 22px;
}

.chart-card,
.regional-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.kicker {
  display: block;
  color: #64748b;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.card-header h2 {
  margin: 2px 0 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.chart-legend {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  color: #475569;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dot { width: 8px; height: 8px; border-radius: 2px; }
.dot.makanan { background: #059669; }
.dot.kriya { background: #0284c7; }
.dot.wastra { background: #ea580c; }

/* Bar Chart Visual */
.bar-chart-visualization {
  display: grid;
  grid-template-columns: 50px 1fr;
  gap: 10px;
  height: 180px;
  margin-bottom: 16px;
}

.chart-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #94a3b8;
  font-size: 10px;
  text-align: right;
  padding-right: 6px;
  border-right: 1px solid #f1f5f9;
}

.chart-bars-group {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  align-items: flex-end;
}

.month-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  position: relative;
}

.month-col > span {
  margin-top: 6px;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

.month-col.active-month > span {
  color: #059669;
  font-weight: 800;
}

.peak-tag {
  position: absolute;
  top: -22px;
  padding: 2px 5px;
  border-radius: 4px;
  color: #ffffff;
  background: #ea580c;
  font-size: 8.5px;
  font-weight: 800;
  white-space: nowrap;
}

.bars {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: calc(100% - 24px);
}

.bar {
  width: 10px;
  border-radius: 3px 3px 0 0;
  transition: height 0.3s ease;
}

.bar.makanan { background: #059669; }
.bar.kriya { background: #0284c7; }
.bar.wastra { background: #ea580c; }

.chart-footer-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  background: #fafcfb;
  border-radius: 8px;
  padding: 10px;
}

.strip-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.strip-icon {
  font-size: 16px;
}

.strip-item small {
  display: block;
  color: #64748b;
  font-size: 10.5px;
}

.strip-item b {
  color: #0f172a;
  font-size: 12.5px;
}

.green-text { color: #059669; }

/* Regional Card */
.badge-tag-mint {
  padding: 3px 8px;
  border-radius: 6px;
  color: #047857;
  background: #d1fae5;
  font-size: 10.5px;
  font-weight: 800;
}

.regional-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.regional-item {
  padding: 8px 10px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.reg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reg-header b {
  color: #0f172a;
  font-size: 12px;
}

.reg-vals strong {
  color: #059669;
  font-size: 12.5px;
}

.reg-vals small {
  color: #64748b;
  font-size: 10.5px;
}

.reg-sub {
  color: #64748b;
  font-size: 10.5px;
  margin-top: 2px;
}

.regional-footer {
  padding-top: 8px;
}

.logistic-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 8px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  font-size: 11px;
  color: #047857;
}

.logistic-pill strong { color: #065f46; }

.on-time-tag {
  padding: 2px 6px;
  border-radius: 4px;
  color: #ffffff;
  background: #059669;
  font-weight: 800;
}

/* Operational Table Section */
.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
  overflow: hidden;
  margin-bottom: 22px;
}

.table-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 18px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
  overflow-x: auto;
}

.tab-btn {
  height: 44px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 0;
  border-bottom: 2px solid transparent;
  color: #64748b;
  background: transparent;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
}

.tab-btn.active {
  color: #047857;
  border-color: #047857;
  font-weight: 700;
}

.tab-icon { font-size: 14px; }

.badge-count-red { padding: 2px 6px; border-radius: 10px; color: #ffffff; background: #e11d48; font-size: 10px; font-weight: 800; }
.badge-count-green { padding: 2px 6px; border-radius: 10px; color: #ffffff; background: #059669; font-size: 10px; font-weight: 800; }
.badge-count-orange { padding: 2px 6px; border-radius: 10px; color: #ffffff; background: #ea580c; font-size: 10px; font-weight: 800; }
.badge-count-gray { padding: 2px 6px; border-radius: 10px; color: #475569; background: #cbd5e1; font-size: 10px; font-weight: 800; }

.table-controls-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.btn-fast-approve {
  padding: 8px 14px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #047857;
  font-size: 12px;
  font-weight: 700;
}

.search-input-wrap {
  flex: 1;
  min-width: 260px;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
}

.search-icon {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: #64748b;
  stroke-width: 2;
}

.search-input-wrap input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #0f172a;
  font-size: 12.5px;
}

.btn-refresh {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  background: #ffffff;
}

/* Operational Table */
.table-responsive {
  overflow-x: auto;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12.5px;
}

.summary-table th {
  padding: 10px 14px;
  color: #64748b;
  background: #f8fafc;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.summary-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.col-check { width: 36px; text-align: center; }

.store-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.store-name {
  color: #0f172a;
  font-weight: 800;
  cursor: pointer;
}

.store-name:hover { color: #059669; }

.verified-icon {
  width: 16px;
  height: 16px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #059669;
  font-size: 10px;
}

.commodity-lbl {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.regency-cell b {
  display: block;
  color: #0f172a;
}

.regency-cell small {
  color: #64748b;
  font-size: 11px;
}

.docs-cell code {
  display: block;
  color: #059669;
  font-size: 11px;
}

.docs-cell small {
  color: #475569;
  font-size: 11px;
}

.docs-cell small.warning {
  color: #ea580c;
  font-weight: 700;
}

.coop-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.coop-badge.green { color: #047857; background: #ecfdf5; }
.coop-badge.orange { color: #c2410c; background: #fff7ed; }

.time-text {
  color: #64748b;
  font-size: 11px;
}

.text-right { text-align: right; }

.btn-approve {
  padding: 6px 12px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #047857;
  font-size: 11.5px;
  font-weight: 700;
}

.btn-request {
  padding: 6px 12px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #ea580c;
  font-size: 11.5px;
  font-weight: 700;
}

.empty-table-cell {
  text-align: center;
  padding: 30px !important;
  color: #64748b;
}

.table-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  font-size: 12px;
  color: #64748b;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.pagination-buttons button {
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 600;
}

.pagination-buttons button.active {
  color: #ffffff;
  background: #047857;
  border-color: #047857;
}

/* Bottom Status Grid */
.bottom-status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.status-box {
  padding: 14px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.box-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
}

.tag-online {
  padding: 2px 6px;
  border-radius: 4px;
  color: #047857;
  background: #ecfdf5;
  font-size: 10px;
  font-weight: 800;
}

.status-box p {
  margin: 0 0 6px;
  color: #475569;
  font-size: 11.5px;
  line-height: 1.4;
}

.status-box small {
  color: #64748b;
  font-size: 10.5px;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
}

.modal-dialog {
  width: min(500px, 100%);
  padding: 24px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.modal-header small {
  color: #059669;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.modal-header h2 {
  margin: 2px 0 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.close-btn {
  border: 0;
  background: transparent;
  font-size: 24px;
  color: #64748b;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12.5px;
  outline: 0;
}

.form-group textarea {
  height: 80px;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.btn-cancel {
  height: 38px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  background: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
}

@media (max-width: 1080px) {
  .summary-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .middle-grid { grid-template-columns: 1fr; }
  .bottom-status-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .page-heading { flex-direction: column; }
  .priority-banner { flex-direction: column; align-items: flex-start; }
  .chart-footer-strip { grid-template-columns: 1fr; }
  .summary-stats-grid { grid-template-columns: 1fr; }
}
</style>
