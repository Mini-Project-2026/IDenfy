import React, { useState, useMemo } from "react";
import { mockStudents as initialStudents, mockCertificates } from "../../mockData";
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

const ManageStudentsPage = () => {
  const [students, setStudents] = useState([...initialStudents]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { toast } = useToast();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("idenfy_user"));
    } catch {
      return null;
    }
  }, []);
  
  const isSuperAdmin = user?.role === "super_admin";

  // Form state
  const emptyForm = {
    name: "",
    email: "",
    password: "",
    rollNo: "",
    department: "",
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
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;
    const newStudent = {
      id: `stu-${Date.now()}`,
      ...formData,
      enrolledDate: new Date().toISOString().split("T")[0],
    };
    setStudents((prev) => [...prev, newStudent]);
    setFormData({ ...emptyForm });
    setFormErrors({});
    setIsAddOpen(false);
    toast({
      title: "Student registered",
      description: `${newStudent.name} has been added successfully.`,
    });
  };

  const handleEditOpen = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: student.password || "",
      rollNo: student.rollNo,
      department: student.department,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleEdit = () => {
    if (!validateForm()) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id ? { ...s, ...formData } : s
      )
    );
    setIsEditOpen(false);
    setSelectedStudent(null);
    setFormData({ ...emptyForm });
    toast({
      title: "Student updated",
      description: `${formData.name}'s details have been updated.`,
    });
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
          className={formErrors.email ? "border-red-400" : ""}
        />
        {formErrors.email && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {formErrors.email}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="text"
          placeholder="e.g., SecurePass123!"
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rollNo">Roll Number</Label>
          <Input
            id="rollNo"
            placeholder="e.g., NDA-2023-042"
            value={formData.rollNo}
            onChange={(e) => handleFormChange("rollNo", e.target.value)}
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
    </div>
  );

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-500" />
            Manage Students
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {students.length} registered student{students.length !== 1 && "s"}
          </p>
        </div>

        {/* Add Student Dialog */}
        {isSuperAdmin && (
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
                {isSuperAdmin && (
                  <TableHead className="font-semibold text-right">
                    Actions
                  </TableHead>
                )}
                {!isSuperAdmin && (
                  <TableHead className="font-semibold text-right">
                    View
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length > 0 ? (
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
                    {isSuperAdmin ? (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setViewStudent(student);
                              setIsViewOpen(true);
                            }}
                            className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            title="View Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditOpen(student)}
                              className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteOpen(student)}
                              className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    ) : (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setViewStudent(student);
                            setIsViewOpen(true);
                          }}
                          className="h-8 w-8 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
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
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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
                </div>
              </div>

              {/* Certificates Section */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileBadge className="w-4 h-4 text-indigo-500" />
                  Issued Certificates
                  <span className="text-xs font-normal bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-1.5 py-0.5 rounded">
                    {mockCertificates.filter(c => c.studentId === viewStudent.id).length}
                  </span>
                </h4>

                {(() => {
                  const studentCerts = mockCertificates.filter(c => c.studentId === viewStudent.id);
                  if (studentCerts.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        No certificates issued yet.
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2.5">
                      {studentCerts.map(cert => (
                        <div
                          key={cert.id}
                          className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                              {cert.course}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                {cert.cid}
                              </span>
                              <span className="text-xs text-slate-400">
                                {cert.issueDate}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              cert.category === "Academic"
                                ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}>
                              {cert.category}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              cert.status === "Valid"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}>
                              {cert.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
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
