import React, { useState, useRef, useCallback, useMemo } from "react";
import { mockStudents } from "../../mockData";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileBadge,
  Upload,
  FileText,
  X,
  Search,
  CheckCircle,
  Loader2,
  Sparkles,
  Lock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IssueCertificatePage = () => {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("idenfy_user"));
    } catch {
      return null;
    }
  }, []);

  const certCat = user?.certCategory || user?.subRole;
  const defaultCategory = certCat === "activity" ? "Activity" : "Academic";
  const isCategoryLocked = user?.role === "sub_admin" && certCat !== "both";

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [courseName, setCourseName] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintProgress, setMintProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const filteredStudents = mockStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Drag & drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleMint = async () => {
    if (!selectedStudentId || !uploadedFile || !courseName.trim()) return;

    setIsMinting(true);
    setMintProgress(0);

    // Simulate blockchain latency with progress
    const steps = [
      { progress: 15, delay: 400 },
      { progress: 35, delay: 500 },
      { progress: 55, delay: 600 },
      { progress: 75, delay: 500 },
      { progress: 90, delay: 400 },
      { progress: 100, delay: 600 },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, step.delay));
      setMintProgress(step.progress);
    }

    setIsMinting(false);
    setMintProgress(0);

    const student = mockStudents.find((s) => s.id === selectedStudentId);

    toast({
      title: "🎉 Certificate Minted Successfully!",
      description: `Certificate for ${student?.name} has been recorded on the blockchain. CID: QmNew${Date.now().toString(36)}`,
    });

    // Reset form
    setSelectedStudentId("");
    setCourseName("");
    setUploadedFile(null);
    if (!isCategoryLocked) {
      setCategory("Academic");
    }
  };

  const selectedStudent = mockStudents.find(
    (s) => s.id === selectedStudentId
  );

  const isFormValid =
    selectedStudentId && uploadedFile && courseName.trim();

  return (
    <div className="p-8 relative">
      {/* Minting Overlay */}
      {isMinting && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
              <svg
                className="absolute w-24 h-24 -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-indigo-600 dark:text-indigo-400"
                  strokeDasharray={`${mintProgress * 2.83} 283`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.4s ease" }}
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Minting to Blockchain
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {mintProgress < 30
                ? "Preparing certificate data..."
                : mintProgress < 60
                ? "Submitting transaction..."
                : mintProgress < 90
                ? "Waiting for confirmation..."
                : "Finalizing block..."}
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${mintProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">{mintProgress}%</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileBadge className="w-6 h-6 text-indigo-500" />
          Issue Certificate
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Mint a new certificate to the blockchain for a registered student.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Selection */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Select Student</CardTitle>
              <CardDescription>
                Choose a registered student to issue the certificate to.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select a student..." />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        className="w-full pl-7 pr-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-transparent outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  {filteredStudents.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-xs text-slate-400 font-mono">
                          {student.rollNo}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {filteredStudents.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-3">
                      No students found.
                    </p>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Certificate Details */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Certificate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courseName">Course / Certificate Name</Label>
                <Input
                  id="courseName"
                  placeholder="e.g., Advanced Machine Learning"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="h-11"
                />
              </div>

              {/* Category Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="font-medium text-sm text-slate-900 dark:text-white">
                    Category
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {category === "Academic"
                      ? "Academic degree or course certificate"
                      : "Extracurricular activity or competition"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-medium transition-colors ${
                      category === "Academic"
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400"
                    }`}
                  >
                    Academic
                  </span>
                  
                  {!isCategoryLocked ? (
                    <Switch
                      checked={category === "Activity"}
                      onCheckedChange={(checked) =>
                        setCategory(checked ? "Activity" : "Academic")
                      }
                    />
                  ) : (
                    <div className="px-1" title="Category locked by your role">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  )}

                  <span
                    className={`text-sm font-medium transition-colors ${
                      category === "Activity"
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-slate-400"
                    }`}
                  >
                    Activity
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Zone */}
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Certificate Document
              </CardTitle>
              <CardDescription>
                Upload the certificate PDF to be stored on IPFS.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!uploadedFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                    isDragOver
                      ? "border-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]"
                      : "border-slate-300 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <div className="inline-flex items-center justify-center p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                    <Upload
                      className={`w-6 h-6 transition-colors ${
                        isDragOver
                          ? "text-indigo-500"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    {isDragOver
                      ? "Drop your PDF here"
                      : "Drag & drop your certificate PDF"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    or click to browse • PDF only
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20">
                  <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {uploadedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB • PDF
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setUploadedFile(null)}
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 sticky top-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Student
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {selectedStudent?.name || (
                      <span className="text-slate-300 dark:text-slate-600 italic">
                        Not selected
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Course
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {courseName || (
                      <span className="text-slate-300 dark:text-slate-600 italic">
                        Not entered
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category === "Academic"
                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {category}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                    Document
                  </p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {uploadedFile?.name || (
                      <span className="text-slate-300 dark:text-slate-600 italic">
                        No file
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  onClick={handleMint}
                  disabled={!isFormValid || isMinting}
                  className="w-full h-11 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-medium gap-2 transition-all shadow-md shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mint to Blockchain
                </Button>
                <p className="text-xs text-slate-400 text-center mt-2">
                  This action will permanently record the certificate.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IssueCertificatePage;
