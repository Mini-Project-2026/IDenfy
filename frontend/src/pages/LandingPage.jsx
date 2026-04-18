import React, { useState } from "react";
import { Link } from "react-router-dom";
import { verifyCertificate, downloadCertificateApi } from "../services/api";
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
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
  Loader2,
  Download,
} from "lucide-react";

const LandingPage = () => {
  const [cidQuery, setCidQuery] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!cidQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setVerificationResult(null);

    try {
      const { data } = await verifyCertificate(cidQuery.trim());
      setVerificationResult(data);
    } catch (err) {
      // 404 or any error means not found
      setVerificationResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans">
      <Navbar />

      {/* ===== Main Content ===== */}
      <main className="flex-1 flex flex-col items-center pt-20 pb-16 w-full" id="home">
        {/* Verify Section */}
        <section id="verify" className="w-full flex justify-center px-4 mb-24">
          <div className="w-full max-w-2xl flex flex-col items-center">
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

            {/* Quick Verify box */}
            <div className="w-full bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Search className="w-6 h-6 text-indigo-500" />
                Quick Verify
              </h2>

              <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 mb-8">
                <Input
                  type="text"
                  placeholder="Enter Certificate CID or Roll Number"
                  value={cidQuery}
                  onChange={(e) => setCidQuery(e.target.value)}
                  className="flex-1 h-12"
                />
                <Button
                  type="submit"
                  className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Verify"
                  )}
                </Button>
              </form>

              {/* Results Area */}
              {hasSearched && !isLoading && (
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
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Department</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {verificationResult.department}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Certificate</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {verificationResult.certificateName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Roll No</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {verificationResult.rollNo}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Issue Date</p>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {new Date(verificationResult.issuedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="sm:col-span-2 pt-4 flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex-1">
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">CID</p>
                              <p className="font-mono text-xs text-slate-600 dark:text-slate-300 break-all bg-white dark:bg-slate-900 px-2 py-1.5 rounded border border-slate-200 dark:border-slate-800 inline-block">
                                {verificationResult.cid}
                              </p>
                            </div>
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
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="w-full bg-white dark:bg-slate-900 border-t border-b border-slate-200 dark:border-slate-800 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">About IDenfy</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                IDenfy was created to solve the growing problem of credential fraud. We use decentralized ledger technology (Hyperledger Fabric) securely integrated with InterPlanetary File System (IPFS) to provide a single source of truth for educational and professional certificates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Shield className="w-10 h-10 text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Immutable Records</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Once a certificate is issued on IDenfy, it is permanently etched into the blockchain, ensuring it cannot be forged, tampered with, or secretly modified.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Globe className="w-10 h-10 text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Decentralized Storage</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  We use IPFS to store the actual certificate files, generating a unique Content Identifier (CID). This prevents duplication and single points of failure.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <CheckCircle className="w-10 h-10 text-indigo-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Instant Verification</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Employers and institutions can instantly verify the authenticity of a certificate worldwide without needing to contact the issuing university.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;

