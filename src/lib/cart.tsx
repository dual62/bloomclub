'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Product, CartItem } from '@/lib/supabase'

type CartContextType = {
  cart: CartItem[]
  addToCart: (product: Product, qty?: number) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType>({
  cart: [], addToCart: () => {}, updateQty: () => {}, clearCart: () => {},
  cartTotal: 0, cartCount: 0,
})

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bc-cart')
      if (saved) setCart(JSON.parse(saved))
    } catch (e) {}
    setLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (loaded) {
      try { localStorage.setItem('bc-cart', JSON.stringify(cart)) } catch (e) {}
    }
  }, [cart, loaded])

  const addToCart = (product: Product, qty = 1) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { ...product, qty }]
    })
  }

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.id !== id))
    else setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }

  const clearCart = () => setCart([])
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
