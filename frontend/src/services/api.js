// Update subadmin by _id
export const updateSubadmin = (id, data) =>
  API.put(`/users/update-subadmin/${id}`, data);

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // change if needed
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("idenfy_jwt");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const loginUser = (data) => API.post("/users/login", data);

export const createUser = (data) => API.post("/users/create", data);

export const getAllUsers = () => API.get("/users/all");

export const updateUser = (rollNo, data) =>
  API.put(`/users/update/${rollNo}`, data);

// deleteUser removed as user deletion is disabled

export const uploadForUser = (rollNo, file, certificateName) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("certificateName", certificateName);
  return API.post(`/fileUpload/upload-for-user/${rollNo}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const verifyCertificate = (id) =>
  API.get(`/fabric/verify/${id}`);

export const getUserCertificates = () =>
  API.get("/fileUpload/get-files");

export const getAllCertificates = () =>
  API.get("/fileUpload/get-files");

// ✅ Keep both sets of functions
export const getMyProfile = () =>
  API.get("/users/me");

export const changePassword = (data) =>
  API.put("/users/change-password", data);

export const getStudentCount = () =>
  API.get("/users/student-count");

export const getCertificateCount = () =>
  API.get("/fileUpload/certificate-count");

export const getCertificateCountsByDate = () =>
  API.get("/fileUpload/certificate-counts");

export const getCertificatesByStudent = (rollNo) =>
  API.get(`/fileUpload/get-files?roll_no=${rollNo}`);

export const deleteCertificate = (id) =>
  API.delete(`/fileUpload/delete-certificate/${id}`);

export default API;