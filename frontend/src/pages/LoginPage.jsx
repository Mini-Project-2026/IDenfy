import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      const { data } = await loginUser({ email, password });
      
      const { user, token } = data;
      localStorage.setItem("idenfy_user", JSON.stringify(user));
      localStorage.setItem("idenfy_jwt", token);

      if (user.role === "admin" || user.role === "subadmin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (error) {
      setLoginError(
        error.response?.data?.message || "Invalid email or password. Please try again."
      );
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-800/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>

        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Sign in to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
              IDenfy
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Access the blockchain certificate platform
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Global login error */}
              {loginError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    className={`pl-10 h-11 ${
                      errors.email
                        ? "border-red-400 dark:border-red-600 focus-visible:ring-red-400"
                        : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    className={`pl-10 h-11 ${
                      errors.password
                        ? "border-red-400 dark:border-red-600 focus-visible:ring-red-400"
                        : ""
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-200 group"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center mb-3 uppercase tracking-wider font-medium">
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("admin@idenfy.com");
                    setPassword("admin123");
                    setErrors({});
                    setLoginError("");
                  }}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-left flex flex-col"
                >
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5">
                    Super Admin
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    admin@idenfy.com
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("academic@idenfy.com");
                    setPassword("subadmin123");
                    setErrors({});
                    setLoginError("");
                  }}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-left flex flex-col"
                >
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5">
                    Sub-Admin (Academic)
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    academic@idenfy.com
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("activity@idenfy.com");
                    setPassword("subadmin123");
                    setErrors({});
                    setLoginError("");
                  }}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-left flex flex-col"
                >
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5">
                    Sub-Admin (Activity)
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    activity@idenfy.com
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("student@idenfy.com");
                    setPassword("student123");
                    setErrors({});
                    setLoginError("");
                  }}
                  className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all text-left flex flex-col"
                >
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5">
                    Student
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    student@idenfy.com
                  </p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
