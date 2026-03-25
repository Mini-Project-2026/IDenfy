import { Router } from "express";
import { defaultControl, uploadImage, getImage } from '../controllers/fileUpload.controller.js';
import upload from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const fileRouter = Router();

// Health check route to verify API status
fileRouter.route("/health").get(defaultControl);

// Route to upload an image (requires authentication)
fileRouter.route("/upload-image").post(verifyToken, upload.single("image"), uploadImage);

// Route to retrieve images (requires authentication; admins can see all, users see their own)
fileRouter.route("/get-images").get(verifyToken, getImage);

export default fileRouter;

