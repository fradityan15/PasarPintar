<script setup lang="ts">
import { computed, ref } from 'vue'

export interface CurationProduct {
  id: string
  sku: string
  name: string
  stock: string
  sellerName: string
  sellerRegency: string
  category: string
  sentraLocation: string
  nib: string
  nibValid: boolean
  halal: string
  pirtOrBpom: string
  legalNotes?: string
  score: number
  gradeLabel: string
  scoreTone: 'mint' | 'green' | 'orange' | 'red'
  curatorStatus: string
  curatorStatusTone: 'mint' | 'orange' | 'red'
  curatorNote: string
  badgeOnImage: string
  badgeTone: 'mint' | 'orange' | 'red' | 'teal'
  imageUrl: string
  statusGroup: 'antrean' | 'terkurasi' | 'revisi' | 'ditolak'
  isSelected: boolean
}

const emit = defineEmits<{ notify: [message: string] }>()

const activeTab = ref<'antrean' | 'semua' | 'terkurasi' | 'revisi' | 'ditolak'>('antrean')
const search = ref('')
const selectedCommodity = ref('Semua Komoditas')
const selectedRegion = ref('Semua Sentra Daerah')
const selectedCertification = ref('Status Sertifikasi')
const selectedQualityScore = ref('Skor Kurasi Mutu')

// Modals State
const showAiBatchModal = ref(false)
const isAiAnalyzing = ref(false)
const aiAnalysisProgress = ref(0)

const showInspectModal = ref(false)
const selectedInspectProduct = ref<CurationProduct | null>(null)

const showRevisionModal = ref(false)
const revisionReason = ref('')

const products = ref<CurationProduct[]>([
  {
    id: 'prod-1',
    sku: 'PP-HUT-MDU-771',
    name: 'Madu Hutan Akasia Liar...',
    stock: '240 Jar',
    sellerName: 'Kayuputih Tani Sejahtera',
    sellerRegency: 'Kab. Siak, Riau',
    category: 'Herbal & Nutrisi Alami',
    sentraLocation: 'Sentra Riau Daratan',
    nib: '19.20.10.420 (Kemenkop)',
    nibValid: true,
    halal: '120441400282922',
    pirtOrBpom: 'P-IRT: S-PIRT 4.12/04/SLK (Lic. OK)',
    legalNotes: '',
    score: 96,
    gradeLabel: 'Grade A+',
    scoreTone: 'mint',
    curatorStatus: '✓ Arus Produk Baik',
    curatorStatusTone: 'mint',
    curatorNote: 'Klaim nutrisi standar pangan higienis. Kemasan botol kaca food-grade.',
    badgeOnImage: 'RAW HONEY',
    badgeTone: 'mint',
    imageUrl: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=200&q=80',
    statusGroup: 'antrean',
    isSelected: true,
  },
  {
    id: 'prod-2',
    sku: 'PP-KOP-RBT-002',
    name: 'Kopi Robusta Sindoro...',
    stock: '850 Pck',
    sellerName: 'Koperasi Tani Sindoro',
    sellerRegency: 'Kab. Temanggung',
    category: 'Kopi Nusantara',
    sentraLocation: 'Lereng Gunung Sindoro, Jateng',
    nib: '',
    nibValid: false,
    halal: '33044100084524',
    pirtOrBpom: 'P-IRT: 210332301248-26',
    legalNotes: 'Cupping Score: 83.50 (SCA Standard)',
    score: 92,
    gradeLabel: 'Unggulan',
    scoreTone: 'green',
    curatorStatus: '✓ Narasi Produk Teruji',
    curatorStatusTone: 'mint',
    curatorNote: 'Sertifikat indikasi geografis terlampir. Uji organoleptik aroma fermentasi melati khas Temanggung.',
    badgeOnImage: 'ORGANIC',
    badgeTone: 'orange',
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=200&q=80',
    statusGroup: 'antrean',
    isSelected: true,
  },
  {
    id: 'prod-3',
    sku: 'PP-HBL-MNT-041',
    name: 'Minyak Balur Herbal...',
    stock: '60 Botol',
    sellerName: 'Sentra Jamu Bali Alami',
    sellerRegency: 'Kab. Gianyar',
    category: 'Perawatan Herbal & Jamu',
    sentraLocation: 'Sentra Gianyar, Bali',
    nib: '',
    nibValid: false,
    halal: 'Izin Usaha: Jamu (UMOT)',
    pirtOrBpom: 'BPOM: TR193601241 (OBAT TRADISIONAL)',
    legalNotes: '⚠️ Klaim Terapeutik Bermasalah',
    score: 78,
    gradeLabel: 'Evaluasi',
    scoreTone: 'orange',
    curatorStatus: '⚠️ Potensi Overclaim',
    curatorStatusTone: 'orange',
    curatorNote: 'Terdapat klaim medis penyembuhan penyakit kronis instan pada foto banner. Wajib merevisi foto & deskripsi sebelum rilis.',
    badgeOnImage: 'REVISI BOTTLE',
    badgeTone: 'red',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&q=80',
    statusGroup: 'antrean',
    isSelected: false,
  },
  {
    id: 'prod-4',
    sku: 'PP-TNN-END-112',
    name: 'Kain Tenun Ikat Ende...',
    stock: 'Dimensi: 220 x 110 cm',
    sellerName: 'Sanggar Tenun Wolowaru',
    sellerRegency: 'Kab. Ende, NTT',
    category: 'Wastra & Tenun Kriya',
    sentraLocation: 'Sentra Wolowaru, Flores',
    nib: '',
    nibValid: false,
    halal: '✓ Pewarna Alami Teruji Kemenkeu',
    pirtOrBpom: 'Sertifikasi IG: BKN-Kemenkumham',
    legalNotes: 'Pewarna Alami Ekstrak Daun Nila/Mengkudu',
    score: 98,
    gradeLabel: 'Masterpiece',
    scoreTone: 'mint',
    curatorStatus: '✓ Rekomendasi Utama',
    curatorStatusTone: 'mint',
    curatorNote: 'Karya 100% tenun ikat tangan lokal, diproduksi oleh perajin wanita desa Ende. Nilai historis dan estetika sangat tinggi.',
    badgeOnImage: 'TENUN ASLI',
    badgeTone: 'teal',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=200&q=80',
    statusGroup: 'antrean',
    isSelected: false,
  },
  {
    id: 'prod-5',
    sku: 'PP-SNK-JMR-032',
    name: 'Keripik Jamur Tiram Krispi',
    stock: 'Kategori: Pangan Kering',
    sellerName: 'Snack Renyah Cimahi',
    sellerRegency: 'Kota Cimahi, Jabar',
    category: 'Camilan & Pangan Olahan',
    sentraLocation: 'Sentra Cimahi - Bandung',
    nib: '',
    nibValid: false,
    halal: 'Sertifikat Halal: Belum Ada',
    pirtOrBpom: 'P-IRT: Format 15 Digit Terdaftar',
    legalNotes: '⚠️ Terdeteksi Foto Unduhan Internet',
    score: 58,
    gradeLabel: 'Grade C',
    scoreTone: 'red',
    curatorStatus: '🚫 Legalitas Bermasalah',
    curatorStatusTone: 'red',
    curatorNote: 'Foto produk terindikasi mengambil foto dari internet (stock photo stock.adobe.com). Penjual wajib mengunggah foto asli produk fisik.',
    badgeOnImage: 'HALAL PENDING',
    badgeTone: 'red',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&q=80',
    statusGroup: 'antrean',
    isSelected: false,
  },
])

const filteredProducts = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('id')
  return products.value.filter((prod) => {
    const matchesSearch =
      !query ||
      `${prod.name} ${prod.sku} ${prod.sellerName} ${prod.category} ${prod.pirtOrBpom}`
        .toLocaleLowerCase('id')
        .includes(query)

    let matchesTab = true
    if (activeTab.value !== 'semua') {
      matchesTab = prod.statusGroup === activeTab.value
    }

    return matchesSearch && matchesTab
  })
})

const selectedProducts = computed(() => filteredProducts.value.filter((p) => p.isSelected))
const allSelected = computed(
  () => filteredProducts.value.length > 0 && filteredProducts.value.every((p) => p.isSelected)
)

function notify(msg: string) {
  emit('notify', msg)
}

function toggleSelectAll() {
  const targetState = !allSelected.value
  filteredProducts.value.forEach((p) => {
    p.isSelected = targetState
  })
}

function bulkApprove() {
  const count = selectedProducts.value.length
  selectedProducts.value.forEach((prod) => {
    prod.statusGroup = 'terkurasi'
    prod.curatorStatus = '✓ Disetujui Terbit'
    prod.curatorStatusTone = 'mint'
    prod.isSelected = false
  })
  notify(`${count} produk berhasil disetujui dan diterbitkan ke etalase nasional!`)
}

function bulkRevision() {
  if (selectedProducts.value.length === 0) return
  showRevisionModal.value = true
}

function submitRevision() {
  const count = selectedProducts.value.length
  selectedProducts.value.forEach((prod) => {
    prod.statusGroup = 'revisi'
    prod.curatorStatus = '✎ Minta Revisi'
    prod.curatorStatusTone = 'orange'
    prod.curatorNote = revisionReason.value || 'Mohon perbaiki foto produk fisik asli dan sertifikat halal.'
    prod.isSelected = false
  })
  showRevisionModal.value = false
  revisionReason.value = ''
  notify(`Permintaan revisi dikirimkan ke ${count} toko UMKM.`)
}

function bulkReject() {
  const count = selectedProducts.value.length
  selectedProducts.value.forEach((prod) => {
    prod.statusGroup = 'ditolak'
    prod.curatorStatus = '🚫 Ditolak Kurator'
    prod.curatorStatusTone = 'red'
    prod.isSelected = false
  })
  notify(`${count} produk ditolak dari antrean etalase.`)
}

function inspectProduct(prod: CurationProduct) {
  selectedInspectProduct.value = prod
  showInspectModal.value = true
}

function approveSingle(prod: CurationProduct) {
  prod.statusGroup = 'terkurasi'
  prod.curatorStatus = '✓ Disetujui Terbit'
  prod.curatorStatusTone = 'mint'
  notify(`Produk "${prod.name}" disetujui terbit di Etalase Nasional!`)
  showInspectModal.value = false
}

function runAiBatchCuration() {
  isAiAnalyzing.value = true
  aiAnalysisProgress.value = 10
  showAiBatchModal.value = true

  const interval = setInterval(() => {
    aiAnalysisProgress.value += 30
    if (aiAnalysisProgress.value >= 100) {
      clearInterval(interval)
      isAiAnalyzing.value = false
      notify('✓ AI Batch Curation Selesai: 5 produk dianalisis, 3 siap lolos mutu otomatis!')
    }
  }, 500)
}
</script>

<template>
  <div class="product-curation-content">
    <!-- Header Section -->
    <header class="page-heading">
      <div class="heading-copy">
        <div class="admin-breadcrumb">
          ▣ &nbsp; PORTAL SUPER ADMIN &nbsp;›&nbsp; MANAJEMEN ENTITAS &nbsp;›&nbsp; <b>Katalog & Kurasi Produk</b>
        </div>
        <div class="title-row">
          <h1>Kurasi Mutu & Manajemen Katalog Produk UMKM</h1>
          <span class="audit-tag">AUDIT TERPADU</span>
        </div>
        <p>
          Validasi keaslian komoditas nusantara, sertifikasi pangan/izin edar produk, moderasi foto produk & klaim khasiat, serta pengawasan mutu tayang etalase nasional.
        </p>
      </div>

      <div class="heading-actions">
        <button type="button" class="btn-outline" @click="notify('Mengunduh Laporan Kurasi Mutu Produk (PDF)...')">
          <svg viewBox="0 0 24 24" class="btn-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Unduh Laporan Kurasi
        </button>
        <button type="button" class="btn-outline" @click="notify('Buka Dokumen Standar Kemenkop & SKP-2024...')">
          <svg viewBox="0 0 24 24" class="btn-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Standar Kemenkop
        </button>
        <button type="button" class="btn-primary" @click="runAiBatchCuration">
          ✦ Kurasi Cepat AI Batch
        </button>
      </div>
    </header>

    <!-- Critical Product Audit Banner -->
    <section class="critical-banner">
      <div class="banner-icon-wrap">
        <span>!</span>
      </div>
      <div class="banner-body">
        <div class="banner-title">Pemberitahuan Audit Produk Kritis</div>
        <p>
          <strong>6 produk baru terdeteksi klaim medis berlebihan atau belum melampirkan izin nomor P-IRT/BPOM terverifikasi.</strong> Diperlukan review kurator sebelum pukul 17:00 WIB agar antrean tayang tidak terblokir otomatis.
        </p>
      </div>
      <div class="banner-actions">
        <small class="sla-text">SLA Kurasi tersisa: 18 menit lalu</small>
        <button type="button" class="btn-critical" @click="notify('Menampilkan 6 produk berisiko kritis...')">
          Tinjau 6 Produk Kritis →
        </button>
      </div>
    </section>

    <!-- Metric Summary Cards Grid -->
    <section class="summary-stats-grid">
      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">TOTAL PRODUK AKTIF TAYANG</span>
          <span class="stat-icon-wrap mint"><svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">48.910</strong>
          <span class="stat-badge-sm">A+1</span>
        </div>
        <div class="stat-footer-row">
          <span class="pill-stat mint">+320 Aktif Minggu Ini</span>
          <span class="subtext">98.2% Lolos Mutu</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">MENUNGGU KURASI KURATOR</span>
          <span class="stat-icon-wrap orange"><svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">38</strong>
          <span class="subtext">Produk Antrean</span>
        </div>
        <div class="stat-footer-row">
          <span class="pill-stat orange">● SLA Segera (SLA &lt; 12 Jam)</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">LAPORAN PELANGGARAN / KLAIM</span>
          <span class="stat-icon-wrap gray"><svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">4</strong>
          <span class="subtext">Perlu Tinjauan</span>
        </div>
        <div class="stat-footer-row">
          <span class="subtext">2 Keluhan Dimediasi</span>
          <span class="subtext">0 DBK Status Terancam</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">KOMODITAS TERSERTIFIKASI</span>
          <span class="stat-icon-wrap green"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">89.4%</strong>
          <span class="subtext">Tercatat Resmi</span>
        </div>
        <div class="stat-footer-row">
          <span class="subtext">HALAL 91%</span>
          <span class="subtext">BPOM 85%</span>
          <span class="subtext">P-IRT 97%</span>
        </div>
      </article>
    </section>

    <!-- Main Filters & Table Container -->
    <section class="table-container">
      <nav class="table-tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'semua' }"
          @click="activeTab = 'semua'"
        >
          Semua Katalog <small>(48.910)</small>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'antrean' }"
          @click="activeTab = 'antrean'"
        >
          Antrean Kurasi Baru <span class="badge-count">38</span>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'terkurasi' }"
          @click="activeTab = 'terkurasi'"
        >
          Produk Terkurasi & Unggulan <small>(48.400)</small>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'revisi' }"
          @click="activeTab = 'revisi'"
        >
          Perlu Revisi Penjual <small>(18)</small>
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: activeTab === 'ditolak' }"
          @click="activeTab = 'ditolak'"
        >
          Ditolak / Dihapus <small>(54)</small>
        </button>
      </nav>

      <div class="search-filter-bar">
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="search"
            type="search"
            placeholder="Cari nama produk, SKU, izin P-IRT/BPOM..."
            aria-label="Cari produk"
          />
        </div>

        <select v-model="selectedCommodity" class="filter-select" aria-label="Filter Komoditas">
          <option value="Semua Komoditas">Semua Komoditas</option>
          <option value="Herbal">Herbal & Nutrisi</option>
          <option value="Kopi">Kopi Nusantara</option>
          <option value="Wastra">Wastra & Tenun</option>
          <option value="Camilan">Camilan & Olahan</option>
        </select>

        <select v-model="selectedRegion" class="filter-select" aria-label="Filter Sentra">
          <option value="Semua Sentra Daerah">Semua Sentra Daerah</option>
          <option value="Siak">Riau / Siak</option>
          <option value="Temanggung">Jateng / Temanggung</option>
          <option value="Gianyar">Bali / Gianyar</option>
          <option value="Wolowaru">NTT / Ende</option>
        </select>

        <select v-model="selectedCertification" class="filter-select" aria-label="Filter Sertifikasi">
          <option value="Status Sertifikasi">Status Sertifikasi</option>
          <option value="Valid">API Valid</option>
          <option value="Halal">Ada Halal</option>
          <option value="BPOM">Ada BPOM/P-IRT</option>
        </select>

        <select v-model="selectedQualityScore" class="filter-select" aria-label="Filter Skor Mutu">
          <option value="Skor Kurasi Mutu">Skor Kurasi Mutu</option>
          <option value="High">Skor Tinggi (> 90)</option>
          <option value="Review">Perlu Review (&lt; 80)</option>
        </select>
      </div>

      <!-- Bulk Selection Bar -->
      <div v-if="selectedProducts.length > 0" class="bulk-action-bar">
        <span class="bulk-count">
          <strong>{{ selectedProducts.length }} produk terpilih</strong> dari {{ filteredProducts.length }} produk antrean
        </span>
        <div class="bulk-buttons">
          <button type="button" class="btn-bulk-approve" @click="bulkApprove">
            ✓ Setujui Terbit Massal
          </button>
          <button type="button" class="btn-bulk-revision" @click="bulkRevision">
            ✎ Minta Revisi Label
          </button>
          <button type="button" class="btn-bulk-reject" @click="bulkReject">
            🚫 Tolak & Beri Alasan
          </button>
        </div>
      </div>

      <!-- Main Curation Table -->
      <div class="table-responsive">
        <table class="curation-table">
          <thead>
            <tr>
              <th class="col-check">
                <input type="checkbox" :checked="allSelected" aria-label="Pilih Semua" @change="toggleSelectAll" />
              </th>
              <th>INFORMASI PRODUK & TOKO</th>
              <th>KATEGORI & SENTRA</th>
              <th>LEGALITAS & UJI MUTU</th>
              <th>SKOR MUTU</th>
              <th>CATATAN KURATOR / REKOMENDASI</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="prod in filteredProducts"
              :key="prod.id"
              :class="{ 'is-selected': prod.isSelected, 'is-warning-row': prod.scoreTone === 'red' }"
            >
              <td class="col-check">
                <input type="checkbox" v-model="prod.isSelected" :aria-label="`Pilih ${prod.name}`" />
              </td>
              <td>
                <div class="product-info-cell">
                  <div class="thumb-wrap">
                    <img :src="prod.imageUrl" :alt="prod.name" />
                    <span class="badge-on-img" :class="prod.badgeTone">{{ prod.badgeOnImage }}</span>
                  </div>
                  <div class="prod-details">
                    <b class="prod-title" @click="inspectProduct(prod)">{{ prod.name }}</b>
                    <div class="prod-meta">
                      <code>SKU: {{ prod.sku }}</code> • <small>{{ prod.stock }}</small>
                    </div>
                    <div class="seller-meta">
                      <span>{{ prod.sellerName }}</span> <small>({{ prod.sellerRegency }})</small>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div class="category-cell">
                  <b>{{ prod.category }}</b>
                  <small>📍 {{ prod.sentraLocation }}</small>
                </div>
              </td>
              <td>
                <div class="legalities-cell">
                  <div v-if="prod.nib" class="nib-line">
                    <small>NIB: {{ prod.nib }}</small>
                    <span v-if="prod.nibValid" class="api-valid-badge">API VALID</span>
                  </div>
                  <div class="pirt-line"><small>{{ prod.pirtOrBpom }}</small></div>
                  <div class="halal-line"><small>Halal: {{ prod.halal }}</small></div>
                  <div v-if="prod.legalNotes" class="legal-note" :class="{ warning: prod.legalNotes.includes('⚠️') }">
                    <small>{{ prod.legalNotes }}</small>
                  </div>
                </div>
              </td>
              <td>
                <div class="score-cell" :class="prod.scoreTone">
                  <strong class="score-num">{{ prod.score }}</strong>
                  <span class="grade-label">{{ prod.gradeLabel }}</span>
                </div>
              </td>
              <td>
                <div class="curator-cell">
                  <span
                    class="curator-status-pill"
                    :class="{
                      mint: prod.curatorStatusTone === 'mint',
                      orange: prod.curatorStatusTone === 'orange',
                      red: prod.curatorStatusTone === 'red',
                    }"
                  >
                    {{ prod.curatorStatus }}
                  </span>
                  <p class="curator-note">{{ prod.curatorNote }}</p>
                  <button type="button" class="btn-inspect-link" @click="inspectProduct(prod)">
                    Tinjau Bukti & Inspect →
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="6" class="empty-table-cell">
                Tidak ada produk antrean yang sesuai dengan kata kunci filter saat ini.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="table-pagination">
        <span>Menampilkan 1 - {{ filteredProducts.length }} dari 38 produk antrean kurasi</span>

        <div class="pagination-buttons">
          <button type="button" disabled>‹</button>
          <button type="button" class="active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>...</span>
          <button type="button">8</button>
          <button type="button">›</button>
        </div>
      </footer>
    </section>

    <!-- Bottom Section: Guidelines & Field Facilitators -->
    <div class="bottom-grid">
      <!-- Curation Standards Card -->
      <article class="guidelines-card">
        <header class="card-header">
          <div>
            <h2>Pedoman Standar Kurasi Etalase Nasional (SKP-2024)</h2>
            <p>Setiap produk yang tampil di etalase nasional wajib memenuhi 4 pilar verifikasi mutu demi melindungi konsumen dan menjaga reputasi produk lokal Indonesia.</p>
          </div>
          <span class="rev-badge">Revisi Sept 2024</span>
        </header>

        <div class="guidelines-grid">
          <div class="rule-box">
            <b>1. Foto Asli Produk Fisik</b>
            <p>Foto produk asli, bukan 3D render atau gambar kemasan dummy dari internet, minimal rasio 1:1, 800px.</p>
          </div>

          <div class="rule-box">
            <b>2. Label Komposisi & Netto</b>
            <p>Komposisi makanan tertera jelas, tanggal kadaluarsa & berat bersih valid.</p>
          </div>

          <div class="rule-box">
            <b>3. Legalitas P-IRT / BPOM & Halal</b>
            <p>Wajib mencantumkan nomor P-IRT/BPOM dan nomor sertifikat Halal Kemenag & BPOM.</p>
          </div>

          <div class="rule-box">
            <b>4. Bebas Klaim Medis Palsu</b>
            <p>Dilarang mengklaim dapat menyembuhkan penyakit medis berat tanpa uji klinis.</p>
          </div>
        </div>

        <button type="button" class="btn-pdf-sop" @click="notify('Mengunduh SOP Kurator Lengkap (PDF 2.4 MB)...')">
          Unduh SOP Kurator Lengkap (PDF 2.4 MB) 📄
        </button>
      </article>

      <!-- Field Facilitators Card -->
      <article class="facilitators-card">
        <header class="card-header compact">
          <div>
            <h2>Fasilitator Lapangan Sentra</h2>
            <p>Butuh verifikasi fisik langsung di tempat? Uji sampel berat, aroma, atau pendampingan perajin dapat dilakukan langsung oleh tim di lapangan.</p>
          </div>
          <span class="status-live-pill">● 4 Aktif</span>
        </header>

        <div class="facilitator-list">
          <div class="fac-item">
            <div class="fac-info">
              <b>Hub Sentra Jateng & DIY</b>
              <small>Sentra Temanggung & Kopi • PIC: Bpk. Haryono</small>
            </div>
            <button type="button" class="btn-contact-fac" @click="notify('Menghubungi PIC Bpk. Haryono (Hub Jateng)...')">Hubungi</button>
          </div>

          <div class="fac-item">
            <div class="fac-info">
              <b>Hub Sentra NTT & Bali</b>
              <small>Sentra Tenun Ikat & Bali • PIC: Ibu Yuliana K.</small>
            </div>
            <button type="button" class="btn-contact-fac" @click="notify('Menghubungi PIC Ibu Yuliana K. (Hub NTT)...')">Hubungi</button>
          </div>

          <div class="fac-item">
            <div class="fac-info">
              <b>Hub Sentra Luar Jawa & Papua</b>
              <small>Komoditas Madu, Kopi & Rempah • PIC: Bpk. Rahmat D.</small>
            </div>
            <button type="button" class="btn-contact-fac" @click="notify('Menghubungi PIC Bpk. Rahmat D. (Hub Papua)...')">Hubungi</button>
          </div>
        </div>

        <div class="fac-footer">
          <small>Waktu respon rata-rata lapangan: &lt; 2 jam</small>
          <button type="button" class="btn-disposisi-link" @click="notify('Disposisi cek fisik lapangan dibuat.')">
            Disposisi Cek Fisik Lapangan →
          </button>
        </div>
      </article>
    </div>

    <!-- Product Inspection Modal -->
    <div v-if="showInspectModal && selectedInspectProduct" class="modal-backdrop" @click.self="showInspectModal = false">
      <div class="modal-dialog inspect-dialog">
        <header class="modal-header">
          <div>
            <small>DETAIL KURASI & INSPEKSI MUTU</small>
            <h2>{{ selectedInspectProduct.name }}</h2>
            <code class="sku-code">SKU: {{ selectedInspectProduct.sku }}</code>
          </div>
          <button type="button" class="close-btn" @click="showInspectModal = false">×</button>
        </header>

        <div class="modal-body">
          <div class="inspect-grid">
            <div class="inspect-img-box">
              <img :src="selectedInspectProduct.imageUrl" :alt="selectedInspectProduct.name" />
              <span class="badge-tag">{{ selectedInspectProduct.badgeOnImage }}</span>
            </div>

            <div class="inspect-details">
              <div class="inspect-row"><strong>Nama UMKM / Toko:</strong> {{ selectedInspectProduct.sellerName }} ({{ selectedInspectProduct.sellerRegency }})</div>
              <div class="inspect-row"><strong>Kategori:</strong> {{ selectedInspectProduct.category }} ({{ selectedInspectProduct.sentraLocation }})</div>
              <div class="inspect-row"><strong>Legalitas:</strong> {{ selectedInspectProduct.pirtOrBpom }} | Halal: {{ selectedInspectProduct.halal }}</div>
              <div class="inspect-row"><strong>Skor Mutu Kurasi:</strong> <span class="score-pill">{{ selectedInspectProduct.score }} ({{ selectedInspectProduct.gradeLabel }})</span></div>
              <div class="inspect-note-box">
                <b>Catatan Kurator:</b>
                <p>{{ selectedInspectProduct.curatorNote }}</p>
              </div>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="showInspectModal = false">Tutup</button>
          <button type="button" class="btn-approve-single" @click="approveSingle(selectedInspectProduct)">
            ✓ Setujui Terbit etalase
          </button>
        </footer>
      </div>
    </div>

    <!-- AI Batch Curation Modal -->
    <div v-if="showAiBatchModal" class="modal-backdrop" @click.self="showAiBatchModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>ENGINE AI KURATOR</small>
            <h2>✦ AI Batch Mutu & Image Authenticity Audit</h2>
          </div>
          <button type="button" class="close-btn" @click="showAiBatchModal = false">×</button>
        </header>

        <div class="modal-body">
          <p>Sistem AI menganalisis kecocokan foto asli produk fisik, validasi NIB & P-IRT Kemenkop, serta pemindaian klaim khasiat berlebihan.</p>
          <div v-if="isAiAnalyzing" class="ai-progress-wrap">
            <span>Menganalisis 5 produk antrean... ({{ aiAnalysisProgress }}%)</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: aiAnalysisProgress + '%' }"></div>
            </div>
          </div>
          <div v-else class="ai-results">
            <div class="result-row mint">
              ✓ 3 Produk: Lolos Verifikasi Foto Asli & NIB Valid (Skor > 90)
            </div>
            <div class="result-row orange">
              ⚠️ 1 Produk: Terdeteksi Klaim Overclaim Medis (Minyak Balur Bali)
            </div>
            <div class="result-row red">
              🚫 1 Produk: Foto Produk Dari Internet (Keripik Jamur Cimahi)
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-primary" :disabled="isAiAnalyzing" @click="showAiBatchModal = false">Tutup Hasil AI</button>
        </footer>
      </div>
    </div>

    <!-- Revision Reason Modal -->
    <div v-if="showRevisionModal" class="modal-backdrop" @click.self="showRevisionModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>REVISI KATALOG</small>
            <h2>Minta Revisi Label & Foto Produk</h2>
          </div>
          <button type="button" class="close-btn" @click="showRevisionModal = false">×</button>
        </header>

        <div class="modal-body">
          <p>Tentukan alasan revisi yang akan dikirimkan ke {{ selectedProducts.length }} mitra UMKM:</p>
          <label class="form-group">
            <span>Catatan Instruksi Revisi Kurator *</span>
            <textarea v-model="revisionReason" placeholder="Contoh: Mohon ganti foto produk dengan foto fisik asli buatan sendiri dan perbarui sertifikat P-IRT resmi..."></textarea>
          </label>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="showRevisionModal = false">Batal</button>
          <button type="button" class="btn-primary" @click="submitRevision">Kirim Permintaan Revisi</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-curation-content {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 24px 28px 36px;
  color: #0f172a;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  font-size: 13.5px;
  line-height: 1.5;
}

.product-curation-content * {
  box-sizing: border-box;
}

.product-curation-content button,
.product-curation-content input,
.product-curation-content select,
.product-curation-content textarea {
  font-family: inherit;
}

.product-curation-content button {
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

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: 25px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.audit-tag {
  padding: 3px 8px;
  border-radius: 6px;
  color: #047857;
  background: #d1fae5;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.page-heading p {
  margin: 6px 0 0;
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
  border-color: #94a3b8;
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

/* Critical Audit Banner */
.critical-banner {
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
  width: 36px;
  height: 36px;
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

.banner-title {
  color: #9f1239;
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 2px;
}

.banner-body p {
  margin: 0;
  color: #be123c;
  font-size: 12.5px;
  line-height: 1.45;
}

.banner-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex: none;
}

.sla-text {
  color: #9f1239;
  font-size: 11px;
}

.btn-critical {
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
  font-size: 12px;
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
.stat-icon-wrap.orange { color: #ea580c; background: #fff7ed; }
.stat-icon-wrap.gray { color: #475569; background: #f1f5f9; }
.stat-icon-wrap.green { color: #16a34a; background: #f0fdf4; }

.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.stat-value {
  color: #0f172a;
  font-size: 23px;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.stat-badge-sm {
  padding: 2px 6px;
  border-radius: 4px;
  color: #059669;
  background: #ecfdf5;
  font-size: 11.5px;
  font-weight: 800;
}

.stat-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.pill-stat {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 800;
}

.pill-stat.mint { color: #047857; background: #d1fae5; }
.pill-stat.orange { color: #c2410c; background: #ffedd5; }

.subtext {
  color: #64748b;
  font-size: 11.5px;
}

/* Main Table Container */
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
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.tab-btn.active {
  color: #047857;
  border-color: #047857;
  font-weight: 700;
}

.badge-count {
  padding: 2px 6px;
  border-radius: 10px;
  color: #ffffff;
  background: #047857;
  font-size: 11.5px;
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

.bulk-action-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 18px;
  background: #ecfdf5;
  border-bottom: 1px solid #a7f3d0;
  font-size: 12.5px;
}

.bulk-count {
  color: #047857;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

.btn-bulk-approve {
  padding: 6px 12px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #047857;
  font-size: 12px;
  font-weight: 700;
}

.btn-bulk-revision {
  padding: 6px 12px;
  border: 1px solid #f97316;
  border-radius: 6px;
  color: #c2410c;
  background: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

.btn-bulk-reject {
  padding: 6px 12px;
  border: 1px solid #f43f5e;
  border-radius: 6px;
  color: #be123c;
  background: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

/* Curation Table */
.table-responsive {
  overflow-x: auto;
}

.curation-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12.5px;
}

.curation-table th {
  padding: 10px 14px;
  color: #64748b;
  background: #f8fafc;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.curation-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.col-check {
  width: 36px;
  text-align: center;
}

.curation-table tr.is-selected td {
  background: #f0fdf4;
}

.curation-table tr.is-warning-row td {
  background: #fff8f6;
}

.product-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thumb-wrap {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex: none;
}

.thumb-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-on-img {
  position: absolute;
  bottom: 2px;
  left: 2px;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 800;
  color: #ffffff;
}

.badge-on-img.mint { background: #059669; }
.badge-on-img.orange { background: #ea580c; }
.badge-on-img.red { background: #e11d48; }
.badge-on-img.teal { background: #0d9488; }

.prod-title {
  display: block;
  color: #0f172a;
  font-weight: 800;
  cursor: pointer;
}

.prod-title:hover {
  color: #059669;
}

.prod-meta code {
  color: #64748b;
  font-size: 11.5px;
}

.prod-meta small {
  color: #475569;
}

.seller-meta {
  color: #059669;
  font-size: 12px;
  font-weight: 700;
}

.seller-meta small {
  color: #64748b;
  font-weight: normal;
}

.category-cell b {
  display: block;
  color: #0f172a;
}

.category-cell small {
  color: #64748b;
  font-size: 11.5px;
}

.legalities-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 11.5px;
}

.api-valid-badge {
  display: inline-block;
  margin-left: 4px;
  padding: 1px 5px;
  border-radius: 4px;
  color: #047857;
  background: #d1fae5;
  font-size: 11px;
  font-weight: 800;
}

.legal-note {
  color: #64748b;
}

.legal-note.warning {
  color: #dc2626;
  font-weight: 700;
}

.score-cell {
  text-align: center;
}

.score-num {
  display: block;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
}

.grade-label {
  display: block;
  font-size: 11.5px;
  font-weight: 700;
}

.score-cell.mint { color: #059669; }
.score-cell.green { color: #16a34a; }
.score-cell.orange { color: #ea580c; }
.score-cell.red { color: #dc2626; }

.curator-status-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.curator-status-pill.mint { color: #047857; background: #ecfdf5; }
.curator-status-pill.orange { color: #c2410c; background: #fff7ed; }
.curator-status-pill.red { color: #be123c; background: #fef2f2; }

.curator-note {
  margin: 4px 0 0;
  color: #475569;
  font-size: 11px;
  line-height: 1.35;
  max-width: 280px;
}

.btn-inspect-link {
  border: 0;
  background: transparent;
  color: #047857;
  font-size: 11px;
  font-weight: 700;
  padding: 0;
  margin-top: 4px;
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

/* Bottom Section */
.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 20px;
}

.guidelines-card,
.facilitators-card {
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
  margin-bottom: 14px;
}

.card-header.compact {
  align-items: center;
}

.card-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
}

.card-header p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 11.5px;
  line-height: 1.4;
}

.rev-badge {
  padding: 3px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 10.5px;
  font-weight: 700;
}

.guidelines-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}

.rule-box {
  padding: 10px;
  border-radius: 8px;
  background: #f8fafc;
  border-left: 3px solid #059669;
}

.rule-box b {
  display: block;
  color: #0f172a;
  font-size: 12px;
  margin-bottom: 2px;
}

.rule-box p {
  margin: 0;
  color: #475569;
  font-size: 11px;
  line-height: 1.35;
}

.btn-pdf-sop {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
}

.status-live-pill {
  color: #16a34a;
  font-size: 11px;
  font-weight: 700;
}

.facilitator-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.fac-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.fac-info b {
  display: block;
  color: #0f172a;
  font-size: 12.5px;
}

.fac-info small {
  color: #64748b;
  font-size: 11px;
}

.btn-contact-fac {
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 11px;
  font-weight: 700;
}

.fac-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #64748b;
}

.btn-disposisi-link {
  border: 0;
  background: transparent;
  color: #ea580c;
  font-weight: 800;
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

.inspect-dialog {
  width: min(640px, 100%);
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

.inspect-grid {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
}

.inspect-img-box {
  position: relative;
  height: 180px;
  border-radius: 8px;
  overflow: hidden;
}

.inspect-img-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #ffffff;
  background: #059669;
  font-size: 10px;
  font-weight: 800;
}

.inspect-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.inspect-row {
  font-size: 12.5px;
}

.score-pill {
  padding: 2px 6px;
  border-radius: 4px;
  color: #047857;
  background: #ecfdf5;
  font-weight: 800;
}

.inspect-note-box {
  margin-top: 8px;
  padding: 10px;
  border-radius: 6px;
  background: #f8fafc;
  border-left: 3px solid #059669;
}

.inspect-note-box p {
  margin: 2px 0 0;
  font-size: 12px;
}

.ai-progress-wrap {
  margin-top: 14px;
}

.progress-bar {
  height: 8px;
  border-radius: 4px;
  background: #e2e8f0;
  overflow: hidden;
  margin-top: 6px;
}

.progress-fill {
  height: 100%;
  background: #059669;
  transition: width 0.3s ease;
}

.ai-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  font-size: 12px;
  font-weight: 600;
}

.result-row {
  padding: 8px 10px;
  border-radius: 6px;
}

.result-row.mint { color: #047857; background: #ecfdf5; }
.result-row.orange { color: #c2410c; background: #fff7ed; }
.result-row.red { color: #be123c; background: #fef2f2; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  font-weight: 700;
}

.form-group textarea {
  height: 80px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12.5px;
  outline: 0;
  resize: vertical;
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

.btn-approve-single {
  height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #047857;
  font-size: 12.5px;
  font-weight: 700;
}

@media (max-width: 1080px) {
  .summary-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .bottom-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .page-heading { flex-direction: column; }
  .summary-stats-grid { grid-template-columns: 1fr; }
  .critical-banner { flex-direction: column; align-items: flex-start; }
  .inspect-grid { grid-template-columns: 1fr; }
  .guidelines-grid { grid-template-columns: 1fr; }
}
</style>
