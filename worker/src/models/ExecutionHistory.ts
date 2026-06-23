import mongoose, { Document, Schema } from "mongoose";

export interface IExecutionHistory extends Document {
  // FIX: userId is a Clerk ID (e.g. "user_3FGUdA37geMSHrNVcjtwgYHYI7Z") —
  // a plain string, NOT a MongoDB ObjectId. Storing as ObjectId caused
  // BSONError on save and meant getExecutionsByUser({ userId }) never matched.
  userId?: string;
  projectId?: mongoose.Types.ObjectId;
  jobId: string;
  language: string;
  code: string;
  stdin: string;
  stdout: string;
  stderr: string;
  status: string;
  executionTime: number;
  createdAt: Date;
}

const ExecutionHistorySchema = new Schema<IExecutionHistory>(
  {
    // FIX: String, not Schema.Types.ObjectId
    userId: {
      type: String,
      required: false,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    language: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    stdin: {
      type: String,
      default: "",
    },
    stdout: {
      type: String,
      default: "",
    },
    stderr: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      required: true,
      enum: ["completed", "timeout", "compile_error", "runtime_error"],
    },
    executionTime: {
      type: Number,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: false },
  }
);

export const ExecutionHistory = mongoose.model<IExecutionHistory>(
  "ExecutionHistory",
  ExecutionHistorySchema
);