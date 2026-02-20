import { useState, useEffect } from 'react'

const CURRENT_USER_KEY = 'currentUserId'

export function useCurrentUser() {
    const [userId, setUserId] = useState<string | null>(null)

    useEffect(() => {
        const stored = localStorage.getItem(CURRENT_USER_KEY)
        setUserId(stored)
    }, [])

    const setCurrentUser = (id: string) => {
        localStorage.setItem(CURRENT_USER_KEY, id)
        setUserId(id)
    }

    const clearCurrentUser = () => {
        localStorage.removeItem(CURRENT_USER_KEY)
        setUserId(null)
    }

    return {
        userId,
        setCurrentUser,
        clearCurrentUser,
    }
}
