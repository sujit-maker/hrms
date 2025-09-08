'use client'

import { ChevronDown, Globe } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            ::: HR_Management_Dashboard
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm text-gray-600">en</span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Globe size={16} />
            <span className="text-sm">en</span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">admin</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>
    </header>
  )
}
