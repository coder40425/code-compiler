import mongoose, { Schema, Document } from "mongoose";

export interface IVersion extends Document {
  projectId: mongoose.Types.ObjectId;
  code: string;
  versionNumber: number;
  createdAt: Date;
}

const VersionSchema = new Schema<IVersion>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    versionNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model<IVersion>("Version", VersionSchema);