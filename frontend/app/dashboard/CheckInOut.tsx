'use client'

import { Clock } from 'lucide-react'

export default function CheckInOut() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">
          HEY ADMIN PLEASE CHECK IN/OUT YOUR ATTENDANCE
        </h3>
        
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Your IP is 49.36.9.26</p>
        </div>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors">
          <Clock className="w-5 h-5" />
          <span>Check In</span>
        </button>
      </div>
    </div>
  )
}
