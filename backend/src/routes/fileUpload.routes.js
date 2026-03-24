import { Router } from "express";
import {defaultControl, uploadImage, getImage} from '../controllers/fileUpload.controller.js'
import upload from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const fileRouter = Router();

fileRouter.route("/").get(defaultControl);
fileRouter.route("/upload").post(verifyToken, upload.single("image"), uploadImage);
fileRouter.route("/images").get(verifyToken, getImage);

export default fileRouter;

