import mongoose, {
  Schema,
  Document,
} from "mongoose";

export interface IProject
  extends Document {
  userId: string;
  title: string;
  language: string;
  currentCode: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema =
  new Schema<IProject>(
    {
      userId: {
        type: String,
        required: true,
      },

      title: {
        type: String,
        required: true,
      },

      language: {
        type: String,
        required: true,
      },

      currentCode: {
        type: String,
        default: "",
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model<IProject>(
  "Project",
  ProjectSchema
);