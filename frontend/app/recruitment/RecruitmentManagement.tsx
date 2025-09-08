'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Table from '@/components/common/Table'
import { UserPlus, Plus, Filter } from 'lucide-react'

export default function RecruitmentManagement() {
  const [filterStatus, setFilterStatus] = useState('all')

  const columns = [
    { key: 'position', label: 'Position' },
    { key: 'department', label: 'Department' },
    { key: 'applicants', label: 'Applicants' },
    { key: 'postedDate', label: 'Posted Date' },
    { key: 'deadline', label: 'Deadline' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const jobPostings = [
    // Sample data - replace with actual data from API
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Recruitment Management</h1>
        <p className="text-gray-600">Manage job postings and recruitment process</p>
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
                <option value="open">Open</option>
                <option value="closed">Closed</option>
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
                Post Job
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={jobPostings}
            emptyMessage="No job postings found. Create your first job posting to get started."
          />
        </div>
      </div>
    </div>
  )
}
