import { Request, Response } from "express";
import * as executionService from "../services/execution.service";
import crypto from "crypto";

export const executeCode = async (
  req: Request,
  res: Response
) => {
  try {
    const { language, code, stdin, userId } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        message: "Language and code are required",
      });
    }

    const job = {
      jobId: crypto.randomUUID(),
      language,
      code,
      stdin: stdin || "",
      // FIX: userId was never included in the job payload.
      // The worker saves ExecutionHistory documents without userId,
      // so getExecutionsByUser always returns [].
      // userId is optional — guest executions (no userId) are still saved.
      userId: userId || undefined,
    };

    const result = await executionService.enqueueJob(job);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};