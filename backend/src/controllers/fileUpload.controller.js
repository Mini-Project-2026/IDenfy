import ipfs from '../utils/ipfs.js';
// import { Image } from '../models/file.models.js';


export const defaultControl =  (req, res)=>{
    res.json({
        success:'true',
        message: "successfully opened."
    })
};


export const uploadImage =  async (req, res) => {
  try {
    const file = req.file;

    if(!file){
        res.json({
            success:false,
            message:"Image is required. "
        })
    }

    const result = await ipfs.add(file.buffer);
    await ipfs.pin.add(result.cid);

    const cid = result.cid.toString();

    const url = `http://127.0.0.1:8080/ipfs/${cid}`;

    // Save to DB 
    // const saved = await Image.create({cid, url});

    
    res.json({cid: cid,
        url:url
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Upload failed');
  }
};

export const getImage = async (req, res) => {
//   const images = await Image.find();
//   res.json(images);
res.json({message:"Soon..."});
};