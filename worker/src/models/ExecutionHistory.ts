import mongoose, { Document, Schema } from "mongoose";

export interface IExecutionHistory extends Document {
  userId?: mongoose.Types.ObjectId;
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
    userId: {
      type: Schema.Types.ObjectId,
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