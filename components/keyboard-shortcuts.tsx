"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigation shortcuts (only Alt key)
      if (e.altKey && !isNaN(Number.parseInt(e.key)) && Number.parseInt(e.key) >= 1 && Number.parseInt(e.key) <= 6) {
        e.preventDefault()
        const routes = ["/", "/products", "/inventory", "/open-tabs", "/accounting", "/settings"]
        router.push(routes[Number.parseInt(e.key) - 1])
      }
      
      // Help shortcut
      if (e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault()
        // Toggle help modal (this would need to be implemented in the component that uses this hook)
        const event = new CustomEvent('toggleHelp')
        window.dispatchEvent(event)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])
}
