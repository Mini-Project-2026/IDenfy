import ipfs from '../utils/ipfs.js';
import { Image } from '../models/file.models.js';
import { storeCertificateOnBlockchain } from './fabricService.js';


export const defaultControl =  (req, res)=>{
    res.json({
        success:true,
        message: "File upload API is running."
    })
};


export const uploadImage =  async (req, res) => {
  try {
    const file = req.file;
    const userId = req.user?.userId; // Get authenticated user's ID from JWT

    if(!file){
        return res.status(400).json({
            success:false,
            message:"Image is required."
        });
    }

    if(!userId){
        return res.status(401).json({
            success:false,
            message:"User not authenticated. Please login first."
        });
    }

    // Upload to IPFS
    const result = await ipfs.add(file.buffer);
    await ipfs.pin.add(result.cid);

    const cid = result.cid.toString();
    const url = `http://127.0.0.1:8080/ipfs/${cid}`;

    // Save to MongoDB with user reference
    const saved = await Image.create({
        cid,
        url,
        user: userId
    });

    // Automatically save CID on blockchain
    try {
        await storeCertificateOnBlockchain(userId, cid);
    } catch (blockchainError) {
        console.error('Failed to save on blockchain:', blockchainError);
        // Still proceed, as file is uploaded to IPFS and DB
    }

    res.status(201).json({
        success: true,
        message: "Image uploaded successfully and CID saved on blockchain",
        cid: cid,
        url: url,
        imageId: saved._id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
        success: false,
        message: 'Image upload failed',
        error: err.message
    });
  }
};

export const getImage = async (req, res) => {
  try {
    const userId = req.user?.userId; // Get authenticated user's ID from JWT
    const { id } = req.query; // Optional: get specific image by ID

    if(!userId){
        return res.status(401).json({
            success:false,
            message:"User not authenticated. Please login first."
        });
    }

    // Get images for authenticated user
    let query = { user: userId };
    
    // If specific ID provided, fetch that specific image
    if(id){
        query._id = id;
    }

    const images = await Image.find(query)
        .populate('user', '-password') // Populate user info without password
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: images.length,
        images: images
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
        success: false,
        message: 'Failed to retrieve images',
        error: err.message
    });
  }
};


