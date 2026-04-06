import React, { useState } from "react";
import { mockUsers as initialUsers } from "../../mockData";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  UserCog,
  Search,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ManageSubAdminsPage = () => {
  const [admins, setAdmins] = useState(
    [...initialUsers].filter((u) => u.role === "sub_admin")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { toast } = useToast();

  // Form state
  const emptyForm = {
    name: "",
    email: "",
    password: "",
    subRole: "",
    certCategory: "",
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
    if (!formData.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format.";
    if (!formData.password.trim()) errors.password = "Password is required.";
    if (!formData.subRole.trim()) errors.subRole = "Department is required.";
    if (!formData.certCategory) errors.certCategory = "Category is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = () => {
    if (!validateForm()) return;

    const newAdmin = {
      id: `user-${Date.now()}`,
      ...formData,
      role: "sub_admin",
    };

    setAdmins([...admins, newAdmin]);
    setIsAddOpen(false);
    toast({
      title: "Sub-Admin Registered",
      description: `${newAdmin.name} has been added successfully.`,
    });
  };

  const handleEditOpen = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: admin.password,
      subRole: admin.subRole,
      certCategory: admin.certCategory || (admin.subRole === "activity" ? "activity" : "academic"),
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleEdit = () => {
    if (!validateForm()) return;

    setAdmins((prev) =>
      prev.map((a) =>
        a.id === selectedAdmin.id ? { ...a, ...formData } : a
      )
    );
    setIsEditOpen(false);
    toast({
      title: "Sub-Admin Updated",
      description: `${formData.name}'s details have been updated.`,
    });
  };

  const handleDeleteOpen = (admin) => {
    setSelectedAdmin(admin);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    setAdmins((prev) => prev.filter((a) => a.id !== selectedAdmin.id));
    setIsDeleteOpen(false);
    toast({
      title: "Sub-Admin Removed",
      description: `${selectedAdmin.name} has been removed.`,
    });
  };

  // Filter admins
  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formFieldsJSX = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="e.g., Dr. Smith"
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
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="e.g., dean@idenfy.com"
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="text"
            placeholder="e.g., secret123"
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
        <div className="space-y-2">
          <Label htmlFor="subRole">Department Name</Label>
          <Input
            id="subRole"
            placeholder="e.g., Fee, Sports, Library"
            value={formData.subRole}
            onChange={(e) => handleFormChange("subRole", e.target.value)}
            className={formErrors.subRole ? "border-red-400" : ""}
          />
          {formErrors.subRole && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {formErrors.subRole}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="certCategory">Certificate Category</Label>
        <p className="text-xs text-slate-400 -mt-1">Which type of certificates can this admin issue?</p>
        <Select
          value={formData.certCategory}
          onValueChange={(value) => handleFormChange("certCategory", value)}
        >
          <SelectTrigger className={formErrors.certCategory ? "border-red-400" : ""}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="academic">Academic Certificates</SelectItem>
            <SelectItem value="activity">Activity Certificates</SelectItem>
            <SelectItem value="both">Both (Academic & Activity)</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.certCategory && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {formErrors.certCategory}
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
            <UserCog className="w-6 h-6 text-indigo-500" />
            Manage Department Admins
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {admins.length} active department administrator{admins.length !== 1 && "s"}
          </p>
        </div>

        {/* Add Sub-Admin Dialog */}
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
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Administrator</DialogTitle>
              <DialogDescription>
                Assign specific departmental issuing rights.
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
                Register Admin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="mb-6 shadow-sm border-slate-200 dark:border-slate-800">
        <CardContent className="pt-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card className="shadow-sm border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Department Role</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length > 0 ? (
                filteredAdmins.map((admin) => (
                  <TableRow
                    key={admin.id}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {admin.name}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {admin.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 capitalize">
                          {admin.subRole}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          (admin.certCategory || admin.subRole) === "academic"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : (admin.certCategory || admin.subRole) === "activity"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        }`}>
                          {(admin.certCategory || admin.subRole) === "both" ? "All Certs" : (admin.certCategory || admin.subRole) === "academic" ? "Academic" : "Activity"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditOpen(admin)}
                          className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteOpen(admin)}
                          className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-12 text-slate-400"
                  >
                    {searchQuery
                      ? "No admins match your search."
                      : "No department admins registered yet."}
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
            <DialogTitle>Edit Administrator</DialogTitle>
            <DialogDescription>
              Update details for {selectedAdmin?.name}.
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
              Remove Administrator
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{" "}
              <span className="font-semibold text-slate-900 dark:text-white">
                {selectedAdmin?.name}
              </span>{" "}
              from the system? This cannot be undone.
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
    </div>
  );
};

export default ManageSubAdminsPage;
