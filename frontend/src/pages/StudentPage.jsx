import React, { useState, useMemo } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { mockCertificates, mockStudents } from "../mockData";
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
import { Toaster } from "@/components/ui/toaster";
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
  const [activeFilter, setActiveFilter] = useState("all");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("idenfy_user"));
    } catch {
      return null;
    }
  }, []);

  const studentDetails = useMemo(() => {
    if (!user?.studentId) return null;
    return mockStudents.find((s) => s.id === user.studentId) || null;
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
    if (!user?.studentId) return [];
    return mockCertificates.filter((c) => c.studentId === user.studentId);
  }, [user]);

  const academicCerts = studentCerts.filter((c) => c.category === "Academic");
  const activityCerts = studentCerts.filter((c) => c.category === "Activity");

  const filteredCerts = useMemo(() => {
    if (activeFilter === "academic") return academicCerts;
    if (activeFilter === "activity") return activityCerts;
    return studentCerts;
  }, [activeFilter, studentCerts, academicCerts, activityCerts]);

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

  const openProfile = () => {
    setProfileForm({
      name: studentDetails?.name || "",
      department: studentDetails?.department || "",
      dob: studentDetails?.dob || "",
    });
    setIsProfileOpen(true);
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile details have been saved successfully.",
    });
    setIsProfileOpen(false);
  };

  const openPasswordDialog = () => {
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
    setShowCurrentPw(false);
    setShowNewPw(false);
    setIsPasswordOpen(true);
  };

  const handleChangePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required.";
    } else if (passwordForm.currentPassword !== user?.password) {
      errors.currentPassword = "Incorrect current password.";
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

    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
    setIsPasswordOpen(false);
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
          <div className={`p-2 rounded-lg shrink-0 ${cert.category === "Academic" ? "bg-indigo-50 dark:bg-indigo-950/30" : "bg-amber-50 dark:bg-amber-950/30"}`}>
            {cert.category === "Academic" ? (
              <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base leading-snug line-clamp-2">{cert.course}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1.5">
              <Building2 className="w-3 h-3" />
              {cert.institution}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
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
          onClick={() => handleCopyCid(cert.cid, cert.id)}
          className={`flex-1 gap-1.5 text-xs h-9 transition-all ${
            copiedId === cert.id
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
            <button
              onClick={openProfile}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              id="profile-btn"
              type="button"
            >
              <Avatar className="h-8 w-8 border-2 border-indigo-200 dark:border-indigo-800">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-semibold">
                  {getInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:inline">
                {user?.name}
              </span>
            </button>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
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
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back,</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{user?.name || "Student"}</h1>
              <p className="text-indigo-200/80 max-w-lg">View and manage your blockchain-verified certificates.</p>
              <div className="flex gap-4 mt-6">
                {[
                  { key: "all", count: studentCerts.length, label: "All Certificates" },
                  { key: "academic", count: academicCerts.length, label: "Academic" },
                  { key: "activity", count: activityCerts.length, label: "Extracurricular" },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveFilter(f.key)}
                    className={`rounded-xl px-5 py-3 border transition-all duration-200 text-left cursor-pointer ${
                      activeFilter === f.key
                        ? "bg-white/20 border-white/30 ring-2 ring-white/30 scale-[1.02]"
                        : "bg-white/10 border-white/10 hover:bg-white/15 hover:border-white/20"
                    }`}
                  >
                    <p className="text-2xl font-bold text-white">{f.count}</p>
                    <p className="text-xs text-indigo-200">{f.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Grid */}
        {filteredCerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCerts.map((cert) => (
              <CertificateCard key={cert.id} cert={cert} />
            ))}
          </div>
        ) : (
          <EmptyState type={activeFilter === "academic" ? "Academic" : activeFilter === "activity" ? "Extracurricular" : ""} />
        )}
      </main>

      {/* ===== Profile Dialog ===== */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-lg">
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
            <button
              type="button"
              onClick={() => { setIsProfileOpen(false); setTimeout(() => openPasswordDialog(), 200); }}
              className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
            >
              <Lock className="w-3.5 h-3.5" /> Change Password
            </button>
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

      <Toaster />
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
