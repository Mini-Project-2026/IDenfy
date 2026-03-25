import express from 'express';
import { issueCertificate, verifyCertificate } from '../controllers/fabricService.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Issue Certificate (authenticated users)
router.post('/issue-certificate', verifyToken, issueCertificate);

// Verify Certificate (public route - anyone can verify)
router.get('/verify/:id', verifyCertificate);

export default router;