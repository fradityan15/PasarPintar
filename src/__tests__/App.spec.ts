import { afterEach, describe, it, expect, vi } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mounts renders properly', () => {
    const wrapper = mount(App)
    expect(wrapper.text()).toContain('Beras Premium 5kg')
    expect(wrapper.find('.location-control').exists()).toBe(false)
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
    expect(wrapper.get('.purchase-card h1').text()).toBe('Beras Premium 5kg')

    await wrapper.get('.add-cart-button').trigger('click')
    expect(wrapper.get('.cart-action i').text()).toBe('4')

    await wrapper.get('.buy-now-button').trigger('click')
    expect(wrapper.findAll('.cart-item-details h3').map((heading) => heading.text())).toContain('Beras Premium 5kg')
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
    expect(wrapper.get('.account-actions').text()).toContain('Dewi Pratama')
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

    expect(wrapper.get('.mobile-search-placeholder').text()).toBe('Cari')
    await wrapper.get('.search-text-entry input').setValue('kopi')
    expect(wrapper.find('.mobile-search-placeholder').exists()).toBe(false)
    await wrapper.get('.search-text-entry input').setValue('')

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
    expect(wrapper.get('.admin-shell h1').text()).toContain('Konfigurasi Platform')
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
    await wrapper.findAll('.admin-nav button').find((button) => button.text() === 'Statistik & Analisis Nasional')!.trigger('click')

    expect(wrapper.get('.analytics-content h1').text()).toContain('Analisis Nasional Ekosistem UMKM')
    expect(wrapper.findAll('.metric-card')).toHaveLength(4)
    expect(wrapper.findAll('.export-panel tbody tr')).toHaveLength(4)

    await wrapper.findAll('.period-tabs button').find((button) => button.text().includes('Kustom'))!.trigger('click')
    expect(wrapper.findAll('.custom-range input[type="date"]')).toHaveLength(2)
    await wrapper.get('.filter-select select[aria-label="Filter wilayah"]').setValue('Nusa Tenggara Timur')
    expect(wrapper.findAll('.region-row')).toHaveLength(1)
  })
})
