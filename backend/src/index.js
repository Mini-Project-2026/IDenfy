import dotenv from 'dotenv'

import {app} from './app.js'
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

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

