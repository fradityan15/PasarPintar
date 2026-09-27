<script setup lang="ts">
import { ref, watch } from 'vue'

type AuthMode = 'login' | 'register'

const props = defineProps<{ mode: AuthMode }>()
const emit = defineEmits<{
  back: []
  switchMode: [mode: AuthMode]
  authenticated: [account: { name: string; email: string; phone?: string }]
}>()

const fullName = ref('')
const emailAddress = ref('')
const phoneNumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const rememberMe = ref(true)
const acceptedTerms = ref(false)
const resetMode = ref(false)
const resetSent = ref(false)
const formError = ref('')

watch(() => props.mode, () => {
  resetMode.value = false
  resetSent.value = false
  formError.value = ''
})

function submitAuth() {
  formError.value = ''
  if (props.mode === 'register' && password.value !== confirmPassword.value) {
    formError.value = 'Konfirmasi kata sandi belum cocok.'
    return
  }
  const derivedName = fullName.value.trim() || emailAddress.value.split('@')[0] || 'Pelanggan'
  emit('authenticated', { name: derivedName, email: emailAddress.value.trim(), phone: phoneNumber.value.trim() })
}

function requestPasswordReset() {
  resetSent.value = true
  formError.value = ''
}

function openResetForm() {
  resetMode.value = true
  resetSent.value = false
  formError.value = ''
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-shell" :class="{ 'register-mode': mode === 'register', 'reset-mode': resetMode }">
      <aside class="auth-story">
        <img src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&q=88" alt="Kain dan produk kriya UMKM Nusantara" />
        <div class="auth-story-shade"></div>
        <a class="auth-brand" href="#beranda" @click.prevent="emit('back')"><span class="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1.2 10H5.2L4 9Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3M9 13h6M9 16h6"/></svg></span><span><b>PasarPintar</b><small>UMKM & Kriya Indonesia</small></span></a>
  <div class="auth-story-copy"><span class="auth-story-kicker">Belanja dengan dampak</span><h1>Setiap pilihan lokal, menguatkan banyak kehidupan.</h1><p>Temukan karya terbaik dari tangan pengrajin, petani, dan keluarga UMKM di seluruh Nusantara.</p><div class="auth-community"><span class="community-avatars"><i>R</i><i>A</i><i>D</i><i>+</i></span><span><b>40.000+</b><small>keluarga sudah bergabung</small></span></div></div>
        <span class="auth-image-credit">Cerita dan karya dari mitra UMKM Indonesia</span>
      </aside>

      <section class="auth-form-panel">
        <button class="auth-back" type="button" @click="emit('back')"><span>←</span> Kembali ke beranda</button>

        <template v-if="resetMode">
          <div class="auth-heading"><span class="auth-kicker">BANTUAN AKUN</span><h2>{{ resetSent ? 'Periksa email kamu' : 'Atur ulang kata sandi' }}</h2><p>{{ resetSent ? `Jika akun untuk ${emailAddress} terdaftar, petunjuk pemulihan akan dikirim.` : 'Masukkan email akunmu. Kami akan mengirim petunjuk untuk mengatur ulang kata sandi.' }}</p></div>
          <form v-if="!resetSent" class="auth-form" @submit.prevent="requestPasswordReset"><label class="auth-field"><span>Email</span><input v-model="emailAddress" type="email" autocomplete="email" placeholder="nama@email.com" required /></label><button class="auth-submit" type="submit">Kirim petunjuk reset <span>→</span></button></form>
          <button class="auth-switch-back" type="button" @click="resetMode = false; resetSent = false">Kembali ke masuk</button>
        </template>

        <template v-else>
          <div class="auth-heading"><span class="auth-kicker">{{ mode === 'login' ? 'SELAMAT DATANG KEMBALI' : 'GABUNG KOMUNITAS LOKAL' }}</span><h2>{{ mode === 'login' ? 'Masuk ke PasarPintar' : 'Buat akun PasarPintar' }}</h2><p>{{ mode === 'login' ? 'Lanjutkan menjelajahi produk pilihan dari UMKM Indonesia.' : 'Satu akun untuk belanja produk lokal dan cerita di baliknya.' }}</p></div>

          <form class="auth-form" @submit.prevent="submitAuth">
            <label v-if="mode === 'register'" class="auth-field"><span>Nama lengkap</span><input v-model="fullName" type="text" autocomplete="name" placeholder="Nama sesuai identitas" required /></label>
            <label class="auth-field"><span>Alamat email</span><input v-model="emailAddress" type="email" autocomplete="email" placeholder="nama@email.com" required /></label>
            <label v-if="mode === 'register'" class="auth-field"><span>Nomor telepon <small>Opsional</small></span><input v-model="phoneNumber" type="tel" autocomplete="tel" inputmode="tel" placeholder="08xx xxxx xxxx" /></label>
            <label class="auth-field"><span>Kata sandi</span><span class="password-control"><input v-model="password" :type="showPassword ? 'text' : 'password'" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" placeholder="Minimal 8 karakter" minlength="8" required /><button type="button" :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'" @click="showPassword = !showPassword">{{ showPassword ? 'Sembunyikan' : 'Lihat' }}</button></span></label>
            <label v-if="mode === 'register'" class="auth-field"><span>Ulangi kata sandi</span><span class="password-control"><input v-model="confirmPassword" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Masukkan kembali kata sandi" minlength="8" required /></span></label>

            <div v-if="mode === 'login'" class="auth-form-options"><label><input v-model="rememberMe" type="checkbox" /> Ingat saya</label><button type="button" @click="openResetForm">Lupa kata sandi?</button></div>
            <label v-if="mode === 'register'" class="terms-choice"><input v-model="acceptedTerms" type="checkbox" required /><span>Saya setuju dengan <a href="#syarat">Syarat & Ketentuan</a> dan <a href="#privasi">Kebijakan Privasi</a>.</span></label>
            <p v-if="formError" class="auth-error" role="alert">{{ formError }}</p>
            <button class="auth-submit" type="submit">{{ mode === 'login' ? 'Masuk' : 'Buat Akun' }} <span>→</span></button>
          </form>

          <p class="auth-switch">{{ mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?' }} <button type="button" @click="emit('switchMode', mode === 'login' ? 'register' : 'login')">{{ mode === 'login' ? 'Daftar sekarang' : 'Masuk' }}</button></p>
          <div class="auth-trust"><span>✓</span> Akun aman, data pribadi terlindungi</div>
        </template>
      </section>
    </section>
  </main>
</template>
