import { Gateway, Wallets } from 'fabric-network';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function getContractInstance() {
    // Path settings
    const ccpPath = path.resolve(__dirname, '..', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const walletPath = path.join(__dirname, '..', '..', 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check karein ki user hai ya nahi
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

// 1. Blockchain par CID Store karne ka function
async function storeCertificateOnBlockchain(studentId, ipfsCid) {
    try {
        const { gateway, contract } = await getContractInstance();
        const timestamp = new Date().toISOString();

        console.log(`Submitting transaction for Student: ${studentId}`);
        // 'IssueCertificate' wahi naam hai jo Go chaincode mein rakha tha
        await contract.submitTransaction('IssueCertificate', studentId, ipfsCid, timestamp);
        
        console.log('Transaction successfully committed to the ledger.');
        console.log(`CID ${ipfsCid} saved on ledger for studentId ${studentId} at ${timestamp}`);
        await gateway.disconnect();
        return { success: true };
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        throw error;
    }
}

// 2. Blockchain se CID Verify karne ka function
async function verifyCertificateFromBlockchain(studentId) {
    try {
        const { gateway, contract } = await getContractInstance();

        console.log(`Querying blockchain for Student: ${studentId}`);
        // 'VerifyCertificate' function call kar rahe hain
        const result = await contract.evaluateTransaction('VerifyCertificate', studentId);
        
        await gateway.disconnect();
        return JSON.parse(result.toString());
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        throw error;
    }
}

export { storeCertificateOnBlockchain, verifyCertificateFromBlockchain };