'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Table from '@/components/common/Table'
import { GraduationCap, Plus, Calendar } from 'lucide-react'

export default function TrainingManagement() {
  const [filterStatus, setFilterStatus] = useState('all')

  const columns = [
    { key: 'title', label: 'Training Title' },
    { key: 'instructor', label: 'Instructor' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'participants', label: 'Participants' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const trainingPrograms = [
    // Sample data - replace with actual data from API
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Training Management</h1>
        <p className="text-gray-600">Manage employee training programs and development</p>
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
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Training
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={trainingPrograms}
            emptyMessage="No training programs found. Create your first training program to get started."
          />
        </div>
      </div>
    </div>
  )
}
