import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("idenfy_user");
      const token = localStorage.getItem("idenfy_jwt");

      if (!userStr || !token) {
        toast({
          title: "Authentication Required",
          description: "Please login first to access this page.",
          variant: "destructive",
        });
        navigate("/login", { replace: true, state: { from: location } });
        return;
      }

      const user = JSON.parse(userStr);

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to access this page.",
          variant: "destructive",
        });
        
        // Redirect based on their actual role
        if (user.role === "admin" || user.role === "subadmin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/student/dashboard", { replace: true });
        }
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      localStorage.removeItem("idenfy_user");
      localStorage.removeItem("idenfy_jwt");
      navigate("/login", { replace: true });
    }
  }, [navigate, allowedRoles, toast, location]);

  if (isAuthorized === null) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">Loading...</div>;
  }

  return children;
};

export default ProtectedRoute;
