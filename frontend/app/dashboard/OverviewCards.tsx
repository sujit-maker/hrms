'use client'

import { Users, Building2, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

const overviewData = [
  {
    title: 'TOTAL EMPLOYEE',
    value: '78',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    trend: '+5%'
  },
  {
    title: 'DEPARTMENT',
    value: '72',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    trend: '+2%'
  },
  {
    title: 'PRESENT',
    value: '0',
    icon: CheckCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    trend: '+0%'
  },
  {
    title: 'ABSENT',
    value: '78',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    trend: '+78%'
  }
]

export default function OverviewCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {overviewData.map((item, index) => {
        const Icon = item.icon
        
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {item.title}
                </p>
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">
                {item.trend}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
