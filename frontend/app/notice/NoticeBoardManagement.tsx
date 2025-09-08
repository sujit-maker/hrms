'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Table from '@/components/common/Table'
import { Megaphone, Plus, Filter } from 'lucide-react'

export default function NoticeBoardManagement() {
  const [filterStatus, setFilterStatus] = useState('all')

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'description', label: 'Description' },
    { key: 'publishedDate', label: 'Published Date' },
    { key: 'publishedBy', label: 'Published By' },
    { key: 'priority', label: 'Priority' },
    { key: 'actions', label: 'Actions' }
  ]

  const notices = [
    // Sample data - replace with actual data from API
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Notice Board Management</h1>
        <p className="text-gray-600">Manage company notices and announcements</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Notices</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Notice
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={notices}
            emptyMessage="No notices found. Create your first notice to communicate with employees."
          />
        </div>
      </div>
    </div>
  )
}
