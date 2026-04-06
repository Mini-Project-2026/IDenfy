import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import fileRouter from './routes/fileUpload.routes.js';
import userRouter from './routes/user.routes.js';
import fabricRouter from './routes/fabricService.routes.js';


const app = express();

app.use(cors(
    {
        origin: true,
        credentials: true
    }
));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.use("/api/fileUpload", fileRouter)
app.use("/api/users", userRouter)
app.use("/api/fabric", fabricRouter)

export { app };





