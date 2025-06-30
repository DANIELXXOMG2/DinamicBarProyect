'use client';

import { useState, useEffect, useRef } from 'react';

import { Search, X } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface SearchBarProperties {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
}: SearchBarProperties) {
  const [isFocused, setIsFocused] = useState(false);
  const inputReference = useRef<HTMLInputElement>(null);

  // Efecto para manejar el enfoque automático
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Si presiona Ctrl+F, enfocar el input
      if (event.ctrlKey && event.key === 'f') {
        event.preventDefault();
        inputReference.current?.focus();
      }

      // Si presiona Escape y el input está enfocado, limpiar y desenfocar
      if (event.key === 'Escape' && isFocused) {
        onChange('');
        inputReference.current?.blur();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, onChange]);

  const handleClear = () => {
    onChange('');
    inputReference.current?.focus();
  };

  return (
    <div className={`relative mb-4 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          ref={inputReference}
          id="product-search"
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full rounded-lg border-2 border-gray-200 px-10 py-2 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Indicador de atajos */}
      {isFocused && (
        <div className="absolute left-0 top-full mt-1 rounded border bg-white px-2 py-1 text-xs text-gray-500 shadow-sm">
          Presiona{' '}
          <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs">Esc</kbd>{' '}
          para limpiar
        </div>
      )}

      {!isFocused && !value && (
        <div className="absolute left-0 top-full mt-1 text-xs text-gray-400">
          Presiona{' '}
          <kbd className="rounded bg-gray-100 px-1 py-0.5 text-xs">
            Ctrl+F o alt+f
          </kbd>{' '}
          para buscar
        </div>
      )}
    </div>
  );
}
