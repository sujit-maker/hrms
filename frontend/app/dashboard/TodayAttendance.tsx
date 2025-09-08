'use client'

export default function TodayAttendance() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Today Attendance</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">#</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Photo</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Name</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">In time</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Out Time</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Late</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-500">
                No data available
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
