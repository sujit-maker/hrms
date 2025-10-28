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

interface AttendancePolicy {
  id: string;
  serviceProviderID?: number;
  companyID?: number;
  branchesID?: number;
  serviceProvider?: string;
  companyName?: string;
  branchName?: string;
  attendancePolicyName: string;
  workingHoursType: string;
  checkin_begin_before_min: number;
  checkout_end_after_min: number;
  checkin_grace_time_min: number;
  min_work_hours_half_day_min: number;
  max_late_check_in_time:number;
  earlyCheckoutBeforeEndMin:number;
   markAs?: string;
  lateMarkCount?: string;
  allow_self_mark_attendance: boolean;
  allow_manager_update_ot: boolean;
  max_ot_hours_per_day_min: number;
  createdAt: string;
}

interface SelectedItem {
  display: string;
  value: number;
  item: any;
}

export function AttendancePolicyManagement() {
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<AttendancePolicy | null>(
    null
  );
  const [formData, setFormData] = useState({
    serviceProvider: "",
    companyName: "",
    branchName: "",
    attendancePolicyName: "",
    serviceProviderID: undefined as number | undefined,
    companyID: undefined as number | undefined,
    branchesID: undefined as number | undefined,
    workingHoursType: "Fixed",
    checkin_begin_before_min: 0,
    checkout_end_after_min: 0,
    checkin_grace_time_min: 0,
    min_work_hours_half_day_min: 0,
    max_late_check_in_time:0,
    earlyCheckoutBeforeEndMin:0,
    markAs: "" as "Absent" | "Half Day" | "",
    lateMarkCount: "",
    allow_self_mark_attendance: false,
    allow_manager_update_ot: false,
    max_ot_hours_per_day_min: 0,
  });

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.29.225:8000";

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

  // Load attendance policies on component mount
  useEffect(() => {
    loadAttendancePolicies();
  }, []);

  const loadAttendancePolicies = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/attendance-policy`, {
        cache: "no-store",
      });
      const data = await res.json();
      const policiesData = (Array.isArray(data) ? data : []).map(
        (policy: any) => ({
          id: policy.id.toString(),
          serviceProviderID: policy.serviceProviderID,
          companyID: policy.companyID,
          branchesID: policy.branchesID,
          serviceProvider: policy.serviceProvider?.companyName || "",
          companyName: policy.company?.companyName || "",
          branchName: policy.branches?.branchName || "",
          attendancePolicyName: policy.attendancePolicyName,
          workingHoursType: policy.workingHoursType,
          markAs: (policy.markAs as "Absent" | "Half Day") ?? "",
          lateMarkCount: policy.lateMarkCount,
          checkin_begin_before_min: policy.checkin_begin_before_min || 0,
          checkout_end_after_min: policy.checkout_end_after_min || 0,
          checkin_grace_time_min: policy.checkin_grace_time_min || 0,
          min_work_hours_half_day_min: policy.min_work_hours_half_day_min || 0,
          max_late_check_in_time:policy.max_late_check_in_time || 0,
          earlyCheckoutBeforeEndMin:policy.earlyCheckoutBeforeEndMin || 0,
          allow_self_mark_attendance: policy.allow_self_mark_attendance || false,
          allow_manager_update_ot: policy.allow_manager_update_ot || false,
          max_ot_hours_per_day_min: policy.max_ot_hours_per_day_min || 0,
          createdAt: policy.createdAt
            ? new Date(policy.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        })
      );
      setPolicies(policiesData);
    } catch (error) {
      console.error("Error loading attendance policies:", error);
    }
  };

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.attendancePolicyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (policy.serviceProvider || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (policy.companyName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (policy.branchName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const attendancePolicyData = {
        serviceProviderID: formData.serviceProviderID,
        companyID: formData.companyID,
        branchesID: formData.branchesID,
        attendancePolicyName: formData.attendancePolicyName,
        workingHoursType: formData.workingHoursType,
        checkin_begin_before_min: formData.checkin_begin_before_min,
        checkout_end_after_min: formData.checkout_end_after_min,
        checkin_grace_time_min: formData.checkin_grace_time_min,
        markAs:formData.markAs,
        lateMarkCount:formData.lateMarkCount,
        min_work_hours_half_day_min: formData.min_work_hours_half_day_min,
        max_late_check_in_time:formData.max_late_check_in_time,
        earlyCheckoutBeforeEndMin:formData.earlyCheckoutBeforeEndMin,
        allow_self_mark_attendance: formData.allow_self_mark_attendance,
        allow_manager_update_ot: formData.allow_manager_update_ot,
        max_ot_hours_per_day_min: formData.max_ot_hours_per_day_min,
      };

      const url = editingPolicy
        ? `${BACKEND_URL}/attendance-policy/${editingPolicy.id}`
        : `${BACKEND_URL}/attendance-policy`;
      const method = editingPolicy ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendancePolicyData),
      });
      if (!res.ok) {
        throw new Error(`Failed to save attendance policy: ${res.status}`);
      }

      await loadAttendancePolicies();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving attendance policy:", error);
      // You might want to show an error message to the user here
    }
  };

  const resetForm = () => {
    setFormData({
      serviceProvider: "",
      companyName: "",
      branchName: "",
      attendancePolicyName: "",
      serviceProviderID: undefined,
      companyID: undefined,
      branchesID: undefined,
      workingHoursType: "Fixed",
      checkin_begin_before_min: 0,
      checkout_end_after_min: 0,
      checkin_grace_time_min: 0,
      markAs:"",
      lateMarkCount:"",   
      min_work_hours_half_day_min: 0,
      max_late_check_in_time:0,
      earlyCheckoutBeforeEndMin:0,
      allow_self_mark_attendance: false,
      allow_manager_update_ot: false,
      max_ot_hours_per_day_min: 0,
    });
    setEditingPolicy(null);
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

  const handleEdit = (policy: AttendancePolicy) => {
    setFormData({
      serviceProvider: policy.serviceProvider || "",
      companyName: policy.companyName || "",
      branchName: policy.branchName || "",
      attendancePolicyName: policy.attendancePolicyName,
      serviceProviderID: policy.serviceProviderID,
      companyID: policy.companyID,
      branchesID: policy.branchesID,
      workingHoursType: policy.workingHoursType,
      checkin_begin_before_min: policy.checkin_begin_before_min,
      checkout_end_after_min: policy.checkout_end_after_min,
      checkin_grace_time_min: policy.checkin_grace_time_min,
      markAs: (policy.markAs as "Absent" | "Half Day") ?? "",
      lateMarkCount:policy.lateMarkCount || "",
      min_work_hours_half_day_min: policy.min_work_hours_half_day_min,
      max_late_check_in_time:policy.max_late_check_in_time,
      earlyCheckoutBeforeEndMin:policy.earlyCheckoutBeforeEndMin,
      allow_self_mark_attendance: policy.allow_self_mark_attendance,
      allow_manager_update_ot: policy.allow_manager_update_ot,
      max_ot_hours_per_day_min: policy.max_ot_hours_per_day_min,
    });
    setEditingPolicy(policy);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/attendance-policy/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error(`Failed to delete attendance policy: ${res.status}`);
      }
      await loadAttendancePolicies();
    } catch (error) {
      console.error("Error deleting attendance policy:", error);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Attendance Policy</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Manage attendance policies and rules
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={resetForm}
              className="bg-blue-600 hover:bg-blue-700 flex-shrink-0 text-sm px-3 py-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Attendance Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? "Edit Attendance Policy" : "Add New Attendance Policy"}
              </DialogTitle>
              <DialogDescription>
                {editingPolicy 
                  ? "Update the attendance policy information below." 
                  : "Fill in the details to add a new attendance policy."}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="space-y-6"
            >
              {/* Basic Information */}
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
                <Label htmlFor="attendancePolicyName">Attendance Policy Name *</Label>
                <Input
                  id="attendancePolicyName"
                  value={formData.attendancePolicyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      attendancePolicyName: e.target.value,
                    }))
                  }
                  placeholder="Enter attendance policy name"
                  required
                />
              </div>

              {/* Working Hours Configuration */}
                <div className="space-y-2">
                <Label htmlFor="workingHoursType">Working Hours *</Label>
                  <select
                  id="workingHoursType"
                  value={formData.workingHoursType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      workingHoursType: e.target.value,
                    }))
                  }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Fixed">Fixed</option>
                    <option value="Flexible">Flexible</option>
                  </select>
              </div>

              {/* Check-In/Check-Out Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Check-In/Check-Out Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkin_begin_before_min">Check-In Begin Before (Minutes)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="checkin_begin_before_min"
                        type="text"
                        value={formData.checkin_begin_before_min}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData((prev) => ({
                            ...prev,
                            checkin_begin_before_min: parseInt(value) || 0,
                          }));
                        }}
                        className="flex-1"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed and Flexible</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="checkout_end_after_min">Check-Out End After (Minutes) *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="checkout_end_after_min"
                        type="text"
                        value={formData.checkout_end_after_min}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData((prev) => ({
                            ...prev,
                            checkout_end_after_min: parseInt(value) || 0,
                          }));
                        }}
                        className="flex-1"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed and Flexible</p>
                  </div>
                </div>
              </div>

              {/* Grace Time and Minimum Hours */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Grace Time and Minimum Hours</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="checkin_grace_time_min">Check-In Grace Time (Minutes)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="checkin_grace_time_min"
                        type="text"
                        value={formData.checkin_grace_time_min}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData((prev) => ({
                            ...prev,
                            checkin_grace_time_min: parseInt(value) || 0,
                          }));
                        }}
                        className="flex-1"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed Shift</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min_work_hours_half_day_min">Minimum Work Hours for Half Day (Minutes)</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="min_work_hours_half_day_min"
                        type="text"
                        value={formData.min_work_hours_half_day_min}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData((prev) => ({
                            ...prev,
                            min_work_hours_half_day_min: parseInt(value) || 0,
                          }));
                        }}
                        className="flex-1"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed and Flexible</p>
                  </div>
                  






                    <div className="space-y-2">
                    <Label htmlFor="max_late_check_in_time">max_late_check_in_time</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="max_late_check_in_time"
                        type="text"
                        value={formData.max_late_check_in_time}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData((prev) => ({
                            ...prev,
                            max_late_check_in_time: parseInt(value) || 0,
                          }));
                        }}
                        className="flex-1"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed </p>
                  </div>


                    <div className="space-y-2">
                    <Label htmlFor="earlyCheckoutBeforeEndMin">earlyCheckoutBeforeEndMin</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="earlyCheckoutBeforeEndMin"
                        type="text"
                        value={formData.earlyCheckoutBeforeEndMin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData((prev) => ({
                            ...prev,
                            earlyCheckoutBeforeEndMin: parseInt(value) || 0,
                          }));
                        }}
                        className="flex-1"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                    </div>
                    <p className="text-xs text-gray-500">For Fixed </p>
                  </div>





                </div>
              </div>

              <div className="flex items-center space-x-3">
  <Label className="whitespace-nowrap">Mark as</Label>
  <select
    value={formData.markAs}
    onChange={(e) =>
      setFormData((p) => ({
        ...p,
        markAs: e.target.value as "Absent" | "Half Day" | "",
      }))
    }
    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    required
  >
    <option value="">Select</option>
    <option value="Absent">Absent</option>
    <option value="Half Day">Half Day</option>
  </select>

  <Label className="whitespace-nowrap">After</Label>
  <Input
    type="text"
    min={0}
    value={formData.lateMarkCount}
    onChange={(e) =>
      setFormData((p) => ({
        ...p,
        lateMarkCount: e.target.value,
      }))
    }
    className="w-20"
    placeholder="0"
  />

  <Label className="whitespace-nowrap">Late Marks</Label>
</div>

              {/* Employee Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Employee Permissions</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.allow_self_mark_attendance}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          allow_self_mark_attendance: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">Allow employee to mark attendance from Dashboard</span>
                  </label>
                </div>
              </div>

              {/* Overtime Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Overtime Configuration</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.allow_manager_update_ot}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          allow_manager_update_ot: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm">Allow Manager to Update OT (Yes/No)</span>
                  </label>
                  </div>
                  <div className="space-y-2">
                  <Label htmlFor="max_ot_hours_per_day_min">Maximum OT Hours / Per Day (Minutes)</Label>
                  <div className="flex items-center space-x-2">
                      <Input
                      id="max_ot_hours_per_day_min"
                        type="text"
                      value={formData.max_ot_hours_per_day_min}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData((prev) => ({
                          ...prev,
                          max_ot_hours_per_day_min: parseInt(value) || 0,
                        }));
                      }}
                      className="flex-1"
                        required
                      />
                      <span className="text-sm text-gray-500">Min</span>
                  </div>
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
                  {editingPolicy ? "Update Attendance Policy" : "Add Attendance Policy"}
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
                placeholder="Search attendance policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Badge variant="secondary" className="px-3 py-1 flex-shrink-0">
              {filteredPolicies.length} attendance policies
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Policies Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="mdi:clock-outline" className="w-5 h-5" />
            Attendance Policies List
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
                  <TableHead className="w-[150px]">Policy Name</TableHead>
                  <TableHead className="w-[100px]">Working Hours</TableHead>
                  <TableHead className="w-[100px]">Created</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPolicies.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon
                          icon="mdi:clock-outline"
                          className="w-12 h-12 text-gray-300"
                        />
                        <p>No attendance policies found</p>
                        <p className="text-sm">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPolicies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell className="whitespace-nowrap">
                        {policy.serviceProvider}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {policy.companyName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {policy.branchName}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {policy.attendancePolicyName}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-center">
                        <Badge variant="outline">{policy.workingHoursType}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {policy.createdAt}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(policy)}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(policy.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
