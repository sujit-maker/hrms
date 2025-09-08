'use client'

import { useState } from 'react'
import Button from '@/components/common/Button'
import { Settings, User, Bell, Shield, Database } from 'lucide-react'

export default function SettingsManagement() {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'data', label: 'Data & Privacy', icon: Database }
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and system preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div>
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Zone
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-6 (Central Time)</option>
                    <option>UTC-7 (Mountain Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div className="pt-4">
                  <Button>Save Changes</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Profile Settings</h3>
              <p className="text-gray-600">Profile settings will be implemented here.</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
              <p className="text-gray-600">Notification preferences will be implemented here.</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Security Settings</h3>
              <p className="text-gray-600">Security settings will be implemented here.</p>
            </div>
          )}

          {activeTab === 'data' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Data & Privacy Settings</h3>
              <p className="text-gray-600">Data and privacy settings will be implemented here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
