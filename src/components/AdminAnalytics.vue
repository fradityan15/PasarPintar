<script setup lang="ts">
import { computed, ref } from 'vue'

const period = ref('YTD 2024')
const region = ref('Semua Wilayah')
const sector = ref('Semua Sektor')
const granularity = ref('Bulanan')
const customStart = ref('2024-01-01')
const customEnd = ref('2024-12-31')
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const periods = ['YTD 2024', 'Q1–Q2 2024', '30 Hari Terakhir', 'Kustom']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const transactionValues = [35, 42, 48, 59, 67, 73, 69, 76, 80, 88, 94, 100]
const regionalData = [
  { name: 'Jawa Tengah', detail: '3.420 Toko UMKM · Kopi, Jamu & Batik', value: 'Rp 12,40 M', rate: 'Logistik 98,4% (1,8 Hari)', color: 'green' },
  { name: 'Jawa Barat & DKI Jakarta', detail: '2.890 Toko UMKM · Kriya & Bumbu F&B', value: 'Rp 10,15 M', rate: 'Logistik 99,1% (1,2 Hari)', color: 'green' },
  { name: 'Nusa Tenggara Timur', detail: '1.120 Toko · Tenun Ikat Ende & Kopi Bajawa', value: 'Rp 5,80 M', rate: 'Kurasi Disubsidi 65%', color: 'coral' },
  { name: 'Sulawesi Selatan', detail: '980 Toko · Sutera Sengkang, Kopi Toraja', value: 'Rp 4,92 M', rate: 'Logistik 97,5% (2,4 Hari)', color: 'gray' },
  { name: 'Riau & Sumatera Barat', detail: '840 Toko · Madu Silung, Songket & Silek', value: 'Rp 4,10 M', rate: 'Logistik 94,0% (2,8 Hari)', color: 'gray' },
]
const commodityData = [
  { icon: '♧', name: 'Kopi Arabika Sindoro–Sumbing', seller: 'Koperasi Tani Sindoro Lestari', province: 'Kab. Temanggung, Jawa Tengah', certifications: ['IG Kemenkumham', 'Organik SNI', 'Halal'], capacity: '3.5 Ton / Bln', value: 'Rp 2,18 M', destination: 'Jepseng, Jerman, Belanda', status: 'Kontrak Ekspor Aktif', tone: 'green' },
  { icon: '▨', name: 'Kain Tenun Ikat Wolowaru', seller: 'Sanggar Tenun Wolowaru', province: 'Kab. Ende, NTT', certifications: ['Pewarna Alam', 'Sertifikasi Kemenkumham'], capacity: '180 Lembar / Bln', value: 'Rp 1,42 M', destination: 'Prancis, Australia, AS', status: 'Kurasi · Diaspora Binaan', tone: 'coral' },
  { icon: '♧', name: 'Madu Hutan Akasia Sialang', seller: 'KTH Rimba Sakti', province: 'Kab. Siak, Riau', certifications: ['BPOM MD', 'SNI Kemurnian', 'Halal'], capacity: '2.400 Jar / Bln', value: 'Rp 890 Juta', destination: 'Singapura, Malaysia', status: 'Karantina & Uji Lab Selesai', tone: 'green' },
  { icon: '◇', name: 'Kerajinan Anyaman Bambu Rajapolah', seller: 'Sentra Kriya Anyaman Tasik', province: 'Kab. Tasikmalaya, Jabar', certifications: ['Fumigasi Ekspor', 'SVLK Kayu/Bambu'], capacity: '1.200 Set / Bln', value: 'Rp 740 Juta', destination: 'Korea Selatan, Uni Emirat Arab', status: 'Fulfillment Batch 2', tone: 'gray' },
]
const filteredRegionalData = computed(() => {
  if (region.value === 'Semua Wilayah') return regionalData
  const match = regionalData.filter((item) => item.name.toLocaleLowerCase('id').includes(region.value.toLocaleLowerCase('id')))
  return match.length ? match : regionalData.slice(0, 3)
})
const activeShare = computed(() => sector.value === 'Kriya & Kerajinan' ? '12,3%' : sector.value === 'Wastra & Tenun' ? '26,8%' : sector.value === 'Kuliner & Herbal' ? '21,5%' : '34,2%')

function notify(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 2600)
}

function exportAnalytics() {
  const rows = [
    ['Laporan Analitik PasarPintar', period.value, region.value, sector.value],
    ['Provinsi', 'GMV', 'Pertumbuhan Transaksi', 'Efisiensi Logistik'],
    ...filteredRegionalData.value.map((item) => [item.name, item.value, item.rate.includes('98') ? '+31,2%' : '+18,5%', item.rate]),
  ]
  const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'pasarpintar-laporan-analitik-2024.csv'
  link.click()
  URL.revokeObjectURL(url)
  notify('Rekap analitik berhasil diunduh.')
}

function printReport() {
  window.print()
}
</script>

<template>
  <main class="analytics-content">
    <div class="analytics-heading">
      <div class="analytics-heading-copy">
        <div class="analytics-breadcrumb">PORTAL SUPER ADMIN <i>›</i> UTAMA <i>›</i> <b>LAPORAN & STATISTIK ANALISIS NASIONAL</b></div>
        <div class="analytics-title-row"><h1>Laporan &amp; Statistik Analisis Nasional Ekosistem UMKM</h1><span class="telemetry"><i/> LIVE TELEMETRI 38 PROVINSI</span></div>
        <p>Agregasi data makro ekonomi, tren perputaran nilai transaksi (GMV), performa klaster sentra daerah 38 provinsi, efektivitas subsidi logistik 3T, dan kesiapan penetrasi ekspor komoditas binaan.</p>
      </div>
      <div class="report-controls">
        <div class="period-tabs" role="group" aria-label="Periode laporan"><button v-for="item in periods" :key="item" type="button" :class="{ active: period === item }" :aria-pressed="period === item" @click="period = item">{{ item }}<span v-if="item === 'Kustom'">▣</span></button></div>
        <label class="filter-select"><span>☷</span><select v-model="region" aria-label="Filter wilayah"><option>Semua Wilayah</option><option>Jawa Tengah</option><option>Jawa Barat</option><option>Nusa Tenggara Timur</option><option>Sulawesi Selatan</option><option>Riau</option></select></label>
        <label class="filter-select sector-select"><span>⌘</span><select v-model="sector" aria-label="Filter sektor"><option>Semua Sektor</option><option>Kuliner & Herbal</option><option>Wastra & Tenun</option><option>Kriya & Kerajinan</option></select></label>
        <div class="export-actions-group">
          <button class="export-pdf" type="button" @click="printReport">▤ &nbsp; Unduh Rekap (PDF)</button>
          <button class="export-data" type="button" @click="exportAnalytics">⇧ &nbsp; Export Data Analitik</button>
        </div>
        <div v-if="period === 'Kustom'" class="custom-range"><label>Dari <input v-model="customStart" type="date" aria-label="Tanggal mulai"/></label><label>Sampai <input v-model="customEnd" type="date" aria-label="Tanggal akhir"/></label></div>
      </div>
    </div>

    <section class="macro-banner"><div class="macro-icon">◈</div><div class="macro-copy"><span class="macro-kicker"><i/> SINKRONISASI INDIKATOR MAKRO KEMENKOP UKM & BAPPENAS</span><h2>Target Pertumbuhan Digitalisasi UMKM Nasional 2024<br/>Telah Tercapai 84.6%</h2><div class="macro-chips"><span>↗ Penetrasi Pasar Antar pulau <b>+31.2%</b></span><span>◉ Rasio Onboarding Daerah 3T <b>3 Klaster</b></span><span>♧ Nir-Sengketa Escrow <b>99.8%</b></span></div></div><button type="button" @click="notify('Ringkasan kebijakan fiskal UMKM akan dibuka di tab baru.')">Lihat Ringkasan Kebijakan Fiskal UKM <b>→</b></button></section>

    <section class="metric-grid" aria-label="Indikator kinerja utama">
      <article class="metric-card"><div class="metric-top"><small>GROSS MERCHANDISE<br/>VALUE (GMV)</small><span class="metric-icon mint">▣</span></div><strong>Rp 48,65<br class="metric-break"/> M</strong><div class="metric-change">↗ <b>+24.8%</b> <span>vs Rp 38,98 M<br/>(2023)</span></div><div class="metric-foot">Rata-rata Order <b>Rp 285.000 / trx</b></div></article>
      <article class="metric-card"><div class="metric-top"><small>TOTAL UMKM AKTIF<br/>TRANSAKSI</small><span class="metric-icon mint">▦</span></div><strong>14.210<br class="metric-break"/> Toko</strong><div class="metric-change"><b>+1.240 Toko</b> <span>+12.4% MoM<br/>(Target 15K)</span></div><div class="metric-foot">Legalitas (NIB & BPOM/Halal) <b>87.2% Terverifikasi</b></div></article>
      <article class="metric-card"><div class="metric-top"><small>EFISIENSI SUBSIDI<br/>ONGKIR 3T</small><span class="metric-icon coral">▰</span></div><strong>Rp 2,42 M</strong><div class="metric-change"><b>31.420 Resi<br/>Disubsidi</b> <span>74.2% Anggaran Q2</span></div><div class="metric-foot">Reduksi <b>~48% Lebih</b><br/>Disparitas Ongkir Hemat</div></article>
      <article class="metric-card"><div class="metric-top"><small>KESIAPAN PENETRASI<br/>EKSPOR</small><span class="metric-icon gray">◉</span></div><strong>420 SKU</strong><div class="metric-change"><b>Indikasi Geografis (IG)</b> <span>+18.5% QoQ<br/>(ASEAN)</span></div><div class="metric-foot">Potensi Pipeline Kontrak <b class="coral-text">USD 1.2M</b></div></article>
    </section>

    <section class="chart-grid">
      <article class="report-panel trend-panel"><header class="panel-title"><div><span class="panel-mark">⌁</span><span><h2>Tren Nilai Transaksi (GMV) &amp; Volume<br/>Pesanan Nasional</h2><small>Realisasi perputaran komoditas terverifikasi periode Januari – Desember 2024</small></span></div><div class="chart-controls"><button type="button" :class="{ active: granularity === 'GMV' }" @click="granularity = 'GMV'">GMV<br/>(Rp)</button><button type="button" :class="{ active: granularity === 'Volume' }" @click="granularity = 'Volume'">Volume<br/>(Trx)</button><div><button type="button" :class="{ active: granularity === 'Bulanan' }" @click="granularity = 'Bulanan'">Bulanan</button><button type="button" :class="{ active: granularity === 'Kuartalan' }" @click="granularity = 'Kuartalan'">Kuartalan</button></div></div></header>
        <div class="chart-legend"><span><i class="legend-green"/> Realisasi Domestik Antardaerah</span><span><i class="legend-coral"/> Klaster 3T &amp; Subsidi Logistik</span><span><i class="legend-mint"/> Proyeksi Q3 &amp; Q4</span><small>◷ Dalam Satuan Miliar Rupiah</small></div>
        <div class="trend-chart" role="img" :aria-label="`Grafik tren ${granularity}, periode ${period}`"><div class="chart-y-labels"><span>50 M</span><span>40 M</span><span>30 M</span><span>20 M</span><span>10 M</span></div><div class="plot-area"><div class="chart-gridlines"><i/><i/><i/><i/><i/></div><div class="bar-series"><div v-for="(value, index) in transactionValues" :key="months[index]" class="bar-group"><span v-if="index === 4 || index === 5" class="bar-subsidy" :style="{ height: `${value * .61}%` }"/><span :class="index > 7 ? 'bar-projection' : 'bar-domestic'" :style="{ height: `${value * .72}%` }"/></div></div><svg class="trend-line" viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="analytics-area-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#70ceb0" stop-opacity=".3"/><stop offset="100%" stop-color="#70ceb0" stop-opacity="0"/></linearGradient></defs><polygon points="0,151 54,136 109,126 163,106 218,79 272,67 327,76 381,59 436,51 490,38 545,24 600,9 600,180 0,180" fill="url(#analytics-area-fill)"/><polyline points="0,151 54,136 109,126 163,106 218,79 272,67 327,76 381,59 436,51 490,38 545,24 600,9" fill="none" stroke="#087d65" stroke-width="3" vector-effect="non-scaling-stroke"/><circle cx="218" cy="79" r="4" fill="white" stroke="#ef6445" stroke-width="2" vector-effect="non-scaling-stroke"/><circle cx="272" cy="67" r="4" fill="white" stroke="#087d65" stroke-width="2" vector-effect="non-scaling-stroke"/></svg></div><div class="chart-x-labels"><span v-for="month in months" :key="month">{{ month }}</span></div></div>
        <div class="insight-note"><b>♧ &nbsp; Insight Momentum Pasar:</b> Puncak transaksi terjadi pada momentum Hari Belanja UMKM Nasional (Harbolnas Lokal) dengan lonjakan volume 182% pada komoditas Kopi Specialty dan Makanan Ringan Awet. Efektivitas subsidi kargo 3T mendorong 4.800 transaksi rute Indonesia Timur.</div>
      </article>
      <article class="report-panel share-panel"><header class="panel-title"><div><span class="panel-mark">◉</span><span><h2>Kontribusi GMV<br/>Komoditas</h2><small>Distribusi transaksi agregat per klaster komoditas nasional</small></span></div><small>38<br/>Provinsi</small></header><div class="donut-wrap"><div class="donut-chart" :style="{ '--donut-highlight': activeShare }"><div><small>DOMINAN</small><b>{{ activeShare }}</b><span>{{ sector === 'Semua Sektor' ? 'Kopi & Rempah' : sector }}</span></div></div></div><div class="share-legend"><button type="button" :class="{ highlighted: sector === 'Semua Sektor' || sector === 'Kuliner & Herbal' }" @click="sector = 'Kuliner & Herbal'"><i class="share-green"/><span>Kopi &amp; Hasil Bumi<br/>Nusantara</span><b>34.2%<small>Rp 16,63 M</small></b></button><button type="button" :class="{ highlighted: sector === 'Wastra & Tenun' }" @click="sector = 'Wastra & Tenun'"><i class="share-coral"/><span>Wastra, Tenun &amp; Batik</span><b>26.8%<small>Rp 13,04 M</small></b></button><button type="button" :class="{ highlighted: sector === 'Kuliner & Herbal' }" @click="sector = 'Kuliner & Herbal'"><i class="share-orange"/><span>Kuliner Kemasan &amp; Herbal</span><b>21.5%<small>Rp 10,46 M</small></b></button><button type="button" :class="{ highlighted: sector === 'Kriya & Kerajinan' }" @click="sector = 'Kriya & Kerajinan'"><i class="share-mint"/><span>Kriya, Anyaman &amp; Ukir Kayu</span><b>12.3%<small>Rp 5,98 M</small></b></button><button type="button" :class="{ highlighted: sector === 'Semua Sektor' }" @click="sector = 'Semua Sektor'"><i class="share-gray"/><span>Produk Sirkular &amp; Ramah Lingkungan</span><b>5.2%<small>Rp 2,54 M</small></b></button></div><button class="detail-category" type="button" @click="notify('Rincian GMV per kategori dipilih.')">Analisis Detail Tiap Kategori →</button></article>
    </section>

    <section class="report-panel regional-panel"><header class="panel-title"><div><span class="panel-mark">⌘</span><span><h2>Distribusi Kinerja Transaksi per Wilayah &amp; Koridor Ekonomi Nusantara</h2><small>Pemetaan daya beli, sentra produksi binaan, dan kelancaran jalur logistik antarpulau di 38 provinsi.</small></span></div><span class="bpjs-tag">Terintegrasi Dashboard Bappenas &amp; Kemenhub</span></header><div class="regional-grid"><div><h3>Top 5 Provinsi Pertumbuhan Transaksi Tertinggi <small>Metrik: GMV, Toko &amp; Lead Time</small></h3><article v-for="(item, index) in filteredRegionalData" :key="item.name" class="region-row"><span :class="['rank', item.color]">{{ index + 1 }}</span><div><b>{{ item.name }}</b><small>{{ item.detail }}</small></div><span><b>{{ item.value }}</b><small>{{ item.rate }}</small></span></article></div><div class="logistics-card"><h3>⌖ &nbsp; Matriks Efektivitas Rantai Pasok Antarpulau <small>Tervalidasi Pos Indonesia &amp; Mitra 3PL</small></h3><div class="logistic-meter"><div><span>Rata-rata Durasi Pengiriman Nasional</span><b>2.6 Hari <small>Target &lt; 3.0 Hari</small></b></div><i><span style="width:87%"/></i><small>Paling cepat: Koridor Jawa-Bali (1.1 Hari) | Menantang: Maluku Tenggara (4.2 Hari)</small></div><div class="logistic-meter"><div><span>Tingkat Retur &amp; Kerusakan Kemasan</span><b>0.12% <small>Benchmark 0.85%</small></b></div><i><span style="width:22%"/></i><small>Didukung standardisasi packaging ramah lingkungan PasarPintar &amp; label fragile terjamin</small></div><div class="logistic-meter"><div><span>Utilisasi Gudang Konsolidasi Daerah (Hub 3T)</span><b>84.2% <small>Kapasitas <em>Optimal</em></small></b></div><i><span style="width:84%"/></i><small>6 Hub Aktif: Medan, Surabaya, Makassar, Denpasar, Kupang, Jayapura</small></div><div class="logistic-meter"><div><span>Kecepatan Pencairan Rekber ke Rekening UMKM</span><b>4.2 Jam <small>SLA &lt; 24 Jam</small></b></div><i><span style="width:90%"/></i><small>Integrasi API Bank BRI, Mandiri, BNI &amp; BSI dengan auto-settlement setelah konfirmasi paket</small></div></div></div></section>

    <section class="report-panel export-panel"><header class="panel-title"><div><span class="panel-mark">⌁</span><span><h2>Laporan Klaster Komoditas Siap Ekspor &amp; Kemitraan Diaspora</h2><small>Kurasi komoditas unggulan tersertifikasi standar ekspor internasional dan kemitraan ITPC Kemendag.</small></span></div><span class="pipeline-tag">Total Pipeline Ekspor: USD 1,25M</span></header><div class="table-scroll"><table><thead><tr><th>NAMA KOMODITAS &amp; SENTRA</th><th>PROVINSI / ASAL</th><th>SERTIFIKASI LEGAL</th><th>KAPASITAS BULANAN</th><th>NILAI GMV YTD</th><th>NEGARA TUJUAN EKSPOR</th><th>STATUS KURASI EKSPOR</th></tr></thead><tbody><tr v-for="item in commodityData" :key="item.name"><td><div class="commodity-name"><i :class="item.tone">{{ item.icon }}</i><span><b>{{ item.name }}</b><small>{{ item.seller }}</small></span></div></td><td>{{ item.province }}</td><td><span class="cert-list"><i v-for="cert in item.certifications" :key="cert">{{ cert }}</i></span></td><td>{{ item.capacity }}</td><td><b class="gmv-value">{{ item.value }}</b></td><td><span class="destination">⌖ &nbsp;{{ item.destination }}</span></td><td><span class="export-status" :class="item.tone">{{ item.status }}</span></td></tr></tbody></table></div><footer class="table-footer"><span>Menampilkan 4 dari 28 Klaster Ekspor Aktif Seluruh Indonesia</span><div><button type="button" disabled>Sebelumnya</button><button class="current" type="button">1</button><button type="button" @click="notify('Halaman 2 laporan ekspor dipilih.')">2</button><button type="button" @click="notify('Halaman 3 laporan ekspor dipilih.')">3</button><button type="button" @click="notify('Halaman berikutnya dipilih.')">Berikutnya</button></div></footer></section>

    <footer class="analytics-footer"><span>◈ &nbsp; Platform terintegrasi langsung dengan <b>Sistem Informasi Satu Data UMKM</b><br/>Kemenkop UKM, Kemenperin, dan Badan Pusat Statistik (BPS). Seluruh agregat data transaksi dilindungi standar audit ISO/IEC 27001 dan UU Perlindungan Data Pribadi No. 27/2022.</span><small>KONSISTENSI DATA: 99.98% &nbsp; LAST AUDIT: HARI INI 08:30 WIB</small></footer>
    <Transition name="toast"><div v-if="toastMessage" class="analytics-toast" role="status"><span>✓</span>{{ toastMessage }}</div></Transition>
  </main>
</template>

<style scoped>
.analytics-content {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 24px 28px 32px;
  color: #0f172a;
  font: 14px/1.5 'DM Sans', system-ui, -apple-system, sans-serif;
}

.analytics-content * {
  box-sizing: border-box;
}

.analytics-content button,
.analytics-content input,
.analytics-content select {
  font: inherit;
}

.analytics-content button {
  cursor: pointer;
}

/* Header & Breadcrumb */
.analytics-heading {
  position: relative;
  margin-bottom: 24px;
}

.analytics-breadcrumb {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.analytics-breadcrumb i {
  padding: 0 4px;
  color: #cbd5e1;
  font-style: normal;
}

.analytics-breadcrumb b {
  color: #059669;
}

.analytics-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.analytics-title-row h1 {
  margin: 0;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
  font-size: 26px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.telemetry {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
  padding: 4px 10px;
  border-radius: 20px;
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
}

.telemetry i,
.macro-kicker i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
}

.analytics-heading-copy > p {
  max-width: 750px;
  margin: 8px 0 16px;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

/* Control Toolbar */
.report-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.period-tabs {
  height: 38px;
  display: flex;
  align-items: center;
  padding: 3px;
  border-radius: 8px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.period-tabs button {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  color: #475569;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.period-tabs button.active {
  color: #047857;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-weight: 700;
}

.filter-select {
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  background: #ffffff;
}

.filter-select > span {
  font-size: 16px;
}

.filter-select select {
  max-width: 140px;
  border: 0;
  outline: 0;
  color: #0f172a;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
}

.sector-select select {
  max-width: 130px;
}

.export-actions-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.export-pdf {
  height: 38px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #047857;
  background: #ffffff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.export-pdf:hover {
  background: #f8fafc;
}

.export-data {
  height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  color: white;
  background: #059669;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
  transition: all 0.15s ease;
}

.export-data:hover {
  background: #047857;
  transform: translateY(-1px);
}

.custom-range {
  display: flex;
  gap: 8px;
}

.custom-range label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
}

.custom-range input {
  width: 130px;
  height: 38px;
  padding: 0 8px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #0f172a;
  font-size: 13px;
}

/* Macro Banner */
.macro-banner {
  min-height: 96px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
  padding: 18px 22px;
  border-radius: 14px;
  background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
  color: #ffffff;
  box-shadow: 0 8px 24px -4px rgba(4, 120, 87, 0.3);
}

.macro-icon {
  width: 42px;
  height: 42px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #047857;
  background: #ffffff;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.macro-copy {
  min-width: 0;
  flex: 1;
}

.macro-kicker {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #a7f3d0;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.macro-kicker i {
  width: 6px;
  height: 6px;
}

.macro-copy h2 {
  margin: 4px 0 10px;
  color: #ffffff;
  font-size: 18px;
  line-height: 1.35;
  font-weight: 800;
}

.macro-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.macro-chips span {
  padding: 4px 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #ecfdf5;
  background: rgba(255, 255, 255, 0.1);
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.macro-chips span b {
  color: #ffffff;
  font-weight: 800;
}

.macro-banner > button {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 0;
  border-radius: 8px;
  color: #047857;
  background: #ffffff;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.macro-banner > button:hover {
  background: #ecfdf5;
}

/* Metric Cards */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  min-width: 0;
  min-height: 130px;
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04);
}

.metric-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.metric-top small {
  color: #64748b;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.metric-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
}

.metric-icon.mint {
  color: #059669;
  background: #ecfdf5;
}
.metric-icon.coral {
  color: #e11d48;
  background: #fff1f2;
}
.metric-icon.gray {
  color: #0284c7;
  background: #f0f9ff;
}

.metric-card > strong {
  display: block;
  margin-top: 8px;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
  font-size: 26px;
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.metric-card .metric-break {
  display: none;
}

.metric-change {
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #047857;
  font-size: 12.5px;
}

.metric-change b {
  padding: 2px 8px;
  border-radius: 12px;
  background: #d1fae5;
  font-size: 12px;
  font-weight: 700;
}

.metric-change span {
  color: #64748b;
  font-size: 11.5px;
}

.metric-card:nth-child(3) .metric-change b {
  color: #be123c;
  background: #ffe4e6;
}

.metric-card:nth-child(4) .metric-change b {
  color: #0369a1;
  background: #e0f2fe;
}

.metric-foot {
  min-height: 26px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  color: #475569;
  background: #f8fafc;
  font-size: 12px;
}

.metric-foot b {
  color: #0f172a;
  font-weight: 700;
}

.metric-foot .coral-text {
  color: #be123c;
}

/* Charts Grid */
.chart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) minmax(320px, 1fr);
  align-items: start;
  gap: 20px;
  margin-bottom: 24px;
}

.report-panel {
  min-width: 0;
  padding: 22px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04);
}

.panel-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.panel-title > div {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.panel-mark {
  width: 20px;
  flex: none;
  color: #059669;
  font-size: 18px;
  font-weight: 800;
}

.panel-title h2 {
  margin: 0 0 4px;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 700;
}

.panel-title small {
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}

.chart-controls > button,
.chart-controls > div {
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #475569;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.chart-controls > button.active,
.chart-controls > div > button.active {
  color: #047857;
  background: #ecfdf5;
  border-color: #a7f3d0;
  font-weight: 800;
}

.chart-controls > div {
  display: flex;
  gap: 2px;
  padding: 2px;
}

.chart-controls > div > button {
  padding: 4px 8px;
  border: 0;
  border-radius: 4px;
  color: #64748b;
  background: transparent;
  font-size: 12px;
}

.chart-legend {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin: 18px 0 10px;
  color: #475569;
  font-size: 12.5px;
}

.chart-legend > span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chart-legend > span i {
  width: 10px;
  height: 10px;
  border-radius: 3px;
}

.legend-green {
  background: #059669;
}
.legend-coral {
  background: #e11d48;
}
.legend-mint {
  background: #34d399;
}

.chart-legend > small {
  margin-left: auto;
  color: #64748b;
  font-size: 12px;
}

/* Trend Chart */
.trend-chart {
  height: 250px;
  position: relative;
  padding: 0 4px 24px 38px;
}

.chart-y-labels {
  position: absolute;
  inset: 0 auto 24px 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #64748b;
  font-size: 11.5px;
  font-weight: 500;
}

.plot-area {
  height: 100%;
  position: relative;
  overflow: hidden;
}

.chart-gridlines {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-gridlines i {
  border-top: 1px dashed #e2e8f0;
}

.bar-series {
  position: absolute;
  z-index: 1;
  inset: 10px 0 0;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  align-items: end;
  gap: 8px;
}

.bar-group {
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
}

.bar-group > span {
  width: 45%;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
}

.bar-domestic {
  background: #059669;
}
.bar-projection {
  background: linear-gradient(180deg, #34d399, #a7f3d0);
}
.bar-subsidy {
  background: #e11d48;
}

.trend-line {
  position: absolute;
  z-index: 2;
  inset: 0 0 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.chart-x-labels {
  position: absolute;
  inset: auto 0 0 38px;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.insight-note {
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 10px;
  color: #334155;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  font-size: 13px;
  line-height: 1.6;
}

.insight-note b {
  color: #047857;
}

/* Donut & Share Panel */
.donut-wrap {
  display: grid;
  place-items: center;
  padding: 18px 0 14px;
}

.donut-chart {
  width: 140px;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: conic-gradient(
    #059669 0 34.2%,
    #e11d48 34.2% 61%,
    #d97706 61% 82.5%,
    #34d399 82.5% 94.8%,
    #cbd5e1 94.8% 100%
  );
  transform: rotate(-28deg);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

.donut-chart > div {
  width: 90px;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ffffff;
  transform: rotate(28deg);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.05);
}

.donut-chart small {
  color: #64748b;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.donut-chart b {
  margin: 2px 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.donut-chart span {
  max-width: 75px;
  overflow: hidden;
  color: #047857;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.share-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.share-legend button {
  min-height: 38px;
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #334155;
  background: #f8fafc;
  font-size: 12.5px;
  line-height: 1.3;
  text-align: left;
  transition: all 0.15s ease;
}

.share-legend button.highlighted {
  border-color: #10b981;
  background: #ecfdf5;
}

.share-legend button > i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.share-green {
  background: #059669;
}
.share-coral {
  background: #e11d48;
}
.share-orange {
  background: #d97706;
}
.share-mint {
  background: #34d399;
}
.share-gray {
  background: #94a3b8;
}

.share-legend button > b {
  color: #0f172a;
  font-size: 13.5px;
  text-align: right;
  font-weight: 700;
}

.share-legend button > b small {
  display: block;
  margin-top: 2px;
  color: #64748b;
  font-size: 11.5px;
  font-weight: 400;
}

.detail-category {
  display: block;
  margin: 12px 0 0 auto;
  padding: 4px 0;
  border: 0;
  color: var(--green);
  background: transparent;
  font-size: 13px;
  font-weight: 700;
}

/* Regional & Logistics Matrix */
.regional-panel {
  margin-bottom: 24px;
}

.regional-panel > .panel-title {
  align-items: center;
  margin-bottom: 18px;
}

.bpjs-tag,
.pipeline-tag {
  flex: none;
  padding: 6px 12px;
  border-radius: 20px;
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  font-size: 12px;
  font-weight: 700;
}

.regional-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}

.regional-grid h3 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 14.5px;
  font-weight: 700;
}

.regional-grid h3 small {
  color: #64748b;
  font-size: 12px;
  font-weight: 400;
}

.region-row {
  min-height: 48px;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.rank {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: #059669;
  font-size: 12px;
  font-weight: 800;
}
.rank.coral {
  background: #e11d48;
}
.rank.gray {
  color: #334155;
  background: #cbd5e1;
}

.region-row > div,
.region-row > span:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.region-row > div > b {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.region-row small {
  color: #64748b;
  font-size: 12px;
  line-height: 1.3;
}

.region-row > span:last-child {
  text-align: right;
}

.region-row > span:last-child > b {
  color: #059669;
  font-size: 14.5px;
  font-weight: 800;
}

.region-row:nth-child(4) > span:last-child > b {
  color: #e11d48;
}

.logistics-card {
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.logistics-card h3 {
  display: block;
  margin-bottom: 14px;
  font-size: 14.5px;
}

.logistics-card h3 small {
  display: block;
  margin: 4px 0 0 0;
  color: #64748b;
}

.logistic-meter {
  margin-top: 12px;
}

.logistic-meter > div {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #475569;
  font-size: 12.5px;
}

.logistic-meter > div > b {
  color: #059669;
  font-size: 13.5px;
  text-align: right;
}

.logistic-meter > div > b small {
  color: #047857;
  font-size: 12px;
  font-weight: 400;
}

.logistic-meter > div > b em {
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 6px;
  background: #10b981;
  font-size: 11px;
  font-style: normal;
}

.logistic-meter > i {
  height: 8px;
  display: block;
  overflow: hidden;
  margin: 6px 0;
  border-radius: 6px;
  background: #cbd5e1;
}

.logistic-meter > i > span {
  height: 100%;
  display: block;
  border-radius: inherit;
  background: linear-gradient(90deg, #10b981, #059669);
}

.logistic-meter > small {
  display: block;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

/* Commodity Export Table */
.export-panel {
  margin-bottom: 24px;
}

.export-panel > .panel-title {
  align-items: center;
  margin-bottom: 16px;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.export-panel table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  color: #334155;
  font-size: 13.5px;
}

.export-panel th {
  padding: 12px 14px;
  color: #475569;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.export-panel td {
  padding: 14px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: middle;
  line-height: 1.4;
}

.commodity-name {
  min-width: 160px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.commodity-name > i {
  width: 32px;
  height: 32px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #059669;
  background: #ecfdf5;
  font-size: 16px;
  font-style: normal;
}

.commodity-name > i.coral {
  color: #e11d48;
  background: #fff1f2;
}

.commodity-name > i.gray {
  color: #475569;
  background: #f1f5f9;
}

.commodity-name > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.commodity-name b {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.commodity-name small {
  color: #64748b;
  font-size: 12px;
}

.cert-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.cert-list i {
  padding: 3px 8px;
  border-radius: 12px;
  color: #047857;
  background: #d1fae5;
  font-size: 11.5px;
  font-style: normal;
  font-weight: 600;
}

.export-panel tr:nth-child(3) .cert-list i {
  color: #be123c;
  background: #ffe4e6;
}

.export-panel tr:nth-child(5) .cert-list i {
  color: #334155;
  background: #f1f5f9;
}

.gmv-value {
  color: #059669;
  font-size: 14.5px;
  font-weight: 800;
}

.destination {
  display: block;
  min-width: 100px;
  color: #334155;
}

.export-status {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  color: #047857;
  background: #d1fae5;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.export-status.coral {
  color: #be123c;
  background: #ffe4e6;
}

.export-status.gray {
  color: #334155;
  background: #f1f5f9;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  color: #64748b;
  font-size: 13px;
}

.table-footer > div {
  display: flex;
  align-items: center;
  gap: 6px;
}

.table-footer button {
  min-width: 32px;
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.table-footer button:disabled {
  opacity: 0.5;
  cursor: default;
}

.table-footer button.current {
  color: white;
  background: #059669;
  border-color: #059669;
}

/* Footer */
.analytics-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
}

.analytics-footer b {
  color: #0f172a;
}

.analytics-footer > small {
  flex: none;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

/* Toast */
.analytics-toast {
  position: fixed;
  z-index: 60;
  right: 24px;
  bottom: 24px;
  max-width: min(400px, calc(100vw - 48px));
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  color: #064e3b;
  background: #ffffff;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
  font-size: 13.5px;
  font-weight: 600;
}

.analytics-toast > span {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: #059669;
  font-size: 12px;
}

/* Responsive */
@media (max-width: 1024px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .chart-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .regional-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 640px) {
  .metric-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .macro-banner {
    flex-direction: column;
    align-items: flex-start;
  }
  .macro-banner > button {
    width: 100%;
    justify-content: center;
  }
  .report-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
