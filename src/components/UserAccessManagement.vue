<script setup lang="ts">
import { computed, ref } from 'vue'

interface UserRecord {
  id: string
  initials: string
  name: string
  email: string
  role: string
  scope: string
  security: string
  securityDetail: string
  status: 'Aktif' | 'Menunggu' | 'Ditangguhkan'
  tone: string
}

const emit = defineEmits<{ notify: [message: string] }>()
const search = ref('')
const activeTab = ref('Internal Platform (Admin & Kurator)')
const roleFilter = ref('Semua Peran')
const regionFilter = ref('Semua Sentra')
const statusFilter = ref('Semua Status')
const selectedIds = ref<string[]>([])
const showCreateForm = ref(false)
const newUserName = ref('')
const newUserEmail = ref('')

const tabs = ['Semua Pengguna', 'Internal Platform (Admin & Kurator)', 'Mitra Seller & UMKM', 'Akun Pelanggan', 'Menunggu Verifikasi']
const users = ref<UserRecord[]>([
  { id: 'USR-ADM-001', initials: 'HW', name: 'Hendra Wijaya, S.Kom.', email: 'hendra.wijaya@pasarpintar.id', role: 'Super Admin', scope: 'Nasional (Pusat)', security: '2FA Aktif (TOTP)', securityDetail: '103.11.45.12 · 15 menit lalu', status: 'Aktif', tone: 'coral' },
  { id: 'KRT-014', initials: 'SR', name: 'Siti Rahmania, M.Si.', email: 'siti.rahmania@pasarpintar.id', role: 'Kurator Sentra', scope: 'Hub NTT & Bali', security: '2FA Aktif (FIDO2)', securityDetail: '180.252.12.88 · 2 jam lalu', status: 'Aktif', tone: 'green' },
  { id: 'VFR-008', initials: 'BS', name: 'Budi Santoso', email: 'budi.verifikator@pasarpintar.id', role: 'Verifikator Legalitas & OSS', scope: 'Jawa Tengah', security: '2FA Aktif (TOTP)', securityDetail: '114.124.201.5 · 16 menit lalu', status: 'Aktif', tone: 'gold' },
  { id: 'FLD-022', initials: 'RD', name: 'Rahmat Darmawan', email: 'rahmat.d@mitra.pasarpintar.id', role: 'Pendamping Lapangan', scope: 'Hub Sumatera (Wilayah Riau & Pekanbaru)', security: 'Login Baru (Medan)', securityDetail: '36.72.19.4 · 42 menit lalu', status: 'Menunggu', tone: 'coral' },
  { id: 'SLR-342', initials: 'BS', name: 'Bambang Setyawan, S.P.', email: 'bambang@kopisindoro.co.id', role: 'Ketua Koperasi / Seller Verified', scope: 'Sentra Sindoro, Kab. Temanggung', security: '2FA Aktif (SMS)', securityDetail: '182.253.64.1 · 1 hari lalu', status: 'Aktif', tone: 'mint' },
  { id: 'CUS-842', initials: 'DL', name: 'Dewi Lestari', email: 'dewi.lestari@gmail.com', role: 'Pelanggan Terverifikasi', scope: 'Kota Bandung, Jawa Barat', security: '2FA Opsional', securityDetail: '125.166.8.99 · 4 jam lalu', status: 'Aktif', tone: 'gray' },
])

const visibleUsers = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('id')
  return users.value.filter((user) => {
    const matchesSearch = !query || `${user.name} ${user.email} ${user.id} ${user.scope}`.toLocaleLowerCase('id').includes(query)
    const matchesRole = roleFilter.value === 'Semua Peran' || user.role.includes(roleFilter.value)
    const matchesRegion = regionFilter.value === 'Semua Sentra' || user.scope.includes(regionFilter.value)
    const matchesStatus = statusFilter.value === 'Semua Status' || user.status === statusFilter.value
    const matchesTab = activeTab.value === 'Semua Pengguna' || activeTab.value === 'Internal Platform (Admin & Kurator)' && ['Super Admin', 'Kurator', 'Verifikator', 'Pendamping'].some((role) => user.role.includes(role)) || activeTab.value === 'Mitra Seller & UMKM' && user.role.includes('Seller') || activeTab.value === 'Akun Pelanggan' && user.role.includes('Pelanggan') || activeTab.value === 'Menunggu Verifikasi' && user.status === 'Menunggu'
    return matchesSearch && matchesRole && matchesRegion && matchesStatus && matchesTab
  })
})

const allVisibleSelected = computed(() => visibleUsers.value.length > 0 && visibleUsers.value.every((user) => selectedIds.value.includes(user.id)))

function toggleUser(id: string) {
  selectedIds.value = selectedIds.value.includes(id) ? selectedIds.value.filter((item) => item !== id) : [...selectedIds.value, id]
}

function toggleAll() {
  selectedIds.value = allVisibleSelected.value ? selectedIds.value.filter((id) => !visibleUsers.value.some((user) => user.id === id)) : [...new Set([...selectedIds.value, ...visibleUsers.value.map((user) => user.id)])]
}

function notify(message: string) {
  emit('notify', message)
}

function createUser() {
  if (!newUserName.value.trim() || !newUserEmail.value.trim()) return
  users.value.unshift({ id: `USR-${String(users.value.length + 1).padStart(3, '0')}`, initials: newUserName.value.trim().split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), name: newUserName.value.trim(), email: newUserEmail.value.trim(), role: 'Verifikator Legalitas & OSS', scope: 'Nasional (Pusat)', security: '2FA Wajib', securityDetail: 'Belum ada aktivitas', status: 'Menunggu', tone: 'blue' })
  newUserName.value = ''
  newUserEmail.value = ''
  showCreateForm.value = false
  notify('Akun pengguna baru berhasil dibuat dan menunggu verifikasi.')
}
</script>

<template>
  <div class="user-access-content">
    <div class="user-page-heading">
      <div>
        <div class="user-breadcrumb">PORTAL SUPER ADMIN &nbsp;›&nbsp; MANAJEMEN ENTITAS &nbsp;›&nbsp; <b>MANAJEMEN PENGGUNA & HAK AKSES</b></div>
        <div class="user-title-row"><h1>Manajemen Pengguna, Peran &<br />Hak Akses Sistem</h1><span class="compliance-badge">RBAC v3.1</span></div>
        <p>Kelola akun pengguna, verifikasi identitas, hierarki peran, dan hak akses sesuai prinsip least privilege untuk seluruh ekosistem PasarPintar.</p>
      </div>
      <div class="user-heading-actions"><button type="button" @click="notify('Audit log pengguna sedang disiapkan untuk diunduh.')">⇩ Export Audit Log (CSV)</button><button type="button" @click="notify('Matriks peran dan hak akses dibuka.')">⌘ Kelola Matriks Peran</button><button class="add-user-button" type="button" @click="showCreateForm = true">＋ Tambah Akun Pengguna Baru</button></div>
    </div>

    <section class="security-banner"><span class="security-banner-icon">♥</span><div><b>Kebijakan Keamanan Akun Platform Berjalan Aktif</b><small>2FA Terverifikasi (98.4%) &nbsp; <em>Proteksi Brute-Force Aktif</em></small><p>Seluruh akun internal (Admin, Kurator, Tim Lapangan) wajib mengaktifkan 2FA via Authy/Google Authenticator. Terdapat 2 akun memerlukan peninjauan aktivitas login di panel keamanan.</p></div><button type="button" @click="notify('Daftar akun berisiko dibuka.')">▣ Tinjau 2 Akun Berisiko</button></section>

    <section class="user-metrics"><article><div><small>Total Pengguna<br />Terdaftar</small><span class="metric-pill">↗ 8.5%<br />MoM</span></div><strong>142.850</strong><small>128.400 Pelanggan, 14.210 Mitra Pengguna</small><i><span style="width: 86%" /></i></article><article><div><small>Staf & Operator Internal</small><span class="metric-dot" /></div><strong>68 <small>Personel</small></strong><small>8 Super Admin, 32 Kurator, 16 Verifikator, 12 Lapangan</small><i><span style="width: 92%" /></i></article><article class="warning-metric"><div><small>Menunggu Verifikasi<br />Identitas</small><span class="metric-pill warning">SLA &lt; 24<br />Jam</span></div><strong>24 <small>Pengguna</small></strong><small>18 KTP Seller baru, 6 pengajuan dinas daerah</small><i><span style="width: 58%" /></i></article><article><div><small>Status Kepatuhan<br />Keamanan</small><span class="metric-pill good">Sangat<br />Baik</span></div><strong class="green-number">98.4%</strong><small>0 pelanggaran serius dalam 30 hari terakhir</small><i><span style="width: 98%" /></i></article></section>

    <section class="users-table-panel"><nav class="user-tabs" aria-label="Kategori pengguna"><button v-for="tab in tabs" :key="tab" type="button" :class="{ active: activeTab === tab }" @click="activeTab = tab">{{ tab }} <small v-if="tab === 'Semua Pengguna'">(142.850)</small><small v-else-if="tab === 'Internal Platform (Admin & Kurator)'">(68)</small><small v-else-if="tab === 'Mitra Seller & UMKM'">(14.210)</small><small v-else-if="tab === 'Akun Pelanggan'">(128.400)</small></button></nav><div class="user-filters"><label>⌕<input v-model="search" type="search" placeholder="Cari nama, email, NIK, atau ID pengguna..." aria-label="Cari pengguna" /></label><select v-model="roleFilter" aria-label="Filter peran"><option>Peran: Semua Peran</option><option value="Super Admin">Super Admin</option><option value="Kurator">Kurator</option><option value="Seller">Seller</option><option value="Pelanggan">Pelanggan</option></select><select v-model="regionFilter" aria-label="Filter wilayah"><option>Semua Sentra</option><option>Nasional</option><option>Jawa Tengah</option><option>Bandung</option><option>Riau</option></select><select v-model="statusFilter" aria-label="Filter status"><option>Semua Status</option><option>Aktif</option><option>Menunggu</option><option>Ditangguhkan</option></select><button class="mass-action" type="button" :disabled="selectedIds.length === 0" @click="notify(`${selectedIds.length} akun dipilih untuk aksi massal.`)">☷ Aksi Massal</button></div>
      <div class="table-wrap"><table><thead><tr><th><input type="checkbox" :checked="allVisibleSelected" aria-label="Pilih semua pengguna" @change="toggleAll" /></th><th>INFORMASI PENGGUNA</th><th>PERAN & HAK AKSES</th><th>WILAYAH / SENTRA</th><th>STATUS KEAMANAN</th><th>STATUS AKUN</th><th>AKSI</th></tr></thead><tbody><tr v-for="user in visibleUsers" :key="user.id" :class="{ 'is-warning': user.status === 'Menunggu' }"><td><input type="checkbox" :checked="selectedIds.includes(user.id)" :aria-label="`Pilih ${user.name}`" @change="toggleUser(user.id)" /></td><td><div class="person-cell"><span class="person-avatar" :class="user.tone">{{ user.initials }}</span><span><b>{{ user.name }} <i>✓</i></b><small>{{ user.email }} · <code>{{ user.id }}</code></small></span></div></td><td><span class="role-tag" :class="user.tone">● {{ user.role }}</span></td><td><b>{{ user.scope }}</b><small>Jawa Barat</small></td><td><span class="security-status" :class="user.status === 'Menunggu' ? 'danger' : ''">{{ user.security }}</span><small>{{ user.securityDetail }}</small></td><td><span class="account-status" :class="user.status.toLocaleLowerCase('id')">● {{ user.status }}</span></td><td><button class="row-action" type="button" @click="notify(`Detail akses ${user.name} dibuka.`)">{{ user.status === 'Menunggu' ? 'Investigasi Sesi' : user.role.includes('Seller') ? 'Lihat Toko' : user.status === 'Aktif' ? 'Kelola Hak' : 'Riwayat' }}</button><button class="row-menu" type="button" aria-label="Menu pengguna" @click="notify(`Menu ${user.name} dibuka.`)">⋮</button></td></tr><tr v-if="visibleUsers.length === 0"><td colspan="7" class="empty-users">Tidak ada pengguna yang cocok dengan filter saat ini.</td></tr></tbody></table></div><footer class="table-footer"><span>Menampilkan {{ visibleUsers.length }} dari 68 staf internal</span><div><button type="button" disabled>‹</button><button class="current" type="button">1</button><button type="button">2</button><button type="button">3</button><button type="button">…</button><button type="button">12</button><button type="button">›</button></div></footer>
    </section>

    <section class="user-bottom-grid"><article class="access-matrix"><header><div><span class="bottom-icon">♧</span><span><h2>Matriks Pembagian Peran & Hak Akses</h2><p>Ringkasan cakupan otorisasi dan kontrol tindakan pengguna dalam lingkup sistem PasarPintar.</p></span></div><small>RBAC v3.1</small></header><div class="access-row"><b>Super Admin (IT & Ops Pusat)</b><span>FULL_ACCESS</span><small>Akses penuh CRUD, override rule perbankan, audit log forensik, & manajemen RBAC.</small></div><div class="access-row"><b>Kurator Sentra Daerah</b><span>CURATOR_RW</span><small>Approval katalog daerah, pemberian badge autentisitas, review foto & narasi produk.</small></div><div class="access-row"><b>Verifikator Legalitas & OSS</b><span>NIB_VERIFY</span><small>Sinkronisasi nomor NIB kementerian, validasi izin edar BPOM/P-IRT, dan pencocokan NIK.</small></div><div class="access-row"><b>Pendamping Lapangan UMKM</b><span>FIELD_AGENT</span><small>Input data desa/koperasi, update progres kapasitas pengrajin, upload bukti fisik visitasi sentra.</small></div><button type="button" @click="notify('Editor spesifik matriks akses dibuka.')">Lihat Matriks Lengkap & Edit Izin Spesifik →</button></article><article class="audit-preview"><header><div><span class="bottom-icon coral">◉</span><span><h2>Aktivitas Keamanan & Log Audit Sesi Terkini</h2><p>Aliran rekaman audit otomatis tersertifikasi ISO/IEC 27001 secara realtime.</p></span></div><i /></header><div class="audit-event"><span>♧</span><p><b>Perubahan peran akun <code>USR-VRF-008</code></b><small>Dilakukan oleh Super Admin Hendra Wijaya melalui konsol pusat.</small><time>15 menit yang lalu · IP 103.11.45.12</time></p></div><div class="audit-event critical"><span>⊘</span><p><b>Gagal autentikasi 2FA 3x berturut-turut</b><small>Akun <code>USR-FLD-022</code> dibekukan sementara untuk investigasi.</small><time>42 menit yang lalu · Medan, IP 36.72.19.4</time></p></div><div class="audit-event"><span>♧</span><p><b>Aktivasi Kunci Keamanan Hardware (FIDO2)</b><small>Pendaftaran kunci YubiKey 5 NFC sukses oleh Siti Rahmania.</small><time>2 jam yang lalu · Labuan Bajo, IP 180.252.12.8</time></p></div><button type="button" @click="notify('Semua audit log keamanan dimuat.')">Lihat Semua Audit Log Keamanan (ISO 27001) →</button></article></section>

    <div v-if="showCreateForm" class="user-modal-backdrop" @click.self="showCreateForm = false"><form class="user-modal" @submit.prevent="createUser"><header><div><small>USER PROVISIONING</small><h2>Tambah Akun Pengguna</h2></div><button type="button" aria-label="Tutup" @click="showCreateForm = false">×</button></header><label>Nama lengkap<input v-model="newUserName" required placeholder="Contoh: Rina Pratiwi" /></label><label>Email kerja<input v-model="newUserEmail" required type="email" placeholder="nama@pasarpintar.id" /></label><p>Akun baru akan dibuat sebagai Verifikator Legalitas & OSS dan wajib menyelesaikan verifikasi 2FA.</p><footer><button type="button" @click="showCreateForm = false">Batal</button><button class="add-user-button" type="submit">Buat Akun</button></footer></form></div>
  </div>
</template>

<style scoped>
.user-access-content { max-width: 1280px; margin: 0 auto; padding: 24px 28px 34px; color: #172b24; font: 14px/1.5 'Poppins', system-ui, sans-serif; }
.user-access-content * { box-sizing: border-box; }
.user-access-content button, .user-access-content input, .user-access-content select { font: inherit; }
.user-access-content button { cursor: pointer; }
.user-page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 22px; }
.user-breadcrumb { margin-bottom: 7px; color: #809089; font-size: 12px; font-weight: 700; letter-spacing: .35px; }
.user-breadcrumb b { color: #087b61; }
.user-title-row { display: flex; align-items: center; gap: 11px; }
.user-title-row h1 { margin: 0; color: #172b24; font-size: 26px; line-height: 1.2; letter-spacing: -.5px; }
.compliance-badge { padding: 4px 10px; border-radius: 6px; color: #087b61; background: #e6f5ee; font-size: 11px; font-weight: 800; }
.user-page-heading p { max-width: 675px; margin: 8px 0 0; color: #61756b; font-size: 13px; line-height: 1.5; }
.user-heading-actions { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 8px; }
.user-heading-actions button { height: 36px; padding: 0 12px; border: 1px solid #dfe8e3; border-radius: 6px; color: #3b5c50; background: #fff; font-size: 12px; font-weight: 700; white-space: nowrap; }
.user-heading-actions .add-user-button, .add-user-button { border-color: #087b61; color: #fff; background: #087b61; }
.security-banner { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding: 12px 16px; border: 1px solid #dbeee5; border-radius: 9px; background: #edf8f2; }
.security-banner-icon { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; color: #087b61; background: #d7f0e5; font-size: 14px; }
.security-banner > div { min-width: 0; flex: 1; }
.security-banner b { font-size: 13px; }
.security-banner small { margin-left: 8px; color: #087b61; font-size: 11px; font-weight: 700; }
.security-banner small em { margin-left: 6px; color: #279668; font-style: normal; }
.security-banner p { margin: 4px 0 0; color: #556b61; font-size: 11px; }
.security-banner > button { padding: 7px 12px; border: 0; border-radius: 6px; color: #fff; background: #ea6748; font-size: 11px; font-weight: 700; }
.user-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 20px; }
.user-metrics article { min-height: 98px; padding: 12px 14px 10px; border: 1px solid #e4ebe7; border-radius: 10px; background: #fff; box-shadow: 0 2px 8px #173c2d08; }
.user-metrics article > div { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; color: #61756b; font-size: 12px; line-height: 1.3; }
.user-metrics article > strong { display: block; margin: 4px 0 1px; color: #18342a; font-size: 24px; line-height: 1.1; letter-spacing: -.5px; }
.user-metrics article > strong small { color: #718178; font-size: 12px; font-weight: 500; letter-spacing: 0; }
.user-metrics article > small { display: block; min-height: 24px; color: #718178; font-size: 11px; }
.user-metrics article > i { display: block; height: 4px; overflow: hidden; margin-top: 6px; border-radius: 3px; background: #e9f0ec; }
.user-metrics article > i span { display: block; height: 100%; border-radius: inherit; background: #0b8b6b; }
.user-metrics .metric-pill { padding: 3px 8px; border-radius: 8px; color: #087b61; background: #e4f4ec; font-size: 11px; font-weight: 800; text-align: center; }
.user-metrics .metric-pill.warning { color: #e95e3d; background: #fff1ec; }
.user-metrics .metric-pill.good { color: #299760; background: #e5f4e9; }
.metric-dot { width: 7px; height: 7px; margin: 3px 3px 0 0; border-radius: 50%; background: #07936e; }
.warning-metric > strong { color: #e65d3e !important; }
.user-metrics .green-number { color: #07936e; }
.users-table-panel { overflow: hidden; border: 1px solid #e1e9e4; border-radius: 10px; background: #fff; box-shadow: 0 2px 9px #173c2d08; }
.user-tabs { display: flex; align-items: center; gap: 20px; height: 44px; padding: 0 14px; border-bottom: 1px solid #e7eeea; white-space: nowrap; overflow-x: auto; }
.user-tabs button { height: 100%; padding: 0 0; border: 0; border-bottom: 2px solid transparent; color: #556b61; background: none; font-size: 12px; font-weight: 600; }
.user-tabs button.active { border-color: #087b61; color: #087b61; font-weight: 800; }
.user-tabs small { color: #87968f; font-size: 11px; }
.user-filters { display: flex; gap: 8px; padding: 12px 14px; background: #fbfcfb; flex-wrap: wrap; }
.user-filters label, .user-filters select, .mass-action { height: 32px; display: flex; align-items: center; gap: 6px; padding: 0 10px; border: 1px solid #e0e8e3; border-radius: 6px; color: #475569; background: #fff; font-size: 12px; }
.user-filters label { flex: 1; min-width: 200px; }
.user-filters input { width: 100%; min-width: 0; border: 0; outline: 0; color: #1e293b; background: transparent; font-size: 12px; }
.user-filters select { min-width: 120px; outline: 0; }
.mass-action { margin-left: auto; color: #556b61; font-weight: 700; white-space: nowrap; }
.mass-action:disabled { cursor: not-allowed; opacity: .55; }
.table-wrap { overflow-x: auto; }
.users-table-panel table { width: 100%; min-width: 900px; border-collapse: collapse; table-layout: fixed; }
.users-table-panel th { height: 36px; padding: 0 12px; color: #64748b; background: #fafcfb; font-size: 11px; font-weight: 800; letter-spacing: .4px; text-align: left; }
.users-table-panel th:first-child, .users-table-panel td:first-child { width: 36px; text-align: center; }
.users-table-panel th:nth-child(2) { width: 24%; }.users-table-panel th:nth-child(3) { width: 17%; }.users-table-panel th:nth-child(4) { width: 17%; }.users-table-panel th:nth-child(5) { width: 16%; }.users-table-panel th:nth-child(6) { width: 11%; }.users-table-panel th:last-child { width: 13%; }
.users-table-panel td { height: 58px; padding: 8px 12px; border-top: 1px solid #eef2ef; color: #334155; font-size: 12px; vertical-align: middle; }
.users-table-panel tr.is-warning td { background: #fff8f4; }
.users-table-panel input[type='checkbox'] { width: 14px; height: 14px; accent-color: #087b61; }
.person-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }.person-cell > span:last-child { min-width: 0; }.person-cell b, .person-cell small, .users-table-panel td > b, .security-status, .account-status { display: block; }.person-cell b { overflow: hidden; color: #0f172a; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }.person-cell b i { color: #168d70; font-style: normal; }.person-cell small, .users-table-panel td > small, .security-status + small { margin-top: 2px; color: #64748b; font-size: 11px; }.person-cell code { color: #64748b; font-size: 11px; }.person-avatar { width: 26px; height: 26px; flex: none; display: grid; place-items: center; border-radius: 50%; color: #fff; font-size: 11px; font-weight: 800; }.person-avatar.coral { background: #f16b4a; }.person-avatar.green { background: #087b61; }.person-avatar.gold { background: #b56b00; }.person-avatar.mint { color: #087b61; background: #dff2ea; }.person-avatar.gray { color: #557267; background: #deebe5; }.person-avatar.blue { background: #2c97cf; }
.role-tag { display: inline-block; padding: 4px 8px; border-radius: 7px; font-size: 11px; font-weight: 700; white-space: nowrap; }.role-tag.coral { color: #dc5339; background: #ffebe6; }.role-tag.green, .role-tag.mint { color: #087b61; background: #e0f3eb; }.role-tag.gold { color: #967000; background: #fff5d8; }.role-tag.gray { color: #5d7067; background: #e8eeeb; }.role-tag.blue { color: #2388bd; background: #e4f4fc; }
.security-status { color: #0b9b6e; font-size: 11px; font-weight: 700; }.security-status.danger { color: #e55f41; }.account-status { color: #10a36f; font-size: 11px; font-weight: 700; }.account-status.menunggu { color: #e75d40; }.account-status.ditangguhkan { color: #8c9891; }.row-action { padding: 5px 8px; border: 0; border-radius: 6px; color: #087b61; background: #e4f3ec; font-size: 11px; font-weight: 800; }.is-warning .row-action { color: #fff; background: #eb6848; }.row-menu { margin-left: 4px; padding: 4px; border: 0; color: #8b9991; background: none; }.empty-users { height: 80px !important; color: #7c8b84 !important; text-align: center; }
.table-footer { min-height: 42px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 0 14px; color: #64748b; font-size: 12px; }.table-footer > div { display: flex; gap: 4px; }.table-footer button { min-width: 26px; height: 26px; padding: 0 6px; border: 1px solid #e2eae5; border-radius: 4px; color: #475569; background: #fff; font-size: 11px; }.table-footer button.current { color: #fff; border-color: #087b61; background: #087b61; }.table-footer button:disabled { opacity: .35; }
.user-bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }.access-matrix, .audit-preview { min-height: 265px; padding: 16px; border: 1px solid #e1e9e4; border-radius: 10px; background: #fff; }.access-matrix header, .audit-preview header { display: flex; justify-content: space-between; gap: 12px; }.access-matrix header > div, .audit-preview header > div { display: flex; gap: 8px; }.bottom-icon { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 6px; color: #087b61; background: #e1f4eb; font-size: 12px; }.bottom-icon.coral { color: #e76043; background: #fff0eb; }.access-matrix h2, .audit-preview h2 { margin: 0; font-size: 14px; }.access-matrix header p, .audit-preview header p { max-width: 310px; margin: 3px 0 0; color: #64748b; font-size: 11px; }.access-matrix header > small { color: #087b61; font-size: 11px; font-weight: 800; }.audit-preview header > i { width: 8px; height: 8px; margin-top: 4px; border-radius: 50%; background: #16a36e; }.access-row { position: relative; margin-top: 10px; padding: 8px 10px; border-radius: 6px; background: #f0f4f1; }.access-row b { display: inline-block; font-size: 12px; }.access-row span { float: right; padding: 2px 6px; border-radius: 4px; color: #087b61; background: #dcf1e7; font-size: 10px; font-weight: 800; }.access-row small { display: block; margin-top: 3px; color: #556b61; font-size: 11px; }.access-matrix > button, .audit-preview > button { margin-top: 12px; padding: 0; border: 0; color: #087b61; background: none; font-size: 11px; font-weight: 800; }.audit-event { display: flex; gap: 10px; margin-top: 10px; padding: 10px; border-radius: 6px; background: #f0f5f2; }.audit-event.critical { background: #fff0ed; }.audit-event > span { width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; color: #087b61; background: #daf0e5; font-size: 11px; }.audit-event.critical > span { color: #e15e42; background: #ffdad1; }.audit-event p { min-width: 0; margin: 0; }.audit-event b, .audit-event small, .audit-event time { display: block; }.audit-event b { font-size: 12px; }.audit-event code { color: #087b61; font-size: 11px; }.audit-event small, .audit-event time { margin-top: 2px; color: #64748b; font-size: 11px; }.audit-event time { color: #87968f; }
.user-modal-backdrop { position: fixed; z-index: 40; inset: 0; display: grid; place-items: center; padding: 20px; background: #18342a55; }.user-modal { width: min(420px, 100%); padding: 20px; border-radius: 12px; background: #fff; box-shadow: 0 18px 50px #173c2d28; }.user-modal header { display: flex; justify-content: space-between; }.user-modal header small { color: #087b61; font-size: 11px; font-weight: 800; }.user-modal h2 { margin: 4px 0 16px; font-size: 18px; }.user-modal header button { border: 0; background: none; font-size: 22px; }.user-modal label { display: block; margin-top: 12px; color: #334155; font-size: 12px; font-weight: 700; }.user-modal input { width: 100%; height: 38px; margin-top: 6px; padding: 0 10px; border: 1px solid #dce7e1; border-radius: 6px; outline-color: #087b61; font-size: 12px; }.user-modal p { color: #64748b; font-size: 11px; }.user-modal footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }.user-modal footer button { height: 36px; padding: 0 14px; border: 1px solid #dce7e1; border-radius: 6px; background: #fff; font-size: 12px; font-weight: 700; }
@media (max-width: 1050px) { .user-page-heading { align-items: flex-start; flex-direction: column; }.user-heading-actions { justify-content: flex-start; }.user-metrics { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 720px) { .user-access-content { padding: 18px 14px 26px; }.user-title-row h1 { font-size: 23px; }.security-banner { align-items: flex-start; flex-wrap: wrap; }.security-banner > button { margin-left: 37px; }.user-filters { flex-wrap: wrap; }.user-filters label { flex-basis: 100%; }.mass-action { margin-left: 0; }.user-bottom-grid { grid-template-columns: 1fr; }.user-metrics { gap: 6px; }.user-metrics article { min-height: 98px; }.user-tabs { gap: 14px; } }
</style>
