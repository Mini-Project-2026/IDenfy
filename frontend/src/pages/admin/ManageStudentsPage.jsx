import React, { useState, useMemo, useEffect } from "react";
import { mockStudents as initialStudents } from "../../mockData";
import { getCertificatesByStudent } from "../../services/api";
import { createUser, getAllUsers, updateUser, deleteCertificate } from "../../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  UserPlus,
  Pencil,
  Trash2,
  Users,
  Search,
  AlertCircle,
  Eye,
  FileBadge,
  Calendar,
  Mail,
  Hash,
  Building,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ManageStudentsPage = ({ onDataChanged }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [studentCertificates, setStudentCertificates] = useState([]);
  const [certLoading, setCertLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { toast } = useToast();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("idenfy_user"));
    } catch {
      return null;
    }
  }, []);
  
  const isAdminOrSubadmin = user?.role === "admin" || user?.role === "subadmin";
  const isAdmin = user?.role === "admin";

  const fetchStudents = async () => {
    try {
      const response = await getAllUsers();
      const data = response.data;
      const allUsers = Array.isArray(data) ? data : (data && data.users ? data.users : []);
      if (!Array.isArray(allUsers)) {
        throw new Error('Invalid response format');
      }
      // Filter for users with role 'user' (students)
      const studentUsers = allUsers.filter(u => u.role === 'user').map(u => ({
        id: u._id, // Use _id as id
        name: u.name,
        email: u.email,
        rollNo: u.roll_no,
        department: u.department,
        dob: u.dob,
        enrolledDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : null,
      }));
      setStudents(studentUsers);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast({
        title: "Failed to load students",
        description: "Could not fetch student data from server.",
        variant: "destructive",
      });
      // Fallback to mock data
      setStudents([...initialStudents]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Form state
  const emptyForm = {
    name: "",
    email: "",
    password: "",
    rollNo: "",
    department: "",
    dob: "",
  };
  const [formData, setFormData] = useState({ ...emptyForm });

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required.";
    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Enter a valid email.";
    }
    if (!formData.password.trim()) errors.password = "Password is required.";
    if (!formData.rollNo.trim()) errors.rollNo = "Roll number is required.";
    if (!formData.department.trim())
      errors.department = "Department is required.";
    if (!formData.dob) {
      errors.dob = "Date of Birth is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) return;
    try {
      await createUser({
        roll_no: formData.rollNo,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        dob: formData.dob,
        department: formData.department,
        role: 'user'
      });
      // Refetch students
      await fetchStudents();
      if (typeof onDataChanged === 'function') {
        onDataChanged();
      }
      setFormData({ ...emptyForm });
      setFormErrors({});
      setIsAddOpen(false);
      toast({
        title: "Student registered",
        description: `${formData.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.error || "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEditOpen = async (student) => {
    try {
      // Always fetch latest data from backend
      const res = await getAllUsers();
      const allUsers = Array.isArray(res.data) ? res.data : (res.data && res.data.users ? res.data.users : []);
      const fresh = allUsers.find(u => u.roll_no === student.rollNo);
      setSelectedStudent(student);
      setFormData({
        name: fresh?.name || student.name,
        email: fresh?.email || student.email,
        password: "", // Do not show password
        rollNo: fresh?.roll_no || student.rollNo,
        department: fresh?.department || student.department,
        dob: fresh?.dob ? fresh.dob.split("T")[0] : (student.dob || ""),
      });
      setFormErrors({});
      setIsEditOpen(true);
    } catch (err) {
      setSelectedStudent(student);
      setFormData({
        name: student.name,
        email: student.email,
        password: "",
        rollNo: student.rollNo,
        department: student.department,
        dob: student.dob || "",
      });
      setFormErrors({});
      setIsEditOpen(true);
    }
  };

  const handleEdit = async () => {
    if (!validateForm()) return;
    try {
      await updateUser(formData.rollNo, {
        name: formData.name,
        dob: formData.dob,
        department: formData.department
      });
      await fetchStudents();
      setIsEditOpen(false);
      setSelectedStudent(null);
      setFormData({ ...emptyForm });
      toast({
        title: "Student updated",
        description: `${formData.name}'s details have been updated and saved to the database.`,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err.response?.data?.error || "An error occurred while updating.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOpen = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
    setIsDeleteOpen(false);
    toast({
      title: "Student removed",
      description: `${selectedStudent.name} has been removed from the registry.`,
      variant: "destructive",
    });
    setSelectedStudent(null);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reusable form fields — plain JSX variable, NOT a component
  const formFieldsJSX = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="e.g., Sarah Connor"
          value={formData.name}
          onChange={(e) => handleFormChange("name", e.target.value)}
          className={formErrors.name ? "border-red-400" : ""}
        />
        {formErrors.name && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {formErrors.name}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="e.g., sarah@edu.com"
          value={formData.email}
          onChange={(e) => handleFormChange("email", e.target.value)}
          disabled={isEditOpen}
          className={formErrors.email ? "border-red-400" : ""}
        />
        {formErrors.email && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {formErrors.email}
          </p>
        )}
      </div>

      {/* Password field only for Add */}
      {!isEditOpen && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => handleFormChange("password", e.target.value)}
            className={formErrors.password ? "border-red-400" : ""}
          />
          {formErrors.password && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {formErrors.password}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rollNo">Roll Number</Label>
          <Input
            id="rollNo"
            placeholder="e.g., NDA-2023-042"
            value={formData.rollNo}
            onChange={(e) => handleFormChange("rollNo", e.target.value)}
            disabled={isEditOpen}
            className={formErrors.rollNo ? "border-red-400" : ""}
          />
          {formErrors.rollNo && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {formErrors.rollNo}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            placeholder="e.g., Computer Science"
            value={formData.department}
            onChange={(e) => handleFormChange("department", e.target.value)}
            className={formErrors.department ? "border-red-400" : ""}
          />
          {formErrors.department && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {formErrors.department}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dob">Date of Birth</Label>
        <Input
          id="dob"
          type="date"
          value={formData.dob}
          onChange={(e) => handleFormChange("dob", e.target.value)}
          className={formErrors.dob ? "border-red-400" : ""}
        />
        {formErrors.dob && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {formErrors.dob}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Students
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {loading ? "Loading..." : `${students.length} registered student${students.length !== 1 && "s"}`}
          </p>
        </div>

        {/* Add Student Dialog */}
        {isAdmin && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                onClick={() => {
                  setFormData({ ...emptyForm });
                  setFormErrors({});
                }}
              >
                <UserPlus className="w-4 h-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Register New Student</DialogTitle>
                <DialogDescription>
                  Fill in student details to add them to the registry.
                </DialogDescription>
              </DialogHeader>
              {formFieldsJSX}
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleAdd}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Register Student
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search */}
      <Card className="mb-6 shadow-sm border-slate-200 dark:border-slate-800">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Student Table */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Roll No</TableHead>
                <TableHead className="font-semibold">Department</TableHead>
                {isAdmin && (
                  <TableHead className="font-semibold text-right">
                    Actions
                  </TableHead>
                )}
                {!isAdmin && (
                  <TableHead className="font-semibold text-right">
                    View
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    Loading students...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {student.name}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {student.email}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                        {student.rollNo}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {student.department}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setViewStudent(student);
                          setIsViewOpen(true);
                          setCertLoading(true);
                          getCertificatesByStudent(student.rollNo)
                            .then(res => {
                              let certs = res.data.files || [];
                              setStudentCertificates(certs);
                            })
                            .catch(() => setStudentCertificates([]))
                            .finally(() => setCertLoading(false));
                        }}
                        className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditOpen(student)}
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {/* Delete user button removed as requested */}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12 text-slate-400"
                  >
                    {searchQuery
                      ? "No students match your search."
                      : "No students registered yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update {selectedStudent?.name}'s details.
            </DialogDescription>
          </DialogHeader>
          {formFieldsJSX}
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleEdit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">
              Remove Student
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedStudent?.name}
              </span>{" "}
              from the registry? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Student Profile Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-500" />
              Student Profile
            </DialogTitle>
            <DialogDescription>
              Full details and certificates for {viewStudent?.name}.
            </DialogDescription>
          </DialogHeader>

          {viewStudent && (
            <div className="space-y-6 py-2">
              {/* Student Info Card */}
              <div className="bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-indigo-950/20 dark:to-slate-900/50 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {viewStudent.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{viewStudent.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{viewStudent.department}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{viewStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{viewStudent.rollNo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{viewStudent.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Enrolled: {viewStudent.enrolledDate || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>DOB: {viewStudent.dob || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Certificates Section */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileBadge className="w-4 h-4 text-indigo-500" />
                  Issued Certificates
                  <span className="text-xs font-normal bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                    {certLoading ? '...' : studentCertificates.length}
                  </span>
                </h4>
                {certLoading ? (
                  <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    Loading certificates...
                  </div>
                ) : studentCertificates.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    No certificates issued yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {studentCertificates.map(cert => (
                      <div
                        key={cert._id}
                        className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {cert.certificateName || cert.course || 'Certificate'}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {cert.cid}
                            </span>
                            <span className="text-xs text-slate-400">
                              {cert.createdAt ? cert.createdAt.substring(0, 10) : ''}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                            Blockchain
                          </span>
                          {isAdmin && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-white hover:bg-red-600"
                              title="Delete Certificate"
                              onClick={async () => {
                                if (!window.confirm("Are you sure you want to delete this certificate?")) return;
                                try {
                                  await deleteCertificate(cert._id);
                                  setStudentCertificates(prev => prev.filter(c => c._id !== cert._id));
                                  await fetchStudents(); // Refresh dashboard data
                                  if (typeof onDataChanged === 'function') {
                                    onDataChanged();
                                  }
                                  toast({
                                    title: "Certificate deleted",
                                    description: `Certificate has been removed successfully.`,
                                  });
                                } catch (err) {
                                  toast({
                                    title: "Delete failed",
                                    description: err.response?.data?.error || "An error occurred while deleting.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageStudentsPage;
