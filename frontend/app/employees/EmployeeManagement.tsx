'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Table from '@/components/common/Table'
import { Plus, Search, Filter } from 'lucide-react'

export default function EmployeeManagement() {
  const [searchTerm, setSearchTerm] = useState('')

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'department', label: 'Department' },
    { key: 'position', label: 'Position' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const employees = [
    // Sample data - replace with actual data from API
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Employee Management</h1>
        <p className="text-gray-600">Manage your organization's employees</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={employees}
            emptyMessage="No employees found. Add your first employee to get started."
          />
        </div>
      </div>
    </div>
  )
}
