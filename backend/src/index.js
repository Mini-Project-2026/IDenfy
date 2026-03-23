import dotenv from 'dotenv'

import {app} from './app.js'


dotenv.config();

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

