import { createClient } from "redis";
import mongoose from "mongoose";
import dotenv from "dotenv";

import { executePython } from "./executors/python";
import { executeJavaScript } from "./executors/javascript";
import { executeC } from "./executors/c";
import { executeCpp } from "./executors/cpp";
import { executeJava } from "./executors/java";
import { executeGo } from "./executors/go";
import { executePHP } from "./executors/php";
import { executeRuby } from "./executors/ruby";
import { ExecutionHistory } from "./models/ExecutionHistory";

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => {
  console.log("Worker Redis Error:", err);
});

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Derive a human-readable execution status from the executor output.
 * Mirrors the logic specified in Part 4 of the task.
 */
function deriveStatus(
  timedOut: boolean | undefined,
  stderr: string
): string {
  if (timedOut) {
    return "timeout";
  }

  if (stderr) {
    if (
      stderr.includes("error:") ||
      stderr.includes("SyntaxError") ||
      stderr.includes("Compilation failed")
    ) {
      return "compile_error";
    }
    return "runtime_error";
  }

  return "completed";
}

/**
 * Persist an execution record to MongoDB.
 * Failures are logged but never propagate — the caller must not await this
 * before publishing the Redis result.
 */
async function saveHistory(payload: {
  jobId: string;
  language: string;
  code: string;
  stdin: string;
  stdout: string;
  stderr: string;
  status: string;
  executionTime: number;
  userId?: string;
  projectId?: string;
}): Promise<void> {
  try {
    await ExecutionHistory.create({
      jobId: payload.jobId,
      language: payload.language,
      code: payload.code,
      stdin: payload.stdin,
      stdout: payload.stdout,
      stderr: payload.stderr,
      status: payload.status,
      executionTime: payload.executionTime,
      ...(payload.userId && {
        userId: new mongoose.Types.ObjectId(payload.userId),
      }),
      ...(payload.projectId && {
        projectId: new mongoose.Types.ObjectId(payload.projectId),
      }),
    });
  } catch (err) {
    // Never crash the worker — just log.
    console.error("⚠️  Failed to save execution history:", err);
  }
}

// ─── worker loop ─────────────────────────────────────────────────────────────

const startWorker = async () => {
  await redisClient.connect();
  console.log("🚀 Worker connected to Redis");

  // Connect to MongoDB (non-blocking — history will fail gracefully if down)
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/compiler";
  mongoose
    .connect(mongoUri)
    .then(() => console.log("🍃 Worker connected to MongoDB"))
    .catch((err) => console.error("⚠️  MongoDB connection failed (history disabled):", err));

  while (true) {
    const result = await redisClient.brPop("execution_queue", 0);

    if (!result) continue;

    const job = JSON.parse(result.element);

    console.log("\n======================");
    console.log("📦 Job Received");
    console.log(job);
    console.log("======================");

    let output: {
      stdout: string;
      stderr: string;
      executionTime: number;
      timedOut?: boolean;
    };

    switch (job.language.toLowerCase()) {
      case "python":
        output = await executePython(job.code, job.stdin || "");
        console.log("🐍 Python Execution Result:");
        break;

      case "javascript":
      case "js":
        output = await executeJavaScript(job.code, job.stdin || "");
        console.log("🟨 JavaScript Execution Result:");
        break;

      case "c":
        output = await executeC(job.code, job.stdin || "");
        console.log("🔵 C Execution Result:");
        break;

      case "cpp":
      case "c++":
        output = await executeCpp(job.code, job.stdin || "");
        console.log("🟣 C++ Execution Result:");
        break;

      case "java":
        output = await executeJava(job.code, job.stdin || "");
        console.log("☕ Java Execution Result:");
        break;

      case "go":
        output = await executeGo(job.code, job.stdin || "");
        console.log("🐹 Go Execution Result:");
        break;

      case "php":
        output = await executePHP(job.code, job.stdin || "");
        console.log("🐘 PHP Execution Result:");
        break;

      case "ruby":
        output = await executeRuby(job.code, job.stdin || "");
        console.log("💎 Ruby Execution Result:");
        break;

      default:
        output = {
          stdout: "",
          stderr: `Unsupported language: ${job.language}`,
          executionTime: 0,
        };
    }

    console.log(output);

    const status = deriveStatus(output.timedOut, output.stderr);

    // Publish result — existing channel and shape preserved, new fields added.
    await redisClient.publish(
      `result:${job.jobId}`,
      JSON.stringify({
        jobId: job.jobId,
        language: job.language,
        stdout: output.stdout,
        stderr: output.stderr,
        executionTime: output.executionTime,
        status,
      })
    );

    // Persist history without blocking the next job pick-up.
    saveHistory({
      jobId: job.jobId,
      language: job.language,
      code: job.code,
      stdin: job.stdin || "",
      stdout: output.stdout,
      stderr: output.stderr,
      status,
      executionTime: output.executionTime,
      userId: job.userId,
      projectId: job.projectId,
    });
  }
};

startWorker();