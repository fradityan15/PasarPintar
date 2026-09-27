<script setup lang="ts">
import { computed, ref } from 'vue'

export interface SentraCluster {
  id: string
  code: string
  name: string
  province: string
  regency: string
  mainCommodity: string
  subCommodity: string
  storeCount: number
  craftsmanCount: number
  facilitator: string
  facilitatorDetail: string
  gmvMonthly: number
  rating: number
  reviewCount: number
  afirmasiStatus: 'Mandiri' | 'Afirmasi 3T' | 'Pendampingan' | 'Standar Ekspor'
  badgeLabel: string
  badgeTone: 'mint' | 'orange' | 'blue' | 'teal'
  imageUrl: string
  isFeatured: boolean
}

export interface CategoryTree {
  id: string
  name: string
  icon: string
  subCount: number
  storeCount: number
  subs: { name: string; storeCount: number }[]
}

const emit = defineEmits<{ notify: [message: string] }>()

const activeMainView = ref<'pemetaan' | 'taksonomi' | 'afirmasi'>('pemetaan')
const search = ref('')
const selectedProvince = ref('Semua Wilayah')
const selectedAfirmasiFilter = ref('Semua Status')
const selectedCategoryFilter = ref('Semua Kategori')
const sortBy = ref<'umkm' | 'gmv' | 'name'>('umkm')

const activeFilterTags = ref<string[]>(['Status: Aktif & Terverifikasi', 'Alokasi 3T Terdaftar'])

// Modals state
const showCreateModal = ref(false)
const createMode = ref<'sentra' | 'kategori'>('sentra')
const showDetailModal = ref(false)
const selectedSentraDetail = ref<SentraCluster | null>(null)
const showInteractiveMapModal = ref(false)

// New Sentra Form
const newSentraName = ref('')
const newSentraProvince = ref('Nusa Tenggara Timur')
const newSentraRegency = ref('Kab. Ngada')
const newSentraCommodity = ref('Kopi Arabika Bajawa')
const newSentraStores = ref(120)
const newSentraCraftsmen = ref(350)
const newSentraFacilitator = ref('Koperasi Tani Bajawa')
const newSentraAfirmasi = ref<'Afirmasi 3T' | 'Mandiri' | 'Pendampingan'>('Afirmasi 3T')

// New Category Form
const newCategoryName = ref('')
const newCategoryIcon = ref('📦')
const newCategoryParent = ref('Makanan & Minuman Lokal')

const sentraList = ref<SentraCluster[]>([
  {
    id: 'sent-1',
    code: 'SENT-NTG-042',
    name: 'Sentra Kopi Sindoro-Sumbing',
    province: 'Jawa Tengah',
    regency: 'Kab. Temanggung',
    mainCommodity: 'Kopi Arabika & Robusta',
    subCommodity: 'Arabika Wine, Robusta Dampit',
    storeCount: 420,
    craftsmanCount: 1040,
    facilitator: 'KPL Temanggung',
    facilitatorDetail: '12 Pendamping Lapangan',
    gmvMonthly: 370000000,
    rating: 4.9,
    reviewCount: 1040,
    afirmasiStatus: 'Mandiri',
    badgeLabel: 'Sentra Mandiri Ekspor',
    badgeTone: 'mint',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
    isFeatured: true,
  },
  {
    id: 'sent-2',
    code: 'SENT-NTT-018',
    name: 'Sentra Tenun Ikat Wolowaru',
    province: 'Nusa Tenggara Timur',
    regency: 'Kab. Ende',
    mainCommodity: 'Tenun Ikat Alami',
    subCommodity: 'Tenun Ikat Alami, Tenun Sambung',
    storeCount: 168,
    craftsmanCount: 420,
    facilitator: 'Ibu Maria Klemens',
    facilitatorDetail: 'Pendamping 3T Desa Ende',
    gmvMonthly: 142500000,
    rating: 4.8,
    reviewCount: 168,
    afirmasiStatus: 'Afirmasi 3T',
    badgeLabel: 'Sentra Program CSR',
    badgeTone: 'orange',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&q=80',
    isFeatured: true,
  },
  {
    id: 'sent-3',
    code: 'SENT-JBR-015',
    name: 'Sentra Bambu Rajapolah',
    province: 'Jawa Barat',
    regency: 'Kab. Tasikmalaya',
    mainCommodity: 'Anyaman Bambu & Dapur',
    subCommodity: 'Tas Bambu, Anyaman Dapur',
    storeCount: 290,
    craftsmanCount: 650,
    facilitator: 'Koperasi Bambu Pasundan',
    facilitatorDetail: '8 Pendamping Kriya',
    gmvMonthly: 215800000,
    rating: 4.8,
    reviewCount: 290,
    afirmasiStatus: 'Pendampingan',
    badgeLabel: 'Klaster Industri Kreatif',
    badgeTone: 'blue',
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80',
    isFeatured: true,
  },
  {
    id: 'sent-4',
    code: 'SENT-RIA-004',
    name: 'Sentra Madu Hutan Siak',
    province: 'Riau',
    regency: 'Kab. Siak & Pelalawan',
    mainCommodity: 'Madu Hutan Sialang',
    subCommodity: 'Madu Sialang, Propolis Murni',
    storeCount: 96,
    craftsmanCount: 180,
    facilitator: 'Inisiatif Hutan Lestari',
    facilitatorDetail: 'Koperasi Hutan Siak',
    gmvMonthly: 192000000,
    rating: 4.9,
    reviewCount: 96,
    afirmasiStatus: 'Standar Ekspor',
    badgeLabel: 'Hutan Alestari Bio',
    badgeTone: 'teal',
    imageUrl: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600&q=80',
    isFeatured: true,
  },
  {
    id: 'sent-5',
    code: 'SENT-SLS-029',
    name: 'Sentra Sutera Sengkang Wajo',
    province: 'Sulawesi Selatan',
    regency: 'Kab. Wajo',
    mainCommodity: 'Kain Sutera Ulat Sutera',
    subCommodity: 'Tenun Sutera Bugis & Sarung',
    storeCount: 210,
    craftsmanCount: 512,
    facilitator: 'Asosiasi Sutera Nusantara Wajo',
    facilitatorDetail: '6 Pendamping Wajo',
    gmvMonthly: 280000000,
    rating: 4.9,
    reviewCount: 310,
    afirmasiStatus: 'Mandiri',
    badgeLabel: 'Bina Koperasi Daerah',
    badgeTone: 'mint',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&q=80',
    isFeatured: false,
  },
  {
    id: 'sent-6',
    code: 'SENT-PPU-002',
    name: 'Sentra Kopi Arabika Wamena Valley',
    province: 'Papua Pegunungan',
    regency: 'Kab. Jayawijaya',
    mainCommodity: 'Kopi Organik Dataran Tinggi',
    subCommodity: 'Biji Arabika Single Origin',
    storeCount: 185,
    craftsmanCount: 520,
    facilitator: 'Yayasan Yamo & Pendamping 3T Papua',
    facilitatorDetail: 'Tim Afirmasi Papua 01',
    gmvMonthly: 165000000,
    rating: 4.9,
    reviewCount: 220,
    afirmasiStatus: 'Afirmasi 3T',
    badgeLabel: 'Prioritas 3T Papua',
    badgeTone: 'orange',
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80',
    isFeatured: false,
  },
  {
    id: 'sent-7',
    code: 'SENT-BAL-012',
    name: 'Sentra Perak & Perhiasan Celuk',
    province: 'Bali',
    regency: 'Kab. Gianyar',
    mainCommodity: 'Kriya Perak & Ukiran Bali',
    subCommodity: 'Kalung, Cincin & Aksesoris Perak',
    storeCount: 248,
    craftsmanCount: 1400,
    facilitator: 'Wisata Sentra Celuk (Koperasi)',
    facilitatorDetail: 'Koperasi Kerajinan Celuk',
    gmvMonthly: 540000000,
    rating: 5.0,
    reviewCount: 890,
    afirmasiStatus: 'Standar Ekspor',
    badgeLabel: 'Standard Ekspor Global',
    badgeTone: 'teal',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
    isFeatured: false,
  },
])

const categoryTrees = ref<CategoryTree[]>([
  {
    id: 'cat-1',
    name: 'Makanan & Minuman Lokal',
    icon: '🍔',
    subCount: 38,
    storeCount: 18420,
    subs: [
      { name: 'Keripik & Camilan Gurih', storeCount: 4890 },
      { name: 'Sambal & Bumbu Masak Kemasan', storeCount: 3120 },
      { name: 'Kopi, Teh & Herbal Komoditas', storeCount: 2110 },
      { name: 'Oleh-Oleh Khas Daerah', storeCount: 1840 },
    ],
  },
  {
    id: 'cat-2',
    name: 'Wastra & Tenun Tradisional',
    icon: '🧵',
    subCount: 24,
    storeCount: 9820,
    subs: [
      { name: 'Kain Batik Cap & Tulis Nusantara', storeCount: 3400 },
      { name: 'Tenun Ikat & Songket Daerah', storeCount: 4120 },
      { name: 'Sarung & Busana Adat Daerah', storeCount: 2300 },
    ],
  },
  {
    id: 'cat-3',
    name: 'Kriya, Bambu & Kayu Ukir',
    icon: '🧺',
    subCount: 28,
    storeCount: 6120,
    subs: [
      { name: 'Anyaman Pandan & Rotan Alami', storeCount: 3210 },
      { name: 'Souvenir & Kerajinan Kayu Nusantara', storeCount: 2910 },
    ],
  },
  {
    id: 'cat-4',
    name: 'Herbal & Minyak Alami',
    icon: '🌿',
    subCount: 14,
    storeCount: 3420,
    subs: [
      { name: 'Minyak Atsiri & Kayu Putih Alami', storeCount: 2100 },
      { name: 'Obat Tradisional & Jamu Instan', storeCount: 1320 },
    ],
  },
])

const provinces = [
  'Semua Wilayah',
  'Jawa Tengah',
  'Nusa Tenggara Timur',
  'Jawa Barat',
  'Riau',
  'Sulawesi Selatan',
  'Papua Pegunungan',
  'Bali',
  'DI Yogyakarta',
  'Jawa Timur',
  'Sumatera Utara',
]

const featuredSentras = computed(() => sentraList.value.filter((s) => s.isFeatured))

const filteredSentras = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('id')
  return sentraList.value.filter((sentra) => {
    const matchesSearch =
      !query ||
      `${sentra.name} ${sentra.code} ${sentra.province} ${sentra.regency} ${sentra.mainCommodity} ${sentra.facilitator}`
        .toLocaleLowerCase('id')
        .includes(query)
    const matchesProvince = selectedProvince.value === 'Semua Wilayah' || sentra.province === selectedProvince.value
    const matchesAfirmasi =
      selectedAfirmasiFilter.value === 'Semua Status' || sentra.afirmasiStatus === selectedAfirmasiFilter.value
    const matchesCategory =
      selectedCategoryFilter.value === 'Semua Kategori' ||
      sentra.mainCommodity.toLocaleLowerCase('id').includes(selectedCategoryFilter.value.toLocaleLowerCase('id'))
    return matchesSearch && matchesProvince && matchesAfirmasi && matchesCategory
  }).sort((a, b) => {
    if (sortBy.value === 'umkm') return b.storeCount - a.storeCount
    if (sortBy.value === 'gmv') return b.gmvMonthly - a.gmvMonthly
    return a.name.localeCompare(b.name)
  })
})

function notify(message: string) {
  emit('notify', message)
}

function removeTag(tag: string) {
  activeFilterTags.value = activeFilterTags.value.filter((t) => t !== tag)
  notify(`Filter "${tag}" dihapus.`)
}

function resetAllFilters() {
  search.value = ''
  selectedProvince.value = 'Semua Wilayah'
  selectedAfirmasiFilter.value = 'Semua Status'
  selectedCategoryFilter.value = 'Semua Kategori'
  activeFilterTags.value = []
  notify('Seluruh filter telah di-reset.')
}

function openDetail(sentra: SentraCluster) {
  selectedSentraDetail.value = sentra
  showDetailModal.value = true
}

function toggleAfirmasiStatus(sentra: SentraCluster) {
  if (sentra.afirmasiStatus === 'Afirmasi 3T') {
    sentra.afirmasiStatus = 'Mandiri'
    sentra.badgeLabel = 'Sentra Mandiri'
    sentra.badgeTone = 'mint'
    notify(`Status ${sentra.name} diubah menjadi Mandiri.`)
  } else {
    sentra.afirmasiStatus = 'Afirmasi 3T'
    sentra.badgeLabel = 'Afirmasi 3T Kargo'
    sentra.badgeTone = 'orange'
    notify(`Status ${sentra.name} diaktifkan sebagai Afirmasi 3T.`)
  }
}

function handleCreateSubmit() {
  if (createMode.value === 'sentra') {
    if (!newSentraName.value.trim()) return
    const newCode = `SENT-${newSentraProvince.value.slice(0, 3).toUpperCase()}-${String(sentraList.value.length + 1).padStart(3, '0')}`
    sentraList.value.unshift({
      id: `sent-${Date.now()}`,
      code: newCode,
      name: newSentraName.value.trim(),
      province: newSentraProvince.value,
      regency: newSentraRegency.value,
      mainCommodity: newSentraCommodity.value,
      subCommodity: `${newSentraCommodity.value} Olahan`,
      storeCount: newSentraStores.value,
      craftsmanCount: newSentraCraftsmen.value,
      facilitator: newSentraFacilitator.value,
      facilitatorDetail: 'Pendamping Baru Sentra',
      gmvMonthly: 95000000,
      rating: 4.8,
      reviewCount: newSentraStores.value,
      afirmasiStatus: newSentraAfirmasi.value,
      badgeLabel: newSentraAfirmasi.value === 'Afirmasi 3T' ? 'Afirmasi 3T Baru' : 'Sentra Terdaftar',
      badgeTone: newSentraAfirmasi.value === 'Afirmasi 3T' ? 'orange' : 'mint',
      imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&q=80',
      isFeatured: false,
    })
    notify(`Sentra Klaster "${newSentraName.value}" berhasil ditambahkan!`)
  } else {
    if (!newCategoryName.value.trim()) return
    categoryTrees.value.push({
      id: `cat-${Date.now()}`,
      name: newCategoryName.value.trim(),
      icon: newCategoryIcon.value,
      subCount: 1,
      storeCount: 0,
      subs: [{ name: `Sub Kategori ${newCategoryName.value.trim()}`, storeCount: 0 }],
    })
    notify(`Kategori Induk "${newCategoryName.value}" berhasil dibuat!`)
  }
  showCreateModal.value = false
  newSentraName.value = ''
  newCategoryName.value = ''
}

function exportCsv() {
  notify('Mengeksport data sentra komoditas ke CSV (sentra_nusantara_2024.csv)...')
}

function downloadGeoJson() {
  notify('Mengunduh peta sebaran spasial GeoJSON (sentra_38_provinsi.geojson)...')
}
</script>

<template>
  <div class="category-region-content">
    <!-- Header Section -->
    <header class="page-heading">
      <div class="heading-copy">
        <div class="admin-breadcrumb">
          ▣ &nbsp; PORTAL SUPER ADMIN &nbsp;›&nbsp; MANAJEMEN ENTITAS &nbsp;›&nbsp; <b>Kategori & Sentra Daerah</b>
        </div>
        <h1>Manajemen Kategori Komoditas &<br />Sentra Daerah Nusantara</h1>
        <p>
          Pengaturan taksonomi produk UMKM, pemetaan klaster sentra produksi lokal di 38 provinsi, kuota program afirmasi daerah 3T, dan sinkronisasi standar komoditas nasional.
        </p>
      </div>

      <div class="heading-actions">
        <button type="button" class="btn-outline" @click="exportCsv">
          <svg viewBox="0 0 24 24" class="btn-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Data Sentra (CSV)
        </button>
        <button type="button" class="btn-outline" @click="downloadGeoJson">
          <svg viewBox="0 0 24 24" class="btn-icon"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          Unduh Peta Sebaran (GeoJSON)
        </button>
        <button type="button" class="btn-primary" @click="showCreateModal = true">
          ＋ Tambah Kategori / Sentra Baru
        </button>
      </div>
    </header>

    <!-- Priority Banner -->
    <section class="priority-banner">
      <div class="banner-icon-wrap">
        <svg viewBox="0 0 24 24" class="shield-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div class="banner-body">
        <div class="banner-title-row">
          <h2>Program Pembinaan Sentra Prioritas Nasional</h2>
          <span class="apbn-badge">DUKUNGAN APBN GBBI & BUMN LOGISTIK</span>
        </div>
        <p>
          12 Sentra Daerah 3T (Tertinggal, Terdepan, Terluar) aktif mendapatkan subsidi ongkir laut-udara eksplisit komoditas sentra hingga Rp 150rb per kargo untuk mempercepat penetrasi produk lokal ke pasar nasional.
        </p>
      </div>
      <div class="banner-actions">
        <button type="button" class="btn-banner-light" @click="notify('Navigasi ke tinjauan alokasi sentra 3T...')">
          Tinjau Alokasi Sentra 3T
        </button>
        <button type="button" class="btn-banner-dark" @click="notify('Konfigurasi subsidi logistik dibuka.')">
          Konfigurasi Subsidi Logistik
        </button>
      </div>
    </section>

    <!-- Summary Stats Grid -->
    <section class="summary-stats-grid">
      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">TOTAL KATEGORI & SUB</span>
          <span class="stat-icon-wrap mint"><svg viewBox="0 0 24 24"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">18 / 142 Sub</strong>
          <span class="delta-pill mint">+4 Kategori Baru</span>
        </div>
        <small class="stat-subtext">Terakreditasi Kominfo & Kemenkop</small>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">SENTRA DAERAH TERDAFTAR</span>
          <span class="stat-icon-wrap green"><svg viewBox="0 0 24 24"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">128 Klaster</strong>
          <span class="delta-pill mint">+12% YoY Terdaftar</span>
        </div>
        <small class="stat-subtext">38 Provinsi • 514 Kabupaten</small>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">PERAJIN & UMKM TERHUBUNG</span>
          <span class="stat-icon-wrap orange"><svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">14.210 Toko</strong>
          <span class="delta-pill coral">+8.4% MoM</span>
        </div>
        <small class="stat-subtext">Rata-rata 110 Toko / Sentra</small>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">NILAI TRANSAKSI SEKTORAN</span>
          <span class="stat-icon-wrap gold"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">Rp 1,48 Miliar</strong>
          <span class="delta-pill neutral">Top: Kopi & Wastra</span>
        </div>
        <small class="stat-subtext">Total Perputaran Q4</small>
      </article>
    </section>

    <!-- Main Tabs & Search Filter Row -->
    <section class="filter-section">
      <nav class="mode-tabs">
        <button
          type="button"
          class="mode-tab"
          :class="{ active: activeMainView === 'pemetaan' }"
          @click="activeMainView = 'pemetaan'"
        >
          <span class="tab-check">✓</span>
          Pemetaan Sentra Daerah & Klaster UMKM
          <span class="tab-badge">128 Klaster</span>
        </button>
        <button
          type="button"
          class="mode-tab"
          :class="{ active: activeMainView === 'taksonomi' }"
          @click="activeMainView = 'taksonomi'"
        >
          Taksonomi & Hierarki Kategori Komoditas
          <span class="tab-badge outline">18 Induk / 142 Sub</span>
        </button>
        <button
          type="button"
          class="mode-tab"
          :class="{ active: activeMainView === 'afirmasi' }"
          @click="activeMainView = 'afirmasi'"
        >
          ⚡ Program Afirmasi 3T & Logistik
        </button>
      </nav>

      <div class="search-filter-bar">
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="search"
            type="search"
            placeholder="Cari nama sentra, kabupaten, provinsi, komoditas..."
            aria-label="Cari sentra komoditas"
          />
        </div>

        <select v-model="selectedProvince" class="filter-select" aria-label="Filter Provinsi">
          <option v-for="prov in provinces" :key="prov" :value="prov">{{ prov === 'Semua Wilayah' ? 'Semua Wilayah (38 Provinsi)' : prov }}</option>
        </select>

        <select v-model="selectedAfirmasiFilter" class="filter-select" aria-label="Filter Afirmasi">
          <option value="Semua Status">Sentra Afirmasi (3T & Reguler)</option>
          <option value="Afirmasi 3T">Afirmasi 3T saja</option>
          <option value="Mandiri">Mandiri / Ekspor</option>
          <option value="Pendampingan">Pendampingan</option>
        </select>

        <select v-model="selectedCategoryFilter" class="filter-select" aria-label="Filter Kategori">
          <option value="Semua Kategori">Semua Kategori Induk</option>
          <option value="Kopi">Kopi & Minuman</option>
          <option value="Tenun">Wastra & Tenun</option>
          <option value="Bambu">Kriya & Bambu</option>
          <option value="Madu">Madu & Herbal</option>
        </select>

        <select v-model="sortBy" class="filter-select sort-select" aria-label="Urutkan Data">
          <option value="umkm">Urutkan: UMKM Terbanyak</option>
          <option value="gmv">Urutkan: GMV Tertinggi</option>
          <option value="name">Urutkan: Nama (A-Z)</option>
        </select>
      </div>

      <div class="active-tags-bar">
        <span v-for="tag in activeFilterTags" :key="tag" class="filter-tag">
          {{ tag }} <button type="button" @click="removeTag(tag)">✕</button>
        </span>
        <button v-if="activeFilterTags.length > 0 || search || selectedProvince !== 'Semua Wilayah'" type="button" class="reset-link" @click="resetAllFilters">
          Reset Semua
        </button>

        <span class="count-summary">
          Menampilkan <strong>{{ filteredSentras.length }}</strong> dari {{ sentraList.length }} Sentra Komoditas Terdaftar Nusantara
        </span>
      </div>
    </section>

    <!-- Featured Sentra Section -->
    <section v-if="activeMainView === 'pemetaan'" class="featured-section">
      <div class="featured-heading">
        <div>
          <h2>Sentra Klaster Komoditas Unggulan</h2>
          <p>Kategori & klaster daerah dengan performa omzet tertinggi, kontribusi UMKM terbanyak, serta cakupan subsidi pengiriman.</p>
        </div>
        <button type="button" class="text-link-map" @click="showInteractiveMapModal = true">
          Lihat Peta Sentra Interaktif →
        </button>
      </div>

      <div class="featured-grid">
        <article v-for="sentra in featuredSentras" :key="sentra.id" class="featured-card">
          <div class="card-image-header">
            <img :src="sentra.imageUrl" :alt="sentra.name" />
            <span class="card-badge" :class="sentra.badgeTone">✓ {{ sentra.badgeLabel }}</span>
            <span class="card-stats-badge">{{ sentra.craftsmanCount }} Toko • {{ sentra.rating }} Rating</span>
          </div>

          <div class="card-content">
            <div class="location-tag">📍 {{ sentra.regency }}, {{ sentra.province }}</div>
            <h3 class="card-title">{{ sentra.name }}</h3>

            <div class="card-specs">
              <div><small>Komoditas Utama:</small> <b>{{ sentra.subCommodity }}</b></div>
              <div><small>Kapasitas Sentra:</small> <span>{{ sentra.storeCount }} UMKM ({{ sentra.craftsmanCount }} Perajin)</span></div>
              <div class="gmv-row"><small>GMV Bulanan:</small> <strong>Rp {{ sentra.gmvMonthly.toLocaleString('id-ID') }}</strong></div>
            </div>

            <div class="status-pill-wrap">
              <span class="status-pill" :class="sentra.afirmasiStatus === 'Afirmasi 3T' ? 'orange' : 'mint'">
                ✓ {{ sentra.afirmasiStatus === 'Afirmasi 3T' ? '100% Penerima Afirmasi 3T' : 'Subsidized Kargo Berjalan' }}
              </span>
            </div>

            <div class="card-actions">
              <button type="button" class="btn-card-outline" @click="openDetail(sentra)">Detail Sentra</button>
              <button type="button" class="btn-card-dark" @click="notify(`Mengelola sentra ${sentra.name}...`)">
                Kelola ({{ sentra.storeCount }})
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- Data Directory & Taxonomy 2-Column Layout -->
    <div class="workspace-grid">
      <!-- Left Column: Directory Table -->
      <section class="table-container">
        <header class="table-header">
          <div>
            <h2>Direktori Lengkap Sentra Komoditas Daerah</h2>
            <p>Data agregat klaster komoditas, jumlah UMKM terhubung, dan status subsidi pemerintah.</p>
          </div>
          <div class="table-tools">
            <button type="button" class="icon-tool" title="Filter lanjut" @click="notify('Filter tingkat lanjut dibuka.')">⚙</button>
            <button type="button" class="icon-tool" title="Refresh data" @click="notify('Data sentra diperbarui.')">↻</button>
          </div>
        </header>

        <div class="table-responsive">
          <table class="sentra-table">
            <thead>
              <tr>
                <th>SENTRA & KLASTER</th>
                <th>PROVINSI & KAB.</th>
                <th>KOMODITAS UNGGULAN</th>
                <th>UMKM & ANGGOTA</th>
                <th>FASILITATOR & PENDAMPING</th>
                <th>STATUS & AFIRMASI</th>
                <th class="text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sentra in filteredSentras" :key="sentra.id">
                <td>
                  <div class="sentra-name-cell">
                    <b>{{ sentra.name }}</b>
                    <code>{{ sentra.code }}</code>
                  </div>
                </td>
                <td>
                  <div class="geo-cell">
                    <b>{{ sentra.province }}</b>
                    <small>{{ sentra.regency }}</small>
                  </div>
                </td>
                <td>
                  <span class="commodity-tag">{{ sentra.mainCommodity }}</span>
                </td>
                <td>
                  <div class="count-cell">
                    <b>{{ sentra.storeCount }} Toko</b>
                    <small>({{ sentra.craftsmanCount }} Perajin)</small>
                  </div>
                </td>
                <td>
                  <div class="facilitator-cell">
                    <span>{{ sentra.facilitator }}</span>
                    <small>{{ sentra.facilitatorDetail }}</small>
                  </div>
                </td>
                <td>
                  <span
                    class="afirmasi-badge"
                    :class="{
                      'is-3t': sentra.afirmasiStatus === 'Afirmasi 3T',
                      'is-mandiri': sentra.afirmasiStatus === 'Mandiri',
                      'is-ekspor': sentra.afirmasiStatus === 'Standar Ekspor',
                      'is-pendampingan': sentra.afirmasiStatus === 'Pendampingan',
                    }"
                  >
                    ● {{ sentra.afirmasiStatus }}
                  </span>
                </td>
                <td class="text-right">
                  <div class="action-buttons">
                    <button type="button" class="btn-table-action" @click="openDetail(sentra)">Detail</button>
                    <button type="button" class="btn-table-toggle" @click="toggleAfirmasiStatus(sentra)">
                      {{ sentra.afirmasiStatus === 'Afirmasi 3T' ? 'Afirmasi ✕' : '+ 3T' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredSentras.length === 0">
                <td colspan="7" class="empty-row">
                  Tidak ada sentra komoditas yang cocok dengan kata kunci atau filter saat ini.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="table-pagination">
          <div class="per-page-selector">
            <span>Data per halaman:</span>
            <select aria-label="Jumlah per halaman">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <span>Menampilkan 1-{{ filteredSentras.length }} dari {{ sentraList.length }} Klaster</span>
          </div>

          <div class="pagination-buttons">
            <button type="button" disabled>‹</button>
            <button type="button" class="active">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button">4</button>
            <span>...</span>
            <button type="button">7</button>
            <button type="button">›</button>
          </div>
        </footer>
      </section>

      <!-- Right Column: Taxonomy Tree & Rules -->
      <aside class="sidebar-container">
        <!-- Taxonomy Tree Card -->
        <article class="taxonomy-card">
          <header class="card-header">
            <div>
              <h2>Pohon Taksonomi Terpopuler</h2>
              <p>Hierarki kategori komoditas utama nasional beserta jumlah toko yang terdaftar di dalamnya.</p>
            </div>
            <button type="button" class="btn-add-sub" @click="createMode = 'kategori'; showCreateModal = true">
              + Sub Baru
            </button>
          </header>

          <div class="tree-list">
            <div v-for="cat in categoryTrees" :key="cat.id" class="tree-group">
              <div class="tree-main">
                <span class="cat-icon">{{ cat.icon }}</span>
                <div class="cat-info">
                  <b>{{ cat.name }}</b>
                  <small>{{ cat.subCount }} Sub / {{ cat.storeCount.toLocaleString('id-ID') }} Toko</small>
                </div>
              </div>

              <ul class="tree-sub-list">
                <li v-for="sub in cat.subs" :key="sub.name">
                  <span>• {{ sub.name }}</span>
                  <small>({{ sub.storeCount.toLocaleString('id-ID') }} Toko)</small>
                </li>
              </ul>
            </div>
          </div>

          <button type="button" class="btn-taxonomy-footer" @click="notify('Manajemen 18 induk taksonomi dibuka.')">
            Kelola Seluruh 18 Induk Taksonomi →
          </button>
        </article>

        <!-- Standardization Rules Card -->
        <article class="rules-card">
          <header class="card-header compact">
            <span class="rules-icon">📋</span>
            <h2>Aturan Standardisasi Penamaan Kategori</h2>
          </header>

          <div class="rules-list">
            <div class="rule-item">
              <div class="rule-title">📍 Validasi Geografis (IG)</div>
              <p>Produk berbasis indikasi geografis wajib mencantumkan daerah asal resmi untuk lolos proses SLA kurasi.</p>
            </div>

            <div class="rule-item">
              <div class="rule-title">🛡 Verifikasi BPOM & P-IRT</div>
              <p>Sub-kategori Makanan & Minuman wajib menyertakan nomor izin edar sebelum dipublis secara nasional.</p>
            </div>

            <div class="rule-item">
              <div class="rule-title">📦 Penetapan Asal Gudang Sentra</div>
              <p>Penjual wajib menyelaraskan koordinat asal pengiriman dengan sentra daerah yang terdaftar untuk 3T Logistik.</p>
            </div>
          </div>

          <button type="button" class="btn-rules-pdf" @click="notify('Mengunduh Panduan Taksonomi Komoditas v2.4 (PDF)...')">
            Unduh Dokumen Panduan Taksonomi Komoditas v2.4 (PDF) 📄
          </button>
        </article>
      </aside>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="modal-backdrop" @click.self="showCreateModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>ENTITAS MANAGEMENT</small>
            <h2>Tambah {{ createMode === 'sentra' ? 'Sentra Daerah' : 'Kategori Komoditas' }} Baru</h2>
          </div>
          <button type="button" class="close-btn" @click="showCreateModal = false">×</button>
        </header>

        <div class="modal-tabs">
          <button type="button" :class="{ active: createMode === 'sentra' }" @click="createMode = 'sentra'">Sentra Daerah Klaster</button>
          <button type="button" :class="{ active: createMode === 'kategori' }" @click="createMode = 'kategori'">Kategori / Taksonomi</button>
        </div>

        <form @submit.prevent="handleCreateSubmit">
          <template v-if="createMode === 'sentra'">
            <label class="form-group">
              <span>Nama Sentra Klaster *</span>
              <input v-model="newSentraName" required placeholder="Contoh: Sentra Kopi Gayo Takengon" />
            </label>

            <div class="form-row">
              <label class="form-group">
                <span>Provinsi</span>
                <select v-model="newSentraProvince">
                  <option v-for="p in provinces.filter(x => x !== 'Semua Wilayah')" :key="p" :value="p">{{ p }}</option>
                </select>
              </label>

              <label class="form-group">
                <span>Kabupaten / Kota</span>
                <input v-model="newSentraRegency" required placeholder="Contoh: Kab. Aceh Tengah" />
              </label>
            </div>

            <div class="form-row">
              <label class="form-group">
                <span>Komoditas Utama</span>
                <input v-model="newSentraCommodity" required placeholder="Contoh: Kopi Arabika Gayo" />
              </label>

              <label class="form-group">
                <span>Fasilitator / Koperasi</span>
                <input v-model="newSentraFacilitator" required placeholder="Contoh: Koperasi Gayo High Land" />
              </label>
            </div>

            <div class="form-row">
              <label class="form-group">
                <span>Jumlah Toko Terdaftar</span>
                <input v-model.number="newSentraStores" type="number" min="1" />
              </label>

              <label class="form-group">
                <span>Status Program Afirmasi</span>
                <select v-model="newSentraAfirmasi">
                  <option value="Afirmasi 3T">Afirmasi 3T (Subsidi Ongkir)</option>
                  <option value="Mandiri">Mandiri / Ekspor</option>
                  <option value="Pendampingan">Pendampingan Lapangan</option>
                </select>
              </label>
            </div>
          </template>

          <template v-else>
            <label class="form-group">
              <span>Nama Kategori Induk Baru *</span>
              <input v-model="newCategoryName" required placeholder="Contoh: Olahan Laut & Perikanan" />
            </label>

            <div class="form-row">
              <label class="form-group">
                <span>Ikon Emoji</span>
                <input v-model="newCategoryIcon" required placeholder="🐟" />
              </label>

              <label class="form-group">
                <span>Kategori Induk Parent</span>
                <select v-model="newCategoryParent">
                  <option v-for="c in categoryTrees" :key="c.id" :value="c.name">{{ c.name }}</option>
                </select>
              </label>
            </div>
          </template>

          <footer class="modal-footer">
            <button type="button" class="btn-cancel" @click="showCreateModal = false">Batal</button>
            <button type="submit" class="btn-submit">Simpan Entitas Baru</button>
          </footer>
        </form>
      </div>
    </div>

    <!-- Sentra Detail Drawer / Modal -->
    <div v-if="showDetailModal && selectedSentraDetail" class="modal-backdrop" @click.self="showDetailModal = false">
      <div class="modal-dialog detail-dialog">
        <header class="modal-header">
          <div>
            <span class="detail-code">{{ selectedSentraDetail.code }}</span>
            <h2>{{ selectedSentraDetail.name }}</h2>
            <small>📍 {{ selectedSentraDetail.regency }}, {{ selectedSentraDetail.province }}</small>
          </div>
          <button type="button" class="close-btn" @click="showDetailModal = false">×</button>
        </header>

        <div class="detail-body">
          <div class="detail-hero-img">
            <img :src="selectedSentraDetail.imageUrl" :alt="selectedSentraDetail.name" />
            <span class="detail-badge" :class="selectedSentraDetail.badgeTone">{{ selectedSentraDetail.badgeLabel }}</span>
          </div>

          <div class="detail-stats-strip">
            <div><small>Kapasitas Toko:</small> <b>{{ selectedSentraDetail.storeCount }} Toko</b></div>
            <div><small>Anggota Perajin:</small> <b>{{ selectedSentraDetail.craftsmanCount }} Orang</b></div>
            <div><small>Omzet Bulanan:</small> <strong class="green-text">Rp {{ selectedSentraDetail.gmvMonthly.toLocaleString('id-ID') }}</strong></div>
            <div><small>RatingSentra:</small> <b>★ {{ selectedSentraDetail.rating }} ({{ selectedSentraDetail.reviewCount }})</b></div>
          </div>

          <div class="detail-info-block">
            <h3>Informasi Fasilitator & Pendamping</h3>
            <p><strong>Fasilitator Utama:</strong> {{ selectedSentraDetail.facilitator }}</p>
            <p><strong>Rincian Pendamping:</strong> {{ selectedSentraDetail.facilitatorDetail }}</p>
            <p><strong>Komoditas Utama & Turunan:</strong> {{ selectedSentraDetail.mainCommodity }} ({{ selectedSentraDetail.subCommodity }})</p>
          </div>

          <div class="detail-status-box">
            <span>Status Afirmasi Logistik 3T:</span>
            <span class="afirmasi-badge" :class="selectedSentraDetail.afirmasiStatus === 'Afirmasi 3T' ? 'is-3t' : 'is-mandiri'">
              ● {{ selectedSentraDetail.afirmasiStatus }}
            </span>
            <button type="button" class="btn-toggle-3t" @click="toggleAfirmasiStatus(selectedSentraDetail)">
              Ubah Status Afirmasi
            </button>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-submit" @click="showDetailModal = false">Tutup Detail</button>
        </footer>
      </div>
    </div>

    <!-- Interactive Map Modal -->
    <div v-if="showInteractiveMapModal" class="modal-backdrop" @click.self="showInteractiveMapModal = false">
      <div class="modal-dialog map-dialog">
        <header class="modal-header">
          <div>
            <small>GIS & SEBARAN SPASIAL</small>
            <h2>Peta Interaktif Sentra Komoditas 38 Provinsi</h2>
          </div>
          <button type="button" class="close-btn" @click="showInteractiveMapModal = false">×</button>
        </header>

        <div class="map-preview-container">
          <div class="map-placeholder">
            <div class="map-pins">
              <span class="pin pin-1" title="Sentra Kopi Temanggung">📍 Temanggung</span>
              <span class="pin pin-2" title="Sentra Tenun Ende">📍 Ende 3T</span>
              <span class="pin pin-3" title="Sentra Bambu Tasik">📍 Tasikmalaya</span>
              <span class="pin pin-4" title="Sentra Madu Siak">📍 Siak</span>
              <span class="pin pin-5" title="Sentra Kopi Wamena">📍 Wamena 3T</span>
            </div>
            <p>Peta Distribusi Realtime Sentra Komoditas & Koridor Kargo Afirmasi 3T</p>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="showInteractiveMapModal = false">Tutup Peta</button>
          <button type="button" class="btn-submit" @click="downloadGeoJson">Unduh Layer GIS (GeoJSON)</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-region-content {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 24px 28px 36px;
  color: #0f172a;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  font-size: 13.5px;
  line-height: 1.5;
}

.category-region-content * {
  box-sizing: border-box;
}

.category-region-content button,
.category-region-content input,
.category-region-content select {
  font-family: inherit;
}

.category-region-content button {
  cursor: pointer;
}

/* Header Section */
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

/* Priority Banner */
.priority-banner {
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

.shield-icon {
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

.apbn-badge {
  padding: 3px 8px;
  border-radius: 6px;
  color: #047857;
  background: #d1fae5;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.banner-body p {
  margin: 4px 0 0;
  color: #047857;
  font-size: 12.5px;
  line-height: 1.45;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: none;
}

.btn-banner-light {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #a7f3d0;
  border-radius: 8px;
  color: #065f46;
  background: #ffffff;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s ease;
}

.btn-banner-light:hover {
  background: #f0fdf4;
}

.btn-banner-dark {
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #047857;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(4, 120, 87, 0.2);
}

.btn-banner-dark:hover {
  background: #065f46;
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
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
}

.stat-icon-wrap {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  font-size: 14px;
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
.stat-icon-wrap.gold { color: #d97706; background: #fffbeb; }

.stat-value-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.stat-value {
  color: #0f172a;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.delta-pill {
  padding: 2px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
}

.delta-pill.mint { color: #047857; background: #d1fae5; }
.delta-pill.coral { color: #dc2626; background: #fef2f2; }
.delta-pill.neutral { color: #475569; background: #f1f5f9; }

.stat-subtext {
  color: #64748b;
  font-size: 11.5px;
}

/* Filter Section & Tabs */
.filter-section {
  padding: 16px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  margin-bottom: 22px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.mode-tabs {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
  overflow-x: auto;
}

.mode-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  color: #475569;
  background: #f8fafc;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.mode-tab:hover {
  background: #f1f5f9;
}

.mode-tab.active {
  color: #ffffff;
  background: #047857;
  border-color: #047857;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(4, 120, 87, 0.25);
}

.tab-check {
  font-size: 11px;
}

.tab-badge {
  padding: 2px 7px;
  border-radius: 10px;
  color: #047857;
  background: #d1fae5;
  font-size: 10.5px;
  font-weight: 800;
}

.mode-tab.active .tab-badge {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
}

.tab-badge.outline {
  color: #475569;
  background: #e2e8f0;
}

.search-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
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
  background: #f8fafc;
}

.search-input-wrap:focus-within {
  border-color: #10b981;
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
  background: transparent;
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

.sort-select {
  font-weight: 600;
}

.active-tags-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f8fafc;
  font-size: 12px;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  color: #047857;
  background: #ecfdf5;
  font-weight: 700;
}

.filter-tag button {
  border: 0;
  background: transparent;
  color: #047857;
  font-size: 11px;
}

.reset-link {
  border: 0;
  background: transparent;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
  text-decoration: underline;
}

.count-summary {
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
}

.count-summary strong {
  color: #0f172a;
}

/* Featured Section */
.featured-section {
  margin-bottom: 24px;
}

.featured-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 14px;
}

.featured-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.featured-heading p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 12.5px;
}

.text-link-map {
  border: 0;
  background: transparent;
  color: #059669;
  font-size: 13px;
  font-weight: 700;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.featured-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.featured-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.card-image-header {
  position: relative;
  height: 140px;
  overflow: hidden;
}

.card-image-header img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
}

.card-badge.mint { color: #ffffff; background: #059669; }
.card-badge.orange { color: #ffffff; background: #ea580c; }
.card-badge.blue { color: #ffffff; background: #0284c7; }
.card-badge.teal { color: #ffffff; background: #0d9488; }

.card-stats-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 3px 7px;
  border-radius: 4px;
  color: #ffffff;
  background: rgba(15, 23, 42, 0.75);
  font-size: 10px;
  font-weight: 600;
}

.card-content {
  padding: 14px;
}

.location-tag {
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
}

.card-title {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 800;
  line-height: 1.3;
}

.card-specs {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
  font-size: 11.5px;
  color: #475569;
}

.card-specs small {
  color: #64748b;
}

.card-specs b {
  color: #0f172a;
}

.gmv-row strong {
  color: #059669;
  font-size: 12.5px;
}

.status-pill-wrap {
  margin-bottom: 12px;
}

.status-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
}

.status-pill.mint { color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; }
.status-pill.orange { color: #c2410c; background: #fff7ed; border: 1px solid #ffedd5; }

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-card-outline {
  flex: 1;
  height: 32px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
}

.btn-card-dark {
  flex: 1;
  height: 32px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #047857;
  font-size: 11.5px;
  font-weight: 700;
}

/* Workspace 2-Column Grid */
.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 20px;
}

/* Table Column */
.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.table-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.table-header p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 12px;
}

.table-tools {
  display: flex;
  gap: 6px;
}

.icon-tool {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  background: #ffffff;
}

.table-responsive {
  overflow-x: auto;
}

.sentra-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12.5px;
}

.sentra-table th {
  padding: 10px 14px;
  color: #64748b;
  background: #f8fafc;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.sentra-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.sentra-name-cell b {
  display: block;
  color: #0f172a;
  font-weight: 700;
}

.sentra-name-cell code {
  color: #64748b;
  font-size: 10.5px;
}

.geo-cell b {
  display: block;
  color: #0f172a;
  font-size: 12px;
}

.geo-cell small {
  color: #64748b;
  font-size: 11px;
}

.commodity-tag {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  color: #047857;
  background: #ecfdf5;
  font-size: 11px;
  font-weight: 700;
}

.count-cell b {
  display: block;
  color: #0f172a;
  font-weight: 700;
}

.count-cell small {
  color: #64748b;
  font-size: 11px;
}

.facilitator-cell span {
  display: block;
  color: #0f172a;
  font-weight: 600;
}

.facilitator-cell small {
  color: #64748b;
  font-size: 10.5px;
}

.afirmasi-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
}

.afirmasi-badge.is-3t { color: #c2410c; background: #fff7ed; }
.afirmasi-badge.is-mandiri { color: #047857; background: #ecfdf5; }
.afirmasi-badge.is-ekspor { color: #0f766e; background: #f0fdfa; }
.afirmasi-badge.is-pendampingan { color: #1d4ed8; background: #eff6ff; }

.action-buttons {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.btn-table-action {
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 11px;
  font-weight: 700;
}

.btn-table-toggle {
  padding: 4px 10px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #047857;
  font-size: 11px;
  font-weight: 700;
}

.text-right {
  text-align: right;
}

.empty-row {
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

.per-page-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.per-page-selector select {
  padding: 2px 6px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
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

/* Sidebar Column */
.sidebar-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.taxonomy-card,
.rules-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.card-header.compact {
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
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

.btn-add-sub {
  padding: 4px 8px;
  border: 0;
  border-radius: 6px;
  color: #047857;
  background: #ecfdf5;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.tree-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 14px;
}

.tree-group {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.tree-main {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.cat-icon {
  font-size: 18px;
}

.cat-info b {
  display: block;
  color: #0f172a;
  font-size: 13px;
}

.cat-info small {
  color: #059669;
  font-size: 11px;
  font-weight: 700;
}

.tree-sub-list {
  margin: 0;
  padding-left: 28px;
  list-style: none;
  font-size: 11.5px;
  color: #475569;
}

.tree-sub-list li {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
}

.tree-sub-list small {
  color: #64748b;
}

.btn-taxonomy-footer {
  width: 100%;
  padding: 8px 0;
  border: 0;
  color: #047857;
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
}

/* Rules Card */
.rules-icon {
  font-size: 18px;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.rule-item {
  padding: 10px;
  border-radius: 8px;
  background: #fafcfb;
  border-left: 3px solid #059669;
}

.rule-title {
  color: #0f172a;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 2px;
}

.rule-item p {
  margin: 0;
  color: #475569;
  font-size: 11px;
  line-height: 1.4;
}

.btn-rules-pdf {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
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
  width: min(540px, 100%);
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
  font-size: 20px;
  font-weight: 800;
}

.close-btn {
  border: 0;
  background: transparent;
  font-size: 24px;
  color: #64748b;
}

.modal-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 18px;
}

.modal-tabs button {
  flex: 1;
  padding: 8px 0;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #475569;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
}

.modal-tabs button.active {
  color: #ffffff;
  background: #047857;
  border-color: #047857;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 14px;
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.form-group input,
.form-group select {
  height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  outline: 0;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
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

.btn-submit {
  height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #047857;
  font-size: 12.5px;
  font-weight: 700;
}

/* Detail Modal */
.detail-dialog {
  width: min(640px, 100%);
}

.detail-code {
  padding: 2px 6px;
  border-radius: 4px;
  color: #047857;
  background: #ecfdf5;
  font-size: 11px;
  font-weight: 800;
}

.detail-hero-img {
  position: relative;
  height: 180px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 16px;
}

.detail-hero-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border-radius: 6px;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
}

.detail-stats-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  margin-bottom: 16px;
  font-size: 11.5px;
}

.green-text { color: #059669; }

.detail-info-block {
  margin-bottom: 16px;
  font-size: 12.5px;
  color: #334155;
}

.detail-info-block h3 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #0f172a;
}

.detail-status-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fafcfb;
}

.btn-toggle-3t {
  margin-left: auto;
  padding: 6px 12px;
  border: 0;
  border-radius: 6px;
  color: #ffffff;
  background: #047857;
  font-size: 11.5px;
  font-weight: 700;
}

/* Map Dialog */
.map-dialog {
  width: min(720px, 100%);
}

.map-preview-container {
  height: 280px;
  border-radius: 10px;
  background: #e2e8f0;
  overflow: hidden;
  position: relative;
  display: grid;
  place-items: center;
  margin-bottom: 16px;
}

.map-placeholder {
  text-align: center;
  color: #475569;
}

.map-pins {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-bottom: 12px;
}

.pin {
  padding: 6px 12px;
  border-radius: 20px;
  color: #ffffff;
  background: #047857;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

@media (max-width: 1080px) {
  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .workspace-grid {
    grid-template-columns: 1fr;
  }
  .summary-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .page-heading {
    flex-direction: column;
  }
  .priority-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  .featured-grid {
    grid-template-columns: 1fr;
  }
  .summary-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
