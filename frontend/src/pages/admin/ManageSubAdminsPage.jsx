import React, { useState, useEffect } from "react";
import { mockUsers as initialUsers } from "../../mockData";
import { getAllUsers, createUser } from "../../services/api";
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
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const { toast } = useToast();

  useEffect(() => {
    const fetchSubAdmins = async () => {
      try {
        const response = await getAllUsers();
        const data = response.data;
        const allUsers = Array.isArray(data) ? data : (data && data.users ? data.users : []);
        if (!Array.isArray(allUsers)) {
          throw new Error('Invalid response format');
        }
        const subAdminUsers = allUsers.filter(u => u.role === 'subadmin').map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          subRole: u.subRole,
        }));
        setAdmins(subAdminUsers);
      } catch (error) {
        console.error("Failed to fetch sub-admins:", error);
        toast({
          title: "Failed to load sub-admins",
          description: "Could not fetch sub-admin data from server.",
          variant: "destructive",
        });
        // Fallback to mock data
        setAdmins([...initialUsers].filter((u) => u.role === "subadmin"));
      } finally {
        setLoading(false);
      }
    };
    fetchSubAdmins();
  }, []);

  // Form state
  const emptyForm = {
    name: "",
    email: "",
    password: "",
  };
  const [formData, setFormData] = useState({ ...emptyForm });

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = async (isEditing = false) => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Authority Name is required.";
    if (!formData.email.trim()) errors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format.";
    else {
      // In edit mode, skip email check if it's the same email
      const isEmailChanged = !isEditing || formData.email !== selectedAdmin?.email;
      
      if (isEmailChanged) {
        try {
          // Check if email exists in entire database (all roles)
          const allUsersResponse = await getAllUsers();
          const allUsersData = allUsersResponse.data;
          const allUsers = Array.isArray(allUsersData) ? allUsersData : (allUsersData && allUsersData.users ? allUsersData.users : []);
          
          const emailExists = allUsers.some(u => u.email && u.email.toLowerCase() === formData.email.toLowerCase());
          if (emailExists) {
            errors.email = "This email is already registered in the system.";
          }
        } catch (error) {
          console.error("Error checking email availability:", error);
          // If we can't check, allow the form to proceed and let backend handle it
        }
      }
    }
    if (!formData.password.trim()) errors.password = "Password is required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAdd = async () => {
    if (!(await validateForm())) return;

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "subadmin",
      };

      const response = await createUser(userData);
      const newAdmin = {
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email,
        role: response.data.user.role,
        subRole: response.data.user.subRole,
      };

      setAdmins([...admins, newAdmin]);
      setIsAddOpen(false);
      setFormData({ ...emptyForm });
      setFormErrors({});
      toast({
        title: "Sub-Admin Registered",
        description: `${newAdmin.name} has been added successfully.`,
      });
    } catch (error) {
      console.error("Failed to create sub-admin:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || "Could not register the sub-admin.";
      toast({
        title: "Registration Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  const handleEditOpen = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: admin.password,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!(await validateForm(true))) return;

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
      (a.name && a.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.email && a.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.subRole && a.subRole.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formFieldsJSX = (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Authority Name</Label>
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
                <TableHead className="font-semibold">Authority Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredAdmins.length > 0 ? (
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
                    colSpan={3}
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
