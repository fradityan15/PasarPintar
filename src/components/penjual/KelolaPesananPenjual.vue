<script setup lang="ts">
import { computed, ref } from 'vue'
import SellerProductEditor from './EditorProdukPenjual.vue'
import SellerFinanceDashboard from './KeuanganSaldoPenjual.vue'
import SellerProductInventory from './KatalogStokPenjual.vue'
import SellerStoreProfile from './ProfilTokoKurirPenjual.vue'
import SellerStoreSummary from './RingkasanTokoPenjual.vue'

type OrderStatus = 'new' | 'ready' | 'shipping' | 'done'
type SellerOrder = {
  id: string
  status: OrderStatus
  placedAt: string
  customer: string
  area: string
  product: string
  sku: string
  variant: string
  quantity: number
  price: number
  total: number
  courier: string
  service: string
  image: string
  note?: string
}

const emit = defineEmits<{ backToStore: [] }>()
const activeTab = ref('Semua Pesanan')
const searchQuery = ref('')
const courierFilter = ref('Semua Kurir Ekspedisi')
const dateFilter = ref('7 Hari Terakhir')
const selectedIds = ref<string[]>([])
const toastMessage = ref('')
const pickupDialogOpen = ref(false)
const pickupTime = ref('16:00 - 18:00 WITA')
const pickupConfirmed = ref(false)
const activeMenu = ref('Pesanan Masuk')
const productEditorOpen = ref(false)
const inventoryOpen = ref(false)
const summaryOpen = ref(false)
const financeOpen = ref(false)
const profileOpen = ref(false)
const editorInitialMode = ref<'add' | 'edit'>('add')
const editorProductName = ref('')
const editorReturnInventory = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | undefined

const tabs = [
  { label: 'Semua Pesanan', count: 174 },
  { label: 'Perlu Diproses', count: 5 },
  { label: 'Siap Dikirim', count: 8 },
  { label: 'Sedang Dikirim', count: 19 },
  { label: 'Selesai', count: 142 },
]

const orders = ref<SellerOrder[]>([
  {
    id: 'PP-9825', status: 'new', placedAt: 'Hari Ini, 10:15 WITA', customer: 'Siti Rahmah', area: 'Kec. Cilandak, Jakarta Selatan, DKI Jakarta',
    product: 'Kopi Arabika Flores Bajawa 250g', sku: 'SKU: KBI-ARB-250-W', variant: 'Berat: 500 gr', quantity: 2,
    price: 68000, total: 136000, courier: 'J&T Express', service: 'Pick-up', image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=200&q=80',
    note: 'Tolong packing bubble wrap tebal ya, untuk oleh-oleh.',
  },
  {
    id: 'PP-9820', status: 'ready', placedAt: 'Hari Ini, 08:32 WITA', customer: 'Budi Santoso', area: 'Gubeng, Surabaya, Jawa Timur',
    product: 'Kopi Arabika Bajawa Bubuk Halus', sku: 'SKU: KBI-ARB-500-G', variant: 'Berat: 500 gr', quantity: 1,
    price: 120000, total: 120000, courier: 'SiCepat Cargo', service: 'Drop Point Bajawa', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&q=80',
  },
  {
    id: 'PP-9815', status: 'shipping', placedAt: 'Kemarin, 14:20 WITA', customer: 'Anisa Maharani', area: 'Kec. Coblong, Kota Bandung, Jawa Barat',
    product: 'Paket Spesial Bajawa Honey Process', sku: 'SKU: KBI-BDL-HNY-01', variant: 'Berat: 750 gr', quantity: 1,
    price: 140000, total: 140000, courier: 'JNE OKE', service: 'Antar pulau', image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&q=80',
    note: 'Tiba di hub transit Surabaya. Estimasi tiba: 2 hari lagi.',
  },
  {
    id: 'PP-9801', status: 'done', placedAt: '3 Juni 2024, 16:40 WITA', customer: 'Hendra Wijaya', area: 'Medan, Sumatera Utara',
    product: 'Kopi Arabika Bajawa Ikga 1kg', sku: 'SKU: KBI-BUL-1KG', variant: 'Berat: 1.0 kg', quantity: 4,
    price: 237500, total: 950000, courier: 'Pos Indonesia', service: 'Reguler', image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=200&q=80',
    note: 'Ulasan pembeli: “Kopinya wangi sekali, pengiriman Flores ke Medan aman tanpa cacat!” (5.0 ★)',
  },
])

const statusLabels: Record<OrderStatus, string> = {
  new: 'Perlu Diproses',
  ready: 'Siap Dikirim',
  shipping: 'Sedang Dikirim',
  done: 'Pesanan Selesai',
}

const visibleOrders = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('id')
  const tabStatus: Record<string, OrderStatus | undefined> = {
    'Semua Pesanan': undefined,
    'Perlu Diproses': 'new',
    'Siap Dikirim': 'ready',
    'Sedang Dikirim': 'shipping',
    Selesai: 'done',
  }
  return orders.value.filter((order) => {
    const matchesTab = !tabStatus[activeTab.value] || order.status === tabStatus[activeTab.value]
    const matchesQuery = !query || `${order.id} ${order.customer} ${order.product} ${order.sku}`.toLocaleLowerCase('id').includes(query)
    const matchesCourier = courierFilter.value === 'Semua Kurir Ekspedisi' || order.courier === courierFilter.value
    return matchesTab && matchesQuery && matchesCourier
  })
})

const selectableIds = computed(() => visibleOrders.value.map((order) => order.id))
const allVisibleSelected = computed(() => selectableIds.value.length > 0 && selectableIds.value.every((id) => selectedIds.value.includes(id)))
const newOrderCount = computed(() => orders.value.filter((order) => order.status === 'new').length)
const readyOrderCount = computed(() => orders.value.filter((order) => order.status === 'ready').length)
const shippingOrderCount = computed(() => orders.value.filter((order) => order.status === 'shipping').length)
const doneOrderCount = computed(() => orders.value.filter((order) => order.status === 'done').length)
const pickupOrderCount = computed(() => selectedIds.value.length || orders.value.filter((order) => order.status === 'ready').length)

function notify(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 2800)
}

function toggleAllVisible() {
  if (allVisibleSelected.value) {
    selectedIds.value = selectedIds.value.filter((id) => !selectableIds.value.includes(id))
  } else {
    selectedIds.value = [...new Set([...selectedIds.value, ...selectableIds.value])]
  }
}

function nextAction(order: SellerOrder) {
  if (order.status === 'new') {
    orders.value = orders.value.map((currentOrder) => currentOrder.id === order.id ? { ...currentOrder, status: 'ready' } : currentOrder)
    notify(`Pesanan ${order.id} diterima dan siap diproses.`)
  } else if (order.status === 'ready') {
    orders.value = orders.value.map((currentOrder) => currentOrder.id === order.id ? { ...currentOrder, status: 'shipping' } : currentOrder)
    notify(`Pesanan ${order.id} ditandai siap dikirim.`)
  } else if (order.status === 'shipping') {
    notify(`Detail pelacakan ${order.id}: ${order.courier} sedang membawa paket.`)
  } else {
    notify(`Rincian pembayaran ${order.id} sudah diteruskan ke saldo toko.`)
  }
}

function doBulkAction(action: 'labels' | 'pickup' | 'status') {
  if (!selectedIds.value.length) {
    notify('Pilih minimal satu pesanan terlebih dahulu.')
    return
  }
  if (action === 'pickup') {
    pickupDialogOpen.value = true
    return
  }
  if (action === 'status') {
    orders.value.forEach((order) => {
      if (selectedIds.value.includes(order.id) && order.status === 'new') order.status = 'ready'
    })
    notify(`Status ${selectedIds.value.length} pesanan diperbarui.`)
  } else {
    notify(`Label pengiriman untuk ${selectedIds.value.length} pesanan siap dicetak.`)
  }
}

function confirmPickup() {
  pickupConfirmed.value = true
  pickupDialogOpen.value = false
  notify(`Pick-up ${pickupOrderCount.value} pesanan dijadwalkan pukul ${pickupTime.value}.`)
}

function exportOrders() {
  const rows = [['Nomor Pesanan', 'Pembeli', 'Produk', 'Status', 'Total', 'Kurir']]
  visibleOrders.value.forEach((order) => rows.push([order.id, order.customer, order.product, statusLabels[order.status], String(order.total), order.courier]))
  const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'pesanan-pasarpintar.csv'
  link.click()
  URL.revokeObjectURL(url)
  notify('Rekap pesanan berhasil diunduh.')
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`
}

function navigateMenu(name: string) {
  activeMenu.value = name
  productEditorOpen.value = false
  inventoryOpen.value = name === 'Produk & Stok'
  summaryOpen.value = name === 'Ringkasan Toko'
  financeOpen.value = name === 'Laporan Keuangan'
  profileOpen.value = name === 'Profil Toko & Kurir'
  if (name !== 'Ringkasan Toko' && name !== 'Produk & Stok' && name !== 'Pesanan Masuk' && name !== 'Laporan Keuangan' && name !== 'Profil Toko & Kurir') {
    notify(`${name} dapat dikelola dari portal toko.`)
  }
}

function openProductEditor(mode: 'add' | 'edit' = 'add', productName = '', fromInventory = false) {
  activeMenu.value = fromInventory ? 'Produk & Stok' : activeMenu.value
  editorInitialMode.value = mode
  editorProductName.value = productName
  editorReturnInventory.value = fromInventory
  inventoryOpen.value = false
  summaryOpen.value = false
  productEditorOpen.value = true
}

function closeProductEditor() {
  productEditorOpen.value = false
  inventoryOpen.value = editorReturnInventory.value
  if (!editorReturnInventory.value) activeMenu.value = 'Pesanan Masuk'
}
</script>

<template>
  <SellerProductEditor v-if="productEditorOpen" :initial-mode="editorInitialMode" :initial-product-name="editorProductName" @back="closeProductEditor" />
  <main v-else class="seller-dashboard">
    <aside class="seller-sidebar">
      <button class="seller-brand" type="button" aria-label="Kembali ke PasarPintar" @click="emit('backToStore')">
        <span class="seller-brand-mark">P</span><span><b>PasarPintar</b><small>PORTAL MITRA UMKM</small></span>
      </button>
      <div class="seller-shop-chip"><span>◎</span> Koperasi Kopi Bajawa (Binaan)</div>
      <nav class="seller-nav" aria-label="Navigasi toko">
        <button v-for="item in [
          { name: 'Ringkasan Toko', icon: '▦' }, { name: 'Produk & Stok', icon: '▤' },
          { name: 'Pesanan Masuk', icon: '▣' }, { name: 'Laporan Keuangan', icon: '▧' },
          { name: 'Profil Toko & Kurir', icon: '♧' }, { name: 'Pusat Edukasi UMKM', icon: '▱' },
        ]" :key="item.name" type="button" :class="{ active: activeMenu === item.name }" @click="navigateMenu(item.name)">
          <span>{{ item.icon }}</span>{{ item.name }}<b v-if="item.name === 'Pesanan Masuk' && newOrderCount">{{ newOrderCount }}</b>
        </button>
      </nav>
      <div class="seller-sidebar-bottom">
        <div class="catalog-progress"><span><b>Kuota Katalog Produk</b><strong>42 / 50</strong></span><i><b></b></i><button type="button" @click="notify('Toko publik dibuka pada tab pratinjau.')">Kunjungi Toko Publik <span>↗</span></button></div>
        <button class="seller-store-toggle" type="button" @click="emit('backToStore')">← Kembali ke PasarPintar</button>
      </div>
    </aside>

    <section class="seller-main">
      <header class="seller-topbar">
        <label class="seller-search"><span>⌕</span><input v-model="searchQuery" type="search" placeholder="Cari SKU, produk, pesanan..." aria-label="Cari pesanan" /></label>
        <button class="seller-add-product" type="button" @click="openProductEditor('add')">＋ Tambah Produk</button>
        <button class="seller-bell" type="button" aria-label="Notifikasi" @click="notify('Tidak ada notifikasi baru.')">♧<i></i></button>
        <button class="seller-profile" type="button" @click="notify('Profil Koperasi Kopi Bajawa, status toko aktif.')"><b>Toko Bajawa</b><small><i></i> Buka</small></button>
      </header>

      <div class="seller-content">
        <SellerProductInventory
          v-if="inventoryOpen"
          @back="navigateMenu('Pesanan Masuk')"
          @add-product="openProductEditor('add', '', true)"
          @edit-product="openProductEditor('edit', $event, true)"
        />
        <SellerStoreSummary
          v-else-if="summaryOpen"
          @open-orders="navigateMenu('Pesanan Masuk')"
          @open-products="openProductEditor"
        />
        <SellerFinanceDashboard
          v-else-if="financeOpen"
          @open-orders="navigateMenu('Pesanan Masuk')"
        />
        <SellerStoreProfile
          v-else-if="profileOpen"
          @back="navigateMenu('Pesanan Masuk')"
        />
        <template v-else>
        <div class="seller-breadcrumb">Portal Mitra UMKM <span>›</span> Logistik & Pemenuhan <span>›</span> <b>Pesanan Masuk</b></div>
        <section class="seller-page-heading">
          <div><h1>Kelola Pesanan & Pengiriman Logistik</h1><p>Pantau status pesanan pelanggan, atur jadwal penjemputan/drop-off kurir daerah, cetak label<br class="desktop-break" /> pengiriman massal, dan lacak resi ekspedisi nusantara.</p></div>
          <div class="seller-heading-actions"><button type="button" class="seller-secondary-button" @click="exportOrders">⇩ &nbsp; Unduh Rekap (Excel/PDF)</button><button type="button" class="seller-primary-button" @click="pickupDialogOpen = true">▦ &nbsp; Atur Jadwal Pick-up Massal</button></div>
        </section>

        <section class="seller-alert"><span class="seller-alert-icon">!</span><div><b>Peringatan Pick-up Kurir Hari Ini <small> SLA &lt; 6:00 WITA</small></b><p><strong>{{ newOrderCount }} pesanan sudah siap dijemput sebelum pukul 16:00 WITA oleh kurir J&T Express & SiCepat.</strong> Batas respon konfirmasi pesanan baru: maksimal 24 jam untuk menjaga reputasi toko.</p></div><button type="button" @click="doBulkAction('labels')">▣ &nbsp; Cetak Semua Label Siap Kirim ({{ readyOrderCount }})</button></section>

        <section class="seller-stats" aria-label="Ringkasan pesanan">
          <article class="seller-stat-card stat-orange"><div>Perlu Diproses <span>♧</span></div><strong>{{ newOrderCount + 5 }}</strong><small>Pesanan Baru</small><p>Estimasi Nilai: {{ formatRupiah(845000) }} <b>Konfirmasi segera</b></p></article>
          <article class="seller-stat-card stat-green"><div>Siap Kirim & Menunggu Pick-up <span>⬡</span></div><strong>{{ readyOrderCount + 7 }}</strong><small>Paket Terkemas</small><p>Kurir dijadwalkan hari ini <b>16:00 - 18:00 WITA</b></p></article>
          <article class="seller-stat-card stat-blue"><div>Sedang Dalam Perjalanan <span>▰</span></div><strong>{{ shippingOrderCount + 18 }}</strong><small>Dalam Ekspedisi</small><p>Ekspedisi Antar pulau <b>12 J&T/Hari</b></p></article>
          <article class="seller-stat-card stat-mint"><div>Selesai & Dana Diteruskan <span>✓</span></div><strong>{{ doneOrderCount + 141 }}</strong><small>Bulan Ini</small><p>Keberhasilan Pengiriman <b>96.2% Sempurna</b></p></article>
        </section>

        <div class="seller-workspace">
          <section class="seller-orders-column">
            <nav class="seller-tabs" aria-label="Filter status pesanan">
              <button v-for="tab in tabs" :key="tab.label" type="button" :class="{ active: activeTab === tab.label }" @click="activeTab = tab.label">{{ tab.label }} <small>{{ tab.count }}</small></button>
            </nav>

            <section class="seller-filters">
              <div class="seller-filter-controls"><label><span>⌕</span><input v-model="searchQuery" type="search" placeholder="Cari No. Pesanan, nama pembeli, SKU..." aria-label="Cari berdasarkan nomor pesanan, nama pembeli, SKU" /></label><select v-model="courierFilter" aria-label="Filter kurir"><option>Semua Kurir Ekspedisi</option><option>J&T Express</option><option>SiCepat Cargo</option><option>JNE OKE</option><option>Pos Indonesia</option></select><button type="button" @click="notify('Filter metode kirim: semua metode aktif.')">Metode Kirim ▾</button><select v-model="dateFilter" aria-label="Filter waktu"><option>7 Hari Terakhir</option><option>Hari Ini</option><option>30 Hari Terakhir</option></select></div>
              <div class="seller-quick-filters"><span>Filter Cepat:</span><button v-for="filter in ['Butuh Resi Segera (5)', 'Kargo Berat &gt; 5kg', 'Ada Catatan Khusus', 'Tujuan Luar Pulau NTT']" :key="filter" type="button" @click="searchQuery = filter.includes('Catatan') ? 'packing' : filter.includes('Resi') ? 'PP-9820' : ''">{{ filter }}</button><button type="button" class="clear-filter" @click="searchQuery = ''; courierFilter = 'Semua Kurir Ekspedisi'; activeTab = 'Semua Pesanan'">↻ Reset Filter</button></div>
            </section>

            <section class="seller-bulk-actions"><label><input type="checkbox" :checked="allVisibleSelected" @change="toggleAllVisible" /> Pilih Semua di Halaman ini ({{ visibleOrders.length }} Pesanan)</label><span>│</span><small>{{ selectedIds.length }} pesanan dipilih</small><div><button type="button" @click="doBulkAction('labels')">▣ &nbsp; Cetak Label Massal</button><button type="button" @click="doBulkAction('pickup')">▱ &nbsp; Request Pick-up Bersama</button><button class="bulk-primary" type="button" @click="doBulkAction('status')">Ubah Status Pesanan ▾</button></div></section>

            <div v-if="visibleOrders.length" class="seller-order-list">
              <article v-for="order in visibleOrders" :key="order.id" class="seller-order-card">
                <header class="seller-order-head"><label><input v-model="selectedIds" type="checkbox" :value="order.id" /><strong>#ORD-PP-{{ order.id.replace('PP-', '') }}</strong></label><span>·</span><small>◷ &nbsp;{{ order.placedAt }}</small><span class="seller-status" :class="`status-${order.status}`">{{ order.status === 'done' ? '✓' : '◉' }} &nbsp;{{ order.status === 'done' ? 'QRIS (Selesai Otomatis)' : order.status === 'shipping' ? `${order.courier} (Lunas)` : order.status === 'ready' ? 'VA Mandiri (Lunas)' : 'QRIS PasarPintar (Lunas)' }}</span><span class="seller-order-state" :class="`state-${order.status}`">{{ order.status === 'new' ? '● Perlu Diproses' : statusLabels[order.status] }}</span></header>
                <div class="seller-order-body">
                  <img class="seller-product-image" :src="order.image" :alt="order.product" />
                  <div class="seller-product-info"><b>{{ order.quantity }}× {{ order.product }}</b><small>{{ order.sku }} <span>•</span> {{ order.variant }}</small><p v-if="order.note" :class="{ review: order.status === 'done' }">{{ order.status === 'done' ? '✿ ' : '☞ ' }}{{ order.note }}</p><p v-if="order.status === 'ready'" class="seller-resi-note">◉ Resi: SP-JB-8029103948 &nbsp; <b>Salin Resi</b><br />Label dicetak • Menunggu kurir pick-up pukul 14:00 WITA</p></div>
                  <div class="seller-customer"><b>♙ {{ order.customer }}</b><small>0812-3456-xxxx</small><p>⌖ &nbsp;{{ order.area }}</p></div>
                  <div class="seller-order-total"><small>{{ order.status === 'done' ? 'Dana Diteruskan ke Saldo' : order.status === 'new' ? 'Total Pembayaran' : 'Total Tagihan' }}</small><b>{{ formatRupiah(order.total) }}</b><small>{{ order.status === 'done' ? 'Setelah potongan admin 1%' : order.status === 'new' ? 'Ongkir & Subsidi Rp 18.000' : 'Ongkir Terbayar' }}</small></div>
                  <div class="seller-order-buttons"><template v-if="order.status === 'new'"><button class="order-primary" type="button" @click="nextAction(order)">Terima Pesanan</button><button type="button" class="order-more" aria-label="Pilihan pesanan" @click="notify(`Menu pesanan ${order.id}`)">⋮</button><small class="reject-link" @click="notify(`Permintaan pembatalan ${order.id} dikirim.`)">Tolak / Stok Habis</small></template><template v-else-if="order.status === 'ready'"><button class="order-print" type="button" @click="notify(`Label ${order.id} siap dicetak.`)">▣ Cetak Label Resi</button><div class="order-mini-actions"><button type="button" @click="notify('Detail kurir lokal dibuka.')">Lacak Kurir</button><button type="button" @click="notify('Nomor resi berhasil diperbarui.')">Update No. Resi</button></div></template><template v-else-if="order.status === 'shipping'"><button class="order-shipping" type="button" @click="nextAction(order)">⌖ Sedang Dikirim</button><button class="order-detail" type="button" @click="notify(`Detail perjalanan ${order.id} dibuka.`)">Lacak Pengiriman Detail</button><small>Hubungi Call Center Ekspedisi</small></template><template v-else><button class="order-done" type="button" @click="nextAction(order)">▣ Lihat Faktur & Riwayat</button></template></div>
                </div>
              </article>
            </div>
            <div v-else class="seller-empty-state"><b>Tidak ada pesanan yang cocok</b><span>Ubah kata kunci atau filter untuk melihat pesanan lainnya.</span></div>

            <footer class="seller-pagination"><span>Menampilkan {{ visibleOrders.length ? 1 : 0 }}–{{ visibleOrders.length }} dari 174 pesanan</span><div><button type="button" disabled aria-label="Halaman sebelumnya">‹</button><button class="current-page" type="button">1</button><button type="button" @click="notify('Halaman 2 akan dimuat.')">2</button><button type="button" @click="notify('Halaman 3 akan dimuat.')">3</button><span>...</span><button type="button" @click="notify('Halaman 18 akan dimuat.')">18</button><button type="button" aria-label="Halaman berikutnya" @click="notify('Halaman berikutnya akan dimuat.')">›</button></div></footer>
          </section>

          <aside class="seller-logistics-column">
            <section class="seller-side-panel logistics-panel"><div class="seller-panel-heading"><span><b>Sentra Logistik Bajawa</b><small>Daftar gerai ekspedisi resmi terdekat dari sentra-sangrai kopi untuk opsi drop-off mandiri dan rate pick-up kurir.</small></span><span class="region-chip">NTT<br />Region</span></div><article class="courier-point"><b>J&T Express Bajawa <small>1.2 km</small></b><p>Jl. Ahmad Yani No. 12, Kel. Ngedukelu</p><span class="pickup-time">◷ Pick-up harian: 11:00 &amp; 16:00 WITA</span></article><article class="courier-point"><b>SiCepat Drop Point Ngada <small>800 m</small></b><p>Jl. Soekarno Hatta No. 4 (Depan Pasar Induk)</p><span>♧ Buka drop mandiri hingga 19:00 WITA</span></article><article class="courier-point"><b>Kantor Pos Bajawa 86400 <small>2.1 km</small></b><p>Jl. Gajah Mada No. 1 (Sentral Antarpulau Cargo)</p><span>♧ Pengiriman kargo ke seluruh antarpulau</span></article><div class="seller-mini-map" aria-label="Peta sentra logistik Bajawa"><i class="map-road road-one"></i><i class="map-road road-two"></i><i class="map-road road-three"></i><span class="map-pin">●</span><small>Radius Kurir: Kab. Bajawa Ngada</small><b>Peta</b></div></section>
            <section class="seller-side-panel dispatcher-panel"><span class="dispatcher-icon">♧</span><div><b>PIC Dispatcher Logistik</b><small>Koordinator Ekspedisi Daerah</small><p>Butuh penjemputan darurat sebelum jadwal reguler atau penanganan kargo biji kopi skala besar?</p><button type="button" @click="notify('WhatsApp Dispatcher: +62 821-4433-2211')">▣ &nbsp; WhatsApp Dispatcher (+62 821-4433-2211)</button><small>Jam Operasional Kurir <b>08:00 - 18:00 WITA</b></small></div></section>
            <section class="seller-side-panel logistics-tip"><span>✧</span><div><b>Tips Kemasan Kopi PasarPintar</b><p>Pastikan bungkus kedap udara (degassing valve) terlindung dari lakban rapat agar aroma kopi tetap terjaga selama transit antarpulau via kapal laut.</p></div></section>
          </aside>
        </div>
        </template>
      </div>

      <div v-if="pickupDialogOpen" class="seller-modal-backdrop" @click.self="pickupDialogOpen = false"><section class="seller-pickup-dialog" role="dialog" aria-modal="true" aria-labelledby="pickup-title"><button class="seller-modal-close" type="button" aria-label="Tutup" @click="pickupDialogOpen = false">×</button><small>JADWAL EKSPEDISI</small><h2 id="pickup-title">Atur pick-up pesanan</h2><p>{{ selectedIds.length ? `${selectedIds.length} pesanan dipilih untuk dijemput.` : `${pickupOrderCount} pesanan siap kirim akan dijadwalkan.` }}</p><label>Waktu penjemputan<select v-model="pickupTime"><option>14:00 - 16:00 WITA</option><option>16:00 - 18:00 WITA</option><option>Besok, 09:00 - 11:00 WITA</option></select></label><div><button type="button" @click="pickupDialogOpen = false">Batal</button><button type="button" @click="confirmPickup">Konfirmasi Jadwal</button></div></section></div>
      <div v-if="toastMessage" class="seller-toast" role="status">✓ &nbsp; {{ toastMessage }}</div>
      <div v-if="pickupConfirmed" class="sr-only" aria-live="polite">Jadwal pick-up berhasil dikonfirmasi.</div>
    </section>
  </main>
</template>

<style scoped>
.seller-dashboard { width: 100%; min-width: 0; min-height: 100vh; display: grid; grid-template-columns: 242px minmax(0, 1fr); overflow-x: clip; color: #243a30; background: #f1f8f2; font-family: 'Poppins', sans-serif; font-size: 13px; }
.seller-sidebar { min-width: 0; min-height: 100vh; position: sticky; top: 0; display: flex; flex-direction: column; padding: 20px 14px 15px; background: #e8f5eb; border-right: 1px solid #d9e9dd; }
.seller-brand { display: flex; align-items: center; gap: 10px; padding: 0 8px; border: 0; background: transparent; text-align: left; cursor: pointer; }
.seller-brand-mark { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 9px; color: white; background: #087b61; font-size: 18px; font-weight: 800; }
.seller-brand > span:last-child { display: flex; flex-direction: column; gap: 3px; }
.seller-brand b { color: #087b61; font-size: 15px; }
.seller-brand small { color: #76877d; font-size: 12px; font-weight: 700; letter-spacing: .5px; }
.seller-shop-chip { align-self: flex-start; display: flex; align-items: center; gap: 6px; margin: 22px 4px 19px; padding: 7px 9px; border-radius: 18px; color: #36715c; background: #d9eee3; font-size: 12px; font-weight: 600; }
.seller-nav { min-width: 0; display: flex; flex-direction: column; gap: 5px; }
.seller-nav button { min-height: 37px; display: flex; align-items: center; gap: 10px; padding: 0 10px; border: 0; border-radius: 6px; color: #42584b; background: transparent; text-align: left; font-size: 12px; cursor: pointer; }
.seller-nav button > span { width: 14px; color: #637b6c; font-size: 14px; text-align: center; }
.seller-nav button.active { color: white; background: #087b61; font-weight: 700; }
.seller-nav button.active > span { color: white; }
.seller-nav button > b { min-width: 17px; height: 17px; display: grid; place-items: center; margin-left: auto; border-radius: 10px; color: #fff; background: #e95d3f; font-size: 12px; }
.seller-sidebar-bottom { margin-top: auto; }
.catalog-progress { padding: 13px 11px; border: 1px solid #deebe1; border-radius: 8px; background: #fff; }
.catalog-progress > span { display: flex; justify-content: space-between; gap: 5px; font-size: 12px; }
.catalog-progress > span b { font-weight: 600; }.catalog-progress > span strong { color: #087b61; }
.catalog-progress > i { height: 4px; display: block; margin: 8px 0; overflow: hidden; border-radius: 5px; background: #e4eee7; }
.catalog-progress > i b { width: 84%; height: 100%; display: block; border-radius: inherit; background: #138366; }
.catalog-progress > button { width: 100%; display: flex; justify-content: space-between; padding: 5px 0 0; border: 0; color: #087b61; background: transparent; font-size: 12px; font-weight: 700; cursor: pointer; }
.seller-store-toggle { width: 100%; margin-top: 10px; padding: 8px; border: 0; color: #718278; background: transparent; text-align: left; font-size: 12px; cursor: pointer; }
.seller-main { min-width: 0; }
.seller-topbar { height: 58px; display: flex; align-items: center; gap: 17px; padding: 0 22px; border-bottom: 1px solid #e0ebe3; background: #fbfefb; }
.seller-search { width: min(360px, 42vw); height: 34px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid #e3eee6; border-radius: 6px; color: #829189; background: #f0f7f1; }
.seller-search span { font-size: 17px; }.seller-search input { width: 100%; border: 0; outline: 0; color: #3b5044; background: transparent; font-size: 12px; }
.seller-add-product, .seller-primary-button { min-height: 32px; padding: 0 12px; border: 0; border-radius: 6px; color: white; background: #087b61; font-size: 12px; font-weight: 700; cursor: pointer; }
.seller-add-product { margin-left: auto; }.seller-bell { width: 25px; height: 30px; position: relative; border: 0; color: #334d40; background: transparent; font-size: 15px; cursor: pointer; }.seller-bell i { width: 6px; height: 6px; position: absolute; top: 5px; right: 3px; border-radius: 50%; background: #df6249; }
.seller-profile { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 0 0 0 10px; border: 0; border-left: 1px solid #e4ece6; color: #31483a; background: transparent; font-size: 12px; cursor: pointer; }.seller-profile small { color: #138366; font-size: 12px; }.seller-profile small i { width: 5px; height: 5px; display: inline-block; border-radius: 50%; background: #29a777; }
.seller-content { width: min(1480px, 100%); margin: 0 auto; padding: 18px 22px 30px; }
.seller-breadcrumb { display: flex; align-items: center; gap: 8px; color: #71837a; font-size: 12px; }.seller-breadcrumb b { color: #087b61; }
.seller-page-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin: 8px 0 16px; }.seller-page-heading h1 { margin: 0 0 4px; color: #1f3429; font-size: clamp(19px, 1.7vw, 25px); line-height: 1.22; font-weight: 700; }.seller-page-heading p { margin: 0; color: #687b70; font-size: 12px; line-height: 1.55; }.seller-heading-actions { display: flex; flex-direction: column; align-items: stretch; gap: 7px; flex: none; }.seller-secondary-button { min-height: 30px; padding: 0 10px; border: 1px solid #e0ebe3; border-radius: 6px; color: #52675b; background: white; font-size: 12px; font-weight: 600; cursor: pointer; }
.seller-alert { min-height: 76px; display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 10px 14px; border: 1px solid #f6e3d9; border-radius: 8px; background: #fff4ed; }.seller-alert-icon { width: 25px; height: 25px; display: grid; place-items: center; border-radius: 7px; color: white; background: #e96e3e; font-weight: 800; }.seller-alert > div b { color: #a94424; font-size: 12px; }.seller-alert > div b small { margin-left: 5px; padding: 2px 5px; border-radius: 5px; color: white; background: #e65d3e; font-size: 11px; }.seller-alert p { max-width: 650px; margin: 3px 0 0; color: #75574a; font-size: 12px; line-height: 1.5; }.seller-alert p strong { color: #56392f; }.seller-alert > button { min-height: 29px; padding: 0 10px; border: 0; border-radius: 5px; color: white; background: #e75e3b; font-size: 12px; font-weight: 700; cursor: pointer; }
.seller-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin: 13px 0; }.seller-stat-card { min-width: 0; min-height: 96px; position: relative; padding: 12px 13px 9px; overflow: hidden; border: 1px solid #e6eee8; border-radius: 8px; background: white; }.seller-stat-card::after { content: ''; height: 35px; position: absolute; right: 0; bottom: 0; left: 0; background: linear-gradient(180deg, transparent, var(--wash)); pointer-events: none; }.seller-stat-card > div { display: flex; align-items: center; justify-content: space-between; gap: 3px; color: #708278; font-size: 12px; }.seller-stat-card > div span { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 6px; color: var(--accent); background: var(--wash); font-weight: 700; }.seller-stat-card > strong { display: inline-block; margin-top: 6px; color: #18372a; font-size: 23px; line-height: 1; }.seller-stat-card > small { margin-left: 6px; color: var(--accent); font-size: 12px; font-weight: 700; }.seller-stat-card > p { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 5px; margin: 8px 0 0; color: #52665a; font-size: 11px; }.seller-stat-card > p b { color: var(--accent); font-weight: 700; }.stat-orange { --accent: #db5c30; --wash: #fff0e8; }.stat-green { --accent: #087b61; --wash: #e5f4ec; }.stat-blue { --accent: #1787c3; --wash: #e6f5fc; }.stat-mint { --accent: #1e9a66; --wash: #e4f5eb; }
.seller-workspace { display: grid; grid-template-columns: minmax(0, 1fr) 220px; align-items: start; gap: 12px; }.seller-orders-column { min-width: 0; }.seller-tabs { min-height: 39px; display: flex; align-items: stretch; overflow-x: auto; border: 1px solid #e5ede7; border-radius: 7px 7px 0 0; background: white; scrollbar-width: none; }.seller-tabs::-webkit-scrollbar { display: none; }.seller-tabs button { min-width: max-content; position: relative; display: flex; align-items: center; gap: 5px; padding: 0 11px; border: 0; color: #53675b; background: transparent; font-size: 12px; cursor: pointer; }.seller-tabs button.active { color: #173d2d; font-weight: 700; }.seller-tabs button.active::after { height: 3px; position: absolute; right: 8px; bottom: 0; left: 8px; border-radius: 4px 4px 0 0; background: #087b61; content: ''; }.seller-tabs small { color: #829188; font-size: 11px; }.seller-tabs button.active small { color: #087b61; }
.seller-filters { padding: 10px; border: 1px solid #e4ede6; border-top: 0; background: white; }.seller-filter-controls { display: flex; gap: 6px; }.seller-filter-controls label { min-width: 145px; height: 30px; display: flex; flex: 1; align-items: center; gap: 6px; padding: 0 8px; border: 1px solid #dfe9e2; border-radius: 5px; color: #778a7f; background: #f5faf6; }.seller-filter-controls label span { font-size: 14px; }.seller-filter-controls input { width: 100%; min-width: 0; border: 0; outline: 0; color: #43584a; background: transparent; font-size: 12px; }.seller-filter-controls select, .seller-filter-controls > button { max-width: 140px; min-width: 0; height: 30px; padding: 0 7px; border: 1px solid #e1eae3; border-radius: 5px; color: #43584a; background: #f5faf6; font-size: 12px; }.seller-filter-controls > button { cursor: pointer; }.seller-quick-filters { display: flex; align-items: center; flex-wrap: wrap; gap: 5px; margin-top: 9px; color: #819087; font-size: 11px; }.seller-quick-filters > button { padding: 4px 6px; border: 1px solid #e8eee9; border-radius: 10px; color: #43594b; background: #f5f8f5; font-size: 11px; cursor: pointer; }.seller-quick-filters > button.clear-filter { margin-left: auto; border: 0; color: #087b61; background: transparent; font-weight: 700; }
.seller-bulk-actions { min-height: 45px; display: flex; align-items: center; flex-wrap: wrap; gap: 7px; margin: 9px 0; padding: 7px 10px; border: 1px solid #e1ede4; border-radius: 7px; background: #eaf6ed; }.seller-bulk-actions > label { display: flex; align-items: center; gap: 5px; color: #40564a; font-size: 12px; }.seller-bulk-actions input, .seller-order-head input { width: 12px; height: 12px; accent-color: #087b61; }.seller-bulk-actions > span, .seller-bulk-actions > small { color: #87948c; font-size: 11px; }.seller-bulk-actions > div { display: flex; flex-wrap: wrap; gap: 5px; margin-left: auto; }.seller-bulk-actions > div button { min-height: 24px; padding: 0 7px; border: 1px solid #dbe6df; border-radius: 5px; color: #43584a; background: white; font-size: 11px; cursor: pointer; }.seller-bulk-actions > div button.bulk-primary { border-color: #087b61; color: white; background: #087b61; }
.seller-order-list { display: flex; flex-direction: column; gap: 9px; }.seller-order-card { overflow: hidden; border: 1px solid #e2ebe4; border-radius: 8px; background: #fff; }.seller-order-head { min-height: 34px; display: flex; align-items: center; gap: 8px; padding: 0 10px; background: #f1f8f2; }.seller-order-head > label { display: flex; align-items: center; gap: 7px; }.seller-order-head > label strong { color: #253b2e; font-size: 12px; }.seller-order-head > span:not(.seller-status):not(.seller-order-state) { color: #93a097; font-size: 11px; }.seller-order-head > small { color: #718278; font-size: 11px; }.seller-status { padding: 4px 7px; border-radius: 10px; color: #168360; background: #dff2e5; font-size: 11px; white-space: nowrap; }.status-shipping { color: #0879b8; background: #e1f4fc; }.status-done { color: #208e5f; background: #def1e5; }.seller-order-state { margin-left: auto; color: #db552c; font-size: 12px; font-weight: 700; white-space: nowrap; }.state-ready { color: #087b61; }.state-shipping { color: #1685bb; }.state-done { color: #198c5d; }
.seller-order-body { min-height: 116px; display: grid; grid-template-columns: 58px minmax(120px, 1.7fr) minmax(95px, 1fr) minmax(80px, .8fr) 108px; align-items: center; gap: 9px; padding: 10px; }.seller-product-image { width: 52px; height: 52px; border-radius: 5px; object-fit: cover; }.seller-product-info { min-width: 0; align-self: center; }.seller-product-info > b { display: block; overflow: hidden; color: #293e32; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }.seller-product-info > small { display: block; margin-top: 4px; color: #78877e; font-size: 11px; }.seller-product-info > small span { color: #9ba79f; }.seller-product-info > p { margin: 7px 0 0; padding: 5px 6px; border-radius: 5px; color: #567261; background: #edf6ee; font-size: 11px; line-height: 1.45; }.seller-product-info > p.review { padding: 0; color: #15925f; background: transparent; }.seller-product-info > p.seller-resi-note { color: #587264; background: transparent; }.seller-resi-note b { color: #087b61; }.seller-customer { min-width: 0; align-self: center; color: #52675b; }.seller-customer > b { display: block; overflow: hidden; color: #334a3c; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.seller-customer > small { display: block; margin: 2px 0 4px 12px; color: #839188; font-size: 11px; }.seller-customer p { display: -webkit-box; overflow: hidden; margin: 0; color: #6c7d73; font-size: 11px; line-height: 1.45; line-clamp: 2; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }.seller-order-total { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; text-align: right; }.seller-order-total small { color: #839087; font-size: 10.5px; }.seller-order-total b { color: #087b61; font-size: 12px; }.seller-order-total small:last-child { color: #25916a; }.seller-order-buttons { display: flex; flex-direction: column; align-items: stretch; gap: 5px; }.seller-order-buttons button { min-height: 25px; padding: 0 6px; border: 0; border-radius: 5px; font-size: 11px; font-weight: 700; cursor: pointer; }.seller-order-buttons .order-primary { color: #fff; background: #07836a; }.seller-order-buttons .order-more { width: 22px; height: 23px; position: absolute; margin: 25px 0 0 77px; border: 1px solid #dae6de; color: #64796c; background: #f4f8f5; }.seller-order-buttons .order-print { color: #fff; background: #e85e3c; }.order-mini-actions { display: flex; gap: 4px; }.seller-order-buttons .order-mini-actions button { flex: 1; min-height: 26px; color: #43584a; background: #e9f1e9; font-size: 10px; }.seller-order-buttons .order-shipping { color: #0784bf; background: #e5f5fc; }.seller-order-buttons .order-detail { min-height: 34px; color: #40584a; background: #e9f0e9; }.seller-order-buttons .order-done { min-height: 30px; color: #40584a; background: #e9f0e9; }.seller-order-buttons > small { color: #7b8981; font-size: 10.5px; text-align: center; }.reject-link { margin-top: 1px; color: #d45242 !important; cursor: pointer; }
.seller-empty-state { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 32px 15px; border: 1px solid #e1ebe4; color: #33493d; background: white; }.seller-empty-state span { color: #849188; font-size: 12px; }.seller-pagination { min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 9px; padding: 6px 10px; border: 1px solid #e3ece5; border-radius: 7px; color: #798980; background: white; font-size: 12px; }.seller-pagination > div { display: flex; align-items: center; gap: 4px; }.seller-pagination button { width: 23px; height: 23px; border: 0; border-radius: 5px; color: #42584b; background: #edf4ee; font-size: 12px; cursor: pointer; }.seller-pagination button:disabled { color: #b7c1ba; cursor: default; }.seller-pagination button.current-page { color: white; background: #087b61; }
.seller-logistics-column { display: flex; flex-direction: column; gap: 10px; }.seller-side-panel { padding: 11px; border: 1px solid #e2ebe4; border-radius: 8px; background: white; }.seller-panel-heading { display: flex; align-items: flex-start; gap: 5px; }.seller-panel-heading > span:first-child { min-width: 0; display: flex; flex: 1; flex-direction: column; gap: 6px; }.seller-panel-heading b, .dispatcher-panel b, .logistics-tip b { color: #2f4437; font-size: 12px; }.seller-panel-heading small { color: #78877e; font-size: 11px; line-height: 1.55; }.region-chip { padding: 4px 6px; border-radius: 10px; color: #228663; background: #e9f5ec; font-size: 10px; line-height: 1.2; text-align: center; }.courier-point { margin-top: 8px; padding: 8px; border-radius: 6px; background: #eff7ef; }.courier-point b { display: flex; justify-content: space-between; gap: 5px; color: #40564a; font-size: 11px; }.courier-point b small { color: #168363; font-size: 10px; }.courier-point p { margin: 4px 0; color: #78867d; font-size: 10.5px; line-height: 1.4; }.courier-point > span { display: block; color: #258563; font-size: 10px; line-height: 1.4; }.courier-point > span.pickup-time { color: #df6740; }.seller-mini-map { height: 102px; position: relative; margin-top: 8px; overflow: hidden; border: 1px solid #dce9dc; border-radius: 6px; background-color: #e6f2e4; background-image: linear-gradient(30deg, transparent 46%, #fff 47%, #fff 50%, transparent 51%), linear-gradient(120deg, transparent 42%, #d1e4cc 43%, #d1e4cc 46%, transparent 47%), repeating-linear-gradient(0deg, transparent 0 19px, #d5e6d1 20px, transparent 22px); }.seller-mini-map::before { content: ''; width: 65%; height: 60%; position: absolute; top: 9px; left: 17%; border: 1px solid #c4dcbf; border-radius: 48% 52% 38% 62%; transform: rotate(-12deg); }.map-road { position: absolute; height: 2px; display: block; background: #fff; box-shadow: 0 0 0 1px #d6e5d4; }.road-one { width: 110%; top: 40%; left: -4%; transform: rotate(-18deg); }.road-two { width: 95%; top: 69%; left: 8%; transform: rotate(23deg); }.road-three { width: 85%; top: 52%; left: 27%; transform: rotate(78deg); }.map-pin { position: absolute; top: 38%; left: 54%; color: #df6449; font-size: 14px; text-shadow: 0 1px 2px #fff; }.seller-mini-map > small { position: absolute; bottom: 5px; left: 6px; color: #375447; font-size: 10px; }.seller-mini-map > b { position: absolute; right: 6px; bottom: 5px; color: #187b5c; font-size: 10px; }
.dispatcher-panel { display: flex; align-items: flex-start; gap: 9px; }.dispatcher-icon { width: 23px; height: 23px; flex: none; display: grid; place-items: center; border-radius: 6px; color: #16825f; background: #e4f3e8; font-size: 12px; }.dispatcher-panel > div { min-width: 0; display: flex; flex-direction: column; gap: 5px; }.dispatcher-panel small { color: #849188; font-size: 10.5px; }.dispatcher-panel p { margin: 2px 0; color: #6d7e73; font-size: 11px; line-height: 1.55; }.dispatcher-panel button { padding: 7px 6px; border: 0; border-radius: 5px; color: white; background: #087b61; font-size: 11px; font-weight: 700; cursor: pointer; }.dispatcher-panel > div > small:last-child { display: flex; justify-content: space-between; gap: 4px; }.dispatcher-panel > div > small:last-child b { color: #374d3f; font-size: 10.5px; }.logistics-tip { display: flex; align-items: flex-start; gap: 8px; background: #ebf7ec; }.logistics-tip > span { color: #128761; font-size: 14px; }.logistics-tip p { margin: 5px 0 0; color: #65786b; font-size: 11px; line-height: 1.6; }
.seller-modal-backdrop { position: fixed; z-index: 30; inset: 0; display: grid; place-items: center; padding: 16px; background: #17362980; }.seller-pickup-dialog { width: min(400px, 100%); position: relative; padding: 24px; border: 1px solid #dfe9e2; border-radius: 9px; background: white; box-shadow: 0 20px 60px #193d2a30; }.seller-modal-close { width: 28px; height: 28px; position: absolute; top: 10px; right: 10px; border: 0; border-radius: 5px; color: #63766a; background: #eef5ef; font-size: 18px; cursor: pointer; }.seller-pickup-dialog > small { color: #087b61; font-size: 12px; font-weight: 800; letter-spacing: .6px; }.seller-pickup-dialog h2 { margin: 7px 0; color: #20392b; font-size: 18px; }.seller-pickup-dialog p { margin: 0 0 17px; color: #708178; font-size: 12px; }.seller-pickup-dialog label { display: flex; flex-direction: column; gap: 6px; color: #485d50; font-size: 12px; font-weight: 700; }.seller-pickup-dialog select { height: 36px; padding: 0 8px; border: 1px solid #dce8df; border-radius: 5px; color: #43584a; background: #f8fbf8; font-size: 12px; }.seller-pickup-dialog > div { display: flex; justify-content: flex-end; gap: 7px; margin-top: 18px; }.seller-pickup-dialog > div button { min-height: 32px; padding: 0 12px; border: 1px solid #dfe9e2; border-radius: 5px; color: #586c5f; background: white; font-size: 12px; cursor: pointer; }.seller-pickup-dialog > div button:last-child { border-color: #087b61; color: white; background: #087b61; font-weight: 700; }.seller-toast { position: fixed; z-index: 40; right: 22px; bottom: 20px; max-width: min(410px, calc(100vw - 32px)); padding: 11px 15px; border: 1px solid #d4e8d9; border-radius: 6px; color: #24533b; background: #f7fff8; box-shadow: 0 8px 24px #17362920; font-size: 12px; }
.sr-only { width: 1px; height: 1px; position: absolute; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
@media (min-width: 1500px) { .seller-dashboard { grid-template-columns: 250px minmax(0, 1fr); }.seller-content { padding-inline: 28px; }.seller-workspace { grid-template-columns: minmax(0, 1fr) 250px; }.seller-order-body { grid-template-columns: 64px minmax(160px, 1.8fr) minmax(120px, 1fr) minmax(100px, .8fr) 120px; }.seller-product-image { width: 58px; height: 58px; } }
@media (max-width: 1100px) { .seller-dashboard { grid-template-columns: 205px minmax(0, 1fr); }.seller-content { padding-inline: 14px; }.seller-workspace { grid-template-columns: minmax(0, 1fr) 190px; gap: 8px; }.seller-order-body { grid-template-columns: 46px minmax(100px, 1.6fr) minmax(76px, 1fr) minmax(72px, .8fr) 88px; gap: 6px; padding: 8px; }.seller-product-image { width: 44px; height: 44px; }.seller-order-buttons button { font-size: 10px; }.seller-heading-actions { width: 155px; } }
@media (max-width: 820px) { .seller-dashboard { grid-template-columns: minmax(0, 1fr); }.seller-sidebar { min-width: 0; min-height: 0; position: static; padding: 10px 14px; border-right: 0; border-bottom: 1px solid #d9e9dd; }.seller-brand { align-self: flex-start; }.seller-shop-chip { max-width: 100%; margin: 9px 3px; }.seller-nav { width: 100%; min-width: 0; flex-direction: row; overflow-x: auto; }.seller-nav button { min-width: max-content; }.seller-sidebar-bottom { display: none; }.seller-topbar { padding-inline: 14px; }.seller-content { min-width: 0; padding: 14px; }.seller-workspace { grid-template-columns: minmax(0, 1fr) 205px; } }
@media (max-width: 650px) { .seller-topbar { height: 52px; gap: 7px; }.seller-search { width: auto; flex: 1; }.seller-add-product { padding-inline: 8px; font-size: 12px; }.seller-profile { display: none; }.seller-content { padding: 12px 10px 22px; }.seller-page-heading { align-items: flex-start; flex-direction: column; }.seller-page-heading h1 { font-size: 20px; }.seller-page-heading p { font-size: 12px; }.desktop-break { display: none; }.seller-heading-actions { width: 100%; flex-direction: row; }.seller-heading-actions > button { flex: 1; padding: 0 5px; font-size: 11px; }.seller-alert { grid-template-columns: 27px minmax(0, 1fr); }.seller-alert > button { grid-column: 2; justify-self: start; }.seller-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }.seller-stat-card { min-height: 87px; padding: 9px; }.seller-workspace { grid-template-columns: 1fr; }.seller-logistics-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }.logistics-panel { grid-column: 1 / -1; }.seller-order-body { grid-template-columns: 48px minmax(0, 1fr) 90px; align-items: start; }.seller-product-image { width: 45px; height: 45px; }.seller-product-info { grid-column: 2; }.seller-customer { grid-column: 2; }.seller-order-total { grid-column: 3; grid-row: 1; }.seller-order-buttons { grid-column: 3; grid-row: 2 / span 2; }.seller-order-head { gap: 5px; padding-inline: 7px; }.seller-order-head > small { display: none; }.seller-order-head > span:not(.seller-status):not(.seller-order-state) { display: none; }.seller-order-head .seller-status { font-size: 10px; }.seller-order-state { font-size: 11px; }.seller-filter-controls { flex-wrap: wrap; }.seller-filter-controls label { flex-basis: 100%; }.seller-filter-controls select, .seller-filter-controls > button { flex: 1; max-width: none; }.seller-bulk-actions { gap: 5px; }.seller-bulk-actions > div { width: 100%; margin-left: 0; }.seller-pagination { font-size: 11px; }.seller-pagination > div { gap: 2px; }.seller-pagination button { width: 21px; height: 21px; } }
@media (max-width: 390px) { .seller-logistics-column { grid-template-columns: 1fr; }.logistics-panel { grid-column: auto; }.seller-order-body { grid-template-columns: 40px minmax(0, 1fr) 78px; gap: 5px; padding: 7px; }.seller-product-image { width: 38px; height: 38px; }.seller-order-buttons button { padding-inline: 3px; font-size: 9.5px; }.seller-order-state { max-width: 72px; overflow: hidden; text-overflow: ellipsis; }.seller-stats .seller-stat-card > p { font-size: 10px; } }
</style>