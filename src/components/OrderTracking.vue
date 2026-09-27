<script setup lang="ts">
import { computed, ref } from 'vue'

interface TrackingEvent {
  title: string
  description: string
  time: string
  location: string
  state: 'complete' | 'current' | 'upcoming'
}

const emit = defineEmits<{ back: [] }>()

const demoOrderNumber = 'PP-20260926'
const trackingNumber = ref(demoOrderNumber)
const lookupError = ref('')
const copied = ref(false)
const lastUpdated = '26 September 2026, 14.28 WIB'
const events: TrackingEvent[] = [
  { title: 'Pesanan dibuat', description: 'Pembayaran berhasil dikonfirmasi.', time: '26 Sep · 08.42', location: 'PasarPintar', state: 'complete' },
  { title: 'Disiapkan oleh penjual', description: 'Koperasi Kopi Bajawa mengemas pesanan dengan aman.', time: '26 Sep · 09.16', location: 'Bajawa, Ngada', state: 'complete' },
  { title: 'Paket diterima kurir', description: 'Paket sudah dijemput J&T Express dari mitra UMKM.', time: '26 Sep · 11.05', location: 'Bajawa, Ngada', state: 'complete' },
  { title: 'Dalam perjalanan', description: 'Paket bergerak menuju pusat sortir regional.', time: '26 Sep · 14.28', location: 'Hub Pengiriman Kupang', state: 'current' },
  { title: 'Diantar ke alamat tujuan', description: 'Kurir akan menghubungi penerima saat paket tiba.', time: 'Perkiraan 27 Sep', location: 'Jakarta Selatan', state: 'upcoming' },
]

const order = {
  number: demoOrderNumber,
  status: 'Dalam perjalanan',
  eta: 'Minggu, 27 September',
  courier: 'J&T Express',
  service: 'Reguler',
  waybill: 'JT-8800-26-0926',
  seller: 'Koperasi Kopi Bajawa Lestari',
  origin: 'Bajawa, Ngada, Nusa Tenggara Timur',
  destination: 'Raha Putri · Jakarta Selatan, DKI Jakarta',
  recipient: 'Raha Putri',
  phone: '08•• •••• 7890',
  items: [
    { name: 'Kopi Arabika Flores Bajawa Single Origin', variant: '250 gram · Biji Utuh', quantity: 2, image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=82' },
    { name: 'Kemeja Batik Cap Motif Parang', variant: 'Ukuran L', quantity: 1, image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=300&q=82' },
  ],
}

const activeEvents = computed(() => events.filter((event) => event.state !== 'upcoming'))
const currentEvent = computed(() => events.find((event) => event.state === 'current'))
const statusStep = computed(() => events.findIndex((event) => event.state === 'current') + 1)

function lookupOrder() {
  const query = trackingNumber.value.trim().toUpperCase()
  trackingNumber.value = query
  lookupError.value = query === demoOrderNumber ? '' : 'Nomor pesanan tidak ditemukan. Periksa kembali nomor dan coba lagi.'
}

async function copyOrderNumber() {
  try {
    await navigator.clipboard.writeText(order.waybill)
    copied.value = true
    window.setTimeout(() => { copied.value = false }, 1800)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <main class="tracking-page">
    <div class="tracking-container">
      <nav class="tracking-breadcrumb" aria-label="Breadcrumb"><a href="#beranda" @click.prevent="emit('back')">Beranda</a><span>›</span><b>Lacak Pesanan</b></nav>

      <section class="tracking-intro">
        <div><span class="tracking-eyebrow">PANTAU PERJALANAN PAKET</span><h1>Lacak Pesanan</h1><p>Ikuti setiap langkah perjalanan produk lokal pilihanmu sampai tiba dengan aman.</p></div>
        <div class="tracking-intro-badge"><span>▣</span><span><b>Pengiriman terpantau</b><small>Informasi diperbarui berkala</small></span></div>
      </section>

      <form class="tracking-search-panel" @submit.prevent="lookupOrder">
        <label for="order-tracking-input"><span class="tracking-search-icon">⌕</span><span><b>Nomor pesanan atau nomor resi</b><small>Masukkan nomor yang tertera pada konfirmasi pesanan.</small></span></label>
        <div class="tracking-search-controls"><input id="order-tracking-input" v-model="trackingNumber" autocomplete="off" placeholder="Contoh: PP-20260926" aria-label="Nomor pesanan atau nomor resi" /><button type="submit">Lacak Pesanan <span>→</span></button></div>
        <p v-if="lookupError" class="tracking-error" role="alert">{{ lookupError }}</p>
        <p v-else class="tracking-search-hint">Contoh nomor demo: <button type="button" @click="trackingNumber = demoOrderNumber; lookupOrder()">{{ demoOrderNumber }}</button></p>
      </form>

      <template v-if="!lookupError">
        <section class="tracking-order-heading"><div><span class="tracking-status-pill"><i></i>{{ order.status }}</span><h2>Pesanan {{ order.number }}</h2><span class="tracking-last-update">Pembaruan terakhir {{ lastUpdated }}</span></div><button class="copy-waybill" type="button" @click="copyOrderNumber"><span>▣</span> {{ copied ? 'Nomor resi disalin' : 'Salin nomor resi' }}</button></section>

        <div class="tracking-layout">
          <div class="tracking-main-column">
            <section class="tracking-card delivery-progress-card">
              <div class="delivery-progress-heading"><span class="delivery-icon">⌖</span><div><small>ESTIMASI TIBA</small><h2>{{ order.eta }}</h2><p>Perkiraan berdasarkan layanan {{ order.service }} {{ order.courier }}</p></div><span class="progress-step-count">{{ statusStep }} dari {{ events.length }} tahap</span></div>
              <div class="delivery-route"><div class="route-point"><i class="route-pin origin-pin">●</i><span><small>ASAL PENGIRIMAN</small><b>{{ order.origin }}</b></span></div><div class="route-line"><i></i><i></i><i></i><i></i></div><div class="route-point"><i class="route-pin destination-pin">●</i><span><small>ALAMAT TUJUAN</small><b>Jakarta Selatan, DKI Jakarta</b></span></div></div>
              <div class="tracking-progress-bar" :aria-label="`Tahap ${statusStep} dari ${events.length}`"><i v-for="event in events" :key="event.title" :class="event.state"></i></div>
            </section>

            <section class="tracking-card journey-card">
              <div class="tracking-section-heading"><div><span class="tracking-eyebrow">RIWAYAT PENGIRIMAN</span><h2>Perjalanan paket</h2></div><span class="journey-order-count">{{ activeEvents.length }} pembaruan</span></div>
              <ol class="journey-timeline">
                <li v-for="(event, index) in events" :key="event.title" :class="event.state">
                  <span class="timeline-marker"><i v-if="event.state === 'complete'">✓</i><i v-else-if="event.state === 'current'">●</i></span>
                  <div class="timeline-content"><div class="timeline-title-row"><h3>{{ event.title }}</h3><time>{{ event.time }}</time></div><p>{{ event.description }}</p><small>⌖ &nbsp; {{ event.location }}</small></div>
                </li>
              </ol>
              <div v-if="currentEvent" class="current-location-note"><span>ⓘ</span><p><b>Pembaruan terakhir:</b> {{ currentEvent.description }} Lokasi paket saat ini: {{ currentEvent.location }}.</p></div>
            </section>

            <section class="tracking-card tracking-items-card">
              <div class="tracking-section-heading"><div><span class="tracking-eyebrow">ISI PAKET</span><h2>Produk dalam pesanan</h2></div><span class="tracking-item-count">{{ order.items.reduce((count, item) => count + item.quantity, 0) }} barang</span></div>
              <div v-for="item in order.items" :key="item.name" class="tracking-product-row"><img :src="item.image" :alt="item.name" /><span><b>{{ item.name }}</b><small>{{ item.variant }}</small></span><strong>×{{ item.quantity }}</strong></div>
              <div class="tracking-seller"><span class="tracking-seller-icon">▤</span><span><small>DIKIRIM DARI MITRA</small><b>{{ order.seller }}</b></span><span class="seller-verified">✓ Mitra terverifikasi</span></div>
            </section>
          </div>

          <aside class="tracking-side-column">
            <section class="tracking-card courier-card"><div class="tracking-section-heading"><div><span class="tracking-eyebrow">MITRA LOGISTIK</span><h2>Detail pengiriman</h2></div><span class="courier-mark">J&T</span></div><div class="courier-detail"><small>Kurir</small><b>{{ order.courier }} · {{ order.service }}</b></div><div class="courier-detail"><small>Nomor resi</small><span><b>{{ order.waybill }}</b><button type="button" aria-label="Salin nomor resi" @click="copyOrderNumber">⧉</button></span></div><div class="courier-detail"><small>Dikirim dari</small><b>{{ order.origin }}</b></div><a class="courier-help" href="mailto:bantuan@pasarpintar.id?subject=Bantuan%20pengiriman">Butuh bantuan pengiriman? <span>Hubungi kami →</span></a></section>

            <section class="tracking-card recipient-card"><div class="tracking-section-heading"><div><span class="tracking-eyebrow">ALAMAT PENERIMA</span><h2>Tujuan pengiriman</h2></div><span class="recipient-pin">⌖</span></div><b>{{ order.recipient }}</b><p>{{ order.phone }}<br />{{ order.destination }}</p><span class="address-protected">▣ &nbsp; Alamat terlindungi</span></section>

            <section class="tracking-help-card"><span class="help-headset">?</span><div><b>Perlu bantuan?</b><p>Tim layanan pelanggan siap membantu perjalanan pesananmu.</p><a href="mailto:bantuan@pasarpintar.id?subject=Bantuan%20pelacakan">Hubungi layanan pelanggan <span>→</span></a></div></section>
          </aside>
        </div>
      </template>

      <section v-else class="tracking-not-found tracking-card"><span>⌕</span><h2>Pesanan belum ditemukan</h2><p>Pastikan nomor pesanan benar. Untuk contoh data demo, gunakan {{ demoOrderNumber }}.</p><button type="button" @click="trackingNumber = demoOrderNumber; lookupOrder()">Lihat contoh pelacakan</button></section>

      <section class="tracking-faq"><details><summary>Berapa lama waktu pembaruan status pengiriman?</summary><p>Status diperbarui ketika kurir memindai paket pada titik pengiriman berikutnya. Jeda beberapa jam dapat terjadi saat paket sedang dalam perjalanan antarkota.</p></details><details><summary>Apa yang harus dilakukan jika paket melewati estimasi tiba?</summary><p>Hubungi layanan pelanggan dengan nomor pesanan dan nomor resi. Tim kami akan membantu menelusuri paket bersama mitra logistik.</p></details></section>

      <button class="tracking-back-home" type="button" @click="emit('back')">← &nbsp; Kembali ke beranda</button>
    </div>
  </main>
</template>
