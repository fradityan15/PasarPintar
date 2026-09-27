<script setup lang="ts">
import { computed } from 'vue'

export interface ProductCardProps {
  id?: string | number
  name: string
  price: number | string
  originalPrice?: number | string
  discount?: string | number
  badge?: string
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger'
  location?: string
  rating?: number | string
  reviewCount?: number | string
  imageUrl?: string
  imageAlt?: string
  stockLeft?: number
  stockTotal?: number
  isWishlisted?: boolean
  variant?: 'default' | 'flash-sale'
}

const props = withDefaults(defineProps<ProductCardProps>(), {
  id: '',
  originalPrice: undefined,
  discount: undefined,
  badge: undefined,
  badgeVariant: 'primary',
  location: '',
  rating: 0,
  reviewCount: 0,
  imageUrl: '',
  imageAlt: '',
  stockLeft: undefined,
  stockTotal: undefined,
  isWishlisted: false,
  variant: 'default',
})

const emit = defineEmits<{
  (e: 'click', id: string | number): void
  (e: 'addToCart', id: string | number): void
  (e: 'toggleWishlist', id: string | number): void
}>()

// Format rupiah currency
const formatPrice = (val: number | string): string => {
  if (typeof val === 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val).replace(/\s+/g, ' ')
  }
  return val.startsWith('Rp') ? val : `Rp ${val}`
}

const formattedPrice = computed(() => formatPrice(props.price))
const formattedOriginalPrice = computed(() =>
  props.originalPrice ? formatPrice(props.originalPrice) : null
)

// Stock progress calculation for flash-sale variant
const stockProgressPercentage = computed(() => {
  if (!props.stockLeft || !props.stockTotal) return 70
  return Math.min(100, Math.max(0, (props.stockLeft / props.stockTotal) * 100))
})

// Badge style colors based on Figma specs
const badgeClasses = computed(() => {
  switch (props.badgeVariant) {
    case 'success':
      return 'bg-white/90 text-[#16A34A] border-[#E4E8E3]'
    case 'warning':
      return 'bg-white/90 text-[#D97706] border-[#E4E8E3]'
    case 'danger':
      return 'bg-[#E05A36] text-white border-transparent'
    case 'primary':
    default:
      return 'bg-white/90 text-[#0D7A5F] border-[#E4E8E3]'
  }
})

const handleCardClick = () => {
  emit('click', props.id)
}

const handleAddToCart = (e: MouseEvent) => {
  e.stopPropagation()
  emit('addToCart', props.id)
}

const handleToggleWishlist = (e: MouseEvent) => {
  e.stopPropagation()
  emit('toggleWishlist', props.id)
}
</script>

<template>
  <div
    class="group relative flex flex-col w-full bg-white rounded-2xl border border-[#E4E8E3] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer font-sans"
    @click="handleCardClick"
  >
    <!-- Image & Top Badges Container -->
    <div class="relative w-full aspect-square bg-[#F4F7F5] overflow-hidden flex items-center justify-center">
      <!-- Product Image -->
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="imageAlt || name"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <!-- Fallback image placeholder if no image provided -->
      <div v-else class="flex flex-col items-center justify-center text-[#7A8C82] p-4 text-center">
        <svg class="w-12 h-12 stroke-current mb-1 opacity-40" viewBox="0 0 24 24" fill="none" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span class="text-xs text-[#7A8C82]">PasarPintar UMKM</span>
      </div>

      <!-- Top-Left Badge (Discount / Category / Curated status) -->
      <div
        v-if="badge || discount"
        class="absolute top-3 left-3 z-10 flex items-center shadow-sm"
      >
        <!-- Flash Sale Discount Badge -->
        <span
          v-if="discount"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none bg-[#E05A36] text-white"
        >
          {{ typeof discount === 'number' ? `-${discount}%` : discount }}
        </span>

        <!-- Standard Label Badge (e.g. Pilihan Editor, Organik, BPOM) -->
        <span
          v-else-if="badge"
          class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold leading-none border backdrop-blur-sm"
          :class="badgeClasses"
        >
          {{ badge }}
        </span>
      </div>

      <!-- Top-Right Wishlist Button -->
      <button
        type="button"
        class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#7A8C82] hover:text-[#E05A36] hover:bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0D7A5F]/40"
        :class="{ 'text-[#E05A36]!': isWishlisted }"
        title="Simpan ke Wishlist"
        aria-label="Simpan ke Wishlist"
        @click="handleToggleWishlist"
      >
        <svg
          class="w-4 h-4 transition-transform active:scale-125"
          viewBox="0 0 24 24"
          :fill="isWishlisted ? 'currentColor' : 'none'"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>

    <!-- Product Details Content -->
    <div class="flex flex-col flex-1 p-4 gap-3">
      <!-- Location and Product Title -->
      <div class="flex flex-col gap-1.5">
        <!-- Origin Location -->
        <div v-if="location" class="flex items-center gap-1.5 text-xs text-[#7A8C82] font-medium">
          <svg class="w-3 h-3 text-[#7A8C82] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span class="truncate">{{ location }}</span>
        </div>

        <!-- Product Name -->
        <h4
          class="text-sm font-bold leading-5 text-[#13211B] line-clamp-2 min-h-10 group-hover:text-[#0D7A5F] transition-colors"
          :title="name"
        >
          {{ name }}
        </h4>
      </div>

      <!-- Rating & Reviews (for default variant) -->
      <div v-if="variant !== 'flash-sale' && (rating || reviewCount)" class="flex items-center gap-1.5 text-xs">
        <!-- Star icon -->
        <svg class="w-3.5 h-3.5 text-[#D97706] fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        <span class="font-bold text-[#13211B]">{{ rating }}</span>
        <span v-if="reviewCount" class="text-[#7A8C82]">
          {{ typeof reviewCount === 'number' ? `(${reviewCount})` : reviewCount }}
        </span>
      </div>

      <!-- Price & Action Section -->
      <div class="mt-auto flex flex-col gap-3 pt-1">
        <!-- Default Card Bottom Row: Price on left, Round Button on right -->
        <div v-if="variant === 'default'" class="flex items-center justify-between gap-2">
          <!-- Price display -->
          <div class="flex flex-col">
            <span
              v-if="formattedOriginalPrice"
              class="text-xs text-[#7A8C82] line-through"
            >
              {{ formattedOriginalPrice }}
            </span>
            <span class="text-base font-extrabold text-[#0D7A5F] tracking-tight">
              {{ formattedPrice }}
            </span>
          </div>

          <!-- Add to cart round button -->
          <button
            type="button"
            class="w-9 h-9 rounded-full bg-[#0D7A5F]/10 text-[#0D7A5F] hover:bg-[#0D7A5F] hover:text-white flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D7A5F]/40 shadow-xs"
            title="Tambah ke Keranjang"
            aria-label="Tambah ke Keranjang"
            @click="handleAddToCart"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        <!-- Flash Sale Bottom Row: Strikethrough price + Stock progress bar + Full width button -->
        <div v-else-if="variant === 'flash-sale'" class="flex flex-col gap-2.5">
          <!-- Price with Discount -->
          <div class="flex items-baseline gap-2">
            <span class="text-base font-extrabold text-[#E05A36] tracking-tight">
              {{ formattedPrice }}
            </span>
            <span
              v-if="formattedOriginalPrice"
              class="text-xs text-[#7A8C82] line-through"
            >
              {{ formattedOriginalPrice }}
            </span>
          </div>

          <!-- Stock Progress Bar -->
          <div v-if="stockLeft !== undefined" class="flex flex-col gap-1">
            <div class="w-full h-2 bg-[#E8F0EC] rounded-full overflow-hidden">
              <div
                class="h-full bg-[#E05A36] rounded-full transition-all duration-300"
                :style="{ width: `${stockProgressPercentage}%` }"
              />
            </div>
            <span class="text-xs font-semibold text-[#EA580C]">
              Tersisa {{ stockLeft }} pcs lagi
            </span>
          </div>

          <!-- Full Width Action Button -->
          <button
            type="button"
            class="w-full h-9 rounded-xl bg-[#0D7A5F] hover:bg-[#0b6b53] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D7A5F]/40"
            @click="handleAddToCart"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Tambah Cepat</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
