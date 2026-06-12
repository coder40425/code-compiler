import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Worker Redis Error:", err);
});

const startWorker = async () => {
  await redisClient.connect();
  console.log("🚀 Worker connected to Redis");

  while (true) {
    const result = await redisClient.brPop("execution_queue", 0);

    if (result) {
      console.log("📥 Received Job:");
      console.log(result.element);
    }
  }
};

startWorker();