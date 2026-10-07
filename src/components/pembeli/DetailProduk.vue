<script setup lang="ts">
import { computed, ref } from 'vue'

export interface ProductDetailData {
  id: string
  name: string
  price: number
  originalPrice?: number
  discount?: string
  badge?: string
  group?: string
  location: string
  rating: number
  reviewCount: number
  imageUrl: string
  imageAlt: string
  sellerName: string
  sellerLocation: string
  description: string
  sku: string
  gallery: string[]
}

const props = defineProps<{ product: ProductDetailData; isWishlisted: boolean }>()
const emit = defineEmits<{
  back: []
  addToCart: [id: string, quantity?: number, unitPrice?: number, variant?: string]
  buyNow: [id: string, quantity?: number, unitPrice?: number, variant?: string]
  toggleWishlist: [id: string]
  openProduct: [id: string]
}>()

const activeImage = ref(0)
const selectedRoast = ref('Medium Roast')
const selectedGrind = ref('Biji Utuh')
const selectedSize = ref('250 gram')
const quantity = ref(1)
const activeTab = ref('Deskripsi Lengkap')
const tabs = ['Deskripsi Lengkap', 'Spesifikasi & Asal', 'Ulasan Pembeli']
const grindOptions = [
  { name: 'Biji Utuh', description: 'Roast Beans Segar' },
  { name: 'Giling Kasar', description: 'French Press / Cold Brew' },
  { name: 'Giling Halus', description: 'Espresso / Tubruk' },
]
const sizes = ['250 gram', '500 gram', '1 kilogram']
const relatedProducts = [
  { id: 'curated-2', title: 'Kain Tenun Pewarna Alam Indigo Sumba Asli', place: 'Sumba Timur', price: 'Rp 185.000', image: 'photo-1605000797499-95a51c5269ae' },
  { id: 'sale-1', title: 'Keripik Pisang Cokelat Lumer Khas Lampung', place: 'Bandar Lampung', price: 'Rp 28.500', image: 'photo-1566478989037-eec170784d0b' },
  { id: 'sale-2', title: 'Madu Hutan Liar Murni Sumbawa 500 ml', place: 'Sumbawa, NTB', price: 'Rp 95.000', image: 'photo-1587049352851-8d4e89133924' },
  { id: 'curated-4', title: 'Kotak Anyaman Daun Pandan Serbaguna', place: 'Tasikmalaya', price: 'Rp 75.000', image: 'photo-1490312278390-ab64016e0aa9' },
]
const displayedPrice = computed(() => {
  if (props.product.id === 'coffee-flores') {
    return selectedSize.value === '500 gram' ? props.product.price * 1.85 : selectedSize.value === '1 kilogram' ? props.product.price * 3.5 : props.product.price
  }
  return props.product.price
})
const formattedPrice = computed(() => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(displayedPrice.value).replace(/\s+/g, ' '))
const formattedOriginalPrice = computed(() => props.product.originalPrice ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(props.product.originalPrice).replace(/\s+/g, ' ') : '')
const isCoffee = computed(() => props.product.id === 'coffee-flores')

function addToCart() {
  emit('addToCart', props.product.id, quantity.value, displayedPrice.value, `${selectedSize.value} · ${selectedGrind.value}`)
}

function buyNow() {
  emit('buyNow', props.product.id, quantity.value, displayedPrice.value, `${selectedSize.value} · ${selectedGrind.value}`)
}
</script>

<template>
  <main class="product-detail-page">
    <div class="detail-container">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="#beranda" @click.prevent="emit('back')">Beranda</a><span>›</span><a href="#produk" @click.prevent="emit('back')">Katalog Produk</a><span>›</span><a href="#kategori" @click.prevent="emit('back')">{{ product.group || 'Produk Lokal' }}</a><span>›</span><b>{{ product.name }}</b>
      </nav>

      <div class="detail-layout">
        <section class="product-gallery" aria-label="Galeri produk">
          <div class="main-product-image">
            <img :src="product.gallery[activeImage] || product.imageUrl" :alt="product.imageAlt" />
            <div class="image-badges"><span>✿ &nbsp; 100% Asli {{ product.group === 'Wastra & Kriya' ? 'Kriya' : 'Flores' }}</span><span>♙ &nbsp; Kurasi PasarPintar</span></div>
            <button class="detail-wishlist" type="button" :class="{ saved: isWishlisted }" :aria-label="isWishlisted ? 'Hapus dari wishlist' : 'Simpan ke wishlist'" @click="emit('toggleWishlist', product.id)"><svg viewBox="0 0 24 24" :fill="isWishlisted ? 'currentColor' : 'none'"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1 7.8 7.8 7.8-7.8 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" /></svg></button>
            <span class="zoom-hint">⌕ &nbsp; Geser untuk perbesar</span>
          </div>
          <div class="thumbnail-list">
            <button v-for="(image, index) in product.gallery" :key="image" type="button" :class="{ active: activeImage === index }" :aria-label="`Lihat foto ${index + 1}`" @click="activeImage = index"><img :src="image" :alt="`${product.name}, foto ${index + 1}`" /></button>
          </div>
          <div class="shipping-promo"><span class="shipping-promo-icon">▣</span><span><b>Bebas Ongkir hingga Rp 20.000</b><small>Min. belanja Rp 50.000 khusus produk UMKM {{ product.location }}</small></span><span class="active-tag">Otomatis Aktif</span></div>
        </section>

        <section class="product-purchase">
          <div class="purchase-card">
            <div class="detail-label-row"><span class="detail-label">TERLARIS MINGGU INI</span><small>SKU: {{ product.sku }}</small></div>
            <h1>{{ product.name }}</h1>
            <div class="product-social-proof"><span class="star">★</span><b>{{ product.rating.toFixed(1) }}</b><span>({{ product.reviewCount }} Ulasan)</span><i></i><span>Terjual <b>850+ paket</b></span><span class="ready-stock">◉ Stok Siap Kirim</span></div>
            <div class="detail-price"><strong>{{ formattedPrice }}</strong><del v-if="formattedOriginalPrice">{{ formattedOriginalPrice }}</del><span v-if="product.discount" class="saving-label">Hemat {{ product.discount }}</span></div>

            <fieldset v-if="isCoffee" class="option-field"><legend>PILIHAN GILINGAN: <a href="#deskripsi">ⓘ Panduan Gilingan</a></legend><div class="option-grid grind-options"><button v-for="grind in grindOptions" :key="grind.name" type="button" :class="{ selected: selectedGrind === grind.name }" @click="selectedGrind = grind.name"><b>{{ grind.name }}</b><small>{{ grind.description }}</small></button></div></fieldset>
            <fieldset v-else class="option-field"><legend>PILIHAN PRODUK</legend><div class="option-grid"><button class="selected" type="button"><b>{{ product.badge || 'Pilihan Kurator' }}</b><small>{{ product.group || 'Produk Lokal' }}</small></button><button type="button"><b>Detail Terverifikasi</b><small>Kurasi PasarPintar</small></button></div></fieldset>

            <fieldset v-if="isCoffee" class="option-field size-field"><legend>UKURAN KEMASAN:</legend><div class="size-options"><button v-for="size in sizes" :key="size" type="button" :class="{ selected: selectedSize === size }" @click="selectedSize = size">{{ size }}</button></div></fieldset>

            <div class="quantity-stock"><div><b>Jumlah:</b><div class="detail-quantity"><button type="button" aria-label="Kurangi jumlah" :disabled="quantity <= 1" @click="quantity = Math.max(1, quantity - 1)">−</button><span>{{ quantity }}</span><button type="button" aria-label="Tambah jumlah" @click="quantity += 1">+</button></div></div><span class="stock-notice">▣ &nbsp; Sisa stok: <b>24 bungkus</b></span></div>
            <div class="detail-actions"><button class="add-cart-button" type="button" @click="addToCart">♧ &nbsp; + Keranjang</button><button class="buy-now-button" type="button" @click="buyNow">▣ &nbsp; Beli Sekarang</button></div>
            <div class="delivery-info"><div><span>⌖</span><b>Dikirim dari: {{ product.sellerLocation }}</b></div><small>◷ &nbsp; Estimasi tiba: 2–3 Hari (Reguler)</small><div class="courier-list"><span>MITRA LOGISTIK:</span><b>J&T Express</b><b>SiCepat</b><b>JNE OKE</b></div></div>
          </div>

          <div class="seller-card">
            <img :src="product.id === 'coffee-flores' ? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=85' : product.gallery[1] || product.imageUrl" :alt="`Mitra ${product.sellerName}`" />
            <div class="seller-info"><h2>{{ product.sellerName }}</h2><span>◉ UMKM Binaan</span><small><i></i> Online &nbsp; • &nbsp; {{ product.sellerLocation }}</small></div>
            <div class="seller-actions"><button type="button">▤ Chat</button><button type="button">▣ Kunjungi Toko</button></div>
            <div class="seller-metrics"><div><b>4.9 / 5.0</b><small>Rating Toko</small></div><div><b>± 5 Menit</b><small>Kecepatan Balas</small></div><div><b>100%</b><small>Pesanan Selesai</small></div></div>
          </div>
        </section>
      </div>

      <section id="deskripsi" class="product-information">
        <div class="detail-tabs" role="tablist"><button v-for="tab in tabs" :key="tab" type="button" role="tab" :aria-selected="activeTab === tab" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }} <span v-if="tab === 'Ulasan Pembeli'">{{ product.reviewCount }}</span></button></div>
        <div class="description-layout">
          <div class="description-copy"><span class="detail-section-kicker">CERITA & KEASLIAN PRODUK</span><h2>{{ isCoffee ? 'Kelezatan Otentik Dataran Tinggi Bajawa, Flores' : product.name }}</h2><p>{{ activeTab === 'Spesifikasi & Asal' ? `Diproduksi di ${product.location} dengan bahan pilihan dan proses produksi yang terjaga. Setiap produk telah melalui kurasi kualitas PasarPintar.` : activeTab === 'Ulasan Pembeli' ? `${product.rating.toFixed(1)} dari 5 berdasarkan ${product.reviewCount} ulasan pembeli terverifikasi. Pelanggan menyukai kualitas, kemasan, dan layanan dari ${product.sellerName}.` : product.description }}</p><div class="tasting-cards"><div><small>{{ isCoffee ? 'TASTING NOTES' : 'KEUNGGULAN' }}</small><b>{{ isCoffee ? 'Caramel, Red Apple, Dark Chocolate' : 'Dibuat oleh UMKM terkurasi' }}</b></div><div><small>{{ isCoffee ? 'TINGKAT SANGRAI' : 'ASAL PRODUK' }}</small><b>{{ isCoffee ? selectedRoast : product.location }}</b></div><div><small>{{ isCoffee ? 'TINGKAT KEASAMAN' : 'JAMINAN MUTU' }}</small><b>{{ isCoffee ? 'Medium Bright Citric' : 'Asli & berkualitas' }}</b></div></div></div>
          <img class="maker-image" src="https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=900&q=85" alt="Mitra UMKM mengolah hasil panen lokal" />
        </div>
        <div class="brew-guide"><h3>▣ &nbsp; Rekomendasi Takaran & Cara Seduh Ideal:</h3><div><article><b>● V60 / Pour Over</b><p>Rasio 1:15 (15g kopi : 225ml air panas 92°C). Gilingan medium-fine. Waktu seduh 2m 45s.</p></article><article><b>● Tubruk Tradisional</b><p>Rasio 1:12 (12g kopi : 150ml air mendidih 95°C). Aduk perlahan dan diamkan 4 menit.</p></article><article><b>● Cold Brew Santai</b><p>Rasio 1:8 (50g kopi kasar : 400ml air dingin). Simpan di lemari pendingin selama 14–16 jam.</p></article></div></div>
      </section>

      <section class="related-products">
        <div class="related-heading"><div><span class="detail-section-kicker">PILIHAN UMKM LAINNYA</span><h2>Produk Lokal Pilihan Lainnya</h2></div><a href="#produk" @click.prevent="emit('back')">Lihat Semua →</a></div>
        <div class="related-grid">
          <article v-for="related in relatedProducts" :key="related.id" class="related-card" @click="emit('openProduct', related.id)">
            <img :src="`https://images.unsplash.com/${related.image}?w=520&q=82`" :alt="related.title" />
            <span class="related-place">{{ related.place }}</span>
            <button type="button" aria-label="Simpan produk" @click.stop="emit('toggleWishlist', related.id)">♡</button>
            <div><small>Produk Lokal</small><h3>{{ related.title }}</h3><span class="related-rating">★ {{ product.rating.toFixed(1) }} ({{ product.reviewCount }})</span><b>{{ related.price }}</b></div>
            <button class="related-cart" type="button" aria-label="Tambah produk ke keranjang" @click.stop="emit('addToCart', related.id)">♧</button>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>
