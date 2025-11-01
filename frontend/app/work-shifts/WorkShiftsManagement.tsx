"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Icon } from "@iconify/react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { SearchSuggestInput } from "../components/SearchSuggestInput";
import api, { endpoints } from "../../utils/api";

interface DaySchedule {
  day: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  isWeeklyOff: boolean;
}

interface WorkShift {
  id: string;
  serviceProviderID?: number;
  companyID?: number;
  branchesID?: number;
  serviceProvider?: string;
  companyName?: string;
  branchName?: string;
  workShiftName: string;
  weeklySchedule: DaySchedule[];
  createdAt: string;
}

interface SelectedItem {
  display: string;
  value: number;
  item: any;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function WorkShiftsManagement() {
  const [workShifts, setWorkShifts] = useState<WorkShift[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkShift, setEditingWorkShift] = useState<WorkShift | null>(
    null
  );
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    workShiftName: "",
    serviceProviderID: undefined as number | undefined,
    companyID: undefined as number | undefined,
    branchesID: undefined as number | undefined,
    weeklySchedule: DAYS_OF_WEEK.map((day) => ({
      day,
      startTime: "10:00",
      endTime: "18:00",
      totalHours: 8,
      isWeeklyOff: false, 
    })),
  });

  // Utility to format Prisma Date/Time into "HH:mm"
// Utility to normalize DB/form time into "HH:mm"
const formatDbTime = (value: string | Date | null | undefined): string => {
  if (!value) return "";

  // Already "HH:mm"
  if (typeof value === "string" && /^\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  // Try parsing as Date
  const d = new Date(value as any);
  if (isNaN(d.getTime())) return "";

  // Force to UTC time string
  return d.toISOString().substring(11, 16); // "HH:mm"
};

  // API functions for search and suggest
  // Use absolute URLs to backend (port 8000) and filter client-side by display fields
  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

  const fetchServiceProviders = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/service-provider`, {
        cache: "no-store",
      });
      const data = await res.json();
      const q = query.toLowerCase();
      return Array.isArray(data)
        ? data.filter((item: any) =>
            (item?.companyName || "").toLowerCase().includes(q)
          )
        : [];
    } catch (error) {
      console.error("Error fetching service providers:", error);
      return [];
    }
  };

  const fetchCompanies = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/company`, { cache: "no-store" });
      const data = await res.json();
      const q = query.toLowerCase();
      return Array.isArray(data)
        ? data.filter((item: any) =>
            (item?.companyName || "").toLowerCase().includes(q)
          )
        : [];
    } catch (error) {
      console.error("Error fetching companies:", error);
      return [];
    }
  };

  const fetchBranches = async (query: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/branches`, { cache: "no-store" });
      const data = await res.json();
      const q = query.toLowerCase();
      return Array.isArray(data)
        ? data.filter((item: any) =>
            (item?.branchName || "").toLowerCase().includes(q)
          )
        : [];
    } catch (error) {
      console.error("Error fetching branches:", error);
      return [];
    }
  };

  // Load work shifts on component mount
  useEffect(() => {
    loadWorkShifts();
  }, []);

   const loadWorkShifts = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/work-shift`, {
        cache: "no-store",
      });
      const data = await res.json();

      const workShiftsData = (Array.isArray(data) ? data : []).map(
        (shift: any) => ({
          id: shift.id.toString(),
          serviceProviderID: shift.serviceProviderID,
          companyID: shift.companyID,
          branchesID: shift.branchesID,
          serviceProvider: shift.serviceProvider?.companyName || "",
          companyName: shift.company?.companyName || "",
          branchName: shift.branches?.branchName || "",
          workShiftName: shift.workShiftName,
         weeklySchedule:
  shift.workShiftDay?.map((day: any) => ({
    day: day.weekDay,
    startTime: formatDbTime(day.startTime) || "10:00",
    endTime: formatDbTime(day.endTime) || "18:00",
    totalHours: day.totalMinutes
      ? Math.round((day.totalMinutes / 60) * 10) / 10
      : 8,
    isWeeklyOff: day.weeklyOff || false,
  })) ||
  DAYS_OF_WEEK.map((day) => ({
    day,
    startTime: "10:00",
    endTime: "18:00",
    totalHours: 8,
    isWeeklyOff: false,
  })),

          createdAt: shift.createdAt
            ? new Date(shift.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        })
      );

      setWorkShifts(workShiftsData);
    } catch (error) {
      console.error("Error loading work shifts:", error);
    }
  };


  const filteredWorkShifts = workShifts.filter(
    (workShift) =>
      workShift.workShiftName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (workShift.serviceProvider || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (workShift.companyName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (workShift.branchName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const calculateTotalHours = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const diffMinutes = endMinutes - startMinutes;
    return Math.round((diffMinutes / 60) * 10) / 10; // Round to 1 decimal place
  };

  const handleTimeChange = (
    dayIndex: number,
    field: "startTime" | "endTime",
    value: string,
    event?: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedSchedule = [...formData.weeklySchedule];
    updatedSchedule[dayIndex] = {
      ...updatedSchedule[dayIndex],
      [field]: value,
    };
    
    // Auto calculate total hours
    const totalHours = calculateTotalHours(
      updatedSchedule[dayIndex].startTime,
      updatedSchedule[dayIndex].endTime
    );
    updatedSchedule[dayIndex].totalHours = totalHours;
    
    setFormData((prev) => ({
      ...prev,
      weeklySchedule: updatedSchedule,
    }));

    // Close the time picker dropdown by blurring the input
    if (event?.target) {
      event.target.blur();
    }
  };

  const handleWeeklyOffChange = (dayIndex: number, isWeeklyOff: boolean) => {
    const updatedSchedule = [...formData.weeklySchedule];
    updatedSchedule[dayIndex] = {
      ...updatedSchedule[dayIndex],
      isWeeklyOff,
      totalHours: isWeeklyOff ? 0 : updatedSchedule[dayIndex].totalHours,
    };
    
    setFormData((prev) => ({
      ...prev,
      weeklySchedule: updatedSchedule,
    }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
 // Convert "HH:mm" → Date at UTC with today's date
const toDateTime = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0));
};



     const workShiftDays = formData.weeklySchedule.map((day) => ({
  weekDay: day.day,
  weeklyOff: day.isWeeklyOff,
  startTime: day.isWeeklyOff ? null : toDateTime(day.startTime),
  endTime: day.isWeeklyOff ? null : toDateTime(day.endTime),
  totalMinutes: day.isWeeklyOff ? 0 : Math.round(day.totalHours * 60),
}));


      const workShiftData = {
        serviceProviderID: formData.serviceProviderID,
        companyID: formData.companyID,
        branchesID: formData.branchesID,
        workShiftName: formData.workShiftName,
        isActive: "1",
        workShiftDays: workShiftDays,
      };

      const url = editingWorkShift
        ? `${BACKEND_URL}/work-shift/${editingWorkShift.id}`
        : `${BACKEND_URL}/work-shift`;
      const method = editingWorkShift ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workShiftData),
      });
      if (!res.ok) {
        throw new Error(`Failed to save work shift: ${res.status}`);
      }

      await loadWorkShifts();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving work shift:", error);
      // show error message if needed
    }
  };


  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      workShiftName: "",
      serviceProviderID: undefined,
      companyID: undefined,
      branchesID: undefined,
      weeklySchedule: DAYS_OF_WEEK.map((day) => ({
        day,
        startTime: "10:00",
        endTime: "18:00",
        totalHours: 8,
        isWeeklyOff: false,
      })),
    });
    setEditingWorkShift(null);
  };

  const handleServiceProviderSelect = (selected: SelectedItem) => {
    setFormData((prev) => ({
      ...prev,
      serviceProvider: selected.display,
      serviceProviderID: selected.value,
    }));
  };

  const handleCompanySelect = (selected: SelectedItem) => {
    setFormData((prev) => ({
      ...prev,
      companyName: selected.display,
      companyID: selected.value,
    }));
  };

  const handleBranchSelect = (selected: SelectedItem) => {
    setFormData((prev) => ({
      ...prev,
      branchName: selected.display,
      branchesID: selected.value,
    }));
  };

  const handleEdit = (workShift: WorkShift) => {
  setFormData({
    serviceProvider: workShift.serviceProvider || "",
    companyName: workShift.companyName || "",
    branchName: workShift.branchName || "",
    workShiftName: workShift.workShiftName,
    serviceProviderID: workShift.serviceProviderID,
    companyID: workShift.companyID,
    branchesID: workShift.branchesID,
    weeklySchedule: workShift.weeklySchedule.map((day) => ({
      ...day,
      startTime: formatDbTime(day.startTime) || "10:00",
      endTime: formatDbTime(day.endTime) || "18:00",
    })),
  });
  setEditingWorkShift(workShift);
  setIsDialogOpen(true);
};

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/work-shift/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Failed to delete work shift: ${res.status}`);
      }
      await loadWorkShifts();
    } catch (error) {
      console.error("Error deleting work shift:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Work Shifts</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage work shifts and schedules
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Work Shift
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkShift ? "Edit Work Shift" : "Add New Work Shift"}
              </DialogTitle>
              <DialogDescription>
                {editingWorkShift 
                  ? "Update the work shift information below." 
                  : "Fill in the details to add a new work shift."}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault(); // ✅ prevents page reload
                handleSubmit(e); // ✅ call your custom submit handler
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-3 gap-4">
                <SearchSuggestInput
                  label="Service Provider"
                  placeholder="Select Service Provider"
                    value={formData.serviceProvider}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, serviceProvider: value }))
                  }
                  onSelect={handleServiceProviderSelect}
                  fetchData={fetchServiceProviders}
                  displayField="companyName"
                  valueField="id"
                    required
                />
                <SearchSuggestInput
                  label="Company Name"
                  placeholder="Select Company"
                    value={formData.companyName}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, companyName: value }))
                  }
                  onSelect={handleCompanySelect}
                  fetchData={fetchCompanies}
                  displayField="companyName"
                  valueField="id"
                    required
                />
                <SearchSuggestInput
                  label="Branch Name"
                  placeholder="Select Branch"
                    value={formData.branchName}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, branchName: value }))
                  }
                  onSelect={handleBranchSelect}
                  fetchData={fetchBranches}
                  displayField="branchName"
                  valueField="id"
                    required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="workShiftName">Work Shift Name *</Label>
                <Input
                  id="workShiftName"
                  value={formData.workShiftName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      workShiftName: e.target.value,
                    }))
                  }
                  placeholder="Enter work shift name"
                  required
                />
              </div>

              {/* Weekly Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Default Working Hours</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                          Day
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                          Start Time
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                          End Time
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                          Total Hours
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-medium">
                          Weekly Off
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.weeklySchedule.map((daySchedule, index) => (
                        <tr key={daySchedule.day}>
                          <td className="border border-gray-300 px-3 py-2 font-medium">
                            {daySchedule.day}
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <Input
                              type="time"
                              value={daySchedule.startTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  index,
                                  "startTime",
                                  e.target.value,
                                  e
                                )
                              }
                              disabled={daySchedule.isWeeklyOff}
                              className="w-full"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2">
                            <Input
                              type="time"
                              value={daySchedule.endTime}
                              onChange={(e) =>
                                handleTimeChange(
                                  index,
                                  "endTime",
                                  e.target.value,
                                  e
                                )
                              }
                              disabled={daySchedule.isWeeklyOff}
                              className="w-full"
                            />
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span className="font-medium">
                              {daySchedule.totalHours}h
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={daySchedule.isWeeklyOff}
                              onChange={(e) =>
                                handleWeeklyOffChange(index, e.target.checked)
                              }
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingWorkShift ? "Update Work Shift" : "Add Work Shift"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search work shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredWorkShifts.length} work shifts
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Work Shifts Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clock-outline" className="w-5 h-5" />
            Work Shifts List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 w-full">
          <div className="overflow-x-auto w-full">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Service Provider</TableHead>
                  <TableHead className="w-[120px]">Company Name</TableHead>
                  <TableHead className="w-[120px]">Branch Name</TableHead>
                  <TableHead className="w-[150px]">Work Shift Name</TableHead>
                  <TableHead className="w-[200px]">Schedule</TableHead>
                  <TableHead className="w-[100px]">
                    Total Weekly Hours
                  </TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkShifts.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon
                          icon="mdi:clock-outline"
                          className="w-12 h-12 text-gray-300"
                        />
                        <p>No work shifts found</p>
                        <p className="text-sm">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWorkShifts.map((workShift) => {
                    // Calculate total weekly hours from the backend totalMinutes data
                    const totalWeeklyHours = workShift.weeklySchedule
                      .filter((day) => !day.isWeeklyOff)
                      .reduce((sum, day) => {
                        // Use the totalHours that was calculated from totalMinutes in loadWorkShifts
                        return sum + day.totalHours;
                      }, 0);
                    
                 const scheduleSummary = workShift.weeklySchedule
  .filter((day) => !day.isWeeklyOff)
  .map((day) => `${day.day}: ${formatDbTime(day.startTime)}-${formatDbTime(day.endTime)}`)
  .join(", ");


                    return (
                      <TableRow key={workShift.id}>
                        <TableCell className="whitespace-nowrap">
                          {workShift.serviceProvider}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {workShift.companyName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {workShift.branchName}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
                          {workShift.workShiftName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          <div
                            className="max-w-[180px] truncate"
                            title={scheduleSummary}
                          >
                            {scheduleSummary || "No working days"}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-center">
                          <Badge variant="outline">{totalWeeklyHours}h</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {workShift.createdAt}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(workShift)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(workShift.id)}
                              className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}