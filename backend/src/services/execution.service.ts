import { redisClient } from "../config/redis";

interface ExecutionJob {
  jobId: string;
  language: string;
  code: string;
  stdin?: string;
  // FIX: userId must be part of the job payload so the worker can persist it
  // on the ExecutionHistory document. Without this field in the interface,
  // TypeScript strips it and the worker never receives it.
  userId?: string;
}

interface ExecutionResult {
  jobId: string;
  stdout: string;
  stderr: string;
  status: string;
  executionTime: number;
  language: string;
}

export const enqueueJob = async (job: ExecutionJob) => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  return new Promise<ExecutionResult>(async (resolve, reject) => {
    const timeout = setTimeout(async () => {
      await subscriber.unsubscribe(`result:${job.jobId}`);
      await subscriber.quit();
      reject(new Error("Execution timed out"));
    }, 60000);

    await subscriber.subscribe(
      `result:${job.jobId}`,
      async (message) => {
        clearTimeout(timeout);
        const result = JSON.parse(message);
        await subscriber.unsubscribe(`result:${job.jobId}`);
        await subscriber.quit();
        resolve(result);
      }
    );

    // Push full job including userId so worker can save it to ExecutionHistory
    await redisClient.lPush(
      "execution_queue",
      JSON.stringify(job)
    );
  });
};