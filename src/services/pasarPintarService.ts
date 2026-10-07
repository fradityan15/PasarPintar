import { supabase } from '../lib/supabase'

// -----------------------------------------------------------------------------
// 1. SERVICES KATALOG PRODUK & KATEGORI
// -----------------------------------------------------------------------------

/** Fetch semua kategori produk */
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

/** Fetch daftar produk publik (hanya yang aktif & terkurasi) */
export async function fetchPublicProducts(categoryId?: string) {
  let query = supabase
    .from('products')
    .select('*, categories(name, slug), store_legality(store_name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// -----------------------------------------------------------------------------
// 2. SERVICES AUTH & PROFIL PENGGUNA
// -----------------------------------------------------------------------------

/** Register user baru via Supabase Auth */
export async function registerUser(email: string, pass: string, fullName: string, role: 'buyer' | 'seller') {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName,
        role: role
      }
    }
  })

  if (error) throw error
  return data
}

/** Login pengguna */
export async function loginUser(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass
  })

  if (error) throw error
  return data
}

/** Fetch profil pengguna yang sedang login */
export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

// -----------------------------------------------------------------------------
// 3. SERVICES TRANSAKSI & PESANAN (BUYER)
// -----------------------------------------------------------------------------

export interface CreateOrderItemPayload {
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

/** Membuat pesanan baru */
export async function createOrder(
  buyerId: string,
  shippingAddress: string,
  items: CreateOrderItemPayload[],
  shippingSubsidy = 0
) {
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0)

  // 1. Insert header order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      buyer_id: buyerId,
      total_amount: totalAmount,
      shipping_subsidy_amount: shippingSubsidy,
      shipping_address: shippingAddress,
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) throw orderError

  // 2. Insert order items
  const orderItemsData = items.map((item) => ({
    order_id: order.id,
    ...item
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData)

  if (itemsError) throw itemsError

  return order
}
