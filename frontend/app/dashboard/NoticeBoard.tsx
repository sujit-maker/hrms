'use client'

import { Flag } from 'lucide-react'

export default function NoticeBoard() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">NOTICE BOARD</h3>
      
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Flag className="w-5 h-5 text-blue-600 mt-1" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Meeting..</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Published Date: 12 Mar 2026</p>
                <p>Publish By: Admin</p>
                <p className="mt-2">Description</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
