'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { SearchFilters } from '@/types'

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
  placeholder?: string
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "" 
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onSearch({ search: value || undefined })
  }

  const clearSearch = () => {
    setSearchTerm('')
    onSearch({})
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
      />
      {searchTerm && (
        <button
          onClick={clearSearch}
          className="absolute inset-y-0 right-0 pr-3 flex items-center touch-target"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  )
}
