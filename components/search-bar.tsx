"use client"

import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ value, onChange, placeholder = "Buscar...", className = "" }: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Efecto para manejar el enfoque automático
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Si presiona Ctrl+F, enfocar el input
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      
      // Si presiona Escape y el input está enfocado, limpiar y desenfocar
      if (e.key === 'Escape' && isFocused) {
        onChange('')
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFocused, onChange])

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={`relative mb-4 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          id="product-search"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="pl-10 pr-10 py-2 w-full border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Indicador de atajos */}
      {isFocused && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm border">
          Presiona <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> para limpiar
        </div>
      )}
      
      {!isFocused && !value && (
        <div className="absolute top-full left-0 mt-1 text-xs text-gray-400">
          Presiona <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+F o alt+f</kbd> para buscar
        </div>
      )}
    </div>
  )
}