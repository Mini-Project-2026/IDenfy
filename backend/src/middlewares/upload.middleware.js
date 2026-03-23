import multer from 'multer'

// Store file in memory (important for IPFS)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});
export default upload;