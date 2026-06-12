import { createClient } from "redis";
import dotenv from "dotenv";
import { executePython } from "./dockerExecutor";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  console.log("Worker Redis Error:", err);
});

const startWorker = async () => {
  await redisClient.connect();

  console.log("🚀 Worker connected to Redis");

  while (true) {
    const result = await redisClient.brPop(
      "execution_queue",
      0
    );

    if (!result) continue;

    const job = JSON.parse(result.element);

    console.log("\n======================");
    console.log("📦 Job Received");
    console.log(job);
    console.log("======================");

    if (job.language === "python") {
      const output = await executePython(job.code);

      console.log("🐍 Python Execution Result:");
      console.log(output);

      await redisClient.publish(
        `result:${job.jobId}`,
        JSON.stringify({
          jobId: job.jobId,
          stdout: output.stdout,
          stderr: output.stderr,
          status: "completed",
        })
      );
    }
  }
};

startWorker();