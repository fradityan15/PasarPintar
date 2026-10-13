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
      return 'bg-white/90 text-[#151B28] border-[#D8E1EB]'
    case 'warning':
      return 'bg-white/90 text-[#D97706] border-[#E4E8E3]'
    case 'danger':
      return 'bg-[#E05A36] text-white border-transparent'
    case 'primary':
    default:
      return 'bg-white/90 text-[#151B28] border-[#D8E1EB]'
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
    class="product-card group relative flex flex-col w-full bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer font-sans"
    @click="handleCardClick"
  >
    <!-- Image & Top Badges Container -->
    <div class="relative w-full aspect-square bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-3">
      <!-- Product Image -->
      <img
        v-if="imageUrl"
        :src="imageUrl"
        :alt="imageAlt || name"
        class="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
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
        <!-- Flash Sale / Discount Badge -->
        <span
          v-if="discount"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold leading-none bg-[#151B28] text-white"
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
        class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#64748B] hover:text-[#E05A36] hover:bg-white shadow-sm transition-all focus:outline-none"
        :class="{ '!text-[#E05A36]': isWishlisted }"
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
    <div class="flex flex-col flex-1 p-3.5 gap-2">
      <!-- Location badge (if available) -->
      <div v-if="location" class="flex items-center gap-1 text-[11px] text-[#64748B] font-medium">
        <svg class="w-3 h-3 text-[#64748B] shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        <span class="truncate">{{ location }}</span>
      </div>

      <!-- Product Name -->
      <h4
        class="text-xs sm:text-sm font-bold leading-snug text-[#151B28] line-clamp-2 min-h-9 group-hover:text-[#151B28] transition-colors"
        :title="name"
      >
        {{ name }}
      </h4>

      <!-- Star Rating & Review Count -->
      <div class="flex items-center gap-1 text-xs">
        <div class="flex items-center text-[#F59E0B]">
          <svg v-for="i in 5" :key="i" class="w-3 h-3 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </div>
        <span v-if="rating" class="font-bold text-[#151B28] text-[11px]">{{ rating }}</span>
        <span v-if="reviewCount" class="text-[#94A3B8] text-[11px]">
          ({{ typeof reviewCount === 'number' ? reviewCount : reviewCount }})
        </span>
      </div>

      <!-- Price Section -->
      <div class="mt-auto flex flex-col gap-2 pt-1">
        <div class="flex items-baseline gap-2">
          <span class="text-sm sm:text-base font-extrabold text-[#151B28] tracking-tight">
            {{ formattedPrice }}
          </span>
          <span
            v-if="formattedOriginalPrice"
            class="text-xs text-[#94A3B8] line-through"
          >
            {{ formattedOriginalPrice }}
          </span>
        </div>

        <!-- Stock Progress Bar for Flash Sale -->
        <div v-if="variant === 'flash-sale' && stockLeft !== undefined" class="flex flex-col gap-1">
          <div class="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              class="h-full bg-[#151B28] rounded-full transition-all duration-300"
              :style="{ width: `${stockProgressPercentage}%` }"
            />
          </div>
          <span class="text-[10.5px] font-semibold text-[#151B28]">
            Tersisa {{ stockLeft }} pcs lagi
          </span>
        </div>

        <!-- Full-Width "Add to Cart" Shopluxe Button -->
        <button
          type="button"
          class="w-full mt-1 h-9 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#151B28] hover:text-white hover:border-[#151B28] text-[#151B28] text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-xs active:scale-[0.98]"
          title="Tambah ke Keranjang"
          aria-label="Tambah ke Keranjang"
          @click="handleAddToCart"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 4h2l2.3 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6"/>
            <circle cx="10" cy="21" r="1"/>
            <circle cx="18" cy="21" r="1"/>
          </svg>
          <span>ADD TO CART</span>
        </button>
      </div>
    </div>
  </div>
</template>
