import ipfs from '../utils/ipfs.js';
import { Image } from '../models/file.models.js';
import { User } from '../models/user.models.js';
import { storeCertificateOnBlockchain } from './fabricService.controller.js';


export const defaultControl =  (req, res)=>{
    res.json({
        success:true,
        message: "File upload API is running."
    })
};


// export const uploadImage =  async (req, res) => {
//   try {
//     const file = req.file;
//     const userId = req.user?.userId; // Get authenticated user's ID from JWT

//     if(!file){
//         return res.status(400).json({
//             success:false,
//             message:"Image is required."
//         });
//     }

//     if(!userId){
//         return res.status(401).json({
//             success:false,
//             message:"User not authenticated. Please login first."
//         });
//     }

//     // Get user details to get roll_no
//     const user = await User.findById(userId);
//     if (!user) {
//         return res.status(404).json({
//             success: false,
//             message: "User not found."
//         });
//     }

//     // Upload to IPFS
//     const result = await ipfs.add(file.buffer);
//     await ipfs.pin.add(result.cid);

//     const cid = result.cid.toString();
//     const url = `http://127.0.0.1:8080/ipfs/${cid}`;

//     // Save to MongoDB with user reference
//     const saved = await Image.create({
//         cid,
//         url,
//         user: userId
//     });

//     // Automatically save certificate on blockchain with user's roll_no, cid, url, and timestamp
//     try {
//         const timestamp = saved.createdAt.toISOString();
//         await storeCertificateOnBlockchain(user.roll_no, cid, url, timestamp);
//     } catch (blockchainError) {
//         console.error('Failed to save on blockchain:', blockchainError);
//         // Still proceed, as file is uploaded to IPFS and DB
//     }

//     res.status(201).json({
//         success: true,
//         message: "Image uploaded successfully and certificate saved on blockchain",
//         rollNo: user.roll_no,
//         cid: cid,
//         url: url,
//         ipfsLink: `https://ipfs.io/ipfs/${cid}`,
//         issuedAt: saved.createdAt.toISOString(),
//         imageId: saved._id
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//         success: false,
//         message: 'Image upload failed',
//         error: err.message
//     });
//   }
// };

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

    // Get images for authenticated user. Admins can fetch all or specific image by id.
    let query = {};

    if (req.user.role === 'user') {
        query.user = userId;
    } else if (req.user.role === 'subadmin') {
        query.issuer = userId;
    }

    // If specific ID provided, fetch that specific image
    if (id) {
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

// Controller: Admin Upload Image for a Specific User
export const uploadImageForUser = async (req, res) => {
  try {
    const file = req.file;
    const { roll_no } = req.params;
    const issuerId = req.user?.userId;
    const issuerRole = req.user?.role;

    // Only admin or subadmin can upload files for users
    if (!['admin', 'subadmin'].includes(issuerRole)) {
        return res.status(403).json({
            success: false,
            message: "Only admins or subadmins can upload files for users."
        });
    }

    if (!file) {
        return res.status(400).json({
            success: false,
            message: "Image is required."
        });
    }

    if (!roll_no) {
        return res.status(400).json({
            success: false,
            message: "User roll number is required."
        });
    }

    // Find user by roll_no
    const targetUser = await User.findOne({ roll_no });
    if (!targetUser) {
        return res.status(404).json({
            success: false,
            message: `User with roll number ${roll_no} not found.`
        });
    }

    // Upload to IPFS
    const result = await ipfs.add(file.buffer);
    await ipfs.pin.add(result.cid);

    const cid = result.cid.toString();
    const url = `http://127.0.0.1:8080/ipfs/${cid}`;

    // Save to MongoDB with target user reference (not admin)
    const saved = await Image.create({
        cid,
        url,
        user: targetUser._id,
        issuer: issuerId
    });

    // Automatically save certificate on blockchain with user's roll_no, cid, url, and timestamp
    try {
        const timestamp = saved.createdAt.toISOString();
        await storeCertificateOnBlockchain(targetUser.roll_no, cid, url, timestamp);
    } catch (blockchainError) {
        console.error('Failed to save on blockchain:', blockchainError);
        // Still proceed, as file is uploaded to IPFS and DB
    }

    res.status(201).json({
        success: true,
        message: "Image uploaded successfully for user and certificate saved on blockchain",
        rollNo: targetUser.roll_no,
        cid: cid,
        url: url,
        ipfsLink: `https://ipfs.io/ipfs/${cid}`,
        issuedAt: saved.createdAt.toISOString(),
        imageId: saved._id,
        uploadedForUser: {
            userId: targetUser._id,
            name: targetUser.name,
            roll_no: targetUser.roll_no
        }
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


