// ========== CERTIFICATES ==========
export const mockCertificates = [
  {
    id: "uuid-1",
    cid: "QmX8N...",
    studentName: "Alex Mercer",
    studentId: "stu-1",
    institution: "Federal Institute of Technology",
    course: "Blockchain Engineering Fundamentals",
    category: "Academic",
    issueDate: "2026-03-15",
    status: "Valid",
  },
  {
    id: "uuid-2",
    cid: "CID-12345",
    studentName: "Sarah Connor",
    studentId: "stu-2",
    institution: "National Defense Academy",
    course: "Cybersecurity & Cryptography",
    category: "Academic",
    issueDate: "2025-11-20",
    status: "Valid",
  },
  {
    id: "uuid-3",
    cid: "CID-98765",
    studentName: "John Doe",
    studentId: "stu-3",
    institution: "GovTech University",
    course: "Public Sector Data Science",
    category: "Activity",
    issueDate: "2026-01-10",
    status: "Valid",
  },
  {
    id: "uuid-4",
    cid: "CID-55512",
    studentName: "Sarah Connor",
    studentId: "stu-2",
    institution: "National Defense Academy",
    course: "Advanced Network Security",
    category: "Academic",
    issueDate: "2026-02-14",
    status: "Valid",
  },
  {
    id: "uuid-5",
    cid: "CID-77231",
    studentName: "Sarah Connor",
    studentId: "stu-2",
    institution: "National Defense Academy",
    course: "CTF Championship — 1st Place",
    category: "Activity",
    issueDate: "2025-09-05",
    status: "Valid",
  },
  {
    id: "uuid-6",
    cid: "CID-88410",
    studentName: "Sarah Connor",
    studentId: "stu-2",
    institution: "National Defense Academy",
    course: "Open-Source Security Hackathon",
    category: "Activity",
    issueDate: "2026-01-22",
    status: "Valid",
  },
  {
    id: "uuid-7",
    cid: "CID-33087",
    studentName: "Sarah Connor",
    studentId: "stu-2",
    institution: "National Defense Academy",
    course: "Ethical Hacking & Pen Testing",
    category: "Academic",
    issueDate: "2026-03-01",
    status: "Valid",
  },
];

// ========== STUDENTS ==========
export const mockStudents = [
  {
    id: "stu-1",
    name: "Alex Mercer",
    email: "alex.mercer@fitec.edu",
    rollNo: "FITEC-2024-001",
    department: "Computer Science",
    dob: "2001-05-14",
    enrolledDate: "2024-08-01",
  },
  {
    id: "stu-2",
    name: "Sarah Connor",
    email: "sarah.connor@nda.edu",
    rollNo: "NDA-2023-042",
    department: "Cybersecurity",
    dob: "2000-11-22",
    enrolledDate: "2023-07-15",
  },
  {
    id: "stu-3",
    name: "John Doe",
    email: "john.doe@govtech.edu",
    rollNo: "GTU-2025-118",
    department: "Data Science",
    dob: "2002-03-08",
    enrolledDate: "2025-01-10",
  },
  {
    id: "stu-4",
    name: "Emily Zhang",
    email: "emily.zhang@fitec.edu",
    rollNo: "FITEC-2024-007",
    department: "Artificial Intelligence",
    dob: "2001-09-30",
    enrolledDate: "2024-08-01",
  },
  {
    id: "stu-5",
    name: "Raj Patel",
    email: "raj.patel@govtech.edu",
    rollNo: "GTU-2024-055",
    department: "Public Policy",
    dob: "2000-07-12",
    enrolledDate: "2024-06-20",
  },
];

// ========== USERS ==========
export const mockUsers = [
  {
    id: "user-1",
    name: "Master Admin",
    email: "admin@idenfy.com",
    password: "admin123",
    role: "super_admin",
  },
  {
    id: "user-2",
    name: "Dr. Smith (Academics)",
    email: "academic@idenfy.com",
    password: "subadmin123",
    role: "sub_admin",
    subRole: "academic",
  },
  {
    id: "user-3",
    name: "Coach Davis (Activity)",
    email: "activity@idenfy.com",
    password: "subadmin123",
    role: "sub_admin",
    subRole: "activity",
  },
  {
    id: "user-4",
    name: "Sarah Connor",
    email: "student@idenfy.com",
    password: "student123",
    role: "student",
    studentId: "stu-2",
  },
];

// ========== HELPERS ==========
export const verifyCertificate = (cidQuery) => {
  return mockCertificates.find(
    (cert) => cert.cid === window.String(cidQuery).trim()
  );
};

export const authenticateUser = (email, password) => {
  return (
    mockUsers.find(
      (user) => user.email === email && user.password === password
    ) || null
  );
};
