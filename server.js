// src/server.js


import dotenv from 'dotenv';

import app from './src/app.js';

import connectDB from './src/config/db.js';


// ENV Config
dotenv.config();


// Connect Database 😎
connectDB();


// PORT
const PORT = process.env.PORT || 5000;


// Start Server
app.listen(PORT, () => {
  console.log(
    `🚀 Server Running On http://localhost:${PORT}`,
  );
});