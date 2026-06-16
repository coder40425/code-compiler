import mongoose, {
  Schema,
  Document,
} from "mongoose";

export interface IExecutionHistory
  extends Document {
  jobId: string;
  language: string;
  code: string;
  stdin: string;
  stdout: string;
  stderr: string;
  status: string;
  executionTime: number;
  userId?: string;
  projectId?: mongoose.Types.ObjectId;
}

const ExecutionHistorySchema =
  new Schema(
    {
      jobId: {
        type: String,
        required: true,
        unique: true,
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
      },

      executionTime: {
        type: Number,
        required: true,
      },

      userId: {
        type: String,
      },

      projectId: {
        type: Schema.Types.ObjectId,
        ref: "Project",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IExecutionHistory>(
  "ExecutionHistory",
  ExecutionHistorySchema
);