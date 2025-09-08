'use client'

import { useState } from 'react'
import Button from '@/app/components/common/Button'
import Table from '@/app/components/common/Table'
import { Award, Plus, Filter } from 'lucide-react'

export default function AwardsManagement() {
  const [filterType, setFilterType] = useState('all')

  const columns = [
    { key: 'awardName', label: 'Award Name' },
    { key: 'employee', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'awardDate', label: 'Award Date' },
    { key: 'category', label: 'Category' },
    { key: 'actions', label: 'Actions' }
  ]

  const awards = [
    // Sample data - replace with actual data from API
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Awards Management</h1>
        <p className="text-gray-600">Manage employee awards and recognition</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="performance">Performance</option>
                <option value="innovation">Innovation</option>
                <option value="teamwork">Teamwork</option>
                <option value="leadership">Leadership</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Give Award
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={awards}
            emptyMessage="No awards found. Give your first award to recognize outstanding performance."
          />
        </div>
      </div>
    </div>
  )
}
