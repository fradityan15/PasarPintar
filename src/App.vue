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
const selectedProductId = ref('tenun-sumba')
const cartItems = ref<CartLine[]>([
  {
    id: 'tenun-sumba',
    name: 'Kain Tenun Ikat Sumba Pewarna Alam Indigo Motif Pahikung',
    imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=300&q=82',
    imageAlt: 'Kain tenun ikat Sumba pewarna alami',
    price: 385000,
    quantity: 1,
    sellerName: 'Koperasi Penenun Sumba',
    sellerLocation: 'Sumba Timur, NTT',
    variant: 'Ukuran 200 x 115 cm · Katun Murni',
    selected: true,
    note: '',
    shippingMethod: 'J&T Reguler',
  },
  {
    id: 'demo-batik',
    name: 'Kemeja Batik Cap Khas Halus Motif Parang Rusak',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300&q=82',
    imageAlt: 'Kain batik motif tradisional',
    price: 185000,
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
const productFilters = ['Semua Pilihan', 'Batik Tulis & Cap', 'Tenun Ikat Nusantara', 'Wastra & Aksesoris']
const activeHeaderPanel = ref<null | 'notifications' | 'wishlist'>(null)
const mobileUtilitiesOpen = ref(false)
const notificationItems = ref([
  { id: 'promo', title: 'Promo Wastra Nusantara', description: 'Diskon kain tenun dan batik sampai Rp50.000.', time: 'Baru saja', read: false, productId: 'sale-1' },
  { id: 'tenun', title: 'Koleksi Tenun Ikat Sumba', description: 'Tenun pewarna alami Sumba Timur kini tersedia.', time: '1 jam lalu', read: false, productId: 'tenun-sumba' },
  { id: 'curation', title: 'Koleksi Batik Kurator', description: 'Lihat produk kriya batik pilihan minggu ini.', time: 'Kemarin', read: false, productId: 'curated-2' },
])
const cartCount = computed(() => cartItems.value.reduce((count, item) => count + item.quantity, 0))
const unreadNotificationCount = computed(() => notificationItems.value.filter((notification) => !notification.read).length)

const currentSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval> | undefined

const heroBanners = [
  {
    title: 'PasarPintar Wastra & Batik',
    subtitle: 'Rumah Batik & Tenun No. 1 di Indonesia',
    tag: 'WARISAN BUDAYA NUSANTARA',
    description: 'Dukung perajin batik, penenun ikat, dan maestro kriya dari 38 provinsi di Nusantara.',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&q=88',
    ctaText: 'Jelajahi Koleksi Batik',
    ctaLink: '#produk',
  },
  {
    title: 'Koleksi Tenun Ikat Pewarna Alam',
    subtitle: 'Sentra Tenun Tangan Sumba & NTT',
    tag: 'TENUN IKAT ASLI',
    description: 'Mahakarya perajin lokal dengan benang katun dan pewarna alami tradisional.',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&q=88',
    ctaText: 'Lihat Kain Tenun',
    ctaLink: '#produk',
  },
  {
    title: 'Batik Tulis Sogan Pekalongan',
    subtitle: 'Canting Tangan Motif Klasik',
    tag: 'BATIK TULIS ORIGINAL',
    description: 'Keindahan motif parang, kawung, dan megamendung bermakna filosofi mendalam.',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=88',
    ctaText: 'Pesan Batik Tulis',
    ctaLink: '#produk',
  },
]

const currentHeroBanner = computed(() => heroBanners[currentSlide.value] ?? heroBanners[0]!)

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
  { name: 'Mall Wastra', icon: '🏪', filter: 'Semua Pilihan', badge: '100% Ori' },
  { name: 'Bebas Ongkir', icon: '🚚', filter: 'Semua Pilihan', badge: 'Afirmasi 3T' },
  { name: 'Flash Sale', icon: '♨️', action: 'promo', badge: 'Diskon' },
  { name: 'Batik Tulis', icon: '🥻', filter: 'Batik Tulis & Cap' },
  { name: 'Tenun Ikat', icon: '🧵', filter: 'Tenun Ikat Nusantara' },
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
  { name: 'Batik Tulis Halus', count: '2.140 Produk', image: 'photo-1605000797499-95a51c5269ae' },
  { name: 'Tenun Ikat Sumba', count: '1.280 Produk', image: 'photo-1544441893-675973e31985' },
  { name: 'Batik Cap Modern', count: '3.150 Produk', image: 'photo-1584917865442-de89df76afd3' },
  { name: 'Songket Palembang', count: '760 Produk', image: 'photo-1609357605129-26f69add5d6e' },
  { name: 'Sarung Tenun Jepara', count: '640 Produk', image: 'photo-1576995853123-5a10305d93c0' },
  { name: 'Kebaya & Wastra', count: '1.880 Produk', image: 'photo-1515886657613-9f3515b0c78f' },
  { name: 'Selendang & Syal', count: '920 Produk', image: 'photo-1520903920243-00d872a2d1c9' },
  { name: 'Aksesoris Batik', count: '1.430 Produk', image: 'photo-1535632066927-ab7c9ab60908' },
  { name: 'Kain Ulos Sumatra', count: '510 Produk', image: 'photo-1528459801416-a9e53bbf4e17' },
  { name: 'Tas & Kriya Etnik', count: '1.150 Produk', image: 'photo-1490312278390-ab64016e0aa9' },
]

const saleProducts = [
  { id: 'sale-1', name: 'Kain Batik Cap Pekalongan Motif Megamendung 2x1.15m', price: 125000, originalPrice: 175000, discount: '28%', location: 'Pekalongan, Jawa Tengah', rating: 4.9, reviewCount: 128, imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=760&q=85', imageAlt: 'Kain batik cap Megamendung khas Pekalongan', stockLeft: 18, stockTotal: 50 },
  { id: 'sale-2', name: 'Selendang Tenun Ikat Tarutung Pewarna Alam Katun', price: 145000, originalPrice: 195000, discount: '25%', location: 'Tapanuli Utara, Sumut', rating: 4.9, reviewCount: 86, imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=760&q=85', imageAlt: 'Selendang tenun ikat Tarutung', stockLeft: 12, stockTotal: 35 },
  { id: 'sale-3', name: 'Kain Batik Tulis Solo Motif Kawung Klasik Halus', price: 285000, originalPrice: 380000, discount: '25%', location: 'Surakarta, Jawa Tengah', rating: 4.8, reviewCount: 74, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=760&q=85', imageAlt: 'Kain batik tulis motif Kawung', stockLeft: 24, stockTotal: 60 },
  { id: 'sale-4', name: 'Tas Pouch Etnik Kombinasi Tenun Ikat & Kayu Jati', price: 78000, originalPrice: 120000, discount: '35%', location: 'Jepara, Jawa Tengah', rating: 4.9, reviewCount: 92, imageUrl: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=760&q=85', imageAlt: 'Pouch tenun etnik buatan pengrajin', stockLeft: 9, stockTotal: 30 },
]

const curatedProducts = [
  { id: 'curated-1', name: 'Kain Batik Silk Primissima Motif Parang Rusak', group: 'Batik Tulis & Cap', price: 215000, originalPrice: 260000, badge: 'Pilihan Editor', location: 'Solo, Jawa Tengah', rating: 4.9, reviewCount: 42, imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=760&q=85', imageAlt: 'Kain batik silk motif Parang' },
  { id: 'curated-2', name: 'Kain Tenun Pewarna Alam Indigo Sumba Asli', group: 'Tenun Ikat Nusantara', price: 385000, badge: 'Tenun Tangan', location: 'Sumba Timur', rating: 5.0, reviewCount: 14, imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=760&q=85', imageAlt: 'Kain tenun tradisional berwarna indigo' },
  { id: 'curated-3', name: 'Syal Tenun Troso Jepara Benang Katun Halus', group: 'Tenun Ikat Nusantara', price: 95000, badge: 'Katun Halus', location: 'Jepara, Jawa Tengah', rating: 4.8, reviewCount: 36, imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=760&q=85', imageAlt: 'Syal tenun troso Jepara' },
  { id: 'curated-4', name: 'Kotak Anyaman Pandan & Dompet Batik Etnik', group: 'Wastra & Aksesoris', price: 75000, badge: 'Eco Friendly', location: 'Tasikmalaya', rating: 4.9, reviewCount: 21, imageUrl: 'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=760&q=85', imageAlt: 'Anyaman dompet batik etnik' },
  { id: 'curated-5', name: 'Kain Songket Palembang Benang Kristal Emas', group: 'Wastra & Aksesoris', price: 450000, badge: 'Songket Asli', location: 'Palembang, Sumsel', rating: 4.9, reviewCount: 58, imageUrl: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=760&q=85', imageAlt: 'Kain songket Palembang benang emas' },
]

const catalogSourceProducts = [
  ...curatedProducts,
  ...saleProducts.map((product) => ({ ...product, group: 'Batik Tulis & Cap', badge: 'Promo Wastra' })),
]
const additionalCatalogProducts = Array.from({ length: 41 }, (_, index) => {
  const source = catalogSourceProducts[index % catalogSourceProducts.length]!
  return {
    ...source,
    id: `catalog-${index + 1}`,
    detailId: source.id,
    name: `${source.name} · Seri UMKM ${String(index + 1).padStart(2, '0')}`,
  }
})
const catalogProducts = [...catalogSourceProducts, ...additionalCatalogProducts]

const tenunSumbaProduct: ProductDetailData = {
  id: 'tenun-sumba',
  name: 'Kain Tenun Ikat Sumba Pewarna Alam Indigo Motif Pahikung',
  price: 385000,
  originalPrice: 450000,
  discount: '15%',
  group: 'Tenun Ikat Nusantara',
  location: 'Sumba Timur, NTT',
  rating: 4.9,
  reviewCount: 184,
  imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1000&q=88',
  imageAlt: 'Kain tenun ikat Sumba pewarna alami',
  sellerName: 'Koperasi Penenun Ikat Sumba Lestari',
  sellerLocation: 'Sumba Timur, NTT',
  sku: 'PP-TN-SMB-200',
  description: 'Ditenun dengan tangan secara tradisional oleh perajin perempuan Sumba Timur. Menggunakan benang katun murni dengan pewarna alami dari akar mengkudu dan daun nila (indigo) yang memancarkan keindahan ragam hias fauna dan simbol kehidupan.',
  gallery: [
    'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1000&q=88',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=1000&q=88',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=88',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=88',
  ],
}

const productDetails = computed<ProductDetailData[]>(() => [
  tenunSumbaProduct,
  ...saleProducts.map((product): ProductDetailData => ({
    ...product,
    group: 'Batik Tulis & Cap',
    sellerName: product.id === 'sale-4' ? 'Kriya Kayu Jepara' : product.id === 'sale-3' ? 'Batik Solo Hadiningrat' : product.id === 'sale-2' ? 'Tenun Tarutung Sumut' : 'Batik Pekalongan Jaya',
    sellerLocation: product.location,
    sku: `PP-${product.id.toUpperCase()}`,
    description: `${product.name} dibuat oleh mitra UMKM perajin wastra lokal di ${product.location}. Dibuat secara teliti dan terkurasi dengan bahan berkualitas tinggi.`,
    gallery: [product.imageUrl, tenunSumbaProduct.gallery[1]!, tenunSumbaProduct.gallery[2]!, tenunSumbaProduct.gallery[3]!],
  })),
  ...curatedProducts.map((product): ProductDetailData => ({
    ...product,
    sellerName: product.id === 'curated-2' ? 'Batik Sekar Arum' : product.id === 'curated-4' ? 'Kriya Pandan Tasik' : product.id === 'curated-5' ? 'Songket Palembang Indah' : product.id === 'curated-3' ? 'Tenun Troso Jepara' : 'Batik Solo Keraton',
    sellerLocation: product.location,
    sku: `PP-${product.id.toUpperCase()}`,
    description: `${product.name} merupakan karya tenun dan batik pilihan dari ${product.location}. Dibuat oleh perajin lokal Nusantara dengan pewarna alami dan benang berkualitas tinggi.`,
    gallery: [product.imageUrl, tenunSumbaProduct.gallery[1]!, tenunSumbaProduct.gallery[2]!, tenunSumbaProduct.gallery[3]!],
  })),
])

const selectedProduct = computed(() => productDetails.value.find((product) => product.id === selectedProductId.value) ?? tenunSumbaProduct)

const recommendedProducts = [
  { id: curatedProducts[4]!.id, name: curatedProducts[4]!.name, price: curatedProducts[4]!.price, imageUrl: curatedProducts[4]!.imageUrl, imageAlt: curatedProducts[4]!.imageAlt, location: curatedProducts[4]!.location },
  { id: saleProducts[1]!.id, name: saleProducts[1]!.name, price: saleProducts[1]!.price, imageUrl: saleProducts[1]!.imageUrl, imageAlt: saleProducts[1]!.imageAlt, location: saleProducts[1]!.location },
]

const heroProducts = computed(() => [
  tenunSumbaProduct,
  curatedProducts[1]!,
  saleProducts[0]!,
  curatedProducts[3]!,
])

const searchableProducts = computed(() => [
  ...catalogProducts,
])

const wishlistProducts = computed(() => productDetails.value.filter((product) => wishlist.value.includes(product.id)))

const visibleProducts = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase('id')
  const products = searchableProducts.value
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
  const product = catalogProducts.find((item) => item.id === String(id))
  selectedProductId.value = String(product && 'detailId' in product ? product.detailId : id)
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
  const product = [...saleProducts, ...curatedProducts, tenunSumbaProduct].find((item) => item.id === String(id))
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
    <!-- Top Announcement Bar (Deep Dark Navy) -->
    <div class="announcement-bar">
      <div class="announcement-inner page-width">
        <div class="announcement-left">
          <span class="announcement-tag">Resmi</span>
          <span class="announcement-title">UMKM lokal, karya Nusantara</span>
        </div>
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
        <div class="top-bar-cta">
          <a href="#produk" class="top-cta-btn">Jelajahi produk <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </div>

    <!-- Header Navigation Bar (Clean White) -->
    <header class="site-header">
      <div class="header-main page-width">
        <!-- Brand Logo -->
        <a class="brand" href="#beranda" aria-label="PasarPintar beranda" @click.prevent="goHome">
          <span class="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4z"/><path d="m3 10 2-6h14l2 6M3 10a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 3 0M9 20v-6h6v6"/></svg></span>
          <span class="brand-copy"><strong>PasarPintar</strong><small>UMKM &amp; Kriya Indonesia</small></span>
        </a>

        <!-- Center Navigation Links -->
        <nav class="main-nav">
          <a href="#beranda" :class="{ active: currentView === 'home' }" @click.prevent="goHome">Beranda</a>
          <div class="nav-dropdown">
            <a href="#produk" @click.prevent="selectProductFilter('Semua Pilihan'); submitSearch()">Belanja <span class="arrow">˅</span></a>
          </div>
          <div class="nav-dropdown">
            <a href="#kategori" @click.prevent="submitSearch()">Kategori <span class="arrow">˅</span></a>
          </div>
          <a href="#cerita">Cerita</a>
          <a href="#promo">Promo</a>
          <a href="#bantuan">Bantuan</a>
        </nav>

        <!-- Right Header Actions -->
        <div class="header-actions">
          <div class="search-box-wrap">
            <input v-model="searchQuery" type="search" placeholder="Cari batik, tenun, atau produk lokal..." aria-label="Cari produk" @keyup.enter="submitSearch" />
            <button class="search-icon-btn" type="button" aria-label="Search" title="Search" @click="submitSearch">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
            </button>
          </div>

          <button class="icon-action" type="button" aria-label="Notifikasi" :aria-expanded="activeHeaderPanel === 'notifications'" title="Notifikasi" @click="toggleHeaderPanel('notifications')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
            <i v-if="unreadNotificationCount">{{ unreadNotificationCount }}</i>
          </button>

          <button class="icon-action" type="button" aria-label="Akun" title="Akun" @click="isAuthenticated ? signOut() : openAuth('login')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/></svg>
          </button>

          <button class="icon-action cart-action-shopluxe" type="button" :aria-label="`Keranjang, ${cartCount} produk`" title="Lihat keranjang" @click="openCart">
            <div class="cart-icon-wrap">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.3 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
              <i v-if="cartCount">{{ cartCount }}</i>
            </div>
            <span class="cart-total-price">Rp 68.000</span>
          </button>
        </div>

        <!-- Notification / Wishlist Popovers -->
        <section v-if="activeHeaderPanel" class="header-popover" :class="`header-popover-${activeHeaderPanel}`">
          <header><div><small>{{ activeHeaderPanel === 'notifications' ? 'PEMBARUAN PASARPINTAR' : 'PRODUK TERSIMPAN' }}</small><b>{{ activeHeaderPanel === 'notifications' ? 'Notifikasi' : 'Wishlist' }}</b></div><button type="button" aria-label="Tutup panel" @click="activeHeaderPanel = null">×</button></header>
          <div v-if="activeHeaderPanel === 'notifications'" class="notification-options"><div class="popover-action-row"><span>{{ unreadNotificationCount }} belum dibaca</span><button type="button" @click="markNotificationsRead">Tandai semua dibaca</button></div><button v-for="notification in notificationItems" :key="notification.id" class="notification-item" :class="{ unread: !notification.read }" type="button" @click="selectNotification(notification)"><span class="notification-dot"></span><span><b>{{ notification.title }}</b><small>{{ notification.description }}</small><i>{{ notification.time }}</i></span></button></div>
          <div v-else class="wishlist-options"><p v-if="wishlistProducts.length === 0" class="popover-empty">Belum ada produk tersimpan. Tekan ikon hati pada produk untuk menambahkannya.</p><article v-for="product in wishlistProducts" :key="product.id" class="wishlist-item"><button class="wishlist-open" type="button" @click="openProduct(product.id)"><img :src="product.imageUrl" :alt="product.imageAlt" /><span><b>{{ product.name }}</b><small>{{ product.price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) }}</small></span></button><button class="wishlist-remove" type="button" :aria-label="`Hapus ${product.name} dari wishlist`" @click="toggleWishlist(product.id)">×</button></article></div>
        </section>
      </div>
    </header>
    </template>

    <template v-if="currentView === 'home'">
    <!-- Shopluxe Split Hero Banner (Soft Cream Background) -->
    <section id="beranda" class="shopluxe-hero">
      <div class="page-width hero-container">
        <!-- Left Column Content -->
        <div class="hero-left-content">
          <span class="hero-welcome-tag">WELCOME TO PASARPINTAR</span>
          <h1 class="hero-main-title">EVERYTHING.<br />FOR EVERYONE.</h1>
          <p class="hero-script-subtitle">Best Quality, Best Prices!</p>
          <p class="hero-description">{{ currentHeroBanner.description }}</p>

          <div class="hero-cta-buttons">
            <a class="btn-shop-now" :href="currentHeroBanner.ctaLink" @click.prevent="selectProductFilter('Semua Pilihan'); submitSearch()">
              SHOP NOW <span>→</span>
            </a>
            <a class="btn-explore-collections" href="#produk" @click.prevent="selectProductFilter('Wastra & Kriya'); submitSearch()">
              EXPLORE COLLECTIONS
            </a>
          </div>

          <!-- Bottom Benefit Badges -->
          <div class="hero-benefits-row">
            <div class="benefit-item">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l3 3v5c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
              </div>
              <div>
                <strong>FREE SHIPPING</strong>
                <small>On orders over $50</small>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              </div>
              <div>
                <strong>EASY RETURNS</strong>
                <small>30-day return policy</small>
              </div>
            </div>
            <div class="benefit-item">
              <div class="benefit-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div>
                <strong>SECURE PAYMENT</strong>
                <small>100% secure checkout</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column Image & Discount Badge -->
        <div class="hero-right-visual">
          <div class="hero-image-wrapper">
            <img :src="currentHeroBanner.image" :alt="currentHeroBanner.title" />
            <!-- Up to 50% Off Dark Circle Badge -->
            <div class="floating-discount-badge">
              <span class="discount-upto">UP TO</span>
              <span class="discount-percent">50%</span>
              <span class="discount-off">OFF</span>
            </div>
          </div>

          <!-- Slider Navigation Arrows -->
          <button class="hero-nav-arrow prev-arrow" type="button" aria-label="Slide sebelumnya" @click="prevSlide">‹</button>
          <button class="hero-nav-arrow next-arrow" type="button" aria-label="Slide berikutnya" @click="nextSlide">›</button>

          <!-- Slide Dots -->
          <div class="hero-dots-indicator">
            <button
              v-for="(_, idx) in heroBanners"
              :key="idx"
              type="button"
              :class="{ active: currentSlide === idx }"
              :aria-label="`Slide ${idx + 1}`"
              @click="setSlide(idx)"
            ></button>
          </div>
        </div>
      </div>
    </section>

    <!-- Browse By Category Section (Shopluxe Rounded Cards Grid) -->
    <section id="kategori" class="section category-section-shopluxe page-width">
      <div class="section-title-center">
        <h2>BROWSE BY CATEGORY</h2>
      </div>

      <div class="shopluxe-category-grid">
        <button
          v-for="category in categories"
          :key="category.name"
          type="button"
          class="shopluxe-cat-card"
          @click="selectCategoryCard(category.name)"
        >
          <div class="cat-card-thumb">
            <img :src="`https://images.unsplash.com/${category.image}?w=300&q=80`" :alt="category.name" loading="lazy" />
          </div>
          <span class="cat-card-name">{{ category.name }}</span>
        </button>
      </div>
    </section>

    <!-- Trending Products Section -->
    <section id="produk" class="section trending-section-shopluxe page-width">
      <div class="trending-header">
        <h2>TRENDING PRODUCTS</h2>
        <a class="view-all-link" href="#produk" @click.prevent="selectProductFilter('Semua Pilihan'); submitSearch()">
          VIEW ALL PRODUCTS <span>→</span>
        </a>
      </div>

      <div class="filter-pills-row">
        <button v-for="filter in productFilters" :key="filter" :class="{ active: activeFilter === filter }" type="button" @click="selectProductFilter(filter)">
          {{ filter }}
        </button>
      </div>

      <div class="shopluxe-product-grid">
        <ProductCard v-for="product in visibleProducts" :key="product.id" v-bind="product" :is-wishlisted="wishlist.includes(product.id)" @click="openProduct" @add-to-cart="addToCart" @toggle-wishlist="toggleWishlist" />
      </div>
      <p v-if="visibleProducts.length === 0" class="empty-search">Belum ada produk yang cocok. Coba kata kunci lain.</p>
    </section>

    <!-- Middle 3-Column Promo Banner (Dark, Tan, Gray) -->
    <section id="promo" class="promo-banners-shopluxe page-width">
      <div class="promo-grid-3col">
        <!-- Col 1: Dark Navy -->
        <div class="promo-box box-dark">
          <div class="promo-box-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l3 3v5c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>
          </div>
          <div class="promo-box-text">
            <h3>FREE SHIPPING</h3>
            <p>On orders over $50</p>
            <a href="#produk" @click.prevent="selectProductFilter('Semua Pilihan'); submitSearch()">Shop Now →</a>
          </div>
        </div>

        <!-- Col 2: Golden Tan / Brown -->
        <div class="promo-box box-tan">
          <div class="promo-box-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
          </div>
          <div class="promo-box-text">
            <h3>SPECIAL OFFER</h3>
            <p>Save up to 50% off</p>
            <a href="#promo" @click.prevent="selectProductFilter('Semua Pilihan'); submitSearch()">Grab the Deal →</a>
          </div>
        </div>

        <!-- Col 3: Light Gray -->
        <div class="promo-box box-light">
          <div class="promo-box-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
          </div>
          <div class="promo-box-text">
            <h3>MEMBER BENEFITS</h3>
            <p>Join now & get exclusive deals</p>
            <a href="#daftar">Join Free →</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Badges & Newsletter Subscription Row -->
    <section class="trust-newsletter-shopluxe page-width">
      <div class="trust-newsletter-row">
        <div class="trust-column">
          <div class="trust-badge-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <div class="trust-info">
            <strong>TRUSTED BY THOUSANDS</strong>
            <small>Quality products, happy customers.</small>
          </div>
          <div class="trust-avatars-rating">
            <div class="avatar-stack">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80" alt="User 1" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" alt="User 2" />
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" alt="User 3" />
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" alt="User 4" />
            </div>
            <div class="rating-box">
              <strong>4.8/5</strong>
              <div class="stars">★★★★★</div>
              <small>Based on 2,500+ Reviews</small>
            </div>
          </div>
        </div>

        <div class="newsletter-column">
          <div class="newsletter-text">
            <strong>SUBSCRIBE TO OUR NEWSLETTER</strong>
            <p>Get the latest updates on new products and sales.</p>
          </div>
          <form class="newsletter-form-shopluxe" @submit.prevent="subscribe">
            <input v-model="email" type="email" placeholder="Enter your email" aria-label="Enter your email" required />
            <button type="submit">{{ subscribed ? 'Subscribed ✓' : 'SUBSCRIBE' }}</button>
          </form>
        </div>
      </div>
    </section>

    <!-- Story / Mitra Section (Original Content Preserved) -->
    <section id="cerita" class="section page-width story-section">
      <div class="section-heading story-heading"><div><span class="section-kicker">Mereka di Balik Karya Lokal</span><h2>Dari tangan terampil, untuk Indonesia</h2></div><a class="text-link" href="#cerita-list">Semua kisah UMKM <span>→</span></a></div>
      <div id="cerita-list" class="story-grid">
        <article class="story-card story-featured"><img src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&q=88" alt="Pengrajin batik sedang menyelesaikan kain dengan teliti" loading="lazy" /><div class="story-overlay"></div><span class="story-label">Sentra Pengrajin</span><div class="story-copy"><small>Batik Tulis Sekar Arum</small><h3>Melestarikan Canting Tradisional Bersama 42 Ibu Rumah Tangga Desa</h3><p>“Lewat Pasar Pintar, kami bisa menjangkau pelanggan yang ingin belajar dan mendukung kriya lokal.”</p><div><span>Berbagi kisah &nbsp; Maret 2024</span><a href="#produk" @click.prevent="openProduct('curated-2')">Kunjungi Toko <b>↗</b></a></div></div></article>
        <article class="story-card"><img src="https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&q=88" alt="Perajin tenun ikat Sumba merawat benang dan pewarna alami" loading="lazy" /><div class="story-overlay"></div><span class="story-label">Sentra Penenun Sumba</span><div class="story-copy"><small>Sumba Timur, NTT</small><h3>Kain Tenun Lahir dari Benang Katun & Pewarna Alami Leaf Indigo</h3><p>Pemberdayaan perajin perempuan tenun ikat yang melestarikan warisan nenek moyang.</p><div><span class="impact-tag">✿ 100% Pewarna Tanaman Alami</span><a href="#produk" @click.prevent="openProduct('tenun-sumba')">Kunjungi Toko <b>↗</b></a></div></div></article>
      </div>
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
    <!-- Shopluxe Footer (Deep Dark Navy #151B28) -->
    <footer id="bantuan" class="site-footer-shopluxe">
      <div class="page-width footer-columns-grid">
        <!-- Col 1: Brand & Info -->
        <div class="footer-brand-col">
          <a class="footer-brand" href="#beranda" @click.prevent="goHome">
            <span class="footer-logo-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4z"/><path d="m3 10 2-6h14l2 6M3 10a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 3 0M9 20v-6h6v6"/></svg>
            </span>
            <span class="footer-logo-text">
              <strong>PasarPintar</strong>
              <small>UMKM &amp; Kriya Indonesia</small>
            </span>
          </a>
          <p class="footer-about-text">Your one-stop shop for quality products at the best prices. Shop smart, live better.</p>
          <div class="footer-social-links">
            <a href="#facebook" aria-label="Facebook">f</a>
            <a href="#instagram" aria-label="Instagram">📷</a>
            <a href="#twitter" aria-label="Twitter">🐦</a>
            <a href="#pinterest" aria-label="Pinterest">📌</a>
          </div>
        </div>

        <!-- Col 2: Quick Links -->
        <div class="footer-nav-col">
          <h4>QUICK LINKS</h4>
          <a href="#beranda" @click.prevent="goHome">Home</a>
          <a href="#produk" @click.prevent="selectProductFilter('Semua Pilihan'); submitSearch()">Shop</a>
          <a href="#kategori">Collections</a>
          <a href="#cerita">About Us</a>
          <a href="#bantuan">Contact Us</a>
        </div>

        <!-- Col 3: Customer Service -->
        <div class="footer-nav-col">
          <h4>CUSTOMER SERVICE</h4>
          <a href="#bantuan">FAQs</a>
          <a href="#bantuan">Shipping Policy</a>
          <a href="#bantuan">Returns & Refunds</a>
          <a href="#bantuan">Terms & Conditions</a>
          <a href="#bantuan">Privacy Policy</a>
        </div>

        <!-- Col 4: My Account -->
        <div class="footer-nav-col">
          <h4>MY ACCOUNT</h4>
          <a href="#bantuan" @click.prevent="openAuth('login')">My Account</a>
          <a href="#pesanan" @click.prevent="openTracking">Order History</a>
          <a href="#produk" @click.prevent="toggleHeaderPanel('wishlist')">Wishlist</a>
          <a href="#pesanan" @click.prevent="openTracking">Track Order</a>
          <a href="#bantuan" @click.prevent="openAuth('login')">Login / Register</a>
        </div>

        <!-- Col 5: Contact Us -->
        <div class="footer-contact-col">
          <h4>CONTACT US</h4>
          <p>📞 +1 234 567 8900</p>
          <p>✉️ support@pasarpintar.id</p>
          <p>📍 123 Commerce St,<br />New York, NY 10001, USA</p>
        </div>
      </div>

      <!-- Footer Bottom Bar -->
      <div class="page-width footer-bottom-shopluxe">
        <span class="copyright-text">© 2024 PasarPintar. All Rights Reserved.</span>
        <div class="payment-badges-row">
          <span class="pay-badge visa">VISA</span>
          <span class="pay-badge mastercard">Mastercard</span>
          <span class="pay-badge paypal">PayPal</span>
          <span class="pay-badge applepay"> Pay</span>
          <span class="pay-badge gpay">G Pay</span>
        </div>
      </div>
    </footer>
    </template>
  </main>
  <SellerOrderManagement v-else-if="currentView === 'seller'" @back-to-store="goHome" />
  <PlatformSettings v-else @back-to-store="goHome" />
</template>

