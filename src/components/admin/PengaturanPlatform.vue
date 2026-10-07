<script setup lang="ts">
import { ref } from 'vue'
import AdminAnalytics from './AnalisisAdmin.vue'
import UserAccessManagement from './KelolaAksesPengguna.vue'
import CategoryRegionManagement from './KelolaKategoriWilayah.vue'
import EscrowMonitoring from './PantauRekber.vue'
import ProductCurationManagement from './KurasiProduk.vue'
import StoreLegalityDetail from './DetailLegalitasToko.vue'
import PlatformSummary from './RingkasanPlatform.vue'
import DisbursementGbbiSubsidy from './PencairanSubsidiGbbi.vue'
import PlatformAuditReports from './LaporanAuditPlatform.vue'
import ApiOssBankIntegration from './IntegrasiApiOssBank.vue'

const emit = defineEmits<{ backToStore: [] }>()
const activeSection = ref('Pengaturan Platform')
const activeTab = ref('Subsidi Kargo & Afirmasi 3T')
const subsidyEnabled = ref(true)
const subsidyPercent = ref(65)
const subsidyNominal = ref(150000)
const apiEnabled = ref([true, true, true, true])
const verificationHours = ref(24)
const moderationHours = ref(12)
const autoReleaseHours = ref(48)
const disputeHours = ref(24)
const twoFactorEnabled = ref(true)
const retentionDays = ref(365)
const backupEnabled = ref(true)
const selectedRegions = ref(['NTT: Ende, Ngada, Alor', 'Maluku: Tual, Seram Bagian Barat', 'Papua: Jayawijaya, Wamena, Asmat', 'Riau & Kepri: Kep. Meranti, Natuna, Anambas', 'Sulteng: Banggai Laut, Morowali'])
const historyOpen = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

const navigation = [
  {
    group: 'UTAMA',
    items: [
      { id: 'Ringkasan Platform', label: 'Ringkasan', icon: '📊' },
      { id: 'Statistik & Analisis Nasional', label: 'Statistik & Analisis', icon: '📈' },
    ],
  },
  {
    group: 'MANAJEMEN',
    items: [
      { id: 'Verifikasi Toko & UMKM', label: 'Verifikasi Toko', icon: '🏬' },
      { id: 'Katalog & Kurasi Produk', label: 'Katalog & Kurasi', icon: '📦' },
      { id: 'Manajemen Pengguna', label: 'Pengguna', icon: '👥' },
      { id: 'Kategori & Sentra Daerah', label: 'Kategori & Sentra', icon: '🗺️' },
    ],
  },
  {
    group: 'TRANSAKSI',
    items: [
      { id: 'Monitoring Rekber', label: 'Monitoring Rekber', icon: '🛡️' },
      { id: 'Pencairan & Subsidi GBBI', label: 'Pencairan & Subsidi', icon: '💳' },
      { id: 'Laporan & Audit Platform', label: 'Laporan & Audit', icon: '📑' },
    ],
  },
  {
    group: 'KONFIGURASI',
    items: [
      { id: 'Integrasi API OSS/Bank', label: 'Integrasi API', icon: '🔌' },
      { id: 'Pengaturan Platform', label: 'Pengaturan', icon: '⚙️' },
    ],
  },
]
const tabs = [
  { label: 'Umum & Profil Platform', target: 'platform-overview', icon: '▱' },
  { label: 'Subsidi Kargo & Afirmasi 3T', target: 'subsidy-settings', icon: '▣' },
  { label: 'Integrasi API & Rekber Himbara', target: 'integrations', icon: '⌘' },
  { label: 'SLA Kurasi & Transaksi Escrow', target: 'service-levels', icon: '◷' },
  { label: 'Keamanan & Akses', target: 'security-settings', icon: '◈' },
]
const integrations = [
  { name: 'API OSS RBA Kemenves RI', description: 'Validasi NIB, risiko usaha & profil risiko usaha UMKM.', badge: 'Terhubung · API v2.1', icon: '◎' },
  { name: 'Bank Himbara Rekber', description: 'Penyimpanan dana dan pencairan otomatis ke mitra penjual.', badge: 'ISO 8583 · Host-to-Host', icon: '⌂' },
  { name: 'Multi-Kurir Logistik Webhook', description: 'Pos Indonesia, J&T Cargo, JNE, Lion Parcel, dan SiCepat.', badge: 'Aktif · 8 Mitra', icon: '▣' },
  { name: 'Integrasi Sertifikasi Halal & BPOM', description: 'Pengecekan keaslian nomor sertifikat dan legalitas produk.', badge: 'SHA-256 · SPP-IRT', icon: '◇' },
]
const auditEntries = [
  { name: 'Hendri Wijaya (Super Admin)', action: 'Mengubah', target: 'subsidi_kargo_max', value: 'Rp 140.000 → Rp 150.000', time: '26 Okt 2024, 09:15 WIB', tone: 'green' },
  { name: 'Siti Nurhaliza (SysAdmin)', action: 'Memperbarui', target: 'api_himbara.rekening', value: 'Produksi · Terenkripsi', time: '25 Okt 2024, 16:40 WIB', tone: 'blue' },
  { name: 'Raden Wicaksono (Platform Lead)', action: 'Menambahkan kluster daerah 3T:', target: 'Kepulauan Anambas & Natuna', value: 'ke subsidi afirmasi.', time: '24 Okt 2024, 11:20 WIB', tone: 'coral' },
]

function notify(message: string) {
  toastMessage.value = message
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastMessage.value = '' }, 2800)
}

function goToSection(label: string) {
  activeSection.value = label
  if (!['Pengaturan Platform', 'Statistik & Analisis Nasional', 'Manajemen Pengguna', 'Kategori & Sentra Daerah', 'Monitoring Rekber', 'Pencairan & Subsidi GBBI', 'Laporan & Audit Platform', 'Integrasi API OSS/Bank', 'Katalog & Kurasi Produk', 'Verifikasi Toko & UMKM', 'Ringkasan Platform'].includes(label)) notify(`${label} belum tersedia di pratinjau ini.`)
}

function selectTab(tab: (typeof tabs)[number]) {
  activeTab.value = tab.label
  document.getElementById(tab.target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function addRegion() {
  const region = 'Papua Barat: Sorong, Raja Ampat'
  if (!selectedRegions.value.includes(region)) selectedRegions.value.push(region)
  notify('Kluster Papua Barat ditambahkan.')
}

function saveChanges() {
  notify('Perubahan konfigurasi berhasil disimpan.')
}

function resetDefaults() {
  subsidyEnabled.value = true
  subsidyPercent.value = 65
  subsidyNominal.value = 150000
  apiEnabled.value = [true, true, true, true]
  verificationHours.value = 24
  moderationHours.value = 12
  autoReleaseHours.value = 48
  disputeHours.value = 24
  twoFactorEnabled.value = true
  retentionDays.value = 365
  backupEnabled.value = true
  selectedRegions.value = ['NTT: Ende, Ngada, Alor', 'Maluku: Tual, Seram Bagian Barat', 'Papua: Jayawijaya, Wamena, Asmat', 'Riau & Kepri: Kep. Meranti, Natuna, Anambas', 'Sulteng: Banggai Laut, Morowali']
  notify('Konfigurasi dikembalikan ke nilai default.')
}
</script>

<template>
  <main class="admin-shell">
    <aside class="admin-sidebar">
      <button class="admin-brand" type="button" aria-label="Kembali ke PasarPintar" @click="emit('backToStore')">
        <span class="admin-brand-mark">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1.2 10H5.2L4 9Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3M9 13h6M9 16h6"/></svg>
        </span>
        <span><b>PasarPintar</b><small>ADMIN CONSOLE</small></span>
      </button>
      <nav class="admin-nav" aria-label="Navigasi admin">
        <section v-for="group in navigation" :key="group.group">
          <h2>{{ group.group }}</h2>
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            :class="{ selected: activeSection === item.id }"
            :aria-current="activeSection === item.id ? 'page' : undefined"
            @click="goToSection(item.id)"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </button>
        </section>
      </nav>
      <div class="sidebar-bottom">
        <button type="button" class="btn-marketplace-link" @click="emit('backToStore')">
          Kunjungi Marketplace ↗
        </button>
      </div>
    </aside>

    <section class="admin-workspace">
      <header class="admin-topbar">
        <label class="admin-search">
          <span>⌕</span>
          <input type="search" placeholder="Cari toko UMKM, NIB, transaksi, produk..." aria-label="Cari di konsol admin"/>
          <kbd>⌘ K</kbd>
        </label>
        <button class="quick-action" type="button" @click="saveChanges">
          <span>＋</span><b>Aksi Cepat</b>
        </button>
        <button class="top-icon" type="button" aria-label="Notifikasi" @click="notify('Tidak ada notifikasi baru.')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
          <i></i>
        </button>
        <div class="avatar-wrap" title="Portal Pengelola Platform · Server Normal (24ms)">
          <button class="admin-avatar" type="button" aria-label="Akun Hendri Wijaya" @click="notify('Masuk sebagai Hendri Wijaya, Super Admin.')">H</button>
          <span class="status-dot-online" title="Server Normal · 24ms"></span>
        </div>
      </header>

      <PlatformSummary v-if="activeSection === 'Ringkasan Platform'" @notify="notify" @navigate-to-section="goToSection" />
      <AdminAnalytics v-else-if="activeSection === 'Statistik & Analisis Nasional'" />
      <UserAccessManagement v-else-if="activeSection === 'Manajemen Pengguna'" @notify="notify" />
      <CategoryRegionManagement v-else-if="activeSection === 'Kategori & Sentra Daerah'" @notify="notify" />
      <EscrowMonitoring v-else-if="activeSection === 'Monitoring Rekber'" @notify="notify" />
      <DisbursementGbbiSubsidy v-else-if="activeSection === 'Pencairan & Subsidi GBBI'" @notify="notify" />
      <PlatformAuditReports v-else-if="activeSection === 'Laporan & Audit Platform'" @notify="notify" />
      <ApiOssBankIntegration v-else-if="activeSection === 'Integrasi API OSS/Bank'" @notify="notify" />
      <ProductCurationManagement v-else-if="activeSection === 'Katalog & Kurasi Produk'" @notify="notify" />
      <StoreLegalityDetail v-else-if="activeSection === 'Verifikasi Toko & UMKM'" @notify="notify" @back-to-verification-list="goToSection('Verifikasi Toko & UMKM')" />
      <div v-else class="admin-content">
        <div class="page-heading" id="platform-overview">
          <div class="heading-copy">
            <div class="admin-breadcrumb">ADMIN CONSOLE &nbsp;›&nbsp; <b>PENGATURAN PLATFORM</b></div>
            <h1>Pengaturan Sistem &amp; Konfigurasi</h1>
          </div>
          <div class="heading-actions">
            <button type="button" @click="historyOpen = true">◷ Riwayat Versi</button>
            <button class="reset" type="button" @click="resetDefaults">↻ Reset Default</button>
            <button class="save" type="button" @click="saveChanges">✓ Simpan Perubahan</button>
          </div>
        </div>

        <section class="cluster-status">
          <div class="cluster-main">
            <span class="cluster-icon">▤</span>
            <div>
              <b>Production Cluster ID-JKTI</b>
              <small>Uptime: 99.98% • Latensi: 24ms</small>
            </div>
            <span class="version">v2.4.0</span>
          </div>
        </section>

        <nav class="settings-tabs" aria-label="Bagian pengaturan"><button v-for="tab in tabs" :key="tab.label" type="button" :class="{ active: activeTab === tab.label }" :aria-pressed="activeTab === tab.label" @click="selectTab(tab)"><span>{{ tab.icon }}</span>{{ tab.label }}</button></nav>

        <div class="settings-grid">
          <div class="settings-column">
            <section id="subsidy-settings" class="settings-panel subsidy-panel"><header class="panel-heading"><span class="panel-icon mint">⌁</span><div><h2>Program Afirmasi Subsidi Ongkir 3T</h2><p>Fasilitasi diskon ongkos kirim nasional bekerja sama dengan Kemenkop UMKM & BUMN Logistik untuk menjangkau disparitas wilayah Tertinggal, Terdepan, dan Terluar.</p></div><button class="switch" :class="{ on: subsidyEnabled }" type="button" role="switch" :aria-checked="subsidyEnabled" aria-label="Aktifkan subsidi ongkir" @click="subsidyEnabled = !subsidyEnabled"><span/></button></header>
              <div class="subsidy-fields"><label class="field-card"><span>Plafon Subsidi Kargo<br/>Udara/Laut</span><b>{{ subsidyPercent }}%</b><small>Ditanggung platform & APBN GBBI per pengiriman.</small><input v-model.number="subsidyPercent" type="range" min="0" max="100" aria-label="Persentase plafon subsidi"/><span class="range-legend"><i>10%</i><i>50%</i><i>100% (Penuh)</i></span></label><label class="field-card"><span>Nominal Maks. Subsidi per Resi</span><small>Batas atas pemotongan ongkos kirim per transaksi.</small><span class="currency-input"><i>Rp</i><input v-model.number="subsidyNominal" type="number" min="0" step="5000" aria-label="Nominal maksimum subsidi per resi"/></span></label></div>
              <div class="progress-card"><div><b>Realisasi Anggaran Subsidi (Q4 2024)</b><span>Terserap 84.4%</span></div><i><span/></i><small><span>Alokasi Terserap: <b>Rp 2.394.000.000</b></span><span>Total Pagu: <b>Rp 3.500.000.000</b></span></small></div>
              <div class="regions-heading"><b>Daftar Klaster Wilayah Afirmasi 3T Terdaftar</b><button type="button" @click="addRegion">＋ Tambah Wilayah 3T</button></div><div class="region-list"><button v-for="region in selectedRegions" :key="region" type="button" :aria-label="`Hapus kluster ${region}`" @click="selectedRegions = selectedRegions.filter((item) => item !== region)"><i/>{{ region }} <b>×</b></button></div>
            </section>

            <section id="integrations" class="settings-panel integration-panel"><header class="panel-title"><span class="panel-icon neutral">⌘</span><div><h2>Integrasi API & Gateway Finansial</h2><p>Sinkronisasi data legalitas UMKM, rekening bersama escrow, dan status kurir logistik.</p></div><button class="refresh" type="button" aria-label="Segarkan status integrasi" @click="notify('Status seluruh integrasi telah diperbarui.')">↻</button></header>
              <article v-for="(integration, index) in integrations" :key="integration.name" class="integration-row"><span class="integration-icon" :class="`icon-${index}`">{{ integration.icon }}</span><div class="integration-copy"><div><h3>{{ integration.name }}</h3><span class="integration-badge">{{ integration.badge }}</span></div><p>{{ integration.description }}</p><small>Latensi: {{ index === 0 ? '18ms' : index === 1 ? '24ms' : 'Auto-sync' }} · Koneksi terenkripsi</small></div><button v-if="index < 2" class="config-button" type="button" @click="notify(`Konfigurasi ${integration.name} siap dibuka.`)">{{ index === 0 ? 'Uji Ping' : 'Konfigurasi' }}</button><button class="switch small-switch" :class="{ on: apiEnabled[index] }" type="button" role="switch" :aria-checked="apiEnabled[index]" :aria-label="`Aktifkan ${integration.name}`" @click="apiEnabled[index] = !apiEnabled[index]"><span/></button></article>
            </section>
          </div>

          <div class="settings-column">
            <section id="service-levels" class="settings-panel sla-panel"><header class="panel-title"><span class="panel-icon aqua">◷</span><div><h2>SLA & Otomasi Transaksi Escrow</h2><p>Batas waktu layanan untuk kepuasan pengguna.</p></div></header>
              <label class="sla-field"><span>SLA Verifikasi Legalitas Toko UMKM <small>Maksimal</small></span><select v-model.number="verificationHours"><option :value="12">12 Jam (Prioritas)</option><option :value="24">24 Jam (Standar Nasional)</option><option :value="48">48 Jam (Reguler)</option></select><small>Kurator wajib memberikan putusan persetujuan/penolakan sebelum batas ini.</small></label>
              <label class="sla-field"><span>SLA Moderasi & Kurasi Produk Baru <small>Maksimal</small></span><select v-model.number="moderationHours"><option :value="6">6 Jam (Prioritas)</option><option :value="12">12 Jam (Standar Layanan)</option><option :value="24">24 Jam (Reguler)</option></select></label>
              <label class="sla-field"><span>Konfirmasi Pembeli Sebelum Auto-Release Rekber <b>{{ autoReleaseHours }} Jam</b></span><div class="inline-number"><input v-model.number="autoReleaseHours" type="number" min="1" max="168" aria-label="Jam sebelum pencairan otomatis"/><small>Jam setelah paket status "Delivered / Diterima"</small></div><small>Dana otomatis diteruskan ke saldo penjual jika tanpa sanggahan.</small></label>
              <label class="sla-field"><span>Ambang Eskalasi Mediasi Otomatis Sengketa <b class="coral-text">{{ disputeHours }} Jam</b></span><div class="inline-number"><input v-model.number="disputeHours" type="number" min="1" max="168" aria-label="Jam sebelum eskalasi sengketa"/><small>Jam respon tanpa respon dari penjual</small></div></label>
            </section>

            <section id="security-settings" class="settings-panel security-panel"><header class="panel-title"><span class="panel-icon shield">◈</span><div><h2>Keamanan, Akses & Pencadangan</h2><p>Kepatuhan UU PDP No. 27/2022 & geo-redundancy.</p></div></header>
              <div class="security-feature"><span>◈</span><div><b>Wajibkan 2FA (TOTP/FIDO2) <i>Enforced</i></b><small>Wajib bagi semua admin, kurator, dan verifikator keuangan.</small></div><button class="switch" :class="{ on: twoFactorEnabled }" type="button" role="switch" :aria-checked="twoFactorEnabled" aria-label="Wajibkan autentikasi dua faktor" @click="twoFactorEnabled = !twoFactorEnabled"><span/></button></div>
              <label class="sla-field"><span>Retensi Riwayat Log Audit Forensik <small>UU PDP Standard</small></span><select v-model.number="retentionDays"><option :value="90">90 Hari (Minimum)</option><option :value="365">365 Hari (1 Tahun - Kepatuhan Legal)</option><option :value="730">730 Hari (2 Tahun)</option></select></label>
              <div class="backup-card"><div><b>Pencadangan Otomatis Geo-Redundant</b><span>● Tersinkronisasi</span></div><p>Jadwal harian pukul 02:00 WIB ke secondary cluster Data Center Batam (Tier IV). Terakhir berhasil: Hari ini, 02:00 WIB (3.42 GB).</p><button class="switch backup-switch" :class="{ on: backupEnabled }" type="button" role="switch" :aria-checked="backupEnabled" aria-label="Aktifkan pencadangan otomatis" @click="backupEnabled = !backupEnabled"><span/></button><button class="backup-trigger" type="button" @click="notify('Pencadangan manual dimulai. Anda akan diberi notifikasi setelah selesai.')">☁ &nbsp; Trigger Backup Manual Sekarang</button></div>
            </section>

            <section class="settings-panel audit-panel"><header class="panel-title"><span class="panel-icon neutral">▤</span><div><h2>Audit Trail Perubahan Terkini</h2></div><button class="audit-link" type="button" @click="notify('Semua log audit telah dimuat.')">Lihat Semua Log</button></header><article v-for="entry in auditEntries" :key="entry.name" class="audit-entry"><p><b>{{ entry.name }}</b><time>{{ entry.time }}</time></p><div>{{ entry.action }} <code :class="`audit-${entry.tone}`">{{ entry.target }}</code> {{ entry.value }}</div></article></section>
          </div>
        </div>
        <footer class="admin-footer"><span>PasarPintar Admin Console <b>v2.4.0</b></span><span>Semua perubahan tercatat pada audit trail · <b>ISO 27001</b></span></footer>
      </div>
    </section>

    <div v-if="historyOpen" class="modal-backdrop" @click.self="historyOpen = false" @keydown.esc="historyOpen = false"><section class="history-dialog" role="dialog" aria-modal="true" aria-labelledby="history-title"><header><div><small>CONFIGURATION LOG</small><h2 id="history-title">Riwayat Versi</h2></div><button type="button" aria-label="Tutup riwayat versi" @click="historyOpen = false">×</button></header><p>Perubahan konfigurasi platform yang tersimpan.</p><article><i class="current"/><div><b>v2.4.0 · Konfigurasi aktif</b><small>Hendri Wijaya · 26 Okt 2024, 09:15 WIB</small><span>Plafon subsidi diperbarui menjadi Rp 150.000 per resi.</span></div></article><article><i/><div><b>v2.3.9 · Stabil</b><small>Siti Nurhaliza · 25 Okt 2024, 16:40 WIB</small><span>Pembaruan kredensial gateway Bank Himbara.</span></div></article><article><i/><div><b>v2.3.8 · Stabil</b><small>Raden Wicaksono · 24 Okt 2024, 11:20 WIB</small><span>Kluster afirmasi 3T Kepulauan Anambas dan Natuna.</span></div></article><footer><button type="button" @click="historyOpen = false">Tutup</button></footer></section></div>
    <Transition name="toast"><div v-if="toastMessage" class="admin-toast" role="status"><span>✓</span>{{ toastMessage }}</div></Transition>
  </main>
</template>

<style scoped>
.admin-shell {
  --ink: #0f172a;
  --green: #059669;
  --green-hover: #047857;
  --green-light: #ecfdf5;
  --green-border: #a7f3d0;
  --sidebar-bg: #ffffff;
  --sidebar-border: #e2e8f0;
  --sidebar-hover: #f1f5f9;
  --sidebar-active: #059669;
  --panel-bg: #ffffff;
  --panel-border: #e2e8f0;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  color: var(--ink);
  background: #f8fafc;
  font: 14px/1.5 'Poppins', system-ui, -apple-system, sans-serif;
}

.admin-shell * {
  box-sizing: border-box;
}

.admin-shell button,
.admin-shell input,
.admin-shell select {
  font: inherit;
}

.admin-shell button {
  cursor: pointer;
}

/* Sidebar */
.admin-sidebar {
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  width: 250px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px 14px 14px;
  border-right: 1px solid var(--sidebar-border);
  background: var(--sidebar-bg);
  color: #334155;
  box-shadow: 2px 0 12px rgba(15, 23, 42, 0.03);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.admin-sidebar::-webkit-scrollbar {
  display: none;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 6px 14px;
  border: 0;
  color: #0f172a;
  background: transparent;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.admin-brand-mark {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(135deg, #059669, #047857);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.admin-brand-mark svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.admin-brand > span:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-brand b {
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.admin-brand small {
  color: #059669;
  font-size: 10.5px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 0.8px;
}

.cluster-pill {
  min-height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #334155;
  background: #f8fafc;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}

.cluster-pill i,
.portal-label i {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.2);
}

.cluster-pill b {
  margin-left: auto;
  color: #059669;
  font-size: 11px;
}

.admin-nav {
  overflow-y: auto;
  padding-top: 14px;
  flex: 1;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.admin-nav::-webkit-scrollbar {
  display: none;
}

.admin-nav section {
  margin-bottom: 14px;
}

.admin-nav h2 {
  margin: 12px 0 4px 8px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}

.admin-nav section button {
  width: 100%;
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 0;
  border-radius: 8px;
  color: #475569;
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  transition: all 0.15s ease;
  margin-bottom: 2px;
}

.nav-icon {
  font-size: 14px;
  line-height: 1;
}

.admin-nav section button:hover {
  color: #0f172a;
  background: #f1f5f9;
}

.admin-nav section button.selected {
  color: #ffffff;
  background: #059669;
  font-weight: 600;
  box-shadow: none;
}

.sidebar-bottom {
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.btn-marketplace-link {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #059669;
  background: #f8fafc;
  font-size: 12.5px;
  font-weight: 600;
  transition: all 0.15s ease;
  text-align: center;
}

.btn-marketplace-link:hover {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.sidebar-bottom > button span {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sidebar-bottom > button b {
  font-size: 12px;
  color: #0f172a;
  font-weight: 600;
}

.sidebar-bottom > button small {
  color: #64748b;
  font-size: 10.5px;
}

.sidebar-bottom > button i {
  font-style: normal;
  font-size: 13px;
  font-weight: 600;
}

/* Workspace Layout */
.admin-workspace {
  min-width: 0;
  grid-column: 2;
  display: flex;
  flex-direction: column;
}

/* Topbar */
.admin-topbar {
  min-height: 56px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 24px;
  border-bottom: 1px solid var(--panel-border);
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.admin-search {
  height: 36px;
  min-width: 200px;
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  background: #f8fafc;
  transition: all 0.15s ease;
}

.admin-search:focus-within {
  border-color: #059669;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

.admin-search > span {
  font-size: 15px;
}

.admin-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #1e293b;
  background: transparent;
  font-size: 13px;
}

.admin-search input::placeholder {
  color: #94a3b8;
}

.admin-search kbd {
  flex: none;
  padding: 2px 5px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  color: #64748b;
  background: #ffffff;
  font-family: inherit;
  font-size: 10.5px;
  font-weight: 600;
}

.quick-action {
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  color: white;
  background: #e11d48;
  font-size: 12.5px;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s ease;
}

.quick-action:hover {
  background: #be123c;
}

.quick-action > span {
  font-size: 15px;
}

.top-icon {
  position: relative;
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #475569;
  background: #ffffff;
  transition: background 0.15s ease;
}

.top-icon:hover {
  background: #f8fafc;
}

.avatar-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.status-dot-online {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #10b981;
  border: 1.5px solid #ffffff;
}

.top-icon svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.top-icon i {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  border: 1.5px solid white;
  border-radius: 50%;
  background: #f43f5e;
}

.admin-avatar {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: white;
  background: var(--green);
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
}

/* Admin Content */
.admin-content {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 24px 28px 32px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
  scroll-margin-top: 20px;
}

.heading-copy {
  max-width: 640px;
}

.admin-breadcrumb {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  padding: 4px 10px;
  border-radius: 6px;
  color: #64748b;
  background: #f1f5f9;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.admin-breadcrumb b {
  color: #059669;
}

.page-heading h1 {
  margin: 0 0 8px;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
  font-size: 26px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.3px;
}

.page-heading p {
  margin: 0;
  color: #475569;
  font-size: 14px;
  line-height: 1.6;
}

.heading-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 10px;
}

.heading-actions button {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  color: #334155;
  background: #ffffff;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.heading-actions button:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

.heading-actions button.reset {
  color: #e11d48;
  background: #fff1f2;
  border-color: #fecdd3;
}

.heading-actions button.reset:hover {
  background: #ffe4e6;
  border-color: #fda4af;
}

.heading-actions button.save {
  color: white;
  background: var(--green);
  border-color: var(--green);
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.heading-actions button.save:hover {
  background: var(--green-hover);
  border-color: var(--green-hover);
  transform: translateY(-1px);
}

/* Cluster status banner */
.cluster-status {
  min-height: 72px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px 20px;
  margin-bottom: 22px;
  padding: 18px 22px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
}

.cluster-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cluster-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: #059669;
  background: #ecfdf5;
  font-size: 18px;
  border: 1px solid #d1fae5;
}

.cluster-main > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.cluster-main > div > b {
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.cluster-main > div > b i {
  width: 8px;
  height: 8px;
  display: inline-block;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.cluster-main small {
  color: #64748b;
  font-size: 12.5px;
}

.cluster-main small strong {
  color: #0f172a;
  font-weight: 700;
}

.version {
  padding: 3px 10px;
  border-radius: 6px;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  font-size: 12px;
  font-weight: 800;
}

.updated {
  padding: 6px 12px;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  color: #475569;
  background: #f8fafc;
  font-size: 12px;
  font-weight: 500;
}

.cluster-meta {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 12px;
}

.cluster-meta > span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cluster-meta b {
  color: #0f172a;
  font-weight: 700;
}

.cluster-meta > i {
  width: 1px;
  height: 14px;
  background: #cbd5e1;
}

/* Tabs */
.settings-tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  margin-bottom: 22px;
  padding: 6px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.settings-tabs::-webkit-scrollbar {
  display: none;
}

.settings-tabs button {
  min-height: 38px;
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  color: #64748b;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.settings-tabs button:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.settings-tabs button.active {
  color: #ffffff;
  background: var(--green);
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
}

.settings-tabs button > span {
  font-size: 15px;
}

/* Main Grid Layout */
.settings-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 1fr);
  align-items: start;
  gap: 20px;
}

.settings-column {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Settings Panels */
.settings-panel {
  min-width: 0;
  padding: 22px 24px;
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.04);
  scroll-margin-top: 80px;
}

.panel-heading,
.panel-title {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.panel-heading > div,
.panel-title > div {
  min-width: 0;
  flex: 1;
}

.panel-icon {
  width: 34px;
  height: 34px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
}

.panel-icon.mint {
  color: #059669;
  background: #ecfdf5;
}

.panel-icon.neutral {
  color: #2563eb;
  background: #eff6ff;
}

.panel-icon.aqua {
  color: #0d9488;
  background: #ccfbf1;
}

.panel-icon.shield {
  color: #7c3aed;
  background: #f5f3ff;
}

.panel-heading h2,
.panel-title h2 {
  margin: 0 0 4px;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.3;
  font-weight: 700;
}

.panel-heading p,
.panel-title p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

/* Modern Switch Toggle */
.switch {
  width: 44px;
  height: 24px;
  flex: none;
  position: relative;
  padding: 0;
  border: 0;
  border-radius: 12px;
  background: #cbd5e1;
  transition: background 0.2s ease;
}

.switch span {
  width: 18px;
  height: 18px;
  position: absolute;
  top: 3px;
  left: 3px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.switch.on {
  background: var(--green);
}

.switch.on span {
  transform: translateX(20px);
}

/* Subsidy Fields */
.subsidy-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 18px;
}

.field-card {
  min-width: 0;
  min-height: 110px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #334155;
  background: #f8fafc;
  font-size: 13px;
}

.field-card > span:first-child {
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.field-card > b {
  position: absolute;
  top: 14px;
  right: 14px;
  color: var(--green);
  font-size: 16px;
  font-weight: 800;
}

.field-card > small {
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.field-card input[type='range'] {
  width: 100%;
  height: 6px;
  margin: 10px 0 2px;
  accent-color: var(--green);
}

.range-legend {
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: #64748b;
  font-size: 11.5px;
}

.range-legend i {
  font-style: normal;
}

.currency-input {
  width: 100%;
  height: 38px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
  background: #ffffff;
}

.currency-input i {
  font-size: 13px;
  font-weight: 700;
  font-style: normal;
}

.currency-input input {
  width: 100%;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #0f172a;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
}

/* Progress Card */
.progress-card {
  margin-top: 16px;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.progress-card > div {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #1e293b;
  font-size: 13.5px;
  font-weight: 600;
}

.progress-card > div > span {
  color: var(--green);
  font-size: 12.5px;
  font-weight: 800;
}

.progress-card > i {
  height: 8px;
  display: block;
  overflow: hidden;
  margin: 10px 0 8px;
  border-radius: 6px;
  background: #e2e8f0;
}

.progress-card > i > span {
  width: 84.4%;
  height: 100%;
  display: block;
  border-radius: inherit;
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-card > small {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
}

.progress-card > small b {
  color: #334155;
}

/* Regions */
.regions-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  color: #0f172a;
  font-size: 13.5px;
  font-weight: 700;
}

.regions-heading button {
  flex: none;
  padding: 4px 10px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  color: var(--green);
  background: #ecfdf5;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s ease;
}

.regions-heading button:hover {
  background: #d1fae5;
}

.region-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.region-list button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 20px;
  color: #334155;
  background: #f8fafc;
  font-size: 12.5px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.region-list button:hover {
  border-color: #fca5a5;
  color: #e11d48;
  background: #fff1f2;
}

.region-list button i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

.region-list button b {
  color: #64748b;
  font-size: 14px;
}

/* Integrations Panel */
.integration-panel > .panel-title,
.sla-panel > .panel-title,
.security-panel > .panel-title {
  align-items: center;
  margin-bottom: 14px;
}

.refresh {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  background: #ffffff;
  font-size: 16px;
  transition: all 0.15s ease;
}

.refresh:hover {
  background: #f8fafc;
  color: #0f172a;
}

.integration-row {
  min-width: 0;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto 44px;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.integration-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: var(--green);
  background: #ffffff;
  font-size: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.integration-icon.icon-1 {
  color: #e11d48;
}
.integration-icon.icon-2 {
  color: #d97706;
}
.integration-icon.icon-3 {
  color: #0d9488;
}

.integration-copy {
  min-width: 0;
}

.integration-copy > div {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.integration-copy h3 {
  min-width: 0;
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 700;
}

.integration-badge {
  flex: none;
  padding: 2px 8px;
  border-radius: 12px;
  color: #047857;
  background: #d1fae5;
  font-size: 11.5px;
  font-weight: 700;
}

.integration-copy p {
  margin: 4px 0 3px;
  color: #475569;
  font-size: 12.5px;
  line-height: 1.4;
}

.integration-copy > small {
  color: #64748b;
  font-size: 11.5px;
}

.config-button {
  padding: 6px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.config-button:hover {
  background: #f1f5f9;
}

.small-switch {
  transform: scale(0.9);
}

/* SLA Fields */
.sla-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 14px;
  color: #0f172a;
  font-size: 13.5px;
}

.sla-field > span {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.sla-field > span small {
  color: #64748b;
  font-size: 12px;
  font-weight: 400;
}

.sla-field select {
  width: 100%;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline-color: #10b981;
  color: #0f172a;
  background: #f8fafc;
  font-size: 13.5px;
}

.sla-field > small {
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.sla-field > span > b {
  color: var(--green);
  font-size: 13px;
  white-space: nowrap;
}

.sla-field > span > b.coral-text {
  color: #e11d48;
}

.inline-number {
  display: grid;
  grid-template-columns: 80px 1fr;
  align-items: center;
  gap: 10px;
}

.inline-number input {
  width: 100%;
  height: 38px;
  padding: 0 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline-color: #10b981;
  color: #0f172a;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 700;
}

.inline-number small {
  color: #64748b;
  font-size: 12.5px;
}

/* Security Features */
.security-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.security-feature > span {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: var(--green);
  background: #ecfdf5;
  font-size: 16px;
}

.security-feature > div {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.security-feature > div > b {
  display: flex;
  justify-content: space-between;
  gap: 6px;
  color: #0f172a;
  font-size: 13.5px;
}

.security-feature > div > b i {
  color: var(--green);
  font-size: 12px;
  font-style: normal;
}

.security-feature small {
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.backup-card {
  position: relative;
  margin-top: 14px;
  padding: 16px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  background: #f0fdf4;
}

.backup-card > div:first-child {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #064e3b;
  font-size: 14px;
  font-weight: 700;
}

.backup-card > div:first-child > span {
  color: #16a34a;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.backup-card p {
  max-width: 85%;
  margin: 6px 0 12px;
  color: #166534;
  font-size: 12.5px;
  line-height: 1.5;
}

.backup-switch {
  position: absolute;
  top: 16px;
  right: 14px;
}

.backup-trigger {
  width: 100%;
  min-height: 36px;
  border: 1px solid #86efac;
  border-radius: 8px;
  color: #047857;
  background: #ffffff;
  font-size: 13px;
  font-weight: 700;
  transition: all 0.15s ease;
}

.backup-trigger:hover {
  background: #d1fae5;
}

/* Audit Trail Panel */
.audit-panel > .panel-title {
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.audit-panel .panel-icon {
  width: 28px;
  height: 28px;
  font-size: 14px;
}

.audit-panel .panel-title h2 {
  font-size: 15px;
}

.audit-link {
  flex: none;
  border: 0;
  color: var(--green);
  background: transparent;
  font-size: 12.5px;
  font-weight: 700;
}

.audit-entry {
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.audit-entry > p {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 4px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
}

.audit-entry time {
  flex: none;
  color: #64748b;
  font-size: 11.5px;
  font-weight: 400;
}

.audit-entry > div {
  color: #475569;
  font-size: 12.5px;
  line-height: 1.5;
}

.audit-entry code {
  overflow-wrap: anywhere;
  padding: 2px 6px;
  border-radius: 4px;
  color: #047857;
  background: #d1fae5;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
}

.audit-entry code.audit-blue {
  color: #1d4ed8;
  background: #dbeafe;
}
.audit-entry code.audit-coral {
  color: #be123c;
  background: #ffe4e6;
}

/* Footer */
.admin-footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding: 16px 4px 0;
  border-top: 1px solid var(--panel-border);
  color: #64748b;
  font-size: 12.5px;
}

.admin-footer b {
  color: #334155;
}

/* Modal Backdrop & Dialog */
.modal-backdrop {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
}

.history-dialog {
  width: min(480px, 100%);
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.25);
}

.history-dialog > header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.history-dialog > header small {
  color: var(--green);
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.8px;
}

.history-dialog h2 {
  margin: 4px 0;
  color: #0f172a;
  font-size: 18px;
}

.history-dialog > header button {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 8px;
  color: #64748b;
  background: #f1f5f9;
  font-size: 18px;
}

.history-dialog > p {
  margin: 4px 0 16px;
  color: #64748b;
  font-size: 13.5px;
}

.history-dialog > article {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #e2e8f0;
}

.history-dialog > article > i {
  width: 10px;
  height: 10px;
  flex: none;
  margin-top: 4px;
  border: 2px solid #94a3b8;
  border-radius: 50%;
}

.history-dialog > article > i.current {
  border-color: var(--green);
  background: #10b981;
}

.history-dialog > article > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-dialog > article b {
  color: #0f172a;
  font-size: 14px;
}
.history-dialog > article small {
  color: #64748b;
  font-size: 12px;
}
.history-dialog > article span {
  color: #334155;
  font-size: 13px;
}

.history-dialog > footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.history-dialog > footer button {
  min-width: 80px;
  min-height: 36px;
  border: 0;
  border-radius: 8px;
  color: white;
  background: var(--green);
  font-size: 13px;
  font-weight: 700;
}

/* Toast */
.admin-toast {
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

.admin-toast > span {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: white;
  background: var(--green);
  font-size: 12px;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive Media Queries */
@media (max-width: 1024px) {
  .admin-shell {
    grid-template-columns: 200px minmax(0, 1fr);
  }
  .admin-sidebar {
    width: 200px;
  }
  .settings-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 768px) {
  .admin-shell {
    grid-template-columns: 1fr;
  }
  .admin-sidebar {
    position: static;
    width: 100%;
    height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--sidebar-border);
    padding: 12px 16px;
  }
  .admin-nav,
  .sidebar-bottom {
    display: none;
  }
  .admin-workspace {
    grid-column: 1;
  }
  .admin-topbar {
    padding: 8px 16px;
  }
  .portal-label,
  .server-health {
    display: none;
  }
  .admin-content {
    padding: 16px;
  }
  .page-heading {
    flex-direction: column;
    gap: 12px;
  }
  .heading-actions {
    width: 100%;
    justify-content: flex-start;
  }
  .subsidy-fields {
    grid-template-columns: 1fr;
  }
}
</style>
