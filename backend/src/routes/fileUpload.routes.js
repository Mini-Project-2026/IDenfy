import { Router } from "express";
import { getFiles, uploadImageForUser, getCertificateCountsByDate } from '../controllers/fileUpload.controller.js';
import upload from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const fileRouter = Router();

// Route to retrieve files (requires authentication; admins can see all, users see their own)
fileRouter.route("/get-files").get(verifyToken, getFiles);

// Route to retrieve certificate counts grouped by created date
fileRouter.route("/certificate-counts").get(verifyToken, getCertificateCountsByDate);

// Route for admin to upload a file for a specific user by roll_no
fileRouter.route("/upload-for-user/:roll_no").post(verifyToken, upload.single("file"), uploadImageForUser);

export default fileRouter;

