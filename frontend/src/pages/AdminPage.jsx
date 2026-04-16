import React, { useMemo, useEffect } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { getStudentCount, getCertificateCount, getCertificateCountsByDate, getAllCertificates } from "../services/api";
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
    label: "Students",
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

  // Redirect non-admin users to student dashboard
  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "subadmin") {
      navigate("/student/dashboard");
    }
  }, [user, navigate]);

  // If user is not admin/subadmin, don't render anything (will redirect)
  if (!user || (user.role !== "admin" && user.role !== "subadmin")) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("idenfy_user");
    navigate("/login");
  };

  const navItems = useMemo(() => {
    if (user?.role === "admin") {
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

  const adminTitle = user?.role === "admin" 
    ? "Super Admin" 
    : `${(user?.subRole || "Dept").charAt(0).toUpperCase() + (user?.subRole || "dept").slice(1)} Admin`;


  // --- Calculate Analytics (Dynamic) ---
  const [totalStudents, setTotalStudents] = React.useState(0);
  const [totalCerts, setTotalCerts] = React.useState(0);
  const [lineData, setLineData] = React.useState([]);
  const [certificates, setCertificates] = React.useState([]);
  const [certsLoading, setCertsLoading] = React.useState(true);

  // Refetch dashboard stats
  const fetchDashboardStats = React.useCallback(async () => {
    try {
      const [studentsRes, certsRes, lineRes] = await Promise.all([
        getStudentCount(),
        getCertificateCount(),
        getCertificateCountsByDate()
      ]);
      setTotalStudents(studentsRes.data.count);
      setTotalCerts(certsRes.data.count);
      if (user?.role !== 'subadmin' && lineRes.data && lineRes.data.counts) {
        const sorted = [...lineRes.data.counts].sort((a, b) => a.date.localeCompare(b.date));
        const chartData = sorted.map(item => ({
          name: item.date,
          certificates: item.count
        }));
        setLineData(chartData);
      }
    } catch (err) {
      // Optionally handle error
    }
  }, [user]);


  // Fetch all certificates for the table
  const fetchCertificates = React.useCallback(async () => {
    setCertsLoading(true);
    try {
      const res = await getAllCertificates();
      let certs = Array.isArray(res.data.files) ? res.data.files : [];
      // If subadmin, filter to only certificates issued by this subadmin
      if (user?.role === 'subadmin' && user?._id) {
        certs = certs.filter(cert => cert.issuer?._id === user._id);
        
        const counts = {};
        certs.forEach(cert => {
          if (cert.createdAt) {
            const date = cert.createdAt.substring(0, 10);
            counts[date] = (counts[date] || 0) + 1;
          }
        });
        const chartData = Object.keys(counts).sort().map(date => ({
          name: date,
          certificates: counts[date]
        }));
        setLineData(chartData);
      }
      setCertificates(certs);
    } catch (err) {
      setCertificates([]);
    } finally {
      setCertsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardStats();
    fetchCertificates();
  }, [fetchDashboardStats, fetchCertificates]);

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
                  <div
                    className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-md transition"
                    onClick={() => {
                      const certSection = document.getElementById('certificates-table-section');
                      if (certSection) certSection.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                        <FileBadge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Certificates Issued
                      </p>
                    </div>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">
                      {user?.role === 'subadmin' ? certificates.length : totalCerts}
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

                {/* All Certificates Table */}
                <div className="mt-10" id="certificates-table-section">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <FileBadge className="w-5 h-5 text-indigo-500" />
                    All Certificates
                  </h2>
                  {/* Render a separate table for each issuer */}
                  {certsLoading ? (
                    <div className="text-center py-8 text-slate-400">Loading certificates...</div>
                  ) : certificates.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">No certificates found.</div>
                  ) : user.role === 'admin' ? (
                    Object.entries(
                      certificates.reduce((acc, cert) => {
                        const issuerName = cert.issuer?.name || 'Unknown Issuer';
                        let issuerRole = '';
                        if (cert.issuer?.role) {
                          if (cert.issuer.role === 'admin') issuerRole = 'Admin';
                          else if (cert.issuer.role === 'subadmin') issuerRole = 'Subadmin';
                          else issuerRole = cert.issuer.role.charAt(0).toUpperCase() + cert.issuer.role.slice(1);
                        }
                        const issuerKey = issuerRole ? `${issuerName} (${issuerRole})` : issuerName;
                        if (!acc[issuerKey]) acc[issuerKey] = [];
                        acc[issuerKey].push(cert);
                        return acc;
                      }, {})
                    ).map(([issuer, certs]) => (
                      <div key={issuer} className="mb-8">
                        <h3 className="text-base font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Issuer: {issuer}</h3>
                        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">Certificate Name</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">Student</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {certs.map(cert => (
                                <tr key={cert._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="px-4 py-2 text-slate-900 dark:text-white font-medium">{cert.certificateName || cert.course || 'Certificate'}</td>
                                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{cert.user?.name || 'N/A'}</td>
                                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{cert.createdAt ? cert.createdAt.substring(0, 10) : ''}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  ) : (
                    Object.entries(
                      certificates.reduce((acc, cert) => {
                        const issuerName = cert.issuer?.name || 'Unknown Issuer';
                        if (!acc[issuerName]) acc[issuerName] = [];
                        acc[issuerName].push(cert);
                        return acc;
                      }, {})
                    ).map(([issuer, certs]) => (
                      <div key={issuer} className="mb-8">
                        <h3 className="text-base font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Issuer: {issuer}</h3>
                        <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">Certificate Name</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">Student</th>
                                <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600 dark:text-slate-400">Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {certs.map(cert => (
                                <tr key={cert._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                  <td className="px-4 py-2 text-slate-900 dark:text-white font-medium">{cert.certificateName || cert.course || 'Certificate'}</td>
                                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{cert.user?.name || 'N/A'}</td>
                                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{cert.createdAt ? cert.createdAt.substring(0, 10) : ''}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            }
          />
          <Route path="students" element={<ManageStudentsPage onDataChanged={() => { fetchDashboardStats(); fetchCertificates(); }} />} />
          <Route path="issue" element={<IssueCertificatePage onCertificateIssued={() => { fetchDashboardStats(); fetchCertificates(); }} />} />
          <Route path="sub-admins" element={<ManageSubAdminsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPage;