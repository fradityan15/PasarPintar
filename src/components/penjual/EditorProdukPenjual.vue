<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

type ProductVariant = { name: string; sku: string; price: number; stock: number }
type ProductPhoto = { src: string; name: string; uploaded?: boolean }

const emit = defineEmits<{ back: []; saved: [message: string] }>()
const props = withDefaults(defineProps<{ initialMode?: 'add' | 'edit'; initialProductName?: string }>(), {
  initialMode: 'add',
  initialProductName: '',
})

const mode = ref<'add' | 'edit'>(props.initialMode)
const activeStep = ref(1)
const productName = ref(props.initialProductName || 'Kopi Arabika Flores Bajawa Full-Wash 250gr')
const category = ref('Kopi & Minuman Herbal')
const subcategory = ref('Kopi Biji & Bubuk')
const origin = ref('Kab. Ngada, Flores, Nusa Tenggara Timur')
const description = ref('Kopi Arabika Flores Bajawa dipetik langsung di ketinggian 1.300–1.550 mdpl pada lereng Gunung Inerie yang subur dan kaya mineral vulkanis. Dipetik merah 100% oleh petani perempuan anggota Koperasi Kopi Bajawa dan diproses secara higienis melalui metode Full-Washed Fermentation selama 36 jam.\n\nKarakteristik Rasa (Cupping Notes):\n• Aroma: Fragrant floral, chocolate nutty, and fresh vanilla bean\n• Rasa: Cokelat susu, apel merah, dan karamel\n• Tingkat sangrai: Medium roast')
const variants = ref<ProductVariant[]>([
  { name: '250g - Biji Utuh', sku: 'KBI-ARB-250-W', price: 68000, stock: 24 },
  { name: '500g - Biji Utuh', sku: 'KBI-ARB-500-W', price: 125000, stock: 12 },
  { name: '1kg - Biji Utuh', sku: 'KBI-ARB-1KG-W', price: 240000, stock: 5 },
])
const optionGroups = ref([
  { title: 'Tipe Varian 1: Bentuk Gilingan', options: ['Biji Utuh (Whole Bean)', 'Giling Kasar (Coarse - Cold Brew/French Press)', 'Giling Halus (Fine - Tubruk/Espresso)'] },
  { title: 'Tipe Varian 2: Ukuran Kemasan', options: ['250g (Kemasan Standar)', '500g (Pouch Medium)', '1kg (Bulk Hemat Roastery)'] },
])
const nib = ref('9120003412093')
const halalNumber = ref('ID32110000456123')
const packageWeight = ref(300)
const packageLength = ref(15)
const packageWidth = ref(8)
const packageHeight = ref(22)
const supportedCouriers = ref(['J&T Express', 'SiCepat Cargo', 'JNE OKE/REG', 'Pos Indonesia'])
const activeCouriers = ref(['J&T Express', 'SiCepat Cargo', 'JNE OKE/REG', 'Pos Indonesia'])
const isVariantActive = ref(true)
const photos = ref<ProductPhoto[]>([
  { src: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=520&q=85', name: 'Foto utama kemasan kopi' },
  { src: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=320&q=82', name: 'Proses sangrai biji kopi' },
  { src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=320&q=82', name: 'Kopi tersaji' },
  { src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=320&q=82', name: 'Kebun kopi Bajawa' },
])
const fileInput = ref<HTMLInputElement | null>(null)
const toastMessage = ref('')
const formError = ref('')
const copiedSku = ref(false)
const pendingObjectUrls: string[] = []
let toastTimer: ReturnType<typeof setTimeout> | undefined

const qualityScore = computed(() => {
  let score = 0
  if (productName.value.trim().length >= 12) score += 20
  if (category.value && subcategory.value) score += 12
  if (origin.value.trim().length >= 8) score += 10
  if (description.value.trim().length >= 80) score += 16
  if (photos.value.length >= 3) score += 18
  if (variants.value.length && variants.value.every((variant) => variant.price > 0 && variant.stock >= 0)) score += 10
  if (nib.value.trim() && activeCouriers.value.length) score += 6
  return score
})
const completenessItems = computed(() => [
  { label: 'Foto tampak depan & kemasan jernih', complete: photos.value.length >= 3 },
  { label: 'Nomor NIB terverifikasi valid', complete: Boolean(nib.value.trim()) },
  { label: 'Varian stok & SKU sudah terkonfigurasi', complete: variants.value.length > 0 && variants.value.every((variant) => variant.sku.trim()) },
  { label: 'Video singkat produk (opsional, disarankan)', complete: false },
])
const estimatedTotalStock = computed(() => variants.value.reduce((total, variant) => total + Number(variant.stock || 0), 0))
const previewPrice = computed(() => Math.min(...variants.value.map((variant) => Number(variant.price) || Infinity)))
const currentCover = computed(() => photos.value[0]?.src ?? 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=520&q=85')

function notify(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 2600)
}

function setMode(nextMode: 'add' | 'edit') {
  mode.value = nextMode
  formError.value = ''
  if (nextMode === 'add') {
    productName.value = ''
    category.value = ''
    subcategory.value = ''
    origin.value = ''
    description.value = ''
    variants.value = [{ name: '', sku: '', price: 0, stock: 0 }]
    photos.value = []
    nib.value = ''
    halalNumber.value = ''
  } else {
    productName.value = props.initialProductName || 'Kopi Arabika Flores Bajawa Full-Wash 250gr'
    category.value = 'Kopi & Minuman Herbal'
    subcategory.value = 'Kopi Biji & Bubuk'
    origin.value = 'Kab. Ngada, Flores, Nusa Tenggara Timur'
    description.value = 'Kopi Arabika Flores Bajawa dipetik langsung di ketinggian 1.300–1.550 mdpl pada lereng Gunung Inerie yang subur dan kaya mineral vulkanis. Dipetik merah 100% oleh petani perempuan anggota Koperasi Kopi Bajawa dan diproses secara higienis melalui metode Full-Washed Fermentation selama 36 jam.\n\nKarakteristik Rasa (Cupping Notes):\n• Aroma: Fragrant floral, chocolate nutty, and fresh vanilla bean\n• Rasa: Cokelat susu, apel merah, dan karamel\n• Tingkat sangrai: Medium roast'
    variants.value = [
      { name: '250g - Biji Utuh', sku: 'KBI-ARB-250-W', price: 68000, stock: 24 },
      { name: '500g - Biji Utuh', sku: 'KBI-ARB-500-W', price: 125000, stock: 12 },
      { name: '1kg - Biji Utuh', sku: 'KBI-ARB-1KG-W', price: 240000, stock: 5 },
    ]
    photos.value = [
      { src: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=520&q=85', name: 'Foto utama kemasan kopi' },
      { src: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=320&q=82', name: 'Proses sangrai biji kopi' },
      { src: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=320&q=82', name: 'Kopi tersaji' },
      { src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=320&q=82', name: 'Kebun kopi Bajawa' },
    ]
    nib.value = '9120003412093'
    halalNumber.value = 'ID32110000456123'
  }
}

function goToStep(step: number) {
  activeStep.value = step
  document.getElementById(`product-step-${step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function addVariant() {
  variants.value.push({ name: '', sku: '', price: 0, stock: 0 })
}

function removeVariant(index: number) {
  if (variants.value.length === 1) return
  variants.value.splice(index, 1)
}

function addOption(groupIndex: number) {
  const group = optionGroups.value[groupIndex]
  if (group) group.options.push(`Opsi ${group.options.length + 1}`)
}

function removeOption(groupIndex: number, optionIndex: number) {
  const group = optionGroups.value[groupIndex]
  if (group) group.options.splice(optionIndex, 1)
}

function toggleCourier(courier: string) {
  activeCouriers.value = activeCouriers.value.includes(courier)
    ? activeCouriers.value.filter((activeCourier) => activeCourier !== courier)
    : [...activeCouriers.value, courier]
}

function choosePhotos() {
  fileInput.value?.click()
}

function handlePhotoSelection(event: Event) {
  const input = event.target as HTMLInputElement
  const selectedFiles = Array.from(input.files ?? []).filter((file) => file.type.startsWith('image/'))
  const remainingSlots = Math.max(0, 5 - photos.value.length)
  selectedFiles.slice(0, remainingSlots).forEach((file) => {
    const src = URL.createObjectURL(file)
    pendingObjectUrls.push(src)
    photos.value.push({ src, name: file.name, uploaded: true })
  })
  if (selectedFiles.length > remainingSlots) notify('Maksimal 5 foto produk dapat ditampilkan.')
  input.value = ''
}

function removePhoto(index: number) {
  const photo = photos.value[index]
  if (photo?.uploaded) URL.revokeObjectURL(photo.src)
  photos.value.splice(index, 1)
}

function formatRupiah(value: number) {
  return Number.isFinite(value) ? `Rp ${value.toLocaleString('id-ID')}` : 'Rp 0'
}

function saveDraft() {
  formError.value = ''
  notify('Draft produk berhasil disimpan.')
}

function publishProduct() {
  if (!productName.value.trim()) {
    formError.value = 'Nama produk wajib diisi sebelum produk diterbitkan.'
    goToStep(1)
    return
  }
  if (!variants.value.some((variant) => variant.price > 0)) {
    formError.value = 'Isi harga minimal satu varian sebelum produk diterbitkan.'
    goToStep(3)
    return
  }
  formError.value = ''
  notify(mode.value === 'edit' ? 'Perubahan produk berhasil disimpan.' : 'Produk berhasil diterbitkan ke marketplace.')
}

function previewProduct() {
  notify(`Pratinjau: ${productName.value || 'Produk baru'} · ${formatRupiah(previewPrice.value)}`)
}

function copySku(value: string) {
  if (navigator.clipboard) void navigator.clipboard.writeText(value)
  copiedSku.value = true
  window.setTimeout(() => { copiedSku.value = false }, 1500)
}

onUnmounted(() => {
  pendingObjectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
  if (toastTimer) clearTimeout(toastTimer)
})
</script>

<template>
  <main class="product-editor-shell">
    <aside class="product-editor-sidebar">
      <button class="editor-brand" type="button" aria-label="Kembali ke pesanan" @click="emit('back')"><span class="editor-brand-mark">P</span><span><b>PasarPintar</b><small>PORTAL MITRA UMKM</small></span></button>
      <div class="editor-shop-chip">◎ &nbsp; Koperasi Kopi Bajawa (Binaan)</div>
      <nav class="editor-sidebar-nav" aria-label="Navigasi toko">
        <button type="button" @click="emit('back')"><span>▦</span> Ringkasan Toko</button>
        <button type="button" class="active"><span>▤</span> Produk & Stok <i></i></button>
        <button type="button" @click="emit('back')"><span>▣</span> Pesanan Masuk <b>5</b></button>
        <button type="button" @click="emit('back')"><span>▧</span> Laporan Keuangan</button>
        <button type="button" @click="emit('back')"><span>♧</span> Profil Toko & Kurir</button>
        <button type="button" @click="emit('back')"><span>▱</span> Pusat Edukasi UMKM</button>
      </nav>
      <div class="editor-sidebar-footer"><span><b>Kuota Katalog Produk</b><strong>42 / 50</strong></span><i><b></b></i><button type="button" @click="notify('Toko publik dibuka pada tab pratinjau.')">Kunjungi Toko Publik <span>↗</span></button></div>
    </aside>

    <section class="product-editor-main">
      <header class="editor-topbar">
        <label><span>⌕</span><input type="search" placeholder="Cari SKU, produk, pesanan..." aria-label="Cari SKU, produk, pesanan" /></label>
        <button class="editor-add-button" type="button" @click="setMode('add')">＋ Tambah Produk</button>
        <button class="editor-notification" type="button" aria-label="Notifikasi" @click="notify('Tidak ada notifikasi baru.')">♧<i></i></button>
        <button class="editor-profile" type="button" @click="notify('Toko Bajawa berstatus buka.')"><b>Toko Bajawa</b><small>● Buka</small></button>
      </header>

      <div class="editor-page-content">
        <div class="editor-breadcrumb"><button type="button" @click="emit('back')">Katalog Baru UMKM</button><span>•</span><span>ID Draft: #DFT-BJ-8910</span></div>
        <header class="editor-page-heading">
          <div><h1>{{ mode === 'add' ? 'Tambah Produk Baru UMKM' : 'Edit Detail Produk UMKM' }}</h1><p>Lengkapi detail produk lokal Anda dengan foto autentik, varian, dan izin<br class="editor-desktop-break" /> sertifikasi resmi.</p></div>
          <div class="editor-heading-buttons"><button class="editor-draft-button" type="button" @click="saveDraft">▣ &nbsp; Batal / Simpan Draft</button><button class="editor-publish-button" type="button" @click="publishProduct">↗ &nbsp; {{ mode === 'add' ? 'Terbitkan Produk Sekarang' : 'Simpan Perubahan' }}</button></div>
        </header>

        <div class="editor-mode-control" role="group" aria-label="Mode produk"><button type="button" :class="{ active: mode === 'add' }" @click="setMode('add')">＋ Tambah produk</button><button type="button" :class="{ active: mode === 'edit' }" @click="setMode('edit')">✎ Edit produk tersimpan</button></div>

        <nav class="editor-steps" aria-label="Tahapan produk">
          <button v-for="step in [
            { number: 1, label: 'Informasi Dasar' }, { number: 2, label: 'Foto & Galeri Autentik' },
            { number: 3, label: 'Varian & Stok' }, { number: 4, label: 'Legalitas & Pengiriman' },
          ]" :key="step.number" type="button" :class="{ current: activeStep === step.number }" @click="goToStep(step.number)"><span>{{ step.number }}</span><i><small>LANGKAH {{ step.number }}</small><b>{{ step.label }}</b></i></button>
        </nav>

        <form class="editor-form" @submit.prevent="publishProduct">
          <div class="editor-primary-column">
            <section id="product-step-1" class="editor-form-panel basics-panel">
              <header class="editor-panel-heading"><span class="editor-heading-icon">▦</span><span><b>Informasi Dasar Produk</b><small>Detail utama yang memudahkan kurasi mitra dan penelusuran pembeli.</small></span><span class="editor-quality-badge">Wajib Diisi</span></header>
              <label class="editor-field name-field">Nama Produk <b>*</b><small>{{ productName.length }} / 100 karakter</small><input v-model="productName" maxlength="100" placeholder="Contoh: Kopi Arabika Flores Bajawa Full-Wash 250gr" /></label>
              <p class="editor-field-hint">Sertakan jenis produk, daerah asal, metode olah, dan bentuk untuk hasil pencarian terbaik.</p>
              <div class="editor-field-grid"><label class="editor-field">Kategori Utama <b>*</b><select v-model="category"><option value="">Pilih kategori</option><option>Kopi & Minuman Herbal</option><option>Makanan & Camilan</option><option>Wastra & Tenun</option><option>Kriya Rumah</option><option>Herbal & Perawatan</option></select></label><label class="editor-field">Sub-Kategori <b>*</b><select v-model="subcategory"><option value="">Pilih sub-kategori</option><option>Kopi Biji & Bubuk</option><option>Teh Herbal</option><option>Biji Kakao</option><option>Minuman Tradisional</option></select></label></div>
              <label class="editor-field">Asal Sentra Pengrajin / Komoditas Lokal <b>*</b><span class="editor-input-with-icon"><input v-model="origin" placeholder="Kabupaten / kota, provinsi" /><span>⌖</span></span><small class="field-success">✓ Terhubung dengan Program Klaster Binaan Kemenkop UKM</small></label>
              <label class="editor-field description-field">Deskripsi Lengkap Produk <b>*</b><div class="editor-rich-editor"><div class="rich-toolbar"><button type="button" aria-label="Tebal" @click="description += ' **teks tebal**'">B</button><button type="button" aria-label="Miring" @click="description += ' *teks miring*'">I</button><button type="button" aria-label="Garis bawah" @click="description += ' _teks_'">U</button><span></span><button type="button" aria-label="Daftar berpoin" @click="description += '\n• '">☷</button><button type="button" aria-label="Daftar bernomor" @click="description += '\n1. '">≡</button><button type="button" aria-label="Tambahkan tautan" @click="description += ' https://'">↗</button><button type="button" aria-label="Sisipkan tabel" @click="description += '\nDetail | Informasi'">▦</button></div><textarea v-model="description" rows="6" placeholder="Ceritakan bahan, proses pembuatan, keunggulan, dan cara penyimpanan produk."></textarea></div><small class="editor-description-hint">Format Markdown dan Rich Text didukung.</small></label>
            </section>

            <section id="product-step-2" class="editor-form-panel gallery-panel">
              <header class="editor-panel-heading"><span class="editor-heading-icon photo-icon">▣</span><span><b>Foto Produk & Galeri Autentik</b><small>Foto nyata tanpa rekayasa meningkatkan kepercayaan pembeli PasarPintar hingga 78%.</small></span><span class="editor-photo-count">{{ photos.length }} / 5 Foto<br />Terunggah</span></header>
              <aside class="editor-tip"><span>✧</span><div><b>Tips Foto UMKM PasarPintar</b><p>Gunakan pencahayaan alami di pagi hari, format rasio 1:1 resolusi minimal 800×800px. Tampilkan kemasan asli berdampingan dengan bahan baku untuk menonjolkan keaslian kreasi Anda.</p></div></aside>
              <div class="editor-photo-grid">
                <article v-for="(photo, index) in photos" :key="photo.src" class="editor-photo-tile" :class="{ cover: index === 0 }"><img :src="photo.src" :alt="photo.name" /><span v-if="index === 0" class="photo-cover-label">FOTO UTAMA (COVER)</span><span v-else class="photo-slot-label">Slot {{ index + 1 }}</span><button type="button" :aria-label="`Hapus ${photo.name}`" @click="removePhoto(index)">×</button><small>{{ photo.name }}</small></article>
                <button v-if="photos.length < 5" class="editor-photo-add" type="button" @click="choosePhotos"><span>▧</span><b>＋ Tambah Foto</b><small>JPG, PNG (Maks 5MB)</small></button>
              </div>
              <input ref="fileInput" class="editor-file-input" type="file" accept="image/png,image/jpeg,image/webp" multiple @change="handlePhotoSelection" />
              <p class="editor-upload-note">Foto ini akan tampil di etalase dan hasil pencarian utama.</p>
            </section>

            <section id="product-step-3" class="editor-form-panel variants-panel">
              <header class="editor-panel-heading"><span class="editor-heading-icon variant-icon">☷</span><span><b>Varian & Manajemen Stok</b><small>Kelola harga modal, harga jual, dan inventaris per spesifikasi ukuran dan gilingan.</small></span><label class="editor-switch-label"><input v-model="isVariantActive" type="checkbox" /><span class="editor-switch"></span><b>Varian<br />Aktif</b></label></header>
              <div class="editor-option-groups"><section v-for="(group, groupIndex) in optionGroups" :key="group.title"><header><b>{{ group.title }}</b><button type="button" @click="optionGroups.splice(groupIndex, 1)">Hapus Tipe</button></header><div><span v-for="(option, optionIndex) in group.options" :key="`${groupIndex}-${optionIndex}`" class="editor-option-chip">{{ option }} <button type="button" :aria-label="`Hapus opsi ${option}`" @click="removeOption(groupIndex, optionIndex)">×</button></span><button type="button" class="editor-add-option" @click="addOption(groupIndex)">＋ Opsi</button></div></section><button type="button" class="editor-add-group" @click="optionGroups.push({ title: `Tipe Varian ${optionGroups.length + 1}: Pilihan Baru`, options: [] })">＋ Tambah Tipe Varian</button></div>
              <div class="editor-variant-table-heading"><b>Matriks Harga, Modal & Inventaris SKU</b><small>Total {{ estimatedTotalStock }} Kombinasi (Menampilkan semua teratas)</small></div>
              <div class="editor-variant-table-wrap"><table class="editor-variant-table"><thead><tr><th>Kombinasi Varian</th><th>Harga Pokok (Modal)</th><th>Harga Jual Konsumen</th><th>Margin Bersih</th><th>Stok Pcs</th><th>SKU</th><th></th></tr></thead><tbody><tr v-for="(variant, index) in variants" :key="index"><td><input v-model="variant.name" :aria-label="`Nama varian ${index + 1}`" placeholder="Nama varian" /></td><td><label>Rp <input type="number" min="0" value="50000" :aria-label="`Harga modal ${index + 1}`" /></label></td><td><label>Rp <input v-model.number="variant.price" type="number" min="0" :aria-label="`Harga jual ${index + 1}`" /></label></td><td class="margin-cell">+26.4%</td><td><input v-model.number="variant.stock" type="number" min="0" :aria-label="`Stok varian ${index + 1}`" /></td><td><span class="sku-cell">{{ variant.sku || 'SKU otomatis' }}</span></td><td><button type="button" class="remove-variant" :aria-label="`Hapus varian ${index + 1}`" @click="removeVariant(index)">×</button></td></tr></tbody></table></div>
              <div class="editor-variant-footer"><small>* Harga jual di atas belum termasuk potongan subsidi voucher ongkir UMKM.</small><button type="button" @click="addVariant">Atur Harga Massal Sekaligus &nbsp;↗</button></div>
            </section>

            <section id="product-step-4" class="editor-form-panel legal-panel">
              <header class="editor-panel-heading"><span class="editor-heading-icon legal-icon">♧</span><span><b>Legalitas, Sertifikasi & Logistik</b><small>Produk tersertifikasi mendapat kepercayaan lebih tinggi dan prioritas etalase B2B PasarPintar.</small></span><span class="editor-verified">✓ Mitra<br />Tervalidasi</span></header>
              <div class="editor-field-grid"><label class="editor-field">Nomor Induk Berusaha (NIB) / P-IRT <b>*</b><span class="editor-input-with-icon"><span>▣</span><input v-model="nib" inputmode="numeric" placeholder="Nomor induk berusaha" /></span><small class="field-success">✓ Terhubung OSS RI & Dinas Koperasi UMKM</small></label><label class="editor-field">Sertifikasi Halal Indonesia (BPJPH) <small>Opsional</small><span class="editor-input-with-icon"><span>♧</span><input v-model="halalNumber" placeholder="Nomor sertifikat halal" /></span><small>Lencana Halal otomatis disematkan pada etalase produk.</small></label></div>
              <section class="editor-package-panel"><header><b>▣ &nbsp; Berat Paket & Dimensi Pengiriman</b><small>Termasuk Packaging Ramah Lingkungan</small></header><div><label>Berat Kotor (Gram)<span><input v-model.number="packageWeight" type="number" min="1" /> gr</span></label><label>Panjang (P)<span><input v-model.number="packageLength" type="number" min="1" /> cm</span></label><label>Lebar (L)<span><input v-model.number="packageWidth" type="number" min="1" /> cm</span></label><label>Tinggi (T)<span><input v-model.number="packageHeight" type="number" min="1" /> cm</span></label></div></section>
              <div class="editor-courier-heading">Kurir Logistik yang Didukung (Drop-off & Pick-up Flores)</div><div class="editor-courier-list"><button v-for="courier in supportedCouriers" :key="courier" type="button" :class="{ selected: activeCouriers.includes(courier) }" :aria-pressed="activeCouriers.includes(courier)" @click="toggleCourier(courier)"><i></i><b>{{ courier }}</b><small>{{ courier === 'J&T Express' ? 'Drop Point 1.2km' : courier === 'SiCepat Cargo' ? 'Pick-up Harian' : courier === 'JNE OKE/REG' ? 'Agen Bajawa' : 'Pelosi & Desa' }}</small></button></div>
            </section>
            <p v-if="formError" class="editor-form-error" role="alert">{{ formError }}</p>
          </div>

          <aside class="editor-aside-column">
            <section class="editor-completeness-card"><header><b>Kelengkapan Produk</b><strong>{{ qualityScore }}%</strong></header><div class="editor-progress"><i :style="{ width: `${qualityScore}%` }"></i></div><ul><li v-for="item in completenessItems" :key="item.label" :class="{ complete: item.complete }"><span>{{ item.complete ? '✓' : '○' }}</span>{{ item.label }}</li></ul></section>
            <section class="editor-preview-card"><header><small>PRATINJAU KARTU PEMBELI</small><button type="button" @click="previewProduct">◉ Tampilan Publik</button></header><div class="buyer-product-card"><div class="buyer-product-image"><img :src="currentCover" :alt="productName || 'Foto produk'" /><span>UMKM Unggulan</span><b>♡</b></div><div class="buyer-product-info"><small>⌖ Kab. Ngada, Flores</small><b>{{ productName || 'Nama produk baru' }}</b><span>★ 4.9 &nbsp; • &nbsp; Stok {{ estimatedTotalStock }} Pcs</span><strong>{{ formatRupiah(previewPrice) }}</strong><del>Rp 80.000</del><button type="button" aria-label="Tambah ke keranjang pratinjau" @click="notify('Pratinjau kartu pembeli.')">▣</button></div></div><p>Pratinjau dinamis diperbarui berdasarkan isian formulir di sebelah kiri.</p></section>
            <section class="editor-help-card"><span>✧</span><div><b>Butuh Bantuan Kurasi?</b><p>Fasilitator UMKM PasarPintar Wilayah Tenggara Timur siap membantu foto produk gratis & pendaftaran nomor P-IRT Kemenkes.</p><button type="button" @click="notify('Permintaan bantuan kurasi telah dikirim.')">Hubungi Pendamping Lapangan →</button></div></section>
          </aside>
        </form>
      </div>

      <footer class="editor-sticky-footer"><span><i></i> Status: Draft Tersimpan Otomatis</span><small>• &nbsp; 1 Menit Lalu di Server Bajawa</small><div><button type="button" @click="saveDraft">▣ &nbsp; Simpan Draft</button><button type="button" @click="previewProduct">◉ &nbsp; Pratinjau Halaman</button><button type="button" class="footer-publish" @click="publishProduct">✓ &nbsp; Terbitkan Produk ke Marketplace</button></div></footer>
      <div v-if="toastMessage" class="editor-toast" role="status">✓ &nbsp; {{ toastMessage }}</div>
      <span v-if="copiedSku" class="sr-only" aria-live="polite">SKU disalin</span>
    </section>
  </main>
</template>

<style scoped>
.product-editor-shell { width: 100%; min-width: 0; min-height: 100vh; display: grid; grid-template-columns: 242px minmax(0, 1fr); overflow-x: clip; color: #263a2f; background: #eff9f0; font-family: 'Poppins', sans-serif; font-size: 12px; }
.product-editor-sidebar { min-width: 0; min-height: 100vh; position: sticky; top: 0; display: flex; flex-direction: column; padding: 17px 14px 14px; border-right: 1px solid #dcebe0; background: #eaf6ec; }
.editor-brand { display: flex; align-items: center; gap: 9px; padding: 0 8px; border: 0; background: transparent; text-align: left; cursor: pointer; }.editor-brand-mark { width: 33px; height: 33px; display: grid; place-items: center; border-radius: 8px; color: #fff; background: #087b61; font-size: 17px; font-weight: 800; }.editor-brand > span:last-child { display: flex; flex-direction: column; gap: 2px; }.editor-brand b { color: #087b61; font-size: 14px; }.editor-brand small { color: #77897d; font-size: 11px; font-weight: 700; letter-spacing: .5px; }
.editor-shop-chip { align-self: flex-start; margin: 20px 3px 18px; padding: 7px 8px; border-radius: 16px; color: #3a775e; background: #d9eee1; font-size: 12px; }.editor-sidebar-nav { display: flex; flex-direction: column; gap: 5px; }.editor-sidebar-nav button { min-height: 36px; display: flex; align-items: center; gap: 9px; padding: 0 9px; border: 0; border-radius: 6px; color: #465b4d; background: transparent; text-align: left; font-size: 12px; cursor: pointer; }.editor-sidebar-nav button > span { width: 14px; color: #687e70; font-size: 13px; text-align: center; }.editor-sidebar-nav button.active { color: #fff; background: #087b61; font-weight: 700; }.editor-sidebar-nav button.active > span { color: #fff; }.editor-sidebar-nav button > i { width: 6px; height: 6px; margin-left: auto; border-radius: 50%; background: #76d2ad; }.editor-sidebar-nav button > b { min-width: 16px; height: 16px; display: grid; place-items: center; margin-left: auto; border-radius: 9px; color: #fff; background: #e65d3e; font-size: 12px; }.editor-sidebar-footer { margin-top: auto; padding: 11px; border: 1px solid #dfebe2; border-radius: 8px; background: #fff; }.editor-sidebar-footer > span { display: flex; justify-content: space-between; font-size: 12px; }.editor-sidebar-footer > span strong { color: #087b61; }.editor-sidebar-footer > i { height: 4px; display: block; margin: 8px 0; border-radius: 5px; background: #e5efe7; }.editor-sidebar-footer > i b { width: 84%; height: 100%; display: block; border-radius: inherit; background: #138366; }.editor-sidebar-footer > button { width: 100%; display: flex; justify-content: space-between; padding: 4px 0 0; border: 0; color: #087b61; background: transparent; text-align: left; font-size: 12px; font-weight: 700; cursor: pointer; }
.product-editor-main { min-width: 0; position: relative; padding-bottom: 65px; }.editor-topbar { height: 55px; display: flex; align-items: center; gap: 14px; padding: 0 18px; border-bottom: 1px solid #e0ece2; background: #fbfefb; }.editor-topbar > label { width: min(330px, 42vw); height: 32px; display: flex; align-items: center; gap: 8px; padding: 0 9px; border-radius: 5px; color: #798b80; background: #eff7f0; }.editor-topbar > label span { font-size: 16px; }.editor-topbar input { width: 100%; border: 0; outline: 0; color: #43584a; background: transparent; font-size: 12px; }.editor-add-button, .editor-publish-button { min-height: 30px; padding: 0 11px; border: 0; border-radius: 5px; color: #fff; background: #087b61; font-size: 12px; font-weight: 700; cursor: pointer; }.editor-add-button { margin-left: auto; }.editor-notification { width: 25px; height: 30px; position: relative; border: 0; color: #324c3e; background: transparent; font-size: 14px; cursor: pointer; }.editor-notification i { width: 5px; height: 5px; position: absolute; top: 5px; right: 3px; border-radius: 50%; background: #df6249; }.editor-profile { display: flex; flex-direction: column; gap: 2px; padding: 0 0 0 10px; border: 0; border-left: 1px solid #e2ece4; color: #34493c; background: transparent; font-size: 12px; text-align: left; cursor: pointer; }.editor-profile small { color: #148362; font-size: 11px; }
.editor-page-content { width: min(1480px, 100%); margin-inline: auto; padding: 15px 18px 28px; }.editor-breadcrumb { display: flex; align-items: center; gap: 7px; color: #7a8b80; font-size: 12px; }.editor-breadcrumb button { padding: 0; border: 0; color: #087b61; background: transparent; font-size: inherit; cursor: pointer; }.editor-page-heading { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin: 7px 0 14px; }.editor-page-heading h1 { margin: 0 0 4px; color: #20372b; font-size: clamp(19px, 1.65vw, 24px); line-height: 1.2; }.editor-page-heading p { margin: 0; color: #75877b; font-size: 12px; line-height: 1.5; }.editor-heading-buttons { display: flex; align-items: center; gap: 7px; }.editor-heading-buttons button { min-height: 34px; max-width: 140px; padding: 0 10px; border: 0; border-radius: 5px; font-size: 12px; font-weight: 700; cursor: pointer; }.editor-draft-button { color: #42594a; background: #e7f0e8; }.editor-publish-button { color: #fff; background: #087b61; }.editor-mode-control { display: flex; gap: 5px; margin: -3px 0 11px; }.editor-mode-control button { min-height: 25px; padding: 0 9px; border: 1px solid #dce9df; border-radius: 14px; color: #687b6f; background: #f8fcf8; font-size: 12px; cursor: pointer; }.editor-mode-control button.active { border-color: #087b61; color: #087b61; background: #e5f3e9; font-weight: 700; }
.editor-steps { min-height: 43px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: center; gap: 7px; margin-bottom: 13px; padding: 5px 8px; border: 1px solid #e2ede4; border-radius: 7px; background: #fff; }.editor-steps button { min-width: 0; min-height: 31px; display: flex; align-items: center; gap: 7px; padding: 4px 6px; border: 0; border-radius: 5px; color: #6d8074; background: transparent; text-align: left; cursor: pointer; }.editor-steps button.current { color: #087b61; background: #e7f4ea; }.editor-steps button > span { width: 17px; height: 17px; flex: none; display: grid; place-items: center; border-radius: 50%; color: #586e5e; background: #dce9df; font-size: 12px; font-weight: 700; }.editor-steps button.current > span { color: #fff; background: #087b61; }.editor-steps button > i { min-width: 0; display: flex; flex-direction: column; gap: 1px; font-style: normal; }.editor-steps button small { font-size: 10px; }.editor-steps button b { overflow: hidden; color: #31483a; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }.editor-steps button.current b { color: #087b61; }
.editor-form { display: grid; grid-template-columns: minmax(0, 1fr) 235px; align-items: start; gap: 16px; }.editor-primary-column { min-width: 0; display: flex; flex-direction: column; gap: 15px; }.editor-form-panel, .editor-completeness-card, .editor-preview-card, .editor-help-card { border: 1px solid #e3eee5; border-radius: 8px; background: #fff; }.editor-form-panel { padding: 15px 17px; scroll-margin-top: 12px; }.editor-panel-heading { display: flex; align-items: center; gap: 9px; margin-bottom: 15px; }.editor-heading-icon { width: 22px; height: 22px; flex: none; display: grid; place-items: center; border-radius: 6px; color: #087b61; background: #e6f5e9; font-size: 12px; }.editor-panel-heading > span:nth-child(2) { min-width: 0; display: flex; flex: 1; flex-direction: column; gap: 3px; }.editor-panel-heading > span:nth-child(2) b { color: #304739; font-size: 12px; }.editor-panel-heading > span:nth-child(2) small { color: #7c8b81; font-size: 11px; line-height: 1.4; }.editor-quality-badge { padding: 4px 7px; border-radius: 10px; color: #338666; background: #e7f4e9; font-size: 10px; font-weight: 700; }.editor-field { min-width: 0; display: flex; flex-direction: column; gap: 5px; margin-top: 11px; color: #3d5245; font-size: 12px; font-weight: 600; }.editor-field > b { display: inline; color: #d54f36; }.editor-field small { color: #87948b; font-size: 10px; font-weight: 400; }.name-field { position: relative; padding-top: 2px; }.name-field > small:first-of-type { position: absolute; top: 0; right: 0; }.editor-field input, .editor-field select { width: 100%; min-width: 0; height: 30px; padding: 0 9px; border: 1px solid transparent; border-radius: 6px; outline-color: #80b99a; color: #344a3b; background: #eef7ef; font-size: 12px; font-weight: 400; }.editor-field input:focus, .editor-field select:focus, .editor-variant-table input:focus { border-color: #83b99b; outline: 2px solid #e3f3e7; }.editor-field-hint { margin: 5px 0 0; color: #98a49c; font-size: 10px; }.editor-field-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }.editor-input-with-icon { display: flex; align-items: center; gap: 7px; padding: 0 9px; border-radius: 6px; color: #638271; background: #eef7ef; }.editor-input-with-icon > input { padding: 0; background: transparent; }.editor-input-with-icon > span { flex: none; font-size: 12px; }.field-success { color: #16895f !important; }.description-field { margin-top: 13px; }.editor-rich-editor { overflow: hidden; border-radius: 6px; background: #eef7ef; }.rich-toolbar { min-height: 27px; display: flex; align-items: center; gap: 6px; padding: 0 8px; border-bottom: 1px solid #dfece1; }.rich-toolbar button { min-width: 15px; height: 19px; padding: 0; border: 0; color: #3d5345; background: transparent; font-size: 12px; font-weight: 700; cursor: pointer; }.rich-toolbar span { width: 1px; height: 15px; margin: 0 2px; background: #d0dfd4; }.editor-rich-editor textarea { width: 100%; min-height: 112px; display: block; resize: vertical; padding: 9px; border: 0; outline: 0; color: #52685a; background: transparent; font-size: 12px; line-height: 1.7; }.editor-description-hint { align-self: flex-end; color: #92a097; font-size: 10px; font-weight: 400; }
.photo-icon { color: #c96734; background: #ffeadb; }.editor-photo-count { padding: 4px 6px; border-radius: 10px; color: #16825f; background: #e8f4e9; font-size: 10px; font-weight: 700; }.editor-tip { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; padding: 9px; border-radius: 6px; color: #496353; background: #e9f5e9; }.editor-tip > span { color: #087b61; font-size: 12px; }.editor-tip b { font-size: 11px; }.editor-tip p { margin: 4px 0 0; color: #708276; font-size: 10px; line-height: 1.55; }.editor-photo-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }.editor-photo-tile { height: 91px; position: relative; overflow: hidden; border-radius: 6px; background: #e5eee6; }.editor-photo-tile.cover { height: 145px; grid-row: span 2; }.editor-photo-tile > img { width: 100%; height: 100%; display: block; object-fit: cover; }.editor-photo-tile::after { position: absolute; inset: 0; background: linear-gradient(180deg, #132e241c, transparent 35%, #132e2470); content: ''; pointer-events: none; }.editor-photo-tile > span { position: absolute; z-index: 1; top: 5px; left: 5px; padding: 3px 5px; border-radius: 3px; color: #fff; background: #087b61e8; font-size: 9px; font-weight: 700; }.editor-photo-tile > span.photo-slot-label { background: #283d32b8; }.editor-photo-tile > button { width: 17px; height: 17px; position: absolute; z-index: 2; top: 4px; right: 4px; border: 0; border-radius: 50%; color: white; background: #dd5947; font-size: 12px; cursor: pointer; }.editor-photo-tile > small { position: absolute; z-index: 1; right: 5px; bottom: 5px; left: 5px; overflow: hidden; color: white; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.editor-photo-add { min-height: 82px; display: flex; grid-column: 3; flex-direction: column; align-items: center; justify-content: center; gap: 5px; border: 1px dashed #c7ddce; border-radius: 6px; color: #3e7055; background: #f2f8f2; cursor: pointer; }.editor-photo-add > span { font-size: 14px; }.editor-photo-add b { font-size: 11px; }.editor-photo-add small { color: #85958b; font-size: 10px; }.editor-file-input { display: none; }.editor-upload-note { margin: 7px 0 0; color: #849288; font-size: 10px; }
.variant-icon { color: #d96443; background: #fff0e8; }.editor-switch-label { display: flex; align-items: center; gap: 6px; color: #385040; font-size: 10px; cursor: pointer; }.editor-switch-label > input { position: absolute; opacity: 0; }.editor-switch { width: 27px; height: 15px; position: relative; border-radius: 9px; background: #b7c7bb; transition: background .15s; }.editor-switch::after { width: 11px; height: 11px; position: absolute; top: 2px; left: 2px; border-radius: 50%; background: white; content: ''; transition: transform .15s; }.editor-switch-label input:checked + .editor-switch { background: #087b61; }.editor-switch-label input:checked + .editor-switch::after { transform: translateX(12px); }.editor-option-groups { display: flex; flex-direction: column; gap: 8px; padding: 10px; border-radius: 6px; background: #eaf5eb; }.editor-option-groups section > header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }.editor-option-groups section > header b { font-size: 11px; font-weight: 600; }.editor-option-groups section > header button { padding: 0; border: 0; color: #dc5d3f; background: transparent; font-size: 10px; cursor: pointer; }.editor-option-groups section > div { display: flex; flex-wrap: wrap; gap: 5px; }.editor-option-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 6px; border-radius: 4px; color: #43584a; background: white; font-size: 10px; }.editor-option-chip button { padding: 0; border: 0; color: #7a8b80; background: transparent; cursor: pointer; }.editor-add-option, .editor-add-group { min-height: 20px; padding: 0 7px; border: 0; border-radius: 4px; color: #087b61; background: #deeee2; font-size: 10px; cursor: pointer; }.editor-add-group { align-self: flex-start; background: white; }.editor-variant-table-heading { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; margin: 12px 0 7px; }.editor-variant-table-heading b { font-size: 11px; }.editor-variant-table-heading small { color: #829087; font-size: 10px; }.editor-variant-table-wrap { overflow-x: auto; border-radius: 5px; }.editor-variant-table { width: 100%; min-width: 580px; border-collapse: collapse; background: #eaf5eb; }.editor-variant-table th { padding: 7px 5px; color: #43594b; font-size: 10px; text-align: left; font-weight: 600; }.editor-variant-table td { padding: 5px; border-top: 1px solid #dbe9de; }.editor-variant-table td:first-child { max-width: 105px; color: #455c4c; font-size: 10px; }.editor-variant-table td > input, .editor-variant-table td label { width: 100%; min-width: 42px; height: 22px; display: flex; align-items: center; gap: 3px; padding: 0 5px; border: 1px solid transparent; border-radius: 4px; color: #52675a; background: white; font-size: 10px; }.editor-variant-table td label input { width: 100%; min-width: 0; border: 0; outline: 0; color: #3a5444; font-size: 10px; }.editor-variant-table input::-webkit-inner-spin-button { appearance: none; }.editor-variant-table .margin-cell { color: #208a5c; font-size: 10px; white-space: nowrap; }.sku-cell { display: block; min-width: 68px; overflow: hidden; color: #728277; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }.remove-variant { width: 16px; height: 16px; border: 0; border-radius: 50%; color: #c95740; background: #fbe7df; cursor: pointer; }.editor-variant-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 7px; }.editor-variant-footer small { color: #849188; font-size: 10px; }.editor-variant-footer button { padding: 0; border: 0; color: #087b61; background: transparent; font-size: 10px; font-weight: 700; cursor: pointer; }
.legal-icon { color: #1a9a76; background: #ddf5ee; }.editor-verified { padding: 4px 7px; border-radius: 10px; color: #188965; background: #e4f5e9; font-size: 10px; font-weight: 700; }.editor-field-grid .editor-field > small:not(.field-success) { margin-left: auto; }.editor-package-panel { margin-top: 13px; padding: 10px; border-radius: 6px; background: #eaf5eb; }.editor-package-panel > header { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 8px; }.editor-package-panel > header b { color: #40584a; font-size: 11px; }.editor-package-panel > header small { color: #7a897f; font-size: 10px; }.editor-package-panel > div { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; }.editor-package-panel label { display: flex; flex-direction: column; gap: 4px; color: #77887d; font-size: 10px; }.editor-package-panel label > span { height: 24px; display: flex; align-items: center; gap: 3px; padding: 0 5px; border-radius: 4px; color: #77887d; background: white; font-size: 10px; }.editor-package-panel input { width: 100%; min-width: 0; border: 0; outline: 0; color: #43594a; background: transparent; text-align: right; font-size: 11px; }.editor-courier-heading { margin: 13px 0 6px; color: #40564a; font-size: 11px; font-weight: 600; }.editor-courier-list { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }.editor-courier-list button { min-height: 47px; display: grid; grid-template-columns: 8px minmax(0, 1fr); align-content: center; gap: 2px 5px; padding: 5px; border: 1px solid transparent; border-radius: 5px; color: #728278; background: #f3f7f3; text-align: left; cursor: pointer; }.editor-courier-list button.selected { border-color: transparent; color: #41594a; background: #e9f5eb; }.editor-courier-list button > i { width: 8px; height: 8px; grid-row: span 2; align-self: center; border: 1px solid #b5c5b8; border-radius: 2px; background: white; }.editor-courier-list button.selected > i { border-color: #1384c0; background: #1384c0; box-shadow: inset 0 0 0 2px white; }.editor-courier-list button > b { font-size: 10px; }.editor-courier-list button > small { color: #87948a; font-size: 9px; }
.editor-aside-column { display: flex; flex-direction: column; gap: 12px; }.editor-completeness-card { padding: 13px; }.editor-completeness-card > header { display: flex; align-items: center; justify-content: space-between; }.editor-completeness-card > header b { color: #304638; font-size: 12px; }.editor-completeness-card > header strong { color: #087b61; font-size: 12px; }.editor-progress { height: 5px; margin: 9px 0 10px; overflow: hidden; border-radius: 5px; background: #e4ece5; }.editor-progress i { height: 100%; display: block; border-radius: inherit; background: #087b61; transition: width .2s; }.editor-completeness-card ul { display: flex; flex-direction: column; gap: 7px; margin: 0; padding: 0; list-style: none; }.editor-completeness-card li { display: flex; align-items: flex-start; gap: 5px; color: #87948a; font-size: 10px; line-height: 1.4; }.editor-completeness-card li > span { color: #96a59b; }.editor-completeness-card li.complete, .editor-completeness-card li.complete > span { color: #118660; }.editor-preview-card { padding: 10px; }.editor-preview-card > header { display: flex; align-items: center; justify-content: space-between; gap: 5px; margin-bottom: 8px; }.editor-preview-card > header small { color: #839087; font-size: 10px; }.editor-preview-card > header button { padding: 0; border: 0; color: #198964; background: transparent; font-size: 10px; cursor: pointer; }.buyer-product-card { overflow: hidden; border: 1px solid #e5ece6; border-radius: 6px; background: white; }.buyer-product-image { height: 150px; position: relative; overflow: hidden; background: #eceee5; }.buyer-product-image > img { width: 100%; height: 100%; display: block; object-fit: cover; }.buyer-product-image > span { position: absolute; top: 8px; left: 7px; padding: 3px 6px; border-radius: 10px; color: #fff; background: #087b61; font-size: 10px; font-weight: 700; }.buyer-product-image > b { width: 18px; height: 18px; position: absolute; top: 6px; right: 6px; display: grid; place-items: center; border-radius: 50%; color: #708076; background: #fff; font-size: 12px; }.buyer-product-info { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 9px; }.buyer-product-info > small { color: #849187; font-size: 10px; }.buyer-product-info > b { display: -webkit-box; overflow: hidden; color: #354a3c; font-size: 12px; line-height: 1.45; line-clamp: 2; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }.buyer-product-info > span { color: #887349; font-size: 10px; }.buyer-product-info > strong { margin-top: 3px; color: #087b61; font-size: 12px; }.buyer-product-info > del { color: #96a199; font-size: 10px; }.buyer-product-info > button { width: 20px; height: 20px; position: absolute; right: 8px; bottom: 10px; border: 0; border-radius: 5px; color: #087b61; background: #e7f4e9; cursor: pointer; }.editor-preview-card > p { margin: 7px 0 0; color: #87948a; font-size: 10px; font-style: italic; line-height: 1.5; text-align: center; }.editor-help-card { display: flex; align-items: flex-start; gap: 7px; padding: 11px; background: #edf8ee; }.editor-help-card > span { color: #138567; font-size: 13px; }.editor-help-card > div > b { color: #3d5647; font-size: 12px; }.editor-help-card p { margin: 5px 0; color: #728379; font-size: 10px; line-height: 1.55; }.editor-help-card button { padding: 0; border: 0; color: #087b61; background: transparent; font-size: 10px; font-weight: 700; cursor: pointer; }.editor-form-error { margin: 0; padding: 9px; border-radius: 5px; color: #a23e2c; background: #fff0ea; font-size: 12px; }
.editor-sticky-footer { min-height: 52px; position: fixed; z-index: 10; right: 0; bottom: 0; left: 242px; display: flex; align-items: center; gap: 14px; padding: 6px 18px; border-top: 1px solid #dce9de; background: #ffffffed; backdrop-filter: blur(8px); }.editor-sticky-footer > span { color: #4b6554; font-size: 11px; }.editor-sticky-footer > span i { width: 6px; height: 6px; display: inline-block; margin-right: 4px; border-radius: 50%; background: #1a9b65; }.editor-sticky-footer > small { color: #87948b; font-size: 10px; }.editor-sticky-footer > div { display: flex; gap: 6px; margin-left: auto; }.editor-sticky-footer button { min-height: 30px; padding: 0 9px; border: 0; border-radius: 5px; color: #4d6255; background: #e9f1e9; font-size: 11px; cursor: pointer; }.editor-sticky-footer button.footer-publish { color: white; background: #087b61; font-weight: 700; }.editor-toast { position: fixed; z-index: 20; right: 18px; bottom: 64px; max-width: min(390px, calc(100vw - 30px)); padding: 10px 13px; border: 1px solid #d4e8d9; border-radius: 6px; color: #24533b; background: #f7fff8; box-shadow: 0 8px 24px #17362920; font-size: 12px; }.sr-only { width: 1px; height: 1px; position: absolute; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; }
@media (min-width: 1500px) { .product-editor-shell { grid-template-columns: 250px minmax(0, 1fr); }.editor-page-content { padding-inline: 22px; }.editor-form { grid-template-columns: minmax(0, 1fr) 270px; gap: 18px; }.editor-sticky-footer { left: 250px; } }
@media (max-width: 1100px) { .product-editor-shell { grid-template-columns: 205px minmax(0, 1fr); }.editor-page-content { padding-inline: 13px; }.editor-form { grid-template-columns: minmax(0, 1fr) 205px; gap: 10px; }.editor-sticky-footer { left: 205px; padding-inline: 12px; }.editor-form-panel { padding: 12px; }.editor-variant-table { min-width: 540px; } }
@media (max-width: 820px) { .product-editor-shell { grid-template-columns: minmax(0, 1fr); }.product-editor-sidebar { min-width: 0; min-height: 0; position: static; padding: 10px 12px; border-right: 0; border-bottom: 1px solid #dcebe0; }.editor-brand { align-self: flex-start; }.editor-shop-chip { max-width: 100%; margin: 8px 2px; }.editor-sidebar-nav { width: 100%; min-width: 0; flex-direction: row; overflow-x: auto; }.editor-sidebar-nav button { min-width: max-content; }.editor-sidebar-footer { display: none; }.editor-sticky-footer { left: 0; }.editor-form { grid-template-columns: minmax(0, 1fr) 220px; } }
@media (max-width: 650px) { .editor-topbar { height: 49px; gap: 6px; padding-inline: 9px; }.editor-topbar > label { width: auto; flex: 1; }.editor-add-button { padding-inline: 7px; font-size: 11px; }.editor-profile { display: none; }.editor-page-content { padding: 11px 9px 24px; }.editor-page-heading { align-items: flex-start; flex-direction: column; }.editor-page-heading h1 { font-size: 19px; }.editor-page-heading p { font-size: 12px; }.editor-desktop-break { display: none; }.editor-heading-buttons { width: 100%; }.editor-heading-buttons button { max-width: none; flex: 1; }.editor-mode-control { margin-top: 0; }.editor-steps { gap: 2px; padding-inline: 3px; }.editor-steps button { gap: 4px; padding-inline: 3px; }.editor-steps button > span { width: 15px; height: 15px; font-size: 11px; }.editor-steps button b { font-size: 10px; }.editor-steps button small { font-size: 9px; }.editor-form { grid-template-columns: 1fr; }.editor-aside-column { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }.editor-completeness-card { grid-column: 1 / -1; }.editor-preview-card { grid-column: 1; }.editor-help-card { grid-column: 2; }.editor-sticky-footer { min-height: 49px; gap: 6px; padding: 5px 7px; }.editor-sticky-footer > span { max-width: 100px; font-size: 10px; }.editor-sticky-footer > small { display: none; }.editor-sticky-footer > div { gap: 4px; }.editor-sticky-footer button { min-height: 30px; padding: 0 6px; font-size: 10px; }.editor-photo-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }.editor-photo-tile.cover { grid-row: span 2; }.editor-photo-add { grid-column: 2; }.editor-courier-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }.editor-package-panel > div { grid-template-columns: repeat(2, minmax(0, 1fr)); }.editor-field-grid { gap: 6px; }.editor-field { font-size: 11px; }.editor-form-panel { padding: 11px; }.editor-panel-heading > span:nth-child(2) b { font-size: 12px; }.editor-variant-footer { align-items: flex-start; flex-direction: column; } }
@media (max-width: 390px) { .editor-aside-column { grid-template-columns: 1fr; }.editor-completeness-card, .editor-preview-card, .editor-help-card { grid-column: 1; }.editor-preview-card { width: min(100%, 250px); }.editor-steps button > i { overflow: hidden; }.editor-heading-buttons button { padding-inline: 5px; font-size: 11px; }.editor-sticky-footer > span { display: none; }.editor-sticky-footer > div { width: 100%; }.editor-sticky-footer button { flex: 1; }.editor-photo-grid { gap: 5px; } }
@media (min-width: 1101px) { .editor-form { grid-template-columns: minmax(0, 1fr) minmax(270px, 31%); } }
</style>