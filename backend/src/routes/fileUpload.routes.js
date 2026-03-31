import { Router } from "express";
import { defaultControl, getImage, uploadImageForUser } from '../controllers/fileUpload.controller.js';
import upload from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const fileRouter = Router();

// Health check route to verify API status
fileRouter.route("/health").get(defaultControl);

// Route to upload an image (requires authentication)
// fileRouter.route("/upload-image").post(verifyToken, upload.single("image"), uploadImage);

// Route to retrieve images (requires authentication; admins can see all, users see their own)
fileRouter.route("/get-images").get(verifyToken, getImage);

// Route for admin to upload image for a specific user by roll_no
fileRouter.route("/upload-for-user/:roll_no").post(verifyToken, upload.single("image"), uploadImageForUser);

export default fileRouter;

