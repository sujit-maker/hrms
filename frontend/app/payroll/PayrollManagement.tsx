'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import Table from '@/components/common/Table'
import { DollarSign, Download, Calculator } from 'lucide-react'

export default function PayrollManagement() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const columns = [
    { key: 'employee', label: 'Employee' },
    { key: 'basicSalary', label: 'Basic Salary' },
    { key: 'allowances', label: 'Allowances' },
    { key: 'deductions', label: 'Deductions' },
    { key: 'netSalary', label: 'Net Salary' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' }
  ]

  const payrollData = [
    // Sample data - replace with actual data from API
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payroll Management</h1>
        <p className="text-gray-600">Manage employee salaries and payroll processing</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm">
                <Calculator className="w-4 h-4 mr-2" />
                Calculate Payroll
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Payslips
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Table
            columns={columns}
            data={payrollData}
            emptyMessage="No payroll data found for the selected month."
          />
        </div>
      </div>
    </div>
  )
}
