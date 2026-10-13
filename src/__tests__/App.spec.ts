import { afterEach, describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mounts renders properly', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Kain Tenun Ikat Sumba Motif Pahikung')
    expect(wrapper.find('.location-control').exists()).toBe(false)
  })

  it('keeps category filtering in the header without the duplicate category bar', async () => {
    const wrapper = mount(App)

    expect(wrapper.find('.category-nav').exists()).toBe(false)
    expect(wrapper.find('#kategori').exists()).toBe(true)
    expect(wrapper.get('.search-box select').element).toBeTruthy()
    await wrapper.get('.search-box select').setValue('Wastra & Kriya')
    expect(wrapper.get('.search-box select').element).toHaveProperty('value', 'Wastra & Kriya')
  })

  it('opens the cart and starts checkout from the home page', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.curated-grid button[aria-label="Tambah ke Keranjang"]').trigger('click')
    expect(wrapper.get('.cart-action i').text()).toBe('4')

    await wrapper.get('.cart-action').trigger('click')
    expect(wrapper.text()).toContain('Keranjang Belanja Kamu')

    await wrapper.get('.continue-button').trigger('click')
    expect(wrapper.text()).toContain('Pengiriman & Pembayaran')

    await wrapper.get('.shipping-panel .panel-title button').trigger('click')
    await wrapper.get('input[autocomplete="name"]').setValue('Dewi Pratama')
    await wrapper.get('input[autocomplete="address-level2"]').setValue('Bandung')
    await wrapper.get('.address-edit .primary-button').trigger('click')
    expect(wrapper.get('.address-card').text()).toContain('Dewi Pratama')

    await wrapper.get('.continue-button[type="submit"]').trigger('submit')
    expect(wrapper.text()).toContain('Pesananmu berhasil dibuat!')
    expect(wrapper.get('.order-confirmation').text()).toContain('Bandung')
  })

  it('opens a selected product detail and activates its purchase buttons', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.curated-grid .group').trigger('click')
    expect(wrapper.get('.purchase-card h1').text()).toBe('Kain Tenun Ikat Sumba Motif Pahikung')

    await wrapper.get('.add-cart-button').trigger('click')
    expect(wrapper.get('.cart-action i').text()).toBe('4')

    await wrapper.get('.buy-now-button').trigger('click')
    expect(wrapper.findAll('.cart-item-details h3').map((heading) => heading.text())).toContain('Kain Tenun Ikat Sumba Motif Pahikung')
  })

  it('opens login and registration and updates the account state', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.account-login').trigger('click')
    expect(wrapper.get('.auth-heading h2').text()).toBe('Masuk ke PasarPintar')
    expect(wrapper.find('.site-header').exists()).toBe(false)
    expect(wrapper.find('.announcement-bar').exists()).toBe(false)
    expect(wrapper.find('.site-footer').exists()).toBe(false)
    expect(wrapper.find('.site-header').exists()).toBe(false)
    expect(wrapper.find('.site-footer').exists()).toBe(false)
    await wrapper.get('input[autocomplete="email"]').setValue('rani@example.com')
    await wrapper.get('input[autocomplete="current-password"]').setValue('rahasia123')
    await wrapper.get('.auth-form').trigger('submit')
    expect(wrapper.get('.account-actions').text()).toContain('rani')
    expect(wrapper.find('.site-header').exists()).toBe(true)

    await wrapper.get('.account-actions button').trigger('click')
    await wrapper.get('.account-register').trigger('click')
    expect(wrapper.find('.site-header').exists()).toBe(false)
    expect(wrapper.find('.site-footer').exists()).toBe(false)
    await wrapper.get('input[autocomplete="name"]').setValue('Dewi Pratama')
    await wrapper.get('input[autocomplete="email"]').setValue('dewi@example.com')
    const passwordFields = wrapper.findAll('input[autocomplete="new-password"]')
    await passwordFields[0]!.setValue('aman12345')
    await passwordFields[1]!.setValue('aman12345')
    await wrapper.get('.terms-choice input').setValue(true)
    await wrapper.get('.auth-form').trigger('submit')

    expect(wrapper.get('.auth-heading h2').text()).toContain('Selamat datang, Dewi Pratama')
    expect(wrapper.find('.auth-form').exists()).toBe(false)
    await wrapper.get('.registration-continue').trigger('click')
    expect(wrapper.get('.account-actions').text()).toContain('Dewi Pratama')
  })

  it('keeps registration open while entering a long full name', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.account-register').trigger('click')
    await wrapper.get('input[autocomplete="name"]').setValue('Dewi Pratama Kusumawardhani Putri Santoso')

    expect(wrapper.get('.auth-heading h2').text()).toBe('Buat akun PasarPintar')
    expect(wrapper.find('.auth-page').exists()).toBe(true)
    expect((wrapper.get('input[autocomplete="name"]').element as HTMLInputElement).value).toBe('Dewi Pratama Kusumawardhani Putri Santoso')
  })

  it('opens the dedicated order tracking page and handles unknown orders', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.announcement-links a[href="#pesanan"]').trigger('click')
    expect(wrapper.get('.tracking-intro h1').text()).toBe('Lacak Pesanan')
    expect(wrapper.findAll('.journey-timeline li')).toHaveLength(5)

    await wrapper.get('#order-tracking-input').setValue('PP-TIDAK-ADA')
    await wrapper.get('.tracking-search-panel').trigger('submit')
    expect(wrapper.get('.tracking-not-found h2').text()).toBe('Pesanan belum ditemukan')

    await wrapper.get('.tracking-not-found button').trigger('click')
    expect(wrapper.findAll('.journey-timeline li')).toHaveLength(5)
  })

  it('reveals mobile utility links and navigates to order tracking', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.search-box-wrap input').setValue('tenun')
    expect((wrapper.get('.search-box-wrap input').element as HTMLInputElement).value).toBe('tenun')
    await wrapper.get('.search-box-wrap input').setValue('')

    const toggle = wrapper.get('.mobile-utility-toggle')
    expect(toggle.text()).toBe('≡')
    expect(toggle.attributes('aria-label')).toBe('Menu layanan')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('.mobile-account-actions button').map((button) => button.text())).toEqual(['Masuk', 'Daftar'])
    expect(wrapper.findAll('.announcement-links.open a').map((link) => link.text())).toEqual([
      'Pusat Bantuan',
      'Lacak Pesanan',
      'Portal Penjual',
      'Portal Pengelola',
      '◈ Gerakan Bangga Buatan ID',
    ])

    await wrapper.get('.announcement-links a[href="#pesanan"]').trigger('click')
    expect(wrapper.get('.tracking-intro h1').text()).toBe('Lacak Pesanan')
    expect(wrapper.find('.announcement-links.open').exists()).toBe(false)
  })

  it('opens login and registration from the mobile services menu', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.mobile-utility-toggle').trigger('click')
    await wrapper.get('.mobile-account-login').trigger('click')
    expect(wrapper.get('.auth-heading h2').text()).toBe('Masuk ke PasarPintar')
    expect(wrapper.find('.announcement-links.open').exists()).toBe(false)

    await wrapper.get('.auth-switch button').trigger('click')
    expect(wrapper.get('.auth-heading h2').text()).toBe('Buat akun PasarPintar')
  })

  it('opens the platform settings console from the admin portal link', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.announcement-links a[href="#admin"]').trigger('click')
    expect(wrapper.get('.admin-shell h1').text()).toContain('Pengaturan Sistem & Konfigurasi')
    expect(wrapper.get('.subsidy-panel h2').text()).toBe('Program Afirmasi Subsidi Ongkir 3T')

    await wrapper.get('.heading-actions .save').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toContain('berhasil disimpan')

    await wrapper.get('.sidebar-bottom button').trigger('click')
    expect(wrapper.find('.admin-shell').exists()).toBe(false)
  })

  it('opens national analytics and updates its interactive filters', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.announcement-links a[href="#admin"]').trigger('click')
    await wrapper.findAll('.admin-nav button').find((button) => button.text().includes('Statistik & Analisis'))!.trigger('click')

    expect(wrapper.get('.analytics-content h1').text()).toContain('Analisis Nasional Ekosistem UMKM')
    expect(wrapper.findAll('.metric-card')).toHaveLength(4)
    expect(wrapper.findAll('.export-panel tbody tr')).toHaveLength(4)

    await wrapper.findAll('.period-tabs button').find((button) => button.text().includes('Kustom'))!.trigger('click')
    expect(wrapper.findAll('.custom-range input[type="date"]')).toHaveLength(2)
    await wrapper.get('.filter-select select[aria-label="Filter wilayah"]').setValue('Nusa Tenggara Timur')
    expect(wrapper.findAll('.region-row')).toHaveLength(1)
  })

  it('opens the seller order dashboard and manages pickup and order status', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.announcement-links a[href="#seller"]').trigger('click')
    expect(wrapper.get('.seller-page-heading h1').text()).toContain('Kelola Pesanan & Pengiriman Logistik')

    await wrapper.findAll('.seller-tabs button').find((button) => button.text().includes('Perlu Diproses'))!.trigger('click')
    const newOrder = wrapper.findAll('.seller-order-card').find((card) => card.text().includes('#ORD-PP-9825'))!
    await newOrder.get('.order-primary').trigger('click')
    await wrapper.findAll('.seller-tabs button').find((button) => button.text().includes('Siap Dikirim'))!.trigger('click')
    expect(wrapper.findAll('.seller-order-card').find((card) => card.text().includes('#ORD-PP-9825'))!.text()).toContain('Siap Dikirim')

    await wrapper.get('.seller-heading-actions .seller-primary-button').trigger('click')
    expect(wrapper.get('.seller-pickup-dialog h2').text()).toBe('Atur pick-up pesanan')
    await wrapper.get('.seller-pickup-dialog > div button:last-child').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toContain('Pick-up')
  })

  it('opens the seller product editor and supports add and edit modes', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.announcement-links a[href="#seller"]').trigger('click')
    await wrapper.get('.seller-add-product').trigger('click')
    expect(wrapper.get('.editor-page-heading h1').text()).toBe('Tambah Produk Baru UMKM')

    await wrapper.findAll('.editor-mode-control button').find((button) => button.text().includes('Edit produk'))!.trigger('click')
    expect(wrapper.get('.editor-page-heading h1').text()).toBe('Edit Detail Produk UMKM')
    await wrapper.get('.editor-publish-button').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toContain('Perubahan produk berhasil disimpan')

    await wrapper.findAll('.editor-mode-control button').find((button) => button.text().includes('Tambah produk'))!.trigger('click')
    await wrapper.get('.editor-publish-button').trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toContain('Nama produk wajib diisi')

    await wrapper.get('.name-field input').setValue('Tenun Ikat Flores Pewarna Alami')
    expect(wrapper.get('.buyer-product-info > b').text()).toBe('Tenun Ikat Flores Pewarna Alami')
    await wrapper.get('.editor-draft-button').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toContain('Draft produk berhasil disimpan')
  })

  it('opens the seller performance summary and filters its pending orders', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.announcement-links a[href="#seller"]').trigger('click')
    await wrapper.findAll('.seller-nav button').find((button) => button.text().includes('Ringkasan Toko'))!.trigger('click')
    expect(wrapper.get('.summary-heading h1').text()).toBe('Ringkasan Kinerja Toko')
    expect(wrapper.findAll('.summary-kpi')).toHaveLength(4)
    expect(wrapper.findAll('.summary-order-table tbody tr')).toHaveLength(3)

    await wrapper.get('.summary-period select').setValue('7 Hari Terakhir')
    expect(wrapper.get('.sales-kpi > strong').text()).toBe('Rp 4.210.000')
    await wrapper.findAll('.summary-order-tabs button').find((button) => button.text() === 'Siap Kirim (3)')!.trigger('click')
    expect(wrapper.findAll('.summary-order-table tbody tr')).toHaveLength(1)

    await wrapper.get('.summary-table-footer button').trigger('click')
    expect(wrapper.get('.seller-page-heading h1').text()).toContain('Kelola Pesanan & Pengiriman Logistik')
  })

  it('opens seller product inventory and updates stock or edits a selected product', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.announcement-links a[href="#seller"]').trigger('click')
    await wrapper.findAll('.seller-nav button').find((button) => button.text().includes('Produk & Stok'))!.trigger('click')
    expect(wrapper.get('.inventory-heading h1').text()).toBe('Katalog & Stok Produk Toko')
    expect(wrapper.findAll('.inventory-table tbody tr')).toHaveLength(5)

    await wrapper.get('.inventory-table tbody tr .stock-pill').trigger('click')
    expect(wrapper.get('.inventory-stock-dialog h2').text()).toBe('Perbarui stok')
    await wrapper.get('.inventory-stock-dialog input').setValue(30)
    await wrapper.get('.inventory-stock-dialog > div button:last-child').trigger('click')
    expect(wrapper.get('.inventory-table tbody tr .stock-pill').text()).toContain('30 pcs')

    await wrapper.findAll('.inventory-tabs button').find((button) => button.text().includes('Non-aktif / Habis'))!.trigger('click')
    expect(wrapper.findAll('.inventory-table tbody tr')).toHaveLength(1)

    await wrapper.findAll('.inventory-tabs button').find((button) => button.text().includes('Semua Produk'))!.trigger('click')
    const batikProduct = wrapper.findAll('.inventory-table tbody tr').find((row) => row.text().includes('Tarutung'))!
    await batikProduct.get('[title="Edit produk"]').trigger('click')
    expect(wrapper.get('.editor-page-heading h1').text()).toBe('Edit Detail Produk UMKM')
    expect((wrapper.get('.name-field input').element as HTMLInputElement).value).toContain('Tarutung')
    await wrapper.get('.editor-brand').trigger('click')
    expect(wrapper.get('.inventory-heading h1').text()).toBe('Katalog & Stok Produk Toko')
  })

  it('opens seller finance reports and processes a valid balance withdrawal', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.announcement-links a[href="#seller"]').trigger('click')
    await wrapper.findAll('.seller-nav button').find((button) => button.text().includes('Laporan Keuangan'))!.trigger('click')
    expect(wrapper.get('.finance-heading h1').text()).toBe('Laporan Keuangan & Saldo Penjualan')
    expect(wrapper.findAll('.balance-card')).toHaveLength(4)
    expect(wrapper.findAll('.finance-table tbody tr')).toHaveLength(5)

    await wrapper.findAll('.ledger-tabs button').find((button) => button.text() === 'Pencairan Saldo (WD)')!.trigger('click')
    expect(wrapper.findAll('.finance-table tbody tr')).toHaveLength(2)
    await wrapper.get('.ledger-tabs button').trigger('click')
    await wrapper.get('.ledger-filters input').setValue('Hendra')
    expect(wrapper.findAll('.finance-table tbody tr')).toHaveLength(1)
    await wrapper.get('.ledger-filters input').setValue('')

    await wrapper.get('.finance-withdraw-button').trigger('click')
    expect(wrapper.get('.withdrawal-dialog h2').text()).toBe('Tarik saldo ke rekening')
    await wrapper.get('.withdrawal-dialog input[aria-label="Jumlah penarikan"]').setValue(2000000)
    await wrapper.get('.withdrawal-confirm').trigger('click')
    expect(wrapper.get('.finance-toast').text()).toContain('Rp 2.000.000')
    expect(wrapper.get('.available-card > strong').text()).toBe('Rp 10.450.000')
    await wrapper.findAll('.ledger-tabs button').find((button) => button.text() === 'Pencairan Saldo (WD)')!.trigger('click')
    expect(wrapper.findAll('.finance-table tbody tr')).toHaveLength(3)
  })

  it('opens seller store profile and validates courier settings before saving', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const wrapper = mount(App)

    await wrapper.get('.announcement-links a[href="#seller"]').trigger('click')
    await wrapper.findAll('.seller-nav button').find((button) => button.text().includes('Profil Toko & Kurir'))!.trigger('click')
    expect(wrapper.get('.store-profile-heading h1').text()).toBe('Profil Toko & Pengiriman')
    expect(wrapper.get('.public-store-identity b').text()).toBe('Koperasi Tenun & Batik Nusantara')
    expect(wrapper.findAll('.profile-courier-card')).toHaveLength(4)

    await wrapper.get('input[aria-label="Jam buka Senin"]').setValue('09:00')
    expect((wrapper.get('input[aria-label="Jam buka Senin"]').element as HTMLInputElement).value).toBe('09:00')
    for (const courierToggle of wrapper.findAll('.courier-toggle input')) await courierToggle.setValue(false)
    await wrapper.get('.profile-save-action').trigger('click')
    expect(wrapper.get('[role="alert"]').text()).toContain('Aktifkan minimal satu kurir')

    await wrapper.get('.courier-toggle input').setValue(true)
    await wrapper.get('.profile-save-action').trigger('click')
    expect(wrapper.get('[role="status"]').text()).toContain('berhasil disimpan')

    await wrapper.get('.profile-sticky-actions > button:first-of-type').trigger('click')
    expect(wrapper.get('.seller-page-heading h1').text()).toContain('Kelola Pesanan & Pengiriman Logistik')
  })
})
