<script setup lang="ts">
import { computed, ref } from 'vue'

export interface EscrowTransaction {
  id: string
  invoiceNumber: string
  date: string
  statusTag: string
  statusTagTone: 'mint' | 'blue' | 'orange' | 'red' | 'gray'
  sellerName: string
  sellerLocation: string
  sellerAccount: string
  buyerName: string
  buyerLocation: string
  commodityName: string
  channel: string
  nominal: number
  subsidyDetail: string
  escrowStatus: string
  escrowStatusTone: 'ready' | 'pending' | 'dispute' | 'released' | 'refunded'
  escrowNote: string
  primaryActionLabel: string
  primaryActionType: 'release' | 'track' | 'mediate' | 'receipt' | 'report'
  secondaryActionLabel: string
}

const emit = defineEmits<{ notify: [message: string] }>()

const activeTab = ref<'Semua' | 'Tertahan' | 'SiapDilepas' | 'Sengketa' | 'Refund'>('Semua')
const searchQuery = ref('')
const selectedBank = ref('Semua Bank Escrow')
const selectedStatusFilter = ref('Semua Status')
const selectedTimeframe = ref('7 Hari Terakhir')

// Modals State
const showReconcileModal = ref(false)
const showMediationModal = ref(false)
const showTrackingModal = ref(false)
const showReleaseModal = ref(false)
const selectedTx = ref<EscrowTransaction | null>(null)

// Mediation Form state
const disputeResolutionNote = ref('')
const disputeDecision = ref<'refund_full' | 'release_full' | 'partial_50'>('refund_full')

const transactions = ref<EscrowTransaction[]>([
  {
    id: 'tx-1',
    invoiceNumber: '#INV-PP-202406-9921',
    date: 'Hari ini, 16:40 WIB',
    statusTag: 'Pesanan Selesai',
    statusTagTone: 'mint',
    sellerName: 'Koperasi Tani Sindoro Sejahtera',
    sellerLocation: 'Kab. Temanggung, Jawa Tengah',
    sellerAccount: 'Bank BRI 0341-****-4211',
    buyerName: 'Hendra Wijaya',
    buyerLocation: 'Medan, Sumut',
    commodityName: 'Kopi Arabika Temanggung 2kg',
    channel: 'QRIS Bank Mandiri',
    nominal: 960000,
    subsidyDetail: 'Subsidi Ongkir: Rp 150.000',
    escrowStatus: '✓ Siap Auto-Settlement',
    escrowStatusTone: 'ready',
    escrowNote: 'Konfirmasi pembeli diterima. Scheduled transfer ke seller pukul 18:00 WIB.',
    primaryActionLabel: 'Lepas Dana Cepat',
    primaryActionType: 'release',
    secondaryActionLabel: 'Detail Transaksi',
  },
  {
    id: 'tx-2',
    invoiceNumber: '#INV-PP-202406-9918',
    date: 'Kemarin, 14:20 WIB',
    statusTag: 'Dalam Pengiriman',
    statusTagTone: 'blue',
    sellerName: 'Koperasi Kopi Bajawa',
    sellerLocation: 'Kab. Ngada, Flores, NTT',
    sellerAccount: 'Bank BNI 0241-****-912',
    buyerName: 'Siti Rahma',
    buyerLocation: 'Jakarta Selatan',
    commodityName: '2x Kopi Arabika Bajawa 250g',
    channel: 'Virtual Account BRI',
    nominal: 136000,
    subsidyDetail: 'Toko Bebas Ongkir Rp 20.000',
    escrowStatus: '◷ Tertahan di Escrow',
    escrowStatusTone: 'pending',
    escrowNote: 'Kargo J&T Cargo in transit: SGP-EB-068284218 (Posisi: Transit Hub Surabaya).',
    primaryActionLabel: 'Lacak Logistik',
    primaryActionType: 'track',
    secondaryActionLabel: 'Detail Transaksi',
  },
  {
    id: 'tx-3',
    invoiceNumber: '#INV-PP-202406-9864',
    date: '25 Okt 2024, 14:10 WIB',
    statusTag: 'Komplain Kemasan',
    statusTagTone: 'orange',
    sellerName: 'Madu Hutan Liar Siak Mandiri',
    sellerLocation: 'Kab. Siak, Riau',
    sellerAccount: 'Bank Mandiri 1200-****-012',
    buyerName: 'Agus Pratama',
    buyerLocation: 'Surabaya, Jawa Timur',
    commodityName: 'Madu Akasia 500ml x 3 Botol',
    channel: 'Mandiri Virtual Account',
    nominal: 450000,
    subsidyDetail: 'DIBEKUKAN SEMENTARA',
    escrowStatus: '⚠️ Investigasi Mediasi Sengketa',
    escrowStatusTone: 'dispute',
    escrowNote: '1 botol pecah saat transit ekspedisi. Pembeli unboxing video valid.',
    primaryActionLabel: 'Buka Ruang Mediasi',
    primaryActionType: 'mediate',
    secondaryActionLabel: 'Tinjau Bukti Unboxing',
  },
  {
    id: 'tx-4',
    invoiceNumber: '#INV-PP-202406-9850',
    date: '24 Okt 2024, 09:12 WIB',
    statusTag: 'Selesai H+0',
    statusTagTone: 'mint',
    sellerName: 'Sanggar Tenun Wolowaru',
    sellerLocation: 'Ende, Flores, NTT',
    sellerAccount: 'Bank BNI 0412-****-331',
    buyerName: 'Ibu Ratna Saridewi',
    buyerLocation: 'Kota Bandung',
    commodityName: 'Kain Tenun Ikat Tradisional Motif Flores',
    channel: 'BCA Virtual Account',
    nominal: 1850000,
    subsidyDetail: 'Fasilitasi Afirmasi 3T',
    escrowStatus: '✓ Dana Diteruskan ke Seller',
    escrowStatusTone: 'released',
    escrowNote: 'Ref Bank: TRX-REF-998239824 (Pukul 09:44 WIB)',
    primaryActionLabel: '✓ Bukti Transfer',
    primaryActionType: 'receipt',
    secondaryActionLabel: 'Rincian Audit',
  },
  {
    id: 'tx-5',
    invoiceNumber: '#INV-PP-202406-9812',
    date: '21 Okt 2024, 11:05 WIB',
    statusTag: 'Refund Pembeli',
    statusTagTone: 'red',
    sellerName: 'Snack Renyah Cimahi',
    sellerLocation: 'Cimahi, Jawa Barat',
    sellerAccount: 'Sanksi: Peringatan Kualitas',
    buyerName: 'Dewi Lestari',
    buyerLocation: 'Semarang, Jawa Tengah',
    commodityName: 'Keripik Jamur Tiram 500g',
    channel: 'QRIS GoPay',
    nominal: 85000,
    subsidyDetail: 'Refund 100% Lunas',
    escrowStatus: '↩ Refund Selesai ke Pembeli',
    escrowStatusTone: 'refunded',
    escrowNote: 'Produk rusak. Pengembalian dana QRIS pasca persetujuan kurator sentra.',
    primaryActionLabel: 'Berita Acara',
    primaryActionType: 'report',
    secondaryActionLabel: 'Log Escrow',
  },
])

const cashflowData = [
  { day: 'Senin (21 Okt)', inflow: 52200000, outflow: 42100000, inflowPct: 75, outflowPct: 60 },
  { day: 'Selasa (22 Okt)', inflow: 61400000, outflow: 51900000, inflowPct: 88, outflowPct: 74 },
  { day: 'Rabu (23 Okt)', inflow: 71800000, outflow: 65200000, inflowPct: 100, outflowPct: 91 },
  { day: 'Kamis (24 Okt)', inflow: 49200000, outflow: 47800000, inflowPct: 70, outflowPct: 68 },
  { day: 'Jumat (25 Okt)', inflow: 82500000, outflow: 75100000, inflowPct: 115, outflowPct: 105 },
  { day: 'Sabtu (26 Okt)', inflow: 55400000, outflow: 49000000, inflowPct: 79, outflowPct: 70 },
  { day: 'Minggu (Hari ini - Berjalan)', inflow: 32400000, outflow: 28500000, inflowPct: 46, outflowPct: 40 },
]

const bankAccounts = [
  {
    name: 'Rekber BRI (Himbara Utama)',
    bankCode: 'BRI',
    accNo: '0341-01-000492-30-8 (Escrow Utama)',
    balance: 182400000,
    sharePct: '53.3%',
    statusBadge: 'Terkoneksi API BRI',
    tone: 'mint',
  },
  {
    name: 'Rekber Bank Mandiri',
    bankCode: 'MANDIRI',
    accNo: '120-00-1188399-2 (Virtual Account)',
    balance: 88900000,
    sharePct: '26.0%',
    statusBadge: 'API Host-to-Host',
    tone: 'blue',
  },
  {
    name: 'Rekber BCA & BNI',
    bankCode: 'BNI',
    accNo: 'Total Saldo Giro Penampungan Bank Himbara',
    balance: 45180000,
    sharePct: '13.2%',
    statusBadge: 'Terverifikasi',
    tone: 'mint',
  },
  {
    name: 'QRIS Dinamis & Dompet Digital',
    bankCode: 'QRIS',
    accNo: 'NMID: ID1020085892108 – Saldo Instant QRIS',
    balance: 25700000,
    sharePct: '7.5%',
    statusBadge: 'Real-time',
    tone: 'green',
  },
]

const filteredTransactions = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('id')
  return transactions.value.filter((tx) => {
    const matchesSearch =
      !query ||
      `${tx.invoiceNumber} ${tx.sellerName} ${tx.buyerName} ${tx.commodityName} ${tx.channel}`
        .toLocaleLowerCase('id')
        .includes(query)

    let matchesTab = true
    if (activeTab.value === 'Tertahan') matchesTab = tx.escrowStatusTone === 'pending'
    else if (activeTab.value === 'SiapDilepas') matchesTab = tx.escrowStatusTone === 'ready'
    else if (activeTab.value === 'Sengketa') matchesTab = tx.escrowStatusTone === 'dispute'
    else if (activeTab.value === 'Refund') matchesTab = tx.escrowStatusTone === 'refunded'

    const matchesBank = selectedBank.value === 'Semua Bank Escrow' || tx.channel.includes(selectedBank.value.replace('Bank ', ''))
    return matchesSearch && matchesTab && matchesBank
  })
})

function notify(msg: string) {
  emit('notify', msg)
}

function handlePrimaryAction(tx: EscrowTransaction) {
  selectedTx.value = tx
  if (tx.primaryActionType === 'release') {
    showReleaseModal.value = true
  } else if (tx.primaryActionType === 'track') {
    showTrackingModal.value = true
  } else if (tx.primaryActionType === 'mediate') {
    showMediationModal.value = true
  } else if (tx.primaryActionType === 'receipt') {
    notify(`Resi bukti transfer Bank untuk ${tx.invoiceNumber} telah diunduh.`)
  } else if (tx.primaryActionType === 'report') {
    notify(`Berita acara sengketa & refund ${tx.invoiceNumber} siap dicetak.`)
  }
}

function confirmReleaseDana() {
  if (!selectedTx.value) return
  selectedTx.value.escrowStatus = '✓ Dana Diteruskan ke Seller'
  selectedTx.value.escrowStatusTone = 'released'
  selectedTx.value.escrowNote = `Pelepasan dana manual oleh Admin pada ${new Date().toLocaleTimeString('id-ID')} WIB.`
  selectedTx.value.primaryActionLabel = '✓ Bukti Transfer'
  selectedTx.value.primaryActionType = 'receipt'
  notify(`Dana sebesar Rp ${selectedTx.value.nominal.toLocaleString('id-ID')} sukses dilepas ke ${selectedTx.value.sellerName}!`)
  showReleaseModal.value = false
}

function resolveDispute() {
  if (!selectedTx.value) return
  if (disputeDecision.value === 'refund_full') {
    selectedTx.value.escrowStatus = '↩ Refund Selesai ke Pembeli'
    selectedTx.value.escrowStatusTone = 'refunded'
    selectedTx.value.escrowNote = `Mediasi Selesai: Dana Rp ${selectedTx.value.nominal.toLocaleString('id-ID')} di-refund 100% ke pembeli.`
    selectedTx.value.primaryActionLabel = 'Berita Acara'
    selectedTx.value.primaryActionType = 'report'
    notify(`Sengketa ${selectedTx.value.invoiceNumber} diselesaikan: Refund penuh ke pembeli.`)
  } else if (disputeDecision.value === 'release_full') {
    selectedTx.value.escrowStatus = '✓ Dana Diteruskan ke Seller'
    selectedTx.value.escrowStatusTone = 'released'
    selectedTx.value.escrowNote = `Mediasi Selesai: Klaim komplain ditolak, dana diteruskan ke seller.`
    selectedTx.value.primaryActionLabel = '✓ Bukti Transfer'
    selectedTx.value.primaryActionType = 'receipt'
    notify(`Sengketa ${selectedTx.value.invoiceNumber} diselesaikan: Dana dilepas ke seller.`)
  } else {
    notify(`Sengketa ${selectedTx.value.invoiceNumber} diselesaikan: Partial release 50% / 50%.`)
  }
  showMediationModal.value = false
}

function triggerReconcileBank() {
  notify('Sistem sedang melakukan rekonsiliasi manual Himbara Host-to-Host...')
  setTimeout(() => {
    notify('✓ Rekonsiliasi selesai: 1.420 transaksi matched. Saldo Escrow Rp 0 Variance!')
    showReconcileModal.value = false
  }, 1200)
}
</script>

<template>
  <div class="escrow-monitoring-content">
    <!-- Header Section -->
    <header class="page-heading">
      <div class="heading-copy">
        <div class="admin-breadcrumb">
          ▣ &nbsp; PORTAL SUPER ADMIN &nbsp;›&nbsp; TRANSAKSI & KEUANGAN &nbsp;›&nbsp; <b>Monitoring Rekber & Escrow</b>
        </div>
        <h1>Monitoring Transaksi, Rekber &<br />Rekonsiliasi Escrow</h1>
        <p>
          Pengawasan perputaran dana transaksi, pelepasan escrow rekening bersama, investigasi sengketa pembayaran, dan rekonsiliasi auto-settlement Bank Himbara.
        </p>
      </div>

      <div class="heading-actions">
        <button type="button" class="btn-outline" @click="notify('Mengunduh Jurnal Finansial Escrow (CSV)...')">
          <svg viewBox="0 0 24 24" class="btn-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Unduh Jurnal Finansial
        </button>
        <button type="button" class="btn-outline" @click="notify('Buka Konfigurasi SLA Pencairan & Escrow...')">
          <svg viewBox="0 0 24 24" class="btn-icon"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Konfigurasi SLA
        </button>
        <button type="button" class="btn-primary" @click="showReconcileModal = true">
          ＋ Audit Manual & Rekonsiliasi Bank
        </button>
      </div>
    </header>

    <!-- Escrow Protection Banner -->
    <section class="escrow-banner">
      <div class="banner-icon-wrap">
        <svg viewBox="0 0 24 24" class="shield-icon"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <div class="banner-body">
        <div class="banner-title-row">
          <h2>Sistem Escrow Terlindungi & Auto-Settlement Aktif</h2>
          <span class="status-pill mint">● Normal (Bank Himbara)</span>
        </div>
        <p>
          BRI, Mandiri, BNI, dan BCA terhubung online. Rata-rata waktu pencairan pasca-konfirmasi pembeli: <strong>4,2 jam</strong> (SLA pemerintah &lt; 24 jam).
        </p>
      </div>
      <div class="banner-reconcile-card">
        <div class="reconcile-info">
          <span>Dana Belum Rekonsiliasi H-1</span>
          <strong>Rp 0 <small>(100% Match)</small></strong>
        </div>
        <button type="button" class="btn-health-log" @click="notify('Health log integrasi API Himbara dibuka.')">
          Lihat Health Log
        </button>
      </div>
    </section>

    <!-- Stat Metrics Grid -->
    <section class="summary-stats-grid">
      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">REKBER REKENING AKTIF</span>
          <span class="stat-icon-wrap mint"><svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">Rp 342.180.000</strong>
        </div>
        <div class="stat-footer-row">
          <small class="stat-subtext">892 Transaksi Berjalan</small>
          <span class="delta-pill mint">100% Likuid Himbara</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">DANA SIAP DILEPAS (RELEASEABLE)</span>
          <span class="stat-icon-wrap green"><svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">Rp 1.140.470.000</strong>
        </div>
        <div class="stat-footer-row">
          <small class="stat-subtext">11.940 Transaksi Tanpa Komplain</small>
          <span class="delta-pill green">+14.2% MoM</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">SUBSIDI & KUPON ONGKIR</span>
          <span class="stat-icon-wrap orange"><svg viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">Rp 84.500.000</strong>
        </div>
        <div class="stat-footer-row">
          <small class="stat-subtext">Subsidi Kementerian UMK</small>
          <span class="delta-pill orange">70.4% Terpakai Q4</span>
        </div>
      </article>

      <article class="stat-card">
        <div class="stat-header">
          <span class="stat-title">SENGKETA / DISPUTE</span>
          <span class="stat-icon-wrap gold"><svg viewBox="0 0 24 24"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM7 21h10M12 3v18"/></svg></span>
        </div>
        <div class="stat-value-row">
          <strong class="stat-value">Rp 3.850.000</strong>
        </div>
        <div class="stat-footer-row">
          <small class="stat-subtext">2 Kasus Dalam Mediasi Logistik</small>
          <span class="delta-pill gold">SLA &lt; 12 Jam</span>
        </div>
      </article>
    </section>

    <!-- Cashflow & Escrow Bank Accounts 2-Column Section -->
    <div class="middle-grid">
      <!-- Left: Cashflow Chart -->
      <section class="chart-card">
        <header class="card-header">
          <div>
            <h2>Arus Kas Escrow & Pelepasan Dana</h2>
            <p>Komparasi nominal uang masuk dari pembeli vs pencairan otomatis ke UMKM.</p>
          </div>
          <div class="chart-legend">
            <span class="legend-item"><i class="dot inflow"></i> Inflow (QRIS / Bank)</span>
            <span class="legend-item"><i class="dot outflow"></i> Outflow (Disbursed)</span>
            <span class="time-pill">7 Hari Terakhir</span>
          </div>
        </header>

        <div class="chart-bars-list">
          <div v-for="item in cashflowData" :key="item.day" class="bar-row">
            <span class="day-label">{{ item.day }}</span>
            <div class="bars-container">
              <div class="bar-track">
                <div class="bar-fill inflow" :style="{ width: item.inflowPct + '%' }"></div>
              </div>
              <div class="bar-track">
                <div class="bar-fill outflow" :style="{ width: item.outflowPct + '%' }"></div>
              </div>
            </div>
            <div class="bar-values">
              <span class="val-inflow">Inflow: Rp {{ (item.inflow / 1000000).toFixed(1) }}jt</span>
              <span class="val-outflow">Outflow: Rp {{ (item.outflow / 1000000).toFixed(1) }}jt</span>
            </div>
          </div>
        </div>

        <footer class="chart-footer">
          <div class="footer-info">
            <span>⚡ Rata-rata GMV Harian: <strong>Rp 49.400.000</strong></span>
            <span class="settlement-badge">Settlement Speed: H+0 Terintegrasi Logistik</span>
          </div>
        </footer>
      </section>

      <!-- Right: Escrow Accounts -->
      <aside class="accounts-card">
        <header class="card-header compact">
          <div>
            <h2>Distribusi Rekening Penampung</h2>
            <p>Saldo riil penampungan escrow platform PasarPintar</p>
          </div>
          <svg viewBox="0 0 24 24" class="bank-icon"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
        </header>

        <div class="accounts-list">
          <article v-for="acc in bankAccounts" :key="acc.name" class="account-item">
            <div class="acc-main-row">
              <div class="acc-name-wrap">
                <span class="bank-logo-badge" :class="acc.bankCode.toLowerCase()">{{ acc.bankCode }}</span>
                <div>
                  <h3>{{ acc.name }}</h3>
                  <small>{{ acc.accNo }}</small>
                </div>
              </div>
              <div class="acc-balance-wrap">
                <strong>Rp {{ acc.balance.toLocaleString('id-ID') }}</strong>
                <small>({{ acc.sharePct }})</small>
              </div>
            </div>

            <div class="acc-status-row">
              <span class="acc-badge" :class="acc.tone">● {{ acc.statusBadge }}</span>
            </div>
          </article>
        </div>

        <button type="button" class="btn-accounts-footer" @click="notify('Rincian seluruh Rekening Virtual Account dibuka.')">
          Lihat Rincian Rekening Virtual Account →
        </button>
      </aside>
    </div>

    <!-- Main Transactions & Escrow Table Section -->
    <section class="table-container">
      <div class="table-top-bar">
        <nav class="table-tabs">
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'Semua' }"
            @click="activeTab = 'Semua'"
          >
            Semua Transaksi <small>(892)</small>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'Tertahan' }"
            @click="activeTab = 'Tertahan'"
          >
            Dana Tertahan <span class="pill-count blue">445</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'SiapDilepas' }"
            @click="activeTab = 'SiapDilepas'"
          >
            Siap Dilepas <span class="pill-count mint">345</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'Sengketa' }"
            @click="activeTab = 'Sengketa'"
          >
            Sengketa & Investigasi <span class="pill-count orange">2</span>
          </button>
          <button
            type="button"
            class="tab-btn"
            :class="{ active: activeTab === 'Refund' }"
            @click="activeTab = 'Refund'"
          >
            Refund <span class="pill-count gray">8</span>
          </button>
        </nav>

        <div class="table-quick-actions">
          <button type="button" class="btn-tool-sm" @click="notify('Mengeksport ledger escrow ke CSV...')">
            ⇩ Export Ledger
          </button>
          <button type="button" class="btn-tool-sm" title="Segarkan data" @click="notify('Data transaksi diperbarui.')">
            ↻ Refresh
          </button>
        </div>
      </div>

      <div class="search-filter-bar">
        <div class="search-input-wrap">
          <svg viewBox="0 0 24 24" class="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Cari No Invoice (INV-PP-...), Toko UMKM, atau Pembeli..."
            aria-label="Cari transaksi"
          />
        </div>

        <select v-model="selectedBank" class="filter-select" aria-label="Filter Bank">
          <option value="Semua Bank Escrow">Semua Bank Escrow</option>
          <option value="Mandiri">Bank Mandiri</option>
          <option value="BRI">Bank BRI</option>
          <option value="BCA">Bank BCA</option>
          <option value="BNI">Bank BNI</option>
          <option value="GoPay">QRIS / GoPay</option>
        </select>

        <select v-model="selectedStatusFilter" class="filter-select" aria-label="Filter Status">
          <option value="Semua Status">Status Pengiriman & Escrow</option>
          <option value="Selesai">Pesanan Selesai</option>
          <option value="Pengiriman">Dalam Pengiriman</option>
          <option value="Komplain">Sengketa / Komplain</option>
        </select>

        <select v-model="selectedTimeframe" class="filter-select" aria-label="Rentang Waktu">
          <option value="7 Hari Terakhir">7 Hari Terakhir</option>
          <option value="Hari ini">Hari Ini</option>
          <option value="Bulan Ini">Bulan Ini (Q4)</option>
        </select>
      </div>

      <div class="table-responsive">
        <table class="escrow-table">
          <thead>
            <tr>
              <th>INVOICE & TANGGAL</th>
              <th>TOKO UMKM & LOKASI</th>
              <th>PEMBELI & KOMODITAS</th>
              <th>KANAL & NOMINAL</th>
              <th>STATUS REKBER / ESCROW</th>
              <th class="text-center">AKSI OPERASIONAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in filteredTransactions" :key="tx.id" :class="{ 'is-dispute-row': tx.escrowStatusTone === 'dispute' }">
              <td>
                <div class="inv-cell">
                  <b class="inv-num">{{ tx.invoiceNumber }}</b>
                  <small>{{ tx.date }}</small>
                  <span class="inv-tag" :class="tx.statusTagTone">{{ tx.statusTag }}</span>
                </div>
              </td>
              <td>
                <div class="seller-cell">
                  <b>{{ tx.sellerName }}</b>
                  <small>📍 {{ tx.sellerLocation }}</small>
                  <code class="acc-code">{{ tx.sellerAccount }}</code>
                </div>
              </td>
              <td>
                <div class="buyer-cell">
                  <b>{{ tx.buyerName }}</b>
                  <small>{{ tx.buyerLocation }}</small>
                  <span class="commodity-name">{{ tx.commodityName }}</span>
                </div>
              </td>
              <td>
                <div class="nominal-cell">
                  <strong class="nominal-val">Rp {{ tx.nominal.toLocaleString('id-ID') }}</strong>
                  <small class="channel-lbl">{{ tx.channel }}</small>
                  <span class="subsidy-lbl" :class="{ danger: tx.subsidyDetail.includes('DIBEKUKAN') }">
                    {{ tx.subsidyDetail }}
                  </span>
                </div>
              </td>
              <td>
                <div class="escrow-status-cell">
                  <span
                    class="escrow-pill"
                    :class="{
                      ready: tx.escrowStatusTone === 'ready',
                      pending: tx.escrowStatusTone === 'pending',
                      dispute: tx.escrowStatusTone === 'dispute',
                      released: tx.escrowStatusTone === 'released',
                      refunded: tx.escrowStatusTone === 'refunded',
                    }"
                  >
                    {{ tx.escrowStatus }}
                  </span>
                  <p class="escrow-note">{{ tx.escrowNote }}</p>
                </div>
              </td>
              <td class="text-center">
                <div class="action-cell">
                  <button
                    type="button"
                    class="btn-action-main"
                    :class="{
                      release: tx.primaryActionType === 'release',
                      track: tx.primaryActionType === 'track',
                      mediate: tx.primaryActionType === 'mediate',
                      receipt: tx.primaryActionType === 'receipt',
                      report: tx.primaryActionType === 'report',
                    }"
                    @click="handlePrimaryAction(tx)"
                  >
                    {{ tx.primaryActionLabel }}
                  </button>
                  <button type="button" class="btn-action-sub" @click="notify(`Detail ${tx.invoiceNumber} dibuka.`)">
                    {{ tx.secondaryActionLabel }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredTransactions.length === 0">
              <td colspan="6" class="empty-table-cell">
                Tidak ada transaksi escrow yang sesuai dengan filter.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="table-pagination">
        <span>Menampilkan 1-{{ filteredTransactions.length }} dari 892 transaksi escrow aktif</span>

        <div class="pagination-buttons">
          <button type="button" disabled>‹</button>
          <button type="button" class="active">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <span>...</span>
          <button type="button">179</button>
          <button type="button">›</button>
        </div>
      </footer>
    </section>

    <!-- Bottom Footer Guidelines & Auto Log -->
    <div class="bottom-grid">
      <!-- Protocol & Compliance -->
      <article class="compliance-card">
        <header class="card-header compact">
          <span class="compliance-icon">🛡</span>
          <div>
            <h2>Protokol Rekber & Kepatuhan Bank Indonesia</h2>
            <p>Standar Tata Pengelolaan Akun Pembayaran PJT / Kategori 3</p>
          </div>
        </header>

        <p class="compliance-text">
          Sesuai dengan ketentuan PBI No. 23/6/PBI/2021, seluruh aliran transaksi pembeli disimpan secara terisolasi pada rekening giro escrow atas nama [Bank Himbara Escrow] dan hanya dapat dicairkan sebagai hak pedagang/seller setelah penerimaan barang terkonfirmasi atau sesuai batas SLA dispute resolution.
        </p>

        <div class="compliance-tags">
          <span class="tag-pill">✓ Audit Berkala OJK & BI</span>
          <span class="tag-pill">ISO 27001 Terakreditasi</span>
          <span class="tag-pill">Integrasi Bank Himbara Host-to-Host</span>
        </div>
      </article>

      <!-- Reconcile Auto Log -->
      <article class="reconcile-log-card">
        <header class="card-header compact">
          <span class="log-dot-live"></span>
          <div>
            <h2>Log Rekonsiliasi Otomatis Terakhir</h2>
            <p>Semua Rekening Seimbang (Escrow Reconciled)</p>
          </div>
        </header>

        <div class="log-items">
          <div class="log-item">
            <div class="log-item-header">
              <b>Batch BRI - 09:15 WIB (1.420 Transaksi)</b>
              <span class="match-badge">Matched: Rp 0</span>
            </div>
          </div>

          <div class="log-item">
            <div class="log-item-header">
              <b>Batch Mandiri - 09:00 WIB (840 Transaksi)</b>
              <span class="match-badge">Matched: Rp 0</span>
            </div>
          </div>
        </div>

        <div class="log-footer">
          <span>Jadwal batch berikutnya: 12:00 WIB (45 menit lagi)</span>
          <button type="button" class="btn-log-link" @click="notify('Riwayat rekonsiliasi otomatis lengkap dimuat.')">
            Lihat Riwayat Rekonsiliasi →
          </button>
        </div>
      </article>
    </div>

    <!-- Release Confirmation Modal -->
    <div v-if="showReleaseModal && selectedTx" class="modal-backdrop" @click.self="showReleaseModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>ESCROW DISBURSEMENT</small>
            <h2>Konfirmasi Pelepasan Dana Cepat</h2>
          </div>
          <button type="button" class="close-btn" @click="showReleaseModal = false">×</button>
        </header>

        <div class="modal-body">
          <p>Anda akan melakukan pelepasan dana manual dari Rekber Platform ke rekening UMKM:</p>
          <div class="info-box">
            <div><strong>Invoice:</strong> {{ selectedTx.invoiceNumber }}</div>
            <div><strong>Toko UMKM:</strong> {{ selectedTx.sellerName }}</div>
            <div><strong>Nominal Escrow:</strong> <span class="green-text">Rp {{ selectedTx.nominal.toLocaleString('id-ID') }}</span></div>
            <div><strong>Tujuan Transfer:</strong> {{ selectedTx.sellerAccount }}</div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="showReleaseModal = false">Batal</button>
          <button type="button" class="btn-submit-green" @click="confirmReleaseDana">Proses Transfer Sekarang</button>
        </footer>
      </div>
    </div>

    <!-- Mediation Room Modal -->
    <div v-if="showMediationModal && selectedTx" class="modal-backdrop" @click.self="showMediationModal = false">
      <div class="modal-dialog mediation-dialog">
        <header class="modal-header">
          <div>
            <small>PUSTAKA SENGKETA & MEDIASI</small>
            <h2>Ruang Mediasi Dispute #{{ selectedTx.invoiceNumber }}</h2>
          </div>
          <button type="button" class="close-btn" @click="showMediationModal = false">×</button>
        </header>

        <div class="modal-body">
          <div class="dispute-info-card">
            <div class="dispute-party">
              <small>Pembeli:</small>
              <b>{{ selectedTx.buyerName }} ({{ selectedTx.buyerLocation }})</b>
              <p>Klaim: "1 botol Madu Akasia pecah saat penerimaan kargo. Rekaman video unboxing telah diunggah."</p>
            </div>
            <div class="dispute-party">
              <small>Penjual UMKM:</small>
              <b>{{ selectedTx.sellerName }} ({{ selectedTx.sellerLocation }})</b>
              <p>Tanggapan: "Pengemasan bubble wrap sudah berlapis 3. Mohon klaim garansi ekspedisi 50%."</p>
            </div>
          </div>

          <label class="form-group">
            <span>Keputusan Mediasi Admin *</span>
            <select v-model="disputeDecision">
              <option value="refund_full">Refund 100% ke Pembeli (Rp {{ selectedTx.nominal.toLocaleString('id-ID') }})</option>
              <option value="release_full">Lepas Dana 100% ke Seller (Klaim Ditolak)</option>
              <option value="partial_50">Split 50% Refund / 50% Seller Disbursement</option>
            </select>
          </label>

          <label class="form-group">
            <span>Catatan Berita Acara Mediasi</span>
            <textarea v-model="disputeResolutionNote" placeholder="Ketik alasan keputusan mediasi berdasarkan bukti unboxing dan polis asuransi kargo..."></textarea>
          </label>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="showMediationModal = false">Batal</button>
          <button type="button" class="btn-submit-orange" @click="resolveDispute">Putuskan Mediasi</button>
        </footer>
      </div>
    </div>

    <!-- Tracking Modal -->
    <div v-if="showTrackingModal && selectedTx" class="modal-backdrop" @click.self="showTrackingModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>LOGISTIK REAL-TIME</small>
            <h2>Pelacakan Kargo #{{ selectedTx.invoiceNumber }}</h2>
          </div>
          <button type="button" class="close-btn" @click="showTrackingModal = false">×</button>
        </header>

        <div class="modal-body">
          <div class="tracking-timeline">
            <div class="timeline-step done">
              <span class="step-dot">✓</span>
              <div><b>Paket Diserahkan ke Kurir J&T Cargo</b><small>Ngada, Flores · 25 Okt, 10:00 WITA</small></div>
            </div>
            <div class="timeline-step active">
              <span class="step-dot">◷</span>
              <div><b>Tiba di Transit Hub Surabaya</b><small>Surabaya · Hari ini, 04:30 WIB (In Transit)</small></div>
            </div>
            <div class="timeline-step">
              <span class="step-dot">○</span>
              <div><b>Kurir Menuju Alamat Pembeli</b><small>Estimasi Tiba: Besok Sore</small></div>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-submit-green" @click="showTrackingModal = false">Tutup Pelacakan</button>
        </footer>
      </div>
    </div>

    <!-- Bank Reconciliation Audit Modal -->
    <div v-if="showReconcileModal" class="modal-backdrop" @click.self="showReconcileModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>SYSTEM RECONCILIATION</small>
            <h2>Audit Manual & Rekonsiliasi Bank Himbara</h2>
          </div>
          <button type="button" class="close-btn" @click="showReconcileModal = false">×</button>
        </header>

        <div class="modal-body">
          <p>Sinkronisasi saldo Giro Escrow dengan catatan ledger internal platform PasarPintar secara otomatis melalui API Host-to-Host.</p>
          <div class="reconcile-options">
            <div class="option-row">
              <b>Rekber BRI (Escrow Utama)</b>
              <span class="status-pill mint">API Online</span>
            </div>
            <div class="option-row">
              <b>Rekber Bank Mandiri VA</b>
              <span class="status-pill mint">API Online</span>
            </div>
            <div class="option-row">
              <b>Rekber BNI & BCA Giro</b>
              <span class="status-pill mint">API Online</span>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="showReconcileModal = false">Batal</button>
          <button type="button" class="btn-submit-green" @click="triggerReconcileBank">Jalankan Sync Rekonsiliasi</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.escrow-monitoring-content {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 24px 28px 36px;
  color: #0f172a;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  font-size: 13.5px;
  line-height: 1.5;
}

.escrow-monitoring-content * {
  box-sizing: border-box;
}

.escrow-monitoring-content button,
.escrow-monitoring-content input,
.escrow-monitoring-content select,
.escrow-monitoring-content textarea {
  font-family: inherit;
}

.escrow-monitoring-content button {
  cursor: pointer;
}

/* Header */
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

/* Escrow Banner */
.escrow-banner {
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

.banner-body p {
  margin: 4px 0 0;
  color: #047857;
  font-size: 12.5px;
}

.banner-reconcile-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 14px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #a7f3d0;
}

.reconcile-info span {
  display: block;
  color: #64748b;
  font-size: 10.5px;
  font-weight: 600;
}

.reconcile-info strong {
  color: #059669;
  font-size: 14px;
}

.reconcile-info small {
  color: #10b981;
  font-size: 11px;
}

.btn-health-log {
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
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
.stat-icon-wrap.gold { color: #d97706; background: #fffbeb; }

.stat-value-row {
  margin-bottom: 6px;
}

.stat-value {
  color: #0f172a;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.stat-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}

.stat-subtext {
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
.delta-pill.gold { color: #b45309; background: #fef3c7; }

/* Middle 2-Column Section */
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

.card-header.compact {
  align-items: center;
}

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

.dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.dot.inflow { background: #059669; }
.dot.outflow { background: #ea580c; }

.time-pill {
  padding: 2px 8px;
  border-radius: 10px;
  background: #f1f5f9;
  font-size: 10.5px;
  font-weight: 700;
}

.chart-bars-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.bar-row {
  display: grid;
  grid-template-columns: 140px 1fr 220px;
  align-items: center;
  gap: 10px;
  font-size: 11.5px;
}

.day-label {
  color: #334155;
  font-weight: 600;
}

.bars-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bar-track {
  height: 6px;
  border-radius: 3px;
  background: #f1f5f9;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 3px;
}

.bar-fill.inflow { background: #059669; }
.bar-fill.outflow { background: #ea580c; }

.bar-values {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
}

.val-inflow { color: #059669; }
.val-outflow { color: #ea580c; }

.chart-footer {
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
  font-size: 12px;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #475569;
}

.settlement-badge {
  padding: 3px 8px;
  border-radius: 6px;
  color: #047857;
  background: #ecfdf5;
  font-size: 11px;
  font-weight: 700;
}

/* Escrow Bank Accounts */
.bank-icon {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: #64748b;
  stroke-width: 2;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.account-item {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.acc-main-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.acc-name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bank-logo-badge {
  padding: 3px 6px;
  border-radius: 4px;
  color: #ffffff;
  background: #0f172a;
  font-size: 9.5px;
  font-weight: 900;
}

.bank-logo-badge.bri { background: #00529c; }
.bank-logo-badge.mandiri { background: #002d62; }
.bank-logo-badge.bni { background: #f26522; }
.bank-logo-badge.qris { background: #dc2626; }

.acc-name-wrap h3 {
  margin: 0;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}

.acc-name-wrap small {
  color: #64748b;
  font-size: 10.5px;
}

.acc-balance-wrap {
  text-align: right;
}

.acc-balance-wrap strong {
  display: block;
  color: #059669;
  font-size: 13.5px;
}

.acc-balance-wrap small {
  color: #64748b;
  font-size: 10.5px;
}

.acc-status-row {
  display: flex;
  justify-content: flex-end;
}

.acc-badge {
  font-size: 10.5px;
  font-weight: 700;
}

.acc-badge.mint { color: #047857; }
.acc-badge.blue { color: #0284c7; }
.acc-badge.green { color: #16a34a; }

.btn-accounts-footer {
  width: 100%;
  padding: 8px 0;
  border: 0;
  color: #047857;
  background: transparent;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
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

.table-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.table-tabs {
  display: flex;
  align-items: center;
  gap: 16px;
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

.pill-count {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 800;
}

.pill-count.blue { color: #1d4ed8; background: #dbeafe; }
.pill-count.mint { color: #047857; background: #d1fae5; }
.pill-count.orange { color: #c2410c; background: #ffedd5; }
.pill-count.gray { color: #475569; background: #e2e8f0; }

.table-quick-actions {
  display: flex;
  gap: 8px;
}

.btn-tool-sm {
  padding: 5px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 600;
}

.search-filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
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

/* Escrow Table */
.table-responsive {
  overflow-x: auto;
}

.escrow-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12.5px;
}

.escrow-table th {
  padding: 10px 14px;
  color: #64748b;
  background: #f8fafc;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  border-bottom: 1px solid #e2e8f0;
}

.escrow-table td {
  padding: 14px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.is-dispute-row td {
  background: #fff8f6;
}

.inv-num {
  display: block;
  color: #0f172a;
  font-weight: 800;
}

.inv-cell small {
  color: #64748b;
  font-size: 11px;
}

.inv-tag {
  display: inline-block;
  margin-top: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.inv-tag.mint { color: #047857; background: #ecfdf5; }
.inv-tag.blue { color: #1d4ed8; background: #eff6ff; }
.inv-tag.orange { color: #c2410c; background: #fff7ed; }
.inv-tag.red { color: #b91c1c; background: #fef2f2; }

.seller-cell b {
  display: block;
  color: #0f172a;
  font-size: 12.5px;
}

.seller-cell small {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.acc-code {
  color: #059669;
  font-size: 10.5px;
}

.buyer-cell b {
  display: block;
  color: #0f172a;
}

.buyer-cell small {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.commodity-name {
  display: inline-block;
  margin-top: 2px;
  color: #475569;
  font-size: 11.5px;
  font-weight: 600;
}

.nominal-val {
  display: block;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}

.channel-lbl {
  display: block;
  color: #64748b;
  font-size: 11px;
}

.subsidy-lbl {
  display: block;
  margin-top: 2px;
  color: #059669;
  font-size: 10.5px;
  font-weight: 700;
}

.subsidy-lbl.danger {
  color: #dc2626;
}

.escrow-pill {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
}

.escrow-pill.ready { color: #047857; background: #ecfdf5; border: 1px solid #a7f3d0; }
.escrow-pill.pending { color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; }
.escrow-pill.dispute { color: #b91c1c; background: #fef2f2; border: 1px solid #fecdd3; }
.escrow-pill.released { color: #15803d; background: #f0fdf4; }
.escrow-pill.refunded { color: #475569; background: #f1f5f9; }

.escrow-note {
  margin: 4px 0 0;
  color: #475569;
  font-size: 11px;
  line-height: 1.35;
  max-width: 280px;
}

.action-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.btn-action-main {
  width: 130px;
  height: 32px;
  border: 0;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 700;
}

.btn-action-main.release { color: #ffffff; background: #047857; }
.btn-action-main.track { color: #334155; background: #ffffff; border: 1px solid #cbd5e1; }
.btn-action-main.mediate { color: #ffffff; background: #ea580c; }
.btn-action-main.receipt { color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; }
.btn-action-main.report { color: #475569; background: #ffffff; border: 1px solid #cbd5e1; }

.btn-action-sub {
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

.text-center { text-align: center; }

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

/* Bottom Grid */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.compliance-card,
.reconcile-log-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.compliance-icon {
  font-size: 20px;
}

.compliance-text {
  color: #475569;
  font-size: 11.5px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.compliance-tags {
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

.log-dot-live {
  width: 10px;
  height: 10px;
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

.log-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-item-header b {
  color: #0f172a;
}

.match-badge {
  color: #059669;
  font-weight: 700;
}

.log-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: #64748b;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.btn-log-link {
  border: 0;
  background: transparent;
  color: #047857;
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

.mediation-dialog {
  width: min(600px, 100%);
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

.info-box {
  margin-top: 10px;
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dispute-info-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.dispute-party {
  padding: 10px;
  border-radius: 8px;
  background: #f8fafc;
  border-left: 3px solid #ea580c;
}

.dispute-party small {
  color: #64748b;
  font-weight: 700;
}

.dispute-party b {
  display: block;
  color: #0f172a;
  font-size: 12.5px;
}

.dispute-party p {
  margin: 4px 0 0;
  color: #475569;
  font-size: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
  font-weight: 700;
}

.form-group select,
.form-group textarea {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12.5px;
  outline: 0;
}

.form-group textarea {
  height: 70px;
  resize: vertical;
}

.reconcile-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.option-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  background: #f8fafc;
}

.tracking-timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-left: 10px;
}

.timeline-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.step-dot {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #cbd5e1;
  font-size: 12px;
}

.timeline-step.done .step-dot { background: #059669; }
.timeline-step.active .step-dot { background: #0284c7; }

.timeline-step b {
  display: block;
  color: #0f172a;
  font-size: 13px;
}

.timeline-step small {
  color: #64748b;
  font-size: 11.5px;
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

.btn-submit-green {
  height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #047857;
  font-size: 12.5px;
  font-weight: 700;
}

.btn-submit-orange {
  height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #ea580c;
  font-size: 12.5px;
  font-weight: 700;
}

.green-text { color: #059669; }

@media (max-width: 1080px) {
  .summary-stats-grid { grid-template-columns: repeat(2, 1fr); }
  .middle-grid { grid-template-columns: 1fr; }
  .bottom-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .page-heading { flex-direction: column; }
  .summary-stats-grid { grid-template-columns: 1fr; }
  .escrow-banner { flex-direction: column; align-items: flex-start; }
}
</style>
