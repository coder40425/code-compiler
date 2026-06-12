import { redisClient } from "../config/redis";

interface ExecutionJob {
  jobId: string;
  language: string;
  code: string;
  stdin?: string;
}

interface ExecutionResult {
  jobId: string;
  stdout: string;
  stderr: string;
  status: string;
}

export const enqueueJob = async (job: ExecutionJob) => {
  // Create a duplicate client for subscription.
  const subscriber = redisClient.duplicate();
  await subscriber.connect();

  return new Promise<ExecutionResult>(async (resolve, reject) => {
    const timeout = setTimeout(async () => {
      await subscriber.unsubscribe(`result:${job.jobId}`);
      await subscriber.quit();
      reject(new Error("Execution timed out"));
    }, 30000);

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

    // Push the job after subscription is ready.
    await redisClient.lPush(
      "execution_queue",
      JSON.stringify(job)
    );
  });
};