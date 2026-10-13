<script setup lang="ts">
import { computed, ref } from 'vue'

type InventoryStatus = 'active' | 'inactive' | 'curation'
type InventoryProduct = {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  variants: string[]
  image: string
  status: InventoryStatus
  addedAt: number
}

const emit = defineEmits<{ back: []; addProduct: []; editProduct: [productName: string] }>()

const activeTab = ref('Semua Produk')
const searchQuery = ref('')
const selectedCategory = ref('Semua Kategori')
const selectedStock = ref('Semua Status Stok')
const sortOrder = ref('Terbaru Ditambahkan')
const selectedIds = ref<string[]>([])
const bulkAction = ref('')
const bulkAmount = ref(5)
const notice = ref('')
const adjustmentDialogOpen = ref(false)
const editingProduct = ref<InventoryProduct | null>(null)
const editStockValue = ref(0)
let noticeTimer: ReturnType<typeof setTimeout> | undefined

const products = ref<InventoryProduct[]>([
  { id: 'batik-megamendung', name: 'Kain Batik Cap Pekalongan Motif Megamendung 2x1.15m', sku: 'PP-BPK-250', category: 'Batik Cap', price: 125000, stock: 24, variants: ['Katun Halus', 'Sutera Halus'], image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=240&q=80', status: 'active', addedAt: 5 },
  { id: 'tenun-tarutung', name: 'Selendang Tenun Ikat Tarutung Pewarna Alam', sku: 'PP-TNT-500', category: 'Tenun Ikat', price: 145000, stock: 12, variants: ['Benang Katun', 'Pewarna Alam'], image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=240&q=80', status: 'active', addedAt: 4 },
  { id: 'batik-kawung', name: 'Kain Batik Tulis Solo Motif Kawung Klasik Halus', sku: 'PP-BKS-1KG', category: 'Batik Tulis', price: 285000, stock: 3, variants: ['Kain Primissima', 'Batik Tulis Sogan'], image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=240&q=80', status: 'active', addedAt: 3 },
  { id: 'tenun-sumba-lot', name: 'Kain Tenun Ikat Sumba Special Indigo Micro-lot', sku: 'PP-FHP-200', category: 'Tenun Sumba', price: 385000, stock: 0, variants: ['Tenun Tangan Asli'], image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=240&q=80', status: 'active', addedAt: 2 },
  { id: 'pouch-etnik', name: 'Tas Pouch Etnik Kombinasi Tenun Ikat & Kayu Jati', sku: 'PP-CKB-01', category: 'Aksesoris Etnik', price: 78000, stock: 18, variants: ['Cokelat Kayu', 'Merah Marun'], image: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=240&q=80', status: 'active', addedAt: 1 },
])

const tabs = [
  { label: 'Semua Produk', filter: 'all', count: 28 },
  { label: 'Aktif Tayang', filter: 'active', count: 24 },
  { label: 'Stok Menipis', filter: 'low', count: 3 },
  { label: 'Non-aktif / Habis', filter: 'out', count: 1 },
  { label: 'Dalam Kurasi', filter: 'curation', count: 0 },
]

const stockBadge = (product: InventoryProduct) => product.stock === 0 ? 'Habis' : product.stock <= 5 ? 'Kritis' : 'Aman'
const lowStockCount = computed(() => products.value.filter((product) => product.stock > 0 && product.stock <= 5).length + 2)
const activeProductCount = computed(() => products.value.filter((product) => product.status === 'active').length + 19)
const visibleProducts = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('id')
  const tabFilter = tabs.find((tab) => tab.label === activeTab.value)?.filter ?? 'all'
  const matches = products.value.filter((product) => {
    const matchesQuery = !query || `${product.name} ${product.sku} ${product.category} ${product.variants.join(' ')}`.toLocaleLowerCase('id').includes(query)
    const matchesCategory = selectedCategory.value === 'Semua Kategori' || product.category === selectedCategory.value
    const matchesStock = selectedStock.value === 'Semua Status Stok' || (selectedStock.value === 'Stok Menipis' ? product.stock > 0 && product.stock <= 5 : selectedStock.value === 'Stok Habis' ? product.stock === 0 : product.stock > 5)
    const matchesTab = tabFilter === 'all'
      || tabFilter === 'active' && product.status === 'active' && product.stock > 0
      || tabFilter === 'low' && product.stock > 0 && product.stock <= 5
      || tabFilter === 'out' && product.stock === 0
      || tabFilter === 'curation' && product.status === 'curation'
    return matchesQuery && matchesCategory && matchesStock && matchesTab
  })
  return matches.sort((first, second) => sortOrder.value === 'Harga Tertinggi' ? second.price - first.price : sortOrder.value === 'Stok Terendah' ? first.stock - second.stock : second.addedAt - first.addedAt)
})
const selectableIds = computed(() => visibleProducts.value.map((product) => product.id))
const allVisibleSelected = computed(() => selectableIds.value.length > 0 && selectableIds.value.every((id) => selectedIds.value.includes(id)))

function notify(message: string) {
  notice.value = message
  if (noticeTimer) clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 2600)
}

function selectAllVisible() {
  selectedIds.value = allVisibleSelected.value
    ? selectedIds.value.filter((id) => !selectableIds.value.includes(id))
    : [...new Set([...selectedIds.value, ...selectableIds.value])]
}

function runBulkAction() {
  if (!selectedIds.value.length) {
    notify('Pilih produk yang akan diperbarui terlebih dahulu.')
    return
  }
  if (!bulkAction.value) {
    notify('Pilih tindakan massal terlebih dahulu.')
    return
  }
  products.value.forEach((product) => {
    if (!selectedIds.value.includes(product.id)) return
    if (bulkAction.value === 'add-stock') product.stock += Math.max(1, Number(bulkAmount.value))
    if (bulkAction.value === 'subtract-stock') product.stock = Math.max(0, product.stock - Math.max(1, Number(bulkAmount.value)))
    if (bulkAction.value === 'deactivate') product.status = 'inactive'
    if (bulkAction.value === 'activate') product.status = 'active'
  })
  notify(`${selectedIds.value.length} produk berhasil diperbarui.`)
  selectedIds.value = []
  bulkAction.value = ''
}

function openStockEditor(product: InventoryProduct) {
  editingProduct.value = product
  editStockValue.value = product.stock
  adjustmentDialogOpen.value = true
}

function saveStock() {
  if (editingProduct.value) editingProduct.value.stock = Math.max(0, Number(editStockValue.value))
  adjustmentDialogOpen.value = false
  notify('Jumlah stok berhasil diperbarui.')
}

function exportProducts() {
  const rows = [['SKU', 'Nama Produk', 'Kategori', 'Harga', 'Stok', 'Status']]
  visibleProducts.value.forEach((product) => rows.push([product.sku, product.name, product.category, String(product.price), String(product.stock), product.status]))
  const csv = rows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'katalog-produk-pasarpintar.csv'
  link.click()
  URL.revokeObjectURL(url)
  notify('Daftar produk berhasil diunduh.')
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString('id-ID')}`
}
</script>

<template>
  <main class="product-inventory">
    <header class="inventory-heading"><div><span class="catalog-live"><i></i> Katalog Live 24/7</span><h1>Katalog &amp; Stok Produk Toko</h1><p>Kelola daftar produk UMKM, varian motif, pembaruan stok berkala, serta<br class="inventory-desktop-break" /> pantau status kurasi aktif dalam ekosistem PasarPintar.</p></div><div class="inventory-heading-actions"><div><button type="button" class="inventory-export" @click="exportProducts">⇩ &nbsp; Unduh Excel</button><button type="button" class="inventory-mass-update" @click="bulkAction = 'add-stock'; runBulkAction()">▣ &nbsp; Update Stok Massal</button></div><button type="button" class="inventory-add-product" @click="emit('addProduct')">＋ &nbsp; Tambah Produk Baru</button></div></header>

    <section class="inventory-kpis"><article><header>Total Nilai Stok <span>▣</span></header><strong>Rp 38.450.000</strong><small class="positive">↗ +14.2% bln ini</small></article><article><header>SKU Siap Jual <span>▤</span></header><strong>{{ activeProductCount }} <small>/ 28 produk</small></strong><small>92% katalog operasional</small></article><article><header>Peringatan Kritis <span>♧</span></header><strong class="critical">{{ lowStockCount }} <small>SKU</small></strong><small class="critical-copy">△ Perlu restock segera</small></article><article><header>Rasio Konversi Toko <span>⌁</span></header><strong>4.8%</strong><small class="positive">⊙ Top 5% Kategori Wastra</small></article></section>

    <section class="inventory-panel">
      <nav class="inventory-tabs" aria-label="Filter status produk"><button v-for="tab in tabs" :key="tab.filter" type="button" :class="{ active: activeTab === tab.label }" @click="activeTab = tab.label"><span>{{ tab.label }}</span><b :class="{ warn: tab.filter === 'low', danger: tab.filter === 'out' }">{{ tab.count }}</b></button><span class="realtime-badge"><i>↻</i> Stok realtime<br />tersinkronisasi</span></nav>
      <section class="inventory-filters"><label class="inventory-search"><span>⌕</span><input v-model="searchQuery" type="search" placeholder="Cari nama produk, SKU, varian motif..." aria-label="Cari produk, SKU, atau varian" /></label><select v-model="selectedCategory" aria-label="Filter kategori"><option>Semua Kategori</option><option>Batik Cap</option><option>Batik Tulis</option><option>Tenun Ikat</option></select><select v-model="selectedStock" aria-label="Filter status stok"><option>Semua Status Stok</option><option>Stok Menipis</option><option>Stok Habis</option><option>Stok Aman</option></select><select v-model="sortOrder" aria-label="Urutkan produk"><option>Terbaru Ditambahkan</option><option>Harga Tertinggi</option><option>Stok Terendah</option></select><button type="button" class="filter-icon" aria-label="Atur filter lanjutan" @click="notify('Semua filter lanjutan sedang diterapkan.')">☷</button></section>

      <div class="inventory-bulk-bar"><label><input type="checkbox" :checked="allVisibleSelected" @change="selectAllVisible" /> Pilih {{ selectedIds.length }} dari 28 produk</label><div><select v-model="bulkAction" aria-label="Aksi massal"><option value="">Aksi Massal...</option><option value="add-stock">Tambah stok</option><option value="subtract-stock">Kurangi stok</option><option value="activate">Aktifkan produk</option><option value="deactivate">Nonaktifkan produk</option></select><input v-if="bulkAction === 'add-stock' || bulkAction === 'subtract-stock'" v-model.number="bulkAmount" aria-label="Jumlah stok massal" type="number" min="1" /><button type="button" :disabled="!selectedIds.length" @click="runBulkAction">Terapkan</button></div><span v-if="selectedIds.length" class="selection-count">{{ selectedIds.length }} produk dipilih</span></div>

      <div class="inventory-table-wrap"><table class="inventory-table"><thead><tr><th><input type="checkbox" :checked="allVisibleSelected" aria-label="Pilih semua produk terlihat" @change="selectAllVisible" /></th><th>Informasi Produk</th><th>Varian Tersedia</th><th>Harga Jual</th><th>Stok Tersedia</th><th>Aksi</th></tr></thead><tbody><tr v-for="product in visibleProducts" :key="product.id"><td><input v-model="selectedIds" type="checkbox" :value="product.id" :aria-label="`Pilih ${product.name}`" /></td><td><div class="inventory-product-info"><img :src="product.image" :alt="product.name" /><div><div class="product-meta"><span v-if="product.id === 'batik-megamendung' || product.id === 'tenun-tarutung'" class="curator-badge">✓ Kurasi Kemenkop</span><span v-else-if="product.stock === 0" class="empty-badge">Stok Kosong</span><span v-else-if="product.id === 'pouch-etnik'" class="local-badge">Kerajinan Lokal</span><small>{{ product.category }}</small></div><b>{{ product.name }}</b><small class="product-sku">SKU: {{ product.sku }}</small></div></div></td><td><b>{{ product.variants.length }} Varian Motif</b><small>{{ product.variants.join(' • ') }}</small></td><td><strong>{{ formatRupiah(product.price) }}</strong><small v-if="product.id === 'batik-megamendung'" class="old-price">Rp 175.000 <i>-28%</i></small><small v-else>Harga Standar</small></td><td><button type="button" class="stock-pill" :class="{ low: product.stock > 0 && product.stock <= 5, empty: product.stock === 0 }" @click="openStockEditor(product)"><i></i>{{ product.stock }} pcs <small v-if="product.stock === 0">(Habis)</small><small v-else-if="product.stock <= 5">(Kritis)</small></button></td><td><div class="inventory-row-actions"><button type="button" :aria-label="`Edit ${product.name}`" title="Edit produk" @click="emit('editProduct', product.name)">✎</button><button type="button" :aria-label="`Perbarui stok ${product.name}`" title="Perbarui stok" @click="openStockEditor(product)">＋</button></div></td></tr><tr v-if="!visibleProducts.length"><td colspan="6" class="inventory-empty">Produk tidak ditemukan. Ubah kata kunci atau filter.</td></tr></tbody></table></div>

      <footer class="inventory-footer"><span>Menampilkan {{ visibleProducts.length ? 1 : 0 }}–{{ visibleProducts.length }} dari 28 produk</span><div><button type="button" disabled aria-label="Halaman sebelumnya">‹</button><button class="page-current" type="button">1</button><button type="button" @click="notify('Halaman 2 katalog akan dimuat.')">2</button><button type="button" @click="notify('Halaman 3 katalog akan dimuat.')">3</button><span>...</span><button type="button" @click="notify('Halaman 6 katalog akan dimuat.')">6</button><button type="button" aria-label="Halaman berikutnya" @click="notify('Halaman berikutnya akan dimuat.')">›</button></div></footer>
    </section>

    <aside class="inventory-tip"><span>♧</span><div><b>Tips Manajemen Stok Wastra</b><p>Aktifkan opsi “Notifikasi Stok Otomatis via WhatsApp” agar pasokan kain batik dan tenun dari perajin daerah selalu terjadwal sebelum stok mencapai batas kritis.</p></div><button type="button" @click="notify('Pusat edukasi stok dibuka.')">Buka Pusat Edukasi →</button></aside>
    <div v-if="adjustmentDialogOpen" class="inventory-modal-backdrop" @click.self="adjustmentDialogOpen = false"><section class="inventory-stock-dialog" role="dialog" aria-modal="true" aria-labelledby="stock-dialog-title"><button class="inventory-modal-close" type="button" aria-label="Tutup" @click="adjustmentDialogOpen = false">×</button><small>INVENTARIS PRODUK</small><h2 id="stock-dialog-title">Perbarui stok</h2><p>{{ editingProduct?.name }}</p><label>Stok tersedia (pcs)<input v-model.number="editStockValue" type="number" min="0" /></label><div><button type="button" @click="adjustmentDialogOpen = false">Batal</button><button type="button" @click="saveStock">Simpan Stok</button></div></section></div>
    <div v-if="notice" class="inventory-toast" role="status">✓ &nbsp; {{ notice }}</div>
  </main>
</template>

<style scoped>
.product-inventory { display: flex; flex-direction: column; gap: 14px; color: #263a30; }.inventory-heading { display: flex; align-items: center; justify-content: space-between; gap: 14px; }.catalog-live { display: inline-flex; align-items: center; gap: 4px; padding: 3px 6px; border-radius: 10px; color: #087b61; background: #e7f4e9; font-size: 10px; font-weight: 800; text-transform: uppercase; }.catalog-live i { width: 5px; height: 5px; border-radius: 50%; background: #14a36e; }.inventory-heading h1 { margin: 5px 0 4px; color: #20372b; font-size: clamp(19px, 1.7vw, 24px); line-height: 1.2; }.inventory-heading p { margin: 0; color: #77877d; font-size: 12px; line-height: 1.5; }.inventory-heading-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 7px; }.inventory-heading-actions > div { display: flex; gap: 7px; }.inventory-heading-actions button { min-height: 28px; padding: 0 9px; border: 1px solid #e1eae3; border-radius: 5px; color: #4b6253; background: white; font-size: 11px; font-weight: 700; cursor: pointer; }.inventory-heading-actions button.inventory-add-product { min-height: 30px; border-color: #087b61; color: white; background: #087b61; font-size: 12px; }.inventory-heading-actions button.inventory-mass-update { color: #087b61; }
.inventory-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 9px; }.inventory-kpis article { min-width: 0; min-height: 67px; position: relative; padding: 9px 10px; border: 1px solid #e1ebe3; border-radius: 7px; background: white; }.inventory-kpis header { display: flex; align-items: center; justify-content: space-between; gap: 3px; color: #849188; font-size: 10px; text-transform: uppercase; }.inventory-kpis header span { width: 18px; height: 18px; display: grid; place-items: center; border-radius: 5px; color: #087b61; background: #e7f4e9; font-size: 12px; }.inventory-kpis article > strong { display: block; margin-top: 4px; color: #2f4437; font-size: 12px; }.inventory-kpis article > strong small { color: #7a8a80; font-size: 11px; font-weight: 400; }.inventory-kpis article > small { display: block; margin-top: 3px; color: #7d8b82; font-size: 10px; }.inventory-kpis .positive { color: #198a60; }.inventory-kpis article > strong.critical, .inventory-kpis .critical-copy { color: #e34e2e; }
.inventory-panel { overflow: hidden; border: 1px solid #e1ebe3; border-radius: 8px; background: white; }.inventory-tabs { min-height: 47px; display: flex; align-items: stretch; gap: 5px; padding: 0 10px; border-bottom: 1px solid #e8efe9; }.inventory-tabs > button { min-width: max-content; position: relative; display: flex; align-items: center; gap: 6px; padding: 0 10px; border: 0; color: #718177; background: transparent; font-size: 12px; cursor: pointer; }.inventory-tabs > button.active { color: #087b61; font-weight: 700; }.inventory-tabs > button.active::after { height: 2px; position: absolute; right: 7px; bottom: 0; left: 7px; background: #087b61; content: ''; }.inventory-tabs > button b { min-width: 15px; height: 15px; display: grid; place-items: center; border-radius: 9px; color: #607467; background: #eaf1eb; font-size: 10px; }.inventory-tabs > button b.warn { color: #e65f37; background: #fff0e9; }.inventory-tabs > button b.danger { color: #ca493c; background: #ffe8e5; }.realtime-badge { display: flex; align-items: center; gap: 4px; margin-left: auto; color: #5c806b; font-size: 10px; line-height: 1.3; }.realtime-badge i { color: #1c966a; font-size: 12px; font-style: normal; }
.inventory-filters { display: flex; gap: 6px; padding: 10px 12px; border-bottom: 1px solid #edf2ed; }.inventory-search { min-width: 130px; height: 27px; display: flex; flex: 1; align-items: center; gap: 6px; padding: 0 8px; border: 1px solid #e3ebe4; border-radius: 5px; color: #809087; background: #f9fcf9; }.inventory-search span { font-size: 13px; }.inventory-search input { width: 100%; min-width: 0; border: 0; outline: 0; color: #43584a; background: transparent; font-size: 11px; }.inventory-filters select { max-width: 135px; min-width: 95px; height: 27px; padding: 0 7px; border: 1px solid #e3ebe4; border-radius: 5px; color: #475d4f; background: white; font-size: 11px; }.filter-icon { width: 26px; height: 27px; flex: none; border: 1px solid #e3ebe4; border-radius: 5px; color: #577060; background: #f6faf6; cursor: pointer; }.inventory-bulk-bar { min-height: 35px; display: flex; align-items: center; gap: 8px; padding: 5px 12px; border-bottom: 1px solid #e9f0ea; background: #fbfdfb; }.inventory-bulk-bar > label { display: flex; align-items: center; gap: 5px; color: #748479; font-size: 10px; }.inventory-bulk-bar input[type="checkbox"], .inventory-table input[type="checkbox"] { width: 12px; height: 12px; accent-color: #087b61; }.inventory-bulk-bar > div { display: flex; align-items: center; gap: 5px; }.inventory-bulk-bar select, .inventory-bulk-bar > div > input { height: 22px; max-width: 115px; padding: 0 6px; border: 1px solid #e4ece5; border-radius: 4px; color: #687b6e; background: white; font-size: 10px; }.inventory-bulk-bar > div > input { width: 50px; }.inventory-bulk-bar > div > button { min-height: 22px; padding: 0 8px; border: 0; border-radius: 4px; color: white; background: #168b69; font-size: 10px; cursor: pointer; }.inventory-bulk-bar > div > button:disabled { color: #829087; background: #e6eee7; cursor: default; }.selection-count { margin-left: auto; color: #148561; font-size: 10px; }
.inventory-table-wrap { overflow-x: auto; }.inventory-table { width: 100%; border-collapse: collapse; text-align: left; }.inventory-table th { padding: 8px 7px; color: #6e8074; background: #eaf5eb; font-size: 10px; font-weight: 600; text-transform: uppercase; white-space: nowrap; }.inventory-table th:first-child, .inventory-table td:first-child { width: 31px; padding-left: 13px; }.inventory-table td { padding: 7px; border-top: 1px solid #eef3ee; vertical-align: middle; }.inventory-table td:nth-child(3) { min-width: 132px; }.inventory-table td:nth-child(4) { min-width: 80px; }.inventory-table td:nth-child(5) { min-width: 77px; }.inventory-product-info { min-width: 240px; display: flex; align-items: center; gap: 8px; }.inventory-product-info > img { width: 35px; height: 35px; flex: none; border-radius: 5px; object-fit: cover; }.inventory-product-info > div { min-width: 0; display: flex; flex-direction: column; gap: 3px; }.product-meta { display: flex; align-items: center; gap: 5px; }.product-meta > small { overflow: hidden; color: #76867b; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.curator-badge, .empty-badge, .local-badge { width: fit-content; padding: 2px 4px; border-radius: 7px; color: #087b61; background: #e1f3e6; font-size: 9px; white-space: nowrap; }.empty-badge { color: #c34a3a; background: #ffe9e5; }.local-badge { color: #598252; background: #e9f3df; }.inventory-product-info > div > b { overflow: hidden; color: #304638; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.product-sku { color: #869389; font-family: monospace; font-size: 9px; }.inventory-table td:nth-child(3) > b { display: block; color: #3f5346; font-size: 10px; font-weight: 500; }.inventory-table td:nth-child(3) > small, .inventory-table td:nth-child(4) > small { display: block; margin-top: 3px; color: #839087; font-size: 9px; }.inventory-table td:nth-child(4) > strong { color: #087b61; font-size: 12px; white-space: nowrap; }.inventory-table td:nth-child(4) > small.old-price { display: flex; align-items: center; gap: 5px; }.old-price { text-decoration: line-through; }.old-price i { padding: 2px 4px; border-radius: 8px; color: #df5434; background: #fff0e9; font-size: 9px; font-style: normal; text-decoration: none; }.stock-pill { min-height: 20px; display: inline-flex; align-items: center; gap: 4px; padding: 0 6px; border: 0; border-radius: 5px; color: #3f5949; background: #eaf4eb; font-size: 10px; font-weight: 700; white-space: nowrap; cursor: pointer; }.stock-pill > i { width: 5px; height: 5px; border-radius: 50%; background: #16a267; }.stock-pill.low { color: #de5b31; background: #fff2e8; }.stock-pill.low > i { background: #ed703a; }.stock-pill.empty { color: #d64a3d; background: #ffe9e6; }.stock-pill.empty > i { background: #e95646; }.stock-pill > small { font-size: 9px; }.inventory-row-actions { display: flex; gap: 4px; }.inventory-row-actions button { width: 22px; height: 22px; border: 1px solid #e2ebe3; border-radius: 4px; color: #557060; background: #f7faf7; cursor: pointer; }.inventory-empty { padding: 25px !important; color: #819087; text-align: center; font-size: 12px; }
.inventory-footer { min-height: 35px; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 5px 12px; border-top: 1px solid #edf2ed; color: #7e8d82; background: #fbfdfb; font-size: 10px; }.inventory-footer > div { display: flex; align-items: center; gap: 4px; }.inventory-footer button { width: 21px; height: 21px; border: 1px solid #e3ece4; border-radius: 5px; color: #51675a; background: white; font-size: 11px; cursor: pointer; }.inventory-footer button:disabled { color: #b9c3bc; cursor: default; }.inventory-footer button.page-current { border-color: #087b61; color: white; background: #087b61; }.inventory-tip { min-height: 50px; display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid #e4efe5; border-radius: 7px; background: #e9f5e9; }.inventory-tip > span { width: 24px; height: 24px; flex: none; display: grid; place-items: center; border-radius: 6px; color: white; background: #087b61; font-size: 12px; }.inventory-tip > div { min-width: 0; flex: 1; }.inventory-tip b { color: #385040; font-size: 11px; }.inventory-tip p { margin: 3px 0 0; color: #75867b; font-size: 10px; line-height: 1.45; }.inventory-tip > button { flex: none; padding: 0; border: 0; color: #087b61; background: transparent; font-size: 10px; font-weight: 700; cursor: pointer; }
.inventory-modal-backdrop { position: fixed; z-index: 30; inset: 0; display: grid; place-items: center; padding: 16px; background: #17362980; }.inventory-stock-dialog { width: min(350px, 100%); position: relative; padding: 22px; border: 1px solid #dfe9e2; border-radius: 8px; background: white; box-shadow: 0 20px 60px #193d2a30; }.inventory-modal-close { width: 27px; height: 27px; position: absolute; top: 9px; right: 9px; border: 0; border-radius: 5px; color: #63766a; background: #eef5ef; font-size: 18px; cursor: pointer; }.inventory-stock-dialog > small { color: #087b61; font-size: 11px; font-weight: 800; letter-spacing: .5px; }.inventory-stock-dialog h2 { margin: 6px 0; color: #20392b; font-size: 17px; }.inventory-stock-dialog p { margin: 0 0 15px; color: #718178; font-size: 12px; }.inventory-stock-dialog label { display: flex; flex-direction: column; gap: 6px; color: #495e50; font-size: 12px; font-weight: 700; }.inventory-stock-dialog input { height: 34px; padding: 0 8px; border: 1px solid #dce8df; border-radius: 5px; color: #43584a; background: #f8fbf8; font-size: 12px; }.inventory-stock-dialog > div { display: flex; justify-content: flex-end; gap: 7px; margin-top: 17px; }.inventory-stock-dialog > div button { min-height: 30px; padding: 0 11px; border: 1px solid #dfe9e2; border-radius: 5px; color: #586c5f; background: white; font-size: 12px; cursor: pointer; }.inventory-stock-dialog > div button:last-child { border-color: #087b61; color: white; background: #087b61; font-weight: 700; }.inventory-toast { position: fixed; z-index: 40; right: 18px; bottom: 18px; max-width: min(390px, calc(100vw - 30px)); padding: 10px 13px; border: 1px solid #d4e8d9; border-radius: 6px; color: #24533b; background: #f7fff8; box-shadow: 0 8px 24px #17362920; font-size: 12px; }
@media (max-width: 1050px) { .inventory-heading-actions button { padding-inline: 7px; }.inventory-tabs { overflow-x: auto; }.inventory-tabs > button { padding-inline: 7px; }.inventory-table { min-width: 670px; } }
@media (max-width: 760px) { .inventory-heading { align-items: flex-start; flex-direction: column; }.inventory-heading-actions { width: 100%; align-items: stretch; }.inventory-heading-actions > div { justify-content: flex-start; }.inventory-heading-actions > button { align-self: flex-start; }.inventory-desktop-break { display: none; }.inventory-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }.inventory-filters { flex-wrap: wrap; }.inventory-search { flex-basis: 100%; }.inventory-filters select { max-width: none; flex: 1; }.inventory-bulk-bar { flex-wrap: wrap; }.inventory-bulk-bar > div { flex-wrap: wrap; }.inventory-tip { align-items: flex-start; flex-wrap: wrap; }.inventory-tip > button { margin-left: 32px; }.inventory-tabs { min-height: 42px; }.inventory-table { min-width: 650px; } }
@media (max-width: 430px) { .inventory-heading-actions > div { width: 100%; }.inventory-heading-actions > div button { flex: 1; }.inventory-tabs { padding-inline: 4px; }.inventory-tabs > button { gap: 4px; padding-inline: 5px; font-size: 11px; }.realtime-badge { min-width: 48px; }.inventory-footer { align-items: flex-start; flex-direction: column; }.inventory-footer > div { align-self: flex-end; }.inventory-bulk-bar > label { flex: 1; }.inventory-bulk-bar > div { width: 100%; }.inventory-bulk-bar select { flex: 1; }.inventory-product-info { min-width: 210px; } }
</style>