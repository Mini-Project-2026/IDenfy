import mongoose from 'mongoose'

const imageSchema = new mongoose.Schema({
    cid: {
        type:String,
        required:true
    },
    url: {
        type:String,
        required:true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    }
}, {timestamps:true, collection: 'files'});

export const Image = mongoose.model("Image", imageSchema);