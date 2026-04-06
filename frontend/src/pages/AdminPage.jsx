import React, { useMemo } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import {
  Users,
  FileBadge,
  LayoutDashboard,
  LogOut,
  Shield,
  UserCog,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { mockStudents, mockCertificates } from "../mockData";
import ManageStudentsPage from "./admin/ManageStudentsPage";
import IssueCertificatePage from "./admin/IssueCertificatePage";
import ManageSubAdminsPage from "./admin/ManageSubAdminsPage";

const baseNavItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Manage Students",
    path: "/admin/students",
    icon: Users,
  },
  {
    label: "Issue Certificate",
    path: "/admin/issue",
    icon: FileBadge,
  },
];

const AdminPage = () => {
  const navigate = useNavigate();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("idenfy_user"));
    } catch {
      return null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("idenfy_user");
    navigate("/login");
  };

  const navItems = useMemo(() => {
    if (user?.role === "super_admin") {
      return [
        ...baseNavItems,
        {
          label: "Manage Dept Admins",
          path: "/admin/sub-admins",
          icon: UserCog,
        },
      ];
    }
    return baseNavItems;
  }, [user]);

  const adminTitle = user?.role === "super_admin" 
    ? "Super Admin" 
    : `${(user?.subRole || "Dept").charAt(0).toUpperCase() + (user?.subRole || "dept").slice(1)} Admin`;

  // --- Calculate Analytics ---
  const totalStudents = mockStudents.length;
  const totalCerts = mockCertificates.length;
  
  // Data for Line Chart (Certs by Month)
  const certsByMonth = mockCertificates.reduce((acc, cert) => {
    const month = cert.issueDate.substring(0, 7); // yyyy-mm format
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});
  const lineData = Object.keys(certsByMonth).sort().map(month => ({
    name: month,
    certificates: certsByMonth[month]
  }));

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Logo */}
        <div className="h-16 px-6 flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            IDenfy{" "}
            <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
              Admin
            </span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="mb-4 px-2">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{adminTitle}</p>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route
            path="dashboard"
            element={
              <div className="p-8 pb-16">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  Welcome back, {user?.name || "Admin"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                  Manage students and issue blockchain certificates from your
                  dashboard.
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg">
                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Total Students
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {totalStudents}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                        <FileBadge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Certificates Issued
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {totalCerts}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                        <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Blockchain Verified
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {totalCerts}
                    </p>
                  </div>
                </div>

                {/* Charts */}
                <div className="mt-6">
                  {/* Line Chart */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Certificates Issued Over Time</h2>
                    <div className="w-full h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            stroke="#64748b" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                          />
                          <YAxis 
                            stroke="#64748b" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            allowDecimals={false}
                          />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="certificates" 
                            stroke="#4f46e5" 
                            strokeWidth={3} 
                            dot={{ r: 4, strokeWidth: 2 }} 
                            activeDot={{ r: 6, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

              </div>
            }
          />
          <Route path="students" element={<ManageStudentsPage />} />
          <Route path="issue" element={<IssueCertificatePage />} />
          <Route path="sub-admins" element={<ManageSubAdminsPage />} />
        </Routes>
      </main>

      <Toaster />
    </div>
  );
};

export default AdminPage;
