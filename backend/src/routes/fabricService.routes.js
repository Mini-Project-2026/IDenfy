import express from 'express';
import { storeCertificateOnBlockchain, verifyCertificateFromBlockchain } from '../controllers/fabricService.js';
import { Image } from '../models/file.models.js';
const app = express();
app.use(express.json());

// --- 1. Certificate Issue Route ---
app.post('/issue-certificate', async (req, res) => {
    try {
        const { studentId, fileData } = req.body;

        // STEP A: IPFS par upload karein (Aapka existing code)
        // const ipfsResponse = await ipfs.add(fileData);
        // const cid = ipfsResponse.path;
        const cid = "QmXoyp...fake_cid_for_testing"; // Example CID

        // STEP B: Blockchain par CID store karein
        await storeCertificateOnBlockchain(studentId, cid);

        // STEP C: DB mein record update karein (Optional)
        // db.save({ studentId, cid, status: 'verified' });

        res.status(200).json({ message: "Certificate Verified & Saved on Blockchain", cid });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. Verification Route ---
app.get('/verify/:id', async (req, res) => {
    const candidate = req.params.id;

    async function tryVerify(idToQuery) {
        try {
            return await verifyCertificateFromBlockchain(idToQuery);
        } catch (err) {
            if (err.message && err.message.includes('certificate not found')) {
                return null;
            }
            throw err;
        }
    }

    try {
        let certData = await tryVerify(candidate);

        // If this looks like CID and wasn't found, try translate CID -> studentId from DB
        if (!certData && candidate.startsWith('Qm')) {
            const image = await Image.findOne({ cid: candidate }).lean();
            if (image) {
                certData = await tryVerify(image.user.toString());
            }
        }

        // If this looks like ObjectId and wasn't found, try translate user -> first CID from DB, then query
        if (!certData && /^[0-9a-fA-F]{24}$/.test(candidate)) {
            const image = await Image.findOne({ user: candidate }).lean();
            if (image) {
                certData = await tryVerify(image.user.toString());
            }
        }

        if (!certData) {
            return res.status(404).json({ message: 'Certificate not found on Blockchain' });
        }

        return res.status(200).json({
            message: 'Certificate successfully verified',
            studentId: certData.studentId,
            ipfsCid: certData.ipfsCid,
            issuedAt: certData.timestamp,
            status: 'verified'
        });
    } catch (err) {
        console.error('verify error', err);
        return res.status(500).json({ message: 'Error verifying certificate', error: err.message });
    }
});

export default app;