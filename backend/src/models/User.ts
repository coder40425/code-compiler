import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  lmsUserId: String,   // optional for future LMS
  googleId: String,
  name: String,
  email: String,
  avatar: String,
  role: {
    type: String,
    default: "student"
  }
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    lmsUserId: {
      type: String,
      required: true,
      unique: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    avatar: {
      type: String,
      default: "",
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