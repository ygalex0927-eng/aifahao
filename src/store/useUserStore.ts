import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

interface UserState {
  user: (User & { is_admin?: boolean }) | null
  isAdmin: boolean
  setUser: (user: User | null) => void
  fetchUser: () => Promise<void>
  logout: () => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAdmin: false,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false
    
    if (user) {
        const { data } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', user.id)
            .single()
        isAdmin = data?.is_admin || false
    }

    if (user) {
        (user as any).is_admin = isAdmin
    }

    set({ user, isAdmin })
  },
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAdmin: false })
  }
}))
