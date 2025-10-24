"use client"
import { useState, useEffect } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "../components/ui/collapsible";
import { Icon } from "@iconify/react";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { Card, CardContent } from "../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function HRManagementDashboard() {
  const pathname = usePathname()
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    setup: true, // Dashboard starts with setup open
    employee: false,
    payroll: false,
    salary: false,
    leave: false,
    attendance: false,
    reports: false
  })

  // Determine which section should be open based on current path
  useEffect(() => {
    const newOpenSections = {
      setup: pathname === '/', // Dashboard page keeps setup open
      employee: false,
      payroll: false,
      salary: false,
      leave: false,
      attendance: false,
      reports: false
    }

    // Setup section paths
    if (['/service-providers', '/company', '/branches', '/devices', '/contractors'].includes(pathname)) {
      newOpenSections.setup = true
    }
    // Employee Management section paths
    else if (['/departments', '/designations', '/manage-employees', '/employees-promotions'].includes(pathname)) {
      newOpenSections.employee = true
    }
    // Payroll Management section paths
    else if (['/work-shifts', '/attendance-policy', '/leave-policy'].includes(pathname)) {
      newOpenSections.payroll = true
    }
    // Salary Management section paths
    else if (['/monthly-salary-cycle', '/salary-allowances', '/salary-deductions', '/monthly-pay-grade', '/hourly-pay-grade', '/bonus-setup', '/bonus-allocations', '/generate-salary'].includes(pathname)) {
      newOpenSections.salary = true
    }
    // Leave Management section paths
    else if (['/manage-holidays', '/public-holiday', '/leave-applications'].includes(pathname)) {
      newOpenSections.leave = true
    }
    // Attendance Management section paths
    else if (['/attendance-logs', '/field-attendance-schedule', '/attendance-regularisation'].includes(pathname)) {
      newOpenSections.attendance = true
    }
    // Reports section paths
    else if (['/attendance-reports', '/leave-reports', '/salary-statements'].includes(pathname)) {
      newOpenSections.reports = true
    }

    setOpenSections(newOpenSections)
  }, [pathname])

  // Function to check if a link is active
  const isActiveLink = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <Sidebar className="bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 border-r border-blue-700 shadow-2xl">
          <SidebarHeader className="p-4 border-b border-blue-700 bg-gradient-to-r from-blue-800 to-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg">
                HR
              </div>
              <span className="text-white font-semibold text-sm tracking-wide">OpenHRM</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarGroup>
              <SidebarMenu className="space-y-2">
                {/* Setup Section */}
                <Collapsible open={openSections.setup} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, setup: open }))}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-600 transition-all duration-300 rounded-lg mx-2 px-3 py-2.5 shadow-sm hover:shadow-md">
                      <Icon icon="mdi:cog-outline" className="w-5 h-5" />
                      <span className="font-medium">Setup</span>
                      <Icon 
                        icon="mdi:chevron-right" 
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${openSections.setup ? 'rotate-90' : ''}`} 
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/service-providers" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/service-providers') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Service Providers</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/company" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/company') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Company</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/branches" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/branches') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Branches</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/devices" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/devices') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Devices</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/contractors" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/contractors') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Contractors</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>

                {/* Employee Management Section */}
                <Collapsible open={openSections.employee} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, employee: open }))}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-600 transition-all duration-300 rounded-lg mx-2 px-3 py-2.5 shadow-sm hover:shadow-md">
                      <Icon icon="mdi:account-group-outline" className="w-5 h-5" />
                      <span className="font-medium">Employee Management</span>
                      <Icon 
                        icon="mdi:chevron-right" 
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${openSections.employee ? 'rotate-90' : ''}`} 
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/departments" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/departments') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Departments</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/designations" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/designations') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Designations</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/manage-employees" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/manage-employees') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Manage Employees</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/employees-promotions" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/employees-promotions') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Employees Promotions</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton className="text-blue-200 hover:text-white hover:bg-blue-700/50 transition-all duration-200 rounded-md px-3 py-2">
                          <span className="font-medium">Employees Notices</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton className="text-blue-200 hover:text-white hover:bg-blue-700/50 transition-all duration-200 rounded-md px-3 py-2">
                          <span className="font-medium">Employees Terminations</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>

                {/* Payroll Management Section */}
                <Collapsible open={openSections.payroll} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, payroll: open }))}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-600 transition-all duration-300 rounded-lg mx-2 px-3 py-2.5 shadow-sm hover:shadow-md">
                      <Icon icon="mdi:account-cash-outline" className="w-5 h-5" />
                      <span className="font-medium">Payroll Management</span>
                      <Icon 
                        icon="mdi:chevron-right" 
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${openSections.payroll ? 'rotate-90' : ''}`} 
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/work-shifts" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/work-shifts') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Work Shifts</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/attendance-policy" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/attendance-policy') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Attendance Policy</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/leave-policy" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/leave-policy') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Leave Policy</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>

                {/* Salary Management Section */}
                <Collapsible open={openSections.salary} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, salary: open }))}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-600 transition-all duration-300 rounded-lg mx-2 px-3 py-2.5 shadow-sm hover:shadow-md">
                      <Icon icon="mdi:currency-usd" className="w-5 h-5" />
                      <span className="font-medium">Salary Management</span>
                      <Icon 
                        icon="mdi:chevron-right" 
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${openSections.salary ? 'rotate-90' : ''}`} 
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/monthly-salary-cycle" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/monthly-salary-cycle') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Monthly Salary Cycle</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/salary-allowances" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/salary-allowances') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Salary Allowances</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/salary-deductions" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/salary-deductions') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Salary Deductions</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/monthly-pay-grade" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/monthly-pay-grade') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Monthly Pay Grade</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/salary-advance" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/hourly-pay-grade') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Salary Advance</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/bonus-setup" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/bonus-setup') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Bonus Setup</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/bonus-allocations" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/bonus-allocations') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Bonus Allocations</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/generate-salary" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/generate-salary') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Generate Salary</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>

                {/* Leave Management Section */}
                <Collapsible open={openSections.leave} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, leave: open }))}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-600 transition-all duration-300 rounded-lg mx-2 px-3 py-2.5 shadow-sm hover:shadow-md">
                      <Icon icon="mdi:calendar-clock-outline" className="w-5 h-5" />
                      <span className="font-medium">Leave Management</span>
                      <Icon 
                        icon="mdi:chevron-right" 
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${openSections.leave ? 'rotate-90' : ''}`} 
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/manage-holidays" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/manage-holidays') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Manage Holiday</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/public-holiday" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/public-holiday') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Public Holiday</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/leave-applications" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/leave-applications') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Leave Applications</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>

                {/* Attendance Management Section */}
                <Collapsible open={openSections.attendance} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, attendance: open }))}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-600 transition-all duration-300 rounded-lg mx-2 px-3 py-2.5 shadow-sm hover:shadow-md">
                      <Icon icon="mdi:clock-check-outline" className="w-5 h-5" />
                      <span className="font-medium">Attendance Management</span>
                      <Icon 
                        icon="mdi:chevron-right" 
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${openSections.attendance ? 'rotate-90' : ''}`} 
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/attendance-logs" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/attendance-logs') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Attendance Log</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/field-attendance-schedule" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/field-attendance-schedule') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Field Attendance Schedule</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/attendance-regularisation" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/attendance-regularisation') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Attendance Regularisation</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>

                {/* Reports Section */}
                <Collapsible open={openSections.reports} onOpenChange={(open) => setOpenSections(prev => ({ ...prev, reports: open }))}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-600 transition-all duration-300 rounded-lg mx-2 px-3 py-2.5 shadow-sm hover:shadow-md">
                      <Icon icon="mdi:chart-line" className="w-5 h-5" />
                      <span className="font-medium">Reports</span>
                      <Icon 
                        icon="mdi:chevron-right" 
                        className={`w-4 h-4 ml-auto transition-transform duration-300 ${openSections.reports ? 'rotate-90' : ''}`} 
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="ml-4 mt-2 space-y-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/attendance-reports" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/attendance-reports') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Attendance Reports</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/leave-reports" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/leave-reports') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Leave Reports</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link href="/salary-statements" className={`transition-all duration-200 rounded-md px-3 py-2 ${
                            isActiveLink('/salary-statements') 
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md' 
                              : 'text-blue-200 hover:text-white hover:bg-blue-700/50'
                          }`}>
                            <span className="font-medium">Salary Statements</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>

                {/* Notice Board */}
                <div className="pt-2">
                  <SidebarMenuItem>
                    <SidebarMenuButton className="text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-600 transition-all duration-300 rounded-lg mx-2 px-3 py-2.5 shadow-sm hover:shadow-md">
                      <Icon icon="mdi:bulletin-board" className="w-5 h-5" />
                      <span className="font-medium">Notice Board</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <div className="min-h-screen bg-gray-50 overflow-hidden">
            <header className="bg-gradient-to-r from-blue-800 to-blue-700 border-b border-blue-600 px-6 py-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="text-white hover:bg-blue-600/50 transition-colors duration-200" />
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="w-8 h-8 ring-2 ring-blue-300">
                    <AvatarImage src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/reweb/blocks/placeholder.png" />
                    <AvatarFallback className="bg-blue-500 text-white">A</AvatarFallback>
                  </Avatar>
                  <span className="text-white font-medium">admin</span>
                  <Icon icon="mdi:chevron-down" className="w-4 h-4 text-white" />
                </div>
              </div>
            </header>
            <main className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Icon icon="mdi:view-dashboard" className="w-5 h-5 text-blue-500" />
                <h1 className="text-blue-500 font-medium">Dashboard</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-2">TOTAL EMPLOYEE</p>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:account-group-outline"
                            className="w-12 h-12 text-blue-500"
                          />
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:trending-up" className="w-4 h-4 text-green-500" />
                            <span className="text-2xl font-bold text-green-500">78</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-2">DEPARTMENT</p>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:office-building-outline"
                            className="w-12 h-12 text-blue-500"
                          />
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:trending-up" className="w-4 h-4 text-blue-500" />
                            <span className="text-2xl font-bold text-blue-500">72</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-2">PRESENT</p>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:account-check-outline"
                            className="w-12 h-12 text-blue-500"
                          />
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:trending-up" className="w-4 h-4 text-blue-500" />
                            <span className="text-2xl font-bold text-blue-500">0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium mb-2">ABSENT</p>
                        <div className="flex items-center gap-2">
                          <Icon
                            icon="mdi:account-remove-outline"
                            className="w-12 h-12 text-red-500"
                          />
                          <div className="flex items-center gap-1">
                            <Icon icon="mdi:trending-down" className="w-4 h-4 text-red-500" />
                            <span className="text-2xl font-bold text-red-500">78</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="bg-white">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today Attendance</h2>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Photo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>In time</TableHead>
                            <TableHead>Out Time</TableHead>
                            <TableHead>Late</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              No data available
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  <Card className="bg-white mt-6">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        HEY ADMIN PLEASE CHECK IN/OUT YOUR ATTENDANCE
                      </h2>
                      <div className="space-y-4">
                        <p className="text-gray-600">Your IP is 49.36.9.26</p>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2">
                          <Icon icon="mdi:clock-check-outline" className="w-4 h-4 mr-2" />
                          Check In
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div>
                  <Card className="bg-white">
                    <CardContent className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">NOTICE BOARD</h2>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Icon icon="mdi:flag" className="w-6 h-6 text-blue-500 mt-1" />
                          <div>
                            <h3 className="font-medium text-gray-900 mb-1">Meeting..</h3>
                            <p className="text-sm text-gray-500 mb-1">
                              Published Date: 12 Mar 2026
                            </p>
                            <p className="text-sm text-gray-500">Publish By: Admin</p>
                            <p className="text-sm text-gray-500 mt-2">Description</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
        </div>
      </div>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
