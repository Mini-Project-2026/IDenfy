import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // change if needed
});

export const loginUser = (data) => API.post("/auth/login", data);

export const verifyCertificate = (id) =>
  API.get(`/verify/${id}`);

export const getUserCertificates = () =>
  API.get("/certificate/user");

export const getAllCertificates = () =>
  API.get("/certificate/all");

export default API;