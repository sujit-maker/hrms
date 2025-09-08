'use client'

import { useState } from 'react'
import Button from '@/app/components/common/Button'
import Table from '@/app/components/common/Table'
import { Calendar, Clock, Download } from 'lucide-react'

export default function AttendanceManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'checkIn', label: 'Check In' },
    { key: 'checkOut', label: 'Check Out' },
    { key: 'totalHours', label: 'Total Hours' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const attendanceData = [
    // Sample data - replace with actual data from API
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Attendance Management</h1>
        <p className="text-gray-600">Track and manage employee attendance</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                <Clock className="w-4 h-4 mr-2" />
                Bulk Check-in
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={attendanceData}
            emptyMessage="No attendance records found for the selected date."
          />
        </div>
      </div>
    </div>
  )
}
