<script setup lang="ts">
import { computed, ref } from 'vue'

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

interface CartSuggestion {
  id: string | number
  name: string
  imageUrl: string
  imageAlt: string
  price: number
  location: string
}

const items = defineModel<CartLine[]>('items', { required: true })
const props = defineProps<{ recommendations: CartSuggestion[] }>()
const emit = defineEmits<{
  backToHome: []
  addProduct: [id: string | number]
}>()

const currentStep = ref<'cart' | 'shipping' | 'complete'>('cart')
const couponCode = ref('BANGGALOKAL')
const couponApplied = ref(true)
const couponMessage = ref('')
const paymentMethod = ref('qris')
const orderNumber = ref('')
const editingAddress = ref(false)
const address = ref({
  name: 'Raha Putri',
  phone: '0812 3456 7890',
  street: 'Jl. Kemang Raya No. 18, RT 04 / RW 02',
  city: 'Mampang Prapatan, Jakarta Selatan',
  postalCode: '12730',
})

const shippingOptions = [
  { value: 'J&T Reguler', label: 'Reguler J&T (2–3 hari)' },
  { value: 'SiCepat Hemat', label: 'SiCepat Hemat (2–4 hari)' },
  { value: 'JNE YES', label: 'JNE YES (1–2 hari)' },
]

const groups = computed(() => {
  const grouped = new Map<string, CartLine[]>()
  for (const item of items.value) {
    const groupItems = grouped.get(item.sellerName) ?? []
    groupItems.push(item)
    grouped.set(item.sellerName, groupItems)
  }
  return Array.from(grouped, ([sellerName, groupItems]) => ({ sellerName, items: groupItems }))
})

const selectedItems = computed(() => items.value.filter((item) => item.selected))
const selectedQuantity = computed(() => selectedItems.value.reduce((count, item) => count + item.quantity, 0))
const selectedGroupCount = computed(() => groups.value.filter((group) => group.items.some((item) => item.selected)).length)
const allSelected = computed(() => items.value.length > 0 && items.value.every((item) => item.selected))
const subtotal = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0))

function shippingFee(method: string) {
  if (method === 'JNE YES') return 28000
  if (method === 'SiCepat Hemat') return 14000
  return 18000
}

const shippingTotal = computed(() => selectedItems.value.reduce((sum, item) => sum + shippingFee(item.shippingMethod), 0))
const discount = computed(() => couponApplied.value && subtotal.value >= 100000 ? 20000 : 0)
const total = computed(() => subtotal.value + shippingTotal.value - discount.value + 1000)

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value).replace(/\s+/g, ' ')
}

function updateItems(update: (item: CartLine) => CartLine | null) {
  items.value = items.value.map(update).filter((item): item is CartLine => item !== null)
}

function toggleAll() {
  const nextSelected = !allSelected.value
  updateItems((item) => ({ ...item, selected: nextSelected }))
}

function toggleSeller(sellerName: string, selected: boolean) {
  updateItems((item) => item.sellerName === sellerName ? { ...item, selected } : item)
}

function changeQuantity(id: string, amount: number) {
  updateItems((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item)
}

function updateShipping(id: string, shippingMethod: string) {
  updateItems((item) => item.id === id ? { ...item, shippingMethod } : item)
}

function updateNote(id: string, note: string) {
  updateItems((item) => item.id === id ? { ...item, note } : item)
}

function removeItem(id: string) {
  updateItems((item) => item.id === id ? null : item)
}

function removeSelected() {
  updateItems((item) => item.selected ? null : item)
}

function applyCoupon() {
  if (couponCode.value.trim().toLocaleUpperCase('id') === 'BANGGALOKAL' && subtotal.value >= 100000) {
    couponApplied.value = true
    couponMessage.value = 'Diskon Bangga Lokal berhasil diterapkan.'
    return
  }
  couponApplied.value = false
  couponMessage.value = 'Kode kupon tidak valid atau minimum belanja belum tercapai.'
}

function proceedToShipping() {
  if (selectedItems.value.length > 0) currentStep.value = 'shipping'
}

function placeOrder() {
  orderNumber.value = `PP-${Date.now().toString().slice(-8)}`
  currentStep.value = 'complete'
}

function continueShopping() {
  emit('backToHome')
}
</script>

<template>
  <section class="cart-page">
    <div class="checkout-wrap">
      <div class="checkout-heading">
        <div>
          <span class="checkout-kicker">CHECKOUT MULTI-SELLER</span>
          <h1>{{ currentStep === 'cart' ? 'Keranjang Belanja Kamu' : currentStep === 'shipping' ? 'Pengiriman & Pembayaran' : 'Pesanan Berhasil' }}</h1>
        </div>
        <ol class="checkout-progress" aria-label="Tahapan checkout">
          <li :class="{ active: currentStep === 'cart', done: currentStep !== 'cart' }"><span>1</span><b>Keranjang</b></li>
          <i></i>
          <li :class="{ active: currentStep === 'shipping', done: currentStep === 'complete' }"><span>2</span><b>Pengiriman & Bayar</b></li>
          <i></i>
          <li :class="{ active: currentStep === 'complete' }"><span>3</span><b>Konfirmasi</b></li>
        </ol>
      </div>

      <template v-if="currentStep === 'cart'">
        <div class="delivery-promise"><span class="promise-icon">▣</span><span><b>Dukung Ongkir Lokal:</b> Belanja langsung dari <strong>2 Sentra UMKM Nusantara.</strong><small>Pengiriman terintegrasi dengan garansi dan kemasan produk lokal.</small></span><b class="promise-tag">◉ &nbsp; 100% Langsung dari Sumber</b></div>

        <div class="checkout-grid">
          <div class="cart-column">
            <section class="cart-panel cart-list-panel">
              <div class="cart-select-all">
                <label class="checkbox-label"><input type="checkbox" :checked="allSelected" @change="toggleAll" /><b>Pilih Semua Produk</b><small>({{ selectedGroupCount }} Toko, {{ selectedQuantity }} Barang)</small></label>
                <button class="remove-selected" type="button" :disabled="selectedItems.length === 0" @click="removeSelected">▣ &nbsp; Hapus Pilihan</button>
              </div>

              <div v-if="items.length === 0" class="empty-cart"><span class="empty-cart-icon">🛍</span><h2>Keranjangmu masih kosong</h2><p>Temukan produk lokal pilihan dan dukung langsung para pelaku UMKM.</p><button class="primary-button" type="button" @click="continueShopping">Jelajahi Produk</button></div>

              <section v-for="group in groups" :key="group.sellerName" class="cart-shop">
                <header class="shop-heading">
                  <label class="checkbox-label"><input type="checkbox" :checked="group.items.every((item) => item.selected)" @change="toggleSeller(group.sellerName, !group.items.every((item) => item.selected))" /><span class="shop-avatar">▤</span><span><b>{{ group.sellerName }} <span class="verified-shop">✓</span></b><small>◉ {{ group.items[0]?.sellerLocation }}</small></span></label>
                  <span class="shop-badge">{{ group.sellerName.includes('Batik') ? 'Pengrajin Tradisional' : 'Petani Langsung' }}</span>
                </header>

                <article v-for="item in group.items" :key="item.id" class="cart-item">
                  <label class="cart-item-check"><input type="checkbox" :checked="item.selected" :aria-label="`Pilih ${item.name}`" @change="updateItems((current) => current.id === item.id ? { ...current, selected: !current.selected } : current)" /></label>
                  <img class="cart-item-image" :src="item.imageUrl" :alt="item.imageAlt" />
                  <div class="cart-item-details"><h3>{{ item.name }}</h3><span class="item-variant">Variasi: {{ item.variant }}</span><div class="item-price"><b>{{ formatCurrency(item.price) }}</b><del>{{ formatCurrency(item.price + 12000) }}</del></div></div>
                  <div class="cart-item-actions"><div class="quantity-control"><button type="button" :aria-label="`Kurangi jumlah ${item.name}`" @click="changeQuantity(item.id, -1)">−</button><span>{{ item.quantity }}</span><button type="button" :aria-label="`Tambah jumlah ${item.name}`" @click="changeQuantity(item.id, 1)">+</button></div><div class="item-links"><button type="button" @click="removeItem(item.id)">♡ Pindahkan</button><button type="button" @click="removeItem(item.id)">♧ Hapus</button></div></div>
                  <div class="cart-item-note"><span>▧</span><input :value="item.note" type="text" :aria-label="`Catatan untuk ${item.sellerName}`" placeholder="Tulis catatan untuk pengrajin (opsional)..." @input="updateNote(item.id, ($event.target as HTMLInputElement).value)" /><label>Kirim pilih:</label><select :value="item.shippingMethod" :aria-label="`Jasa kirim untuk ${item.name}`" @change="updateShipping(item.id, ($event.target as HTMLSelectElement).value)"><option v-for="option in shippingOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select><b>{{ formatCurrency(shippingFee(item.shippingMethod)) }}</b><button type="button" class="change-shipping">Ubah</button></div>
                </article>
              </section>
            </section>

            <section class="assurance-card"><div><span class="assurance-symbol green">✓</span><span><b>Garansi Produk Lokal 100% Asli</b><small>Langsung dari UMKM dan sentra pengrajin terverifikasi.</small></span></div><div><span class="assurance-symbol coral">♧</span><span><b>Dana Dilindungi Rekber PasarPintar</b><small>Pencairan dana menunggu pesanan diterima dengan sempurna.</small></span></div><div><span class="assurance-symbol amber">♧</span><span><b>Pendamping Logistik Nusantara</b><small>Dukungan pengiriman rute pelosok dan responsif.</small></span></div></section>
          </div>

          <aside class="checkout-sidebar">
            <section class="cart-panel coupon-panel"><div class="panel-title"><h2>♧ &nbsp; Kupon & Diskon Khusus</h2><span>1 Kupon Terpasang</span></div><form class="coupon-form" @submit.prevent="applyCoupon"><label class="coupon-input"><span>▧</span><input v-model="couponCode" aria-label="Kode kupon" placeholder="Masukkan kode promo" /></label><button type="submit">Terapkan</button></form><div v-if="couponApplied" class="coupon-success"><span>◉ &nbsp; Diskon Gerakan Bangga Lokal</span><b>− {{ formatCurrency(discount) }}</b></div><p v-if="couponMessage" class="coupon-message" :class="{ error: !couponApplied }">{{ couponMessage }}</p></section>

            <section class="cart-panel order-summary"><div class="panel-title"><h2>Ringkasan Tagihan</h2><span>{{ selectedQuantity }} Barang</span></div><div class="summary-lines"><div><span>Total Harga Produk</span><b>{{ formatCurrency(subtotal) }}</b></div><div><span>Total Ongkos Kirim <small>({{ selectedGroupCount }} Pengirim)</small></span><b>{{ formatCurrency(shippingTotal) }}</b></div><div class="discount-line"><span>Potongan Kupon UMKM <b>⌄</b></span><b>− {{ formatCurrency(discount) }}</b></div><div><span>Biaya Layanan & Pembinaan UMKM ⓘ</span><b>{{ formatCurrency(selectedItems.length ? 1000 : 0) }}</b></div></div><div class="summary-total"><div><span>TOTAL PEMBAYARAN</span><b class="saving-tag">Hemat Rp 35.000</b></div><strong>{{ formatCurrency(total) }}</strong></div><button class="primary-button continue-button" type="button" :disabled="selectedItems.length === 0" @click="proceedToShipping">Lanjut ke Pengiriman <span>→</span></button><div class="payment-methods"><span>METODE PEMBAYARAN AMAN & TERENKRIPSI</span><div><b>▦ QRIS</b><b>VA Bank</b><b>Mandiri Livin</b></div></div></section>
          </aside>
        </div>

        <div class="cart-bottom-grid"><section class="cart-panel recommendation-panel"><div class="panel-title"><div><span class="checkout-kicker">PASANGAN DENGAN BELANJAMU</span><h2>Produk Pendamping dari Kategori Terkait</h2></div><button type="button">Lihat Lainnya →</button></div><div class="recommendation-list"><article v-for="product in props.recommendations" :key="product.id" class="recommendation-item"><img :src="product.imageUrl" :alt="product.imageAlt" /><div><b>{{ product.name }}</b><small>{{ product.location }}</small><strong>{{ formatCurrency(product.price) }}</strong></div><button type="button" :aria-label="`Tambah ${product.name} ke keranjang`" @click="emit('addProduct', product.id)">＋ <span>Tambah</span></button></article></div></section><section class="cart-panel assurance-list"><h2>Belanja dengan Tenang</h2><div><span class="assurance-symbol green">✓</span><span><b>Produk Lokal 100% Asli</b><small>Kurasi dan verifikasi dilakukan langsung oleh tim kami.</small></span></div><div><span class="assurance-symbol coral">♧</span><span><b>Dana Dilindungi PasarPintar</b><small>Transaksi aman dengan perlindungan pembeli.</small></span></div><div><span class="assurance-symbol amber">♧</span><span><b>Dukungan Pengiriman Nusantara</b><small>Partner logistik terpercaya untuk setiap pesanan.</small></span></div></section></div>
      </template>

      <form v-else-if="currentStep === 'shipping'" class="checkout-grid shipping-layout" @submit.prevent="placeOrder">
        <div class="cart-column"><section class="cart-panel shipping-panel"><div class="panel-title"><h2>Alamat Pengiriman</h2><button type="button" @click="editingAddress = !editingAddress">{{ editingAddress ? 'Tutup Editor' : 'Ubah Alamat' }}</button></div><div v-if="!editingAddress" class="address-card"><div><span class="address-icon">⌖</span><div><b>{{ address.name }} <small>Utama</small></b><span>{{ address.phone }}</span><p>{{ address.street }}<br />{{ address.city }} {{ address.postalCode }}</p></div></div><button type="button" @click="editingAddress = true">Edit</button></div><div v-else class="address-edit"><label>Nama penerima<input v-model="address.name" autocomplete="name" required /></label><label>Nomor telepon<input v-model="address.phone" autocomplete="tel" inputmode="tel" required /></label><label>Alamat lengkap<input v-model="address.street" autocomplete="street-address" required /></label><div><label>Kota / Kecamatan<input v-model="address.city" autocomplete="address-level2" required /></label><label>Kode pos<input v-model="address.postalCode" autocomplete="postal-code" inputmode="numeric" required /></label></div><button class="primary-button" type="button" @click="editingAddress = false">Simpan Alamat</button></div></section><section class="cart-panel shipping-panel"><div class="panel-title"><h2>Metode Pembayaran</h2><span>Pilih salah satu</span></div><label class="payment-choice"><input v-model="paymentMethod" type="radio" value="qris" /><span class="payment-logo qris-logo">▦</span><span><b>QRIS</b><small>Scan dengan aplikasi pembayaran pilihanmu</small></span><span class="payment-check">✓</span></label><label class="payment-choice"><input v-model="paymentMethod" type="radio" value="va" /><span class="payment-logo bank-logo">▤</span><span><b>Virtual Account Bank</b><small>BCA, BNI, BRI, Mandiri, dan lainnya</small></span><span class="payment-check">✓</span></label><label class="payment-choice"><input v-model="paymentMethod" type="radio" value="livin" /><span class="payment-logo livin-logo">M</span><span><b>Mandiri Livin'</b><small>Bayar langsung dari aplikasi Livin' by Mandiri</small></span><span class="payment-check">✓</span></label></section><section class="cart-panel shipping-panel"><div class="panel-title"><h2>Catatan Pesanan</h2><span>Opsional</span></div><textarea placeholder="Tambahkan instruksi untuk kurir atau penjual..."></textarea></section></div>
        <aside class="checkout-sidebar"><section class="cart-panel order-summary"><div class="panel-title"><h2>Ringkasan Pesanan</h2><span>{{ selectedQuantity }} Barang</span></div><div class="checkout-mini-items"><div v-for="item in selectedItems" :key="item.id"><span>{{ item.quantity }}× {{ item.name }}</span><b>{{ formatCurrency(item.price * item.quantity) }}</b></div></div><div class="summary-lines"><div><span>Total Harga Produk</span><b>{{ formatCurrency(subtotal) }}</b></div><div><span>Ongkos Kirim</span><b>{{ formatCurrency(shippingTotal) }}</b></div><div class="discount-line"><span>Potongan Kupon</span><b>− {{ formatCurrency(discount) }}</b></div><div><span>Biaya Layanan</span><b>{{ formatCurrency(selectedItems.length ? 1000 : 0) }}</b></div></div><div class="summary-total"><div><span>TOTAL PEMBAYARAN</span></div><strong>{{ formatCurrency(total) }}</strong></div><button class="primary-button continue-button" type="submit">Buat Pesanan <span>→</span></button><p class="secure-note">Dengan melanjutkan, kamu menyetujui syarat dan ketentuan PasarPintar.</p></section><button class="back-to-cart" type="button" @click="currentStep = 'cart'">← &nbsp; Kembali ke keranjang</button></aside>
      </form>

      <section v-else class="order-confirmation cart-panel"><span class="confirmation-check">✓</span><span class="checkout-kicker">TERIMA KASIH SUDAH MENDUKUNG UMKM</span><h2>Pesananmu berhasil dibuat!</h2><p>Pesanan akan segera diproses oleh para mitra UMKM. Detail dikirim ke {{ address.phone }} dan pesanan ditujukan ke {{ address.name }} di {{ address.street }}, {{ address.city }} {{ address.postalCode }}.</p><div class="order-number"><span>Nomor Pesanan</span><b>{{ orderNumber }}</b></div><div class="confirmation-total"><span>Total pembayaran</span><b>{{ formatCurrency(total) }}</b></div><button class="primary-button" type="button" @click="continueShopping">Kembali ke Beranda</button></section>
    </div>
  </section>
</template>