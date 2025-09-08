'use client'

import OverviewCards from './OverviewCards'
import TodayAttendance from './TodayAttendance'
import NoticeBoard from './NoticeBoard'
import CheckInOut from './CheckInOut'

interface DashboardContentProps {
  activeModule: string
}

export default function DashboardContent({ activeModule }: DashboardContentProps) {
  if (activeModule !== 'dashboard') {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 capitalize">
            {activeModule.replace('_', ' ')} Module
          </h2>
          <p className="text-gray-600">
            This module is under development. Content will be added here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Overview Cards */}
      <OverviewCards />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today Attendance */}
        <TodayAttendance />
        
        {/* Notice Board */}
        <NoticeBoard />
      </div>
      
      {/* Check In/Out */}
      <CheckInOut />
    </div>
  )
}
