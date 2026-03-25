import path from 'path';
import { dirname } from 'path';
import { Image } from '../models/file.models.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============= BLOCKCHAIN HELPER FUNCTIONS =============

// COMMENTED: Real Hyperledger Fabric implementation
// Uncomment and configure when Fabric network is ready
/*
import { Gateway, Wallets } from 'fabric-network';
import fs from 'fs';

async function getContractInstance() {
    const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(__dirname, '..', '..', 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const identity = await wallet.get('appUser');
    if (!identity) {
        throw new Error('Run registerUser.js first! Identity not found.');
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('certcontract');
    
    return { gateway, contract };
}

async function storeCertificateOnBlockchain(studentId, ipfsCid) {
    const { gateway, contract } = await getContractInstance();
    const timestamp = new Date().toISOString();

    console.log(`Submitting transaction for Student: ${studentId}`);
    await contract.submitTransaction('IssueCertificate', studentId, ipfsCid, timestamp);
    
    console.log('Transaction successfully committed to the ledger.');
    await gateway.disconnect();
    return { success: true };
}

async function verifyCertificateFromBlockchain(studentId) {
    const { gateway, contract } = await getContractInstance();

    console.log(`Querying blockchain for Student: ${studentId}`);
    const result = await contract.evaluateTransaction('VerifyCertificate', studentId);
    
    await gateway.disconnect();
    return JSON.parse(result.toString());
}
*/

// PLACEHOLDER IMPLEMENTATION (for development without Fabric)
async function storeCertificateOnBlockchain(studentId, ipfsCid) {
    console.log(`[PLACEHOLDER] Storing certificate on blockchain for ${studentId}: ${ipfsCid}`);
    return { success: true };
}

async function verifyCertificateFromBlockchain(studentId) {
    console.log(`[PLACEHOLDER] Verifying certificate from blockchain for ${studentId}`);
    return {
        studentId,
        ipfsCid: 'QmXoyp...example',
        timestamp: new Date().toISOString(),
        status: 'verified'
    };
}

// ============= CONTROLLERS =============

// Controller: Issue Certificate
export const issueCertificate = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const { fileData } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized. Please login first.' });
        }

        if (!fileData) {
            return res.status(400).json({ error: 'File data is required' });
        }

        // Get IPFS CID from database (file already uploaded)
        const image = await Image.findOne({ user: userId }).sort({ createdAt: -1 });
        if (!image) {
            return res.status(404).json({ error: 'No uploaded file found for user' });
        }

        const cid = image.cid;

        // Store on blockchain
        await storeCertificateOnBlockchain(userId, cid);

        res.status(200).json({
            message: 'Certificate issued and saved on blockchain',
            cid,
            studentId: userId,
            status: 'verified'
        });
    } catch (error) {
        console.error('Issue certificate error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Controller: Verify Certificate
export const verifyCertificate = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Certificate ID is required' });
        }

        // Try to verify with provided ID
        let certData = await verifyCertificateFromBlockchain(id);

        // If not found and looks like CID, try to find studentId from database
        if (!certData && id.startsWith('Qm')) {
            const image = await Image.findOne({ cid: id }).lean();
            if (image) {
                certData = await verifyCertificateFromBlockchain(image.user.toString());
            }
        }

        // If not found and looks like MongoDB ObjectId, try direct query
        if (!certData && /^[0-9a-fA-F]{24}$/.test(id)) {
            const image = await Image.findOne({ user: id }).lean();
            if (image) {
                certData = await verifyCertificateFromBlockchain(id);
            }
        }

        if (!certData) {
            return res.status(404).json({ message: 'Certificate not found on blockchain' });
        }

        res.status(200).json({
            message: 'Certificate successfully verified',
            studentId: certData.studentId,
            ipfsCid: certData.ipfsCid,
            issuedAt: certData.timestamp,
            status: certData.status
        });
    } catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({ error: error.message });
    }
};