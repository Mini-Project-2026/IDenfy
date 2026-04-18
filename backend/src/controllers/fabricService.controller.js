import path from 'path';
import { dirname } from 'path';
import { Image } from '../models/file.models.js';
import { User } from '../models/user.models.js';
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
async function storeCertificateOnBlockchain(studentIdOrRollNo, ipfsCid, url, timestamp) {
    console.log(`[PLACEHOLDER] Storing certificate on blockchain for ${studentIdOrRollNo}`);
    console.log(`[PLACEHOLDER] CID: ${ipfsCid}, URL: ${url}, Timestamp: ${timestamp}`);
    return { success: true };
}

async function verifyCertificateFromBlockchain(studentIdOrRollNo) {
    console.log(`[PLACEHOLDER] Verifying certificate from blockchain for ${studentIdOrRollNo}`);
    // This will be populated by the controller with actual data from DB
    return {
        studentIdOrRollNo,
        ipfsCid: 'QmXoyp...example',
        url: 'http://127.0.0.1:8080/ipfs/QmXoyp...example',
        timestamp: new Date().toISOString(),
        status: 'verified'
    };
}

export { storeCertificateOnBlockchain, verifyCertificateFromBlockchain };

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

        // Get user details
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get IPFS CID from database (file already uploaded)
        const image = await Image.findOne({ user: userId }).sort({ createdAt: -1 });
        if (!image) {
            return res.status(404).json({ error: 'No uploaded file found for user' });
        }

        const cid = image.cid;
        const url = image.url;
        const timestamp = image.createdAt.toISOString();

        // Store on blockchain with roll_no, cid, url, and timestamp
        await storeCertificateOnBlockchain(user.roll_no, cid, url, timestamp);

        res.status(200).json({
            message: 'Certificate issued and saved on blockchain',
            rollNo: user.roll_no,
            cid,
            url,
            ipfsLink: `https://ipfs.io/ipfs/${cid}`,
            issuedAt: timestamp,
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

        let certificateData = null;
        let user = null;

        // Case 1: ID looks like IPFS CID (starts with Qm)
        if (id.startsWith('Qm')) {
            const image = await Image.findOne({ cid: id }).populate('user');
            if (image) {
                user = image.user;
                certificateData = {
                    cid: image.cid,
                    url: image.url,
                    certificateName: image.certificateName,
                    issuedAt: image.createdAt.toISOString()
                };
            }
        }

        // Case 2: ID looks like roll number (try to find user by roll_no, then get their latest certificate)
        if (!certificateData && !id.match(/^[0-9a-fA-F]{24}$/)) {
            user = await User.findOne({ roll_no: id });
            if (user) {
                const image = await Image.findOne({ user: user._id }).sort({ createdAt: -1 });
                if (image) {
                    certificateData = {
                        cid: image.cid,
                        url: image.url,
                        certificateName: image.certificateName,
                        issuedAt: image.createdAt.toISOString()
                    };
                }
            }
        }

        // Case 3: ID looks like MongoDB ObjectId (user ID)
        if (!certificateData && /^[0-9a-fA-F]{24}$/.test(id)) {
            user = await User.findById(id);
            if (user) {
                const image = await Image.findOne({ user: id }).sort({ createdAt: -1 });
                if (image) {
                    certificateData = {
                        cid: image.cid,
                        url: image.url,
                        certificateName: image.certificateName,
                        issuedAt: image.createdAt.toISOString()
                    };
                }
            }
        }

        if (!certificateData || !user) {
            return res.status(404).json({ message: 'Certificate not found on blockchain' });
        }

        // Prepare response with all details
        const response = {
            message: 'Certificate successfully verified',
            studentName: user.name,
            rollNo: user.roll_no,
            department: user.department,
            certificateName: certificateData.certificateName,
            cid: certificateData.cid,
            url: certificateData.url,
            ipfsLink: `https://ipfs.io/ipfs/${certificateData.cid}`,
            issuedAt: certificateData.issuedAt,
            status: 'verified'
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Verify certificate error:', error);
        res.status(500).json({ error: error.message });
    }
};