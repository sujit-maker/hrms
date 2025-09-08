'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Table from '@/components/common/Table'
import { TrendingUp, Plus, Target } from 'lucide-react'

export default function PerformanceManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024')

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'department', label: 'Department' },
    { key: 'rating', label: 'Rating' },
    { key: 'goals', label: 'Goals Achieved' },
    { key: 'reviewDate', label: 'Review Date' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const performanceData = [
    // Sample data - replace with actual data from API
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Performance Management</h1>
        <p className="text-gray-600">Track and manage employee performance reviews</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                <Target className="w-4 h-4 mr-2" />
                Set Goals
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Review
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={performanceData}
            emptyMessage="No performance reviews found for the selected period."
          />
        </div>
      </div>
    </div>
  )
}
