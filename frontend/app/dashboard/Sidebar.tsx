'use client'

import { 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  UserPlus, 
  GraduationCap, 
  Award, 
  Megaphone, 
  Settings,
  Building2,
  ChevronRight
} from 'lucide-react'

interface SidebarProps {
  activeModule: string
  setActiveModule: (module: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Building2 },
  { id: 'administration', label: 'Administration', icon: Settings },
  { id: 'employees', label: 'Employee Management', icon: Users },
  { id: 'leave', label: 'Leave Management', icon: Calendar },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
  { id: 'training', label: 'Training', icon: GraduationCap },
  { id: 'awards', label: 'Award', icon: Award },
  { id: 'notice', label: 'Notice Board', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeModule, setActiveModule }: SidebarProps) {
  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold">HR POWER</h1>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeModule === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-6 py-3 text-left hover:bg-blue-800 transition-colors ${
                isActive ? 'bg-blue-800 border-r-4 border-white' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={20} />
                <span>{item.label}</span>
              </div>
              <ChevronRight size={16} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
