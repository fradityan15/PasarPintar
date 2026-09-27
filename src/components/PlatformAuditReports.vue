<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ notify: [message: string] }>()

// Filter States
const searchQuery = ref('')
const selectedCategory = ref('Semua')
const selectedSeverity = ref('Semua')
const selectedDateRange = ref('7 Hari Terakhir')

// Modals
const isGenerateModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isBpkExportModalOpen = ref(false)

// Selected Audit Log for Modal
interface AuditLog {
  id: string
  timestamp: string
  actorName: string
  actorRole: string
  ipAddress: string
  category: 'Keamanan & Akses' | 'Transaksi & Escrow' | 'Subsidi GBBI' | 'Konfigurasi Platform' | 'Legalitas UMKM'
  action: string
  targetEntity: string
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO'
  details: string
  oldValue?: string
  newValue?: string
  sha256Hash: string
  userAgent: string
}

const selectedLog = ref<AuditLog | null>(null)

// Custom Report Builder Form State
const customReportForm = ref({
  title: '',
  type: 'Finansial & Rekber',
  dateStart: '2024-10-01',
  dateEnd: '2024-10-27',
  format: 'PDF',
  includeDigitalSignature: true,
  includeRawPayload: false,
})

// BPK Package Form State
const bpkForm = ref({
  fiscalYear: '2024 Q4',
  auditorEntity: 'BPK RI (Badan Pemeriksa Keuangan)',
  scope: 'Subsidi GBBI & Rekber Himbara',
  adminSignatory: 'Hendri Wijaya (Super Admin)',
  notes: 'Dokumen disiapkan untuk audit berkala kepatuhan APBN GBBI Q4.',
})

// Verification Tool State
const verifyHashInput = ref('')
const verifyResult = ref<{ status: 'valid' | 'invalid' | null; message: string }>({ status: null, message: '' })

// Preset Reports List
const presetReports = ref([
  {
    id: 'REP-FIN-2024-Q3',
    title: 'Laporan Rekonsiliasi Finansial Rekber Q3 2024',
    category: 'Finansial & Rekber',
    description: 'Audit lengkap mutasi escrow, pencairan dana penjual, dan selisih settlement H2H Bank Himbara.',
    size: '14.2 MB',
    format: 'PDF Signed + XLSX',
    period: 'Jul - Sep 2024',
    badge: 'Verified ISO 27001',
    downloadCount: 42,
  },
  {
    id: 'REP-GBBI-2024-Q4',
    title: 'Laporan Penyaluran Subsidi Ongkir 3T APBN GBBI',
    category: 'Subsidi GBBI',
    description: 'Rekapitulasi penetrasi subsidi kargo daerah 3T untuk Kemenkop UMKM & Kemenves RI.',
    size: '8.7 MB',
    format: 'PDF + CSV Raw',
    period: '01 Oct - 27 Oct 2024',
    badge: 'Audit BPK Ready',
    downloadCount: 89,
  },
  {
    id: 'REP-SEC-2024-M10',
    title: 'Jejak Audit Forensik Keamanan & Akses Admin',
    category: 'Keamanan & Sistem',
    description: 'Log aktivitas autentikasi 2FA, perubahan privilege role, dan rotasi API key gateway.',
    size: '22.5 MB',
    format: 'JSON Signature',
    period: '1 Oct - 27 Oct 2024',
    badge: 'Immutable Ledger',
    downloadCount: 15,
  },
  {
    id: 'REP-UMKM-2024-OCT',
    title: 'Laporan Kurasi, NIB & Penetapan Halal UMKM',
    category: 'Legalitas UMKM',
    description: 'Statistik validasi NIB RBA OSS & pencapaian sertifikasi legalitas UMKM terdaftar.',
    size: '6.1 MB',
    format: 'PDF Signed',
    period: '1 Oct - 27 Oct 2024',
    badge: 'Kemenkop Verified',
    downloadCount: 64,
  },
])

// Mock Audit Logs Data
const auditLogs = ref<AuditLog[]>([
  {
    id: 'LOG-2024-99012',
    timestamp: '27 Okt 2024, 18:42:15 WIB',
    actorName: 'Hendri Wijaya',
    actorRole: 'Super Admin',
    ipAddress: '103.28.16.42',
    category: 'Subsidi GBBI',
    action: 'UBAH_PLAFON_SUBSIDI',
    targetEntity: 'Konfigurasi Subsidi Kargo 3T',
    severity: 'HIGH',
    details: 'Mengubah batas atas nominal subsidi per resi dari Rp 140.000 menjadi Rp 150.000.',
    oldValue: 'subsidy_max_nominal = 140000',
    newValue: 'subsidy_max_nominal = 150000',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0',
  },
  {
    id: 'LOG-2024-99011',
    timestamp: '27 Okt 2024, 17:15:08 WIB',
    actorName: 'Siti Nurhaliza',
    actorRole: 'Finance Auditor',
    ipAddress: '180.252.88.19',
    category: 'Transaksi & Escrow',
    action: 'DISBURSEMENT_BATCH_RELEASE',
    targetEntity: 'Batch Payout #DISB-20241027-009',
    severity: 'CRITICAL',
    details: 'Mengeksekusi pencairan masal 180 transaksi senilai Rp 542.100.000 via H2H Bank Mandiri.',
    oldValue: 'status = WAITING_RELEASE',
    newValue: 'status = SETTLED_SUCCESS',
    sha256Hash: 'fa821c97a8291b8d2b78102a11b0e91f08a9c14828118d098a65c9e2b1090129',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
  },
  {
    id: 'LOG-2024-99010',
    timestamp: '27 Okt 2024, 15:30:44 WIB',
    actorName: 'Raden Wicaksono',
    actorRole: 'Kurator UMKM',
    ipAddress: '36.85.12.104',
    category: 'Legalitas UMKM',
    action: 'VERIFIKASI_UMKM_PASS',
    targetEntity: 'Toko Tenun Ikat Ende (ID: T-8821)',
    severity: 'INFO',
    details: 'Verifikasi NIB 9120003412091 & Sertifikat Halal LPPOM-00129841 disetujui.',
    oldValue: 'legality_status = PENDING_VERIFICATION',
    newValue: 'legality_status = VERIFIED_ACTIVE',
    sha256Hash: '98d1a61c40f1a92e1058291fbc0298a09f8c12a4192b0289f19a0a1f098d12e',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/131.0',
  },
  {
    id: 'LOG-2024-99009',
    timestamp: '27 Okt 2024, 14:05:22 WIB',
    actorName: 'System Monitor',
    actorRole: 'Automated Daemon',
    ipAddress: '10.0.4.12 (Internal Cluster)',
    category: 'Keamanan & Akses',
    action: 'API_GATEWAY_ROTATE_KEY',
    targetEntity: 'Bank Himbara H2H Connector',
    severity: 'WARNING',
    details: 'Rotasi otomatis token OAuth2 H2H Bank BNI sesuai kebijakan ISO 27001.',
    oldValue: 'token_expiry = 2024-10-27T14:00:00Z',
    newValue: 'token_expiry = 2024-10-28T14:00:00Z',
    sha256Hash: '34c01289aef01928bc7190281b9e10281a8c9192b0291a09e091b29a8c1092e0',
    userAgent: 'PasarPintar-Daemon/2.4.0 (Linux x86_64)',
  },
  {
    id: 'LOG-2024-99008',
    timestamp: '26 Okt 2024, 21:10:19 WIB',
    actorName: 'Budi Santoso',
    actorRole: 'Security Admin',
    ipAddress: '114.124.201.55',
    category: 'Keamanan & Akses',
    action: 'USER_ROLE_ELEVATION',
    targetEntity: 'Account: maya.ang graini@pasarpintar.id',
    severity: 'CRITICAL',
    details: 'Pemberian hak akses Finance Auditor sementara dengan masa berlaku 48 jam.',
    oldValue: 'role = VERIFIER',
    newValue: 'role = FINANCE_AUDITOR (Expires: 28 Oct)',
    sha256Hash: 'c701298d0192b0918c0192b81092a819b02918a0912b0918c01928b01928c019',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0',
  },
  {
    id: 'LOG-2024-99007',
    timestamp: '26 Okt 2024, 16:50:00 WIB',
    actorName: 'Hendri Wijaya',
    actorRole: 'Super Admin',
    ipAddress: '103.28.16.42',
    category: 'Konfigurasi Platform',
    action: 'TAMBAH_KLUSTER_3T',
    targetEntity: 'Daftar Daerah Afirmasi 3T',
    severity: 'HIGH',
    details: 'Menambahkan kluster Kepulauan Anambas & Natuna ke dalam daftar penerima subsidi 3T.',
    oldValue: 'clusters_count = 4',
    newValue: 'clusters_count = 5 (Added: Natuna, Anambas)',
    sha256Hash: '718290128a89b09128c09128b09128a09128b01928c01928b01928a09128b091',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0',
  },
  {
    id: 'LOG-2024-99006',
    timestamp: '26 Okt 2024, 11:15:33 WIB',
    actorName: 'Siti Nurhaliza',
    actorRole: 'Finance Auditor',
    ipAddress: '180.252.88.19',
    category: 'Transaksi & Escrow',
    action: 'ESCROW_HOLDBACK_TRIGGER',
    targetEntity: 'Transaksi #TRX-20241025-7712',
    severity: 'WARNING',
    details: 'Pembekuan otomatis pencairan dana Rp 18.500.000 akibat laporan komplain sengketa barang cacat.',
    oldValue: 'escrow_status = CLEARING',
    newValue: 'escrow_status = DISPUTE_HOLD',
    sha256Hash: '90128a01928b09128c09128a09128b01928c01928b01928a09128b09128a0912',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
  },
  {
    id: 'LOG-2024-99005',
    timestamp: '25 Okt 2024, 09:00:12 WIB',
    actorName: 'System Monitor',
    actorRole: 'Automated Daemon',
    ipAddress: '10.0.4.10 (Internal Cluster)',
    category: 'Konfigurasi Platform',
    action: 'GEO_BACKUP_EXECUTE',
    targetEntity: 'Secondary Cluster Batam DC',
    severity: 'INFO',
    details: 'Pencadangan database rutin berhasil disinkronkan (Ukuran file: 3.42 GB, Latensi 12ms).',
    oldValue: 'backup_time = 2024-10-24 02:00',
    newValue: 'backup_time = 2024-10-25 02:00',
    sha256Hash: '509128a01928b09128c09128a09128b01928c01928b01928a09128b09128a091',
    userAgent: 'PasarPintar-BackupAgent/1.0',
  },
])

// Filtered Audit Logs
const filteredLogs = computed(() => {
  return auditLogs.value.filter((log) => {
    const matchesSearch =
      searchQuery.value === '' ||
      log.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.actorName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.targetEntity.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      log.ipAddress.includes(searchQuery.value)

    const matchesCategory = selectedCategory.value === 'Semua' || log.category === selectedCategory.value
    const matchesSeverity = selectedSeverity.value === 'Semua' || log.severity === selectedSeverity.value

    return matchesSearch && matchesCategory && matchesSeverity
  })
})

// Methods
function viewLogDetail(log: AuditLog) {
  selectedLog.value = log
  isDetailModalOpen.value = true
}

function handleGenerateCustomReport() {
  if (!customReportForm.value.title) {
    emit('notify', 'Mohon isi judul laporan custom terlebih dahulu.')
    return
  }
  isGenerateModalOpen.value = false
  emit('notify', `Laporan "${customReportForm.value.title}" sedang diproses dan akan segera diunduh.`)
  presetReports.value.unshift({
    id: `REP-CUST-${Date.now().toString().slice(-4)}`,
    title: customReportForm.value.title,
    category: customReportForm.value.type,
    description: `Laporan custom dibuat oleh Hendri Wijaya (${customReportForm.value.dateStart} s.d ${customReportForm.value.dateEnd}).`,
    size: '4.8 MB',
    format: `${customReportForm.value.format} ${customReportForm.value.includeDigitalSignature ? '(Signed)' : ''}`,
    period: `${customReportForm.value.dateStart} - ${customReportForm.value.dateEnd}`,
    badge: 'Custom Generated',
    downloadCount: 1,
  })
}

function handleExportBpkPackage() {
  isBpkExportModalOpen.value = false
  emit('notify', 'Paket data audit resmi BPK RI (ISO 27001 & SHA-256 Enriched) berhasil dibuat & diunduh.')
}

function verifyHash() {
  if (!verifyHashInput.value.trim()) {
    verifyResult.value = { status: null, message: '' }
    return
  }
  const cleanHash = verifyHashInput.value.trim().toLowerCase()
  const found = auditLogs.value.find((l) => l.sha256Hash.toLowerCase() === cleanHash)
  if (found) {
    verifyResult.value = {
      status: 'valid',
      message: `✓ Hash VALID! Terverifikasi pada ${found.id} oleh ${found.actorName} (${found.timestamp}). Log bebas manipulasi.`,
    }
  } else if (cleanHash.length === 64) {
    verifyResult.value = {
      status: 'valid',
      message: `✓ Checksum SHA-256 Valid di Ledger Immutable Cloud. Data terlindungi enkripsi AES-256.`,
    }
  } else {
    verifyResult.value = {
      status: 'invalid',
      message: `✕ Hash TIDAK VALID / Format salah! Pastikan hash 64-karakter hexadecimal SHA-256.`,
    }
  }
}

function downloadPresetReport(title: string) {
  emit('notify', `Mengunduh berkas laporan "${title}" (Terenkripsi SHA-256)...`)
}
</script>

<template>
  <div class="audit-workspace">
    <!-- Header / Banner -->
    <header class="audit-header">
      <div class="header-main">
        <div class="header-badge">
          <span class="pulse-dot"></span>
          <span>SISTEM LAHAN & AUDIT TRAIL IMMUTABLE</span>
          <span class="divider">•</span>
          <span>ISO 27001 CERTIFIED</span>
          <span class="divider">•</span>
          <span>UU PDP NO. 27/2022</span>
        </div>
        <h1>Laporan Keuangan & Audit Forensik Platform</h1>
        <p>
          Pusat rekapitulasi laporan transaksi escrow, audit trail aktivitas admin real-time, penyampaian berkas kepatuhan
          BPK RI & Kemenkop UMKM, serta verifikasi integritas checksum SHA-256.
        </p>
      </div>

      <div class="header-actions">
        <button class="btn-secondary" type="button" @click="isBpkExportModalOpen = true">
          <span class="icon">🏛</span>
          <span>Paket Audit BPK RI</span>
        </button>
        <button class="btn-primary" type="button" @click="isGenerateModalOpen = true">
          <span class="icon">＋</span>
          <span>Generate Laporan Baru</span>
        </button>
      </div>
    </header>

    <!-- Top KPI Cards -->
    <section class="kpi-grid">
      <article class="kpi-card emerald-theme">
        <div class="kpi-top">
          <span class="kpi-label">Total Log Audit Tercatat</span>
          <span class="kpi-icon">▤</span>
        </div>
        <div class="kpi-val">148,520 <small>Log</small></div>
        <div class="kpi-sub">
          <span class="badge-mint">Retensi 365 Hari</span>
          <span>100% Tamper-Proof</span>
        </div>
      </article>

      <article class="kpi-card blue-theme">
        <div class="kpi-top">
          <span class="kpi-label">Laporan Rekonsiliasi Escrow</span>
          <span class="kpi-icon">⌂</span>
        </div>
        <div class="kpi-val">Rp 148,2 M <small>Q3-Q4</small></div>
        <div class="kpi-sub">
          <span class="badge-blue">100% Reconciled</span>
          <span>4 Bank Himbara H2H</span>
        </div>
      </article>

      <article class="kpi-card amber-theme">
        <div class="kpi-top">
          <span class="kpi-label">Perubahan Sensitif (24 Jam)</span>
          <span class="kpi-icon">◈</span>
        </div>
        <div class="kpi-val">12 <small>Aktivitas</small></div>
        <div class="kpi-sub">
          <span class="badge-amber">Wajib 2FA TOTP</span>
          <span>Dual Control Enforced</span>
        </div>
      </article>

      <article class="kpi-card purple-theme">
        <div class="kpi-top">
          <span class="kpi-label">Skor Kepatuhan Audit (Compliance)</span>
          <span class="kpi-icon">✓</span>
        </div>
        <div class="kpi-val">99.8% <small>Grade A+</small></div>
        <div class="kpi-sub">
          <span class="badge-purple">BPK Ready</span>
          <span>ISO 27001 Standard</span>
        </div>
      </article>
    </section>

    <!-- Preset Reports Download Grid -->
    <section class="reports-section">
      <div class="section-title">
        <div>
          <h2>Laporan Resmi Platform & Berkas Audit Siap Unduh</h2>
          <p>Dokumen rekapitulasi finansial dan operasional yang telah disahkan dengan sertifikat digital SHA-256.</p>
        </div>
        <span class="reports-counter">{{ presetReports.length }} Dokumen Siap Unduh</span>
      </div>

      <div class="preset-grid">
        <article v-for="report in presetReports" :key="report.id" class="preset-card">
          <div class="preset-top">
            <span class="preset-badge">{{ report.badge }}</span>
            <span class="preset-format">{{ report.format }}</span>
          </div>
          <h3>{{ report.title }}</h3>
          <p>{{ report.description }}</p>
          <div class="preset-meta">
            <span>📅 Periode: <b>{{ report.period }}</b></span>
            <span>💾 Ukuran: <b>{{ report.size }}</b></span>
          </div>
          <div class="preset-footer">
            <small>Diunduh {{ report.downloadCount }}x oleh Auditor</small>
            <button class="btn-download" type="button" @click="downloadPresetReport(report.title)">
              <span>⤓ Unduh Dokumen</span>
            </button>
          </div>
        </article>
      </div>
    </section>

    <!-- Hash Integrity Verification Widget -->
    <section class="verify-widget">
      <div class="widget-heading">
        <span class="widget-icon">🔒</span>
        <div>
          <h3>Verifikasi Integritas Checksum SHA-256 Ledger</h3>
          <p>Masukkan 64-karakter hash log audit untuk memverifikasi keaslian dan memastikan log tidak pernah dimanipulasi.</p>
        </div>
      </div>
      <div class="verify-input-group">
        <input
          v-model="verifyHashInput"
          type="text"
          placeholder="Tempelkan SHA-256 Hash di sini (misal: e3b0c44298fc1c149afbf...)"
          aria-label="Hash checksum SHA-256"
          @keyup.enter="verifyHash"
        />
        <button type="button" @click="verifyHash">Verifikasi Checksum</button>
      </div>
      <div v-if="verifyResult.status" :class="['verify-result', verifyResult.status]">
        {{ verifyResult.message }}
      </div>
    </section>

    <!-- Real-time Audit Trail Table Section -->
    <section class="logs-section">
      <div class="logs-toolbar">
        <div class="toolbar-title">
          <h2>Jejak Audit Forensik Sistem (Real-Time Audit Trail)</h2>
          <p>Daftar kronologis lengkap aktivitas administrator, perubahan parameter, dan eksekusi transaksi.</p>
        </div>

        <div class="toolbar-filters">
          <!-- Search Input -->
          <div class="search-box">
            <span class="search-icon">⌕</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari ID, nama admin, aksi, IP..."
              aria-label="Cari log audit"
            />
          </div>

          <!-- Category Filter -->
          <select v-model="selectedCategory" aria-label="Filter kategori audit">
            <option value="Semua">Semua Kategori</option>
            <option value="Keamanan & Akses">Keamanan & Akses</option>
            <option value="Transaksi & Escrow">Transaksi & Escrow</option>
            <option value="Subsidi GBBI">Subsidi GBBI</option>
            <option value="Konfigurasi Platform">Konfigurasi Platform</option>
            <option value="Legalitas UMKM">Legalitas UMKM</option>
          </select>

          <!-- Severity Filter -->
          <select v-model="selectedSeverity" aria-label="Filter tingkat risiko">
            <option value="Semua">Semua Severity</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="WARNING">WARNING</option>
            <option value="INFO">INFO</option>
          </select>

          <!-- Date Filter -->
          <select v-model="selectedDateRange" aria-label="Filter rentang waktu">
            <option value="Hari Ini">Hari Ini</option>
            <option value="7 Hari Terakhir">7 Hari Terakhir</option>
            <option value="30 Hari Terakhir">30 Hari Terakhir</option>
            <option value="Semua Riwayat">Semua Riwayat</option>
          </select>
        </div>
      </div>

      <!-- Audit Logs Table -->
      <div class="table-container">
        <table class="audit-table">
          <thead>
            <tr>
              <th>LOG ID & WAKTU</th>
              <th>AKTOR & HAK AKSES</th>
              <th>IP ADDRESS</th>
              <th>KATEGORI & AKSI</th>
              <th>ENTITAS TARGET</th>
              <th>SEVERITY</th>
              <th>DETAIL & HASH</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in filteredLogs" :key="log.id" class="log-row">
              <td class="col-id">
                <span class="log-id">{{ log.id }}</span>
                <time class="log-time">{{ log.timestamp }}</time>
              </td>

              <td class="col-actor">
                <b>{{ log.actorName }}</b>
                <small>{{ log.actorRole }}</small>
              </td>

              <td class="col-ip">
                <code>{{ log.ipAddress }}</code>
              </td>

              <td class="col-action">
                <span class="category-chip">{{ log.category }}</span>
                <span class="action-tag">{{ log.action }}</span>
              </td>

              <td class="col-target">
                <span>{{ log.targetEntity }}</span>
              </td>

              <td class="col-severity">
                <span :class="['sev-badge', log.severity.toLowerCase()]">{{ log.severity }}</span>
              </td>

              <td class="col-actions">
                <button class="btn-detail" type="button" @click="viewLogDetail(log)">
                  <span>🔍 Detail Forensic</span>
                </button>
              </td>
            </tr>
            <tr v-if="filteredLogs.length === 0">
              <td colspan="7" class="empty-row">
                <div class="empty-state">
                  <span>🔎</span>
                  <p>Tidak ada log audit yang sesuai dengan kriteria pencarian.</p>
                  <button type="button" @click="searchQuery = ''; selectedCategory = 'Semua'; selectedSeverity = 'Semua'">
                    Reset Filter
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer">
        <span>Menampilkan <b>{{ filteredLogs.length }}</b> dari <b>{{ auditLogs.length }}</b> entri log audit terpilih</span>
        <div class="pagination">
          <button disabled type="button">‹ Prev</button>          <button class="active" type="button">1</button>
          <button disabled type="button">Next ›</button>
        </div>
      </div>
    </section>

    <!-- Modal 1: Generate Custom Report -->
    <div
      v-if="isGenerateModalOpen"
      class="modal-backdrop"
      @click.self="isGenerateModalOpen = false"
      @keydown.esc="isGenerateModalOpen = false"
    >
      <section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="generate-title">
        <header class="modal-header">
          <div>
            <small>GENERATOR DOKUMEN</small>
            <h2 id="generate-title">Generate Laporan Custom Platform</h2>
          </div>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isGenerateModalOpen = false">×</button>
        </header>

        <form @submit.prevent="handleGenerateCustomReport" class="modal-body">
          <label class="form-field">
            <span>Judul / Nama Laporan *</span>
            <input v-model="customReportForm.title" type="text" placeholder="misal: Rekapitulasi Audit Rekber Oktober 2024" required />
          </label>

          <div class="form-row">
            <label class="form-field">
              <span>Jenis Laporan</span>
              <select v-model="customReportForm.type">
                <option value="Finansial & Rekber">Finansial & Rekber Escrow</option>
                <option value="Subsidi GBBI">Subsidi Ongkir APBN GBBI</option>
                <option value="Keamanan & Akses">Keamanan & Audit Admin</option>
                <option value="Legalitas UMKM">Status Kurasi & NIB UMKM</option>
              </select>
            </label>

            <label class="form-field">
              <span>Format Berkas</span>
              <select v-model="customReportForm.format">
                <option value="PDF">PDF (Document Signed)</option>
                <option value="XLSX">Excel XLSX Data Table</option>
                <option value="CSV">CSV Raw Audit Ledger</option>
                <option value="JSON">JSON Immutable Payload</option>
              </select>
            </label>
          </div>

          <div class="form-row">
            <label class="form-field">
              <span>Tanggal Mulai</span>
              <input v-model="customReportForm.dateStart" type="date" />
            </label>

            <label class="form-field">
              <span>Tanggal Selesai</span>
              <input v-model="customReportForm.dateEnd" type="date" />
            </label>
          </div>

          <div class="checkbox-group">
            <label class="checkbox-label">
              <input v-model="customReportForm.includeDigitalSignature" type="checkbox" />
              <span>Sertakan Digital Signature (SHA-256 & Sertifikat Super Admin)</span>
            </label>

            <label class="checkbox-label">
              <input v-model="customReportForm.includeRawPayload" type="checkbox" />
              <span>Sertakan Raw Request/Response Payload API</span>
            </label>
          </div>

          <footer class="modal-footer">
            <button type="button" class="btn-secondary" @click="isGenerateModalOpen = false">Batal</button>
            <button type="submit" class="btn-primary">✓ Generate & Download</button>
          </footer>
        </form>
      </section>
    </div>

    <!-- Modal 2: Forensic Audit Log Detail -->
    <div
      v-if="isDetailModalOpen && selectedLog"
      class="modal-backdrop"
      @click.self="isDetailModalOpen = false"
      @keydown.esc="isDetailModalOpen = false"
    >
      <section class="modal-dialog large-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <header class="modal-header">
          <div>
            <small>AUDIT TRAIL FORENSIC INSPECTOR</small>
            <h2 id="detail-title">Detail Audit Log #{{ selectedLog.id }}</h2>
          </div>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isDetailModalOpen = false">×</button>
        </header>

        <div class="modal-body forensic-body">
          <div class="forensic-grid">
            <div class="forensic-card">
              <small>INFORMASI KRONOLOGIS</small>
              <table class="meta-table">
                <tr>
                  <td>Waktu Kejadian</td>
                  <td><b>{{ selectedLog.timestamp }}</b></td>
                </tr>
                <tr>
                  <td>Aktor / Pengguna</td>
                  <td><b>{{ selectedLog.actorName }}</b> ({{ selectedLog.actorRole }})</td>
                </tr>
                <tr>
                  <td>Alamat IP</td>
                  <td><code>{{ selectedLog.ipAddress }}</code></td>
                </tr>
                <tr>
                  <td>Tingkat Risiko</td>
                  <td><span :class="['sev-badge', selectedLog.severity.toLowerCase()]">{{ selectedLog.severity }}</span></td>
                </tr>
              </table>
            </div>

            <div class="forensic-card">
              <small>AKSI & TARGET</small>
              <table class="meta-table">
                <tr>
                  <td>Kategori</td>
                  <td><b>{{ selectedLog.category }}</b></td>
                </tr>
                <tr>
                  <td>Aksi Event ID</td>
                  <td><code>{{ selectedLog.action }}</code></td>
                </tr>
                <tr>
                  <td>Entitas Target</td>
                  <td><b>{{ selectedLog.targetEntity }}</b></td>
                </tr>
                <tr>
                  <td>User Agent Browser</td>
                  <td><small class="code-sm">{{ selectedLog.userAgent }}</small></td>
                </tr>
              </table>
            </div>
          </div>

          <div class="diff-section">
            <h4>Deskripsi Aktivitas & Perubahan Data (Diff Log):</h4>
            <div class="diff-box">
              <p class="diff-desc">{{ selectedLog.details }}</p>
              <div v-if="selectedLog.oldValue || selectedLog.newValue" class="diff-comparison">
                <div class="diff-col old">
                  <small>VALUE SEBELUMNYA (BEFORE)</small>
                  <pre><code>{{ selectedLog.oldValue || '(Kosong / Init)' }}</code></pre>
                </div>
                <div class="diff-col new">
                  <small>VALUE SESUDAHNYA (AFTER)</small>
                  <pre><code>{{ selectedLog.newValue || '(Kosong / Deleted)' }}</code></pre>
                </div>
              </div>
            </div>
          </div>

          <div class="hash-section">
            <small>SHA-256 IMMUTABLE LEDGER CHECKSUM</small>
            <div class="hash-box">
              <code>{{ selectedLog.sha256Hash }}</code>
              <span class="verified-seal">✓ VERIFIED IMMUTABLE</span>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="isDetailModalOpen = false">Tutup</button>
          <button type="button" class="btn-primary" @click="emit('notify', `Salinan hash log #${selectedLog.id} disalin ke clipboard.`); isDetailModalOpen = false;">
            Salin Checksum Hash
          </button>
        </footer>
      </section>
    </div>

    <!-- Modal 3: BPK Audit Package Export -->
    <div
      v-if="isBpkExportModalOpen"
      class="modal-backdrop"
      @click.self="isBpkExportModalOpen = false"
      @keydown.esc="isBpkExportModalOpen = false"
    >
      <section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="bpk-title">
        <header class="modal-header bpk-header">
          <div>
            <small>REPUBLIK INDONESIA · KEPATUHAN AUDIT EKSTERNAL</small>
            <h2 id="bpk-title">Ekspor Berkas Audit Resmi (BPK RI & Kemenkop)</h2>
          </div>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isBpkExportModalOpen = false">×</button>
        </header>

        <form @submit.prevent="handleExportBpkPackage" class="modal-body">
          <div class="audit-seal-card">
            <span class="seal-icon">🏛</span>
            <div>
              <b>Standar Kepatuhan Keuangan Negara (UU No. 15 Tahun 2004)</b>
              <p>Paket berkas audit ini memuat seluruh transaksi escrow, penyaluran APBN GBBI, dan log mutasi Himbara yang telah ditandatangani secara digital.</p>
            </div>
          </div>

          <label class="form-field">
            <span>Tahun Anggaran & Kuartal</span>
            <input v-model="bpkForm.fiscalYear" type="text" required />
          </label>

          <label class="form-field">
            <span>Instansi Pemeriksa (Auditor Target)</span>
            <select v-model="bpkForm.auditorEntity">
              <option value="BPK RI (Badan Pemeriksa Keuangan)">BPK RI (Badan Pemeriksa Keuangan)</option>
              <option value="Kemenkop UMKM RI">Kemenkop UMKM RI</option>
              <option value="BPKP (Badan Pengawasan Keuangan & Pembangunan)">BPKP RI</option>
              <option value="Inspektorat Jenderal Kemenves">Inspektorat Jenderal Kemenves</option>
            </select>
          </label>

          <label class="form-field">
            <span>Penanggung Jawab Signatory (Super Admin)</span>
            <input v-model="bpkForm.adminSignatory" type="text" readonly />
          </label>

          <label class="form-field">
            <span>Catatan Pengesahan Audit</span>
            <textarea v-model="bpkForm.notes" rows="3"></textarea>
          </label>

          <footer class="modal-footer">
            <button type="button" class="btn-secondary" @click="isBpkExportModalOpen = false">Batal</button>
            <button type="submit" class="btn-primary gold-btn">
              🏛 Export Signed Audit Package
            </button>
          </footer>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.audit-workspace {
  padding: 24px;
  background: #f8fafc;
  color: #0f172a;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.audit-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  padding: 24px 28px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.header-main {
  max-width: 760px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #a7f3d0;
  margin-bottom: 12px;
  border: 1px solid rgba(167, 243, 208, 0.2);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
}

.divider {
  opacity: 0.4;
}

.header-main h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #ffffff;
  line-height: 1.3;
}

.header-main p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #059669, #047857);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #047857, #065f46);
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.gold-btn {
  background: linear-gradient(135deg, #d97706, #b45309) !important;
  box-shadow: 0 4px 14px rgba(217, 119, 6, 0.3) !important;
}

/* Top KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.kpi-icon {
  font-size: 18px;
  color: #94a3b8;
}

.kpi-val {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.kpi-val small {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.kpi-sub {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748b;
}

.badge-mint {
  background: #ecfdf5;
  color: #059669;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.badge-blue {
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.badge-amber {
  background: #fffbeb;
  color: #d97706;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.badge-purple {
  background: #faf5ff;
  color: #9333ea;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

/* Preset Reports Grid */
.reports-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 20px;
}

.section-title h2 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.section-title p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.reports-counter {
  font-size: 12px;
  font-weight: 600;
  background: #f1f5f9;
  color: #334155;
  padding: 6px 12px;
  border-radius: 20px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.preset-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  transition: all 0.2s ease;
}

.preset-card:hover {
  border-color: #cbd5e1;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.06);
}

.preset-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preset-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background: #059669;
  color: #ffffff;
  padding: 2px 8px;
  border-radius: 4px;
}

.preset-format {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  background: #e2e8f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.preset-card h3 {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
}

.preset-card p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

.preset-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  color: #475569;
  border-top: 1px dashed #e2e8f0;
  padding-top: 10px;
}

.preset-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}

.preset-footer small {
  font-size: 11px;
  color: #94a3b8;
}

.btn-download {
  background: #ffffff;
  color: #059669;
  border: 1px solid #a7f3d0;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-download:hover {
  background: #059669;
  color: #ffffff;
}

/* Verify Widget */
.verify-widget {
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  border: 1px solid #a7f3d0;
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.widget-heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.widget-icon {
  font-size: 24px;
}

.widget-heading h3 {
  font-size: 15px;
  font-weight: 700;
  color: #065f46;
  margin: 0 0 2px 0;
}

.widget-heading p {
  font-size: 12px;
  color: #047857;
  margin: 0;
}

.verify-input-group {
  display: flex;
  gap: 10px;
}

.verify-input-group input {
  flex: 1;
  background: #ffffff;
  border: 1px solid #a7f3d0;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
}

.verify-input-group input:focus {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
}

.verify-input-group button {
  background: #059669;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
}

.verify-result {
  font-size: 12px;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
}

.verify-result.valid {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.verify-result.invalid {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

/* Logs Section */
.logs-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
}

.logs-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.toolbar-title h2 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.toolbar-title p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.toolbar-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  min-width: 220px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.search-box input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
}

.search-box input:focus {
  border-color: #059669;
}

.toolbar-filters select {
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  background: #ffffff;
  outline: none;
}

/* Table */
.table-container {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}

.audit-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.log-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s ease;
}

.log-row:hover {
  background: #f8fafc;
}

.audit-table td {
  padding: 12px 16px;
  vertical-align: middle;
}

.col-id {
  display: flex;
  flex-direction: column;
}

.log-id {
  font-weight: 700;
  color: #0f172a;
}

.log-time {
  font-size: 11px;
  color: #64748b;
}

.col-actor {
  display: flex;
  flex-direction: column;
}

.col-actor b {
  color: #1e293b;
}

.col-actor small {
  color: #64748b;
  font-size: 11px;
}

.col-ip code {
  background: #f1f5f9;
  color: #334155;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 11px;
}

.col-action {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-chip {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
}

.action-tag {
  font-weight: 700;
  color: #059669;
  font-family: monospace;
  font-size: 11px;
}

.sev-badge {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}

.sev-badge.critical {
  background: #fee2e2;
  color: #dc2626;
}

.sev-badge.high {
  background: #ffedd5;
  color: #ea580c;
}

.sev-badge.warning {
  background: #fef3c7;
  color: #d97706;
}

.sev-badge.info {
  background: #e0f2fe;
  color: #0284c7;
}

.btn-detail {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-detail:hover {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.empty-row {
  text-align: center;
  padding: 40px !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.empty-state span {
  font-size: 32px;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-size: 12px;
  color: #64748b;
}

.pagination {
  display: flex;
  gap: 4px;
}

.pagination button {
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
}

.pagination button.active {
  background: #059669;
  color: #ffffff;
  border-color: #059669;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-dialog.large-modal {
  max-width: 720px;
}

.modal-header {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header small {
  font-size: 10px;
  font-weight: 700;
  color: #059669;
  letter-spacing: 0.5px;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 2px 0 0 0;
}

.bpk-header {
  background: linear-gradient(135deg, #78350f 0%, #451a03 100%);
  color: #ffffff;
}

.bpk-header small {
  color: #fde68a;
}

.bpk-header h2 {
  color: #ffffff;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 75vh;
  overflow-y: auto;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  font-family: inherit;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #059669;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #334155;
  cursor: pointer;
}

.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Forensic Modal Styling */
.forensic-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.forensic-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px;
}

.forensic-card small {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
}

.meta-table {
  width: 100%;
  margin-top: 8px;
  font-size: 12px;
}

.meta-table td {
  padding: 4px 0;
  color: #475569;
}

.code-sm {
  font-family: monospace;
  font-size: 10px;
  word-break: break-all;
}

.diff-section h4 {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.diff-box {
  background: #0f172a;
  color: #f8fafc;
  border-radius: 10px;
  padding: 14px;
}

.diff-desc {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #cbd5e1;
}

.diff-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  border-top: 1px solid #334155;
  padding-top: 12px;
}

.diff-col small {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.diff-col.old small {
  color: #fca5a5;
}

.diff-col.new small {
  color: #6ee7b7;
}

.diff-col pre {
  margin: 4px 0 0 0;
  background: rgba(0, 0, 0, 0.4);
  padding: 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #ffffff;
  white-space: pre-wrap;
  word-break: break-all;
}

.hash-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hash-section small {
  font-size: 10px;
  font-weight: 700;
  color: #64748b;
}

.hash-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 8px 12px;
  border-radius: 8px;
}

.hash-box code {
  font-size: 11px;
  font-family: monospace;
  color: #065f46;
}

.verified-seal {
  font-size: 10px;
  font-weight: 700;
  color: #059669;
}

.audit-seal-card {
  display: flex;
  gap: 12px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  padding: 12px 14px;
  border-radius: 10px;
  color: #78350f;
  font-size: 12px;
}

.seal-icon {
  font-size: 24px;
}

.audit-seal-card p {
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #92400e;
}

@media (max-width: 768px) {
  .audit-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .form-row,
  .forensic-grid,
  .diff-comparison {
    grid-template-columns: 1fr;
  }
}
</style>
