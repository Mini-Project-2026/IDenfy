import React, { useState, useMemo, useEffect, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
getUserCertificates,
getMyProfile,
updateUser,
changePassword as changePasswordApi,
} from "../services/api";

import {
Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
Dialog, DialogContent, DialogDescription, DialogFooter,
DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

import {
Shield, GraduationCap, Download, Copy, CheckCircle,
LogOut, FileText, Calendar, Building2, User, Lock,
Mail, Hash, AlertCircle, Eye, EyeOff, Pencil, ChevronDown,
} from "lucide-react";

const getInitials = (name) => {
if (!name) return "?";
return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
};

const StudentDashboard = () => {
const navigate = useNavigate();
const { toast } = useToast();

const [user, setUser] = useState(() => {
try {
return JSON.parse(localStorage.getItem("idenfy_user"));
} catch {
return null;
}
});

const [studentDetails, setStudentDetails] = useState(null);
const [certificates, setCertificates] = useState([]);
const [loadingCerts, setLoadingCerts] = useState(true);

const [isProfileOpen, setIsProfileOpen] = useState(false);
const [isPasswordOpen, setIsPasswordOpen] = useState(false);
const [profileMenuOpen, setProfileMenuOpen] = useState(false);

const [profileForm, setProfileForm] = useState({ name: "", department: "", dob: "" });
const [passwordForm, setPasswordForm] = useState({
currentPassword: "", newPassword: "", confirmPassword: "",
});
const [passwordErrors, setPasswordErrors] = useState({});

const [copiedId, setCopiedId] = useState(null);
const [showCurrentPw, setShowCurrentPw] = useState(false);
const [showNewPw, setShowNewPw] = useState(false);

const profileMenuRef = useRef(null);

useEffect(() => {
const handleClickOutside = (e) => {
if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
setProfileMenuOpen(false);
}
};
document.addEventListener("mousedown", handleClickOutside);
return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);

useEffect(() => {
if (user && user.role !== "user") navigate("/admin/dashboard");
}, [user]);

const fetchProfile = async () => {
try {
const res = await getMyProfile();
const u = res.data.user;
setStudentDetails({
id: u._id,
name: u.name,
email: u.email,
rollNo: u.roll_no,
department: u.department,
dob: u.dob?.split("T")[0] || "",
enrolledDate: u.createdAt?.split("T")[0],
});
} catch (err) {
console.error(err);
}
};

useEffect(() => {
if (user) fetchProfile();
}, [user]);

useEffect(() => {
const fetchCertificates = async () => {
try {
const res = await getUserCertificates();
const certs = Array.isArray(res.data.files) ? res.data.files : [];
setCertificates(certs);
} catch {
setCertificates([]);
} finally {
setLoadingCerts(false);
}
};
fetchCertificates();
}, [user]);

const handleSaveProfile = async () => {
try {
await updateUser(studentDetails.rollNo, profileForm);
await fetchProfile();
toast({ title: "Profile Updated" });
setIsProfileOpen(false);
} catch {
toast({ title: "Update Failed", variant: "destructive" });
}
};

const handleChangePassword = async () => {
const errors = {};
if (!passwordForm.currentPassword) errors.currentPassword = "Required";
if (passwordForm.newPassword.length < 6) errors.newPassword = "Min 6 chars";
if (passwordForm.newPassword !== passwordForm.confirmPassword)
errors.confirmPassword = "Mismatch";

```
setPasswordErrors(errors);
if (Object.keys(errors).length) return;

try {
  await changePasswordApi(passwordForm);
  toast({ title: "Password Changed" });
  setIsPasswordOpen(false);
} catch {
  setPasswordErrors({ currentPassword: "Incorrect password" });
}
```

};

const handleCopyCid = async (cid, id) => {
await navigator.clipboard.writeText(cid);
setCopiedId(id);
setTimeout(() => setCopiedId(null), 2000);
};

const handleLogout = () => {
localStorage.removeItem("idenfy_user");
navigate("/login");
};

if (!user || user.role !== "user") return null;

const CertificateCard = ({ cert }) => ( <Card> <CardHeader> <CardTitle>{cert.certificateName}</CardTitle> <CardDescription>{cert.institution}</CardDescription> </CardHeader> <CardContent> <p>{cert.cid}</p> </CardContent> <CardFooter className="flex gap-2">
<Button onClick={() => handleCopyCid(cert.cid, cert._id)}>
{copiedId === cert._id ? "Copied" : "Copy"} </Button> </CardFooter> </Card>
);

return ( <div className="p-6"> <h1 className="text-xl font-bold mb-4">
Welcome {studentDetails?.name} </h1>

```
  {loadingCerts ? (
    <p>Loading...</p>
  ) : certificates.length ? (
    <div className="grid grid-cols-3 gap-4">
      {certificates.map((c) => (
        <CertificateCard key={c._id} cert={c} />
      ))}
    </div>
  ) : (
    <p>No certificates</p>
  )}

  <Button onClick={() => setIsProfileOpen(true)}>Edit Profile</Button>
  <Button onClick={() => setIsPasswordOpen(true)}>Change Password</Button>
  <Button onClick={handleLogout}>Logout</Button>
</div>
```

);
};

const StudentPage = () => ( <Routes>
<Route path="dashboard" element={<StudentDashboard />} />
<Route path="*" element={<StudentDashboard />} /> </Routes>
);

export default StudentPage;

