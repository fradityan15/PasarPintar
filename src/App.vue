<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ProductCard from './components/pembeli/KartuProduk.vue'
import CartCheckout from './components/pembeli/KeranjangPembayaran.vue'
import ProductDetail, { type ProductDetailData } from './components/pembeli/DetailProduk.vue'
import AuthPage from './components/pembeli/HalamanAutentikasi.vue'
import OrderTracking from './components/pembeli/PelacakanPesanan.vue'
import PlatformSettings from './components/admin/PengaturanPlatform.vue'
import SellerOrderManagement from './components/penjual/KelolaPesananPenjual.vue'

interface CartLine {
  id: string
  name: string
  imageUrl: string
  imageAlt: string
  price: number
  quantity: number
  sellerName: string
  sellerLocation: string
  variant: string
  selected: boolean
  note: string
  shippingMethod: string
}

const searchQuery = ref('')
const searchCategory = ref('')
const currentView = ref<'home' | 'cart' | 'detail' | 'auth' | 'tracking' | 'seller' | 'admin'>('home')
const authMode = ref<'login' | 'register'>('login')
const isAuthenticated = ref(false)
const accountName = ref('')
const accountEmail = ref('')
const selectedProductId = ref('coffee-flores')
const cartItems = ref<CartLine[]>([
  {
    id: 'coffee-flores',
    name: 'Kopi Arabika Flores Bajawa Single Origin – Roast Beans',
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=82',
    imageAlt: 'Kopi arabika Flores dalam kemasan',
    price: 68000,
    quantity: 2,
    sellerName: 'Koperasi Kopi Bajawa',
    sellerLocation: 'Bajawa, Nusa Tenggara Timur',
    variant: '250 gram · Biji Utuh',
    selected: true,
    note: '',
    shippingMethod: 'J&T Reguler',
  },
  {
    id: 'demo-batik',
    name: 'Kemeja Batik Cap Khas Halus Motif Parang',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=300&q=82',
    imageAlt: 'Kain batik motif tradisional',
    price: 135000,
    quantity: 1,
    sellerName: 'Batik Sekar Arum',
    sellerLocation: 'Pekalongan, Jawa Tengah',
    variant: 'Ukuran L · Motif Parang',
    selected: true,
    note: '',
    shippingMethod: 'SiCepat Hemat',
  },
])
const wishlist = ref<string[]>([])
const email = ref('')
const subscribed = ref(false)
const activeFilter = ref('Semua Pilihan')
const productFilters = ['Semua Pilihan', 'Kuliner Nusantara', 'Wastra & Kriya', 'Kriya Rumah']
const activeHeaderPanel = ref<null | 'notifications' | 'wishlist'>(null)
const mobileUtilitiesOpen = ref(false)
const notificationItems = ref([
  { id: 'promo', title: 'Promo Bangga Lokal', description: 'Diskon produk lokal sampai dengan Rp20.000.', time: 'Baru saja', read: false, productId: 'sale-1' },
  { id: 'coffee', title: 'Kopi pilihan dari Flores', description: 'Kopi Arabika Bajawa kini tersedia di katalog.', time: '1 jam lalu', read: false, productId: 'coffee-flores' },
  { id: 'curation', title: 'Koleksi kurator diperbarui', description: 'Lihat produk pilihan baru minggu ini.', time: 'Kemarin', read: false, productId: 'curated-2' },
])
const cartCount = computed(() => cartItems.value.reduce((count, item) => count + item.quantity, 0))
const unreadNotificationCount = computed(() => notificationItems.value.filter((notification) => !notification.read).length)

const currentSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval> | undefined

const heroBanners = [
  {
    title: 'PasarPintar Pilih Lokal',
    subtitle: 'Rumah Produk Lokal No. 1 di Indonesia',
    tag: 'GERAKAN NASIONAL BANGGA BUATAN INDONESIA',
    description: 'Dukung perajin, petani rempah, dan produsen rumahan dari 38 provinsi di Nusantara.',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=88',
    ctaText: 'Jelajahi Katalog',
    ctaLink: '#produk',
  },
  {
    title: 'Koleksi Wastra & Tenun Sumba',
    subtitle: 'Sentra Batik Tulis & Tenun Ikat Asli',
    tag: 'WARISAN BUDAYA NUSANTARA',
    description: 'Karya perajin lokal dengan pewarna alami tradisional.',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&q=88',
    ctaText: 'Lihat Batik & Tenun',
    ctaLink: '#produk',
  },
  {
    title: 'Kopi Arabika Bajawa Single Origin',
    subtitle: 'Petik Merah Lereng Gunung Inerie',
    tag: 'FLORES BAJAWA LOKAL',
    description: 'Cita rasa cokelat & buah segar khas dataran tinggi NTT.',
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=88',
    ctaText: 'Pesan Kopi Bajawa',
    ctaLink: '#produk',
  },
]

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % heroBanners.length
}

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + heroBanners.length) % heroBanners.length
}

function setSlide(index: number) {
  currentSlide.value = index
}

onMounted(() => {
  slideTimer = setInterval(() => {
    nextSlide()
  }, 5000)
})

onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer)
})

const quickLinks = [
  { name: 'Pilih Lokal', icon: '🇮🇩', filter: 'Semua Pilihan', badge: 'Terbaru' },
  { name: 'Mall UMKM', icon: '🏪', filter: 'Semua Pilihan', badge: '100% Ori' },
  { name: 'Bebas Ongkir', icon: '🚚', filter: 'Semua Pilihan', badge: 'Afirmasi 3T' },
  { name: 'Flash Sale', icon: '♨️', action: 'promo', badge: 'Diskon' },
  { name: 'Kopi & Teh', icon: '☕', filter: 'Kuliner Nusantara' },
  { name: 'Batik & Tenun', icon: '🧵', filter: 'Wastra & Kriya' },
  { name: 'Voucher GBBI', icon: '🎟️', filter: 'Semua Pilihan', badge: 'Diskon' },
  { name: 'Lacak Pesanan', icon: '📦', action: 'tracking' },
  { name: 'Garansi Retur', icon: '🛡️', action: 'help' },
  { name: 'Semua Promo', icon: '⚡', action: 'promo' },
]

function handleQuickShortcut(item: (typeof quickLinks)[number]) {
  if (item.filter) {
    selectProductFilter(item.filter)
    submitSearch()
  } else if (item.action === 'tracking') {
    openTracking()
  } else if (item.action === 'promo') {
    document.getElementById('promo')?.scrollIntoView({ behavior: 'smooth' })
  }
}

const categories = [
  { name: 'Camilan & Keripik', count: '1.420 Produk', image: 'photo-1566478989037-eec170784d0b' },
  { name: 'Kopi & Teh Herbal', count: '890 Produk', image: 'photo-1442512595331-e89e73853f31' },
  { name: 'Batik & Tenun', count: '2.150 Produk', image: 'photo-1605000797499-95a51c5269ae' },
  { name: 'Kriya & Anyaman', count: '760 Produk', image: 'photo-1490312278390-ab64016e0aa9' },
  { name: 'Herbal & Perawatan', count: '640 Produk', image: 'photo-1608571423902-eed4a5ad8108' },
  { name: 'Sambal & Bumbu', count: '1.080 Produk', image: 'photo-1601050690597-df0568f70950' },
  { name: 'Madu & Suplemen', count: '520 Produk', image: 'photo-1587049352851-8d4e89133924' },
  { name: 'Peralatan Jati', count: '430 Produk', image: 'photo-1610701596007-11502861dcfa' },
  { name: 'Beras & Pangan', count: '910 Produk', image: 'photo-1586201375761-83865001e31c' },
  { name: 'Oleh-oleh Khas', count: '1.250 Produk', image: 'photo-1531058020387-3be344556be6' },
]

const saleProducts = [
  { id: 'sale-1', name: 'Keripik Pisang Cokelat Lumer Khas Lampung 250 gr', price: 28500, originalPrice: 38000, discount: '25%', location: 'Bandar Lampung', rating: 4.9, reviewCount: 128, imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=760&q=85', imageAlt: 'Keripik pisang cokelat khas Lampung', stockLeft: 18, stockTotal: 50 },
  { id: 'sale-2', name: 'Madu Hutan Liar Murni Sumbawa 500 ml', price: 95000, originalPrice: 125000, discount: '24%', location: 'Sumbawa, NTB', rating: 4.9, reviewCount: 86, imageUrl: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=760&q=85', imageAlt: 'Madu hutan murni dalam stoples', stockLeft: 12, stockTotal: 35 },
  { id: 'sale-3', name: 'Sambal Cumi Asin Juara Pedas 180 gr', price: 35000, originalPrice: 50000, discount: '30%', location: 'Surabaya, Jawa Timur', rating: 4.8, reviewCount: 74, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=760&q=85', imageAlt: 'Sambal rumahan siap santap', stockLeft: 24, stockTotal: 60 },
  { id: 'sale-4', name: 'Paket Serat Sendok Kayu Jati Asli Food Grade', price: 48000, originalPrice: 80000, discount: '40%', location: 'Jepara, Jawa Tengah', rating: 4.9, reviewCount: 92, imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=760&q=85', imageAlt: 'Peralatan dapur kayu buatan pengrajin', stockLeft: 9, stockTotal: 30 },
]

const curatedProducts = [
  { id: 'curated-1', name: 'Beras Premium 5kg', group: 'Kuliner Nusantara', price: 65000, originalPrice: 75000, badge: 'Pilihan Editor', location: 'Kediri, Jawa Timur', rating: 4.9, reviewCount: 42, imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=760&q=85', imageAlt: 'Beras premium lokal' },
  { id: 'curated-2', name: 'Kain Tenun Pewarna Alam Indigo Sumba Asli', group: 'Wastra & Kriya', price: 185000, badge: 'Tenun Tangan', location: 'Sumba Timur', rating: 5.0, reviewCount: 14, imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=760&q=85', imageAlt: 'Kain tenun tradisional berwarna indigo' },
  { id: 'curated-3', name: 'Keripik Tempe Renyah Oven Daun Jeruk', group: 'Kuliner Nusantara', price: 22000, badge: 'Organik', location: 'Malang, Jawa Timur', rating: 4.8, reviewCount: 36, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=760&q=85', imageAlt: 'Camilan keripik tempe rumahan' },
  { id: 'curated-4', name: 'Kotak Anyaman Daun Pandan Serbaguna', group: 'Kriya Rumah', price: 75000, badge: 'Eco Friendly', location: 'Tasikmalaya', rating: 4.9, reviewCount: 21, imageUrl: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=760&q=85', imageAlt: 'Keranjang anyaman pandan' },
  { id: 'curated-5', name: 'Virgin Coconut Oil (VCO) Extra Murni 250ml', group: 'Kriya Rumah', price: 45000, badge: 'BPOM & Halal', location: 'Yogyakarta', rating: 4.9, reviewCount: 58, imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=760&q=85', imageAlt: 'Minyak perawatan alami dalam botol' },
]

const coffeeProduct: ProductDetailData = {
  id: 'coffee-flores',
  name: 'Kopi Arabika Flores Bajawa Single Origin – Roast Beans',
  price: 68000,
  originalPrice: 85000,
  discount: '20%',
  group: 'Kuliner Nusantara',
  location: 'Bajawa, Flores, NTT',
  rating: 4.9,
  reviewCount: 184,
  imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1000&q=88',
  imageAlt: 'Kopi arabika Flores Bajawa dalam kemasan',
  sellerName: 'Koperasi Kopi Bajawa Lestari',
  sellerLocation: 'Ngada, Flores',
  sku: 'PP-FL-BJ-250',
  description: 'Dipetik langsung dari perkebunan lereng Gunung Inerie di ketinggian 1.400–1.600 mdpl. Biji kopi diproses dengan metode full-wash tradisional yang menghasilkan karakter rasa cokelat, apel manis, dan aftertaste cokelat hitam yang bersih.',
  gallery: [
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1000&q=88',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000&q=88',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=88',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1000&q=88',
  ],
}

const productDetails = computed<ProductDetailData[]>(() => [
  coffeeProduct,
  ...saleProducts.map((product): ProductDetailData => ({
    ...product,
    group: 'Kuliner Nusantara',
    sellerName: product.id === 'sale-4' ? 'Kriya Kayu Jepara' : product.id === 'sale-3' ? 'Sambal Bu Rini' : product.id === 'sale-2' ? 'Madu Hutan Sumbawa' : 'Keripik Lampung Jaya',
    sellerLocation: product.location,
    sku: `PP-${product.id.toUpperCase()}`,
    description: `${product.name} dibuat oleh mitra UMKM lokal di ${product.location}. Produk dikemas dengan teliti dan dikurasi agar sampai dalam kondisi terbaik.`,
    gallery: [product.imageUrl, coffeeProduct.gallery[1]!, coffeeProduct.gallery[2]!, coffeeProduct.gallery[3]!],
  })),
  ...curatedProducts.map((product): ProductDetailData => ({
    ...product,
    sellerName: product.id === 'curated-2' ? 'Batik Sekar Arum' : product.id === 'curated-4' ? 'Kriya Pandan Tasik' : product.id === 'curated-5' ? 'Herbal Alami Jogja' : product.id === 'curated-3' ? 'Dapur Tempe Malang' : 'Tani Makmur Kediri',
    sellerLocation: product.location,
    sku: `PP-${product.id.toUpperCase()}`,
    description: `${product.name} merupakan produk pilihan dari ${product.location}. Dibuat oleh pelaku UMKM lokal dengan bahan berkualitas dan proses produksi yang terjaga.`,
    gallery: [product.imageUrl, coffeeProduct.gallery[1]!, coffeeProduct.gallery[2]!, coffeeProduct.gallery[3]!],
  })),
])

const selectedProduct = computed(() => productDetails.value.find((product) => product.id === selectedProductId.value) ?? coffeeProduct)

const recommendedProducts = [
  { id: curatedProducts[4]!.id, name: curatedProducts[4]!.name, price: curatedProducts[4]!.price, imageUrl: curatedProducts[4]!.imageUrl, imageAlt: curatedProducts[4]!.imageAlt, location: curatedProducts[4]!.location },
  { id: saleProducts[1]!.id, name: saleProducts[1]!.name, price: saleProducts[1]!.price, imageUrl: saleProducts[1]!.imageUrl, imageAlt: saleProducts[1]!.imageAlt, location: saleProducts[1]!.location },
]

const heroProducts = computed(() => [
  coffeeProduct,
  curatedProducts[1]!,
  saleProducts[0]!,
  curatedProducts[3]!,
])

const searchableProducts = computed(() => [
  ...curatedProducts,
  ...saleProducts.map((product) => ({ ...product, group: 'Kuliner Nusantara', badge: 'Promo Lokal' })),
])

const wishlistProducts = computed(() => productDetails.value.filter((product) => wishlist.value.includes(product.id)))

const visibleProducts = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('id')
  const products = query || searchCategory.value ? searchableProducts.value : curatedProducts
  return products.filter((product) => {
    const searchableText = `${product.name} ${product.location} ${product.badge}`.toLocaleLowerCase('id')
    const matchesQuery = !query || searchableText.includes(query)
    const matchesFilter = activeFilter.value === 'Semua Pilihan' || product.group === activeFilter.value
    const matchesCategory = !searchCategory.value || product.group === searchCategory.value
    return matchesQuery && matchesFilter && matchesCategory
  })
})

function openCart() {
  activeHeaderPanel.value = null
  currentView.value = 'cart'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openProduct(id: string | number) {
  activeHeaderPanel.value = null
  selectedProductId.value = String(id)
  currentView.value = 'detail'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goHome() {
  activeHeaderPanel.value = null
  mobileUtilitiesOpen.value = false
  currentView.value = 'home'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toggleHeaderPanel(panel: NonNullable<typeof activeHeaderPanel.value>) {
  activeHeaderPanel.value = activeHeaderPanel.value === panel ? null : panel
}

function openTracking() {
  activeHeaderPanel.value = null
  mobileUtilitiesOpen.value = false
  currentView.value = 'tracking'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openAdmin() {
  activeHeaderPanel.value = null
  mobileUtilitiesOpen.value = false
  currentView.value = 'admin'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openSellerPortal() {
  activeHeaderPanel.value = null
  mobileUtilitiesOpen.value = false
  currentView.value = 'seller'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function applySearchCategory(event: Event) {
  const category = (event.target as HTMLSelectElement).value
  searchCategory.value = category
  activeFilter.value = category || 'Semua Pilihan'
}

function selectProductFilter(filter: string) {
  activeFilter.value = filter
  searchCategory.value = filter === 'Semua Pilihan' ? '' : filter
}

function selectCategoryCard(category: string) {
  const filter = category.includes('Batik') ? 'Wastra & Kriya'
    : category.includes('Kriya') || category.includes('Herbal') ? 'Kriya Rumah'
      : 'Kuliner Nusantara'
  searchQuery.value = ''
  selectProductFilter(filter)
  window.setTimeout(() => document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
}

function submitSearch() {
  activeHeaderPanel.value = null
  currentView.value = 'home'
  window.setTimeout(() => document.getElementById('produk')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
}

function selectNotification(notification: (typeof notificationItems.value)[number]) {
  notification.read = true
  activeHeaderPanel.value = null
  if (notification.productId) {
    openProduct(notification.productId)
    return
  }
  document.getElementById('promo')?.scrollIntoView({ behavior: 'smooth' })
}

function markNotificationsRead() {
  notificationItems.value.forEach((notification) => { notification.read = true })
}

function openAuth(mode: 'login' | 'register') {
  activeHeaderPanel.value = null
  mobileUtilitiesOpen.value = false
  authMode.value = mode
  currentView.value = 'auth'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function completeAuth(account: { name: string; email: string }) {
  isAuthenticated.value = true
  accountName.value = account.name
  accountEmail.value = account.email
  if (authMode.value === 'register') return
  currentView.value = 'home'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function signOut() {
  isAuthenticated.value = false
  accountName.value = ''
  accountEmail.value = ''
}

function addToCart(id: string | number, quantity = 1, unitPrice?: number, variant?: string) {
  const product = [...saleProducts, ...curatedProducts, coffeeProduct].find((item) => item.id === String(id))
  if (!product) return

  const existingItem = cartItems.value.find((item) => item.id === String(product.id))
  if (existingItem) {
    existingItem.quantity += quantity
    if (unitPrice !== undefined) existingItem.price = unitPrice
    if (variant) existingItem.variant = variant
    return
  }

  const sellerNames: Record<string, string> = {
    'sale-1': 'Keripik Lampung Jaya',
    'sale-2': 'Madu Hutan Sumbawa',
    'sale-3': 'Sambal Bu Rini',
    'sale-4': 'Kriya Jati Jepara',
    'curated-1': 'Tani Makmur Kediri',
    'curated-2': 'Batik Sekar Arum',
    'curated-3': 'Tempe Malang Sejahtera',
    'curated-4': 'Anyaman Tasik',
    'curated-5': 'Alami Jogja',
  }

  cartItems.value.push({
    id: String(product.id),
    name: product.name,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    price: unitPrice ?? product.price,
    quantity,
    sellerName: 'sellerName' in product ? product.sellerName : sellerNames[String(product.id)] ?? 'UMKM Pilihan',
    sellerLocation: product.location,
    variant: variant ?? ('badge' in product ? product.badge ?? 'Pilihan lokal' : 'Biji Utuh'),
    selected: true,
    note: '',
    shippingMethod: 'J&T Reguler',
  })
}

function buyNow(id: string, quantity = 1, unitPrice?: number, variant?: string) {
  addToCart(id, quantity, unitPrice, variant)
  openCart()
}

function toggleWishlist(id: string | number) {
  const key = String(id)
  wishlist.value = wishlist.value.includes(key)
    ? wishlist.value.filter((item) => item !== key)
    : [...wishlist.value, key]
}

function subscribe() {
  if (email.value.trim()) subscribed.value = true
}
</script>

<template>
  <main v-if="currentView !== 'admin' && currentView !== 'seller'" class="storefront">
    <template v-if="currentView !== 'auth'">
    <div class="announcement-bar">
      <div class="announcement-inner">
        <span class="announcement-tag">Resmi</span>
        <span>Pasar Belanja Terpercaya Produk Asli UMKM & Kriya Indonesia</span>
        <button class="mobile-utility-toggle" type="button" aria-label="Menu layanan" title="Menu layanan" aria-controls="mobile-utility-links" :aria-expanded="mobileUtilitiesOpen" @click="mobileUtilitiesOpen = !mobileUtilitiesOpen"><span aria-hidden="true">≡</span></button>
        <div id="mobile-utility-links" class="announcement-links" :class="{ open: mobileUtilitiesOpen }">
          <a href="#bantuan" @click="mobileUtilitiesOpen = false">Pusat Bantuan</a>
          <a href="#pesanan" @click.prevent="openTracking">Lacak Pesanan</a>
          <a href="#seller" @click.prevent="openSellerPortal">Portal Penjual</a>
          <a href="#admin" @click.prevent="openAdmin">Portal Pengelola</a>
          <a href="#daftar" @click="mobileUtilitiesOpen = false">◈ Gerakan Bangga Buatan ID</a>
          <div class="mobile-account-actions">
            <template v-if="isAuthenticated"><span>Hai, <b>{{ accountName }}</b></span><button type="button" class="mobile-account-login" @click="mobileUtilitiesOpen = false; signOut()">Keluar</button></template>
            <template v-else><button type="button" class="mobile-account-login" @click="openAuth('login')">Masuk</button><button type="button" class="mobile-account-register" @click="openAuth('register')">Daftar</button></template>
          </div>
        </div>
      </div>
    </div>

    <header class="site-header">
      <div class="header-main page-width">
        <a class="brand" href="#beranda" aria-label="PasarPintar beranda" @click.prevent="goHome">
          <span class="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1.2 10H5.2L4 9Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3M9 13h6M9 16h6"/></svg></span>
          <span class="brand-copy"><strong>PasarPintar</strong><small>UMKM & Kriya Indonesia</small></span>
        </a>

        <div class="search-box">
          <select aria-label="Pilih kategori" :value="searchCategory" @change="applySearchCategory">
            <option value="">Semua Kategori</option>
            <option value="Kuliner Nusantara">Makanan & Minuman</option>
            <option value="Wastra & Kriya">Fashion & Kriya</option>
            <option value="Kriya Rumah">Kriya & Kerajinan</option>
          </select>
          <span class="search-divider"></span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
          <div class="search-text-entry">
            <span v-if="!searchQuery" class="mobile-search-placeholder" aria-hidden="true">Cari</span>
            <input v-model="searchQuery" type="search" placeholder="Cari keripik pisang, kopi, atau..." aria-label="Cari produk" @keyup.enter="submitSearch" />
          </div>
          <button type="button" aria-label="Cari" title="Cari produk" @click="submitSearch">→</button>
        </div>

        <div class="header-actions">
          <button class="icon-action" type="button" aria-label="Notifikasi" :aria-expanded="activeHeaderPanel === 'notifications'" title="Buka notifikasi" @click="toggleHeaderPanel('notifications')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg><i v-if="unreadNotificationCount">{{ unreadNotificationCount }}</i></button>
          <button class="icon-action" type="button" aria-label="Wishlist" :aria-expanded="activeHeaderPanel === 'wishlist'" title="Buka wishlist" @click="toggleHeaderPanel('wishlist')"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1 7.8 7.8 7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg><i v-if="wishlist.length">{{ wishlist.length }}</i></button>
          <button class="icon-action cart-action" type="button" :aria-label="`Keranjang belanja, ${cartCount} barang`" title="Buka keranjang" @click="openCart"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.3 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg><i>{{ cartCount }}</i></button>
        </div>

        <div class="account-actions"><template v-if="isAuthenticated"><span>Hai, <b>{{ accountName }}</b></span><button type="button" @click="signOut">Keluar</button></template><template v-else><button class="account-login" type="button" @click="openAuth('login')">Masuk</button><button class="account-register" type="button" @click="openAuth('register')">Daftar</button></template></div>

        <section v-if="activeHeaderPanel" class="header-popover" :class="`header-popover-${activeHeaderPanel}`">
          <header><div><small>{{ activeHeaderPanel === 'notifications' ? 'PEMBARUAN PASARPINTAR' : 'PRODUK TERSIMPAN' }}</small><b>{{ activeHeaderPanel === 'notifications' ? 'Notifikasi' : 'Wishlist' }}</b></div><button type="button" aria-label="Tutup panel" @click="activeHeaderPanel = null">×</button></header>
          <div v-if="activeHeaderPanel === 'notifications'" class="notification-options"><div class="popover-action-row"><span>{{ unreadNotificationCount }} belum dibaca</span><button type="button" @click="markNotificationsRead">Tandai semua dibaca</button></div><button v-for="notification in notificationItems" :key="notification.id" class="notification-item" :class="{ unread: !notification.read }" type="button" @click="selectNotification(notification)"><span class="notification-dot"></span><span><b>{{ notification.title }}</b><small>{{ notification.description }}</small><i>{{ notification.time }}</i></span></button></div>
          <div v-else class="wishlist-options"><p v-if="wishlistProducts.length === 0" class="popover-empty">Belum ada produk tersimpan. Tekan ikon hati pada produk untuk menambahkannya.</p><article v-for="product in wishlistProducts" :key="product.id" class="wishlist-item"><button class="wishlist-open" type="button" @click="openProduct(product.id)"><img :src="product.imageUrl" :alt="product.imageAlt" /><span><b>{{ product.name }}</b><small>{{ product.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) }}</small></span></button><button class="wishlist-remove" type="button" :aria-label="`Hapus ${product.name} dari wishlist`" @click="toggleWishlist(product.id)">×</button></article></div>
        </section>
      </div>

    </header>
    </template>

    <template v-if="currentView === 'home'">
    <section id="beranda" class="marketplace-hero page-width">
      <!-- Top Banners Grid (Main Carousel + 2 Stacked Side Banners) -->
      <div class="hero-banners-grid">
        <!-- Left Main Banner Carousel -->
        <div class="main-carousel">
          <div
            v-for="(banner, idx) in heroBanners"
            :key="banner.title"
            class="carousel-slide"
            :class="{ active: currentSlide === idx }"
          >
            <img :src="banner.image" :alt="banner.title" loading="lazy" />
            <div class="slide-overlay"></div>
            <div class="slide-content">
              <span class="slide-tag"><span>✓</span> {{ banner.tag }}</span>
              <h2>{{ banner.title }}</h2>
              <p class="slide-subtitle">{{ banner.subtitle }}</p>
              <p class="slide-desc">{{ banner.description }}</p>
              <a class="slide-btn" :href="banner.ctaLink" @click.prevent="selectProductFilter('Semua Pilihan'); submitSearch()">
                {{ banner.ctaText }} <span>→</span>
              </a>
            </div>
          </div>

          <!-- Carousel Controls -->
          <button class="carousel-nav prev" type="button" aria-label="Slide sebelumnya" @click="prevSlide">‹</button>
          <button class="carousel-nav next" type="button" aria-label="Slide berikutnya" @click="nextSlide">›</button>
          <div class="carousel-dots">
            <button
              v-for="(_, idx) in heroBanners"
              :key="idx"
              type="button"
              :class="{ active: currentSlide === idx }"
              :aria-label="`Slide ${idx + 1}`"
              @click="setSlide(idx)"
            ></button>
          </div>

          <!-- Banner Bottom Strip (3 Badges) -->
          <div class="banner-bottom-strip">
            <div class="banner-strip-item">
              <span class="strip-icon">🌿</span>
              <span><b>Produk Unik</b><small>Asli Indonesia</small></span>
            </div>
            <span class="strip-divider"></span>
            <div class="banner-strip-item">
              <span class="strip-icon">⚡</span>
              <span><b>Inovasi Lokal</b><small>Rasa Global</small></span>
            </div>
            <span class="strip-divider"></span>
            <div class="banner-strip-item">
              <span class="strip-icon">🏅</span>
              <span><b>Kualitas Unggulan</b><small>Kreasi Nusantara</small></span>
            </div>
          </div>
        </div>

        <!-- Right Side Banners -->
        <div class="side-banners">
          <div class="side-banner side-banner-top" @click="selectProductFilter('Wastra & Kriya'); submitSearch()">
            <img src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=600&q=85" alt="PasarPintar Mall 100% Ori" />
            <div class="side-banner-overlay"></div>
            <div class="side-banner-content">
              <span class="side-badge">PasarPintar Mall</span>
              <h3>100% ORI</h3>
              <p>Produk Kriya & Batik Pilihan</p>
              <span class="side-link">Belanja Sekarang →</span>
            </div>
          </div>

          <div class="side-banner side-banner-bottom" @click="selectProductFilter('Kuliner Nusantara'); submitSearch()">
            <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=85" alt="Gerakan Bangga Buatan ID" />
            <div class="side-banner-overlay coral"></div>
            <div class="side-banner-content">
              <span class="side-badge coral">Gerakan GBBI</span>
              <h3>DISKON S.D. 80%</h3>
              <p>Subsidi Ongkir 3T + Voucher</p>
              <span class="side-link">Klaim Promo →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Feature Shortcuts Bar -->
      <div class="quick-shortcuts-bar">
        <button
          v-for="item in quickLinks"
          :key="item.name"
          type="button"
          class="shortcut-item"
          @click="handleQuickShortcut(item)"
        >
          <div class="shortcut-icon-wrap">
            <span class="shortcut-icon">{{ item.icon }}</span>
            <span v-if="item.badge" class="shortcut-badge">{{ item.badge }}</span>
          </div>
          <span class="shortcut-label">{{ item.name }}</span>
        </button>
      </div>
    </section>

    <!-- Category Section (KATEGORI Panel Card) -->
    <section id="kategori" class="section page-width category-section">
      <div class="category-panel-card">
        <div class="category-panel-header">
          <h2>KATEGORI</h2>
          <a class="text-link" href="#produk" @click.prevent="selectProductFilter('Semua Pilihan'); submitSearch()">
            Lihat Semua Kategori <span>→</span>
          </a>
        </div>
        <div class="category-circle-grid">
          <button
            v-for="category in categories"
            :key="category.name"
            type="button"
            class="category-circle-item"
            @click="selectCategoryCard(category.name)"
          >
            <div class="category-circle-thumb">
              <img :src="`https://images.unsplash.com/${category.image}?w=200&q=80`" :alt="category.name" loading="lazy" />
            </div>
            <span class="category-circle-label">{{ category.name }}</span>
            <small class="category-circle-count">{{ category.count }}</small>
          </button>
        </div>
      </div>
    </section>

    <section id="promo" class="section sale-section">
      <div class="page-width">
        <div class="section-heading sale-heading"><div><span class="section-kicker"><span class="flame">♨</span> Khas Promo Lokal</span><h2>Harga Spesial Akhir Pekan</h2></div><div class="countdown"><span>Berakhir Dalam</span><b>04</b><b>28</b><b class="seconds">39</b></div></div>
        <div class="sale-grid">
          <ProductCard v-for="product in saleProducts" :key="product.id" v-bind="product" variant="flash-sale" :is-wishlisted="wishlist.includes(product.id)" @click="openProduct" @add-to-cart="addToCart" @toggle-wishlist="toggleWishlist" />
        </div>
      </div>
    </section>

    <section id="produk" class="section page-width curated-section">
      <div class="section-heading curated-heading"><div><span class="section-kicker">Pilihan Kurator PasarPintar</span><h2>Produk lokal yang punya cerita</h2></div><div class="filter-pills"><button v-for="filter in productFilters" :key="filter" :class="{ active: activeFilter === filter }" type="button" @click="selectProductFilter(filter)">{{ filter }}</button></div></div>
      <div class="curated-grid">
        <ProductCard v-for="product in visibleProducts" :key="product.id" v-bind="product" :is-wishlisted="wishlist.includes(product.id)" @click="openProduct" @add-to-cart="addToCart" @toggle-wishlist="toggleWishlist" />
        <p v-if="visibleProducts.length === 0" class="empty-search">Belum ada produk yang cocok. Coba kata kunci lain.</p>
      </div>
    </section>

    <section id="cerita" class="section page-width story-section">
        <div class="section-heading story-heading"><div><span class="section-kicker">Mereka di Balik Karya Lokal</span><h2>Dari tangan terampil, untuk Indonesia</h2></div><a class="text-link" href="#cerita-list">Semua kisah UMKM <span>→</span></a></div>
        <div id="cerita-list" class="story-grid">
          <article class="story-card story-featured"><img src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&q=88" alt="Pengrajin batik sedang menyelesaikan kain dengan teliti" loading="lazy" /><div class="story-overlay"></div><span class="story-label">Sentra Pengrajin</span><div class="story-copy"><small>Batik Tulis Sekar Arum</small><h3>Melestarikan Canting Tradisional Bersama 42 Ibu Rumah Tangga Desa</h3><p>“Lewat Pasar Pintar, kami bisa menjangkau pelanggan yang ingin belajar dan mendukung kriya lokal.”</p><div><span>Berbagi kisah &nbsp; Maret 2024</span><a href="#produk" @click.prevent="openProduct('curated-2')">Kunjungi Toko <b>↗</b></a></div></div></article>
          <article class="story-card"><img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=88" alt="Petani lokal merawat kebun di lereng pegunungan" loading="lazy" /><div class="story-overlay"></div><span class="story-label">Koperasi Kopi Gayo</span><div class="story-copy"><small>Lereng Merapi, Sleman</small><h3>Biji Kopi Lahir Dingin dengan Cita Rasa Karamel Alami</h3><p>Pemberdayaan petani pasca erupsi yang mengubah tanah vulkanik menjadi kopi terbaik.</p><div><span class="impact-tag">✿ Bebas Pestisida Kimia</span><a href="#produk" @click.prevent="openProduct('coffee-flores')">Kunjungi Toko <b>↗</b></a></div></div></article>
      </div>
    </section>

    <section id="daftar" class="newsletter page-width">
      <span class="newsletter-label">▧ &nbsp; Gerakan Sejuta Pembeli Berdaya</span>
      <h2>Dapatkan Katalog Mingguan & Cerita Inspiratif UMKM</h2>
      <p>Bergabung bersama 40.000+ keluarga Indonesia yang memilih belanja dari produsen lokal. Kami kirimkan promo, voucher khusus, dan profil pengrajin setiap pekan.</p>
      <form class="newsletter-form" @submit.prevent="subscribe">
        <input v-model="email" type="email" placeholder="Ketik alamat email Anda..." aria-label="Alamat email" required />
        <button type="submit">{{ subscribed ? 'Terdaftar ✓' : 'Langganan →' }}</button>
      </form>
    </section>
    </template>

    <CartCheckout
      v-else-if="currentView === 'cart'"
      v-model:items="cartItems"
      :recommendations="recommendedProducts"
      @back-to-home="goHome"
      @add-product="addToCart"
    />

    <OrderTracking
      v-else-if="currentView === 'tracking'"
      @back="goHome"
    />

    <AuthPage
      v-else-if="currentView === 'auth'"
      :mode="authMode"
      @back="goHome"
      @switch-mode="authMode = $event"
      @authenticated="completeAuth"
    />

    <ProductDetail
      v-else
      :product="selectedProduct"
      :is-wishlisted="wishlist.includes(selectedProduct.id)"
      @back="goHome"
      @add-to-cart="addToCart"
      @buy-now="buyNow"
      @toggle-wishlist="toggleWishlist"
      @open-product="openProduct"
    />

    <template v-if="currentView !== 'auth'">
    <footer id="bantuan" class="site-footer">
      <div class="page-width footer-main">
        <div class="footer-about"><a class="brand" href="#beranda"><span class="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1.2 10H5.2L4 9Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3M9 13h6M9 16h6"/></svg></span><span class="brand-copy"><strong>PasarPintar</strong></span></a><p>Pasar digital karya yang menghubungkan UMKM lokal unggulan dari Sabang sampai Merauke dengan jutaan pembeli di seluruh Nusantara.</p><span class="footer-verified">✓ &nbsp; Terverifikasi Kementerian Koperasi & UMKM RI</span></div>
        <div class="footer-column"><b>TENTANG PASARPINTAR</b><a href="#cerita">Tentang Kami</a><a href="#cerita">Kisah Mitra Pengrajin</a><a href="#kategori">Dampak Sosial UMKM</a><a href="#bantuan">Karir & Rekrutmen</a></div>
        <div class="footer-column"><b>BANTUAN & PANDUAN</b><a href="#bantuan">Panduan Belanja</a><a href="#bantuan">Metode Pembayaran QRIS / VA</a><a href="#pesanan" @click.prevent="openTracking">Lacak Pengiriman Ekspedisi</a><a href="#bantuan">Garansi Retur 100%</a></div>
        <div class="footer-column"><b>DUKUNG PENJUAL</b><a href="#daftar">Daftar Toko UMKM Gratis</a><a href="#daftar">Akademi Digitalisasi PasarPintar</a><a href="#cerita">Sertifikasi & Gudang Daerah</a><a href="#bantuan">Hubungi Customer Care 24/7</a></div>
      </div>
      <div class="page-width footer-bottom"><span>© 2024 PasarPintar Indonesia. Seluruh hak cipta dilindungi undang-undang.</span><div><a href="#bantuan">Syarat & Ketentuan</a><a href="#bantuan">Kebijakan Privasi</a><a href="#bantuan">Keamanan Transaksi</a></div></div>
    </footer>
    </template>
  </main>
  <SellerOrderManagement v-else-if="currentView === 'seller'" @back-to-store="goHome" />
  <PlatformSettings v-else @back-to-store="goHome" />
</template>

