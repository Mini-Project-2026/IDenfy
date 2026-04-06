import dotenv from 'dotenv'

import { app } from './app.js'
import connectDB from './db/dbConnect.js';
dotenv.config();

connectDB()
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Database connection error:', err);
        process.exit(1);
    });

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});

