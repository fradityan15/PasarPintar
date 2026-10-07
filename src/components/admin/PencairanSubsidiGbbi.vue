<script setup lang="ts">
import { computed, ref } from 'vue'

export interface DisbursementRecord {
  id: string
  storeName: string
  ownerName: string
  bankInfo: string
  nominal: number
  subsidyPortion: string
  sourceInfo: string
  resiLogistics: string
  status: string
  statusTone: 'mint' | 'orange' | 'green' | 'red'
  slaText: string
  actionType: 'disburse' | 'verify' | 'receipt'
  isSelected: boolean
}

const emit = defineEmits<{ notify: [message: string] }>()

const activeTab = ref<'siap' | 'semua' | 'lunas' | 'verifikasi' | 'klaim'>('siap')
const search = ref('')
const selectedBank = ref('Semua Bank Tujuan')
const selectedType = ref('Semua Jenis Pencairan')
const selectedSla = ref('Semua SLA')

// Modals State
const showDisburseModal = ref(false)
const showAuditModal = ref(false)
const showQuotaModal = ref(false)
const selectedRecord = ref<DisbursementRecord | null>(null)

// Form state for quota update
const newQuotaPagu = ref(3500000000)
const newMaxSubsidyPerResi = ref(150000)

const records = ref<DisbursementRecord[]>([
  {
    id: 'disb-1',
    storeName: 'Koperasi Tani Sindoro Sejahtera',
    ownerName: 'Bambang Setyawan, S.P.',
    bankInfo: 'Bank BRI 0142-01-001928-53-4',
    nominal: 42850000,
    subsidyPortion: 'Termasuk Subsidi GBBI: Rp 2.450.000',
    sourceInfo: 'Hasil Pelepasan Escrow 18 Transaksi',
    resiLogistics: 'Logistik J&T Cargo (Cluster Jateng)',
    status: '✓ Siap Auto-Settlement Himbara',
    statusTone: 'mint',
    slaText: 'SLA: 42 menit (Tepat Waktu)',
    actionType: 'disburse',
    isSelected: true,
  },
  {
    id: 'disb-2',
    storeName: 'Sanggar Tenun Wolowaru',
    ownerName: 'Ibu Maria Klemens',
    bankInfo: 'Bank BNI 0412-****-331',
    nominal: 18500000,
    subsidyPortion: 'Afirmasi 3T Kargo Laut: Rp 1.850.000',
    sourceInfo: 'Hasil Sales Tenun 8 Transaksi',
    resiLogistics: 'Pos Indonesia (Afirmasi NTT)',
    status: '✓ Siap Auto-Settlement Himbara',
    statusTone: 'mint',
    slaText: 'SLA: 1.2 jam (Tepat Waktu)',
    actionType: 'disburse',
    isSelected: true,
  },
  {
    id: 'disb-3',
    storeName: 'Sambal Roa Dapur Oma Manado',
    ownerName: 'Oma Ratna Manado',
    bankInfo: 'Bank Mandiri 1400-****-012',
    nominal: 5400000,
    subsidyPortion: 'Voucher Promo GBBI: Rp 450.000',
    sourceInfo: 'Hasil Penjualan Sambal 14 Transaksi',
    resiLogistics: 'Lion Parcel (Manado Hub)',
    status: '⚠️ Perlu Re-Cek Nama Rekening',
    statusTone: 'orange',
    slaText: 'Nama di bank: "Ratna", Akta: "Oma Ratna"',
    actionType: 'verify',
    isSelected: false,
  },
  {
    id: 'disb-4',
    storeName: 'Madu Hutan Liar Siak Mandiri',
    ownerName: 'Agus Tani Siak',
    bankInfo: 'Bank Mandiri 1200-****-881',
    nominal: 14200000,
    subsidyPortion: 'Subsidi Kargo Air Freight: Rp 1.200.000',
    sourceInfo: 'Hasil Panen Madu 9 Transaksi',
    resiLogistics: 'JNE Express (Sentra Riau)',
    status: '✓ Lunas Transfer H2H',
    statusTone: 'green',
    slaText: 'Ref: TRX-H2H-8823910 (09:15 WIB)',
    actionType: 'receipt',
    isSelected: false,
  },
])

const clusters3T = [
  { region: 'NTT: Ende, Ngada, Alor', absorbed: 842000000, total: 1000000000, pct: 84.2, resiCount: 3420 },
  { region: 'Maluku & Malut: Tual, Seram, Morotai', absorbed: 620000000, total: 750000000, pct: 82.7, resiCount: 2890 },
  { region: 'Papua Pegunungan: Jayawijaya, Wamena', absorbed: 710000000, total: 800000000, pct: 88.8, resiCount: 3110 },
  { region: 'Riau & Kepri: Kep. Meranti, Natuna, Anambas', absorbed: 482000000, total: 600000000, pct: 80.3, resiCount: 2140 },
  { region: 'Sulteng: Banggai Laut, Morowali', absorbed: 300000000, total: 350000000, pct: 85.7, resiCount: 1280 },
]

const bankDistribution = [
  { name: 'Bank Rakyat Indonesia (BRI)', code: 'BRI', amount: 640200000, pct: '56.1%', badge: 'API H2H Online', tone: 'mint' },
  { name: 'Bank Mandiri', code: 'MANDIRI', amount: 280500000, pct: '24.6%', badge: 'API H2H Online', tone: 'mint' },
  { name: 'Bank Negara Indonesia (BNI)', code: 'BNI', amount: 140770000, pct: '12.3%', badge: 'Verified', tone: 'blue' },
  { name: 'Bank Central Asia (BCA)', code: 'BCA', amount: 79000000, pct: '6.9%', badge: 'Clearing Fast', tone: 'green' },
]

const filteredRecords = computed(() => {
  const q = search.value.trim().toLocaleLowerCase('id')
  return records.value.filter((r) => {
    const matchesSearch =
      !q ||
      `${r.storeName} ${r.ownerName} ${r.bankInfo} ${r.resiLogistics}`
        .toLocaleLowerCase('id')
        .includes(q)

    let matchesTab = true
    if (activeTab.value === 'siap') matchesTab = r.actionType === 'disburse'
    else if (activeTab.value === 'lunas') matchesTab = r.actionType === 'receipt'
    else if (activeTab.value === 'verifikasi') matchesTab = r.actionType === 'verify'

    const matchesBank = selectedBank.value === 'Semua Bank Tujuan' || r.bankInfo.includes(selectedBank.value)
    return matchesSearch && matchesTab && matchesBank
  })
})

const selectedItems = computed(() => filteredRecords.value.filter((r) => r.isSelected))
const allSelected = computed(
  () => filteredRecords.value.length > 0 && filteredRecords.value.every((r) => r.isSelected)
)

function notify(msg: string) {
  emit('notify', msg)
}

function toggleSelectAll() {
  const target = !allSelected.value
  filteredRecords.value.forEach((r) => {
    r.isSelected = target
  })
}

function disburseSingle(rec: DisbursementRecord) {
  selectedRecord.value = rec
  showDisburseModal.value = true
}

function confirmDisburseSingle() {
  if (!selectedRecord.value) return
  selectedRecord.value.actionType = 'receipt'
  selectedRecord.value.status = '✓ Lunas Transfer H2H'
  selectedRecord.value.statusTone = 'green'
  selectedRecord.value.slaText = `Ref: TRX-H2H-${Math.floor(1000000 + Math.random() * 9000000)} (${new Date().toLocaleTimeString('id-ID')} WIB)`
  notify(`✓ Pencairan Rp ${selectedRecord.value.nominal.toLocaleString('id-ID')} ke ${selectedRecord.value.storeName} BERHASIL ditransfer!`)
  showDisburseModal.value = false
}

function disburseMassal() {
  const count = selectedItems.value.length
  if (count === 0) return
  selectedItems.value.forEach((r) => {
    r.actionType = 'receipt'
    r.status = '✓ Lunas Transfer H2H'
    r.statusTone = 'green'
    r.isSelected = false
  })
  notify(`✓ ${count} pengajuan pencairan saldo berhasil dieksekusi massal via Bank Himbara H2H!`)
}

function inspectAudit(rec: DisbursementRecord) {
  selectedRecord.value = rec
  showAuditModal.value = true
}

function saveQuotaSettings() {
  showQuotaModal.value = false
  notify(`✓ Kuota Pagu APBN Subsidi GBBI diperbarui menjadi Rp ${newQuotaPagu.value.toLocaleString('id-ID')}!`)
}
</script>

<template>
  <div class="disbursement-gbbi-content">
    <!-- Header Section -->
    <header class="page-heading">
      <div class="heading-copy">
        <div class="admin-breadcrumb">
          ADMIN CONSOLE &nbsp;›&nbsp; <b>PENCAIRAN &amp; SUBSIDI GBBI</b>
        </div>
        <h1>Pencairan Saldo UMKM &amp; Subsidi GBBI</h1>
      </div>

      <div class="heading-actions">
        <select class="filter-select export-dropdown" aria-label="Opsi Ekspor" @change="(e: Event) => { notify('Mengunduh laporan penyerapan...'); (e.target as HTMLSelectElement).value = ''; }">
          <option value="" disabled selected>Ekspor ▾</option>
          <option value="pdf">Laporan Penyerapan PDF</option>
          <option value="pagu">Konfigurasi Kuota 3T</option>
        </select>
        <button type="button" class="btn-primary" @click="disburseMassal">
          ＋ Pencairan Massal
        </button>
      </div>
    </header>

    <!-- GBBI Allocation Banner -->
    <section class="gbbi-banner">
      <div class="banner-body">
        <div class="banner-title-row">
          <h2>Pagu Subsidi GBBI Q4: Terserap 84.4% (Rata-rata pencairan 1.8 jam)</h2>
        </div>
      </div>
      <div class="banner-actions">
        <button type="button" class="btn-check-pagu" @click="showQuotaModal = true">
          Cek Pagu →
        </button>
      </div>
    </section>

    <!-- Stat Metrics Grid -->
    <section class="summary-stats-grid">
      <article class="stat-card" title="Pagu APBN Q4 2024">
        <div class="stat-header">
          <span class="stat-title">TOTAL ALOKASI SUBSIDI GBBI</span>
        </div>
        <strong class="stat-value">Rp 3.500.000.000</strong>
        <div class="stat-footer-row">
          <span class="delta-pill mint">84.4% Terserap</span>
        </div>
      </article>

      <article class="stat-card" title="12.840 Resi Afirmasi">
        <div class="stat-header">
          <span class="stat-title">REALISASI SUBSIDI KARGO 3T</span>
        </div>
        <strong class="stat-value">Rp 2.954.000.000</strong>
        <div class="stat-footer-row">
          <span class="delta-pill green">+16.2% MoM</span>
        </div>
      </article>

      <article class="stat-card" title="11.940 Rekening Seller">
        <div class="stat-header">
          <span class="stat-title">SALDO UMKM DICAIRKAN</span>
        </div>
        <strong class="stat-value">Rp 1.140.470.000</strong>
        <div class="stat-footer-row">
          <span class="delta-pill mint">100% Lunas Escrow</span>
        </div>
      </article>

      <article class="stat-card" title="18 Pengajuan Seller">
        <div class="stat-header">
          <span class="stat-title">PENCAIRAN MENUNGGU OTORISASI</span>
        </div>
        <strong class="stat-value">Rp 68.500.000</strong>
        <div class="stat-footer-row">
          <span class="delta-pill orange">SLA &lt; 2 Jam</span>
        </div>
      </article>
    </section>

    <!-- 2-Column Middle Grid -->
    <div class="middle-grid">
      <!-- Left: Realization 3T Clusters -->
      <section class="chart-card">
        <header class="card-header">
          <div>
            <h2>Realisasi Subsidi Kargo per Kluster Wilayah 3T</h2>
          </div>
        </header>

        <div class="cluster-progress-list">
          <div v-for="c in clusters3T" :key="c.region" class="cluster-row">
            <div class="cluster-title-row">
              <b>{{ c.region }}</b>
              <span>Rp {{ (c.absorbed / 1000000).toFixed(0) }}jt / Rp {{ (c.total / 1000000).toFixed(0) }}jt (<strong>{{ c.pct }}%</strong>)</span>
            </div>

            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: c.pct + '%' }"></div>
            </div>
            <small class="resi-count">{{ c.resiCount.toLocaleString('id-ID') }} Resi Kargo Afirmasi Terbit</small>
          </div>
        </div>

        <footer class="chart-footer">
          <span>⚡ Kuota Afirmasi 3T Diperbarui Setiap Hari Pukul 00:00 WIB</span>
        </footer>
      </section>

      <!-- Right: Himbara Bank Distribution -->
      <aside class="accounts-card">
        <header class="card-header compact">
          <div>
            <h2>Distribusi Bank Pencairan Saldo Seller</h2>
          </div>
        </header>

        <div class="bank-list">
          <div v-for="b in bankDistribution" :key="b.name" class="bank-item">
            <div class="bank-item-header">
              <div class="bank-name">
                <span class="bank-code-tag" :class="b.code.toLowerCase()">{{ b.code }}</span>
                <b>{{ b.name }}</b>
              </div>
              <strong class="bank-amount">Rp {{ b.amount.toLocaleString('id-ID') }}</strong>
            </div>
            <div class="bank-item-sub">
              <span class="share-pct">Pangsa: {{ b.pct }}</span>
              <span class="status-badge" :class="b.tone">● {{ b.badge }}</span>
            </div>
          </div>
        </div>

        <button type="button" class="btn-link-footer" @click="notify('Latency log gateway Himbara H2H dibuka.')">
          Lihat SLA & Latensi Gateway Bank →
        </button>
      </aside>
    </div>

    <!-- Main Operational Table Container -->
    <section class="table-container">
      <nav class="table-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'siap' }"
          @click="activeTab = 'siap'"
        >
          Siap Dicairkan <span class="badge-count-orange">18</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'semua' }"
          @click="activeTab = 'semua'"
        >
          Semua Pengajuan <small>(345)</small>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'lunas' }"
          @click="activeTab = 'lunas'"
        >
          Berhasil Lunas <small>(312)</small>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'verifikasi' }"
          @click="activeTab = 'verifikasi'"
        >
          Perlu Verifikasi Ulang <small>(11)</small>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'klaim' }"
          @click="activeTab = 'klaim'"
        >
          Klaim Subsidi GBBI <small>(4)</small>
        </button>
      </nav>

      <div class="search-filter-bar">
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="search"
            type="search"
            placeholder="Cari toko UMKM, nama pemilik, bank, resi, atau invoice..."
            aria-label="Cari pengajuan pencairan"
          />
        </div>

        <select v-model="selectedBank" class="filter-select" aria-label="Filter Bank">
          <option value="Semua Bank Tujuan">Semua Bank Tujuan</option>
          <option value="BRI">Bank BRI</option>
          <option value="BNI">Bank BNI</option>
          <option value="Mandiri">Bank Mandiri</option>
          <option value="BCA">Bank BCA</option>
        </select>

        <select v-model="selectedType" class="filter-select" aria-label="Jenis Pencairan">
          <option value="Semua Jenis Pencairan">Semua Jenis Pencairan</option>
          <option value="Escrow">Saldo Penjualan Escrow</option>
          <option value="Subsidi">Klaim Subsidi Ongkir 3T</option>
        </select>

        <select v-model="selectedSla" class="filter-select" aria-label="Status SLA">
          <option value="Semua SLA">Semua Status SLA</option>
          <option value="Tepat Waktu">Tepat Waktu (&lt; 2 Jam)</option>
          <option value="Warning">SLA Warning</option>
        </select>

        <div class="table-actions-right">
          <button type="button" class="btn-massal" :disabled="selectedItems.length === 0" @click="disburseMassal">
            ✓ Cairkan Terpilih ({{ selectedItems.length }})
          </button>
          <button type="button" class="btn-refresh" title="Segarkan" @click="notify('Data pencairan diperbarui.')">
            ↻
          </button>
        </div>
      </div>

      <!-- Main Table -->
      <div class="table-responsive">
        <table class="disbursement-table">
          <thead>
            <tr>
              <th class="col-check">
                <input type="checkbox" :checked="allSelected" aria-label="Pilih Semua" @change="toggleSelectAll" />
              </th>
              <th>UMKM / TOKO & REKENING TUJUAN</th>
              <th>NOMINAL SALDO & SUBSIDI</th>
              <th>SUMBER DANA & RESI LOGISTIK</th>
              <th>STATUS VERIFIKASI & SLA</th>
              <th class="text-right">AKSI OPERASIONAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rec in filteredRecords" :key="rec.id" :class="{ 'is-selected': rec.isSelected }">
              <td class="col-check">
                <input type="checkbox" v-model="rec.isSelected" :aria-label="`Pilih ${rec.storeName}`" />
              </td>
              <td>
                <div class="store-cell">
                  <b class="store-title">{{ rec.storeName }}</b>
                  <small>Pemilik: {{ rec.ownerName }}</small>
                  <code class="bank-code">{{ rec.bankInfo }}</code>
                </div>
              </td>
              <td>
                <div class="nominal-cell">
                  <strong class="nominal-val">Rp {{ rec.nominal.toLocaleString('id-ID') }}</strong>
                  <small class="subsidy-portion">{{ rec.subsidyPortion }}</small>
                </div>
              </td>
              <td>
                <div class="source-cell">
                  <span>{{ rec.sourceInfo }}</span>
                  <small>🚚 {{ rec.resiLogistics }}</small>
                </div>
              </td>
              <td>
                <div class="status-cell">
                  <span
                    class="status-badge"
                    :class="{
                      mint: rec.statusTone === 'mint',
                      orange: rec.statusTone === 'orange',
                      green: rec.statusTone === 'green',
                    }"
                  >
                    {{ rec.status }}
                  </span>
                  <small class="sla-info">{{ rec.slaText }}</small>
                </div>
              </td>
              <td class="text-right">
                <div class="action-cell">
                  <button
                    v-if="rec.actionType === 'disburse'"
                    type="button"
                    class="btn-disburse"
                    @click="disburseSingle(rec)"
                  >
                    Cairkan Sekarang
                  </button>
                  <button
                    v-else-if="rec.actionType === 'verify'"
                    type="button"
                    class="btn-verify"
                    @click="inspectAudit(rec)"
                  >
                    Verifikasi Ulang
                  </button>
                  <button
                    v-else
                    type="button"
                    class="btn-receipt"
                    @click="notify(`Bukti transfer H2H untuk ${rec.storeName} diunduh.`)"
                  >
                    ✓ Bukti Transfer
                  </button>
                  <button type="button" class="btn-sub-action" @click="inspectAudit(rec)">
                    Detail Audit
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredRecords.length === 0">
              <td colspan="6" class="empty-table">
                Tidak ada pengajuan pencairan saldo yang sesuai dengan filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="table-pagination">
        <span>Menampilkan 1 - {{ filteredRecords.length }} dari 18 pengajuan pencairan saldo antrean</span>

        <div class="pagination-buttons">
          <button type="button" disabled>‹</button>
          <button type="button" class="active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>...</span>
          <button type="button">18</button>
          <button type="button">›</button>
        </div>
      </footer>
    </section>

    <!-- Bottom Section: Protocol & H2H Log -->
    <div class="bottom-grid">
      <!-- Compliance Protocol Card -->
      <article class="protocol-card">
        <header class="card-header compact">
          <span class="protocol-icon">🛡</span>
          <div>
            <h2>Ketentuan Subsidi Afirmasi GBBI & APBN Q4</h2>
            <p>Standar Otorisasi & Verifikasi Kelayakan Klaim Kargo 3T</p>
          </div>
        </header>

        <p class="protocol-text">
          Fasilitasi diskon dan pembebanan ongkos kirim kargo 3T ditanggung bersama oleh Kementerian Koperasi & UMKM RI, Kementerian BUMN, dan Platform PasarPintar. Seluruh klaim wajib melampirkan resi valid logistik mitra.
        </p>

        <div class="protocol-tags">
          <span class="tag-pill">✓ Terverifikasi APBN GBBI</span>
          <span class="tag-pill">SLA Bank Himbara &lt; 4 Jam</span>
          <span class="tag-pill">Audit BPK & BPKP Registered</span>
        </div>
      </article>

      <!-- H2H Log Card -->
      <article class="h2h-log-card">
        <header class="card-header compact">
          <span class="live-dot"></span>
          <div>
            <h2>Log Settlement H2H Himbara Realtime</h2>
            <p>Audit Trail Auto-Disbursement Server Pusat</p>
          </div>
        </header>

        <div class="log-items">
          <div class="log-item">
            <b>BRI Host-to-Host Batch #401 (320 Rekening)</b>
            <div class="log-meta">
              <span>Total: Rp 480.200.000</span>
              <strong class="success-text">Status: SUCCESS</strong>
            </div>
          </div>

          <div class="log-item">
            <b>Mandiri Host-to-Host Batch #400 (140 Rekening)</b>
            <div class="log-meta">
              <span>Total: Rp 210.500.000</span>
              <strong class="success-text">Status: SUCCESS</strong>
            </div>
          </div>
        </div>

        <button type="button" class="btn-log-link" @click="notify('Audit log lengkap pencairan saldo dimuat.')">
          Lihat Audit Log Keuangan Lengkap →
        </button>
      </article>
    </div>

    <!-- Single Disbursement Modal -->
    <div v-if="showDisburseModal && selectedRecord" class="modal-backdrop" @click.self="showDisburseModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>OTORISASI PENCAIRAN</small>
            <h2>Eksekusi Pencairan Saldo UMKM</h2>
          </div>
          <button type="button" class="close-btn" @click="showDisburseModal = false">×</button>
        </header>

        <div class="modal-body">
          <p>Anda akan mencairkan dana saldo escrow ke rekening mitra penjual:</p>
          <div class="confirm-box">
            <div><strong>Toko UMKM:</strong> {{ selectedRecord.storeName }}</div>
            <div><strong>Nama Pemilik:</strong> {{ selectedRecord.ownerName }}</div>
            <div><strong>Rekening Tujuan:</strong> <code>{{ selectedRecord.bankInfo }}</code></div>
            <div><strong>Nominal Disbursed:</strong> <span class="green-text">Rp {{ selectedRecord.nominal.toLocaleString('id-ID') }}</span></div>
            <div><strong>Rincian Subsidi:</strong> {{ selectedRecord.subsidyPortion }}</div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="showDisburseModal = false">Batal</button>
          <button type="button" class="btn-primary" @click="confirmDisburseSingle">Transfer Himbara H2H Now</button>
        </footer>
      </div>
    </div>

    <!-- Audit Detail Modal -->
    <div v-if="showAuditModal && selectedRecord" class="modal-backdrop" @click.self="showAuditModal = false">
      <div class="modal-dialog audit-dialog">
        <header class="modal-header">
          <div>
            <small>AUDIT FINANSIAL & SUBSIDI</small>
            <h2>Detail Audit #{{ selectedRecord.storeName }}</h2>
          </div>
          <button type="button" class="close-btn" @click="showAuditModal = false">×</button>
        </header>

        <div class="modal-body">
          <div class="audit-details">
            <p><strong>Sumber Dana:</strong> {{ selectedRecord.sourceInfo }}</p>
            <p><strong>Nomor Resi & Ekspedisi:</strong> {{ selectedRecord.resiLogistics }}</p>
            <p><strong>Pencocokan Nama Bank:</strong> {{ selectedRecord.slaText }}</p>
            <p><strong>Pagu Subsidi GBBI:</strong> {{ selectedRecord.subsidyPortion }}</p>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-primary" @click="showAuditModal = false">Tutup Audit</button>
        </footer>
      </div>
    </div>

    <!-- Quota Config Modal -->
    <div v-if="showQuotaModal" class="modal-backdrop" @click.self="showQuotaModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>KONFIGURASI APBN GBBI</small>
            <h2>Pengaturan Pagu & Subsidi Ongkir 3T</h2>
          </div>
          <button type="button" class="close-btn" @click="showQuotaModal = false">×</button>
        </header>

        <form @submit.prevent="saveQuotaSettings">
          <label class="form-group">
            <span>Total Pagu Alokasi APBN Q4 (Rp) *</span>
            <input v-model.number="newQuotaPagu" type="number" step="100000000" min="100000000" />
          </label>

          <label class="form-group">
            <span>Plafon Maksimum Subsidi per Resi Kargo (Rp) *</span>
            <input v-model.number="newMaxSubsidyPerResi" type="number" step="5000" min="10000" />
          </label>

          <footer class="modal-footer">
            <button type="button" class="btn-cancel" @click="showQuotaModal = false">Batal</button>
            <button type="submit" class="btn-primary">Simpan Konfigurasi Pagu</button>
          </footer>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.disbursement-gbbi-content {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 24px 28px 36px;
  color: #0f172a;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  font-size: 13.5px;
  line-height: 1.5;
}

.disbursement-gbbi-content * {
  box-sizing: border-box;
}

.disbursement-gbbi-content button,
.disbursement-gbbi-content input,
.disbursement-gbbi-content select {
  font-family: inherit;
}

.disbursement-gbbi-content button {
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 4px 10px;
  border-radius: 6px;
  color: #64748b;
  background: #f1f5f9;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
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

.btn-outline {
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 6px;
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

.btn-icon {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
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

/* Banner */
.gbbi-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  padding: 16px 20px;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  background: #ecfdf5;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.05);
}

.banner-icon-wrap {
  width: 44px;
  height: 44px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #059669;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);
}

.flag-icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.banner-body {
  flex: 1;
  min-width: 0;
}

.banner-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-title-row h2 {
  margin: 0;
  color: #065f46;
  font-size: 15px;
  font-weight: 800;
}

.pill-matched {
  padding: 3px 8px;
  border-radius: 6px;
  color: #047857;
  background: #d1fae5;
  font-size: 10px;
  font-weight: 800;
}

.banner-body p {
  margin: 4px 0 0;
  color: #047857;
  font-size: 12.5px;
}

.banner-sla-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex: none;
}

.banner-sla-info small {
  color: #047857;
  font-size: 11px;
}

.btn-check-pagu {
  padding: 6px 12px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  color: #065f46;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
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
  margin-bottom: 8px;
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
.stat-icon-wrap.green { color: #16a34a; background: #f0fdf4; }
.stat-icon-wrap.orange { color: #ea580c; background: #fff7ed; }

.stat-value {
  display: block;
  color: #0f172a;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.3px;
  margin-bottom: 6px;
}

.stat-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.stat-footer-row small {
  color: #64748b;
  font-size: 11px;
}

.delta-pill {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
}

.delta-pill.mint { color: #047857; background: #d1fae5; }
.delta-pill.green { color: #15803d; background: #dcfce7; }
.delta-pill.orange { color: #c2410c; background: #ffedd5; }

/* Middle Grid */
.middle-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 20px;
  margin-bottom: 22px;
}

.chart-card,
.accounts-card {
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

.card-header.compact { align-items: center; }

.card-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.card-header p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 12px;
}

.cluster-progress-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.cluster-row {
  font-size: 12px;
}

.cluster-title-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.cluster-title-row b { color: #0f172a; }
.cluster-title-row span { color: #64748b; }
.cluster-title-row strong { color: #059669; }

.progress-bar {
  height: 7px;
  border-radius: 4px;
  background: #f1f5f9;
  overflow: hidden;
  margin-bottom: 3px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  background: #059669;
}

.resi-count {
  color: #64748b;
  font-size: 10.5px;
}

.chart-footer {
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 11.5px;
}

/* Bank List */
.bank-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.bank-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.bank-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.bank-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bank-code-tag {
  padding: 2px 6px;
  border-radius: 4px;
  color: #ffffff;
  background: #0f172a;
  font-size: 9px;
  font-weight: 900;
}

.bank-code-tag.bri { background: #00529c; }
.bank-code-tag.mandiri { background: #002d62; }
.bank-code-tag.bni { background: #f26522; }
.bank-code-tag.bca { background: #0060af; }

.bank-name b {
  color: #0f172a;
  font-size: 12.5px;
}

.bank-amount {
  color: #059669;
  font-size: 13.5px;
}

.bank-item-sub {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
}

.share-pct { color: #64748b; }
.status-badge { font-weight: 700; }
.status-badge.mint { color: #047857; }
.status-badge.blue { color: #0284c7; }
.status-badge.green { color: #16a34a; }

.btn-link-footer {
  width: 100%;
  padding: 8px 0;
  border: 0;
  color: #047857;
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

/* Main Table */
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

.badge-count-orange {
  padding: 2px 6px;
  border-radius: 10px;
  color: #ffffff;
  background: #ea580c;
  font-size: 10px;
  font-weight: 800;
}

.search-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap;
}

.search-input-wrap {
  flex: 1;
  min-width: 240px;
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

.filter-select {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  background: #ffffff;
  font-size: 12px;
  outline: 0;
}

.table-actions-right {
  display: flex;
  gap: 8px;
}

.btn-massal {
  padding: 8px 12px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #047857;
  font-size: 11.5px;
  font-weight: 700;
}

.btn-massal:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Disbursement Table */
.table-responsive {
  overflow-x: auto;
}

.disbursement-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12.5px;
}

.disbursement-table th {
  padding: 10px 14px;
  color: #64748b;
  background: #f8fafc;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.disbursement-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.col-check { width: 36px; text-align: center; }

.disbursement-table tr.is-selected td {
  background: #f0fdf4;
}

.store-title {
  display: block;
  color: #0f172a;
  font-size: 13px;
}

.store-cell small {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.bank-code {
  color: #059669;
  font-size: 11px;
}

.nominal-val {
  display: block;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}

.subsidy-portion {
  color: #059669;
  font-size: 11px;
  font-weight: 700;
}

.source-cell span {
  display: block;
  color: #0f172a;
}

.source-cell small {
  color: #64748b;
  font-size: 11px;
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.status-badge.mint { color: #047857; background: #ecfdf5; }
.status-badge.orange { color: #c2410c; background: #fff7ed; }
.status-badge.green { color: #15803d; background: #f0fdf4; }

.sla-info {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 10.5px;
}

.action-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.btn-disburse {
  padding: 6px 12px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #047857;
  font-size: 11.5px;
  font-weight: 700;
}

.btn-verify {
  padding: 6px 12px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #ea580c;
  font-size: 11.5px;
  font-weight: 700;
}

.btn-receipt {
  padding: 4px 8px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  color: #047857;
  background: #ecfdf5;
  font-size: 11px;
  font-weight: 700;
}

.btn-sub-action {
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 10.5px;
}

.empty-table {
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

/* Bottom Grid */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.protocol-card,
.h2h-log-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.protocol-icon { font-size: 18px; }

.protocol-text {
  color: #475569;
  font-size: 11.5px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.protocol-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pill {
  padding: 4px 8px;
  border-radius: 6px;
  color: #047857;
  background: #ecfdf5;
  font-size: 11px;
  font-weight: 700;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.log-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.log-item {
  padding: 8px 10px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  font-size: 11.5px;
}

.log-item b {
  color: #0f172a;
}

.log-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
  color: #64748b;
  font-size: 11px;
}

.success-text { color: #059669; }

.btn-log-link {
  border: 0;
  background: transparent;
  color: #047857;
  font-weight: 800;
  font-size: 12px;
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

.modal-body {
  margin-bottom: 20px;
  font-size: 13px;
  color: #334155;
}

.confirm-box, .audit-details {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-weight: 700;
}

.form-group input, .form-group select, .form-group textarea {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12.5px;
  outline: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
  .bottom-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .page-heading { flex-direction: column; }
  .gbbi-banner { flex-direction: column; align-items: flex-start; }
  .summary-stats-grid { grid-template-columns: 1fr; }
}
</style>
