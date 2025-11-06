'use client'

import { useEffect, useState } from 'react'

export interface CurrentUser {
  id: number
  username: string
  role: string
  type?: string
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const data = localStorage.getItem('user')
    if (data) {
      try {
        const parsed = JSON.parse(data)
        setUser(parsed)
      } catch {
        setUser(null)
      }
    }
  }, [])

  return user
}
