import { createClient } from "redis";
import dotenv from "dotenv";

import { executePython } from "./executors/python";
import { executeJavaScript } from "./executors/javascript";
import { executeC } from "./executors/c";
import { executeCpp } from "./executors/cpp";
import { executeJava } from "./executors/java";
import { executeGo } from "./executors/go";
import { executePHP } from "./executors/php";
import { executeRuby } from "./executors/ruby";

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

    let output: {
      stdout: string;
      stderr: string;
    };

    switch (job.language.toLowerCase()) {
      case "python":
        output = await executePython(
          job.code,
          job.stdin || ""
        );
        console.log("🐍 Python Execution Result:");
        break;

      case "javascript":
      case "js":
        output = await executeJavaScript(
          job.code,
          job.stdin || ""
        );
        console.log("🟨 JavaScript Execution Result:");
        break;

      case "c":
        output = await executeC(
          job.code,
          job.stdin || ""
        );
        console.log("🔵 C Execution Result:");
        break;

      case "cpp":
      case "c++":
        output = await executeCpp(
          job.code,
          job.stdin || ""
        );
        console.log("🟣 C++ Execution Result:");
        break;

      case "java":
        output = await executeJava(
          job.code,
          job.stdin || ""
        );
        console.log("☕ Java Execution Result:");
        break;

      case "go":
        output = await executeGo(
          job.code,
          job.stdin || ""
        );
        console.log("🐹 Go Execution Result:");
        break;

      case "php":
        output = await executePHP(
          job.code,
          job.stdin || ""
        );
        console.log("🐘 PHP Execution Result:");
        break;

      case "ruby":
        output = await executeRuby(
          job.code,
          job.stdin || ""
        );
        console.log("💎 Ruby Execution Result:");
        break;

      default:
        output = {
          stdout: "",
          stderr: `Unsupported language: ${job.language}`,
        };
    }

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
};

startWorker();