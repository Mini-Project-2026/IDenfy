import React, { useState } from "react";
import { Link } from "react-router-dom";
import { verifyCertificate } from "../mockData";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Search,
  Award,
  LogIn,
  Shield,
  Mail,
  MapPin,
  Phone,
  Globe,
  ExternalLink,
} from "lucide-react";

const LandingPage = () => {
  const [cidQuery, setCidQuery] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!cidQuery.trim()) return;

    setHasSearched(true);
    const result = verifyCertificate(cidQuery);
    setVerificationResult(result || null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      {/* ===== Navbar ===== */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
              IDenfy
            </span>
          </Link>
          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
            >
              <LogIn className="w-4 h-4" />
              Login
            </Button>
          </Link>
        </div>
      </header>

      {/* ===== Main Content ===== */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-16 px-4">
        {/* Hero Section */}
        <div className="max-w-3xl text-center space-y-6 mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-4">
            <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Verify Blockchain <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
              Credentials instantly.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            IDenfy provides an immutable, transparent, and secure
            way to issue and verify government and academic certificates.
          </p>
        </div>

        {/* Quick Verify Section */}
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-500" />
            Quick Verify
          </h2>

          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 mb-8">
            <Input
              type="text"
              placeholder="Enter Blockchain CID (e.g., CID-12345)"
              value={cidQuery}
              onChange={(e) => setCidQuery(e.target.value)}
              className="flex-1 h-12"
            />
            <Button type="submit" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white">
              Verify
            </Button>
          </form>

          {/* Results Area */}
          {hasSearched && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {verificationResult ? (
                <Card className="border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 relative overflow-hidden shadow-none">
                  <div className="absolute top-0 right-0 p-4">
                    <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1.5 py-1 px-3">
                      <CheckCircle className="w-4 h-4" />
                      Blockchain Verified
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardDescription className="text-sm font-medium">OFFICIAL RECORD</CardDescription>
                    <CardTitle className="text-2xl">{verificationResult.studentName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Institution</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {verificationResult.institution}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Course / Degree</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {verificationResult.course}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Issue Date</p>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {new Date(verificationResult.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">CID</p>
                        <p className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 inline-block mt-1">
                          {verificationResult.cid}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-center shadow-none p-8">
                  <div className="inline-flex items-center justify-center p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-3">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-medium text-red-900 dark:text-red-300 mb-1">
                    No Record Found
                  </h3>
                  <p className="text-red-700/80 dark:text-red-400/80 text-sm max-w-md mx-auto">
                    The provided CID does not match any official certificates in our blockchain registry. Please check the ID and try again.
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="bg-slate-900 dark:bg-slate-950 border-t border-slate-800 text-slate-400">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* About */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-1.5 bg-indigo-900/40 rounded-lg">
                  <Shield className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="font-bold text-lg text-white tracking-tight">IDenfy</span>
              </div>
              <p className="text-sm leading-relaxed">
                IDenfy is a blockchain-powered certificate verification platform
                that ensures the authenticity and integrity of academic and
                government-issued credentials. Tamper-proof, transparent, and
                instantly verifiable.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5" /> Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5" /> Login Portal
                  </Link>
                </li>
                <li>
                  <a href="#verify" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Verify Certificate
                  </a>
                </li>
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> GitHub Repository
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2.5 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  support@idenfy.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
                  +91 98765 43210
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  National Defense Academy, Pune, India
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} IDenfy. All rights reserved.</p>
            <p>
              Built with <span className="text-indigo-400">Blockchain</span> &middot; Powered by <span className="text-indigo-400">Hyperledger</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

