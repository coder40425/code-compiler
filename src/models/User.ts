import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  lmsUserId: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    lmsUserId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      default: "student",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);