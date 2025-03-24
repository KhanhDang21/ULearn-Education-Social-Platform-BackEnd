require('dotenv').config();

const mongoose = require('mongoose');

const connection = async () => {
    try {
      const options = {
        user: process.env.DB_USER,
        pass: process.env.DB_PASSWORD,
        dbName: process.env.DB_NAME
      }
      await mongoose.connect(process.env.URI, options);
      console.log("✅ MongoDB Ping successful");
    
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    } 
  };
  
module.exports = connection;
