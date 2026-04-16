import React, { useState, useMemo, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { getUserCertificates, getMyProfile, updateUser, changePassword as changePasswordApi } from "../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Shield,
  GraduationCap,
  Trophy,
  Download,
  Copy,
  CheckCircle,
  LogOut,
  FileText,
  Calendar,
  Building2,
  User,
  Lock,
  Mail,
  Hash,
  AlertCircle,
  Eye,
  EyeOff,
  Pencil,
  ChevronDown,
} from "lucide-react";

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("idenfy_user"));
    } catch {
      return null;
    }
  }, []);

  // Redirect non-student users to admin dashboard
  useEffect(() => {
    if (user && user.role !== "user") {
      navigate("/admin/dashboard");
    }
  }, [user, navigate]);

  const [certificates, setCertificates] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(true);

  // Fetch user certificates from backend
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await getUserCertificates();
        const certs = Array.isArray(response.data.files) ? response.data.files : [];
        setCertificates(certs);
      } catch (error) {
        console.error("Failed to fetch certificates:", error);
        setCertificates([]);
      } finally {
        setLoadingCerts(false);
      }
    };

    if (user?.roll_no) {
      fetchCertificates();
    } else {
      setLoadingCerts(false);
    }
  }, [user]);

  const [studentDetails, setStudentDetails] = useState(null);

  // Fetch profile from backend
  const fetchProfile = async () => {
    try {
      const res = await getMyProfile();
      const u = res.data.user;
      setStudentDetails({
        id: u._id || "",
        name: u.name || "",
        email: u.email || "",
        rollNo: u.roll_no || "",
        department: u.department || "",
        dob: u.dob ? u.dob.split("T")[0] : "",
        enrolledDate: u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : null,
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const [profileForm, setProfileForm] = useState({
    name: "",
    department: "",
    dob: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  const studentCerts = useMemo(() => {
    if (!certificates.length) return [];
    return certificates;
  }, [certificates]);

  // If user is not a student, don't render anything (will redirect)
  if (!user || user.role !== "user") {
    return null;
  }

  const handleCopyCid = async (cid, certId) => {
    try {
      await navigator.clipboard.writeText(cid);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = cid;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(certId);
    toast({ title: "CID Copied", description: `${cid} copied to clipboard.` });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (cert) => {
    toast({
      title: "Download Started",
      description: `Downloading "${cert.course}" certificate...`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("idenfy_user");
    navigate("/login");
  };

  const openProfile = async () => {
    await fetchProfile();
    setProfileForm({
      name: studentDetails?.name || "",
      department: studentDetails?.department || "",
      dob: studentDetails?.dob || "",
    });
    setIsProfileOpen(true);
  };

  // Update profileForm when studentDetails changes (after fetch)
  useEffect(() => {
    if (studentDetails && isProfileOpen) {
      setProfileForm({
        name: studentDetails.name || "",
        department: studentDetails.department || "",
        dob: studentDetails.dob || "",
      });
    }
  }, [studentDetails]);

  const handleSaveProfile = async () => {
    try {
      await updateUser(studentDetails.rollNo, {
        name: profileForm.name,
        dob: profileForm.dob,
        department: profileForm.department,
      });
      await fetchProfile();
      toast({
        title: "Profile Updated",
        description: "Your profile details have been saved successfully.",
      });
      setIsProfileOpen(false);
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.response?.data?.error || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    }
  };

  const openPasswordDialog = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
    setShowCurrentPw(false);
    setShowNewPw(false);
    setIsPasswordOpen(true);
  };

  const handleChangePassword = async () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required.";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required.";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Must be at least 6 characters.";
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await changePasswordApi({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      setIsPasswordOpen(false);
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to change password.";
      setPasswordErrors({ currentPassword: msg });
    }
  };

  const CertificateCard = ({ cert }) => (
    <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">
      <div className="absolute top-0 right-0">
        <div className="bg-emerald-500 text-white text-[10px] font-bold px-6 py-0.5 transform rotate-45 translate-x-5 translate-y-2.5 shadow-sm">
          VERIFIED
        </div>
      </div>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg shrink-0 bg-indigo-50 dark:bg-indigo-950/30">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-snug line-clamp-2">{cert.certificateName || cert.course || "Certificate"}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1.5">
              <Building2 className="w-3 h-3" />
              {cert.institution || "Institution"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(cert.createdAt || cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </div>
          <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs gap-1">
            <CheckCircle className="w-3 h-3" />
            Valid
          </Badge>
        </div>
        <div className="mt-3 p-2 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mb-0.5">Blockchain CID</p>
          <p className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all">{cert.cid}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDownload(cert)}
          className="flex-1 gap-1.5 text-xs h-9 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400 dark:hover:border-indigo-800 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleCopyCid(cert.cid, cert._id || cert.id)}
          className={`flex-1 gap-1.5 text-xs h-9 transition-all ${
            copiedId === (cert._id || cert.id)
              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          {copiedId === cert.id ? (
            <><CheckCircle className="w-3.5 h-3.5" />Copied!</>
          ) : (
            <><Copy className="w-3.5 h-3.5" />Copy CID</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );

  const EmptyState = ({ type }) => (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
        <FileText className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
        No {type} certificates yet
      </h3>
      <p className="text-sm text-slate-400 max-w-sm mx-auto">
        Once your institution issues {type.toLowerCase()} certificates, they will appear here.
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Top Nav */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              IDenfy <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Student</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                id="profile-btn"
                type="button"
              >
                <Avatar className="h-8 w-8 border-2 border-indigo-200 dark:border-indigo-800">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-semibold">
                    {getInitials(studentDetails?.name || user?.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
                  {studentDetails?.name || user?.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => { setProfileMenuOpen(false); openProfile(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-slate-400" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => { setProfileMenuOpen(false); openPasswordDialog(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Lock className="w-4 h-4 text-slate-400" />
                    Change Password
                  </button>
                  <div className="mx-3 my-1.5 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => { setProfileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-8 mb-8 shadow-lg shadow-indigo-200/50 dark:shadow-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10 flex items-start gap-6">
            <Avatar className="h-20 w-20 border-4 border-white/20 shadow-lg shrink-0 hidden md:flex">
              <AvatarFallback className="bg-white/15 backdrop-blur-sm text-white text-2xl font-bold">
                {getInitials(studentDetails?.name || user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back,</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{studentDetails?.name || user?.name || "Student"}</h1>
              <p className="text-indigo-200/80 max-w-lg">View and manage your blockchain-verified certificates.</p>
            </div>
          </div>
        </div>

        {/* Certificate Grid */}
        {loadingCerts ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Loading your certificates...</p>
            </div>
          </div>
        ) : studentCerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {studentCerts.map((cert) => (
              <CertificateCard key={cert._id || cert.id} cert={cert} />
            ))}
          </div>
        ) : (
          <EmptyState type={""} />
        )}
      </main>

      {/* ===== Profile Dialog ===== */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              My Profile
            </DialogTitle>
            <DialogDescription>
              Update your personal details. Email and Roll Number cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-indigo-200 dark:border-indigo-800">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xl font-bold">
                  {getInitials(profileForm.name || user?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{profileForm.name || user?.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{studentDetails?.rollNo}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input id="profile-name" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                <Badge variant="secondary" className="text-[10px] ml-1 px-1.5 py-0">Read only</Badge>
              </Label>
              <Input value={studentDetails?.email || ""} disabled className="h-10 bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" /> Roll Number
                <Badge variant="secondary" className="text-[10px] ml-1 px-1.5 py-0">Read only</Badge>
              </Label>
              <Input value={studentDetails?.rollNo || ""} disabled className="h-10 bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-dept">Department</Label>
              <Input id="profile-dept" value={profileForm.department} onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))} className="h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-dob">Date of Birth</Label>
              <Input id="profile-dob" type="date" value={profileForm.dob} onChange={(e) => setProfileForm((p) => ({ ...p, dob: e.target.value }))} className="h-10" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button onClick={handleSaveProfile} className="bg-indigo-600 hover:bg-indigo-700 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Change Password Dialog ===== */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-500" /> Change Password
            </DialogTitle>
            <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPw ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => { setPasswordForm((p) => ({ ...p, currentPassword: e.target.value })); if (passwordErrors.currentPassword) setPasswordErrors((p) => ({ ...p, currentPassword: "" })); }}
                  className={`h-10 pr-10 ${passwordErrors.currentPassword ? "border-red-400" : ""}`}
                />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passwordErrors.currentPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPw ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => { setPasswordForm((p) => ({ ...p, newPassword: e.target.value })); if (passwordErrors.newPassword) setPasswordErrors((p) => ({ ...p, newPassword: "" })); }}
                  className={`h-10 pr-10 ${passwordErrors.newPassword ? "border-red-400" : ""}`}
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passwordErrors.newPassword}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm New Password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => { setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value })); if (passwordErrors.confirmPassword) setPasswordErrors((p) => ({ ...p, confirmPassword: "" })); }}
                className={`h-10 ${passwordErrors.confirmPassword ? "border-red-400" : ""}`}
              />
              {passwordErrors.confirmPassword && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passwordErrors.confirmPassword}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
            <Button onClick={handleChangePassword} className="bg-indigo-600 hover:bg-indigo-700 text-white">Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StudentPage = () => (
  <Routes>
    <Route path="dashboard" element={<StudentDashboard />} />
    <Route path="*" element={<StudentDashboard />} />
  </Routes>
);

export default StudentPage;
