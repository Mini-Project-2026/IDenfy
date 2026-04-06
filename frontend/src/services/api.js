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

export const verifyCertificate = (id) =>
  API.get(`/fabric/verify/${id}`);

export const getUserCertificates = () =>
  API.get("/fileUpload/get-files");

export const getAllCertificates = () =>
  API.get("/fileUpload/get-files");

export default API;