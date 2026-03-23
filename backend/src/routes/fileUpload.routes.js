import { Router } from "express";
import {defaultControl, uploadImage, getImage} from '../controllers/fileUpload.controller.js'
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.route("/").get(defaultControl);
router.route("/upload").post(upload.single("image"),uploadImage);
router.route("/images").get(getImage);

export default router;

