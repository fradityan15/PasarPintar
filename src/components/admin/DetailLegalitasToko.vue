<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ notify: [message: string]; backToVerificationList: [] }>()

const isApproved = ref(false)
const activateOfficialStore = ref(true)
const sendNotification = ref(true)

// Modals State
const showDocModal = ref(false)
const selectedDocTitle = ref('')
const selectedDocType = ref('')

const showRevisionModal = ref(false)
const revisionNote = ref('')

const showRejectModal = ref(false)
const rejectReason = ref('')

function notify(msg: string) {
  emit('notify', msg)
}

function openDocViewer(title: string, type: string) {
  selectedDocTitle.value = title
  selectedDocType.value = type
  showDocModal.value = true
}

function approveStore() {
  isApproved.value = true
  notify('✓ Koperasi Tani Sindoro Sejahtera BERHASIL disetujui sebagai Toko Resmi PasarPintar!')
}

function submitRevision() {
  if (!revisionNote.value.trim()) return
  showRevisionModal.value = false
  notify(`Permintaan revisi dokumen telah dikirim ke pengurus Koperasi Tani Sindoro Sejahtera.`)
}

function submitRejection() {
  if (!rejectReason.value.trim()) return
  showRejectModal.value = false
  notify(`Pendaftaran toko ditolak. Notifikasi resmi dikirimkan ke email pendaftar.`)
}

function recheckOssApi() {
  notify('Menghubungkan ke API OSS RBA Kemenves & AHU... Status: 100% Valid Matched!')
}
</script>

<template>
  <div class="store-legality-content">
    <!-- Header Section -->
    <header class="page-heading">
      <div class="heading-copy">
        <div class="admin-breadcrumb">
          ADMIN CONSOLE &nbsp;›&nbsp;
          <a href="#back" @click.prevent="emit('backToVerificationList')">Verifikasi Toko</a> &nbsp;›&nbsp;
          <b>#VERIF-UMKM-2024-089</b>
        </div>

        <div class="status-pills-row">
          <span class="pill-status" :class="isApproved ? 'mint' : 'red'">
            ● {{ isApproved ? 'TERVERIFIKASI RESMI' : 'MENUNGGU VERIFIKASI' }}
          </span>
          <span class="pill-status teal">PRIORITAS DISPERINDAG</span>
        </div>

        <h1>Verifikasi Legalitas Toko: Koperasi Tani Sindoro Sejahtera</h1>
      </div>

      <div class="heading-actions">
        <button type="button" class="btn-outline" @click="showRevisionModal = true">
          ✎ Minta Revisi
        </button>
        <button type="button" class="btn-outline-red" @click="showRejectModal = true">
          🚫 Tolak
        </button>
        <button type="button" class="btn-primary" :disabled="isApproved" @click="approveStore">
          {{ isApproved ? '✓ Toko Resmi Aktif' : '✓ Setujui Toko Resmi' }}
        </button>
      </div>
    </header>

    <!-- OSS API Sync Status Banner -->
    <section class="oss-banner">
      <div class="banner-body">
        <div class="banner-title-row">
          <h2>Sinkronisasi API OSS BKPM: Status NIB Active 100% Valid Ditjen AHU</h2>
        </div>
      </div>
      <div class="banner-sync-info">
        <button type="button" class="btn-sync-api" @click="recheckOssApi">
          ↻ Cek Ulang API
        </button>
      </div>
    </section>

    <!-- Main Two Column Workspace -->
    <div class="workspace-grid">
      <!-- Left Main Column (68%) -->
      <div class="main-column">
        <!-- Profile & Sentra Info Card -->
        <article class="info-card">
          <header class="card-header">
            <div>
              <h2>Profil Usaha & Sentra Pengrajin</h2>
              <p>Data identitas operasional, geo-lokasi sentra, dan keanggotaan koperasi.</p>
            </div>
            <span class="badge-type">Koperasi Produksi</span>
          </header>

          <div class="profile-boxes-grid">
            <div class="profile-box">
              <small>ENTITAS BISNIS</small>
              <b>Koperasi Tani Sindoro Sejahtera</b>
              <span>Didirikan sejak tahun 2018 (6 Tahun)</span>
            </div>

            <div class="profile-box">
              <small>KLASTER KOMODITAS</small>
              <b>Kopi Nusantara & Olahan Rempah</b>
              <span>Sentra Dataran Tinggi Kedu</span>
            </div>

            <div class="profile-box">
              <small>KAPASITAS PRODUKSI</small>
              <b class="green-text">3.5 Ton / Bulan</b>
              <span>Green Beans & Roasted Beans</span>
            </div>
          </div>

          <div class="address-row">
            <div class="address-info">
              <small>ALAMAT GUDANG & SENTRA OLAHAN</small>
              <address>
                Jl. Sindoro Makmur No. 45, Desa Posong, Kledung, Kab. Temanggung, Jawa Tengah 56264
              </address>
              <a href="#maps" class="maps-link" @click.prevent="notify('Membuka koordinat Google Maps (-7.3378, 110.0142)...')">
                📍 Geolokasi Terverifikasi via Google Maps API (-7.3378, 110.0142)
              </a>
            </div>

            <div class="chairman-box">
              <small>PENANGGUNG JAWAB / KETUA KOPERASI</small>
              <div class="chairman-profile">
                <span class="avatar-circle">BS</span>
                <div>
                  <b>Bambang Setyawan, S.P.</b>
                  <span class="ktp-valid-badge">✓ KTP Valid</span>
                  <div class="nik-text">NIK: 3323081908810002</div>
                  <div class="phone-text">No. HP: +62 812-****-412 <span class="otp-badge">✓ Terverifikasi OTP</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="members-box">
            <div>
              <b>48 Petani Anggota Binaan</b>
              <span>Mencakup area 32 hektar lahan di lereng Sindoro</span>
            </div>
            <span class="badge-local">100% Petani Lokal</span>
          </div>

          <div class="description-box">
            <small>DESKRIPSI SINGKAT USAHA</small>
            <p>
              Koperasi perkebunan binaan Dinas Pertanian Kab. Temanggung yang memfokuskan hasil panen kopi Arabika & Robusta unggulan lereng Sindoro. Menggunakan sistem pasca-panen basah, pengolahan fermentasi terkonsep, dan pengeringan rumah kaca berstandar ekspor.
            </p>
          </div>
        </article>

        <!-- Document Legalities Card -->
        <article class="info-card">
          <header class="card-header">
            <div>
              <h2>Validasi Dokumen Legalitas & Sertifikasi</h2>
              <p>Pemeriksaan keaslian dokumen resmi pemerintah dan sertifikat produk.</p>
            </div>
            <span class="badge-type mint">✓ 4/4 Dokumen Lolos Uji Sistem</span>
          </header>

          <div class="docs-grid">
            <!-- Doc 1: NIB -->
            <div class="doc-item">
              <div class="doc-header">
                <span class="doc-type">PERIZINAN UTAMA</span>
                <span class="doc-status mint">✓ TERVALIDASI API</span>
              </div>
              <h3>Nomor Induk Berusaha (NIB)</h3>
              <div class="doc-num">9120008472910</div>
              <p class="doc-desc">
                KBLI: 10791 (Industri Pengolahan Kopi) & 01271 (Pertanian Kopi). Terdaftar di OSS RBA RI dengan risiko usaha menengah.
              </p>
              <div class="doc-footer">
                <span class="file-name">📄 NIB_Sindoro_Sejahtera_2024.pdf (2.4 MB)</span>
                <button type="button" class="btn-view-doc" @click="openDocViewer('Nomor Induk Berusaha (NIB)', 'PDF')">
                  👁 Lihat Dokumen
                </button>
              </div>
            </div>

            <!-- Doc 2: P-IRT -->
            <div class="doc-item">
              <div class="doc-header">
                <span class="doc-type">SERTIFIKAT HIGIENITAS</span>
                <span class="doc-status green">✓ LOLOS UJI DINKES</span>
              </div>
              <h3>Izin Edar Dinkes (P-IRT)</h3>
              <div class="doc-num">P-IRT 210332301048-26</div>
              <p class="doc-desc">
                Diterbitkan oleh Dinas Kesehatan Kab. Temanggung. Produk olahan krispi & kopi Grade A (Sanitasi Sangat Baik).
              </p>
              <div class="doc-footer">
                <span class="expiry-info">Berlaku s/d: 15 Okt 2028</span>
                <button type="button" class="btn-view-doc" @click="openDocViewer('Izin Edar Dinkes (P-IRT)', 'CERT')">
                  👁 Lihat Berkas
                </button>
              </div>
            </div>

            <!-- Doc 3: Halal -->
            <div class="doc-item">
              <div class="doc-header">
                <span class="doc-type">JAMINAN MUTU</span>
                <span class="doc-status mint">✓ HALAL RESMI</span>
              </div>
              <h3>Ketetapan Halal BPJPH Kemenag</h3>
              <div class="doc-num">ID3311000189204</div>
              <p class="doc-desc">
                Audit dari LPPOM MUI Jawa Tengah. Bahan baku 100% halal, bebas kontaminasi silang. Status sertifikasi aktif (pembaharuan berkala).
              </p>
              <div class="doc-footer">
                <span class="sk-info">SK Halal No: SH-270/BPJPH/2023</span>
                <button type="button" class="btn-view-doc" @click="openDocViewer('Ketetapan Halal BPJPH Kemenag', 'CERT')">
                  👁 Lihat Berkas
                </button>
              </div>
            </div>

            <!-- Doc 4: AHU / Akta -->
            <div class="doc-item">
              <div class="doc-header">
                <span class="doc-type">BADAN HUKUM</span>
                <span class="doc-status green">✓ AHU TERDAFTAR</span>
              </div>
              <h3>Akta & Pengesahan Kemenkumham RI</h3>
              <div class="doc-num">AHU-0019284.AH.01.26</div>
              <p class="doc-desc">
                Nomor pengesahan Kemenkumham S.K. Koperasi Pertanian dan Simpan Pinjam Sejahtera Temanggung dengan badan hukum sah.
              </p>
              <div class="doc-footer">
                <span class="file-name">📄 Akta_Pendirian_Koperasi.pdf</span>
                <button type="button" class="btn-view-doc" @click="openDocViewer('Akta Kemenkumham RI', 'PDF')">
                  👁 Lihat Berkas
                </button>
              </div>
            </div>
          </div>
        </article>

        <!-- Product Samples Preview Card -->
        <article class="info-card">
          <header class="card-header">
            <div>
              <h2>Pratinjau Sampel Katalog Produk</h2>
              <p>4 produk sampel pertama yang diunggah toko untuk tayang di etalase pasar.</p>
            </div>
            <span class="badge-type">3 Terkurasi Lolos</span>
          </header>

          <div class="products-sample-grid">
            <div class="sample-card">
              <div class="sample-img-wrap">
                <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=300&q=80" alt="Arabika Sindoro" />
                <span class="top-tag">Arabika Single Origin</span>
                <span class="curation-pill mint">✓ Lolos Kurasi Rasa</span>
              </div>
              <div class="sample-body">
                <code>SKU: SIN-ARA-WSH-250</code>
                <h3>Kopi Arabika Sindoro Washed Process...</h3>
                <small>Notes: Citrus, Brown Sugar, Clean Finish</small>
                <div class="sample-price">Rp 68.000</div>
                <div class="sample-footer">
                  <span>Stok Siap: 450 pck</span>
                  <span class="badge-tag">Kemasan Foodgrade</span>
                </div>
              </div>
            </div>

            <div class="sample-card">
              <div class="sample-img-wrap">
                <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&q=80" alt="Robusta Sindoro" />
                <span class="top-tag">Robusta Fermented</span>
                <span class="curation-pill mint">✓ Lolos Kurasi Kemasan</span>
              </div>
              <div class="sample-body">
                <code>SKU: TMG-ROB-TOT-500</code>
                <h3>Kopi Robusta Temanggung Full...</h3>
                <small>Notes: Dark Chocolate, Heavy Body, Spicy</small>
                <div class="sample-price">Rp 55.000</div>
                <div class="sample-footer">
                  <span>Stok Siap: 800 pck</span>
                  <span class="badge-tag">Valve Degassing</span>
                </div>
              </div>
            </div>

            <div class="sample-card">
              <div class="sample-img-wrap">
                <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&q=80" alt="Cascara Tea" />
                <span class="top-tag">Produk Sirkular</span>
                <span class="curation-pill green">✓ Inovasi Hijau</span>
              </div>
              <div class="sample-body">
                <code>SKU: CAS-TEA-SIN-100</code>
                <h3>Cascara Tea Kulit Kopi Sindoro 100gr</h3>
                <small>Teh kulit kopi kaya antioksidan & manis alami</small>
                <div class="sample-price">Rp 35.000</div>
                <div class="sample-footer">
                  <span>Stok Siap: 250 pck</span>
                  <span class="badge-tag">Zero-waste Bean</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Right Sidebar Column (32%) -->
      <aside class="sidebar-column">
        <!-- Score & Eligibility Card -->
        <article class="side-card">
          <header class="side-card-header">
            <span>SKOR KELAYAKAN PASARPINTAR</span>
            <span class="eligibility-tag">Kategori: Sangat Layak</span>
          </header>

          <div class="score-circle-wrap">
            <div class="donut-circle">
              <strong class="score-number">94</strong>
              <small>/ 100</small>
            </div>
            <p>Melampaui ambang batas minimum verifikasi nasional (75/100)</p>
          </div>

          <div class="metrics-list">
            <div class="metric-line">
              <span>Keaslian Komoditas Lokal</span>
              <strong>100%</strong>
            </div>
            <div class="metric-line">
              <span>Kelengkapan Legalitas (NIB, Halal, P-IRT)</span>
              <strong>100%</strong>
            </div>
            <div class="metric-line">
              <span>Standar Kemasan & Label Olahan</span>
              <strong>90%</strong>
            </div>
            <div class="metric-line">
              <span>Kesiapan Logistik & Kemitraan Stok</span>
              <strong>85%</strong>
            </div>
          </div>

          <div class="badges-box">
            <small>LENCANA VERIFIKASI OTOMATIS TERSEMIT</small>
            <div class="badges-row">
              <span class="badge-auto">🏛 Koperasi Binaan Daerah</span>
              <span class="badge-auto">✓ 100% Asli Nusantara</span>
            </div>
          </div>
        </article>

        <!-- Escrow Bank Account Card -->
        <article class="side-card">
          <header class="side-card-header">
            <span>REKENING REKBER PENCAIRAN SALDO</span>
            <span class="status-bank-tag">Sistem Bank BRI</span>
          </header>

          <div class="bank-details-box">
            <div class="bank-title-row">
              <b>Bank Rakyat Indonesia</b>
              <span class="verified-icon">✓</span>
            </div>
            <small>Kantor: Cabang Temanggung</small>

            <div class="bank-acc-number">0142-01-001928-53-4</div>
            <div class="bank-owner">Pemilik: <strong>KOPERASI TANI SINDORO SEJAHTERA</strong></div>

            <div class="match-notice">
              ✓ Nama rekening sesuai 100% dengan Akta Pendirian
            </div>
          </div>
        </article>

        <!-- Field Audit & Admin Decision Card -->
        <article class="side-card">
          <header class="side-card-header">
            <span>Audit Lapangan & Catatan Admin</span>
            <small class="internal-tag">Internal Only</small>
          </header>

          <div class="field-audit-box">
            <div class="auditor-header">
              <span class="auditor-avatar">HW</span>
              <div>
                <b>Hendra Wijaya</b>
                <small>Kurator Sentra Jateng</small>
              </div>
            </div>
            <p>
              "Telah dilakukan kunjungan dan validasi sarana pengolahan kopi di Posong. Fasilitas kelengkapan, pengawasan mutu standar food grade, dan pengurus koperasi siap melayani pesanan nasional."
            </p>
            <div class="audit-meta">
              <small>Validasi: 24 Okt 2024</small>
              <span class="recommend-pill">Rekomendasi Approval</span>
            </div>
          </div>

          <div class="decision-form">
            <small class="decision-title">CATATAN KEPUTUSAN VERIFIKATOR (SUPER ADMIN)</small>
            <p class="decision-summary">
              Dokumen lengkap, validitas NIB dan Halal terkonfirmasi sistem. Lolos uji kurasi produk komoditas prioritas Kemenkop UKM. Disetujui sebagai Toko Resmi PasarPintar.
            </p>

            <label class="check-option">
              <input type="checkbox" v-model="activateOfficialStore" />
              <span>Aktifkan status Official Store langsung ke halaman Beranda</span>
            </label>

            <label class="check-option">
              <input type="checkbox" v-model="sendNotification" />
              <span>Kirim notifikasi WhatsApp & Email resmi kelulusan ke Ketua UMKM</span>
            </label>

            <button type="button" class="btn-confirm-approval" :disabled="isApproved" @click="approveStore">
              {{ isApproved ? '✓ Toko Resmi Aktif' : '✓ Konfirmasi Persetujuan Toko' }}
            </button>
            <small class="disclaimer-text">Tindakan ini secara langsung mengaktifkan toko dan katalog di etalase PasarPintar secara nasional.</small>
          </div>
        </article>
      </aside>
    </div>

    <!-- Document Viewer Modal -->
    <div v-if="showDocModal" class="modal-backdrop" @click.self="showDocModal = false">
      <div class="modal-dialog doc-viewer-dialog">
        <header class="modal-header">
          <div>
            <small>PRATINJAU DOKUMEN RESMI</small>
            <h2>{{ selectedDocTitle }}</h2>
          </div>
          <button type="button" class="close-btn" @click="showDocModal = false">×</button>
        </header>

        <div class="modal-body">
          <div class="doc-paper-preview">
            <div class="stamp-verified">TERVALIDASI DITJEN AHU & BKPM</div>
            <div class="paper-header">
              <h3>REPUBLIK INDONESIA</h3>
              <h4>KEMENTERIAN INVESTASI / BKPM</h4>
            </div>
            <hr />
            <div class="paper-content">
              <p><strong>NAMA ENTITAS:</strong> KOPERASI TANI SINDORO SEJAHTERA</p>
              <p><strong>NOMOR NIB:</strong> 9120008472910</p>
              <p><strong>KABUPATEN:</strong> KABUPATEN TEMANGGUNG, JAWA TENGAH</p>
              <p><strong>STATUS:</strong> RESMI TERDAFTAR (RISIKO MENENGAH)</p>
            </div>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-primary" @click="showDocModal = false">Tutup Pratinjau</button>
        </footer>
      </div>
    </div>

    <!-- Revision Modal -->
    <div v-if="showRevisionModal" class="modal-backdrop" @click.self="showRevisionModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>REVISI DOKUMEN</small>
            <h2>Permintaan Revisi Dokumen Toko</h2>
          </div>
          <button type="button" class="close-btn" @click="showRevisionModal = false">×</button>
        </header>

        <div class="modal-body">
          <label class="form-group">
            <span>Catatan Revisi untuk UMKM *</span>
            <textarea v-model="revisionNote" placeholder="Jelaskan dokumen yang perlu diperbaiki (contoh: foto KTP buram, SK Halal kadaluarsa)..."></textarea>
          </label>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="showRevisionModal = false">Batal</button>
          <button type="button" class="btn-primary" @click="submitRevision">Kirim Revisi</button>
        </footer>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div v-if="showRejectModal" class="modal-backdrop" @click.self="showRejectModal = false">
      <div class="modal-dialog">
        <header class="modal-header">
          <div>
            <small>PENOLAKAN VERIFIKASI</small>
            <h2>Tolak Pendaftaran Toko</h2>
          </div>
          <button type="button" class="close-btn" @click="showRejectModal = false">×</button>
        </header>

        <div class="modal-body">
          <label class="form-group">
            <span>Alasan Penolakan Resmi *</span>
            <textarea v-model="rejectReason" placeholder="Ketik alasan penolakan pendaftaran toko..."></textarea>
          </label>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-cancel" @click="showRejectModal = false">Batal</button>
          <button type="button" class="btn-submit-red" @click="submitRejection">Konfirmasi Penolakan</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.store-legality-content {
  width: min(100%, 1280px);
  margin: 0 auto;
  padding: 24px 28px 36px;
  color: #0f172a;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  font-size: 13.5px;
  line-height: 1.5;
}

.store-legality-content * {
  box-sizing: border-box;
}

.store-legality-content button,
.store-legality-content input,
.store-legality-content select,
.store-legality-content textarea {
  font-family: inherit;
}

.store-legality-content button {
  cursor: pointer;
}

/* Page Heading */
.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 22px;
}

.heading-copy {
  max-width: 720px;
}

.admin-breadcrumb {
  margin-bottom: 8px;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

.admin-breadcrumb a {
  color: #64748b;
  text-decoration: none;
}

.admin-breadcrumb b {
  color: #059669;
}

.status-pills-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.pill-status {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 800;
}

.pill-status.red { color: #be123c; background: #fef2f2; }
.pill-status.mint { color: #047857; background: #ecfdf5; }
.pill-status.teal { color: #0f766e; background: #f0fdfa; }
.pill-status.gray { color: #475569; background: #f1f5f9; }

.submission-date {
  color: #64748b;
  font-size: 11px;
}

.page-heading h1 {
  margin: 0;
  color: #0f172a;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: -0.4px;
}

.heading-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 4px;
}

.btn-outline {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  background: #ffffff;
  font-size: 12.5px;
  font-weight: 600;
  transition: all 0.15s ease;
}

.btn-outline:hover {
  background: #f8fafc;
}

.btn-outline-red {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid #fecdd3;
  border-radius: 8px;
  color: #be123c;
  background: #fff1f2;
  font-size: 12.5px;
  font-weight: 600;
}

.btn-primary {
  min-height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #059669;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
  transition: background 0.15s ease;
}

.btn-primary:hover {
  background: #047857;
}

/* OSS Sync Banner */
.oss-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
  padding: 16px 20px;
  border: 1px solid #a7f3d0;
  border-radius: 12px;
  background: #ecfdf5;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.05);
}

.banner-icon-wrap {
  width: 42px;
  height: 42px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #059669;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);
}

.sync-icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
}

.banner-body {
  flex: 1;
  min-width: 0;
}

.banner-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.banner-title-row h2 {
  margin: 0;
  color: #065f46;
  font-size: 15px;
  font-weight: 800;
}

.pill-active {
  padding: 2px 8px;
  border-radius: 6px;
  color: #047857;
  background: #d1fae5;
  font-size: 10px;
  font-weight: 800;
}

.banner-body p {
  margin: 4px 0 0;
  color: #047857;
  font-size: 12.5px;
  line-height: 1.45;
}

.banner-sync-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex: none;
}

.banner-sync-info small {
  color: #047857;
  font-size: 11px;
}

.btn-sync-api {
  height: 34px;
  padding: 0 12px;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  color: #065f46;
  background: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
}

/* Workspace Grid */
.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 20px;
}

.main-column,
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card,
.side-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  padding: 18px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.card-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
}

.card-header p {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 12px;
}

.badge-type {
  padding: 3px 8px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.badge-type.mint {
  color: #047857;
  background: #ecfdf5;
}

/* Profile Boxes */
.profile-boxes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.profile-box {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.profile-box small {
  display: block;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.profile-box b {
  display: block;
  margin: 2px 0 2px;
  color: #0f172a;
  font-size: 13.5px;
}

.profile-box span {
  color: #64748b;
  font-size: 11px;
}

.green-text {
  color: #059669;
}

.address-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.address-info small {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.address-info address {
  margin-top: 4px;
  font-style: normal;
  color: #0f172a;
  font-size: 12.5px;
  line-height: 1.45;
}

.maps-link {
  display: inline-block;
  margin-top: 4px;
  color: #0284c7;
  font-size: 11.5px;
  font-weight: 600;
  text-decoration: none;
}

.chairman-box small {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.chairman-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}

.avatar-circle {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #059669;
  font-size: 12px;
  font-weight: 800;
}

.chairman-profile b {
  display: block;
  color: #0f172a;
  font-size: 13px;
}

.ktp-valid-badge {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 4px;
  color: #047857;
  background: #ecfdf5;
  font-size: 9.5px;
  font-weight: 800;
}

.nik-text, .phone-text {
  font-size: 11px;
  color: #64748b;
}

.otp-badge {
  color: #059669;
  font-weight: 700;
}

.members-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 8px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  margin-bottom: 16px;
}

.members-box b {
  display: block;
  color: #065f46;
  font-size: 13px;
}

.members-box span {
  color: #047857;
  font-size: 11.5px;
}

.badge-local {
  padding: 4px 8px;
  border-radius: 6px;
  color: #ffffff;
  background: #059669;
  font-size: 10.5px;
  font-weight: 800;
}

.description-box small {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.description-box p {
  margin: 4px 0 0;
  color: #334155;
  font-size: 12.5px;
  line-height: 1.5;
}

/* Documents Grid */
.docs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.doc-item {
  padding: 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.doc-type {
  color: #64748b;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.doc-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9.5px;
  font-weight: 800;
}

.doc-status.mint { color: #047857; background: #ecfdf5; }
.doc-status.green { color: #16a34a; background: #f0fdf4; }

.doc-item h3 {
  margin: 0 0 2px;
  color: #0f172a;
  font-size: 13.5px;
  font-weight: 800;
}

.doc-num {
  color: #059669;
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 6px;
}

.doc-desc {
  margin: 0 0 10px;
  color: #475569;
  font-size: 11.5px;
  line-height: 1.4;
}

.doc-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  font-size: 11px;
}

.file-name, .expiry-info, .sk-info {
  color: #64748b;
}

.btn-view-doc {
  padding: 4px 8px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #334155;
  background: #ffffff;
  font-size: 11px;
  font-weight: 700;
}

/* Products Sample Grid */
.products-sample-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.sample-card {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: #ffffff;
}

.sample-img-wrap {
  position: relative;
  height: 120px;
}

.sample-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.top-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  color: #ffffff;
  background: rgba(15, 23, 42, 0.8);
  font-size: 9.5px;
  font-weight: 700;
}

.curation-pill {
  position: absolute;
  bottom: 6px;
  right: 6px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 9.5px;
  font-weight: 800;
}

.curation-pill.mint { color: #ffffff; background: #059669; }
.curation-pill.green { color: #ffffff; background: #16a34a; }

.sample-body {
  padding: 10px;
}

.sample-body code {
  color: #64748b;
  font-size: 10px;
}

.sample-body h3 {
  margin: 2px 0 2px;
  color: #0f172a;
  font-size: 12.5px;
  font-weight: 800;
}

.sample-body small {
  display: block;
  color: #64748b;
  font-size: 11px;
  margin-bottom: 6px;
}

.sample-price {
  color: #059669;
  font-size: 14px;
  font-weight: 800;
  margin-bottom: 6px;
}

.sample-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  color: #64748b;
  padding-top: 6px;
  border-top: 1px solid #f1f5f9;
}

.badge-tag {
  color: #047857;
  font-weight: 700;
}

/* Sidebar Column Cards */
.side-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.eligibility-tag {
  color: #047857;
  font-size: 10.5px;
}

.score-circle-wrap {
  text-align: center;
  margin-bottom: 16px;
}

.donut-circle {
  width: 90px;
  height: 90px;
  margin: 0 auto 8px;
  border-radius: 50%;
  border: 6px solid #059669;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.score-number {
  color: #0f172a;
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
}

.donut-circle small {
  color: #64748b;
  font-size: 11px;
}

.score-circle-wrap p {
  margin: 0;
  color: #475569;
  font-size: 11.5px;
}

.metrics-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 11.5px;
}

.metric-line {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  border-radius: 6px;
  background: #f8fafc;
}

.metric-line span { color: #475569; }
.metric-line strong { color: #059669; }

.badges-box {
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.badges-box small {
  display: block;
  color: #64748b;
  font-size: 9.5px;
  font-weight: 800;
  margin-bottom: 6px;
}

.badges-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge-auto {
  padding: 3px 8px;
  border-radius: 6px;
  color: #047857;
  background: #ecfdf5;
  font-size: 10.5px;
  font-weight: 700;
}

/* Bank Box */
.status-bank-tag {
  color: #0284c7;
}

.bank-details-box {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.bank-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bank-title-row b {
  color: #00529c;
  font-size: 14px;
}

.verified-icon {
  width: 18px;
  height: 18px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #059669;
  font-size: 11px;
}

.bank-acc-number {
  margin: 8px 0 4px;
  font-family: monospace;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.bank-owner {
  font-size: 11.5px;
  color: #475569;
}

.match-notice {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e2e8f0;
  color: #059669;
  font-size: 11px;
  font-weight: 700;
}

/* Field Audit Box */
.internal-tag {
  color: #64748b;
}

.field-audit-box {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
  border-left: 3px solid #059669;
  margin-bottom: 14px;
}

.auditor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.auditor-avatar {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #ffffff;
  background: #059669;
  font-size: 11px;
  font-weight: 800;
}

.auditor-header b {
  display: block;
  color: #0f172a;
  font-size: 12.5px;
}

.auditor-header small {
  color: #64748b;
  font-size: 10.5px;
}

.field-audit-box p {
  margin: 0 0 8px;
  color: #475569;
  font-size: 11.5px;
  font-style: italic;
  line-height: 1.45;
}

.audit-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10.5px;
  color: #64748b;
}

.recommend-pill {
  color: #047857;
  font-weight: 700;
}

.decision-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.decision-title {
  color: #64748b;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.decision-summary {
  margin: 0;
  color: #334155;
  font-size: 12px;
  line-height: 1.45;
}

.check-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11.5px;
  color: #334155;
}

.check-option input {
  margin-top: 2px;
}

.btn-confirm-approval {
  height: 40px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #047857;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(4, 120, 87, 0.25);

}

.btn-confirm-approval:disabled {
  background: #059669;
  opacity: 0.8;
}

.disclaimer-text {
  color: #64748b;
  font-size: 10.5px;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  z-index: 50;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
}

.modal-dialog {
  width: min(500px, 100%);
  padding: 24px;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.2);
}

.doc-viewer-dialog {
  width: min(600px, 100%);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.modal-header small {
  color: #059669;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.modal-header h2 {
  margin: 2px 0 0;
  color: #0f172a;
  font-size: 18px;
  font-weight: 800;
}

.close-btn {
  border: 0;
  background: transparent;
  font-size: 24px;
  color: #64748b;
}

.doc-paper-preview {
  position: relative;
  padding: 20px;
  border-radius: 8px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #451a03;
}

.stamp-verified {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 4px 8px;
  border: 2px solid #059669;
  color: #059669;
  font-weight: 900;
  font-size: 11px;
  transform: rotate(-10deg);
}

.paper-header h3 { margin: 0; font-size: 16px; text-align: center; }
.paper-header h4 { margin: 2px 0 0; font-size: 13px; text-align: center; color: #b45309; }

.paper-content { margin-top: 14px; font-size: 12.5px; }

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  font-weight: 700;
}

.form-group textarea {
  height: 80px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12.5px;
  outline: 0;
  resize: vertical;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}

.btn-cancel {
  height: 38px;
  padding: 0 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #334155;
  background: #ffffff;
  font-size: 12.5px;
  font-weight: 700;
}

.btn-submit-red {
  height: 38px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #be123c;
  font-size: 12.5px;
  font-weight: 700;
}

@media (max-width: 1080px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .profile-boxes-grid { grid-template-columns: 1fr; }
  .products-sample-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .page-heading { flex-direction: column; }
  .oss-banner { flex-direction: column; align-items: flex-start; }
  .address-row { grid-template-columns: 1fr; }
  .docs-grid { grid-template-columns: 1fr; }
}
</style>
