import mongoose, { Schema, Document, ObjectId } from "mongoose";

export interface UserInput {
  email: string;
  firstName: string;
  lastName: string;
  friends?: ObjectId[];
  inboundFriendRequests?: ObjectId[];
  outboundFriendRequests?: ObjectId[];
}

export interface UserDocument extends UserInput, Document {
  email: string;
  firstName: string;
  lastName: string;
  friends?: ObjectId[];
  inboundFriendRequests?: ObjectId[];
  outboundFriendRequests?: ObjectId[];
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  friends: { type: Array, default: [] },
  inboundFriendRequests: { type: Array, default: [] },
  outboundFriendRequests: { type: Array, default: [] },
});

export default mongoose.model("User", UserSchema);
