<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{ notify: [message: string] }>()

// State
const searchQuery = ref('')
const selectedCategory = ref('Semua')

// Modals
const isConfigModalOpen = ref(false)
const isAddModalOpen = ref(false)
const isPingModalOpen = ref(false)

interface ApiIntegration {
  id: string
  name: string
  provider: string
  category: 'OSS & Pemerintah' | 'Bank Himbara H2H' | 'Logistik & Kurir' | 'Sertifikasi & BPOM'
  description: string
  endpoint: string
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE'
  latencyMs: number
  uptimePercent: number
  errorRate: number
  enabled: boolean
  authType: 'OAuth 2.0 + mTLS' | 'ISO 8583 H2H' | 'HMAC SHA-256' | 'API Key Token'
  apiVersion: string
  lastSync: string
  dailyCalls: number
}

const integrations = ref<ApiIntegration[]>([
  {
    id: 'API-OSS-RBA',
    name: 'API OSS RBA Kementerian Investasi RI',
    provider: 'Kementerian Investasi / BKPM RI',
    category: 'OSS & Pemerintah',
    description: 'Validasi NIB, Risiko Usaha (RBA), KBLI, dan profil legalitas Toko UMKM terdaftar.',
    endpoint: 'https://api.oss.go.id/v2.1/nib/verify',
    status: 'ONLINE',
    latencyMs: 14,
    uptimePercent: 99.98,
    errorRate: 0.02,
    enabled: true,
    authType: 'OAuth 2.0 + mTLS',
    apiVersion: 'v2.1 (Production)',
    lastSync: '1 menit yang lalu',
    dailyCalls: 45200,
  },
  {
    id: 'API-BANK-MANDIRI',
    name: 'Bank Mandiri Escrow H2H Gateway',
    provider: 'PT Bank Mandiri (Persero) Tbk',
    category: 'Bank Himbara H2H',
    description: 'Penyimpanan Rekber escrow, pencairan otomatis saldo penjual, dan Auto-Settlement ISO 8583.',
    endpoint: 'https://h2h.bankmandiri.co.id/v3/escrow/settlement',
    status: 'ONLINE',
    latencyMs: 18,
    uptimePercent: 99.99,
    errorRate: 0.01,
    enabled: true,
    authType: 'ISO 8583 H2H',
    apiVersion: 'v3.0 Enterprise',
    lastSync: '28 detik yang lalu',
    dailyCalls: 384500,
  },
  {
    id: 'API-BANK-BRI',
    name: 'Bank BRI Rekber & Payout API',
    provider: 'PT Bank Rakyat Indonesia (Persero) Tbk',
    category: 'Bank Himbara H2H',
    description: 'Inquiry rekening penjual, fasilitas pencairan dana cepat (Fast-Disbursement), & Virtual Account.',
    endpoint: 'https://api.bri.co.id/v3/disbursement/transfer',
    status: 'ONLINE',
    latencyMs: 22,
    uptimePercent: 99.95,
    errorRate: 0.04,
    enabled: true,
    authType: 'OAuth 2.0 + mTLS',
    apiVersion: 'v3.0 Open Banking',
    lastSync: '45 detik yang lalu',
    dailyCalls: 412000,
  },
  {
    id: 'API-BANK-BNI',
    name: 'Bank BNI Escrow & VA Connector',
    provider: 'PT Bank Negara Indonesia (Persero) Tbk',
    category: 'Bank Himbara H2H',
    description: 'Multi-channel Virtual Account, konfirmasi otomatis pembayaran escrow, dan mutasi saldo.',
    endpoint: 'https://api.bni.co.id/v3/va/payment-notify',
    status: 'ONLINE',
    latencyMs: 16,
    uptimePercent: 99.97,
    errorRate: 0.02,
    enabled: true,
    authType: 'OAuth 2.0 + mTLS',
    apiVersion: 'v3.0 Enterprise',
    lastSync: '12 detik yang lalu',
    dailyCalls: 295000,
  },
  {
    id: 'API-BANK-BSI',
    name: 'Bank BSI Syariah Escrow Gateway',
    provider: 'PT Bank Syariah Indonesia Tbk',
    category: 'Bank Himbara H2H',
    description: 'Penyimpanan escrow akad syariah (Wadiah/Mudharabah) & pencairan ke mitra UMKM syariah.',
    endpoint: 'https://api.bankbsi.co.id/v2.4/escrow/syariah',
    status: 'ONLINE',
    latencyMs: 19,
    uptimePercent: 99.96,
    errorRate: 0.03,
    enabled: true,
    authType: 'OAuth 2.0 + mTLS',
    apiVersion: 'v2.4 Syariah API',
    lastSync: '2 menit yang lalu',
    dailyCalls: 184000,
  },
  {
    id: 'API-KURIR-POS',
    name: 'Webhook Logistik Pos Indonesia 3T',
    provider: 'PT Pos Indonesia (Persero)',
    category: 'Logistik & Kurir',
    description: 'Afirmasi subsidi ongkos kirim kargo udara/laut daerah 3T & tracking nomor resi real-time.',
    endpoint: 'https://api.posindonesia.co.id/v2/cargo/subsidy-track',
    status: 'ONLINE',
    latencyMs: 12,
    uptimePercent: 99.99,
    errorRate: 0.01,
    enabled: true,
    authType: 'HMAC SHA-256',
    apiVersion: 'v2.0 Logistic',
    lastSync: 'Real-time Webhook',
    dailyCalls: 128900,
  },
  {
    id: 'API-BPJPH-HALAL',
    name: 'API BPJPH Kemenag (Sertifikat Halal)',
    provider: 'BPJPH Kementerian Agama RI',
    category: 'Sertifikasi & BPOM',
    description: 'Verifikasi keaslian nomor sertifikat halal LPPOM & tanggal kadaluarsa sertifikasi produk.',
    endpoint: 'https://api.halal.go.id/v1/certificate/verify',
    status: 'ONLINE',
    latencyMs: 25,
    uptimePercent: 99.90,
    errorRate: 0.08,
    enabled: true,
    authType: 'API Key Token',
    apiVersion: 'v1.2 Public API',
    lastSync: '5 menit yang lalu',
    dailyCalls: 32000,
  },
  {
    id: 'API-BPOM-SPPIRT',
    name: 'API BPOM & SPP-IRT Registry',
    provider: 'Badan Pengawas Obat & Makanan RI',
    category: 'Sertifikasi & BPOM',
    description: 'Validasi otomatis izin edar pangan olahan, kosmetik, dan herbal produk UMKM terdaftar.',
    endpoint: 'https://cekbpom.pom.go.id/api/v1/produk/check',
    status: 'ONLINE',
    latencyMs: 20,
    uptimePercent: 99.92,
    errorRate: 0.05,
    enabled: true,
    authType: 'API Key Token',
    apiVersion: 'v1.0 Standard',
    lastSync: '8 menit yang lalu',
    dailyCalls: 19400,
  },
])

// Mock Live Webhook Traffic Log
interface WebhookLog {
  id: string
  time: string
  service: string
  method: 'GET' | 'POST' | 'PUT'
  status: number
  latency: number
  payloadSummary: string
}

const liveTrafficLogs = ref<WebhookLog[]>([
  { id: 'REQ-8841', time: '19:30:12', service: 'API OSS RBA', method: 'POST', status: 200, latency: 14, payloadSummary: 'NIB 9120003412091 -> VERIFIED (Resiko Low)' },
  { id: 'REQ-8840', time: '19:30:05', service: 'Bank Mandiri H2H', method: 'POST', status: 200, latency: 18, payloadSummary: 'Batch Payout #DISB-20241027-009 -> SETTLED' },
  { id: 'REQ-8839', time: '19:29:54', service: 'Pos Indonesia Webhook', method: 'POST', status: 200, latency: 11, payloadSummary: 'Resi POS-3T-8819 -> DELIVERED (Subsidy 65%)' },
  { id: 'REQ-8838', time: '19:29:40', service: 'Bank BRI API', method: 'POST', status: 200, latency: 22, payloadSummary: 'VA Inquiry #88091240192 -> MATCHED' },
  { id: 'REQ-8837', time: '19:29:18', service: 'BPJPH Halal', method: 'GET', status: 200, latency: 25, payloadSummary: 'Cert ID LPPOM-00129841 -> VALID' },
])

// Active selected integration for config modal or ping test modal
const selectedIntegration = ref<ApiIntegration | null>(null)

// Config Form State
const configForm = ref({
  baseUrl: '',
  clientId: '',
  clientSecret: '',
  timeoutMs: 5000,
  environment: 'PRODUCTION',
  mtlsCertificate: 'client_cert_prod_2024.pem',
})

// Ping Test State
const pingResult = ref<{ loading: boolean; success: boolean | null; latency: number; responsePayload: string }>({
  loading: false,
  success: null,
  latency: 0,
  responsePayload: '',
})

// Add Integration Form State
const newIntegrationForm = ref({
  name: '',
  provider: '',
  category: 'OSS & Pemerintah' as ApiIntegration['category'],
  endpoint: '',
  authType: 'OAuth 2.0 + mTLS' as ApiIntegration['authType'],
  description: '',
})

// Filtered Integrations
const filteredIntegrations = computed(() => {
  return integrations.value.filter((item) => {
    const matchesCategory = selectedCategory.value === 'Semua' || item.category === selectedCategory.value
    const matchesSearch =
      searchQuery.value === '' ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.endpoint.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

// Methods
function openConfigModal(item: ApiIntegration) {
  selectedIntegration.value = item
  configForm.value = {
    baseUrl: item.endpoint,
    clientId: `client_id_${item.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    clientSecret: '••••••••••••••••••••••••••••••••',
    timeoutMs: item.latencyMs * 100,
    environment: 'PRODUCTION',
    mtlsCertificate: `${item.id.toLowerCase()}_prod_cert.crt`,
  }
  isConfigModalOpen.value = true
}

function openPingModal(item: ApiIntegration) {
  selectedIntegration.value = item
  pingResult.value = { loading: false, success: null, latency: 0, responsePayload: '' }
  isPingModalOpen.value = true
}

function runPingTest() {
  if (!selectedIntegration.value) return
  pingResult.value.loading = true
  pingResult.value.success = null

  setTimeout(() => {
    pingResult.value.loading = false
    pingResult.value.success = true
    pingResult.value.latency = selectedIntegration.value?.latencyMs || 18
    pingResult.value.responsePayload = JSON.stringify(
      {
        status: 200,
        gateway: selectedIntegration.value?.name,
        provider: selectedIntegration.value?.provider,
        timestamp: new Date().toISOString(),
        auth_status: 'AUTHORIZED_MTLS_VALID',
        latency_ms: pingResult.value.latency,
        health: 'HEALTHY_OPERATIONAL',
      },
      null,
      2
    )
    emit('notify', `Uji Ping ke ${selectedIntegration.value?.name} BERHASIL (Latensi: ${pingResult.value.latency}ms).`)
  }, 750)
}

function handleSaveConfig() {
  isConfigModalOpen.value = false
  emit('notify', `Konfigurasi kredensial untuk ${selectedIntegration.value?.name} berhasil diperbarui & tersimpan.`)
}

function handleAddIntegration() {
  if (!newIntegrationForm.value.name || !newIntegrationForm.value.endpoint) {
    emit('notify', 'Mohon isi nama integrasi dan URL endpoint.')
    return
  }

  const newId = `API-CUST-${Date.now().toString().slice(-4)}`
  integrations.value.push({
    id: newId,
    name: newIntegrationForm.value.name,
    provider: newIntegrationForm.value.provider || 'Mitra Pihak Ketiga',
    category: newIntegrationForm.value.category,
    description: newIntegrationForm.value.description || 'Integrasi kustom gateway API.',
    endpoint: newIntegrationForm.value.endpoint,
    status: 'ONLINE',
    latencyMs: 15,
    uptimePercent: 100.0,
    errorRate: 0.0,
    enabled: true,
    authType: newIntegrationForm.value.authType,
    apiVersion: 'v1.0 Kustom',
    lastSync: 'Baru ditambahkan',
    dailyCalls: 0,
  })

  isAddModalOpen.value = false
  emit('notify', `Integrasi API "${newIntegrationForm.value.name}" berhasil ditambahkan.`)
  newIntegrationForm.value = {
    name: '',
    provider: '',
    category: 'OSS & Pemerintah',
    endpoint: '',
    authType: 'OAuth 2.0 + mTLS',
    description: '',
  }
}

function pingAllGateways() {
  emit('notify', 'Memulai pengujian ping masal ke seluruh 8 Gateway API...')
  setTimeout(() => {
    emit('notify', '✓ Seluruh 8 Gateway API Merespon Normal (Rata-rata Latensi: 17.8ms).')
  }, 1200)
}

function toggleService(item: ApiIntegration) {
  item.enabled = !item.enabled
  emit('notify', `Gateway ${item.name} telah di-${item.enabled ? 'aktifkan' : 'nonaktifkan'}.`)
}
</script>

<template>
  <div class="api-workspace">
    <!-- Clean Page Header -->
    <header class="page-heading">
      <div class="heading-copy">
        <div class="admin-breadcrumb">ADMIN CONSOLE &nbsp;›&nbsp; <b>INTEGRASI API & GATEWAY</b></div>
        <h1>Manajemen Integrasi API OSS & Gateway Bank</h1>
      </div>

      <div class="heading-actions">
        <button class="btn-secondary" type="button" @click="pingAllGateways">
          <span class="icon">↻</span> Uji Ping Semua Gateway
        </button>
        <button class="btn-primary" type="button" @click="isAddModalOpen = true">
          <span class="icon">＋</span> Tambah Integrasi API
        </button>
      </div>
    </header>

    <!-- Clean Health KPI Cards -->
    <section class="kpi-grid">
      <article class="kpi-card" title="100% Operational • 0 Outage">
        <span class="kpi-label">Total Endpoints</span>
        <div class="kpi-val">{{ integrations.length }} <small>Gateway</small></div>
        <span class="delta-pill mint">100% Operational</span>
      </article>

      <article class="kpi-card" title="Optimal Speed • Target SLA < 50ms">
        <span class="kpi-label">Rata-Rata Latensi H2H</span>
        <div class="kpi-val">17.8 <small>ms</small></div>
        <span class="delta-pill blue">Optimal Speed</span>
      </article>

      <article class="kpi-card" title="Success Rate 99.98% • Auto-Retry Active">
        <span class="kpi-label">Total API Calls (Harian)</span>
        <div class="kpi-val">1.48 M <small>Req/Day</small></div>
        <span class="delta-pill purple">Success 99.98%</span>
      </article>

      <article class="kpi-card" title="ISO 8583 & 27001 • Signed Handshake">
        <span class="kpi-label">Protokol Keamanan</span>
        <div class="kpi-val">mTLS <small>AES-256</small></div>
        <span class="delta-pill amber">ISO 8583 & 27001</span>
      </article>
    </section>

    <!-- Toolbar Filters -->
    <section class="toolbar-section">
      <div class="category-tabs">
        <button
          v-for="cat in ['Semua', 'OSS & Pemerintah', 'Bank Himbara H2H', 'Logistik & Kurir', 'Sertifikasi & BPOM']"
          :key="cat"
          type="button"
          :class="['tab-btn', { active: selectedCategory === cat }]"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Cari nama API, provider, endpoint..."
          aria-label="Cari integrasi API"
        />
      </div>
    </section>

    <!-- Integration Cards Grid -->
    <section class="integrations-grid">
      <article
        v-for="item in filteredIntegrations"
        :key="item.id"
        :class="['integration-card', { disabled: !item.enabled }]"
      >
        <div class="card-header">
          <div class="provider-info">
            <span class="category-chip">{{ item.category }}</span>
            <h3>{{ item.name }}</h3>
            <small class="provider-name">Provider: <b>{{ item.provider }}</b></small>
          </div>

          <div class="status-toggle">
            <span :class="['status-dot', item.status.toLowerCase()]"></span>
            <span class="status-label">{{ item.status }}</span>
            <button
              class="switch"
              :class="{ on: item.enabled }"
              type="button"
              role="switch"
              :aria-checked="item.enabled"
              :aria-label="`Aktifkan ${item.name}`"
              @click="toggleService(item)"
            >
              <span></span>
            </button>
          </div>
        </div>

        <p class="card-desc">{{ item.description }}</p>

        <div class="endpoint-box">
          <small>ENDPOINT URL</small>
          <code>{{ item.endpoint }}</code>
        </div>

        <div class="metrics-row">
          <div class="metric-item">
            <small>LATENSI</small>
            <b>{{ item.latencyMs }} ms</b>
          </div>
          <div class="metric-item">
            <small>UPTIME</small>
            <b class="green-text">{{ item.uptimePercent }}%</b>
          </div>
          <div class="metric-item">
            <small>ERROR RATE</small>
            <b>{{ item.errorRate }}%</b>
          </div>
          <div class="metric-item">
            <small>AUTENTIKASI</small>
            <b class="auth-text">{{ item.authType }}</b>
          </div>
        </div>

        <div class="card-footer">
          <span class="sync-info">⚡ {{ item.lastSync }}</span>
          <div class="card-actions">
            <button class="btn-outline" type="button" @click="openPingModal(item)">
              ⚡ Ping Test
            </button>
            <button class="btn-outline highlight" type="button" @click="openConfigModal(item)">
              ⚙ Konfigurasi Key
            </button>
          </div>
        </div>
      </article>
    </section>

    <!-- Live Webhook & Traffic Stream Terminal -->
    <section class="traffic-section">
      <div class="traffic-header">
        <div class="traffic-title">
          <span class="terminal-dot"></span>
          <h2>Live Webhook & Request Traffic Stream (Gateway Monitor)</h2>
        </div>
        <span class="refresh-badge">Auto-Refresh Real-Time</span>
      </div>

      <div class="terminal-box">
        <table class="traffic-table">
          <thead>
            <tr>
              <th>TIME</th>
              <th>REQUEST ID</th>
              <th>SERVICE GATEWAY</th>
              <th>METHOD</th>
              <th>STATUS CODE</th>
              <th>LATENCY</th>
              <th>PAYLOAD SUMMARY / RESPONSE</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in liveTrafficLogs" :key="log.id">
              <td><code>{{ log.time }}</code></td>
              <td><span class="req-id">{{ log.id }}</span></td>
              <td><b>{{ log.service }}</b></td>
              <td><span class="method-tag">{{ log.method }}</span></td>
              <td><span class="code-badge success">{{ log.status }} OK</span></td>
              <td><code>{{ log.latency }}ms</code></td>
              <td><small class="payload-text">{{ log.payloadSummary }}</small></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Modal 1: Configure Credentials & Keys -->
    <div
      v-if="isConfigModalOpen && selectedIntegration"
      class="modal-backdrop"
      @click.self="isConfigModalOpen = false"
      @keydown.esc="isConfigModalOpen = false"
    >
      <section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="config-title">
        <header class="modal-header">
          <div>
            <small>KREDENSIAL & GATEWAY SECURITY</small>
            <h2 id="config-title">Konfigurasi API {{ selectedIntegration.name }}</h2>
          </div>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isConfigModalOpen = false">×</button>
        </header>

        <form @submit.prevent="handleSaveConfig" class="modal-body">
          <label class="form-field">
            <span>Base Endpoint URL</span>
            <input v-model="configForm.baseUrl" type="text" required />
          </label>

          <div class="form-row">
            <label class="form-field">
              <span>Client ID / App ID</span>
              <input v-model="configForm.clientId" type="text" required />
            </label>

            <label class="form-field">
              <span>Environment</span>
              <select v-model="configForm.environment">
                <option value="PRODUCTION">PRODUCTION (Live)</option>
                <option value="SANDBOX">SANDBOX / STAGING</option>
              </select>
            </label>
          </div>

          <label class="form-field">
            <span>Client Secret / Private Key Token</span>
            <input v-model="configForm.clientSecret" type="password" required />
          </label>

          <div class="form-row">
            <label class="form-field">
              <span>Sertifikat mTLS File (.pem/.crt)</span>
              <input v-model="configForm.mtlsCertificate" type="text" />
            </label>

            <label class="form-field">
              <span>Timeout Limit (ms)</span>
              <input v-model.number="configForm.timeoutMs" type="number" step="100" />
            </label>
          </div>

          <div class="sec-notice">
            <span>🔒 Kredensial disimpan dengan enkripsi hardware HSM AES-256 (ISO 27001 Enforced).</span>
          </div>

          <footer class="modal-footer">
            <button type="button" class="btn-secondary" @click="isConfigModalOpen = false">Batal</button>
            <button type="submit" class="btn-primary">✓ Simpan Konfigurasi</button>
          </footer>
        </form>
      </section>
    </div>

    <!-- Modal 2: Ping Test Console -->
    <div
      v-if="isPingModalOpen && selectedIntegration"
      class="modal-backdrop"
      @click.self="isPingModalOpen = false"
      @keydown.esc="isPingModalOpen = false"
    >
      <section class="modal-dialog large-modal" role="dialog" aria-modal="true" aria-labelledby="ping-title">
        <header class="modal-header">
          <div>
            <small>GATEWAY HEALTH TESTER</small>
            <h2 id="ping-title">Ping & Handshake Console: {{ selectedIntegration.name }}</h2>
          </div>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isPingModalOpen = false">×</button>
        </header>

        <div class="modal-body">
          <div class="ping-target-card">
            <div>
              <b>Target Endpoint:</b> <code>{{ selectedIntegration.endpoint }}</code>
            </div>
            <div>
              <b>Method:</b> <code>POST</code> &nbsp;•&nbsp; <b>Auth:</b> <code>{{ selectedIntegration.authType }}</code>
            </div>
          </div>

          <div class="ping-trigger-row">
            <button class="btn-primary" type="button" :disabled="pingResult.loading" @click="runPingTest">
              <span v-if="pingResult.loading">⌁ Mengirim Request Handshake...</span>
              <span v-else>⚡ Eksekusi Ping Handshake Now</span>
            </button>
          </div>

          <div v-if="pingResult.responsePayload" class="ping-response-box">
            <div class="ping-res-header">
              <span class="badge-mint">STATUS 200 OK</span>
              <span>Latensi Terukur: <b>{{ pingResult.latency }} ms</b></span>
            </div>
            <pre><code>{{ pingResult.responsePayload }}</code></pre>
          </div>
        </div>

        <footer class="modal-footer">
          <button type="button" class="btn-secondary" @click="isPingModalOpen = false">Tutup</button>
        </footer>
      </section>
    </div>

    <!-- Modal 3: Add New Integration -->
    <div
      v-if="isAddModalOpen"
      class="modal-backdrop"
      @click.self="isAddModalOpen = false"
      @keydown.esc="isAddModalOpen = false"
    >
      <section class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="add-title">
        <header class="modal-header">
          <div>
            <small>INTEGRASI KUSTOM</small>
            <h2 id="add-title">Tambah Gateway API Baru</h2>
          </div>
          <button type="button" class="btn-close" aria-label="Tutup" @click="isAddModalOpen = false">×</button>
        </header>

        <form @submit.prevent="handleAddIntegration" class="modal-body">
          <label class="form-field">
            <span>Nama Integrasi API *</span>
            <input v-model="newIntegrationForm.name" type="text" placeholder="misal: Gateway API Asuransi Cargo UMKM" required />
          </label>

          <div class="form-row">
            <label class="form-field">
              <span>Provider / Instansi</span>
              <input v-model="newIntegrationForm.provider" type="text" placeholder="misal: PT Asuransi Jasindo" />
            </label>

            <label class="form-field">
              <span>Kategori Integrasi</span>
              <select v-model="newIntegrationForm.category">
                <option value="OSS & Pemerintah">OSS & Pemerintah</option>
                <option value="Bank Himbara H2H">Bank Himbara H2H</option>
                <option value="Logistik & Kurir">Logistik & Kurir</option>
                <option value="Sertifikasi & BPOM">Sertifikasi & BPOM</option>
              </select>
            </label>
          </div>

          <label class="form-field">
            <span>Base Endpoint URL *</span>
            <input v-model="newIntegrationForm.endpoint" type="url" placeholder="https://api.provider.co.id/v1/endpoint" required />
          </label>

          <label class="form-field">
            <span>Metode Autentikasi</span>
            <select v-model="newIntegrationForm.authType">
              <option value="OAuth 2.0 + mTLS">OAuth 2.0 + mTLS Handshake</option>
              <option value="ISO 8583 H2H">ISO 8583 H2H Socket</option>
              <option value="HMAC SHA-256">HMAC SHA-256 Webhook</option>
              <option value="API Key Token">API Key Bearer Token</option>
            </select>
          </label>

          <label class="form-field">
            <span>Deskripsi Singkat</span>
            <textarea v-model="newIntegrationForm.description" rows="2" placeholder="Fungsi dan kegunaan gateway API ini..."></textarea>
          </label>

          <footer class="modal-footer">
            <button type="button" class="btn-secondary" @click="isAddModalOpen = false">Batal</button>
            <button type="submit" class="btn-primary">✓ Tambah Endpoint</button>
          </footer>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.api-workspace {
  padding: 24px;
  background: #f8fafc;
  color: #0f172a;
  font-family: 'Poppins', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header */
.api-header {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #ffffff;
  padding: 24px 28px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.header-main {
  max-width: 760px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #6ee7b7;
  margin-bottom: 12px;
  border: 1px solid rgba(110, 231, 183, 0.2);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
}

.divider {
  opacity: 0.4;
}

.header-main h1 {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #ffffff;
  line-height: 1.3;
}

.header-main p {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #059669, #047857);
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #047857, #065f46);
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.kpi-icon {
  font-size: 18px;
  color: #94a3b8;
}

.kpi-val {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}

.kpi-val small {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.kpi-sub {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #64748b;
}

.badge-mint {
  background: #ecfdf5;
  color: #059669;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.badge-blue {
  background: #eff6ff;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.badge-amber {
  background: #fffbeb;
  color: #d97706;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.badge-purple {
  background: #faf5ff;
  color: #9333ea;
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

/* Toolbar Filters */
.toolbar-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.category-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: #f1f5f9;
}

.tab-btn.active {
  background: #0f172a;
  color: #ffffff;
  border-color: #0f172a;
}

.search-box {
  position: relative;
  min-width: 260px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 14px;
}

.search-box input {
  width: 100%;
  padding: 8px 12px 8px 34px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 13px;
  outline: none;
  background: #ffffff;
}

.search-box input:focus {
  border-color: #059669;
}

/* Integrations Grid */
.integrations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 16px;
}

.integration-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.03);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;
  transition: all 0.2s ease;
}

.integration-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.06);
}

.integration-card.disabled {
  opacity: 0.65;
  background: #f8fafc;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.provider-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-chip {
  font-size: 10px;
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.provider-info h3 {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.provider-name {
  font-size: 11px;
  color: #64748b;
}

.status-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.status-dot.degraded {
  background: #f59e0b;
}

.status-label {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
}

.switch {
  width: 38px;
  height: 22px;
  background: #cbd5e1;
  border-radius: 12px;
  border: none;
  padding: 2px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.switch.on {
  background: #059669;
}

.switch span {
  display: block;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform 0.2s ease;
}

.switch.on span {
  transform: translateX(16px);
}

.card-desc {
  font-size: 12px;
  color: #475569;
  margin: 0;
  line-height: 1.5;
}

.endpoint-box {
  background: #f1f5f9;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.endpoint-box small {
  font-size: 9px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.5px;
}

.endpoint-box code {
  font-size: 11px;
  font-family: monospace;
  color: #0f172a;
  word-break: break-all;
}

.metrics-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  background: #f8fafc;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-item small {
  font-size: 9px;
  font-weight: 700;
  color: #64748b;
}

.metric-item b {
  font-size: 12px;
  color: #0f172a;
}

.green-text {
  color: #059669 !important;
}

.auth-text {
  font-size: 10px !important;
  color: #2563eb !important;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}

.sync-info {
  font-size: 11px;
  color: #64748b;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.btn-outline {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.btn-outline.highlight {
  border-color: #a7f3d0;
  color: #059669;
}

.btn-outline.highlight:hover {
  background: #ecfdf5;
}

/* Traffic Terminal Section */
.traffic-section {
  background: #0f172a;
  color: #f8fafc;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
}

.traffic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.traffic-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.terminal-dot {
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 10px #10b981;
}

.traffic-title h2 {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.refresh-badge {
  font-size: 11px;
  font-weight: 600;
  color: #6ee7b7;
  background: rgba(16, 185, 129, 0.15);
  padding: 4px 10px;
  border-radius: 12px;
}

.terminal-box {
  overflow-x: auto;
}

.traffic-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}

.traffic-table th {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 10px 12px;
  border-bottom: 1px solid #334155;
}

.traffic-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #1e293b;
  vertical-align: middle;
}

.req-id {
  font-family: monospace;
  color: #38bdf8;
}

.method-tag {
  background: #1e293b;
  color: #a7f3d0;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 10px;
  font-weight: 700;
}

.code-badge.success {
  color: #4ade80;
  font-weight: 700;
}

.payload-text {
  color: #cbd5e1;
  font-family: monospace;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal-dialog {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-dialog.large-modal {
  max-width: 680px;
}

.modal-header {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header small {
  font-size: 10px;
  font-weight: 700;
  color: #059669;
  letter-spacing: 0.5px;
}

.modal-header h2 {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 2px 0 0 0;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 75vh;
  overflow-y: auto;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  font-family: inherit;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #059669;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.sec-notice {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 11px;
  color: #065f46;
  font-weight: 500;
}

.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* Ping Tester Styling */
.ping-target-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 14px;
  border-radius: 10px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #334155;
}

.ping-target-card code {
  color: #059669;
  font-family: monospace;
}

.ping-trigger-row {
  display: flex;
  justify-content: flex-start;
}

.ping-response-box {
  background: #0f172a;
  color: #f8fafc;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ping-res-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.ping-response-box pre {
  margin: 0;
  font-size: 11px;
  color: #4ade80;
  font-family: monospace;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .api-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .toolbar-section {
    flex-direction: column;
    align-items: stretch;
  }
  .form-row,
  .metrics-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
