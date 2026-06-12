import dotenv from "dotenv";
dotenv.config();

import { connectRedis } from "./config/redis";
import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  await connectRedis();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();